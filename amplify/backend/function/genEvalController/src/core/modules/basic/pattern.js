"use strict";
/**
 * The `pattern` module has functions for creating patters of positions in the model.
 * All these functions all return lists of position IDs.
 * The list may be nested, depending on which function is selected.
 */
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 */
const chk = __importStar(require("../../_check_types"));
const common_1 = require("@libs/geo-info/common");
const common_id_funcs_1 = require("@assets/libs/geo-info/common_id_funcs");
const arrs_1 = require("@assets/libs/util/arrs");
const vectors_1 = require("@libs/geom/vectors");
const matrix_1 = require("@libs/geom/matrix");
const three_1 = require("three");
const THREE = __importStar(require("three"));
const VERB = __importStar(require("@assets/libs/verb/verb"));
const arrs_2 = require("@assets/libs/util/arrs");
// import * as VERB from 'verb';
// ================================================================================================
/**
 * Creates a row of positions in a line pattern. Returns a list of new positions.
 * @param __model__
 * @param origin XYZ coordinates as a list of three numbers.
 * @param size Size of the line.
 * @returns Entities, a list of four positions.
 */
function Line(__model__, origin, size, num_positions) {
    // --- Error Check ---
    if (__model__.debug) {
        const fn_name = 'pattern.Line';
        chk.checkArgs(fn_name, 'origin', origin, [chk.isXYZ, chk.isPln]);
        chk.checkArgs(fn_name, 'size', size, [chk.isNum]);
        chk.checkArgs(fn_name, 'num_positions', num_positions, [chk.isInt]);
    }
    // --- Error Check ---
    // create the matrix one time
    let matrix;
    const origin_is_plane = arrs_1.getArrDepth(origin) === 2;
    if (origin_is_plane) {
        matrix = matrix_1.xfromSourceTargetMatrix(common_1.XYPLANE, origin);
    }
    // create the positions
    const posis_i = [];
    const coords = [];
    const step = size / (num_positions - 1);
    for (let i = 0; i < num_positions; i++) {
        coords.push([-(size / 2) + i * step, 0, 0]);
    }
    for (const coord of coords) {
        let xyz = coord;
        if (origin_is_plane) {
            xyz = matrix_1.multMatrix(xyz, matrix);
        }
        else { // we have a plane
            xyz = vectors_1.vecAdd(xyz, origin);
        }
        const posi_i = __model__.modeldata.geom.add.addPosi();
        __model__.modeldata.attribs.posis.setPosiCoords(posi_i, xyz);
        posis_i.push(posi_i);
    }
    // return
    return common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.POSI, posis_i);
}
exports.Line = Line;
// ================================================================================================
/**
 * Creates four positions in a rectangle pattern. Returns a list of new positions.
 * @param __model__
 * @param origin XYZ coordinates as a list of three numbers.
 * @param size Size of rectangle. If number, assume square of that length; if list of two numbers, x and y lengths respectively.
 * @returns Entities, a list of four positions.
 * @example coordinates1 = pattern.Rectangle([0,0,0], 10)
 * @example_info Creates a list of 4 coords, being the vertices of a 10 by 10 square.
 * @example coordinates1 = pattern.Rectangle([0,0,0], [10,20])
 * @example_info Creates a list of 4 coords, being the vertices of a 10 by 20 rectangle.
 */
