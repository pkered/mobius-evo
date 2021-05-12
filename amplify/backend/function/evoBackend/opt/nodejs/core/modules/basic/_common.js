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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2NvbW1vbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2dlbl9ldmFsX3Byb2Nlc3NfYmFja2VuZC9zcmMvY29yZS9tb2R1bGVzL2Jhc2ljL19jb21tb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOzs7Ozs7Ozs7QUFFSDs7R0FFRztBQUNILGlEQUFnRDtBQUdoRCxrREFBdUY7QUFDdkYsaURBQXFEO0FBQ3JELHVEQUFvSTtBQUNwSSxtRUFBMEU7QUFDMUUsbURBQXNEO0FBQ3RELHVEQUF3RDtBQUN4RCw2Q0FBK0I7QUFDL0IsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDO0FBRWpCLG1HQUFtRztBQUNuRyxTQUFnQixTQUFTLENBQUMsU0FBa0IsRUFBRSxJQUFnQyxFQUFFLE9BQWU7SUFDM0YsSUFBSSxtQkFBSyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQUUsT0FBTyxJQUFZLENBQUM7S0FBRTtJQUN6QyxJQUFJLG1CQUFLLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFBRSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQVMsQ0FBQztLQUFFO0lBQzVDLElBQUkscUJBQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBUyxDQUFDO0tBQUU7SUFDOUMsTUFBTSxJQUFJLEdBQWMsSUFBaUIsQ0FBQztJQUMxQyxNQUFNLE1BQU0sR0FBUyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ25FLE9BQU8sTUFBYyxDQUFDO0FBQzFCLENBQUM7QUFQRCw4QkFPQztBQUNELG1HQUFtRztBQUNuRyxTQUFnQixNQUFNLENBQUMsU0FBa0IsRUFBRSxJQUFnQyxFQUFFLE9BQWU7SUFDeEYsSUFBSSxtQkFBSyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFD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