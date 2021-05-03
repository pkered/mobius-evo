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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seTJkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdHMvc3JjL2NvcmUvbW9kdWxlcy9iYXNpYy9wb2x5MmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOzs7Ozs7Ozs7Ozs7QUFFSDs7R0FFRztBQUNILGlEQUFnRDtBQUVoRCx3REFBMEM7QUFHMUMsa0RBQXNGO0FBQ3RGLHNFQUF5QztBQUN6QywyRUFBbUc7QUFDbkcsaURBQWlFO0FBQ2pFLG1EQUFxQztBQUNyQyxtREFBcUM7QUFDckMsa0RBQW9DO0FBQ3BDLHlEQUFzRDtBQUN0RCx1REFBZ0Y7QUFDaEYscURBQStFO0FBRS9FLHlEQUErRDtBQUUvRCxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUM7QUFFbEIsZ0JBQWdCO0FBQ2hCLElBQVksZUFJWDtBQUpELFdBQVksZUFBZTtJQUN2QixzQ0FBbUIsQ0FBQTtJQUNuQixvQ0FBaUIsQ0FBQTtJQUNqQixvQ0FBaUIsQ0FBQTtBQUNyQixDQUFDLEVBSlcsZUFBZSxHQUFmLHVCQUFlLEtBQWYsdUJBQWUsUUFJMUI7QUFDRCxJQUFZLGFBTVg7QUFORCxXQUFZLGFBQWE7SUFDckIsNkNBQTRCLENBQUE7SUFDNUIsMkNBQTBCLENBQUE7SUFDMUIseUNBQXdCLENBQUE7SUFDeEIsOENBQTZCLENBQUE7SUFDN0IsZ0RBQStCLENBQUE7QUFDbkMsQ0FBQyxFQU5XLGFBQWEsR0FBYixxQkFBYSxLQUFiLHFCQUFhLFFBTXhCO0FBaUJELE1BQU0sa0JBQWtCLEdBQXdCLElBQUksR0FBRyxDQUFDO0lBQ3BELENBQUMsWUFBWSxFQUFFLGFBQWEsQ0FBQyxXQUFXLENBQUM7SUFDekMsQ0FBQyxXQUFXLEVBQUUsYUFBYSxDQUFDLFVBQVUsQ0FBQztJQUN2QyxDQUFDLFVBQVUsRUFBRSxhQUFhLENBQUMsU0FBUyxDQUFDO0NBQ3hDLENBQUMsQ0FBQztBQUNILGlCQUFpQjtBQUNqQixJQUFZLFFBR1g7QUFIRCxXQUFZLFFB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QUNELFNBQVMsU0FBUyxDQUFDLFNBQWtCLEVBQUUsT0FBaUI7SUFDcEQsTUFBTSxJQUFJLEdBQXFDLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzFGLEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxFQUFFO1FBQzFCLE1BQU0sR0FBRyxHQUFTLFNBQVMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDMUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUFFO1FBQzNDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FBRTtRQUMzQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQUU7UUFDM0MsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUFFO0tBQzlDO0lBQ0QsTUFBTSxDQUFDLEdBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3RDLE1BQU0sQ0FBQyxHQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFD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