function Rectangle(__model__, origin, size) {
    // --- Error Check ---
    if (__model__.debug) {
        const fn_name = 'pattern.Rectangle';
        chk.checkArgs(fn_name, 'origin', origin, [chk.isXYZ, chk.isPln]);
        chk.checkArgs(fn_name, 'size', size, [chk.isNum, chk.isXY]);
    }
    // --- Error Check ---
    // create the matrix one time
    let matrix;
    const origin_is_plane = arrs_1.getArrDepth(origin) === 2;
    if (origin_is_plane) {
        matrix = matrix_1.xfromSourceTargetMatrix(common_1.XYPLANE, origin);
    }
    // create the positions
    const posis_i = [];
    const xy_size = (Array.isArray(size) ? size : [size, size]);
    const coords = [
        [-(xy_size[0] / 2), -(xy_size[1] / 2), 0],
        [(xy_size[0] / 2), -(xy_size[1] / 2), 0],
        [(xy_size[0] / 2), (xy_size[1] / 2), 0],
        [-(xy_size[0] / 2), (xy_size[1] / 2), 0]
    ];
    for (const coord of coords) {
        let xyz = coord;
        if (origin_is_plane) {
            xyz = matrix_1.multMatrix(xyz, matrix);
        }
        else { // we have a plane
            xyz = vectors_1.vecAdd(xyz, origin);
        }
        const posi_i = __model__.modeldata.geom.add.addPosi();
        __model__.modeldata.attribs.posis.setPosiCoords(posi_i, xyz);
        posis_i.push(posi_i);
    }
    // return
    return common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.POSI, posis_i);
}
exports.Rectangle = Rectangle;
// ================================================================================================
var _EGridMethod;
(function (_EGridMethod) {
    _EGridMethod["FLAT"] = "flat";
    _EGridMethod["COLUMNS"] = "columns";
    _EGridMethod["ROWS"] = "rows";
    _EGridMethod["QUADS"] = "quads";
})(_EGridMethod = exports._EGridMethod || (exports._EGridMethod = {}));
/**
* Creates positions in a grid pattern. Returns a list (or list of lists) of new positions.
* @param __model__
* @param origin XYZ coordinates as a list of three numbers.
* @param size Size of grid. If number, assume equal lengths, i.e. a square grid.
* If list of two numbers, specifies x and y lengths respectively.
* @param num_positions Number of positions. If a number, assume equal number of positions.
* If a list of two numbers, specifies x and y number of positions respectivley.
* @param method Enum, define the way the coords will be return as lists.
* If integer, same number for x and y; if list of two numbers, number for x and y respectively.
* @returns Entities, a list of positions, or a list of lists of positions (depending on the 'method' setting).
* @example coordinates1 = pattern.Grid([0,0,0], 10, 3)
* @example_info Creates a list of 9 XYZ coordinates on a 3x3 square grid of length 10.
* @example coordinates1 = pattern.Grid([0,0,0], [10,20], [2,4])
* @example_info Creates a list of 8 XYZ coordinates on a 2x4 grid of length 10 by 20.
*/
function Grid(__model__, origin, size, num_positions, method) {
    // --- Error Check ---
    if (__model__.debug) {
        const fn_name = 'pattern.Grid';
        chk.checkArgs(fn_name, 'origin', origin, [chk.isXYZ, chk.isPln]);
        chk.checkArgs(fn_name, 'size', size, [chk.isNum, chk.isXY]);
        chk.checkArgs(fn_name, 'num_positions', num_positions, [chk.isInt, chk.isXYInt]);
    }
    // --- Error Check ---
    // create the matrix one time
    let matrix;
    const origin_is_plane = arrs_1.getArrDepth(origin) === 2;
    if (origin_is_plane) {
        matrix = matrix_1.xfromSourceTargetMatrix(common_1.XYPLANE, origin);
    }
    // create the positions
    const posis_i = [];
    const xy_size = (Array.isArray(size) ? size : [size, size]);
    const xy_num_positions = (Array.isArray(num_positions) ? num_positions : [num_positions, num_positions]);
    const x_offset = xy_size[0] / (xy_num_positions[0] - 1);
    const y_offset = xy_size[1] / (xy_num_positions[1] - 1);
    for (let i = 0; i < xy_num_positions[1]; i++) {
        const y = (i * y_offset) - (xy_size[1] / 2);
        for (let j = 0; j < xy_num_positions[0]; j++) {
            const x = (j * x_offset) - (xy_size[0] / 2);
            let xyz = [x, y, 0];
            if (origin_is_plane) {
                xyz = matrix_1.multMatrix(xyz, matrix);
            }
            else { // we have a plane
                xyz = vectors_1.vecAdd(xyz, origin);
            }
            const posi_i = __model__.modeldata.geom.add.addPosi();
            __model__.modeldata.attribs.posis.setPosiCoords(posi_i, xyz);
            posis_i.push(posi_i);
        }
    }
    // structure the grid of posis, and return
    const posis_i2 = [];
    if (method === _EGridMethod.FLAT) {
        return common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.POSI, posis_i);
    }
    else if (method === _EGridMethod.ROWS) {
        for (let i = 0; i < xy_num_positions[1]; i++) {
            const row = [];
            for (let j = 0; j < xy_num_positions[0]; j++) {
                const index = (i * xy_num_positions[0]) + j;
                row.push(posis_i[index]);
            }
            posis_i2.push(row);
        }
    }
    else if (method === _EGridMethod.COLUMNS) {
        for (let i = 0; i < xy_num_positions[0]; i++) {
            const col = [];
            for (let j = 0; j < xy_num_positions[1]; j++) {
                const index = (j * xy_num_positions[0]) + i;
                col.push(posis_i[index]);
            }
            posis_i2.push(col);
        }
    }
    else if (method === _EGridMethod.QUADS) {
        for (let i = 0; i < xy_num_positions[1] - 1; i++) {
            for (let j = 0; j < xy_num_positions[0] - 1; j++) {
                const index = (i * xy_num_positions[0]) + j;
                const square = [
                    posis_i[index],
                    posis_i[index + 1],
                    posis_i[index + xy_num_positions[0] + 1],
                    posis_i[index + xy_num_positions[0]]
                ];
                posis_i2.push(square);
            }
        }
    }
    return common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.POSI, posis_i2);
}
exports.Grid = Grid;
// ================================================================================================
var _EBoxMethod;
(function (_EBoxMethod) {
    _EBoxMethod["FLAT"] = "flat";
    _EBoxMethod["ROWS"] = "rows";
    _EBoxMethod["COLUMNS"] = "columns";
    _EBoxMethod["LAYERS"] = "layers";
    // SIDES = 'sides',
    _EBoxMethod["QUADS"] = "quads";
})(_EBoxMethod = exports._EBoxMethod || (exports._EBoxMethod = {}));
/**
 * Creates positions in a box pattern. Returns a list of new positions.
 * @param __model__
 * @param origin XYZ coordinates as a list of three numbers.
 * @param size Size of the box. If one number, assume equal lengths.
 * If list of two or three numbers, specifies x y z lengths respectively.
 * @param num_positions Number of positions. If number, assume equal number of positions.
 * If list of two or three numbers, specifies x y z numbers respectively.
 * @param method Enum
 * @returns Entities, a list of 6 positions.
 */
