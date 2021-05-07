"use strict";
/**
 * The `calc` module has functions for performing various types of calculations with entities in the model.
 * These functions neither make nor modify anything in the model.
 * These functions all return either numbers or lists of numbers.
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
const common_id_funcs_1 = require("@assets/libs/geo-info/common_id_funcs");
const distance_1 = require("@libs/geom/distance");
const vectors_1 = require("@libs/geom/vectors");
const triangulate_1 = require("@libs/triangulate/triangulate");
const triangle_1 = require("@libs/geom/triangle");
const underscore_1 = __importDefault(require("underscore"));
const _common_1 = require("./_common");
const _ray_1 = require("@assets/core/inline/_ray");
const arrs_1 = require("@assets/libs/util/arrs");
// ================================================================================================
var _EDistanceMethod;
(function (_EDistanceMethod) {
    _EDistanceMethod["PS_PS_DISTANCE"] = "ps_to_ps_distance";
    _EDistanceMethod["PS_E_DISTANCE"] = "ps_to_e_distance";
    _EDistanceMethod["PS_W_DISTANCE"] = "ps_to_w_distance";
})(_EDistanceMethod = exports._EDistanceMethod || (exports._EDistanceMethod = {}));
/**
 * Calculates the minimum distance from one position to other entities in the model.
 *
 * @param __model__
 * @param entities1 Position to calculate distance from.
 * @param entities2 List of entities to calculate distance to.
 * @param method Enum; distance method.
 * @returns Distance, or list of distances (if position2 is a list).
 * @example distance1 = calc.Distance (position1, position2, p_to_p_distance)
 * @example_info position1 = [0,0,0], position2 = [[0,0,10],[0,0,20]], Expected value of distance is 10.
 */
