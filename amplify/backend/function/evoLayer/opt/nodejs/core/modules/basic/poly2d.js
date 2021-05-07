"use strict";
/**
 * The `poly2D` module has a set of functions for working with 2D polygons, on the XY plane.
 */
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 */
const _check_ids_1 = require("../../_check_ids");
const chk = __importStar(require("../../_check_types"));
const common_1 = require("@libs/geo-info/common");
const clipper_js_1 = __importDefault(require("@doodle3d/clipper-js"));
const common_id_funcs_1 = require("@assets/libs/geo-info/common_id_funcs");
const arrs_1 = require("@assets/libs/util/arrs");
const d3del = __importStar(require("d3-delaunay"));
const d3poly = __importStar(require("d3-polygon"));
const d3vor = __importStar(require("d3-voronoi"));
const distance_1 = require("@assets/libs/geom/distance");
const vectors_1 = require("@assets/libs/geom/vectors");
const matrix_1 = require("@assets/libs/geom/matrix");
const distance_2 = require("@assets/libs/geom/distance");
const SCALE = 1e9;
// Clipper types
var _EClipJointType;
(function (_EClipJointType) {
    _EClipJointType["SQUARE"] = "jtSquare";
    _EClipJointType["ROUND"] = "jtRound";
    _EClipJointType["MITER"] = "jtMiter";
})(_EClipJointType = exports._EClipJointType || (exports._EClipJointType = {}));
var _EClipEndType;
(function (_EClipEndType) {
    _EClipEndType["OPEN_SQUARE"] = "etOpenSquare";
    _EClipEndType["OPEN_ROUND"] = "etOpenRound";
    _EClipEndType["OPEN_BUTT"] = "etOpenButt";
    _EClipEndType["CLOSED_PLINE"] = "etClosedLine";
    _EClipEndType["CLOSED_PGON"] = "etClosedPolygon";
})(_EClipEndType = exports._EClipEndType || (exports._EClipEndType = {}));
const MClipOffsetEndType = new Map([
    ['square_end', _EClipEndType.OPEN_SQUARE],
    ['round_end', _EClipEndType.OPEN_ROUND],
    ['butt_end', _EClipEndType.OPEN_BUTT]
]);
// Function enums
var _EOffset;
(function (_EOffset) {
    _EOffset["SQUARE_END"] = "square_end";
    _EOffset["BUTT_END"] = "butt_end";
})(_EOffset = exports._EOffset || (exports._EOffset = {}));
var _EOffsetRound;
(function (_EOffsetRound) {
    _EOffsetRound["SQUARE_END"] = "square_end";
    _EOffsetRound["BUTT_END"] = "butt_end";
    _EOffsetRound["ROUND_END"] = "round_end";
})(_EOffsetRound = exports._EOffsetRound || (exports._EOffsetRound = {}));
var _EBooleanMethod;
(function (_EBooleanMethod) {
    _EBooleanMethod["INTERSECT"] = "intersect";
    _EBooleanMethod["DIFFERENCE"] = "difference";
    _EBooleanMethod["SYMMETRIC"] = "symmetric";
})(_EBooleanMethod = exports._EBooleanMethod || (exports._EBooleanMethod = {}));
// ================================================================================================
// get polygons from the model
function _getPgons(__model__, ents_arr) {
    const set_pgons_i = new Set();
    for (const [ent_type, ent_i] of ents_arr) {
        switch (ent_type) {
            case common_1.EEntType.PLINE:
            case common_1.EEntType.POINT:
                break;
            case common_1.EEntType.PGON:
                set_pgons_i.add(ent_i);
                break;
            case common_1.EEntType.COLL:
                const coll_pgons_i = __model__.modeldata.geom.nav.navCollToPgon(ent_i);
                for (const coll_pgon_i of coll_pgons_i) {
                    set_pgons_i.add(coll_pgon_i);
                }
                break;
            default:
                const ent_pgons_i = __model__.modeldata.geom.nav.navAnyToPgon(ent_type, ent_i);
                for (const ent_pgon_i of ent_pgons_i) {
                    set_pgons_i.add(ent_pgon_i);
                }
                break;
        }
    }
    return Array.from(set_pgons_i);
}
// get polygons and polylines from the model
function _getPgonsPlines(__model__, ents_arr) {
    const set_pgons_i = new Set();
    const set_plines_i = new Set();
    for (const [ent_type, ent_i] of ents_arr) {
        switch (ent_type) {
            case common_1.EEntType.PLINE:
                set_plines_i.add(ent_i);
                break;
            case common_1.EEntType.POINT:
                break;
            case common_1.EEntType.PGON:
                set_pgons_i.add(ent_i);
                break;
            case common_1.EEntType.COLL:
                const coll_pgons_i = __model__.modeldata.geom.nav.navCollToPgon(ent_i);
                for (const coll_pgon_i of coll_pgons_i) {
                    set_pgons_i.add(coll_pgon_i);
                }
                const coll_plines_i = __model__.modeldata.geom.nav.navCollToPline(ent_i);
                for (const coll_pline_i of coll_plines_i) {
                    set_plines_i.add(coll_pline_i);
                }
                break;
            default:
                const ent_pgons_i = __model__.modeldata.geom.nav.navAnyToPgon(ent_type, ent_i);
                for (const ent_pgon_i of ent_pgons_i) {
                    set_pgons_i.add(ent_pgon_i);
                }
                const ent_plines_i = __model__.modeldata.geom.nav.navAnyToPline(ent_type, ent_i);
                for (const ent_pline_i of ent_plines_i) {
                    set_plines_i.add(ent_pline_i);
                }
                break;
        }
    }
    return [Array.from(set_pgons_i), Array.from(set_plines_i)];
}
// get posis from the model
function _getPosis(__model__, ents_arr) {
    const set_posis_i = new Set();
    for (const [ent_type, ent_i] of ents_arr) {
        switch (ent_type) {
            case common_1.EEntType.POSI:
                set_posis_i.add(ent_i);
                break;
            default:
                const ent_posis_i = __model__.modeldata.geom.nav.navAnyToPosi(ent_type, ent_i);
                for (const ent_posi_i of ent_posis_i) {
                    set_posis_i.add(ent_posi_i);
                }
                break;
        }
    }
    return Array.from(set_posis_i);
}
// ================================================================================================
// clipperjs -> Mobius Posi
function _getPosiFromMap(__model__, x, y, posis_map) {
    // TODO consider using a hash function insetad of a double map
    // try to find this coord in the map
    // if not found, create a new posi and add it to the map
    let posi_i;
    let map1 = posis_map.get(x);
    if (map1 !== undefined) {
        posi_i = map1.get(y);
    }
    else {
        map1 = new Map();
        posis_map.set(x, map1);
    }
    if (posi_i === undefined) {
        posi_i = __model__.modeldata.geom.add.addPosi();
        __model__.modeldata.attribs.posis.setPosiCoords(posi_i, [x, y, 0]);
        map1.set(y, posi_i);
    }
    return posi_i;
}
function _putPosiInMap(x, y, posi_i, posis_map) {
    let map1 = posis_map.get(x);
    if (map1 === undefined) {
        map1 = new Map();
    }
    map1.set(y, posi_i);
}
// mobius -> clipperjs
function _convertPgonToShape(__model__, pgon_i, posis_map) {
    const wires_i = __model__.modeldata.geom.nav.navAnyToWire(common_1.EEntType.PGON, pgon_i);
    const shape_coords = [];
    for (const wire_i of wires_i) {
        const len = shape_coords.push([]);
        const posis_i = __model__.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.WIRE, wire_i);
        for (const posi_i of posis_i) {
            const xyz = __model__.modeldata.attribs.posis.getPosiCoords(posi_i);
            const coord = { X: xyz[0], Y: xyz[1] };
            shape_coords[len - 1].push(coord);
            _putPosiInMap(xyz[0], xyz[1], posi_i, posis_map);
        }
    }
    const shape = new clipper_js_1.default(shape_coords, true);
    shape.scaleUp(SCALE);
    return shape;
}
// clipperjs
function _convertPgonsToShapeUnion(__model__, pgons_i, posis_map) {
    let result_shape = null;
    for (const pgon_i of pgons_i) {
        const shape = _convertPgonToShape(__model__, pgon_i, posis_map);
        if (result_shape == null) {
            result_shape = shape;
        }
        else {
            result_shape = result_shape.union(shape);
        }
    }
    return result_shape;
}
// clipperjs
function _convertPgonsToShapeJoin(__model__, pgons_i, posis_map) {
    let result_shape = null;
    for (const pgon_i of pgons_i) {
        const shape = _convertPgonToShape(__model__, pgon_i, posis_map);
        if (result_shape == null) {
            result_shape = shape;
        }
        else {
            result_shape = result_shape.join(shape);
        }
    }
    return result_shape;
}
// mobius -> clipperjs
function _convertWireToShape(__model__, wire_i, is_closed, posis_map) {
    const shape_coords = [];
    shape_coords.push([]);
    const posis_i = __model__.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.WIRE, wire_i);
    for (const posi_i of posis_i) {
        const xyz = __model__.modeldata.attribs.posis.getPosiCoords(posi_i);
        const coord = { X: xyz[0], Y: xyz[1] };
        shape_coords[0].push(coord);
        _putPosiInMap(xyz[0], xyz[1], posi_i, posis_map);
    }
    const shape = new clipper_js_1.default(shape_coords, is_closed);
    shape.scaleUp(SCALE);
    return shape;
}
// mobius -> clipperjs
function _convertPlineToShape(__model__, pline_i, posis_map) {
    const wire_i = __model__.modeldata.geom.nav.navPlineToWire(pline_i);
    const is_closed = __model__.modeldata.geom.query.isWireClosed(wire_i);
    const shape_coords = [];
    shape_coords.push([]);
    const posis_i = __model__.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.PLINE, pline_i);
    for (const posi_i of posis_i) {
        const xyz = __model__.modeldata.attribs.posis.getPosiCoords(posi_i);
        const coord = { X: xyz[0], Y: xyz[1] };
        shape_coords[0].push(coord);
        _putPosiInMap(xyz[0], xyz[1], posi_i, posis_map);
    }
    if (is_closed) {
        // close the pline by adding an extra point
        const first = shape_coords[0][0];
        const last = { X: first.X, Y: first.Y };
        shape_coords[0].push(last);
    }
    const shape = new clipper_js_1.default(shape_coords, false); // this is always false, even if pline is closed
    shape.scaleUp(SCALE);
    return shape;
}
// clipperjs -> mobius
function _convertShapesToPgons(__model__, shapes, posis_map) {
    shapes = Array.isArray(shapes) ? shapes : [shapes];
    const pgons_i = [];
    for (const shape of shapes) {
        shape.scaleDown(SCALE);
        const sep_shapes = shape.separateShapes();
        for (const sep_shape of sep_shapes) {
            const posis_i = [];
            const paths = sep_shape.paths;
            for (const path of paths) {
                if (path.length === 0) {
                    continue;
                }
                const len = posis_i.push([]);
                for (const coord of path) {
                    const posi_i = _getPosiFromMap(__model__, coord.X, coord.Y, posis_map);
                    posis_i[len - 1].push(posi_i);
                }
            }
            if (posis_i.length === 0) {
                continue;
            }
            const outer_posis_i = posis_i[0];
            const holes_posis_i = posis_i.slice(1);
            const pgon_i = __model__.modeldata.geom.add.addPgon(outer_posis_i, holes_posis_i);
            pgons_i.push(pgon_i);
        }
    }
    return pgons_i;
}
// clipperjs
function _convertShapeToPlines(__model__, shape, is_closed, posis_map) {
    shape.scaleDown(SCALE);
    const sep_shapes = shape.separateShapes();
    const plines_i = [];
    for (const sep_shape of sep_shapes) {
        const paths = sep_shape.paths;
        for (const path of paths) {
            if (path.length === 0) {
                continue;
            }
            const list_posis_i = [];
            for (const coord of path) {
                const posi_i = _getPosiFromMap(__model__, coord.X, coord.Y, posis_map);
                list_posis_i.push(posi_i);
            }
            if (list_posis_i.length < 2) {
                continue;
            }
            const pgon_i = __model__.modeldata.geom.add.addPline(list_posis_i, is_closed);
            plines_i.push(pgon_i);
        }
    }
    return plines_i;
}
// clipperjs
function _convertShapeToCutPlines(__model__, shape, posis_map) {
    shape.scaleDown(SCALE);
    const sep_shapes = shape.separateShapes();
    const lists_posis_i = [];
    for (const sep_shape of sep_shapes) {
        const paths = sep_shape.paths;
        for (const path of paths) {
            if (path.length === 0) {
                continue;
            }
            const posis_i = [];
            // make a list of posis
            for (const coord of path) {
                const posi_i = _getPosiFromMap(__model__, coord.X, coord.Y, posis_map);
                posis_i.push(posi_i);
            }
            // must have at least 2 posis
            if (posis_i.length < 2) {
                continue;
            }
            // add the list
            lists_posis_i.push(posis_i);
        }
    }
    // see if there is a join between two lists
    // this can occur when boolean with closed polylines
    // for each closed polyline in the input, there can only be one merge
    // this is the point where the end meets the start
    const to_merge = [];
    for (let p = 0; p < lists_posis_i.length; p++) {
        const posis0 = lists_posis_i[p];
        for (let q = 0; q < lists_posis_i.length; q++) {
            const posis1 = lists_posis_i[q];
            if (p !== q && posis0[posis0.length - 1] === posis1[0]) {
                to_merge.push([p, q]);
            }
        }
    }
    for (const [p, q] of to_merge) {
        // copy posis from sub list q to sub list p
        // skip the first posi
        for (let idx = 1; idx < lists_posis_i[q].length; idx++) {
            const posi_i = lists_posis_i[q][idx];
            lists_posis_i[p].push(posi_i);
        }
        // set sub list q to null
        lists_posis_i[q] = null;
    }
    // create plines and check closed
    const plines_i = [];
    for (const posis_i of lists_posis_i) {
        if (posis_i === null) {
            continue;
        }
        const is_closed = posis_i[0] === posis_i[posis_i.length - 1];
        if (is_closed) {
            posis_i.splice(posis_i.length - 1, 1);
        }
        const pline_i = __model__.modeldata.geom.add.addPline(posis_i, is_closed);
        plines_i.push(pline_i);
    }
    // return the list of new plines
    return plines_i;
}
// clipperjs
function _printPaths(paths, mesage) {
    console.log(mesage);
    for (const path of paths) {
        console.log('    PATH');
        for (const coord of path) {
            console.log('        ', JSON.stringify(coord));
        }
    }
}
// ================================================================================================
// d3
// ================================================================================================
/**
 * Create a voronoi subdivision of one or more polygons.
 * \n
 * @param __model__
 * @param pgons A list of polygons, or entities from which polygons can be extracted.
 * @param entities A list of positions, or entities from which positions can be extracted.
 * @returns A list of new polygons.
 */