function Box(__model__, origin, size, num_positions, method) {
    // --- Error Check ---
    if (__model__.debug) {
        const fn_name = 'pattern.Box';
        chk.checkArgs(fn_name, 'origin', origin, [chk.isXYZ, chk.isPln]);
        chk.checkArgs(fn_name, 'size', size, [chk.isNum, chk.isXY, chk.isXYZ]);
    }
    // --- Error Check ---
    // create the matrix one time
    let matrix;
    const origin_is_plane = arrs_1.getArrDepth(origin) === 2;
    if (origin_is_plane) {
        matrix = matrix_1.xfromSourceTargetMatrix(common_1.XYPLANE, origin);
    }
    // create params
    const xyz_size = arrs_2.arrFill(size, 3);
    const xyz_num_positions = arrs_2.arrFill(num_positions, 3);
    // create the positions
    const layer_top_posis_i = [];
    const layer_bot_posis_i = [];
    const posis_i = [];
    const x_offset = xyz_size[0] / (xyz_num_positions[0] - 1);
    const y_offset = xyz_size[1] / (xyz_num_positions[1] - 1);
    const z_offset = xyz_size[2] / (xyz_num_positions[2] - 1);
    for (let k = 0; k < xyz_num_positions[2]; k++) {
        const layer_perim_x0_posis_i = [];
        const layer_perim_y0_posis_i = [];
        const layer_perim_x1_posis_i = [];
        const layer_perim_y1_posis_i = [];
        const z = (k * z_offset) - (xyz_size[2] / 2);
        for (let i = 0; i < xyz_num_positions[1]; i++) {
            const y = (i * y_offset) - (xyz_size[1] / 2);
            for (let j = 0; j < xyz_num_positions[0]; j++) {
                const x = (j * x_offset) - (xyz_size[0] / 2);
                let create_perim_layer = false;
                // perimeter layers
                if (i === 0 || i === xyz_num_positions[1] - 1) {
                    create_perim_layer = true;
                }
                if (j === 0 || j === xyz_num_positions[0] - 1) {
                    create_perim_layer = true;
                }
                // top layer
                let create_top_layer = false;
                if (k === xyz_num_positions[2] - 1) {
                    create_top_layer = true;
                }
                // bot layer
                let create_bot_layer = false;
                if (k === 0) {
                    create_bot_layer = true;
                }
                // create posis
                if (create_perim_layer || create_top_layer || create_bot_layer) {
                    let xyz = [x, y, z];
                    if (origin_is_plane) {
                        xyz = matrix_1.multMatrix(xyz, matrix);
                    }
                    else { // we have a plane
                        xyz = vectors_1.vecAdd(xyz, origin);
                    }
                    const posi_i = __model__.modeldata.geom.add.addPosi();
                    __model__.modeldata.attribs.posis.setPosiCoords(posi_i, xyz);
                    if (create_perim_layer) {
                        if (i === 0) {
                            layer_perim_x0_posis_i.push(posi_i);
                        }
                        else if (i === xyz_num_positions[1] - 1) {
                            layer_perim_x1_posis_i.push(posi_i);
                        }
                        else if (j === xyz_num_positions[0] - 1) {
                            layer_perim_y0_posis_i.push(posi_i);
                        }
                        else if (j === 0) {
                            layer_perim_y1_posis_i.push(posi_i);
                        }
                    }
                    if (create_top_layer) {
                        layer_top_posis_i.push(posi_i);
                    }
                    if (create_bot_layer) {
                        layer_bot_posis_i.push(posi_i);
                    }
                }
            }
        }
        posis_i.push([layer_perim_x0_posis_i, layer_perim_y0_posis_i, layer_perim_x1_posis_i, layer_perim_y1_posis_i]);
    }
    // structure the grid of posis, and return
    if (method === _EBoxMethod.FLAT) {
        const layers_posis_i = [];
        for (let k = 1; k < posis_i.length - 2; k++) {
            layers_posis_i.push(arrs_2.arrMakeFlat([
                posis_i[k][0],
                posis_i[k][1],
                posis_i[k][2].reverse(),
                posis_i[k][3].reverse(),
            ]));
        }
        const all_posis = arrs_2.arrMakeFlat([layer_bot_posis_i, layers_posis_i, layer_top_posis_i]);
        return common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.POSI, all_posis);
    }
    else if (method === _EBoxMethod.ROWS) {
        // rows that are parallel to x axis
        const posis_i2 = [];
        for (let i = 0; i < xyz_num_positions[1]; i++) {
            const row = [];
            // bottom
            for (let j = 0; j < xyz_num_positions[0]; j++) {
                const index = (i * xyz_num_positions[0]) + j;
                row.push(layer_bot_posis_i[index]);
            }
            // mid
            if (posis_i.length > 2) {
                for (let k = 1; k < posis_i.length - 1; k++) {
                    if (i === 0) {
                        row.push(...posis_i[k][0]);
                    }
                    else if (i === xyz_num_positions[1] - 1) {
                        row.push(...posis_i[k][2]);
                    }
                    else {
                        row.push(posis_i[k][3][i - 1]);
                        row.push(posis_i[k][1][i - 1]);
                    }
                }
            }
            // top
            for (let j = 0; j < xyz_num_positions[0]; j++) {
                const index = (i * xyz_num_positions[0]) + j;
                row.push(layer_top_posis_i[index]);
            }
            posis_i2.push(row);
        }
        return common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.POSI, posis_i2);
    }
    else if (method === _EBoxMethod.COLUMNS) {
        // columns that are parallel to the y axis
        // i is moving along x axis
        const posis_i2 = [];
        for (let i = 0; i < xyz_num_positions[0]; i++) {
            const col = [];
            // bot
            for (let j = 0; j < xyz_num_positions[1]; j++) {
                const index = (j * xyz_num_positions[0]) + i;
                col.push(layer_bot_posis_i[index]);
            }
            // mid
            if (posis_i.length > 2) {
                for (let k = 1; k < posis_i.length - 1; k++) {
                    if (i === 0) {
                        col.push(posis_i[k][0][0]);
                        col.push(...posis_i[k][3]);
                        col.push(posis_i[k][2][0]);
                    }
                    else if (i === xyz_num_positions[1] - 1) {
                        col.push(posis_i[k][0][xyz_num_positions[0] - 1]);
                        col.push(...posis_i[k][1]);
                        col.push(posis_i[k][0][xyz_num_positions[0] - 1]);
                    }
                    else {
                        col.push(posis_i[k][0][i]);
                        col.push(posis_i[k][2][i]);
                    }
                }
            }
            // top
            for (let j = 0; j < xyz_num_positions[1]; j++) {
                const index = (j * xyz_num_positions[0]) + i;
                col.push(layer_top_posis_i[index]);
            }
            posis_i2.push(col);
        }
        return common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.POSI, posis_i2);
    }
    else if (method === _EBoxMethod.LAYERS) {
        // layers that are parallel to the xy plane
        // i is moving along z axis
        // bottom
        const posis_i2 = [layer_bot_posis_i];
        // mid
        for (let i = 1; i < xyz_num_positions[2] - 1; i++) {
            if (posis_i.length > 2) {
                const layer = posis_i[i][0].slice();
                for (let j = 0; j < xyz_num_positions[1] - 2; j++) {
                    layer.push(posis_i[i][3][j]);
                    layer.push(posis_i[i][1][j]);
                }
                layer.push(...posis_i[i][2]);
                posis_i2.push(layer);
            }
        }
        // top
        posis_i2.push(layer_top_posis_i);
        return common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.POSI, posis_i2);
    }
    else if (method === _EBoxMethod.QUADS) {
        const posis_i2 = [];
        // bottom
        for (let i = 0; i < xyz_num_positions[1] - 1; i++) {
            for (let j = 0; j < xyz_num_positions[0] - 1; j++) {
                const index = (i * xyz_num_positions[0]) + j;
                const quad = [
                    layer_bot_posis_i[index],
                    layer_bot_posis_i[index + xyz_num_positions[0]],
                    layer_bot_posis_i[index + xyz_num_positions[0] + 1],
                    layer_bot_posis_i[index + 1]
                ];
                posis_i2.push(quad);
            }
        }
        // mid
        const layers_posis_i = [];
        for (let k = 0; k < posis_i.length; k++) {
            layers_posis_i.push(arrs_2.arrMakeFlat([
                posis_i[k][0],
                posis_i[k][1],
                posis_i[k][2].reverse(),
                posis_i[k][3].reverse(),
            ]));
        }
        for (let k = 0; k < layers_posis_i.length - 1; k++) {
            const layer_posis_i = layers_posis_i[k];
            const next_layer_posis_i = layers_posis_i[k + 1];
            for (let i = 0; i < layer_posis_i.length; i++) {
                const index = i;
                const next_index = i === layer_posis_i.length - 1 ? 0 : i + 1;
                const quad = [
                    layer_posis_i[index],
                    layer_posis_i[next_index],
                    next_layer_posis_i[next_index],
                    next_layer_posis_i[index]
                ];
                posis_i2.push(quad);
            }
        }
        // top
        for (let i = 0; i < xyz_num_positions[1] - 1; i++) {
            for (let j = 0; j < xyz_num_positions[0] - 1; j++) {
                const index = (i * xyz_num_positions[0]) + j;
                const quad = [
                    layer_top_posis_i[index],
                    layer_top_posis_i[index + 1],
                    layer_top_posis_i[index + xyz_num_positions[0] + 1],
                    layer_top_posis_i[index + xyz_num_positions[0]]
                ];
                posis_i2.push(quad);
            }
        }
        return common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.POSI, posis_i2);
    }
    return [];
}
exports.Box = Box;
// ================================================================================================
/**
 * Creates positions in a polyhedron pattern. Returns a list of new positions.
 * \n
 * @param __model__
 * @param origin XYZ coordinates as a list of three numbers.
 * @param radius xxx
 * @param detail xxx
 * @param method Enum
 * @returns Entities, a list of positions.
 */