function Distance(__model__, entities1, entities2, method) {
    if (arrs_1.isEmptyArr(entities1)) {
        return [];
    }
    if (arrs_1.isEmptyArr(entities2)) {
        return [];
    }
    if (Array.isArray(entities1)) {
        entities1 = arrs_1.arrMakeFlat(entities1);
    }
    entities2 = arrs_1.arrMakeFlat(entities2);
    // --- Error Check ---
    const fn_name = 'calc.Distance';
    let ents_arr1;
    let ents_arr2;
    if (__model__.debug) {
        ents_arr1 = _check_ids_1.checkIDs(__model__, fn_name, 'entities1', entities1, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], null);
        ents_arr2 = _check_ids_1.checkIDs(__model__, fn_name, 'entities2', entities2, [_check_ids_1.ID.isIDL1], null);
    }
    else {
        ents_arr1 = common_id_funcs_1.idsBreak(entities1);
        ents_arr2 = common_id_funcs_1.idsBreak(entities2);
    }
    // --- Error Check ---
    // get the from posis
    let from_posis_i;
    if (arrs_1.arrMaxDepth(ents_arr1) === 1 && ents_arr1[0] === common_1.EEntType.POSI) {
        from_posis_i = ents_arr1[1];
    }
    else {
        from_posis_i = [];
        for (const [ent_type, ent_i] of ents_arr1) {
            if (ent_type === common_1.EEntType.POSI) {
                from_posis_i.push(ent_i);
            }
            else {
                const ent_posis_i = __model__.modeldata.geom.nav.navAnyToPosi(ent_type, ent_i);
                for (const ent_posi_i of ent_posis_i) {
                    from_posis_i.push(ent_posi_i);
                }
            }
        }
    }
    // get the to ent_type
    let to_ent_type;
    switch (method) {
        case _EDistanceMethod.PS_PS_DISTANCE:
            to_ent_type = common_1.EEntType.POSI;
            break;
        case _EDistanceMethod.PS_W_DISTANCE:
        case _EDistanceMethod.PS_E_DISTANCE:
            to_ent_type = common_1.EEntType.EDGE;
            break;
        default:
            break;
    }
    // get the ents and posis sets
    const set_to_ents_i = new Set();
    let set_to_posis_i = new Set();
    for (const [ent_type, ent_i] of ents_arr2) {
        // ents
        if (ent_type === to_ent_type) {
            set_to_ents_i.add(ent_i);
        }
        else {
            const sub_ents_i = __model__.modeldata.geom.nav.navAnyToAny(ent_type, to_ent_type, ent_i);
            for (const sub_ent_i of sub_ents_i) {
                set_to_ents_i.add(sub_ent_i);
            }
        }
        // posis
        if (to_ent_type !== common_1.EEntType.POSI) {
            const sub_posis_i = __model__.modeldata.geom.nav.navAnyToPosi(ent_type, ent_i);
            for (const sub_posi_i of sub_posis_i) {
                set_to_posis_i.add(sub_posi_i);
            }
        }
    }
    // create an array of to_ents
    const to_ents_i = Array.from(set_to_ents_i);
    // cerate a posis xyz map
    const map_posi_i_xyz = new Map();
    if (to_ent_type === common_1.EEntType.POSI) {
        set_to_posis_i = set_to_ents_i;
    }
    for (const posi_i of set_to_posis_i) {
        const xyz = __model__.modeldata.attribs.posis.getPosiCoords(posi_i);
        map_posi_i_xyz.set(posi_i, xyz);
    }
    // calc the distance
    switch (method) {
        case _EDistanceMethod.PS_PS_DISTANCE:
            return _distanceManyPosisToPosis(__model__, from_posis_i, to_ents_i, map_posi_i_xyz, method);
        case _EDistanceMethod.PS_W_DISTANCE:
        case _EDistanceMethod.PS_E_DISTANCE:
            return _distanceManyPosisToEdges(__model__, from_posis_i, to_ents_i, map_posi_i_xyz, method);
        default:
            break;
    }
}
exports.Distance = Distance;
function _distanceManyPosisToPosis(__model__, from_posi_i, to_ents_i, map_posi_i_xyz, method) {
    if (!Array.isArray(from_posi_i)) {
        from_posi_i = from_posi_i;
        return _distancePstoPs(__model__, from_posi_i, to_ents_i, map_posi_i_xyz);
    }
    else {
        from_posi_i = from_posi_i;
        // TODO This can be optimised
        // From posis may have duplicates, only calc once
        return from_posi_i.map(one_from => _distanceManyPosisToPosis(__model__, one_from, to_ents_i, map_posi_i_xyz, method));
    }
}
// function _distanceManyPosisToWires(__model__: GIModel, from_posi_i: number|number[], to_ents_i: number[],
//         method: _EDistanceMethod): number|number[] {
//     if (!Array.isArray(from_posi_i)) {
//         from_posi_i = from_posi_i as number;
//         return _distancePstoW(__model__, from_posi_i, to_ents_i) as number;
//     } else  {
//         from_posi_i = from_posi_i as number[];
//         // TODO This can be optimised
//         // There is some vector stuff that gets repeated for each posi to line dist calc
//         return from_posi_i.map( one_from => _distanceManyPosisToWires(__model__, one_from, to_ents_i, method) ) as number[];
//     }
// }
function _distanceManyPosisToEdges(__model__, from_posi_i, to_ents_i, map_posi_i_xyz, method) {
    if (!Array.isArray(from_posi_i)) {
        from_posi_i = from_posi_i;
        return _distancePstoE(__model__, from_posi_i, to_ents_i, map_posi_i_xyz);
    }
    else {
        from_posi_i = from_posi_i;
        // TODO This can be optimised
        // From posis may have duplicates, only calc once
        // Adjacent edges could be calculated once only
        return from_posi_i.map(one_from => _distanceManyPosisToEdges(__model__, one_from, to_ents_i, map_posi_i_xyz, method));
    }
}
function _distancePstoPs(__model__, from_posi_i, to_posis_i, map_posi_i_xyz) {
    const from_xyz = __model__.modeldata.attribs.posis.getPosiCoords(from_posi_i);
    let min_dist = Infinity;
    // loop, measure dist
    for (const to_posi_i of to_posis_i) {
        // get xyz
        const to_xyz = map_posi_i_xyz.get(to_posi_i);
        // calc dist
        const dist = _distancePointToPoint(from_xyz, to_xyz);
        if (dist < min_dist) {
            min_dist = dist;
        }
    }
    return min_dist;
}
// function _distancePstoW(__model__: GIModel, from_posi_i: number, to_wires_i: number[]): number {
//     const from_xyz: Txyz = __model__.modeldata.attribs.posis.getPosiCoords(from_posi_i);
//     let min_dist = Infinity;
//     const map_posi_xyz: Map<number, Txyz> = new Map();
//     for (const wire_i of to_wires_i) {
//         // get the posis
//         const to_posis_i: number[] = __model__.modeldata.geom.nav.navAnyToPosi(EEntType.WIRE, wire_i);
//         // if closed, add first posi to end
//         if (__model__.modeldata.geom.query.isWireClosed(wire_i)) { to_posis_i.push(to_posis_i[0]); }
//         // add the first xyz to the list, this will be prev
//         let prev_xyz: Txyz = __model__.modeldata.attribs.posis.getPosiCoords(to_posis_i[0]);
//         map_posi_xyz.set(to_posis_i[0], prev_xyz);
//         // loop, measure dist
//         for (let i = 1; i < to_posis_i.length; i++) {
//             // get xyz
//             const curr_posi_i: number = to_posis_i[i];
//             let curr_xyz: Txyz = map_posi_xyz.get(curr_posi_i);
//             if (curr_xyz === undefined) {
//                 curr_xyz = __model__.modeldata.attribs.posis.getPosiCoords(curr_posi_i);
//                 map_posi_xyz.set(curr_posi_i, curr_xyz);
//             }
//             // calc dist
//             const dist: number = _distancePointToLine(from_xyz, prev_xyz, curr_xyz);
//             if (dist < min_dist) { min_dist = dist; }
//             // next
//             prev_xyz = curr_xyz;
//         }
//     }
//     return min_dist;
// }
function _distancePstoE(__model__, from_posi_i, to_edges_i, map_posi_i_xyz) {
    const from_xyz = __model__.modeldata.attribs.posis.getPosiCoords(from_posi_i);
    let min_dist = Infinity;
    for (const edge_i of to_edges_i) {
        // get the posis
        const edge_posis_i = __model__.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.EDGE, edge_i);
        const xyz_start = map_posi_i_xyz.get(edge_posis_i[0]);
        const xyz_end = map_posi_i_xyz.get(edge_posis_i[1]);
        // calc dist
        const dist = _distancePointToLine(from_xyz, xyz_start, xyz_end);
        if (dist < min_dist) {
            min_dist = dist;
        }
    }
    return min_dist;
}
function _distancePointToPoint(from, to) {
    const a = from[0] - to[0];
    const b = from[1] - to[1];
    const c = from[2] - to[2];
    return Math.sqrt(a * a + b * b + c * c);
}
function _distancePointToLine(from, start, end) {
    const vec_from = vectors_1.vecFromTo(start, from);
    const vec_line = vectors_1.vecFromTo(start, end);
    const len = vectors_1.vecLen(vec_line);
    const vec_line_norm = vectors_1.vecDiv(vec_line, len);
    const dot = vectors_1.vecDot(vec_from, vec_line_norm);
    if (dot <= 0) {
        return _distancePointToPoint(from, start);
    }
    else if (dot >= len) {
        return _distancePointToPoint(from, end);
    }
    const close = vectors_1.vecAdd(start, vectors_1.vecSetLen(vec_line, dot));
    return _distancePointToPoint(from, close);
}
// ================================================================================================
/**
 * Calculates the length of an entity.
 *
 * The entity can be an edge, a wire, a polyline, or anything from which wires can be extracted.
 * This includes polylines, polygons, faces, and collections.
 *
 * Given a list of edges, wires, or polylines, a list of lengths are returned.
 *
 * Given any types of entities from which wires can be extracted, a list of lengths are returned.
 * For example, given a single polygon, a list of lengths are returned (since a polygon may have multiple wires).
 *
 * @param __model__
 * @param entities Single or list of edges or wires or other entities from which wires can be extracted.
 * @returns Lengths, a number or list of numbers.
 * @example length1 = calc.Length(line1)
 */
