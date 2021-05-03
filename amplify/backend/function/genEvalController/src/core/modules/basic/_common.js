"use strict";
/**
 * Shared utility functions
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
const _check_ids_1 = require("../../_check_ids");
const common_1 = require("@libs/geo-info/common");
const arrs_1 = require("@assets/libs/util/arrs");
const vectors_1 = require("@assets/libs/geom/vectors");
const common_func_1 = require("@assets/libs/geo-info/common_func");
const _ray_1 = require("@assets/core/inline/_ray");
const _plane_1 = require("@assets/core/inline/_plane");
const THREE = __importStar(require("three"));
const EPS = 1e-8;
// ================================================================================================
function getOrigin(__model__, data, fn_name) {
    if (common_func_1.isXYZ(data)) {
        return data;
    }
    if (common_func_1.isRay(data)) {
        return data[0];
    }
    if (common_func_1.isPlane(data)) {
        return data[0];
    }
    const ents = data;
    const origin = getCentoridFromEnts(__model__, ents, fn_name);
    return origin;
}
exports.getOrigin = getOrigin;
// ================================================================================================
function getRay(__model__, data, fn_name) {
    if (common_func_1.isXYZ(data)) {
        return [data, [0, 0, 1]];
    }
    if (common_func_1.isRay(data)) {
        return data;
    }
    if (common_func_1.isPlane(data)) {
        return _ray_1.rayFromPln(false, data);
    }
    const ents = data;
    const origin = getCentoridFromEnts(__model__, ents, fn_name);
    return [origin, [0, 0, 1]];
}
exports.getRay = getRay;
// ================================================================================================
function getPlane(__model__, data, fn_name) {
    if (common_func_1.isXYZ(data)) {
        return [data, [1, 0, 0], [0, 1, 0]];
    }
    if (common_func_1.isRay(data)) {
        return _plane_1.plnFromRay(false, data);
    }
    if (common_func_1.isPlane(data)) {
        return data;
    }
    const ents = data;
    const origin = getCentoridFromEnts(__model__, ents, fn_name);
    return [origin, [1, 0, 0], [0, 1, 0]];
}
exports.getPlane = getPlane;
// ================================================================================================
function getCentoridFromEnts(__model__, ents, fn_name) {
    // this must be an ID or an array of IDs, so lets get the centroid
    // TODO this error message is confusing
    const ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'ents', ents, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], [common_1.EEntType.POSI, common_1.EEntType.VERT, common_1.EEntType.POINT, common_1.EEntType.EDGE, common_1.EEntType.WIRE,
        common_1.EEntType.PLINE, common_1.EEntType.PGON, common_1.EEntType.COLL]);
    const centroid = getCentroid(__model__, ents_arr);
    if (Array.isArray(centroid[0])) {
        return vectors_1.vecAvg(centroid);
    }
    return centroid;
}
exports.getCentoridFromEnts = getCentoridFromEnts;
// ================================================================================================
function getCentroid(__model__, ents_arr) {
    if (arrs_1.getArrDepth(ents_arr) === 1) {
        const [ent_type, index] = ents_arr;
        const posis_i = __model__.modeldata.geom.nav.navAnyToPosi(ent_type, index);
        return _centroidPosis(__model__, posis_i);
    }
    else {
        // divide the input into posis and non posis
        ents_arr = ents_arr;
        const posis_i = [];
        const np_ents_arr = [];
        for (const ent_arr of ents_arr) {
            if (ent_arr[0] === common_1.EEntType.POSI) {
                posis_i.push(ent_arr[1]);
            }
            else {
                np_ents_arr.push(ent_arr);
            }
        }
        // if we only have posis, just return one centorid
        // in all other cases return a list of centroids
        const np_cents = np_ents_arr.map(ent_arr => getCentroid(__model__, ent_arr));
        if (posis_i.length > 0) {
            const cen_posis = _centroidPosis(__model__, posis_i);
            if (np_cents.length === 0) {
                return cen_posis;
            }
            else {
                np_cents.push(cen_posis);
            }
        }
        return np_cents;
    }
}
exports.getCentroid = getCentroid;
function _centroidPosis(__model__, posis_i) {
    const unique_posis_i = Array.from(new Set(posis_i));
    const unique_xyzs = unique_posis_i.map(posi_i => __model__.modeldata.attribs.posis.getPosiCoords(posi_i));
    return vectors_1.vecDiv(vectors_1.vecSum(unique_xyzs), unique_xyzs.length);
}
// ================================================================================================
function getCenterOfMass(__model__, ents_arr) {
    if (arrs_1.getArrDepth(ents_arr) === 1) {
        const [ent_type, ent_i] = ents_arr;
        const pgons_i = __model__.modeldata.geom.nav.navAnyToPgon(ent_type, ent_i);
        if (pgons_i.length === 0) {
            return null;
        }
        return _centerOfMass(__model__, pgons_i);
    }
    else {
        const cents = [];
        ents_arr = ents_arr;
        for (const [ent_type, ent_i] of ents_arr) {
            const pgons_i = __model__.modeldata.geom.nav.navAnyToPgon(ent_type, ent_i);
            if (pgons_i.length === 0) {
                cents.push(null);
            }
            cents.push(_centerOfMass(__model__, pgons_i));
        }
        return cents;
    }
}
exports.getCenterOfMass = getCenterOfMass;
function _centerOfMass(__model__, pgons_i) {
    const face_midpoints = [];
    const face_areas = [];
    let total_area = 0;
    for (const face_i of pgons_i) {
        const [midpoint_xyz, area] = _centerOfMassOfPgon(__model__, face_i);
        face_midpoints.push(midpoint_xyz);
        face_areas.push(area);
        total_area += area;
    }
    const cent = [0, 0, 0];
    for (let i = 0; i < face_midpoints.length; i++) {
        const weight = face_areas[i] / total_area;
        cent[0] = cent[0] + face_midpoints[i][0] * weight;
        cent[1] = cent[1] + face_midpoints[i][1] * weight;
        cent[2] = cent[2] + face_midpoints[i][2] * weight;
    }
    return cent;
}
function _centerOfMassOfPgon(__model__, pgon_i) {
    const tri_midpoints = [];
    const tri_areas = [];
    let total_area = 0;
    const map_posi_to_v3 = new Map();
    for (const tri_i of __model__.modeldata.geom.nav_tri.navPgonToTri(pgon_i)) {
        const posis_i = __model__.modeldata.geom.nav_tri.navTriToPosi(tri_i);
        const posis_v3 = [];
        for (const posi_i of posis_i) {
            let posi_v3 = map_posi_to_v3.get(posi_i);
            if (posi_v3 === undefined) {
                const xyz = __model__.modeldata.attribs.posis.getPosiCoords(posi_i);
                posi_v3 = new THREE.Vector3(xyz[0], xyz[1], xyz[2]);
            }
            posis_v3.push(posi_v3);
        }
        const tri_tjs = new THREE.Triangle(posis_v3[0], posis_v3[1], posis_v3[2]);
        let midpoint;
        midpoint = tri_tjs.getMidpoint(midpoint);
        const midpoint_xyz = [midpoint.x, midpoint.y, midpoint.z];
        const area = tri_tjs.getArea();
        tri_midpoints.push(midpoint_xyz);
        tri_areas.push(area);
        total_area += area;
    }
    const cent = [0, 0, 0];
    for (let i = 0; i < tri_midpoints.length; i++) {
        const weight = tri_areas[i] / total_area;
        cent[0] = cent[0] + tri_midpoints[i][0] * weight;
        cent[1] = cent[1] + tri_midpoints[i][1] * weight;
        cent[2] = cent[2] + tri_midpoints[i][2] * weight;
    }
    return [cent, total_area];
}
// ================================================================================================
// used by sweep
// TODO update offset code to use this as well
/* Function to get a set of planes along the length of a wire.
 * The planes are orientated perpendicular to the wire.
 *
 */
