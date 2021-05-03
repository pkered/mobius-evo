"use strict";
/**
 * The `intersect` module has functions for calculating intersections between different types of entities.
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
const chk = __importStar(require("../../_check_types"));
const common_1 = require("@libs/geo-info/common");
const common_id_funcs_1 = require("@assets/libs/geo-info/common_id_funcs");
const arrs_1 = require("@assets/libs/util/arrs");
const vectors_1 = require("@libs/geom/vectors");
const THREE = __importStar(require("three"));
// ================================================================================================
/**
 * Calculates the xyz intersection between a ray and one or more polygons.
 * \n
 * The intersection between each polygon face triangle and the ray is caclulated.
 * This ignores the intersections between rays and edges (including polyline edges).
 * \n
 * @param __model__
 * @param ray A ray.
 * @param entities A polygon or list of polygons.
 * @return A list of xyz intersection coordinates.
 * @example coords = intersect.RayFace(ray, polygon1)
 * @example_info Returns a list of coordinates where the ray  intersects with the polygon.
 */
function RayFace(__model__, ray, entities) {
    // --- Error Check ---
    const fn_name = 'intersect.RayFace';
    let ents_arr;
    if (__model__.debug) {
        chk.checkArgs(fn_name, 'ray', ray, [chk.isRay]);
        ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], [common_1.EEntType.PGON, common_1.EEntType.COLL]);
    }
    else {
        // ents_arr = splitIDs(fn_name, 'entities', entities,
        //     [IDcheckObj.isID, IDcheckObj.isIDList],
        //     [EEntType.FACE, EEntType.PGON, EEntType.COLL]) as TEntTypeIdx|TEntTypeIdx[];
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    // create the threejs entity and calc intersections
    const ray_tjs = new THREE.Ray(new THREE.Vector3(...ray[0]), new THREE.Vector3(...ray[1]));
    return _intersectRay(__model__, ents_arr, ray_tjs);
}
exports.RayFace = RayFace;
function _intersectRay(__model__, ents_arr, ray_tjs) {
    if (arrs_1.getArrDepth(ents_arr) === 1) {
        const [ent_type, index] = ents_arr;
        const posis_i = __model__.modeldata.geom.nav.navAnyToPosi(ent_type, index);
        const posis_tjs = [];
        for (const posi_i of posis_i) {
            const xyz = __model__.modeldata.attribs.posis.getPosiCoords(posi_i);
            const posi_tjs = new THREE.Vector3(...xyz);
            posis_tjs[posi_i] = posi_tjs;
        }
        const isect_xyzs = [];
        // triangles
        const pgons_i = __model__.modeldata.geom.nav.navAnyToPgon(ent_type, index);
        const tris_i = [];
        for (const pgon_i of pgons_i) {
            for (const tri_i of __model__.modeldata.geom.nav_tri.navPgonToTri(pgon_i)) {
                tris_i.push(tri_i);
            }
        }
        for (const tri_i of tris_i) {
            const tri_posis_i = __model__.modeldata.geom.nav_tri.navTriToPosi(tri_i);
            const tri_posis_tjs = tri_posis_i.map(tri_posi_i => posis_tjs[tri_posi_i]);
            const isect_tjs = new THREE.Vector3();
            const result = ray_tjs.intersectTriangle(tri_posis_tjs[0], tri_posis_tjs[1], tri_posis_tjs[2], false, isect_tjs);
            if (result !== undefined && result !== null) {
                isect_xyzs.push([isect_tjs.x, isect_tjs.y, isect_tjs.z]);
            }
        }
        // return the intersection xyzs
        return isect_xyzs;
    }
    else {
        const all_isect_xyzs = [];
        for (const ent_arr of ents_arr) {
            const isect_xyzs = _intersectRay(__model__, ent_arr, ray_tjs);
            for (const isect_xyz of isect_xyzs) {
                all_isect_xyzs.push(isect_xyz);
            }
        }
        return all_isect_xyzs;
    }
}
// ================================================================================================
/**
 * Calculates the xyz intersection between a plane and a list of edges.
 * \n
 * This ignores the intersections between planes and polygon face triangles.
 * \n
 * @param __model__
 * @param plane A plane.
 * @param entities An edge or list of edges, or entities from which edges can be extracted.
 * @return A list of xyz intersection coordinates.
 * @example coords = intersect.PlaneEdge(plane, polyline1)
 * @example_info Returns a list of coordinates where the plane intersects with the edges of polyline1.
 */