function Length(__model__, entities) {
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    // --- Error Check ---
    const fn_name = 'calc.Length';
    let ents_arr;
    if (__model__.debug) {
        ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], [common_1.EEntType.EDGE, common_1.EEntType.WIRE, common_1.EEntType.PLINE, common_1.EEntType.PGON, common_1.EEntType.COLL]);
    }
    else {
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    return _length(__model__, ents_arr);
}
exports.Length = Length;
function _length(__model__, ents_arrs) {
    if (arrs_1.getArrDepth(ents_arrs) === 1) {
        const [ent_type, index] = ents_arrs;
        if (ent_type === common_1.EEntType.EDGE) {
            return _edgeLength(__model__, index);
        }
        else if (ent_type === common_1.EEntType.WIRE) {
            return _wireLength(__model__, index);
        }
        else if (ent_type === common_1.EEntType.PLINE) {
            const wire_i = __model__.modeldata.geom.nav.navPlineToWire(index);
            return _wireLength(__model__, wire_i);
        }
        else {
            const wires_i = __model__.modeldata.geom.nav.navAnyToWire(ent_type, index);
            return wires_i.map(wire_i => _wireLength(__model__, wire_i));
        }
    }
    else {
        const lengths = ents_arrs.map(ents_arr => _length(__model__, ents_arr));
        return underscore_1.default.flatten(lengths);
    }
}
function _edgeLength(__model__, edge_i) {
    const posis_i = __model__.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.EDGE, edge_i);
    const xyz_0 = __model__.modeldata.attribs.posis.getPosiCoords(posis_i[0]);
    const xyz_1 = __model__.modeldata.attribs.posis.getPosiCoords(posis_i[1]);
    return distance_1.distance(xyz_0, xyz_1);
}
function _wireLength(__model__, wire_i) {
    const posis_i = __model__.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.WIRE, wire_i);
    let dist = 0;
    for (let i = 0; i < posis_i.length - 1; i++) {
        const xyz_0 = __model__.modeldata.attribs.posis.getPosiCoords(posis_i[i]);
        const xyz_1 = __model__.modeldata.attribs.posis.getPosiCoords(posis_i[i + 1]);
        dist += distance_1.distance(xyz_0, xyz_1);
    }
    if (__model__.modeldata.geom.query.isWireClosed(wire_i)) {
        const xyz_0 = __model__.modeldata.attribs.posis.getPosiCoords(posis_i[posis_i.length - 1]);
        const xyz_1 = __model__.modeldata.attribs.posis.getPosiCoords(posis_i[0]);
        dist += distance_1.distance(xyz_0, xyz_1);
    }
    return dist;
}
// ================================================================================================
/**
 * Calculates the area of en entity.
 *
 * The entity can be a polygon, a face, a closed polyline, a closed wire, or a collection.
 *
 * Given a list of entities, a list of areas are returned.
 *
 * @param __model__
 * @param entities Single or list of polygons, closed polylines, closed wires, collections.
 * @returns Area.
 * @example area1 = calc.Area (surface1)
 */