function Voronoi(__model__, pgons, entities) {
    pgons = arrs_1.arrMakeFlat(pgons);
    entities = arrs_1.arrMakeFlat(entities);
    if (arrs_1.isEmptyArr(pgons)) {
        return [];
    }
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    // --- Error Check ---
    const fn_name = 'poly2d.Voronoi';
    let pgons_ents_arr;
    let posis_ents_arr;
    if (__model__.debug) {
        pgons_ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'pgons', pgons, [_check_ids_1.ID.isIDL1], null);
        posis_ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isIDL1], null);
    }
    else {
        // pgons_ents_arr = splitIDs(fn_name, 'pgons', pgons,
        //     [IDcheckObj.isIDList], null) as TEntTypeIdx[];
        // posis_ents_arr = splitIDs(fn_name, 'entities', entities,
        //     [IDcheckObj.isIDList], null) as TEntTypeIdx[];
        pgons_ents_arr = common_id_funcs_1.idsBreak(pgons);
        posis_ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    const posis_map = new Map();
    // pgons
    const pgons_i = _getPgons(__model__, pgons_ents_arr);
    if (pgons_i.length === 0) {
        return [];
    }
    // posis
    const posis_i = _getPosis(__model__, posis_ents_arr);
    if (posis_i.length === 0) {
        return [];
    }
    // posis
    const d3_cell_points = [];
    for (const posi_i of posis_i) {
        const xyz = __model__.modeldata.attribs.posis.getPosiCoords(posi_i);
        d3_cell_points.push([xyz[0], xyz[1]]);
    }
    // loop and create cells
    const all_cells_i = [];
    for (const pgon_i of pgons_i) {
        // pgon and bounds
        const bounds = [Infinity, Infinity, -Infinity, -Infinity]; // xmin, ymin, xmax, ymax
        // const pgon_shape_coords: IClipCoord[] = [];
        for (const posi_i of __model__.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.PGON, pgon_i)) {
            const xyz = __model__.modeldata.attribs.posis.getPosiCoords(posi_i);
            // pgon_shape_coords.push( { X: xyz[0], Y: xyz[1]} );
            if (xyz[0] < bounds[0]) {
                bounds[0] = xyz[0];
            }
            if (xyz[1] < bounds[1]) {
                bounds[1] = xyz[1];
            }
            if (xyz[0] > bounds[2]) {
                bounds[2] = xyz[0];
            }
            if (xyz[1] > bounds[3]) {
                bounds[3] = xyz[1];
            }
        }
        // const pgon_shape: Shape = new Shape([pgon_shape_coords], true); // TODO holes
        const pgon_shape = _convertPgonToShape(__model__, pgon_i, posis_map);
        // pgon_shape.scaleUp(SCALE);
        // create voronoi
        const cells_i = _voronoiOld(__model__, pgon_shape, d3_cell_points, bounds, posis_map);
        for (const cell_i of cells_i) {
            all_cells_i.push(cell_i);
        }
    }
    // return cell pgons
    return common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.PGON, all_cells_i);
    // return idsMake(all_cells_i.map( cell_i => [EEntType.PGON, cell_i] as TEntTypeIdx )) as TId[];
}
exports.Voronoi = Voronoi;
// There is a bug in d3 new voronoi, it produces wrong results...
// function _voronoi(__model__: GIModel, pgon_shape: Shape, d3_cell_points: [number, number][],
//         bounds: number[], posis_map: TPosisMap): number[] {
//     const d3_delaunay = Delaunay.from(d3_cell_points);
//     const d3_voronoi = d3_delaunay.voronoi(bounds);
//     const shapes: Shape[] = [];
//     for (const d3_cell_coords of Array.from(d3_voronoi.cellPolygons())) {
//         const clipped_shape: Shape = _voronoiClip(__model__, pgon_shape, d3_cell_coords as [number, number][]);
//         shapes.push(clipped_shape);
//     }
//     return _convertShapesToPgons(__model__, shapes, posis_map);
// }
// function _voronoiClip(__model__: GIModel, pgon_shape: Shape, d3_cell_coords: [number, number][]): Shape {
//     const cell_shape_coords: IClipCoord[] = [];
//     // for (const d3_cell_coord of d3_cell_coords) {
//     for (let i = 0; i < d3_cell_coords.length - 1; i++) {
//         cell_shape_coords.push( {X: d3_cell_coords[i][0], Y: d3_cell_coords[i][1]} );
//     }
//     const cell_shape: Shape = new Shape([cell_shape_coords], true);
//     cell_shape.scaleUp(SCALE);
//     const clipped_shape: Shape = pgon_shape.intersect(cell_shape);
//     return clipped_shape;
// }
function _voronoiOld(__model__, pgon_shape, d3_cell_points, bounds, posis_map) {
    const d3_voronoi = d3vor.voronoi().extent([[bounds[0], bounds[1]], [bounds[2], bounds[3]]]);
    const d3_voronoi_diag = d3_voronoi(d3_cell_points);
    const shapes = [];
    for (const d3_cell_coords of d3_voronoi_diag.polygons()) {
        if (d3_cell_coords !== undefined) {
            const clipped_shape = _voronoiClipOld(__model__, pgon_shape, d3_cell_coords);
            shapes.push(clipped_shape);
        }
    }
    return _convertShapesToPgons(__model__, shapes, posis_map);
}
function _voronoiClipOld(__model__, pgon_shape, d3_cell_coords) {
    const cell_shape_coords = [];
    // for (const d3_cell_coord of d3_cell_coords) {
    for (let i = 0; i < d3_cell_coords.length; i++) {
        cell_shape_coords.push({ X: d3_cell_coords[i][0], Y: d3_cell_coords[i][1] });
    }
    const cell_shape = new clipper_js_1.default([cell_shape_coords], true);
    cell_shape.scaleUp(SCALE);
    const clipped_shape = pgon_shape.intersect(cell_shape);
    return clipped_shape;
}
// ================================================================================================
/**
 * Create a delaunay triangulation of set of positions.
 * \n
 * @param __model__
 * @param entities A list of positions, or entities from which positions can be extracted.
 * @returns A list of new polygons.
 */