function Polyhedron(__model__, origin, radius, detail, method) {
    // --- Error Check ---
    if (__model__.debug) {
        const fn_name = 'pattern.Polyhedron';
        chk.checkArgs(fn_name, 'origin', origin, [chk.isXYZ, chk.isPln]);
        chk.checkArgs(fn_name, 'radius', radius, [chk.isNum]);
        chk.checkArgs(fn_name, 'detail', detail, [chk.isInt]);
        if (detail > 6) {
            throw new Error('pattern.Polyhedron: The "detail" argument is too high, the maximum is 6.');
        }
    }
    // --- Error Check ---
    // create the matrix one time
    let matrix = null;
    const origin_is_plane = arrs_1.getArrDepth(origin) === 2;
    if (origin_is_plane) {
        matrix = matrix_1.xfromSourceTargetMatrix(common_1.XYPLANE, origin);
    }
    else {
        matrix = new three_1.Matrix4();
        matrix.makeTranslation(...origin);
    }
    // make polyhedron posis
    const posis_i = _polyhedron(__model__, matrix, radius, detail, method);
    return common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.POSI, posis_i);
}
exports.Polyhedron = Polyhedron;
var _EPolyhedronMethod;
(function (_EPolyhedronMethod) {
    _EPolyhedronMethod["FLAT_TETRA"] = "flat_tetra";
    _EPolyhedronMethod["FLAT_OCTA"] = "flat_octa";
    _EPolyhedronMethod["FLAT_ICOSA"] = "flat_icosa";
    _EPolyhedronMethod["FLAT_DODECA"] = "flat_dodeca";
    _EPolyhedronMethod["FACE_TETRA"] = "face_tetra";
    _EPolyhedronMethod["FACE_OCTA"] = "face_octa";
    _EPolyhedronMethod["FACE_ICOSA"] = "face_icosa";
    _EPolyhedronMethod["FACE_DODECA"] = "face_dodeca";
})(_EPolyhedronMethod = exports._EPolyhedronMethod || (exports._EPolyhedronMethod = {}));
function _polyhedron(__model__, matrix, radius, detail, method) {
    // create the posis
    let hedron_tjs = null;
    switch (method) {
        case _EPolyhedronMethod.FLAT_TETRA:
        case _EPolyhedronMethod.FACE_TETRA:
            hedron_tjs = new THREE.TetrahedronGeometry(radius, detail);
            break;
        case _EPolyhedronMethod.FLAT_OCTA:
        case _EPolyhedronMethod.FACE_OCTA:
            hedron_tjs = new THREE.OctahedronGeometry(radius, detail);
            break;
        case _EPolyhedronMethod.FLAT_ICOSA:
        case _EPolyhedronMethod.FACE_ICOSA:
            hedron_tjs = new THREE.IcosahedronGeometry(radius, detail);
            break;
        case _EPolyhedronMethod.FLAT_DODECA:
        case _EPolyhedronMethod.FACE_DODECA:
            hedron_tjs = new THREE.DodecahedronGeometry(radius, detail);
            break;
        default:
            throw new Error('pattern.Polyhedron: method not recognised.');
    }
    // create the posis
    const posis_i = [];
    for (const vert_tjs of hedron_tjs.vertices) {
        const xyz = matrix_1.multMatrix(vert_tjs.toArray(), matrix);
        const posi_i = __model__.modeldata.geom.add.addPosi();
        __model__.modeldata.attribs.posis.setPosiCoords(posi_i, xyz);
        posis_i.push(posi_i);
    }
    // if the method is flat, then we are done, return the posis
    switch (method) {
        case _EPolyhedronMethod.FLAT_TETRA:
        case _EPolyhedronMethod.FLAT_OCTA:
        case _EPolyhedronMethod.FLAT_ICOSA:
        case _EPolyhedronMethod.FLAT_DODECA:
            return posis_i;
    }
    // get the posis into the arrays
    const posis_arrs_i = [];
    for (const face_tjs of hedron_tjs.faces) {
        posis_arrs_i.push([
            posis_i[face_tjs.a],
            posis_i[face_tjs.b],
            posis_i[face_tjs.c]
        ]);
    }
    // dispose the tjs polyhedron
    hedron_tjs.dispose();
    // return the result
    return posis_arrs_i;
}
exports._polyhedron = _polyhedron;
// ================================================================================================
/**
 * Creates positions in an arc pattern. Returns a list of new positions.
 * If the angle of the arc is set to null, then circular patterns will be created.
 * For circular patterns, duplicates at start and end are automatically removed.
 *
 * @param __model__
 * @param origin XYZ coordinates as a list of three numbers.
 * @param radius Radius of circle as a number.
 * @param num_positions Number of positions to be distributed equally along the arc.
 * @param arc_angle Angle of arc (in radians).
 * @returns Entities, a list of positions.
 * @example coordinates1 = pattern.Arc([0,0,0], 10, 12, PI)
 * @example_info Creates a list of 12 positions distributed equally along a semicircle of radius 10.
 */