function Area(__model__, entities) {
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    // --- Error Check ---
    const fn_name = 'calc.Area';
    let ents_arr;
    if (__model__.debug) {
        ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], [common_1.EEntType.PGON, common_1.EEntType.PLINE, common_1.EEntType.WIRE, common_1.EEntType.COLL]);
    }
    else {
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    return _area(__model__, ents_arr);
}
exports.Area = Area;
function _area(__model__, ents_arrs) {
    if (arrs_1.getArrDepth(ents_arrs) === 1) {
        const [ent_type, ent_i] = ents_arrs;
        if (ent_type === common_1.EEntType.PGON) {
            // faces, these are already triangulated
            const tris_i = __model__.modeldata.geom.nav_tri.navPgonToTri(ent_i);
            let total_area = 0;
            for (const tri_i of tris_i) {
                const corners_i = __model__.modeldata.geom.nav_tri.navTriToPosi(tri_i);
                if (corners_i.length !== 3) {
                    continue;
                } // two or more verts have same posi, so area is 0
                const corners_xyzs = corners_i.map(corner_i => __model__.modeldata.attribs.posis.getPosiCoords(corner_i));
                const tri_area = triangle_1.area(corners_xyzs[0], corners_xyzs[1], corners_xyzs[2]);
                total_area += tri_area;
            }
            return total_area;
        }
        else if (ent_type === common_1.EEntType.PLINE || ent_type === common_1.EEntType.WIRE) {
            // wires, these need to be triangulated
            let wire_i = ent_i;
            if (ent_type === common_1.EEntType.PLINE) {
                wire_i = __model__.modeldata.geom.nav.navPlineToWire(ent_i);
            }
            if (!__model__.modeldata.geom.query.isWireClosed(wire_i)) {
                throw new Error('To calculate area, wire must be closed');
            }
            const posis_i = __model__.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.WIRE, ent_i);
            const xyzs = posis_i.map(posi_i => __model__.modeldata.attribs.posis.getPosiCoords(posi_i));
            const tris = triangulate_1.triangulate(xyzs);
            let total_area = 0;
            for (const tri of tris) {
                const corners_xyzs = tri.map(corner_i => xyzs[corner_i]);
                const tri_area = triangle_1.area(corners_xyzs[0], corners_xyzs[1], corners_xyzs[2]);
                total_area += tri_area;
            }
            return total_area;
        }
        else {
            return 0;
        }
    }
    else {
        const areas = ents_arrs.map(ents_arr => _area(__model__, ents_arr));
        return underscore_1.default.flatten(areas);
    }
}
// ================================================================================================
/**
 * Returns a vector along an edge, from the start position to the end position.
 * The vector is not normalized.
 *
 * Given a single edge, a single vector will be returned. Given a list of edges, a list of vectors will be returned.
 *
 * Given any entity that has edges (collection, polygons, polylines, faces, and wires),
 * a list of edges will be extracted, and a list of vectors will be returned.
 *
 * @param __model__
 * @param entities Single or list of edges, or any entity from which edges can be extracted.
 * @returns The vector [x, y, z] or a list of vectors.
 */
function Vector(__model__, entities) {
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    // --- Error Check ---
    const fn_name = 'calc.Vector';
    let ents_arrs;
    if (__model__.debug) {
        ents_arrs = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], [common_1.EEntType.PGON, common_1.EEntType.PLINE, common_1.EEntType.WIRE, common_1.EEntType.EDGE]);
    }
    else {
        ents_arrs = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    return _vector(__model__, ents_arrs);
}
exports.Vector = Vector;
function _vector(__model__, ents_arrs) {
    if (arrs_1.getArrDepth(ents_arrs) === 1) {
        const [ent_type, index] = ents_arrs;
        if (ent_type === common_1.EEntType.EDGE) {
            const verts_i = __model__.modeldata.geom.nav.navAnyToVert(ent_type, index);
            const start = __model__.modeldata.attribs.posis.getVertCoords(verts_i[0]);
            const end = __model__.modeldata.attribs.posis.getVertCoords(verts_i[1]);
            // if (!start || !end) { console.log(">>>>", verts_i, start, end, __model__.modeldata.geom._geom_maps); }
            return vectors_1.vecSub(end, start);
        }
        else {
            const edges_i = __model__.modeldata.geom.nav.navAnyToEdge(ent_type, index);
            const edges_arrs = edges_i.map(edge_i => [common_1.EEntType.EDGE, edge_i]);
            return edges_arrs.map(edges_arr => _vector(__model__, edges_arr));
        }
    }
    else {
        const vectors_arrs = ents_arrs.map(ents_arr => _vector(__model__, ents_arr));
        const all_vectors = [];
        for (const vectors_arr of vectors_arrs) {
            if (arrs_1.getArrDepth(vectors_arr) === 1) {
                all_vectors.push(vectors_arr);
            }
            else {
                for (const vector_arr of vectors_arr) {
                    all_vectors.push(vector_arr);
                }
            }
        }
        return all_vectors;
    }
}
// ================================================================================================
var _ECentroidMethod;
(function (_ECentroidMethod) {
    _ECentroidMethod["PS_AVERAGE"] = "ps_average";
    _ECentroidMethod["CENTER_OF_MASS"] = "center_of_mass";
})(_ECentroidMethod = exports._ECentroidMethod || (exports._ECentroidMethod = {}));
/**
 * Calculates the centroid of an entity.
 *
 * If 'ps_average' is selected, the centroid is the average of the positions that make up that entity.
 *
 * If 'center_of_mass' is selected, the centroid is the centre of mass of the faces that make up that entity.
 * Note that only faces are deemed to have mass.
 *
 * Given a list of entities, a list of centroids will be returned.
 *
 * Given a list of positions, a single centroid that is the average of all those positions will be returned.
 *
 * @param __model__
 * @param entities Single or list of entities. (Can be any type of entities.)
 * @param method Enum, the method for calculating the centroid.
 * @returns A centroid [x, y, z] or a list of centroids.
 * @example centroid1 = calc.Centroid (polygon1)
 */