function Delaunay(__model__, entities) {
    entities = arrs_1.arrMakeFlat(entities);
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    // --- Error Check ---
    const fn_name = 'poly2d.Delaunay';
    let posis_ents_arr;
    if (__model__.debug) {
        posis_ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities1', entities, [_check_ids_1.ID.isIDL1], null);
    }
    else {
        // posis_ents_arr = splitIDs(fn_name, 'entities1', entities,
        // [IDcheckObj.isIDList], null) as TEntTypeIdx[];
        posis_ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    const posis_map = new Map();
    // posis
    const posis_i = _getPosis(__model__, posis_ents_arr);
    if (posis_i.length === 0) {
        return [];
    }
    // posis
    const d3_tri_coords = [];
    for (const posi_i of posis_i) {
        const xyz = __model__.modeldata.attribs.posis.getPosiCoords(posi_i);
        d3_tri_coords.push([xyz[0], xyz[1]]);
        _putPosiInMap(xyz[0], xyz[1], posi_i, posis_map);
    }
    // create delaunay triangulation
    const cells_i = _delaunay(__model__, d3_tri_coords, posis_map);
    // return cell pgons
    return common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.PGON, cells_i);
    // return idsMake(cells_i.map( cell_i => [EEntType.PGON, cell_i] as TEntTypeIdx )) as TId[];
}
exports.Delaunay = Delaunay;
function _delaunay(__model__, d3_tri_coords, posis_map) {
    const new_pgons_i = [];
    const delaunay = d3del.Delaunay.from(d3_tri_coords);
    const delaunay_posis_i = [];
    for (const d3_tri_coord of d3_tri_coords) {
        // TODO use the posis_map!!
        // const deauny_posi_i: number = __model__.modeldata.geom.add.addPosi();
        // __model__.modeldata.attribs.add.setPosiCoords(deauny_posi_i, [point[0], point[1], 0]);
        const delaunay_posi_i = _getPosiFromMap(__model__, d3_tri_coord[0], d3_tri_coord[1], posis_map);
        delaunay_posis_i.push(delaunay_posi_i);
    }
    for (let i = 0; i < delaunay.triangles.length; i += 3) {
        const a = delaunay_posis_i[delaunay.triangles[i]];
        const b = delaunay_posis_i[delaunay.triangles[i + 1]];
        const c = delaunay_posis_i[delaunay.triangles[i + 2]];
        new_pgons_i.push(__model__.modeldata.geom.add.addPgon([c, b, a]));
    }
    return new_pgons_i;
}
// ================================================================================================
/**
 * Create a voronoi subdivision of a polygon.
 *
 * @param __model__
 * @param entities A list of positions, or entities from which positions can bet extracted.
 * @returns A new polygons, the convex hull of the positions.
 */
function ConvexHull(__model__, entities) {
    entities = arrs_1.arrMakeFlat(entities);
    if (arrs_1.isEmptyArr(entities)) {
        return null;
    }
    // --- Error Check ---
    const fn_name = 'poly2d.ConvexHull';
    let ents_arr;
    if (__model__.debug) {
        ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isIDL1], null);
    }
    else {
        // ents_arr = splitIDs(fn_name, 'entities', entities,
        // [IDcheckObj.isIDList], null) as TEntTypeIdx[];
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    // posis
    const posis_i = _getPosis(__model__, ents_arr);
    if (posis_i.length === 0) {
        return null;
    }
    const hull_posis_i = _convexHull(__model__, posis_i);
    // return cell pgons
    const hull_pgon_i = __model__.modeldata.geom.add.addPgon(hull_posis_i);
    return common_id_funcs_1.idMake(common_1.EEntType.PGON, hull_pgon_i);
}
exports.ConvexHull = ConvexHull;
function _convexHull(__model__, posis_i) {
    const points = [];
    const posis_map = new Map();
    for (const posi_i of posis_i) {
        const xyz = __model__.modeldata.attribs.posis.getPosiCoords(posi_i);
        points.push([xyz[0], xyz[1]]);
        _putPosiInMap(xyz[0], xyz[1], posi_i, posis_map);
    }
    if (points.length < 3) {
        return null;
    }
    // loop and create hull
    const hull_points = d3poly.polygonHull(points);
    const hull_posis_i = [];
    for (const hull_point of hull_points) {
        const hull_posi_i = _getPosiFromMap(__model__, hull_point[0], hull_point[1], posis_map);
        hull_posis_i.push(hull_posi_i);
    }
    hull_posis_i.reverse();
    return hull_posis_i;
}
// ================================================================================================
var _EBBoxMethod;
(function (_EBBoxMethod) {
    _EBBoxMethod["AABB"] = "aabb";
    _EBBoxMethod["OBB"] = "obb";
})(_EBBoxMethod = exports._EBBoxMethod || (exports._EBBoxMethod = {}));
/**
 * Create a polygon that is a 2D bounding box of the entities.
 * \n
 * For the method, 'aabb' generates an Axis Aligned Bounding Box, and 'obb' generates an Oriented Bounding Box.
 * \n
 *
 * @param __model__
 * @param entities A list of positions, or entities from which positions can bet extracted.
 * @param method Enum, the method for generating the bounding box.
 * @returns A new polygon, the bounding box of the positions.
 */