function Arc(__model__, origin, radius, num_positions, arc_angle) {
    // --- Error Check ---
    if (__model__.debug) {
        const fn_name = 'pattern.Arc';
        chk.checkArgs(fn_name, 'origin', origin, [chk.isXYZ, chk.isPln]);
        chk.checkArgs(fn_name, 'radius', radius, [chk.isNum]);
        chk.checkArgs(fn_name, 'num_positions', num_positions, [chk.isInt]);
        chk.checkArgs(fn_name, 'arc_angle', arc_angle, [chk.isNum, chk.isNull]);
    }
    // --- Error Check ---
    // create the matrix one time
    let matrix;
    const origin_is_plane = arrs_1.getArrDepth(origin) === 2;
    if (origin_is_plane) {
        matrix = matrix_1.xfromSourceTargetMatrix(common_1.XYPLANE, origin);
    }
    // calc the rot angle per position
    const rot = (arc_angle === null) ? (2 * Math.PI) / num_positions : arc_angle / (num_positions - 1);
    // create positions
    const posis_i = [];
    for (let i = 0; i < num_positions; i++) {
        const angle = rot * i; // CCW
        const x = (Math.cos(angle) * radius);
        const y = (Math.sin(angle) * radius);
        let xyz = [x, y, 0];
        if (origin_is_plane) {
            xyz = matrix_1.multMatrix(xyz, matrix);
        }
        else { // we have a plane
            xyz = vectors_1.vecAdd(xyz, origin);
        }
        const posi_i = __model__.modeldata.geom.add.addPosi();
        __model__.modeldata.attribs.posis.setPosiCoords(posi_i, xyz);
        posis_i.push(posi_i);
    }
    // return the list of posis
    return common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.POSI, posis_i);
}
exports.Arc = Arc;
// ================================================================================================
/**
 * Creates positions in an Bezier curve pattern. Returns a list of new positions.
 * The Bezier is created as either a qadratic or cubic Bezier. It is always an open curve.
 * \n
 * The input is a list of XYZ coordinates (three coords for quadratics, four coords for cubics).
 * The first and last coordinates in the list are the start and end positions of the Bezier curve.
 * The middle coordinates act as the control points for controlling the shape of the Bezier curve.
 * \n
 * For the quadratic Bezier, three XYZ coordinates are required.
 * For the cubic Bezier, four XYZ coordinates are required.
 * \n
 * For more information, see the wikipedia article: <a href="https://en.wikipedia.org/wiki/B%C3%A9zier_curve">B%C3%A9zier_curve</a>.
 * \n
 * @param __model__
 * @param coords A list of XYZ coordinates (three coords for quadratics, four coords for cubics).
 * @param num_positions Number of positions to be distributed along the Bezier.
 * @returns Entities, a list of positions.
 * @example coordinates1 = pattern.Bezier([[0,0,0], [10,0,50], [20,0,10]], 20)
 * @example_info Creates a list of 20 positions distributed along a Bezier curve pattern.
 */