function Centroid(__model__, entities, method) {
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    // --- Error Check ---
    const fn_name = 'calc.Centroid';
    let ents_arrs;
    if (__model__.debug) {
        ents_arrs = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], null);
    }
    else {
        ents_arrs = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    switch (method) {
        case _ECentroidMethod.PS_AVERAGE:
            return _common_1.getCentroid(__model__, ents_arrs);
        case _ECentroidMethod.CENTER_OF_MASS:
            return _common_1.getCenterOfMass(__model__, ents_arrs);
        default:
            break;
    }
}
exports.Centroid = Centroid;
// ================================================================================================
/**
 * Calculates the normal vector of an entity or list of entities. The vector is normalised, and scaled
 * by the specified scale factor.
 *
 * Given a single entity, a single normal will be returned. Given a list of entities, a list of normals will be returned.
 *
 * For polygons, faces, and face wires the normal is calculated by taking the average of all the normals of the face triangles.
 *
 * For polylines and polyline wires, the normal is calculated by triangulating the positions, and then
 * taking the average of all the normals of the triangles.
 *
 * For edges, the normal is calculated by takingthe avery of the normals of the two vertices.
 *
 * For vertices, the normal is calculated by creating a triangle out of the two adjacent edges,
 * and then calculating the normal of the triangle.
 * (If there is only one edge, or if the two adjacent edges are colinear, the the normal of the wire is returned.)
 *
 * For positions, the normal is calculated by taking the average of the normals of all the vertices linked to the position.
 *
 * If the normal cannot be calculated, [0, 0, 0] will be returned.
 *
 * @param __model__
 * @param entities Single or list of entities. (Can be any type of entities.)
 * @param scale The scale factor for the normal vector. (This is equivalent to the length of the normal vector.)
 * @returns The normal vector [x, y, z] or a list of normal vectors.
 * @example normal1 = calc.Normal (polygon1, 1)
 * @example_info If the input is non-planar, the output vector will be an average of all normals vector of the polygon triangles.
 */
function Normal(__model__, entities, scale) {
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    // --- Error Check ---
    const fn_name = 'calc.Normal';
    let ents_arr;
    if (__model__.debug) {
        ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], null);
        chk.checkArgs(fn_name, 'scale', scale, [chk.isNum]);
    }
    else {
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    return _normal(__model__, ents_arr, scale);
}
exports.Normal = Normal;
function _normal(__model__, ents_arr, scale) {
    if (arrs_1.getArrDepth(ents_arr) === 1) {
        const ent_type = ents_arr[0];
        const index = ents_arr[1];
        if (ent_type === common_1.EEntType.PGON) {
            const norm_vec = __model__.modeldata.geom.query.getPgonNormal(index);
            return vectors_1.vecMult(norm_vec, scale);
        }
        else if (ent_type === common_1.EEntType.PLINE) {
            const norm_vec = __model__.modeldata.geom.query.getWireNormal(__model__.modeldata.geom.nav.navPlineToWire(index));
            return vectors_1.vecMult(norm_vec, scale);
        }
        else if (ent_type === common_1.EEntType.WIRE) {
            const norm_vec = __model__.modeldata.geom.query.getWireNormal(index);
            return vectors_1.vecMult(norm_vec, scale);
        }
        else if (ent_type === common_1.EEntType.EDGE) {
            const verts_i = __model__.modeldata.geom.nav.navEdgeToVert(index);
            const norm_vecs = verts_i.map(vert_i => _vertNormal(__model__, vert_i));
            const norm_vec = vectors_1.vecDiv(vectors_1.vecSum(norm_vecs), norm_vecs.length);
            return vectors_1.vecMult(norm_vec, scale);
        }
        else if (ent_type === common_1.EEntType.VERT) {
            const norm_vec = _vertNormal(__model__, index);
            return vectors_1.vecMult(norm_vec, scale);
        }
        else if (ent_type === common_1.EEntType.POSI) {
            const verts_i = __model__.modeldata.geom.nav.navPosiToVert(index);
            if (verts_i.length > 0) {
                const norm_vecs = verts_i.map(vert_i => _vertNormal(__model__, vert_i));
                const norm_vec = vectors_1.vecDiv(vectors_1.vecSum(norm_vecs), norm_vecs.length);
                return vectors_1.vecMult(norm_vec, scale);
            }
            return [0, 0, 0];
        }
        else if (ent_type === common_1.EEntType.POINT) {
            return [0, 0, 0];
        }
    }
    else {
        return ents_arr.map(ent_arr => _normal(__model__, ent_arr, scale));
    }
}
exports._normal = _normal;
function _vertNormal(__model__, index) {
    let norm_vec;
    const edges_i = __model__.modeldata.geom.nav.navVertToEdge(index);
    if (edges_i.length === 1) {
        const posis0_i = __model__.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.EDGE, edges_i[0]);
        const posis1_i = __model__.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.EDGE, edges_i[1]);
        const p_mid = __model__.modeldata.attribs.posis.getPosiCoords(posis0_i[1]); // same as posis1_i[0]
        const p_a = __model__.modeldata.attribs.posis.getPosiCoords(posis0_i[0]);
        const p_b = __model__.modeldata.attribs.posis.getPosiCoords(posis1_i[1]);
        norm_vec = vectors_1.vecCross(vectors_1.vecFromTo(p_mid, p_a), vectors_1.vecFromTo(p_mid, p_b), true);
        if (vectors_1.vecLen(norm_vec) > 0) {
            return norm_vec;
        }
    }
    const wire_i = __model__.modeldata.geom.nav.navEdgeToWire(edges_i[0]);
    norm_vec = __model__.modeldata.geom.query.getWireNormal(wire_i);
    return norm_vec;
}
// ================================================================================================
/**
 * Calculates the xyz coord along an edge, wire, or polyline given a t parameter.
 *
 * The 't' parameter varies between 0 and 1, where 0 indicates the start and 1 indicates the end.
 * For example, given a polyline,
 * evaluating at t=0 gives that xyz at the start,
 * evaluating at t=0.5 gives the xyz halfway along the polyline,
 * evaluating at t=1 gives the xyz at the end of the polyline.
 *
 * Given a single edge, wire, or polyline, a single xyz coord will be returned.
 *
 * Given a list of edges, wires, or polylines, a list of xyz coords will be returned.
 *
 * Given any entity that has wires (faces, polygons and collections),
 * a list of wires will be extracted, and a list of coords will be returned.
 *
 * @param __model__
 * @param entities Single or list of edges, wires, polylines, or faces, polygons, or collections.
 * @param t_param A value between 0 to 1.
 * @returns The coordinates [x, y, z], or a list of coordinates.
 * @example coord1 = calc.Eval (polyline1, 0.23)
 */