function BBoxPolygon(__model__, entities, method) {
    entities = arrs_1.arrMakeFlat(entities);
    if (arrs_1.isEmptyArr(entities)) {
        return null;
    }
    // --- Error Check ---
    const fn_name = 'poly2d.BBoxPolygon';
    let ents_arr;
    if (__model__.debug) {
        ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isIDL1], null);
    }
    else {
        // ents_arr = splitIDs(fn_name, 'entities', entities,
        // [IDcheckObj.isIDList], null) as TEntTypeIdx[];
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    // posis
    const posis_i = _getPosis(__model__, ents_arr);
    if (posis_i.length === 0) {
        return null;
    }
    let pgon_i;
    switch (method) {
        case _EBBoxMethod.AABB:
            pgon_i = _bboxAABB(__model__, posis_i);
            break;
        case _EBBoxMethod.OBB:
            pgon_i = _bboxOBB(__model__, posis_i);
            break;
        default:
            break;
    }
    return common_id_funcs_1.idMake(common_1.EEntType.PGON, pgon_i);
}
exports.BBoxPolygon = BBoxPolygon;
function _bboxAABB(__model__, posis_i) {
    const bbox = [Infinity, Infinity, -Infinity, -Infinity];
    for (const posi_i of posis_i) {
        const xyz = __model__.modeldata.attribs.posis.getPosiCoords(posi_i);
        if (xyz[0] < bbox[0]) {
            bbox[0] = xyz[0];
        }
        if (xyz[1] < bbox[1]) {
            bbox[1] = xyz[1];
        }
        if (xyz[0] > bbox[2]) {
            bbox[2] = xyz[0];
        }
        if (xyz[1] > bbox[3]) {
            bbox[3] = xyz[1];
        }
    }
    const a = [bbox[0], bbox[1], 0];
    const b = [bbox[2], bbox[1], 0];
    const c = [bbox[2], bbox[3], 0];
    const d = [bbox[0], bbox[3], 0];
    const box_posis_i = [];
    for (const xyz of [a, b, c, d]) {
        const box_posi_i = __model__.modeldata.geom.add.addPosi();
        __model__.modeldata.attribs.posis.setPosiCoords(box_posi_i, xyz);
        box_posis_i.push(box_posi_i);
    }
    const box_pgon_i = __model__.modeldata.geom.add.addPgon(box_posis_i);
    return box_pgon_i;
}
function _bboxOBB(__model__, posis_i) {
    // posis
    const hull_posis_i = _convexHull(__model__, posis_i);
    hull_posis_i.push(hull_posis_i[0]);
    const first = __model__.modeldata.attribs.posis.getPosiCoords(hull_posis_i[0]);
    const hull_xyzs = [[first[0], first[1], 0]];
    let longest_len = 0;
    let origin_index = -1;
    for (let i = 1; i < hull_posis_i.length; i++) {
        // add xy to list
        const next = __model__.modeldata.attribs.posis.getPosiCoords(hull_posis_i[i]);
        hull_xyzs.push([next[0], next[1], 0]);
        // get dist
        const curr_len = distance_1.distance(hull_xyzs[i - 1], hull_xyzs[i]);
        if (curr_len > longest_len) {
            longest_len = curr_len;
            origin_index = i - 1;
        }
    }
    // get the plane
    const origin = hull_xyzs[origin_index];
    const x_vec = vectors_1.vecNorm(vectors_1.vecFromTo(origin, hull_xyzs[origin_index + 1]));
    const y_vec = [-x_vec[1], x_vec[0], 0]; // vecCross([0, 0, 1], x_vec);
    const source_pln = [origin, x_vec, y_vec];
    // xform posis and get min max
    const bbox = [Infinity, Infinity, -Infinity, -Infinity];
    const target_pln = [[0, 0, 0], [1, 0, 0], [0, 1, 0]];
    const matrix = matrix_1.xfromSourceTargetMatrix(source_pln, target_pln);
    for (const xyz of hull_xyzs) {
        const new_xyz = matrix_1.multMatrix(xyz, matrix);
        if (new_xyz[0] < bbox[0]) {
            bbox[0] = new_xyz[0];
        }
        if (new_xyz[1] < bbox[1]) {
            bbox[1] = new_xyz[1];
        }
        if (new_xyz[0] > bbox[2]) {
            bbox[2] = new_xyz[0];
        }
        if (new_xyz[1] > bbox[3]) {
            bbox[3] = new_xyz[1];
        }
    }
    // calc the bbx
    const a = vectors_1.vecAdd(origin, vectors_1.vecMult(x_vec, bbox[0]));
    const b = vectors_1.vecAdd(origin, vectors_1.vecMult(x_vec, bbox[2]));
    const height_vec = vectors_1.vecMult(y_vec, bbox[3] - bbox[1]);
    const c = vectors_1.vecAdd(b, height_vec);
    const d = vectors_1.vecAdd(a, height_vec);
    const box_posis_i = [];
    for (const xyz of [a, b, c, d]) {
        const box_posi_i = __model__.modeldata.geom.add.addPosi();
        __model__.modeldata.attribs.posis.setPosiCoords(box_posi_i, xyz);
        box_posis_i.push(box_posi_i);
    }
    const box_pgon_i = __model__.modeldata.geom.add.addPgon(box_posis_i);
    return box_pgon_i;
}
function _distance2d(xy1, xy2) {
    const x = xy1[0] - xy2[0];
    const y = xy1[1] - xy2[1];
    return Math.sqrt(x * x + y * y);
}
// ================================================================================================
/**
 * Create the union of a set of polygons.
 *
 * @param __model__
 * @param entities A list of polygons, or entities from which polygons can bet extracted.
 * @returns A list of new polygons.
 */
function Union(__model__, entities) {
    entities = arrs_1.arrMakeFlat(entities);
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    // --- Error Check ---
    const fn_name = 'poly2d.Union';
    let ents_arr;
    if (__model__.debug) {
        ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], null);
    }
    else {
        // ents_arr = splitIDs(fn_name, 'entities', entities,
        // [IDcheckObj.isID, IDcheckObj.isIDList], null) as TEntTypeIdx[];
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    const posis_map = new Map();
    const pgons_i = _getPgons(__model__, ents_arr);
    if (pgons_i.length === 0) {
        return [];
    }
    const result_shape = _convertPgonsToShapeUnion(__model__, pgons_i, posis_map);
    if (result_shape === null) {
        return [];
    }
    const all_new_pgons = _convertShapesToPgons(__model__, result_shape, posis_map);
    return common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.PGON, all_new_pgons);
    // return idsMake(all_new_pgons.map( pgon_i => [EEntType.PGON, pgon_i] as TEntTypeIdx )) as TId[];
}
exports.Union = Union;
// ================================================================================================
/**
 * Perform a boolean operation on polylines or polygons.
 * \n
 * The entities in A can be either polyline or polygons.
 * The entities in B must be polygons.
 * The polygons in B are first unioned before the operation is performed.
 * The boolean operation is then performed between each polyline or polygon in A, and the unioned B polygons.
 * \n
 * If A is an empty list, then an empty list is returned.
 * If B is an empty list, then the A list is returned.
 * \n
 * @param __model__
 * @param a_entities A list of polyline or polygons, or entities from which polyline or polygons can be extracted.
 * @param b_entities A list of polygons, or entities from which polygons can be extracted.
 * @param method Enum, the boolean operator to apply.
 * @returns A list of new polylines and polygons.
 */