function Bezier(__model__, coords, num_positions) {
    // --- Error Check ---
    const fn_name = 'pattern.Bezier';
    if (__model__.debug) {
        chk.checkArgs(fn_name, 'coords', coords, [chk.isXYZL]);
        chk.checkArgs(fn_name, 'num_positions', num_positions, [chk.isInt]);
    }
    // --- Error Check ---
    // create the curve
    const coords_tjs = coords.map(coord => new THREE.Vector3(coord[0], coord[1], coord[2]));
    let points_tjs = [];
    let curve_tjs = null;
    if (coords.length === 4) {
        curve_tjs = new THREE.CubicBezierCurve3(coords_tjs[0], coords_tjs[1], coords_tjs[2], coords_tjs[3]);
        points_tjs = curve_tjs.getPoints(num_positions - 1);
    }
    else if (coords.length === 3) {
        curve_tjs = new THREE.QuadraticBezierCurve3(coords_tjs[0], coords_tjs[1], coords_tjs[2]);
        points_tjs = curve_tjs.getPoints(num_positions - 1);
    }
    else {
        throw new Error(fn_name + ': "coords" should be a list of either three or four XYZ coords.');
    }
    // create positions
    const posis_i = [];
    for (let i = 0; i < num_positions; i++) {
        const posi_i = __model__.modeldata.geom.add.addPosi();
        __model__.modeldata.attribs.posis.setPosiCoords(posi_i, points_tjs[i].toArray());
        posis_i.push(posi_i);
    }
    // return the list of posis
    return common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.POSI, posis_i);
}
exports.Bezier = Bezier;
// ================================================================================================
var _EClose;
(function (_EClose) {
    _EClose["OPEN"] = "open";
    _EClose["CLOSE"] = "close";
})(_EClose = exports._EClose || (exports._EClose = {}));
/**
 * Creates positions in an NURBS curve pattern, by using the XYZ positions as control points.
 * Returns a list of new positions.
 * \n
 * The positions are created along the curve at equal parameter values.
 * This means that the euclidean distance between the positions will not necessarily be equal.
 * \n
 * The input is a list of XYZ coordinates that will act as control points for the curve.
 * If the curve is open, then the first and last coordinates in the list are the start and end positions of the curve.
 * \n
 * The number of positions should be at least one greater than the degree of the curve.
 * \n
 * The degree (between 2 and 5) of the urve defines how smooth the curve is.
 * Quadratic: degree = 2
 * Cubic: degree = 3
 * Quartic: degree = 4.
 * \n
 * @param __model__
 * @param coords A list of XYZ coordinates (must be at least three XYZ coords).
 * @param degree The degree of the curve, and integer between 2 and 5.
 * @param close Enum, 'close' or 'open'
 * @param num_positions Number of positions to be distributed along the Bezier.
 * @returns Entities, a list of positions.
 * @example coordinates1 = pattern.Nurbs([[0,0,0], [10,0,50], [20,0,10]], 20)
 * @example_info Creates a list of 20 positions distributed along a Bezier curve pattern.
 */