function getPlanesSeq(xyzs, normal, close) {
    normal = vectors_1.vecNorm(normal);
    // if closed, add a posi to the end
    if (close) {
        xyzs.splice(0, 0, xyzs[xyzs.length - 1]);
        xyzs.push(xyzs[1]);
    }
    // get the perp vectors
    let perp_vec = null;
    let has_bad_edges = false;
    const perp_vecs = []; // normalise dvectors
    for (let i = 0; i < xyzs.length - 1; i++) {
        const xyz0 = xyzs[i];
        const xyz1 = xyzs[i + 1];
        const edge_vec = vectors_1.vecFromTo(xyz0, xyz1);
        if (vectors_1.vecLen(edge_vec) > 0) {
            perp_vec = vectors_1.vecCross(vectors_1.vecNorm(edge_vec), normal);
        }
        else {
            perp_vec = null;
            has_bad_edges = true;
        }
        perp_vecs.push(perp_vec);
    }
    // fix any bad pairs, by setting the perp vec to its next neighbour
    if (has_bad_edges) {
        if (perp_vecs[perp_vecs.length - 1] === null) {
            throw new Error('Error: could not process wire.');
        }
        for (let i = perp_vecs.length - 1; i >= 0; i--) {
            if (perp_vecs[i] === null) {
                perp_vecs[i] = perp_vec;
            }
            else {
                perp_vec = perp_vecs[i];
            }
        }
    }
    // array for planes
    const planes = [];
    // if not closed, we need to deal with the first and last planes
    if (!close) {
        // first plane
        const first_xyz = xyzs[0];
        const x_axis = perp_vecs[0];
        const first2_perp_vec = perp_vecs[1];
        let y_axis = normal;
        if (vectors_1.vecDot(x_axis, first2_perp_vec) < EPS) { // TODOD < what is a good value for this?
            y_axis = vectors_1.vecCross(x_axis, first2_perp_vec);
        }
        const first_plane = [first_xyz, x_axis, y_axis];
        planes.push(first_plane);
    }
    // loop through all the edges and create a plane at the end of the edge
    for (let i = 0; i < perp_vecs.length - 1; i++) {
        // get the xyz
        const xyz = xyzs[i + 1];
        // get the two perpendicular vectors
        const this_perp_vec = perp_vecs[i];
        const next_perp_vec = perp_vecs[i + 1];
        // calc the local norm
        let y_axis = normal;
        if (vectors_1.vecDot(this_perp_vec, next_perp_vec) < EPS) { // TODOD < what is a good value for this?
            y_axis = vectors_1.vecCross(this_perp_vec, next_perp_vec);
        }
        // calc the offset vector
        let x_axis = vectors_1.vecNorm(vectors_1.vecAdd(this_perp_vec, next_perp_vec));
        const dot = vectors_1.vecDot(this_perp_vec, x_axis);
        const vec_len = 1 / dot;
        x_axis = vectors_1.vecSetLen(x_axis, vec_len);
        // create the plane
        const plane = [xyz, x_axis, y_axis];
        planes.push(plane);
    }
    // if not closed, we need to deal with the first and last planes
    if (!close) {
        // last plane
        const last_xyz = xyzs[xyzs.length - 1];
        const x_axis = perp_vecs[perp_vecs.length - 1];
        const last2_perp_vec = perp_vecs[perp_vecs.length - 2];
        let y_axis = normal;
        if (vectors_1.vecDot(last2_perp_vec, x_axis) < EPS) { // TODOD < what is a good value for this?
            y_axis = vectors_1.vecCross(last2_perp_vec, x_axis);
        }
        const last_plane = [last_xyz, x_axis, y_axis];
        planes.push(last_plane);
    }
    // return the planes
    return planes;
}
exports.getPlanesSeq = getPlanesSeq;
// ================================================================================================
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2NvbW1vbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3RzL3NyYy9jb3JlL21vZHVsZXMvYmFzaWMvX2NvbW1vbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7OztBQUVIOztHQUVHO0FBQ0gsaURBQWdEO0FBR2hELGtEQUF1RjtBQUN2RixpREFBcUQ7QUFDckQsdURBQW9JO0FBQ3BJLG1FQUEwRTtBQUMxRSxtREFBc0Q7QUFDdEQsdURBQXdEO0FBQ3hELDZDQUErQjtBQUMvQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUM7QUFFakIsbUdBQW1HO0FBQ25HLFNBQWdCLFNBQVMsQ0FBQyxTQUFrQixFQUFFLElBQWdDLEVBQUUsT0FBZTtJQUMzRixJQUFJLG1CQUFLLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFBRSxPQUFPLElBQVksQ0FBQztLQUFFO0lBQ3pDLElBQUksbUJBQUssQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBUyxDQUFDO0tBQUU7SUFDNUMsSUFBSSxxQkFBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFTLENBQUM7S0FBRTtJQUM5QyxNQUFNLElBQUksR0FBYyxJQUFpQixDQUFDO0lBQzFDLE1BQU0sTUFBTSxHQUFTLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbkUsT0FBTyxNQUFjLENBQUM7QUFDMUIsQ0FBQztBQVBELDhCQU9DO0FBQ0QsbUdBQW1HO0FBQ25HLFNBQWdCLE1BQU0sQ0FBQyxTQUFrQixFQUFFLElBQWdDLEVBQUUsT0FBZTtJQUN4RixJQUFJLG1CQUFLLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBUyxDQUFDO0tBQUU7SUFDdEQs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