function Boolean(__model__, a_entities, b_entities, method) {
    a_entities = arrs_1.arrMakeFlat(a_entities);
    if (arrs_1.isEmptyArr(a_entities)) {
        return [];
    }
    b_entities = arrs_1.arrMakeFlat(b_entities);
    // --- Error Check ---
    const fn_name = 'poly2d.Boolean';
    let a_ents_arr;
    let b_ents_arr;
    if (__model__.debug) {
        a_ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'a_entities', a_entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], null);
        b_ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'b_entities', b_entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], null);
    }
    else {
        // a_ents_arr = splitIDs(fn_name, 'a_entities', a_entities,
        // [IDcheckObj.isID, IDcheckObj.isIDList], null) as TEntTypeIdx[];
        // b_ents_arr = splitIDs(fn_name, 'b_entities', b_entities,
        // [IDcheckObj.isID, IDcheckObj.isIDList], null) as TEntTypeIdx[];
        a_ents_arr = common_id_funcs_1.idsBreak(a_entities);
        b_ents_arr = common_id_funcs_1.idsBreak(b_entities);
    }
    // --- Error Check ---
    const posis_map = new Map();
    const [a_pgons_i, a_plines_i] = _getPgonsPlines(__model__, a_ents_arr);
    const b_pgons_i = _getPgons(__model__, b_ents_arr);
    if (a_pgons_i.length === 0 && a_plines_i.length === 0) {
        return [];
    }
    if (b_pgons_i.length === 0) {
        switch (method) {
            case _EBooleanMethod.INTERSECT:
                // intersect with nothing returns nothing
                return [];
            case _EBooleanMethod.DIFFERENCE:
            case _EBooleanMethod.SYMMETRIC:
                // difference with nothing returns copies
                return common_id_funcs_1.idsMake(__model__.modeldata.funcs_common.copyGeom(a_ents_arr, false));
            default:
                return [];
        }
    }
    // const a_shape: Shape = _convertPgonsToShapeUnion(__model__, a_pgons_i, posis_map);
    const b_shape = _convertPgonsToShapeUnion(__model__, b_pgons_i, posis_map);
    // call the boolean function
    const new_pgons_i = _booleanPgons(__model__, a_pgons_i, b_shape, method, posis_map);
    const new_plines_i = _booleanPlines(__model__, a_plines_i, b_shape, method, posis_map);
    // make the list of polylines and polygons
    const result_ents = [];
    const new_pgons = common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.PGON, new_pgons_i);
    // const new_pgons: TId[] = idsMake(new_pgons_i.map( pgon_i => [EEntType.PGON, pgon_i] as TEntTypeIdx )) as TId[];
    for (const new_pgon of new_pgons) {
        result_ents.push(new_pgon);
    }
    const new_plines = common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.PLINE, new_plines_i);
    // const new_plines: TId[] = idsMake(new_plines_i.map( pline_i => [EEntType.PLINE, pline_i] as TEntTypeIdx )) as TId[];
    for (const new_pline of new_plines) {
        result_ents.push(new_pline);
    }
    // always return a list
    return result_ents;
}
exports.Boolean = Boolean;
function _booleanPgons(__model__, pgons_i, b_shape, method, posis_map) {
    if (!Array.isArray(pgons_i)) {
        pgons_i = pgons_i;
        const a_shape = _convertPgonToShape(__model__, pgons_i, posis_map);
        let result_shape;
        switch (method) {
            case _EBooleanMethod.INTERSECT:
                result_shape = a_shape.intersect(b_shape);
                break;
            case _EBooleanMethod.DIFFERENCE:
                result_shape = a_shape.difference(b_shape);
                break;
            case _EBooleanMethod.SYMMETRIC:
                result_shape = a_shape.xor(b_shape);
                break;
            default:
                break;
        }
        return _convertShapesToPgons(__model__, result_shape, posis_map);
    }
    else {
        pgons_i = pgons_i;
        const all_new_pgons = [];
        for (const pgon_i of pgons_i) {
            const result_pgons_i = _booleanPgons(__model__, pgon_i, b_shape, method, posis_map);
            for (const result_pgon_i of result_pgons_i) {
                all_new_pgons.push(result_pgon_i);
            }
        }
        return all_new_pgons;
    }
}
function _booleanPlines(__model__, plines_i, b_shape, method, posis_map) {
    if (!Array.isArray(plines_i)) {
        plines_i = plines_i;
        // const wire_i: number = __model__.modeldata.geom.nav.navPlineToWire(plines_i);
        // const is_closed: boolean = __model__.modeldata.geom.query.isWireClosed(wire_i);
        // const a_shape: Shape = _convertWireToShape(__model__, wire_i, is_closed, posis_map);
        const a_shape = _convertPlineToShape(__model__, plines_i, posis_map);
        let result_shape;
        switch (method) {
            case _EBooleanMethod.INTERSECT:
                result_shape = a_shape.intersect(b_shape);
                break;
            case _EBooleanMethod.DIFFERENCE:
                result_shape = a_shape.difference(b_shape);
                break;
            case _EBooleanMethod.SYMMETRIC:
                // the perimeter of the B polygon is included in the output
                // but the perimeter is not closed, which seems strange
                result_shape = a_shape.xor(b_shape);
                break;
            default:
                break;
        }
        return _convertShapeToCutPlines(__model__, result_shape, posis_map);
    }
    else {
        plines_i = plines_i;
        const all_new_plines = [];
        for (const pline_i of plines_i) {
            const result_plines_i = _booleanPlines(__model__, pline_i, b_shape, method, posis_map);
            for (const result_pline_i of result_plines_i) {
                all_new_plines.push(result_pline_i);
            }
        }
        return all_new_plines;
    }
}
// ================================================================================================
/**
 * Offset a polyline or polygon, with mitered joints.
 *
 * @param __model__
 * @param entities A list of pollines or polygons, or entities from which polylines or polygons can be extracted.
 * @param dist Offset distance
 * @param limit Mitre limit
 * @param end_type Enum, the type of end shape for open polylines'.
 * @returns A list of new polygons.
 */
function OffsetMitre(__model__, entities, dist, limit, end_type) {
    entities = arrs_1.arrMakeFlat(entities);
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    // --- Error Check ---
    const fn_name = 'poly2d.OffsetMitre';
    let ents_arr;
    if (__model__.debug) {
        ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], [common_1.EEntType.PLINE, common_1.EEntType.PGON]);
        chk.checkArgs(fn_name, 'miter_limit', limit, [chk.isNum]);
    }
    else {
        // ents_arr = splitIDs(fn_name, 'entities', entities,
        //     [IDcheckObj.isID, IDcheckObj.isIDList], [EEntType.PLINE, EEntType.PGON]) as TEntTypeIdx[];
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    const posis_map = new Map();
    const all_new_pgons = [];
    const options = {
        jointType: _EClipJointType.MITER,
        endType: MClipOffsetEndType.get(end_type),
        miterLimit: limit / dist
    };
    const [pgons_i, plines_i] = _getPgonsPlines(__model__, ents_arr);
    for (const pgon_i of pgons_i) {
        const new_pgons_i = _offsetPgon(__model__, pgon_i, dist, options, posis_map);
        for (const new_pgon_i of new_pgons_i) {
            all_new_pgons.push([common_1.EEntType.PGON, new_pgon_i]);
        }
    }
    for (const pline_i of plines_i) {
        const new_pgons_i = _offsetPline(__model__, pline_i, dist, options, posis_map);
        for (const new_pgon_i of new_pgons_i) {
            all_new_pgons.push([common_1.EEntType.PGON, new_pgon_i]);
        }
    }
    // for (const [ent_type, ent_i] of ents_arr) {
    //     const new_pgons_i: number[] = _offset(__model__, ent_type, ent_i, dist, options);
    //     if (new_pgons_i !== null) {
    //         for (const new_pgon_i of new_pgons_i) {
    //             all_new_pgons.push([EEntType.PGON, new_pgon_i]);
    //         }
    //     }
    // }
    return common_id_funcs_1.idsMake(all_new_pgons);
}
exports.OffsetMitre = OffsetMitre;
/**
 * Offset a polyline or polygon, with chamfered joints.
 *
 * @param __model__
 * @param entities A list of pollines or polygons, or entities from which polylines or polygons can be extracted.
 * @param dist Offset distance
 * @param end_type Enum, the type of end shape for open polylines'.
 * @returns A list of new polygons.
 */
function OffsetChamfer(__model__, entities, dist, end_type) {
    entities = arrs_1.arrMakeFlat(entities);
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    // --- Error Check ---
    const fn_name = 'poly2d.OffsetChamfer';
    let ents_arr;
    if (__model__.debug) {
        ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], [common_1.EEntType.PLINE, common_1.EEntType.PGON]);
    }
    else {
        // ents_arr = splitIDs(fn_name, 'entities', entities,
        // [IDcheckObj.isID, IDcheckObj.isIDList], [EEntType.PLINE, EEntType.PGON]) as TEntTypeIdx[];
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    const posis_map = new Map();
    const all_new_pgons = [];
    const options = {
        jointType: _EClipJointType.SQUARE,
        endType: MClipOffsetEndType.get(end_type)
    };
    const [pgons_i, plines_i] = _getPgonsPlines(__model__, ents_arr);
    for (const pgon_i of pgons_i) {
        const new_pgons_i = _offsetPgon(__model__, pgon_i, dist, options, posis_map);
        for (const new_pgon_i of new_pgons_i) {
            all_new_pgons.push([common_1.EEntType.PGON, new_pgon_i]);
        }
    }
    for (const pline_i of plines_i) {
        const new_pgons_i = _offsetPline(__model__, pline_i, dist, options, posis_map);
        for (const new_pgon_i of new_pgons_i) {
            all_new_pgons.push([common_1.EEntType.PGON, new_pgon_i]);
        }
    }
    // for (const [ent_type, ent_i] of ents_arr) {
    //     const new_pgons_i: number[] = _offset(__model__, ent_type, ent_i, dist, options);
    //     if (new_pgons_i !== null) {
    //         for (const new_pgon_i of new_pgons_i) {
    //             all_new_pgons.push([EEntType.PGON, new_pgon_i]);
    //         }
    //     }
    // }
    return common_id_funcs_1.idsMake(all_new_pgons);
}
exports.OffsetChamfer = OffsetChamfer;
/**
 * Offset a polyline or polygon, with round joints.
 *
 * @param __model__
 * @param entities A list of pollines or polygons, or entities from which polylines or polygons can be extracted.
 * @param dist Offset distance
 * @param tolerance The tolerance for the rounded corners.
 * @param end_type Enum, the type of end shape for open polylines'.
 * @returns A list of new polygons.
 */