function Nurbs(__model__, coords, degree, close, num_positions) {
    // --- Error Check ---
    if (__model__.debug) {
        const fn_name = 'pattern.Nurbs';
        chk.checkArgs(fn_name, 'coords', coords, [chk.isXYZL]);
        chk.checkArgs(fn_name, 'num_positions', num_positions, [chk.isInt]);
        if (coords.length < 3) {
            throw new Error(fn_name + ': "coords" should be a list of at least three XYZ coords.');
        }
        if (degree < 2 || degree > 5) {
            throw new Error(fn_name + ': "degree" should be between 2 and 5.');
        }
        if (degree > (coords.length - 1)) {
            throw new Error(fn_name + ': a curve of degree ' + degree + ' requires at least ' + (degree + 1) + ' coords.');
        }
    }
    // --- Error Check ---
    const closed = close === _EClose.CLOSE;
    // create the curve using the VERBS library
    const offset = degree + 1;
    const coords2 = coords.slice();
    if (closed) {
        const start = coords2.slice(0, offset);
        const end = coords2.slice(coords2.length - offset, coords2.length);
        coords2.splice(0, 0, ...end);
        coords2.splice(coords2.length, 0, ...start);
    }
    const weights = coords2.forEach(_ => 1);
    const num_knots = coords2.length + degree + 1;
    const knots = [];
    const uniform_knots = num_knots - (2 * degree);
    for (let i = 0; i < degree; i++) {
        knots.push(0);
    }
    for (let i = 0; i < uniform_knots; i++) {
        knots.push(i / (uniform_knots - 1));
    }
    for (let i = 0; i < degree; i++) {
        knots.push(1);
    }
    const curve_verb = new VERB.geom.NurbsCurve.byKnotsControlPointsWeights(degree, knots, coords2, weights);
    // Testing VERB closed curve
    // const k: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    // const c: number[][] = [[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0], [0, 0, 0], [10, 0, 0]];
    // const w: number[] = [1, 1, 1, 1, 1, 1];
    // const curve_verb2 = new VERB.geom.NurbsCurve.byKnotsControlPointsWeights(2, k, c, w);
    // This gives an error: Error:
    // Invalid knot vector format! Should begin with degree + 1 repeats and end with degree + 1 repeats!
    const posis_i = nurbsToPosis(__model__, curve_verb, degree, closed, num_positions, coords[0]);
    // return the list of posis
    return common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.POSI, posis_i);
}
exports.Nurbs = Nurbs;
// ================================================================================================
/**
 * Creates positions in an NURBS curve pattern, by iterpolating between the XYZ positions.
 * Returns a list of new positions.
 * \n
 * THe positions are created along the curve at equal parameter values.
 * This means that the euclidean distance between the positions will not necessarily be equal.
 * \n
 * The input is a list of XYZ coordinates that will act as control points for the curve.
 * If the curve is open, then the first and last coordinates in the list are the start and end positions of the curve.
 * \n
 * The number of positions should be at least one greater than the degree of the curve.
 * \n
 * The degree (between 2 and 5) of the urve defines how smooth the curve is.
 * Quadratic: degree = 2
 * Cubic: degree = 3
 * Quartic: degree = 4.
 * \n
 * @param __model__
 * @param coords A list of XYZ coordinates (must be at least three XYZ coords).
 * @param degree The degree of the curve, and integer between 2 and 5.
 * @param close Enum, 'close' or 'open'
 * @param num_positions Number of positions to be distributed along the Bezier.
 * @returns Entities, a list of positions.
 * @example coordinates1 = pattern.Nurbs([[0,0,0], [10,0,50], [20,0,10]], 20)
 * @example_info Creates a list of 20 positions distributed along a Bezier curve pattern.
 */
function _Interpolate(__model__, coords, degree, close, num_positions) {
    // --- Error Check ---
    if (__model__.debug) {
        const fn_name = 'pattern._Interpolate';
        chk.checkArgs(fn_name, 'coords', coords, [chk.isXYZL]);
        chk.checkArgs(fn_name, 'num_positions', num_positions, [chk.isInt]);
        // --- Error Check ---
        if (coords.length < 3) {
            throw new Error(fn_name + ': "coords" should be a list of at least three XYZ coords.');
        }
        if (degree < 2 || degree > 5) {
            throw new Error(fn_name + ': "degree" should be between 2 and 5.');
        }
        if (degree > (coords.length - 1)) {
            throw new Error(fn_name + ': a curve of degree ' + degree + ' requires at least ' + (degree + 1) + ' coords.');
        }
    }
    const closed = close === _EClose.CLOSE;
    // create the curve using the VERBS library
    const offset = degree + 1;
    const coords2 = coords.slice();
    if (closed) {
        const start = coords2.slice(0, offset);
        const end = coords2.slice(coords2.length - offset, coords2.length);
        coords2.splice(0, 0, ...end);
        coords2.splice(coords2.length, 0, ...start);
    }
    const curve_verb = new VERB.geom.NurbsCurve.byPoints(coords2, degree);
    // return the list of posis
    const posis_i = nurbsToPosis(__model__, curve_verb, degree, closed, num_positions, coords[0]);
    return common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.POSI, posis_i);
}
exports._Interpolate = _Interpolate;
function nurbsToPosis(__model__, curve_verb, degree, closed, num_positions, start) {
    // create positions
    const posis_i = [];
    const [offset_start, offset_end] = { 2: [5, 3], 3: [6, 5], 4: [8, 6], 5: [9, 8] }[degree];
    const knots = curve_verb.knots();
    const u_start = knots[offset_start];
    const u_end = knots[knots.length - offset_end - 1];
    const u_range = u_end - u_start;
    // trying split
    // const [c1, c2] = curve_verb.split(u_start);
    // const [c3, c4] = c2.split(u_end);
    // const curve_length_samples_verb: any[] = c3.divideByEqualArcLength(num_positions - 1);
    // const u_values_verb: number[] = curve_length_samples_verb.map( cls => cls.u as number );
    let min_dist_to_start = Infinity;
    let closest_to_start = -1;
    for (let i = 0; i < num_positions; i++) {
        let u;
        if (closed) {
            u = u_start + ((i / num_positions) * u_range);
        }
        else {
            u = i / (num_positions - 1);
        }
        const xyz = curve_verb.point(u);
        // xyz[2] = i / 10;
        const posi_i = __model__.modeldata.geom.add.addPosi();
        __model__.modeldata.attribs.posis.setPosiCoords(posi_i, xyz);
        posis_i.push(posi_i);
        const dist = Math.abs(start[0] - xyz[0]) +
            Math.abs(start[1] - xyz[1]) +
            Math.abs(start[2] - xyz[2]);
        if (dist < min_dist_to_start) {
            min_dist_to_start = dist;
            closest_to_start = i;
        }
    }
    const posis_i_start = posis_i.slice(closest_to_start, posis_i.length);
    const posis_i_end = posis_i.slice(0, closest_to_start);
    const posis_i_sorted = posis_i_start.concat(posis_i_end);
    // return the list of posis
    return posis_i_sorted;
}
// ================================================================================================
/**
 * Creates positions in an spline pattern. Returns a list of new positions.
 * The spline is created using the Catmull-Rom algorithm.
 * It is a type of interpolating spline (a curve that goes through its control points).
 * \n
 * The input is a list of XYZ coordinates. These act as the control points for creating the Spline curve.
 * The positions that get generated will be divided equally between the control points.
 * For example, if you define 4 control points for a cosed spline, and set 'num_positions' to be 40,
 * then you will get 8 positions between each pair of control points,
 * irrespective of the distance between the control points.
 * \n
 * The spline curve can be created in three ways: 'centripetal', 'chordal', or 'catmullrom'.
 * \n
 * For more information, see the wikipedia article:
 * <a href="https://en.wikipedia.org/wiki/Centripetal_Catmull%E2%80%93Rom_spline">Catmull–Rom spline</a>.
 * \n
 * <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Catmull-Rom_examples_with_parameters..png"
 * alt="Curve types" width="100">
 * \n
 * @param __model__
 * @param coords A list of XYZ coordinates.
 * @param type Enum, the type of interpolation algorithm.
 * @param tension Curve tension, between 0 and 1. This only has an effect when the 'type' is set to 'catmullrom'.
 * @param close Enum, 'open' or 'close'.
 * @param num_positions Number of positions to be distributed distributed along the spline.
 * @returns Entities, a list of positions.
 * @example coordinates1 = pattern.Spline([[0,0,0], [10,0,50], [20,0,0], [30,0,20], [40,0,10]], 'chordal','close', 0.2, 50)
 * @example_info Creates a list of 50 positions distributed along a spline curve pattern.
 */