function Eval(__model__, entities, t_param) {
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    // --- Error Check ---
    const fn_name = 'calc.Eval';
    let ents_arrs;
    if (__model__.debug) {
        ents_arrs = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], [common_1.EEntType.EDGE, common_1.EEntType.WIRE, common_1.EEntType.PLINE, common_1.EEntType.PGON, common_1.EEntType.COLL]);
        chk.checkArgs(fn_name, 'param', t_param, [chk.isNum01]);
    }
    else {
        ents_arrs = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    return _eval(__model__, ents_arrs, t_param);
}
exports.Eval = Eval;
function _eval(__model__, ents_arr, t_param) {
    if (arrs_1.getArrDepth(ents_arr) === 1) {
        const [ent_type, index] = ents_arr;
        if (ent_type === common_1.EEntType.EDGE || ent_type === common_1.EEntType.WIRE || ent_type === common_1.EEntType.PLINE) {
            const edges_i = __model__.modeldata.geom.nav.navAnyToEdge(ent_type, index);
            const num_edges = edges_i.length;
            // get all the edge lengths
            let total_dist = 0;
            const dists = [];
            const xyz_pairs = [];
            for (const edge_i of edges_i) {
                const posis_i = __model__.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.EDGE, edge_i);
                const xyz_0 = __model__.modeldata.attribs.posis.getPosiCoords(posis_i[0]);
                const xyz_1 = __model__.modeldata.attribs.posis.getPosiCoords(posis_i[1]);
                const dist = distance_1.distance(xyz_0, xyz_1);
                total_dist += dist;
                dists.push(total_dist);
                xyz_pairs.push([xyz_0, xyz_1]);
            }
            // map the t_param
            const t_param_mapped = t_param * total_dist;
            // loop through and find the point
            for (let i = 0; i < num_edges; i++) {
                if (t_param_mapped < dists[i]) {
                    const xyz_pair = xyz_pairs[i];
                    let dist_a = 0;
                    if (i > 0) {
                        dist_a = dists[i - 1];
                    }
                    const dist_b = dists[i];
                    const edge_length = dist_b - dist_a;
                    const to_t = t_param_mapped - dist_a;
                    const vec_len = to_t / edge_length;
                    return vectors_1.vecAdd(xyz_pair[0], vectors_1.vecMult(vectors_1.vecSub(xyz_pair[1], xyz_pair[0]), vec_len));
                }
            }
            // t param must be 1 (or greater)
            return xyz_pairs[num_edges - 1][1];
        }
        else {
            const wires_i = __model__.modeldata.geom.nav.navAnyToWire(ent_type, index);
            const wires_arrs = wires_i.map(wire_i => [common_1.EEntType.WIRE, wire_i]);
            return wires_arrs.map(wires_arr => _eval(__model__, wires_arr, t_param));
        }
    }
    else {
        return ents_arr.map(ent_arr => _eval(__model__, ent_arr, t_param));
    }
}
// ================================================================================================
/**
 * Returns a ray for an edge or a polygons.
 *
 * For edges, it returns a ray along the edge, from the start vertex to the end vertex
 *
 * For a polygon, it returns the ray that is the z-axis of the plane.
 *
 * For an edge, the ray vector is not normalised. For a polygon, the ray vector is normalised.
 *
 * @param __model__
 * @param entities An edge, a wirea polygon, or a list.
 * @returns The ray.
 */
function Ray(__model__, entities) {
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    // --- Error Check ---
    const fn_name = 'calc.Ray';
    let ents_arr;
    if (__model__.debug) {
        ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1, _check_ids_1.ID.isIDL2], [common_1.EEntType.EDGE, common_1.EEntType.WIRE, common_1.EEntType.PLINE, common_1.EEntType.PGON]);
    }
    else {
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    return _getRay(__model__, ents_arr);
}
exports.Ray = Ray;
function _getRayFromEdge(__model__, ent_arr) {
    const posis_i = __model__.modeldata.geom.nav.navAnyToPosi(ent_arr[0], ent_arr[1]);
    const xyzs = posis_i.map(posi_i => __model__.modeldata.attribs.posis.getPosiCoords(posi_i));
    return [xyzs[0], vectors_1.vecSub(xyzs[1], xyzs[0])];
}
function _getRayFromPgon(__model__, ent_arr) {
    const plane = _getPlane(__model__, ent_arr);
    return _ray_1.rayFromPln(false, plane);
}
function _getRayFromEdges(__model__, ent_arr) {
    const edges_i = __model__.modeldata.geom.nav.navAnyToEdge(ent_arr[0], ent_arr[1]);
    return edges_i.map(edge_i => _getRayFromEdge(__model__, [common_1.EEntType.EDGE, edge_i]));
}
function _getRay(__model__, ents_arr) {
    if (arrs_1.getArrDepth(ents_arr) === 1) {
        const ent_arr = ents_arr;
        if (ent_arr[0] === common_1.EEntType.EDGE) {
            return _getRayFromEdge(__model__, ent_arr);
        }
        else if (ent_arr[0] === common_1.EEntType.PLINE || ent_arr[0] === common_1.EEntType.WIRE) {
            return _getRayFromEdges(__model__, ent_arr);
        }
        else if (ent_arr[0] === common_1.EEntType.PGON) {
            return _getRayFromPgon(__model__, ent_arr);
        }
    }
    else {
        return ents_arr.map(ent_arr => _getRay(__model__, ent_arr));
    }
}
// ================================================================================================
/**
 * Returns a plane from a polygon, a face, a polyline, or a wire.
 * For polylines or wires, there must be at least three non-colinear vertices.
 *
 * The winding order is counter-clockwise.
 * This means that if the vertices are ordered counter-clockwise relative to your point of view,
 * then the z axis of the plane will be pointing towards you.
 *
 * @param entities Any entities
 * @returns The plane.
 */