function OffsetRound(__model__, entities, dist, tolerance, end_type) {
    entities = arrs_1.arrMakeFlat(entities);
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    // --- Error Check ---
    const fn_name = 'poly2d.OffsetRound';
    let ents_arr;
    if (__model__.debug) {
        ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], [common_1.EEntType.PLINE, common_1.EEntType.PGON]);
        chk.checkArgs(fn_name, 'tolerance', tolerance, [chk.isNum]);
    }
    else {
        // ents_arr = splitIDs(fn_name, 'entities', entities,
        // [IDcheckObj.isID, IDcheckObj.isIDList], [EEntType.PLINE, EEntType.PGON]) as TEntTypeIdx[];
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    const posis_map = new Map();
    const all_new_pgons = [];
    const options = {
        jointType: _EClipJointType.ROUND,
        endType: MClipOffsetEndType.get(end_type),
        roundPrecision: tolerance * SCALE
    };
    const [pgons_i, plines_i] = _getPgonsPlines(__model__, ents_arr);
    for (const pgon_i of pgons_i) {
        const new_pgons_i = _offsetPgon(__model__, pgon_i, dist, options, posis_map);
        for (const new_pgon_i of new_pgons_i) {
            all_new_pgons.push([common_1.EEntType.PGON, new_pgon_i]);
        }
    }
    for (const pline_i of plines_i) {
        const new_pgons_i = _offsetPline(__model__, pline_i, dist, options, posis_map);
        for (const new_pgon_i of new_pgons_i) {
            all_new_pgons.push([common_1.EEntType.PGON, new_pgon_i]);
        }
    }
    return common_id_funcs_1.idsMake(all_new_pgons);
}
exports.OffsetRound = OffsetRound;
function _offsetPgon(__model__, pgon_i, dist, options, posis_map) {
    options.endType = _EClipEndType.CLOSED_PGON;
    const shape = _convertPgonToShape(__model__, pgon_i, posis_map);
    const result = shape.offset(dist * SCALE, options);
    const result_shape = new clipper_js_1.default(result.paths, result.closed);
    return _convertShapesToPgons(__model__, result_shape, posis_map);
}
function _offsetPline(__model__, pline_i, dist, options, posis_map) {
    const wire_i = __model__.modeldata.geom.nav.navPlineToWire(pline_i);
    const is_closed = __model__.modeldata.geom.query.isWireClosed(wire_i);
    if (is_closed) {
        options.endType = _EClipEndType.CLOSED_PLINE;
    }
    const shape = _convertWireToShape(__model__, wire_i, is_closed, posis_map);
    const result = shape.offset(dist * SCALE, options);
    const result_shape = new clipper_js_1.default(result.paths, result.closed);
    return _convertShapesToPgons(__model__, result_shape, posis_map);
}
// ================================================================================================
/**
 * Adds vertices to polyline and polygons at all locations where egdes intersect one another.
 * The vertices are welded.
 * This can be useful for creating networks that can be used for shortest path calculations.
 * ~
 * The input polyline and polygons are copied.
 * ~
 * @param __model__
 * @param entities A list polylines or polygons, or entities from which polylines or polygons can be extracted.
 * @param tolerance The tolerance for extending open plines if they are almost intersecting.
 * @returns Copies of the input polyline and polygons, stiched.
 */