function Interpolate(__model__, coords, type, tension, close, num_positions) {
    // --- Error Check ---
    if (__model__.debug) {
        const fn_name = 'pattern.Interpolate';
        chk.checkArgs(fn_name, 'coords', coords, [chk.isXYZL]);
        chk.checkArgs(fn_name, 'tension', tension, [chk.isNum01]);
        chk.checkArgs(fn_name, 'num_positions', num_positions, [chk.isInt]);
        if (coords.length < 3) {
            throw new Error(fn_name + ': "coords" should be a list of at least three XYZ coords.');
        }
    }
    // --- Error Check ---
    const closed_tjs = close === _EClose.CLOSE;
    const num_positions_tjs = closed_tjs ? num_positions : num_positions - 1;
    if (tension === 0) {
        tension = 1e-16;
    } // There seems to be a bug in threejs, so this is a fix
    // Check we have enough coords
    // create the curve
    const coords_tjs = coords.map(coord => new THREE.Vector3(coord[0], coord[1], coord[2]));
    const curve_tjs = new THREE.CatmullRomCurve3(coords_tjs, closed_tjs, type, tension);
    const points_tjs = curve_tjs.getPoints(num_positions_tjs);
    // create positions
    const posis_i = [];
    for (let i = 0; i < num_positions; i++) {
        const posi_i = __model__.modeldata.geom.add.addPosi();
        __model__.modeldata.attribs.posis.setPosiCoords(posi_i, points_tjs[i].toArray());
        posis_i.push(posi_i);
    }
    // return the list of posis
    return common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.POSI, posis_i);
}
exports.Interpolate = Interpolate;
// Enums for CurveCatRom()
var _ECurveCatRomType;
(function (_ECurveCatRomType) {
    _ECurveCatRomType["CENTRIPETAL"] = "centripetal";
    _ECurveCatRomType["CHORDAL"] = "chordal";
    _ECurveCatRomType["CATMULLROM"] = "catmullrom";
})(_ECurveCatRomType = exports._ECurveCatRomType || (exports._ECurveCatRomType = {}));
// ================================================================================================
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0dGVybi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3RzL3NyYy9jb3JlL21vZHVsZXMvYmFzaWMvcGF0dGVybi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7R0FJRzs7Ozs7Ozs7O0FBRUg7O0dBRUc7QUFFSCx3REFBMEM7QUFFMUMsa0RBQTZFO0FBQzdFLDJFQUF3RTtBQUN4RSxpREFBcUQ7QUFDckQsZ0RBQTRDO0FBQzVDLDhDQUF3RTtBQUN4RSxpQ0FBZ0M7QUFHaEMsNkNBQStCO0FBQy9CLDZEQUErQztBQUMvQyxpREFBOEQ7QUFDOUQsZ0NBQWdDO0FBQ2hDLG1HQUFtRztBQUNuRzs7Ozs7O0dBTUc7QUFDSCxTQUFnQixJQUFJLENBQUMsU0FBa0IsRUFBRSxNQUFtQixFQUFFLElBQVksRUFBRSxhQUFxQjtJQUM3RixzQkFBc0I7SUFDdEIsSUFBSSxTQUFTLENBQUMsS0FBSyxFQUFFO1FBQ2pCLE1BQU0sT0FBTyxHQUFHLGNBQWMsQ0FBQztRQUMvQixHQUFHLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNqRSxHQUFHLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDbEQsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0tBQ3ZFO0lBQ0Qsc0JBQXNCO0lBQ3RCLDZCQUE2QjtJQUM3QixJQUFJLE1BQWUsQ0FBQztJQUNwQixNQUFNLGVBQWUsR0FBRyxrQkFBVyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNsRCxJQUFJLGVBQWUsRUFBRTtRQUNq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