function Plane(__model__, entities) {
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    // --- Error Check ---
    const fn_name = 'calc.Plane';
    let ents_arr;
    if (__model__.debug) {
        ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1, _check_ids_1.ID.isIDL2], null); // takes in any
    }
    else {
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    return _getPlane(__model__, ents_arr);
}
exports.Plane = Plane;
function _getPlane(__model__, ents_arr) {
    if (arrs_1.getArrDepth(ents_arr) === 1) {
        const ent_arr = ents_arr;
        const posis_i = __model__.modeldata.geom.nav.navAnyToPosi(ent_arr[0], ent_arr[1]);
        const unique_posis_i = Array.from(new Set(posis_i));
        if (unique_posis_i.length < 3) {
            throw new Error('Too few points to calculate plane.');
        }
        const unique_xyzs = unique_posis_i.map(posi_i => __model__.modeldata.attribs.posis.getPosiCoords(posi_i));
        const origin = vectors_1.vecDiv(vectors_1.vecSum(unique_xyzs), unique_xyzs.length);
        // const normal: Txyz = newellNorm(unique_xyzs);
        const normal = _normal(__model__, ent_arr, 1);
        const x_vec = vectors_1.vecNorm(vectors_1.vecFromTo(unique_xyzs[0], unique_xyzs[1]));
        const y_vec = vectors_1.vecCross(normal, x_vec); // must be z-axis, x-axis
        return [origin, x_vec, y_vec];
    }
    else {
        return ents_arr.map(ent_arr => _getPlane(__model__, ent_arr));
    }
}
// ================================================================================================
/**
 * Returns the bounding box of the entities.
 * The bounding box is an imaginary box that completley contains all the geometry.
 * The box is always aligned with the global x, y, and z axes.
 * The bounding box consists of a list of lists, as follows [[x, y, z], [x, y, z], [x, y, z], [x, y, z]].
 *
 * - The first [x, y, z] is the coordinates of the centre of the bounding box.
 * - The second [x, y, z] is the corner of the bounding box with the lowest x, y, z values.
 * - The third [x, y, z] is the corner of the bounding box with the highest x, y, z values.
 * - The fourth [x, y, z] is the dimensions of the bounding box.
 *
 * @param __model__
 * @param entities The etities for which to calculate the bounding box.
 * @returns The bounding box consisting of a list of four lists.
 */