function Stitch(__model__, entities, tolerance) {
    entities = arrs_1.arrMakeFlat(entities);
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    // --- Error Check ---
    const fn_name = 'poly2d.Stitch';
    let ents_arr;
    if (__model__.debug) {
        ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isIDL1, _check_ids_1.ID.isIDL2], [common_1.EEntType.PLINE, common_1.EEntType.PGON]);
    }
    else {
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    // copy the list of entities
    const new_ents_arr = __model__.modeldata.funcs_common.copyGeom(ents_arr, true);
    __model__.modeldata.funcs_common.clonePosisInEnts(new_ents_arr, true);
    // create maps for data
    const map_edge_i_to_posi_i = new Map();
    const map_edge_i_to_bbox = new Map();
    const map_posi_i_to_xyz = new Map();
    const map_edge_i_to_tol = new Map();
    // get the edges
    // const ents_arr2: TEntTypeIdx[] = [];
    // const edges_i: number[] = [];
    // for (const pline_i of __model__.modeldata.geom.add.copyPlines(Array.from(set_plines_i), true) as number[]) {
    //     ents_arr2.push([EEntType.PLINE, pline_i]);
    //     const ent_edges_i: number[] = __model__.modeldata.geom.nav.navAnyToEdge(EEntType.PLINE, pline_i);
    //     for (const edge_i of ent_edges_i) {
    //         edges_i.push(edge_i);
    //         _knifeGetEdgeData(__model__, edge_i, map_edge_i_to_posi_i, map_edge_i_to_bbox, map_posi_i_to_xyz);
    //     }
    // }
    // set tolerance for intersections
    const edges_i = [];
    // do stitch
    for (const [ent_type, ent_i] of new_ents_arr) {
        const ent_wires_i = __model__.modeldata.geom.nav.navAnyToWire(ent_type, ent_i);
        for (const ent_wire_i of ent_wires_i) {
            const wire_edges_i = __model__.modeldata.geom.nav.navAnyToEdge(common_1.EEntType.WIRE, ent_wire_i);
            const is_closed = __model__.modeldata.geom.query.isWireClosed(ent_wire_i);
            for (let i = 0; i < wire_edges_i.length; i++) {
                const wire_edge_i = wire_edges_i[i];
                edges_i.push(wire_edge_i);
                let edge_tol = [0, 0];
                if (!is_closed) {
                    if (wire_edges_i.length === 1) {
                        edge_tol = [-tolerance, tolerance];
                    }
                    else if (i === 0) { // first edge
                        edge_tol = [-tolerance, 0];
                    }
                    else if (i === wire_edges_i.length - 1) { // last edge
                        edge_tol = [0, tolerance];
                    }
                    map_edge_i_to_tol.set(wire_edge_i, edge_tol);
                }
                _stitchGetEdgeData(__model__, wire_edge_i, edge_tol, map_edge_i_to_posi_i, map_edge_i_to_bbox, map_posi_i_to_xyz, map_edge_i_to_tol);
            }
        }
    }
    // get the edges and the data for each edge
    const map_edge_i_to_isects = new Map();
    const map_edge_i_to_edge_i = new Map();
    for (const a_edge_i of edges_i) {
        const a_posis_i = map_edge_i_to_posi_i.get(a_edge_i);
        const a_xyz0 = map_posi_i_to_xyz.get(a_posis_i[0]);
        const a_xyz1 = map_posi_i_to_xyz.get(a_posis_i[1]);
        const a_xys = [[a_xyz0[0], a_xyz0[1]], [a_xyz1[0], a_xyz1[1]]];
        const a_bbox = map_edge_i_to_bbox.get(a_edge_i);
        const a_norm_tol = map_edge_i_to_tol.get(a_edge_i);
        for (const b_edge_i of edges_i) {
            // if this is same edge, continue
            if (a_edge_i === b_edge_i) {
                continue;
            }
            // if we have already done this pair of edges, continue
            if (map_edge_i_to_edge_i.has(a_edge_i)) {
                if (map_edge_i_to_edge_i.get(a_edge_i).has(b_edge_i)) {
                    continue;
                }
            }
            const b_posis_i = map_edge_i_to_posi_i.get(b_edge_i);
            const b_xyz0 = map_posi_i_to_xyz.get(b_posis_i[0]);
            const b_xyz1 = map_posi_i_to_xyz.get(b_posis_i[1]);
            const b_xys = [[b_xyz0[0], b_xyz0[1]], [b_xyz1[0], b_xyz1[1]]];
            const b_bbox = map_edge_i_to_bbox.get(b_edge_i);
            const b_norm_tol = map_edge_i_to_tol.get(b_edge_i);
            if (_stitchOverlap(a_bbox, b_bbox)) {
                // isect is [t, u, new_xy] or null
                //
                // TODO decide what to do about t_type and u_type... currently they are not used
                //
                const isect = _stitchIntersect(a_xys, b_xys, a_norm_tol, b_norm_tol);
                // console.log("=======")
                // console.log("a_xys", a_xys)
                // console.log("b_xys", b_xys)
                // console.log("a_norm_tol", a_norm_tol)
                // console.log("b_norm_tol", b_norm_tol)
                // console.log("isect", isect)
                // , b_xys, a_norm_tol, b_norm_tol, isect);
                if (isect !== null) {
                    const [t, t_type] = isect[0]; // -1 = start, 0 = mid, 1 = end
                    const [u, u_type] = isect[1]; // -1 = start, 0 = mid, 1 = end
                    const new_xy = isect[2];
                    // get or create the new posi
                    let new_posi_i = null;
                    // check if we are at the start or end of 'a' edge
                    const a_reuse_sta_posi = Math.abs(t) < 1e-6;
                    const a_reuse_end_posi = Math.abs(t - 1) < 1e-6;
                    if (a_reuse_sta_posi) {
                        new_posi_i = a_posis_i[0];
                    }
                    else if (a_reuse_end_posi) {
                        new_posi_i = a_posis_i[1];
                    }
                    // check if we are at the start or end of 'b' edge
                    const b_reuse_sta_posi = Math.abs(u) < 1e-6;
                    const b_reuse_end_posi = Math.abs(u - 1) < 1e-6;
                    if (b_reuse_sta_posi) {
                        new_posi_i = b_posis_i[0];
                    }
                    else if (b_reuse_end_posi) {
                        new_posi_i = b_posis_i[1];
                    }
                    // make a new position if we have an isect,
                    if (new_posi_i === null) {
                        new_posi_i = __model__.modeldata.geom.add.addPosi();
                        __model__.modeldata.attribs.posis.setPosiCoords(new_posi_i, [new_xy[0], new_xy[1], 0]);
                    }
                    // store the isects if there are any
                    if (!a_reuse_sta_posi && !a_reuse_end_posi) {
                        if (!map_edge_i_to_isects.has(a_edge_i)) {
                            map_edge_i_to_isects.set(a_edge_i, []);
                        }
                        map_edge_i_to_isects.get(a_edge_i).push([t, new_posi_i]);
                    }
                    if (!b_reuse_sta_posi && !b_reuse_end_posi) {
                        if (!map_edge_i_to_isects.has(b_edge_i)) {
                            map_edge_i_to_isects.set(b_edge_i, []);
                        }
                        map_edge_i_to_isects.get(b_edge_i).push([u, new_posi_i]);
                    }
                    // now remember that we did this pair already, so we don't do it again
                    if (!map_edge_i_to_edge_i.has(b_edge_i)) {
                        map_edge_i_to_edge_i.set(b_edge_i, new Set());
                    }
                    map_edge_i_to_edge_i.get(b_edge_i).add(a_edge_i);
                }
            }
        }
    }
    // const all_new_edges_i: number[] = [];
    const all_new_edges_i = [];
    for (const edge_i of map_edge_i_to_isects.keys()) {
        // isect [t, posi_i]
        const isects = map_edge_i_to_isects.get(edge_i);
        isects.sort((a, b) => a[0] - b[0]);
        const new_sta = isects[0][0] < 0;
        const new_end = isects[isects.length - 1][0] > 1;
        let isects_mid = isects;
        if (new_sta) {
            isects_mid = isects_mid.slice(1);
        }
        if (new_end) {
            isects_mid = isects_mid.slice(0, isects_mid.length - 1);
        }
        if (new_sta) {
            const posi_i = isects[0][1];
            const pline_i = __model__.modeldata.geom.nav.navAnyToPline(common_1.EEntType.EDGE, edge_i)[0];
            const new_sta_edge_i = __model__.modeldata.geom.edit_pline.appendVertToOpenPline(pline_i, posi_i, false);
            all_new_edges_i.push(new_sta_edge_i);
        }
        if (new_end) {
            const posi_i = isects[isects.length - 1][1];
            const pline_i = __model__.modeldata.geom.nav.navAnyToPline(common_1.EEntType.EDGE, edge_i)[0];
            const new_end_edge_i = __model__.modeldata.geom.edit_pline.appendVertToOpenPline(pline_i, posi_i, true);
            all_new_edges_i.push(new_end_edge_i);
        }
        if (isects_mid.length > 0) {
            const posis_i = isects_mid.map(isect => isect[1]);
            const new_edges_i = __model__.modeldata.geom.edit_topo.insertVertsIntoWire(edge_i, posis_i);
            for (const new_edge_i of new_edges_i) {
                all_new_edges_i.push(new_edge_i);
            }
        }
    }
    // check if any new edges are zero length
    const del_posis_i = [];
    for (const edge_i of all_new_edges_i) {
        const posis_i = __model__.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.EDGE, edge_i);
        const xyzs = posis_i.map(posi_i => __model__.modeldata.attribs.posis.getPosiCoords(posi_i));
        const dist = distance_2.distanceManhattan(xyzs[0], xyzs[1]);
        if (dist < 1e-6) {
            // we are going to del this posi
            const del_posi_i = posis_i[0];
            // get the vert of this edge
            const verts_i = __model__.modeldata.geom.nav.navEdgeToVert(edge_i);
            const del_vert_i = verts_i[0];
            // we need to make sure we dont disconnect any edges in the process
            // so we get all the verts connected to this edge
            // for each other edge, we will replace the posi for the vert that would have been deleted
            // the posi will be posis_i[1]
            const replc_verts_i = __model__.modeldata.geom.nav.navPosiToVert(del_posi_i);
            for (const replc_vert_i of replc_verts_i) {
                if (replc_vert_i === del_vert_i) {
                    continue;
                }
                __model__.modeldata.geom.edit_topo.replaceVertPosi(replc_vert_i, posis_i[1], false); // false = do nothing if edge becomes invalid
            }
            del_posis_i.push(posis_i[0]);
        }
    }
    // delete the posis from the active snapshot
    __model__.modeldata.geom.snapshot.delPosis(__model__.modeldata.active_ssid, del_posis_i);
    // return
    return common_id_funcs_1.idsMake(new_ents_arr);
}
exports.Stitch = Stitch;
function _stitchGetEdgeData(__model__, edge_i, tol, map_edge_i_to_posi_i, map_edge_i_to_bbox, map_posi_i_to_xyz, map_edge_i_to_tol) {
    // get the two posis
    const posis_i = __model__.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.EDGE, edge_i);
    // save the two posis_i
    map_edge_i_to_posi_i.set(edge_i, [posis_i[0], posis_i[1]]);
    // save the xy value of the two posis
    if (!map_posi_i_to_xyz.has(posis_i[0])) {
        const xyz = __model__.modeldata.attribs.posis.getPosiCoords(posis_i[0]);
        if (xyz[2] !== 0) {
            __model__.modeldata.attribs.posis.setPosiCoords(posis_i[0], [xyz[0], xyz[1], 0]);
        }
        map_posi_i_to_xyz.set(posis_i[0], xyz);
    }
    if (!map_posi_i_to_xyz.has(posis_i[1])) {
        const xyz = __model__.modeldata.attribs.posis.getPosiCoords(posis_i[1]);
        if (xyz[2] !== 0) {
            __model__.modeldata.attribs.posis.setPosiCoords(posis_i[1], [xyz[0], xyz[1], 0]);
        }
        map_posi_i_to_xyz.set(posis_i[1], xyz);
    }
    // calc the normalised tolerance
    const xyz0 = map_posi_i_to_xyz.get(posis_i[0]);
    const xyz1 = map_posi_i_to_xyz.get(posis_i[1]);
    const xys = [[xyz0[0], xyz0[1]], [xyz1[0], xyz1[1]]];
    const norm_tol = _stitchNormaliseTolerance(xys, tol);
    // save the bbox
    let tol_bb = 0;
    if (-tol[0] > tol[1]) {
        tol_bb = -tol[0];
    }
    else {
        tol_bb = tol[1];
    }
    // this tolerance is a llittle to generous, but it is ok, in some cases no intersection will be found
    const x_min = (xys[0][0] < xys[1][0] ? xys[0][0] : xys[1][0]) - tol_bb;
    const y_min = (xys[0][1] < xys[1][1] ? xys[0][1] : xys[1][1]) - tol_bb;
    const x_max = (xys[0][0] > xys[1][0] ? xys[0][0] : xys[1][0]) + tol_bb;
    const y_max = (xys[0][1] > xys[1][1] ? xys[0][1] : xys[1][1]) + tol_bb;
    map_edge_i_to_bbox.set(edge_i, [[x_min, y_min], [x_max, y_max]]);
    // console.log("TOL",tol_bb, [[x_min, y_min], [x_max, y_max]] )
    // save the tolerance
    map_edge_i_to_tol.set(edge_i, norm_tol);
}
function _stitchOverlap(bbox1, bbox2) {
    if (bbox2[1][0] < bbox1[0][0]) {
        return false;
    }
    if (bbox2[0][0] > bbox1[1][0]) {
        return false;
    }
    if (bbox2[1][1] < bbox1[0][1]) {
        return false;
    }
    if (bbox2[0][1] > bbox1[1][1]) {
        return false;
    }
    return true;
}
// function _knifeIntersect(l1: [Txy, Txy], l2: [Txy, Txy]): [number, number, Txy] {
//     // https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
//     const x1 = l1[0][0];
//     const y1 = l1[0][1];
//     const x2 = l1[1][0];
//     const y2 = l1[1][1];
//     const x3 = l2[0][0];
//     const y3 = l2[0][1];
//     const x4 = l2[1][0];
//     const y4 = l2[1][1];
//     const denominator  = ((x1 - x2) * (y3 - y4)) - ((y1 - y2) * (x3 - x4));
//     if (denominator === 0) { return null; }
//     const t = (((x1 - x3) * (y3 - y4)) - ((y1 - y3) * (x3 - x4))) / denominator;
//     const u = -(((x1 - x2) * (y1 - y3)) - ((y1 - y2) * (x1 - x3))) / denominator;
//     if ((t >= 0 && t <= 1) && (u >= 0 && u <= 1)) {
//         const new_xy: Txy = [x1 + (t * x2) - (t * x1), y1 + (t * y2) - (t * y1)];
//         return [t, u, new_xy];
//     }
//     return null;
// }
function _stitchNormaliseTolerance(l1, tol) {
    if (tol[0] || tol[1]) {
        const new_tol = [0, 0];
        const x1 = l1[0][0];
        const y1 = l1[0][1];
        const x2 = l1[1][0];
        const y2 = l1[1][1];
        const xdist = (x1 - x2), ydist = (y1 - y2);
        const dist = Math.sqrt(xdist * xdist + ydist * ydist);
        // if tol is not zero, then calc a new tol
        if (tol[0]) {
            new_tol[0] = tol[0] / dist;
        }
        if (tol[1]) {
            new_tol[1] = tol[1] / dist;
        }
        return new_tol;
    }
    return [0, 0];
}
/**
 * Returns [[t, type], [u, type], [x, y]]
 * Return value 'type' is as follows:
 * -1 indicates that the edge is crossed close to the start position of the edge.
 * 0 indicates that the edge is crossed somewhere in the middle.
 * 1 indicates that the edge is crossed close to the end position of the edge.
 * @param a_line [[x,y], [x,y]]
 * @param b_line [[x,y], [x,y]]
 * @param a_tol [norm_start_offset, norm_end_offset]
 * @param b_tol [norm_start_offset, norm_end_offset]
 * @returns [[t, type], [u, type], [x, y]]
 */
