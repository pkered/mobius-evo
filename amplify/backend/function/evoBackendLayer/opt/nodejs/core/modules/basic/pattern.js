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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0dGVybi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2dlbl9ldmFsX3Byb2Nlc3NfYmFja2VuZC9zcmMvY29yZS9tb2R1bGVzL2Jhc2ljL3BhdHRlcm4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0dBSUc7Ozs7Ozs7OztBQUVIOztHQUVHO0FBRUgsd0RBQTBDO0FBRTFDLGtEQUE2RTtBQUM3RSwyRUFBd0U7QUFDeEUsaURBQXFEO0FBQ3JELGdEQUE0QztBQUM1Qyw4Q0FBd0U7QUFDeEUsaUNBQWdDO0FBR2hDLDZDQUErQjtBQUMvQiw2REFBK0M7QUFDL0MsaURBQThEO0FBQzlELGdDQUFnQztBQUNoQyxtR0FBbUc7QUFDbkc7Ozs7OztHQU1HO0FBQ0gsU0FBZ0IsSUFBSSxDQUFDLFNBQWtCLEVBQUUsTUFBbUIsRUFBRSxJQUFZLEVBQUUsYUFBcUI7SUFDN0Ysc0JBQXNCO0lBQ3RCLElBQUksU0FBUyxDQUFDLEtBQUssRUFBRTtRQUNqQixNQUFNLE9BQU8sR0FBRyxjQUFjLENBQUM7UUFDL0IsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDakUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2xELEdBQUcsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLGVBQWUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztLQUN2RTtJQUNELHNCQUFzQjtJQUN0Qiw2QkFBNkI7SUFDN0IsSUFBSSxNQUFlLENBQUM7SUFDcEIsTUFBTSxlQUFlLEdBQUcsa0JBQVcsQ0FBQyxNQUFNLENBQUMsS0FB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