function PlaneEdge(__model__, plane, entities) {
    // --- Error Check ---
    const fn_name = 'intersect.PlaneEdge';
    let ents_arr;
    if (__model__.debug) {
        chk.checkArgs(fn_name, 'plane', plane, [chk.isPln]);
        ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], [common_1.EEntType.EDGE, common_1.EEntType.WIRE, common_1.EEntType.PLINE, common_1.EEntType.PGON, common_1.EEntType.COLL]);
    }
    else {
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    // create the threejs entity and calc intersections
    const plane_normal = vectors_1.vecCross(plane[1], plane[2]);
    const plane_tjs = new THREE.Plane();
    plane_tjs.setFromNormalAndCoplanarPoint(new THREE.Vector3(...plane_normal), new THREE.Vector3(...plane[0]));
    return _intersectPlane(__model__, ents_arr, plane_tjs);
}
exports.PlaneEdge = PlaneEdge;
/**
 * Recursive intersect
 * @param __model__
 * @param ents_arr
 * @param plane_tjs
 */
function _intersectPlane(__model__, ents_arr, plane_tjs) {
    if (arrs_1.getArrDepth(ents_arr) === 1) {
        const [ent_type, ent_i] = ents_arr;
        if (ent_type === common_1.EEntType.EDGE) {
            return _intersectPlaneEdge(__model__, ent_i, plane_tjs);
        }
        else if (ent_type < common_1.EEntType.EDGE) {
            const edges_i = __model__.modeldata.geom.nav.navAnyToEdge(ent_type, ent_i);
            const edges_isect_xyzs = [];
            for (const edge_i of edges_i) {
                const edge_isect_xyzs = _intersectPlaneEdge(__model__, edge_i, plane_tjs);
                for (const edge_isect_xyz of edge_isect_xyzs) {
                    edges_isect_xyzs.push(edge_isect_xyz);
                }
            }
            return edges_isect_xyzs;
        }
        else {
            const wires_i = __model__.modeldata.geom.nav.navAnyToWire(ent_type, ent_i);
            const wires_isect_xyzs = [];
            for (const wire_i of wires_i) {
                const wire_isect_xyzs = _intersectPlaneWire(__model__, wire_i, plane_tjs);
                for (const wire_isect_xyz of wire_isect_xyzs) {
                    wires_isect_xyzs.push(wire_isect_xyz);
                }
            }
            return wires_isect_xyzs;
        }
    }
    else {
        const all_isect_xyzs = [];
        for (const ent_arr of ents_arr) {
            const isect_xyzs = _intersectPlane(__model__, ent_arr, plane_tjs);
            for (const isect_xyz of isect_xyzs) {
                all_isect_xyzs.push(isect_xyz);
            }
        }
        return all_isect_xyzs;
    }
}
/**
 * Calc intersection between a plane and a wire.
 * @param __model__
 * @param wire_i
 * @param plane_tjs
 */