function _stitchIntersect(a_line, b_line, a_tol, b_tol) {
    // https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
    // line 1, t
    const x1 = a_line[0][0];
    const y1 = a_line[0][1];
    const x2 = a_line[1][0];
    const y2 = a_line[1][1];
    // line 2, u
    const x3 = b_line[0][0];
    const y3 = b_line[0][1];
    const x4 = b_line[1][0];
    const y4 = b_line[1][1];
    const denominator = ((x1 - x2) * (y3 - y4)) - ((y1 - y2) * (x3 - x4));
    if (denominator === 0) {
        return null;
    }
    // calc intersection
    const t = (((x1 - x3) * (y3 - y4)) - ((y1 - y3) * (x3 - x4))) / denominator;
    const u = -(((x1 - x2) * (y1 - y3)) - ((y1 - y2) * (x1 - x3))) / denominator;
    if ((t >= a_tol[0] && t <= 1 + a_tol[1]) && (u >= b_tol[0] && u <= 1 + b_tol[1])) {
        const new_xy = [x1 + (t * x2) - (t * x1), y1 + (t * y2) - (t * y1)];
        let t_type = 0; // crosses at mid
        let u_type = 0; // crosses at mid
        // check if we are at the start or end of 'a' edge
        if (t < -a_tol[0]) {
            t_type = -1; // crosses close to start
        }
        else if (t > 1 - a_tol[1]) {
            t_type = 1; // crosses close to end
        }
        // check if we are at the start or end of 'b' edge
        if (u < -b_tol[0]) {
            u_type = -1; // crosses close to start
        }
        else if (u > 1 - b_tol[1]) {
            u_type = 1; // crosses close to end
        }
        return [[t, t_type], [u, u_type], new_xy];
    }
    return null; // no intersection
}
// ================================================================================================
/**
 * Clean a polyline or polygon.
 * \n
 * Vertices that are closer together than the specified tolerance will be merged.
 * Vertices that are colinear within the tolerance distance will be deleted.
 * \n
 * @param __model__
 * @param entities A list of polylines or polygons, or entities from which polylines or polygons can be extracted.
 * @param tolerance The tolerance for deleting vertices from the polyline.
 * @returns A list of new polygons.
 */
function Clean(__model__, entities, tolerance) {
    entities = arrs_1.arrMakeFlat(entities);
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    // --- Error Check ---
    const fn_name = 'poly2d.Clean';
    let ents_arr;
    if (__model__.debug) {
        ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], [common_1.EEntType.PLINE, common_1.EEntType.PGON]);
        chk.checkArgs(fn_name, 'tolerance', tolerance, [chk.isNum]);
    }
    else {
        // ents_arr = splitIDs(fn_name, 'entities', entities,
        //     [IDcheckObj.isID, IDcheckObj.isIDList], [EEntType.PLINE, EEntType.PGON]) as TEntTypeIdx[];
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    const posis_map = new Map();
    const all_new_ents = [];
    const [pgons_i, plines_i] = _getPgonsPlines(__model__, ents_arr);
    for (const pgon_i of pgons_i) {
        const new_pgons_i = _cleanPgon(__model__, pgon_i, tolerance, posis_map);
        for (const new_pgon_i of new_pgons_i) {
            all_new_ents.push([common_1.EEntType.PGON, new_pgon_i]);
        }
    }
    for (const pline_i of plines_i) {
        const new_plines_i = _cleanPline(__model__, pline_i, tolerance, posis_map);
        for (const new_pline_i of new_plines_i) {
            all_new_ents.push([common_1.EEntType.PLINE, new_pline_i]);
        }
    }
    return common_id_funcs_1.idsMake(all_new_ents);
}
exports.Clean = Clean;
function _cleanPgon(__model__, pgon_i, tolerance, posis_map) {
    const shape = _convertPgonToShape(__model__, pgon_i, posis_map);
    const result = shape.clean(tolerance * SCALE);
    const result_shape = new clipper_js_1.default(result.paths, result.closed);
    return _convertShapesToPgons(__model__, result_shape, posis_map);
}
function _cleanPline(__model__, pline_i, tolerance, posis_map) {
    const wire_i = __model__.modeldata.geom.nav.navPlineToWire(pline_i);
    const verts_i = __model__.modeldata.geom.nav.navAnyToVert(common_1.EEntType.WIRE, wire_i);
    if (verts_i.length === 2) {
        return [pline_i];
    }
    const is_closed = __model__.modeldata.geom.query.isWireClosed(wire_i);
    const shape = _convertWireToShape(__model__, wire_i, is_closed, posis_map);
    const result = shape.clean(tolerance * SCALE);
    const result_shape = new clipper_js_1.default(result.paths, result.closed);
    const shape_num_verts = result_shape.paths[0].length;
    if (shape_num_verts === 0 || shape_num_verts === verts_i.length) {
        return [pline_i];
    }
    return _convertShapeToPlines(__model__, result_shape, result.closed, posis_map);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seTJkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vZ2VuX2V2YWxfcHJvY2Vzc19iYWNrZW5kL3NyYy9jb3JlL21vZHVsZXMvYmFzaWMvcG9seTJkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7Ozs7Ozs7Ozs7O0FBRUg7O0dBRUc7QUFDSCxpREFBZ0Q7QUFFaEQsd0RBQTBDO0FBRzFDLGtEQUFzRjtBQUN0RixzRUFBeUM7QUFDekMsMkVBQW1HO0FBQ25HLGlEQUFpRTtBQUNqRSxtREFBcUM7QUFDckMsbURBQXFDO0FBQ3JDLGtEQUFvQztBQUNwQyx5REFBc0Q7QUFDdEQsdURBQWdGO0FBQ2hGLHFEQUErRTtBQUUvRSx5REFBK0Q7QUFFL0QsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDO0FBRWxCLGdCQUFnQjtBQUNoQixJQUFZLGVBSVg7QUFKRCxXQUFZLGVBQWU7SUFDdkIsc0NBQW1CLENBQUE7SUFDbkIsb0NBQWlCLENBQUE7SUFDakIsb0NBQWlCLENBQUE7QUFDckIsQ0FBQyxFQUpXLGVBQWUsR0FBZix1QkFBZSxLQUFmLHVCQUFlLFFBSTFCO0FBQ0QsSUFBWSxhQU1YO0FBTkQsV0FBWSxhQUFhO0lBQ3JCLDZDQUE0QixDQUFBO0lBQzVCLDJDQUEwQixDQUFBO0lBQzFCLHlDQUF3QixDQUFBO0lBQ3hCLDhDQUE2QixDQUFBO0lBQzdCLGdEQUErQixDQUFBO0FBQ25DLENBQUMsRUFOVyxhQUFhLEdBQWIscUJBQWEsS0FBYixxQkFBYSxRQU14QjtBQWlCRCxNQUFNLGtCQUFrQixHQUF3QixJQUFJLEdBQUcsQ0FBQztJQUNwRCxDQUFDLFlBQVksRUFBRSxhQUFhLENBQUMsV0FBVyxDQUFDO0lBQ3pDLENBQUMsV0FBVyxFQUFFLGFBQWEsQ0FBQyxVQUFVLENBQUM7SUFDdkMsQ0FBQyxVQUFVLEVBQUUsYUFBYSxDQUFDLFNBQVMsQ0FBQztDQUN4QyxDQUFDLENBQUM7QUFD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