function BBox(__model__, entities) {
    entities = arrs_1.arrMakeFlat(entities);
    // --- Error Check ---
    const fn_name = 'calc.BBox';
    let ents_arr;
    if (__model__.debug) {
        ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isIDL1], null); // all
    }
    else {
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    return _getBoundingBox(__model__, ents_arr);
}
exports.BBox = BBox;
function _getBoundingBox(__model__, ents_arr) {
    const posis_set_i = new Set();
    for (const ent_arr of ents_arr) {
        const ent_posis_i = __model__.modeldata.geom.nav.navAnyToPosi(ent_arr[0], ent_arr[1]);
        for (const ent_posi_i of ent_posis_i) {
            posis_set_i.add(ent_posi_i);
        }
    }
    const unique_posis_i = Array.from(posis_set_i);
    const unique_xyzs = unique_posis_i.map(posi_i => __model__.modeldata.attribs.posis.getPosiCoords(posi_i));
    const corner_min = [Infinity, Infinity, Infinity];
    const corner_max = [-Infinity, -Infinity, -Infinity];
    for (const unique_xyz of unique_xyzs) {
        if (unique_xyz[0] < corner_min[0]) {
            corner_min[0] = unique_xyz[0];
        }
        if (unique_xyz[1] < corner_min[1]) {
            corner_min[1] = unique_xyz[1];
        }
        if (unique_xyz[2] < corner_min[2]) {
            corner_min[2] = unique_xyz[2];
        }
        if (unique_xyz[0] > corner_max[0]) {
            corner_max[0] = unique_xyz[0];
        }
        if (unique_xyz[1] > corner_max[1]) {
            corner_max[1] = unique_xyz[1];
        }
        if (unique_xyz[2] > corner_max[2]) {
            corner_max[2] = unique_xyz[2];
        }
    }
    return [
        [(corner_min[0] + corner_max[0]) / 2, (corner_min[1] + corner_max[1]) / 2, (corner_min[2] + corner_max[2]) / 2],
        corner_min,
        corner_max,
        [corner_max[0] - corner_min[0], corner_max[1] - corner_min[1], corner_max[2] - corner_min[2]]
    ];
}
// ================================================================================================
// /**
//  * Calculates the distance between a ray or plane and a list of positions.
//  *
//  * @param __model__
//  * @param ray_or_plane Ray or a plane.
//  * @param entities A position or list of positions.
//  * @param method Enum; all_distances or min_distance.
//  * @returns Distance, or list of distances.
//  * @example distance1 = virtual.Distance(ray, positions, all_distances)
//  * @example_info Returns a list of distances between the ray and each position.
//  */
// export function Distance(__model__: GIModel, ray_or_plane: TRay|TPlane, entities: TId|TId[], method: _EDistanceMethod): number|number[] {
//     // --- Error Check ---
//     const fn_name = 'virtual.Distance';
//     checkCommTypes(fn_name, 'ray_or_plane', ray_or_plane, [TypeCheckObj.isRay, TypeCheckObj.isPlane]);
//     const ents_arr = checkIDs(__model__, fn_name, 'entities', entities, [IDcheckObj.isID, IDcheckObj.isIDList],
//         [EEntType.POSI]) as TEntTypeIdx|TEntTypeIdx[];
//     // --- Error Check ---
//     const one_posi: boolean = getArrDepth(ents_arr) === 1;
//     // get the to posis_i
//     let posis_i: number|number[] = null;
//     if (one_posi) {
//         posis_i = ents_arr[1] as number;
//     } else {
//         posis_i = (ents_arr as TEntTypeIdx[]).map( ent_arr => ent_arr[1] ) as number[];
//     }
//     // get a list of distances
//     let dists: number|number[] = null;
//     if (ray_or_plane.length === 2) { // ray
//         const ray_tjs: THREE.Ray = new THREE.Ray(new THREE.Vector3(...ray_or_plane[0]), new THREE.Vector3(...ray_or_plane[1]));
//         dists = _distanceRaytoP(__model__, ray_tjs, posis_i);
//     } else if (ray_or_plane.length === 3) { // plane
//         const plane_normal: Txyz = vecCross(ray_or_plane[1], ray_or_plane[2]);
//         const plane_tjs: THREE.Plane = new THREE.Plane();
//         plane_tjs.setFromNormalAndCoplanarPoint( new THREE.Vector3(...plane_normal), new THREE.Vector3(...ray_or_plane[0]) );
//         dists = _distancePlanetoP(__model__, plane_tjs, posis_i);
//     }
//     // return either the min or the whole list
//     if (method === _EDistanceMethod.MIN_DISTANCE && !one_posi) {
//         return Math.min(...dists as number[]);
//     }
//     return dists;
// }
// function _distanceRaytoP(__model__: GIModel, ray_tjs: THREE.Ray, posis_i: number|number[]): number|number[] {
//     if (!Array.isArray(posis_i)) {
//         const xyz: Txyz = __model__.modeldata.attribs.posis.getPosiCoords(posis_i);
//         return ray_tjs.distanceToPoint( new THREE.Vector3(...xyz) ) as number;
//     } else {
//         return posis_i.map( posi_i => _distanceRaytoP(__model__, ray_tjs, posi_i) ) as number[];
//     }
// }
// function _distancePlanetoP(__model__: GIModel, plane_tjs: THREE.Plane, posis_i: number|number[]): number|number[] {
//     if (!Array.isArray(posis_i)) {
//         const xyz: Txyz = __model__.modeldata.attribs.posis.getPosiCoords(posis_i);
//         return plane_tjs.distanceToPoint( new THREE.Vector3(...xyz) ) as number;
//     } else {
//         return posis_i.map( posi_i => _distancePlanetoP(__model__, plane_tjs, posi_i) ) as number[];
//     }
// }
// export enum _EDistanceMethod {
//     ALL_DISTANCES = 'all_distances',
//     MIN_DISTANCE = 'min_distance'
// }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2dlbl9ldmFsX3Byb2Nlc3NfYmFja2VuZC9zcmMvY29yZS9tb2R1bGVzL2Jhc2ljL2NhbGMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0dBSUc7Ozs7Ozs7Ozs7OztBQUVIOztHQUVHO0FBQ0gsaURBQWdEO0FBRWhELHdEQUEwQztBQUcxQyxrREFBbUc7QUFDbkcsMkVBQWlFO0FBQ2pFLGtEQUErQztBQUMvQyxnREFBc0k7QUFDdEksK0RBQTREO0FBQzVELGtEQUEyQztBQUMzQyw0REFBZ0M7QUFDaEMsdUNBQXlEO0FBQ3pELG1EQUFzRDtBQUN0RCxpREFBMkY7QUFFM0YsbUdBQW1HO0FBQ25HLElBQVksZ0JBSVg7QUFKRCxXQUFZLGdCQUFnQjtJQUN4Qix3REFBb0MsQ0FBQTtJQUNwQyxzREFBa0MsQ0FBQTtJQUNsQyxzREFBa0MsQ0FBQTtBQUN0QyxDQUFDLEVBSlcsZ0JBQWdCLEdBQWhCLHdCQUFnQixLQUFoQix3QkFBZ0IsUUFJM0I7QUFDRDs7Ozs7Ozs7OztHQVVHO0FBQ0gsU0FBZ0IsUUFBUSxDQUFDLFNBQWtCLEVBQUUsU0FBb0IsRUFBRSxTQUFvQixFQUFFLE1BQXdCO0lBQzdHLElBQUksaUJBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRTtRQUFFLE9BQU8sRUFBRSxDQUFDO0tBQUU7SUFDekMsSUFBSSxpQkFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1FBQUUsT0FBTyxFQUFFLENBQUM7S0FBRTtJQUN6QyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUU7UUFBRSxTQUFTLEdBQUcsa0JBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUFFO0lBQ3JFLFNBQVMsR0FBRyxrQkFBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ25DLHNCQUFzQjtJQUN0QixNQUFNLE9BQU8sR0FBRyxlQUFlLENBQUM7SUFDaEMs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