function _intersectPlaneWire(__model__, wire_i, plane_tjs) {
    const isect_xyzs = [];
    const wire_posis_i = __model__.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.WIRE, wire_i);
    // create threejs posis for all posis
    const posis_tjs = [];
    for (const wire_posi_i of wire_posis_i) {
        const xyz = __model__.modeldata.attribs.posis.getPosiCoords(wire_posi_i);
        const posi_tjs = new THREE.Vector3(...xyz);
        posis_tjs.push(posi_tjs);
    }
    if (__model__.modeldata.geom.query.isWireClosed(wire_i)) {
        posis_tjs.push(posis_tjs[0]);
    }
    // for each pair of posis, create a threejs line and do the intersect
    for (let i = 0; i < posis_tjs.length - 1; i++) {
        const line_tjs = new THREE.Line3(posis_tjs[i], posis_tjs[i + 1]);
        const isect_tjs = new THREE.Vector3();
        const result = plane_tjs.intersectLine(line_tjs, isect_tjs);
        if (result !== undefined && result !== null) {
            isect_xyzs.push([isect_tjs.x, isect_tjs.y, isect_tjs.z]);
        }
    }
    return isect_xyzs;
}
/**
 * Calc intersection between a plane and a single edge.
 * @param __model__
 * @param edge_i
 * @param plane_tjs
 */
function _intersectPlaneEdge(__model__, edge_i, plane_tjs) {
    const edge_posis_i = __model__.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.EDGE, edge_i);
    // create threejs posis for all posis
    const xyz0 = __model__.modeldata.attribs.posis.getPosiCoords(edge_posis_i[0]);
    const xyz1 = __model__.modeldata.attribs.posis.getPosiCoords(edge_posis_i[1]);
    const posi0_tjs = new THREE.Vector3(...xyz0);
    const posi1_tjs = new THREE.Vector3(...xyz1);
    // for each pair of posis, create a threejs line and do the intersect
    const line_tjs = new THREE.Line3(posi0_tjs, posi1_tjs);
    const isect_tjs = new THREE.Vector3();
    const result = plane_tjs.intersectLine(line_tjs, isect_tjs);
    if (result !== undefined && result !== null) {
        return [[isect_tjs.x, isect_tjs.y, isect_tjs.z]];
    }
    return [];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJzZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdHMvc3JjL2NvcmUvbW9kdWxlcy9iYXNpYy9pbnRlcnNlY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOzs7Ozs7Ozs7QUFFSDs7R0FFRztBQUNILGlEQUFnRDtBQUVoRCx3REFBMEM7QUFFMUMsa0RBQXVGO0FBRXZGLDJFQUFpRTtBQUNqRSxpREFBcUQ7QUFDckQsZ0RBQTZDO0FBRTdDLDZDQUErQjtBQUUvQixtR0FBbUc7QUFDbkc7Ozs7Ozs7Ozs7OztHQVlHO0FBQ0gsU0FBZ0IsT0FBTyxDQUFDLFNBQWtCLEVBQUUsR0FBUyxFQUFFLFFBQW1CO0lBQ3RFLHNCQUFzQjtJQUN0QixNQUFNLE9BQU8sR0FBRyxtQkFBbUIsQ0FBQztJQUNwQyxJQUFJLFFBQW1DLENBQUM7SUFDeEMsSUFBSSxTQUFTLENBQUMsS0FBSyxFQUFFO1FBQ2pCLEdBQUcsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNoRCxRQUFRLEdBQUcscUJBQVEsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQ3hELENBQUMsZUFBRSxDQUFDLElBQUksRUFBRSxlQUFFLENBQUMsTUFBTSxDQUFDLEVBQ3BCLENBQUMsaUJBQVEsQ0FBQyxJQUFJLEVBQUUsaUJBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBOEIsQ0FBQztLQUNwRTtTQUFNO1FBQ0gscURBQXFEO1FBQ3JELDhDQUE4QztRQUM5QyxtRkFBbUY7UUFDbkYsUUFBUSxHQUFHLDBCQUFRLENBQUMsUUFBUSxDQUE4QixDQUFDO0tBQzlEO0lBQ0Qsc0JBQXNCO0lBQ3RCLG1EQUFtRDtJQUNuRCxNQUFNLE9BQU8sR0FBYyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxD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