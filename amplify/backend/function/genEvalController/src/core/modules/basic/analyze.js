"use strict";
/**
 * The `analysis` module has functions for performing various types of analysis with entities in the model.
 * These functions all return dictionaries containing the results of the analysis.
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
const underscore_1 = __importDefault(require("underscore"));
const arrs_1 = require("@assets/libs/util/arrs");
const _conversion_1 = require("@assets/core/inline/_conversion");
const matrix_1 = require("@libs/geom/matrix");
const constants_1 = require("@assets/libs/geom/constants");
const cytoscape_1 = __importDefault(require("cytoscape"));
const THREE = __importStar(require("three"));
const TypedArrayUtils_js_1 = require("@libs/TypedArrayUtils.js");
const Mathjs = __importStar(require("mathjs"));
const mesh_1 = require("@assets/libs/geom/mesh");
const common_func_1 = require("@assets/libs/geo-info/common_func");
var _ERaytraceMethod;
(function (_ERaytraceMethod) {
    _ERaytraceMethod["STATS"] = "stats";
    _ERaytraceMethod["DISTANCES"] = "distances";
    _ERaytraceMethod["HIT_PGONS"] = "hit_pgons";
    _ERaytraceMethod["INTERSECTIONS"] = "intersections";
    _ERaytraceMethod["ALL"] = "all";
})(_ERaytraceMethod = exports._ERaytraceMethod || (exports._ERaytraceMethod = {}));
/**
 * Shoot a set of rays into a set of obstructions, consisting of polygon faces.
 * One can imagine particles being shot from the ray origin in the ray direction, hitting the obstructions.
 * \n
 * Each ray will either hit an obstruction, or will hit no obstructions.
 * The length of the ray vector is ignored, only the ray origin and direction is taken into account.
 * Each particle shot out from a ray will travel a certain distance.
 * The minimum and maximum distance that the particle will travel is defined by the 'dist' argument.
 * \n
 * If a ray particle hits an obstruction, then the 'distance' for that ray is the distance from the ray origin
 * to the point of intersection.
 * If the ray particle does not hit an obstruction, then the 'distance' for that ray is equal to
 * the max for the 'dist' argument.
 * \n
 * Returns a dictionary containing the following data.
 * \n
 * If 'stats' is selected, the dictionary will contain the following numbers:
 * 1) 'hit_count': the total number of rays that hit an obstruction.
 * 2) 'miss_count': the total number of rays that did not hit any obstruction.
 * 3) 'total_dist': the total of all the ray distances.
 * 4) 'min_dist': the minimum distance for all the rays.
 * 5) 'max_dist': the maximum distance for all the rays.
 * 6) 'avg_dist': the average dist for all the rays.
 * 7) 'dist_ratio': the ratio of 'total_dist' to the maximum distance if not rays hit any obstructions.
  * \n
 * If 'distances' is selected, the dictionary will contain the following list:
 * 1) 'distances': A list of numbers, the distance travelled for each ray.
   * \n
 * If 'hit_pgons' is selected, the dictionary will contain the following list:
 * 1) 'hit_pgons': A list of polygon IDs, the polygons hit for each ray, or 'null' if no polygon was hit.
 * \n
 * If 'intersections' is selected, the dictionary will contain the following list:
 * 1) 'intersections': A list of XYZ coords, the point of intersection where the ray hit a polygon,
 * or 'null' if no polygon was hit.
 * \n
 * If 'all' is selected, the dictionary will contain all of the above.
 * \n
 * If the input is a list of rays, the output will be a single dictionary.
 * If the list is empty (i.e. contains no rays), then 'null' is returned.
 * If the input is a list of lists of rays, then the output will be a list of dictionaries.
 * \n
 * @param __model__
 * @param rays A ray, a list of rays, or a list of lists of rays.
 * @param entities The obstructions, faces, polygons, or collections of faces or polygons.
 * @param dist The ray limits, one or two numbers. Either max, or [min, max].
 * @param method Enum; values to return.
 */
function Raytrace(__model__, rays, entities, dist, method) {
    entities = arrs_1.arrMakeFlat(entities);
    // --- Error Check ---
    const fn_name = 'analyze.Raytrace';
    let ents_arrs;
    if (__model__.debug) {
        chk.checkArgs(fn_name, 'rays', rays, [chk.isRay, chk.isRayL, chk.isRayLL]);
        ents_arrs = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], [common_1.EEntType.PGON, common_1.EEntType.COLL]);
        chk.checkArgs(fn_name, 'dist', dist, [chk.isNum, chk.isNumL]);
        if (Array.isArray(dist)) {
            if (dist.length !== 2) {
                throw new Error('If "dist" is a list, it must have a length of two: [min_dist, max_dist].');
            }
            if (dist[0] >= dist[1]) {
                throw new Error('If "dist" is a list, the "min_dist" must be less than the "max_dist": [min_dist, max_dist].');
            }
        }
    }
    else {
        // ents_arrs = splitIDs(fn_name, 'entities', entities,
        // [IDcheckObj.isID, IDcheckObj.isIDList],
        // [EEntType.FACE, EEntType.PGON, EEntType.COLL]) as TEntTypeIdx[];
        ents_arrs = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    const mesh = mesh_1.createSingleMeshTjs(__model__, ents_arrs);
    dist = Array.isArray(dist) ? dist : [0, dist];
    const result = _raytraceAll(__model__, rays, mesh, dist, method);
    // cleanup
    mesh[0].geometry.dispose();
    mesh[0].material.dispose();
    // return the results
    return result;
}
exports.Raytrace = Raytrace;
function _raytraceAll(__model__, rays, mesh, limits, method) {
    const depth = arrs_1.getArrDepth(rays);
    if (depth < 2) { // an empty list
        return null;
    }
    else if (depth === 2) { // just one ray
        return _raytraceAll(__model__, [rays], mesh, limits, method);
    }
    else if (depth === 3) { // a list of rays
        const [origins_tjs, dirs_tjs] = _raytraceOriginsDirsTjs(__model__, rays);
        return _raytrace(origins_tjs, dirs_tjs, mesh, limits, method);
    }
    else if (depth === 4) { // a nested list of rays
        return rays.map(a_rays => _raytraceAll(__model__, a_rays, mesh, limits, method));
    }
}
function _raytraceOriginsDirsTjs(__model__, rays) {
    const origins_tjs = [];
    const dirs_tjs = [];
    for (const ray of rays) {
        origins_tjs.push(new THREE.Vector3(ray[0][0], ray[0][1], ray[0][2]));
        const dir = vectors_1.vecNorm(ray[1]);
        dirs_tjs.push(new THREE.Vector3(dir[0], dir[1], dir[2]));
    }
    return [origins_tjs, dirs_tjs];
}
function _raytrace(origins_tjs, dirs_tjs, mesh, limits, method) {
    const result = {};
    let hit_count = 0;
    let miss_count = 0;
    const result_dists = [];
    const result_ents = [];
    const result_isects = [];
    for (let i = 0; i < origins_tjs.length; i++) {
        // get the origin and direction
        const origin_tjs = origins_tjs[i];
        const dir_tjs = dirs_tjs[i];
        // shoot
        const ray_tjs = new THREE.Raycaster(origin_tjs, dir_tjs, limits[0], limits[1]);
        const isects = ray_tjs.intersectObject(mesh[0], false);
        // get the result
        if (isects.length === 0) {
            result_dists.push(limits[1]);
            miss_count += 1;
            if (method === _ERaytraceMethod.ALL || method === _ERaytraceMethod.HIT_PGONS) {
                result_ents.push(null);
            }
            if (method === _ERaytraceMethod.ALL || method === _ERaytraceMethod.INTERSECTIONS) {
                const origin = origin_tjs.toArray();
                const dir = dir_tjs.toArray();
                result_isects.push(vectors_1.vecAdd(origin, vectors_1.vecSetLen(dir, limits[1])));
            }
        }
        else {
            result_dists.push(isects[0]['distance']);
            hit_count += 1;
            if (method === _ERaytraceMethod.ALL || method === _ERaytraceMethod.HIT_PGONS) {
                const face_i = mesh[1][isects[0].faceIndex];
                result_ents.push(common_id_funcs_1.idMake(common_1.EEntType.PGON, face_i));
            }
            if (method === _ERaytraceMethod.ALL || method === _ERaytraceMethod.INTERSECTIONS) {
                const isect_tjs = isects[0].point;
                result_isects.push([isect_tjs.x, isect_tjs.y, isect_tjs.z]);
            }
        }
    }
    if ((method === _ERaytraceMethod.ALL || method === _ERaytraceMethod.STATS) && result_dists.length > 0) {
        result.hit_count = hit_count;
        result.miss_count = miss_count;
        result.total_dist = Mathjs.sum(result_dists);
        result.min_dist = Mathjs.min(result_dists);
        result.avg_dist = result.total_dist / result_dists.length;
        result.max_dist = Mathjs.max(result_dists);
        result.dist_ratio = result.total_dist / (result_dists.length * limits[1]);
    }
    if (method === _ERaytraceMethod.ALL || method === _ERaytraceMethod.DISTANCES) {
        result.distances = result_dists;
    }
    if (method === _ERaytraceMethod.ALL || method === _ERaytraceMethod.HIT_PGONS) {
        result.hit_pgons = result_ents;
    }
    if (method === _ERaytraceMethod.ALL || method === _ERaytraceMethod.INTERSECTIONS) {
        result.intersections = result_isects;
    }
    return result;
}
/**
 * Calculates an approximation of the isovist for a set of origins, defined by XYZ coords.
 * \n
 * The isovist is calculated by shooting rays out from the origins in a radial pattern.
 * The 'radius' argument defines the maximum radius of the isovist.
 * (The radius is used to define the maximum distance for shooting the rays.)
 * The 'num_rays' argument defines the number of rays that will be shot,
 * in a radial pattern parallel to the XY plane, with equal angle between rays.
 * More rays will result in more accurate result, but will also be slower to execute.
 * \n
 * Returns a dictionary containing different isovist metrics.
 * \n
 * 1) 'avg_dist': The average distance from origin to the perimeter.
 * 2) 'min_dist': The minimum distance from the origin to the perimeter.
 * 3) 'max_dist': The minimum distance from the origin to the perimeter.
 * 4) 'area': The area of the isovist.
 * 5) 'perimeter': The perimeter of the isovist.
 * 4) 'area_ratio': The ratio of the area of the isovist to the maximum area.
 * 5) 'perimeter_ratio': The ratio of the perimeter of the isovist to the maximum perimeter.
 * 6) 'circularity': The ratio of the square of the perimeter to area (Davis and Benedikt, 1979).
 * 7) 'compactness': The ratio of average distance to the maximum distance (Michael Batty, 2001).
 * 8) 'cluster': The ratio of the radius of an idealized circle with the actual area of the
 * isovist to the radius of an idealized circle with the actual perimeter of the circle (Michael Batty, 2001).
 * \n
 * \n
 * @param __model__
 * @param origins A list of Rays or a list of Planes, to be used as the origins for calculating the isovists.
 * @param entities The obstructions: faces, polygons, or collections.
 * @param radius The maximum radius of the isovist.
 * @param num_rays The number of rays to generate when calculating isovists.
 */
function Isovist(__model__, origins, entities, radius, num_rays) {
    entities = arrs_1.arrMakeFlat(entities);
    // --- Error Check ---
    const fn_name = 'analyze.Isovist';
    // let origin_ents_arrs: TEntTypeIdx[];
    let ents_arrs;
    if (__model__.debug) {
        chk.checkArgs(fn_name, 'origins', origins, [chk.isRayL, chk.isPlnL]);
        ents_arrs = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isIDL1], [common_1.EEntType.PGON, common_1.EEntType.COLL]);
        chk.checkArgs(fn_name, 'dist', radius, [chk.isNum, chk.isNumL]);
        if (Array.isArray(radius)) {
            if (radius.length !== 2) {
                throw new Error('If "dist" is a list, it must have a length of two: [min_dist, max_dist].');
            }
            if (radius[0] >= radius[1]) {
                throw new Error('If "dist" is a list, the "min_dist" must be less than the "max_dist": [min_dist, max_dist].');
            }
        }
    }
    else {
        // origin_ents_arrs = idsBreak(origins) as TEntTypeIdx[];
        ents_arrs = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    // create tjs origins for xyz, ray, or plane
    const origins_tjs = _isovistOriginsTjs(__model__, origins, 0.1); // TODO Should we lift coords by 0.1 ???
    // create tjs directions
    const dirs_xyzs = [];
    const dirs_tjs = [];
    const vec = [1, 0, 0];
    for (let i = 0; i < num_rays; i++) {
        const dir_xyz = vectors_1.vecRot(vec, [0, 0, 1], i * (Math.PI * 2) / num_rays);
        dirs_xyzs.push(vectors_1.vecSetLen(dir_xyz, radius));
        const dir_tjs = new THREE.Vector3(dir_xyz[0], dir_xyz[1], dir_xyz[2]);
        dirs_tjs.push(dir_tjs);
    }
    // calc max perim and area
    const ang = (2 * Math.PI) / num_rays;
    const opp = radius * Math.sin(ang / 2);
    const max_perim = num_rays * 2 * opp;
    const max_area = num_rays * radius * Math.cos(ang / 2) * opp;
    // create mesh
    const mesh = mesh_1.createSingleMeshTjs(__model__, ents_arrs);
    // create data structure
    const result = {};
    result.avg_dist = [];
    result.min_dist = [];
    result.max_dist = [];
    result.area = [];
    result.perimeter = [];
    result.circularity = [];
    result.area_ratio = [];
    result.perimeter_ratio = [];
    result.compactness = [];
    result.cluster = [];
    // shoot rays
    for (let i = 0; i < origins_tjs.length; i++) {
        const origin_tjs = origins_tjs[i];
        const result_dists = [];
        const result_isects = [];
        for (let j = 0; j < dirs_tjs.length; j++) {
            const dir_tjs = dirs_tjs[j];
            const ray_tjs = new THREE.Raycaster(origin_tjs, dir_tjs, 0, radius);
            const isects = ray_tjs.intersectObject(mesh[0], false);
            // get the result
            if (isects.length === 0) {
                result_dists.push(radius);
                result_isects.push(vectors_1.vecAdd([origin_tjs.x, origin_tjs.y, origin_tjs.z], dirs_xyzs[j]));
            }
            else {
                result_dists.push(isects[0]['distance']);
                const isect_tjs = isects[0].point;
                result_isects.push([isect_tjs.x, isect_tjs.y, isect_tjs.z]);
            }
        }
        // calc the perimeter and area
        let perim = 0;
        let area = 0;
        for (let j = 0; j < num_rays; j++) {
            const j2 = j === num_rays - 1 ? 0 : j + 1;
            // calc perim
            const c = distance_1.distance(result_isects[j], result_isects[j2]);
            perim += c;
            // calc area
            area += _isovistTriArea(result_dists[j], result_dists[j2], c);
        }
        const total_dist = Mathjs.sum(result_dists);
        const avg_dist = total_dist / result_dists.length;
        const min_dist = Mathjs.min(result_dists);
        const max_dist = Mathjs.max(result_dists);
        // save the data
        result.avg_dist.push(avg_dist);
        result.min_dist.push(min_dist);
        result.max_dist.push(max_dist);
        result.area.push(area);
        result.perimeter.push(perim);
        result.area_ratio.push(area / max_area);
        result.perimeter_ratio.push(perim / max_perim);
        result.circularity.push((perim * perim) / area);
        result.compactness.push(avg_dist / max_dist);
        result.cluster.push(Math.sqrt(area / Math.PI) / (perim / (2 * Math.PI)));
    }
    // cleanup
    mesh[0].geometry.dispose();
    mesh[0].material.dispose();
    // return the results
    return result;
}
exports.Isovist = Isovist;
function _isovistOriginsTjs(__model__, origins, offset) {
    const vectors_tjs = [];
    const is_xyz = common_func_1.isXYZ(origins[0]);
    const is_ray = common_func_1.isRay(origins[0]);
    const is_pln = common_func_1.isPlane(origins[0]);
    for (const origin of origins) {
        let origin_xyz = null;
        if (is_xyz) {
            origin_xyz = origin;
        }
        else if (is_ray) {
            origin_xyz = origin[0];
        }
        else if (is_pln) {
            origin_xyz = origin[0];
        }
        else {
            throw new Error('analyze.Solar: origins arg has invalid values');
        }
        const origin_tjs = new THREE.Vector3(origin_xyz[0], origin_xyz[1], origin_xyz[2] + offset);
        vectors_tjs.push(origin_tjs);
    }
    return vectors_tjs;
}
function _isovistTriArea(a, b, c) {
    // calc area using Heron's formula
    const s = (a + b + c) / 2;
    return Math.sqrt(s * (s - a) * (s - b) * (s - c));
}
// ================================================================================================
var _ESkyMethod;
(function (_ESkyMethod) {
    _ESkyMethod["WEIGHTED"] = "weighted";
    _ESkyMethod["UNWEIGHTED"] = "unweighted";
    _ESkyMethod["ALL"] = "all";
})(_ESkyMethod = exports._ESkyMethod || (exports._ESkyMethod = {}));
/**
 * Calculate an approximation of the sky exposure factor, for a set sensors positioned at specified locations.
 * The sky exposure factor for each sensor is a value between 0 and 1, where 0 means that it has no exposure
 * and 1 means that it has maximum exposure.
 * \n
 * Each sensor has a location and direction, specified using either rays or planes.
 * The direction of the sensor specifies what is infront and what is behind the sensor.
 * For each sensor, only exposure infront of the sensor is calculated.
 * \n
 * The exposure is calculated by shooting rays in reverse.
 * from the sensor origin to a set of points on the sky dome.
 * If the rays hits an obstruction, then the sky dome is obstructed..
 * If the ray hits no obstructions, then the sky dome is not obstructed.
 * \n
 * The exposure factor at each sensor point is calculated as follows:
 * 1) Shoot rays to all sky dome points.
 * 2) If the ray hits an obstruction, assign a weight of 0 to that ray.
 * 3) If a ray does not hit any obstructions, assign a weight between 0 and 1, depending on the incidence angle.
 * 4) Calculate the total solar expouse by adding up the weights for all rays.
 * 5) Divide by the maximum possible exposure for an unobstructed sensor with a direction pointing straight up.
 * \n
 * If 'weighted' is selected, then
 * the exposure calculation takes into account the angle of incidence of the ray to the sensor direction.
 * Rays parallel to the sensor direction are assigned a weight of 1.
 * Rays at an oblique angle are assigned a weight equal to the cosine of the angle
 * betweeen the sensor direction and the ray.
 * \n
 * If 'unweighted' is selected, then all rays are assigned a weight of 1, irresepctive of angle.
 * \n
 * The detail parameter spacifies the number of rays that get generated.
 * The higher the level of detail, the more accurate but also the slower the analysis will be.
 * \n
 * The number of rays are as follows:
 * 0 = 89 rays,
 * 1 = 337 rays,
 * 2 = 1313 rays,
 * 3 = 5185 rays.
 * \n
 * Returns a dictionary containing exposure results.
 * \n
 * 1) 'exposure': A list of numbers, the exposure factors.
 * \n
 * \n
 * @param __model__
 * @param origins A list of coordinates, a list of Rays or a list of Planes, to be used as the origins for calculating exposure.
 * @param detail An integer between 1 and 3 inclusive, specifying the level of detail for the analysis.
 * @param entities The obstructions, faces, polygons, or collections of faces or polygons.
 * @param limits The max distance for raytracing.
 * @param method Enum; sky method.
 */
function Sky(__model__, origins, detail, entities, limits, method) {
    entities = arrs_1.arrMakeFlat(entities);
    // --- Error Check ---
    const fn_name = 'analyze.Sky';
    let ents_arrs;
    // let latitude: number = null;
    // let north: Txy = [0, 1];
    if (__model__.debug) {
        chk.checkArgs(fn_name, 'origins', origins, [chk.isXYZL, chk.isRayL, chk.isPlnL]);
        chk.checkArgs(fn_name, 'detail', detail, [chk.isInt]);
        if (detail < 0 || detail > 3) {
            throw new Error(fn_name + ': "detail" must be an integer between 0 and 3 inclusive.');
        }
        ents_arrs = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], [common_1.EEntType.PGON, common_1.EEntType.COLL]);
    }
    else {
        ents_arrs = common_id_funcs_1.idsBreak(entities);
        // const geolocation = __model__.modeldata.attribs.get.getModelAttribVal('geolocation');
        // latitude = geolocation['latitude'];
        // if (__model__.modeldata.attribs.query.hasModelAttrib('north')) {
        //     north = __model__.modeldata.attribs.get.getModelAttribVal('north') as Txy;
        // }
    }
    // TODO
    // TODO
    // --- Error Check ---
    const sensor_oris_dirs_tjs = _rayOrisDirsTjs(__model__, origins, 0.01);
    const [mesh_tjs, idx_to_face_i] = mesh_1.createSingleMeshTjs(__model__, ents_arrs);
    limits = Array.isArray(limits) ? limits : [0, limits];
    // get the direction vectors
    const ray_dirs_tjs = _skyRayDirsTjs(detail);
    // run the simulation
    const weighted = method === _ESkyMethod.WEIGHTED;
    const results = _calcExposure(sensor_oris_dirs_tjs, ray_dirs_tjs, mesh_tjs, limits, weighted);
    // cleanup
    mesh_tjs.geometry.dispose();
    mesh_tjs.material.dispose();
    // return the result
    return { 'exposure': results };
}
exports.Sky = Sky;
function _skyRayDirsTjs(detail) {
    const hedron_tjs = new THREE.IcosahedronGeometry(1, detail + 2);
    // calc vectors
    const vecs = [];
    for (const vec of hedron_tjs.vertices) {
        // vec.applyAxisAngle(YAXIS, Math.PI / 2);
        if (vec.z > -1e-6) {
            vecs.push(vec);
        }
    }
    return vecs;
}
// ================================================================================================
var _ESolarMethod;
(function (_ESolarMethod) {
    _ESolarMethod["DIRECT_WEIGHTED"] = "direct_weighted";
    _ESolarMethod["DIRECT_UNWEIGHTED"] = "direct_unweighted";
    _ESolarMethod["INDIRECT_WEIGHTED"] = "indirect_weighted";
    _ESolarMethod["INDIRECT_UNWEIGHTED"] = "indirect_unweighted";
})(_ESolarMethod = exports._ESolarMethod || (exports._ESolarMethod = {}));
/**
 * Calculate an approximation of the solar exposure factor, for a set sensors positioned at specfied locations.
 * The solar exposure factor for each sensor is a value between 0 and 1, where 0 means that it has no exposure
 * and 1 means that it has maximum exposure.
 * \n
 * The calculation takes into account the geolocation and the north direction of the model.
 * Geolocation is specified by a model attributes as follows:
 * @geolocation={'longitude':123,'latitude':12}.
 * North direction is specified by a model attribute as follows, using a vector:
 * @north==[1,2]
 * If no north direction is specified, then [0,1] is the default (i.e. north is in the direction of the y-axis);
 * \n
 * Each sensor has a location and direction, specified using either rays or planes.
 * The direction of the sensor specifies what is infront and what is behind the sensor.
 * For each sensor, only exposure infront of the sensor is calculated.
 * \n
 * The exposure is calculated by shooting rays in reverse.
 * from the sensor origin to a set of points on the sky dome.
 * If the rays hits an obstruction, then the sky dome is obstructed..
 * If the ray hits no obstructions, then the sky dome is not obstructed.
 * \n
 * The exposure factor at each sensor point is calculated as follows:
 * 1) Shoot rays to all sky dome points.
 * 2) If the ray hits an obstruction, assign a wight of 0 to that ray.
 * 3) If a ray does not hit any obstructions, assign a weight between 0 and 1, depending on the incidence angle.
 * 4) Calculate the total solar expouse by adding up the weights for all rays.
 * 5) Divide by the maximum possible solar exposure for an unobstructed sensor.
 * \n
 * The solar exposure calculation takes into account the angle of incidence of the sun ray to the sensor direction.
 * Sun rays that are hitting the sensor straight on are assigned a weight of 1.
 * Sun rays that are hitting the sensor at an oblique angle are assigned a weight equal to the cosine of the angle.
 * \n
 * If 'direct_exposure' is selected, then the points on the sky dome will follow the path of the sun throughout the year.
 * If 'indirect_exposure' is selected, then the points on the sky dome will consist of points excluded by
 * the path of the sun throughout the year.
 * \n
 * The direct sky dome points cover a strip of sky where the sun travels.
 * The inderect sky dome points cover the segments of sky either side of the direct sun strip.
 * \n
 * The detail parameter spacifies the number of rays that get generated.
 * The higher the level of detail, the more accurate but also the slower the analysis will be.
 * The number of rays differs depending on the latitde.
 * \n
 * At latitude 0, the number of rays for 'direct' are as follows:
 * 0 = 44 rays,
 * 1 = 105 rays,
 * 2 = 510 rays,
 * 3 = 1287 rays.
 * \n
 * At latitude 0, the number of rays for 'indirect' are as follows:
 * 0 = 58 rays,
 * 1 = 204 rays,
 * 2 = 798 rays,
 * 3 = 3122 rays.
 * \n
 * The number of rays for 'sky' are as follows:
 * 0 = 89 rays,
 * 1 = 337 rays,
 * 2 = 1313 rays,
 * 3 = 5185 rays.
 * \n
 * Returns a dictionary containing solar exposure results.
 * \n
 * If one  of the 'direct' methods is selected, the dictionary will contain:
 * 1) 'direct': A list of numbers, the direct exposure factors.
 * \n
 * If one  of the 'indirect' methods is selected, the dictionary will contain:
 * 1) 'indirect': A list of numbers, the indirect exposure factors.
 * \n
 * \n
 * @param __model__
 * @param origins A list of coordinates, a list of Rays or a list of Planes, to be used as the origins for calculating exposure.
 * @param detail An integer between 1 and 3 inclusive, specifying the level of detail for the analysis.
 * @param entities The obstructions, faces, polygons, or collections of faces or polygons.
 * @param limits The max distance for raytracing.
 * @param method Enum; solar method.
 */
function Sun(__model__, origins, detail, entities, limits, method) {
    entities = arrs_1.arrMakeFlat(entities);
    // --- Error Check ---
    const fn_name = 'analyze.Sun';
    let ents_arrs;
    let latitude = null;
    let north = [0, 1];
    if (__model__.debug) {
        chk.checkArgs(fn_name, 'origins', origins, [chk.isXYZL, chk.isRayL, chk.isPlnL]);
        chk.checkArgs(fn_name, 'detail', detail, [chk.isInt]);
        if (detail < 0 || detail > 3) {
            throw new Error(fn_name + ': "detail" must be an integer between 0 and 3 inclusive.');
        }
        ents_arrs = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], [common_1.EEntType.PGON, common_1.EEntType.COLL]);
        if (!__model__.modeldata.attribs.query.hasModelAttrib('geolocation')) {
            throw new Error('analyze.Solar: model attribute "geolocation" is missing, \
                e.g. @geolocation = {"latitude":12, "longitude":34}');
        }
        else {
            const geolocation = __model__.modeldata.attribs.get.getModelAttribVal('geolocation');
            if (underscore_1.default.isObject(geolocation) && underscore_1.default.has(geolocation, 'latitude')) {
                latitude = geolocation['latitude'];
            }
            else {
                throw new Error('analyze.Solar: model attribute "geolocation" is missing the "latitude" key, \
                    e.g. @geolocation = {"latitude":12, "longitude":34}');
            }
        }
        if (__model__.modeldata.attribs.query.hasModelAttrib('north')) {
            north = __model__.modeldata.attribs.get.getModelAttribVal('north');
            if (!Array.isArray(north) || north.length !== 2) {
                throw new Error('analyze.Solar: model has a "north" attribute with the wrong type, \
                it should be a vector with two values, \
                e.g. @north =  [1,2]');
            }
        }
    }
    else {
        ents_arrs = common_id_funcs_1.idsBreak(entities);
        const geolocation = __model__.modeldata.attribs.get.getModelAttribVal('geolocation');
        latitude = geolocation['latitude'];
        if (__model__.modeldata.attribs.query.hasModelAttrib('north')) {
            north = __model__.modeldata.attribs.get.getModelAttribVal('north');
        }
    }
    // TODO
    // TODO
    // --- Error Check ---
    // TODO North direction
    const sensor_oris_dirs_tjs = _rayOrisDirsTjs(__model__, origins, 0.01);
    const [mesh_tjs, idx_to_face_i] = mesh_1.createSingleMeshTjs(__model__, ents_arrs);
    limits = Array.isArray(limits) ? limits : [0, limits];
    // return the result
    const results = {};
    switch (method) {
        case _ESolarMethod.DIRECT_WEIGHTED:
        case _ESolarMethod.DIRECT_UNWEIGHTED:
            // get the direction vectors
            const ray_dirs_tjs1 = underscore_1.default.flatten(_solarDirsTjs(latitude, north, detail, method));
            // run the simulation
            const weighted1 = method === _ESolarMethod.DIRECT_WEIGHTED;
            results['direct'] = _calcExposure(sensor_oris_dirs_tjs, ray_dirs_tjs1, mesh_tjs, limits, weighted1);
            break;
        case _ESolarMethod.INDIRECT_WEIGHTED:
        case _ESolarMethod.INDIRECT_UNWEIGHTED:
            // get the direction vectors
            const ray_dirs_tjs2 = underscore_1.default.flatten(_solarDirsTjs(latitude, north, detail, method));
            // run the simulation
            const weighted2 = method === _ESolarMethod.INDIRECT_WEIGHTED;
            results['indirect'] = _calcExposure(sensor_oris_dirs_tjs, ray_dirs_tjs2, mesh_tjs, limits, weighted2);
            break;
        default:
            throw new Error('Solar method not recognised.');
    }
    // cleanup
    mesh_tjs.geometry.dispose();
    mesh_tjs.material.dispose();
    // return dict
    return results;
}
exports.Sun = Sun;
function _rayOrisDirsTjs(__model__, origins, offset) {
    const vectors_tjs = [];
    const is_xyz = common_func_1.isXYZ(origins[0]);
    const is_ray = common_func_1.isRay(origins[0]);
    const is_pln = common_func_1.isPlane(origins[0]);
    for (const origin of origins) {
        let origin_xyz = null;
        let normal_xyz = null;
        if (is_xyz) {
            origin_xyz = origin;
            normal_xyz = [0, 0, 1];
        }
        else if (is_ray) {
            origin_xyz = origin[0];
            normal_xyz = vectors_1.vecNorm(origin[1]);
        }
        else if (is_pln) {
            origin_xyz = origin[0];
            normal_xyz = vectors_1.vecCross(origin[1], origin[2]);
        }
        else {
            throw new Error('analyze.Solar: origins arg has invalid values');
        }
        const normal_tjs = new THREE.Vector3(...normal_xyz);
        const origin_offset_xyz = vectors_1.vecAdd(origin_xyz, vectors_1.vecMult(normal_xyz, offset));
        const origin_tjs = new THREE.Vector3(...origin_offset_xyz);
        vectors_tjs.push([origin_tjs, normal_tjs]);
    }
    return vectors_tjs;
}
function _solarDirsTjs(latitude, north, detail, method) {
    switch (method) {
        case _ESolarMethod.DIRECT_WEIGHTED:
        case _ESolarMethod.DIRECT_UNWEIGHTED:
            return _solarRaysDirectTjs(latitude, north, detail);
        case _ESolarMethod.INDIRECT_WEIGHTED:
        case _ESolarMethod.INDIRECT_UNWEIGHTED:
            return _solarRaysIndirectTjs(latitude, north, detail);
        // case _ESolarMethod.ALL:
        //     throw new Error('Not implemented');
        default:
            throw new Error('Solar method not recognised.');
    }
}
function _solarRot(day_ang, day, hour_ang, hour, latitude, north) {
    const vec = new THREE.Vector3(0, 0, -1);
    vec.applyAxisAngle(constants_1.XAXIS, day_ang * day);
    vec.applyAxisAngle(constants_1.YAXIS, hour_ang * hour);
    vec.applyAxisAngle(constants_1.XAXIS, latitude);
    vec.applyAxisAngle(constants_1.ZAXIS, -north);
    return vec;
}
function _solarRaysDirectTjs(latitude, north, detail) {
    const directions = [];
    // set the level of detail
    // const day_step = [182 / 4, 182 / 5, 182 / 6, 182 / 7, 182 / 8, 182 / 9, 182 / 10][detail];
    const day_step = [182 / 3, 182 / 6, 182 / 9, 182 / 12][detail];
    const num_day_steps = Math.round(182 / day_step) + 1;
    // const hour_step = [0.25 * 6, 0.25 * 5, 0.25 * 4, 0.25 * 3, 0.25 * 2, 0.25 * 1, 0.25 * 0.5][detail];
    const hour_step = [0.25 * 6, 0.25 * 4, 0.25 * 1, 0.25 * 0.5][detail];
    // get the angles in radians
    const day_ang_rad = _conversion_1.degToRad(false, 47) / 182;
    const hour_ang_rad = (2 * Math.PI) / 24;
    // get the atitude angle in radians
    const latitude_rad = _conversion_1.degToRad(false, latitude);
    // get the angle from y-axis to north vector in radians
    const north_rad = vectors_1.vecAng2([north[0], north[1], 0], [0, 1, 0], [0, 0, 1]);
    // create the vectors
    for (let day_count = 0; day_count < num_day_steps; day_count++) {
        const day = -91 + (day_count * day_step);
        const one_day_path = [];
        // get sunrise
        let sunrise = 0;
        let sunset = 0;
        for (let hour = 0; hour < 24; hour = hour + 0.1) {
            const sunrise_vec = _solarRot(day_ang_rad, day, hour_ang_rad, hour, latitude_rad, north_rad);
            if (sunrise_vec.z > -1e-6) {
                sunrise = hour;
                sunset = 24 - hour;
                one_day_path.push(sunrise_vec);
                break;
            }
        }
        // morning sun path, count down from midday
        for (let hour = 12; hour > sunrise; hour = hour - hour_step) {
            const am_vec = _solarRot(day_ang_rad, day, hour_ang_rad, hour, latitude_rad, north_rad);
            if (am_vec.z > -1e-6) {
                one_day_path.splice(1, 0, am_vec);
            }
            else {
                break;
            }
        }
        // afternoon sunpath, count up from midday
        for (let hour = 12 + hour_step; hour < sunset; hour = hour + hour_step) {
            const pm_vec = _solarRot(day_ang_rad, day, hour_ang_rad, hour, latitude_rad, north_rad);
            if (pm_vec.z > -1e-6) {
                one_day_path.push(pm_vec);
            }
            else {
                break;
            }
        }
        // sunset
        const sunset_vec = _solarRot(day_ang_rad, day, hour_ang_rad, sunset, latitude_rad, north_rad);
        one_day_path.push(sunset_vec);
        // add it to the list
        directions.push(one_day_path);
    }
    // console.log("num rays = ", arrMakeFlat(directions).length);
    return directions;
}
function _solarRaysIndirectTjs(latitude, north, detail) {
    const hedron_tjs = new THREE.IcosahedronGeometry(1, detail + 2);
    const solar_offset = Math.cos(_conversion_1.degToRad(false, 66.5));
    // get the atitude angle in radians
    const latitude_rad = _conversion_1.degToRad(false, latitude);
    // get the angle from y-axis to north vector in radians
    const north_rad = vectors_1.vecAng2([north[0], north[1], 0], [0, 1, 0], [0, 0, 1]);
    // calc vectors
    const indirect_vecs = [];
    for (const vec of hedron_tjs.vertices) {
        if (Math.abs(vec.y) > solar_offset) {
            vec.applyAxisAngle(constants_1.XAXIS, latitude_rad);
            vec.applyAxisAngle(constants_1.ZAXIS, -north_rad);
            if (vec.z > -1e-6) {
                indirect_vecs.push(vec);
            }
        }
    }
    // console.log("num rays = ", indirect_vecs.length);
    return indirect_vecs;
}
// calc the max solar exposure for a point with no obstructions facing straight up
function _calcMaxExposure(directions_tjs, weighted) {
    if (!weighted) {
        return directions_tjs.length;
    }
    let result = 0;
    const normal_tjs = new THREE.Vector3(0, 0, 1);
    for (const direction_tjs of directions_tjs) {
        // calc the weighted result based on the angle between the dir and normal
        // this applies the cosine weighting rule
        const result_weighted = normal_tjs.dot(direction_tjs);
        if (result_weighted > 0) {
            result = result + result_weighted;
        }
    }
    return result;
}
function _calcExposure(origins_normals_tjs, directions_tjs, mesh_tjs, limits, weighted) {
    const results = [];
    const result_max = _calcMaxExposure(directions_tjs, weighted);
    for (const [origin_tjs, normal_tjs] of origins_normals_tjs) {
        let result = 0;
        for (const direction_tjs of directions_tjs) {
            const dot_normal_direction = normal_tjs.dot(direction_tjs);
            if (dot_normal_direction > 0) {
                const ray_tjs = new THREE.Raycaster(origin_tjs, direction_tjs, limits[0], limits[1]);
                const isects = ray_tjs.intersectObject(mesh_tjs, false);
                if (isects.length === 0) {
                    if (weighted) {
                        // this applies the cosine weighting rule
                        result = result + dot_normal_direction;
                    }
                    else {
                        // this applies no cosine weighting
                        result = result + 1;
                    }
                }
            }
        }
        results.push(result / result_max);
    }
    return results;
}
// ================================================================================================
var _ESunPathMethod;
(function (_ESunPathMethod) {
    _ESunPathMethod["DIRECT"] = "direct";
    _ESunPathMethod["INDIRECT"] = "indirect";
    _ESunPathMethod["SKY"] = "sky";
})(_ESunPathMethod = exports._ESunPathMethod || (exports._ESunPathMethod = {}));
/**
 * Generates a sun path, oriented according to the geolocation and north direction.
 * The sun path is generated as an aid to visualize the orientation of the sun relative to the model.
 * Note that the solar exposure calculations do not require the sub path to be visualized.
 * \n
 * The sun path takes into account the geolocation and the north direction of the model.
 * Geolocation is specified by a model attributes as follows:
 * @geolocation={'longitude':123,'latitude':12}.
 * North direction is specified by a model attribute as follows, using a vector:
 * @north==[1,2]
 * If no north direction is specified, then [0,1] is the default (i.e. north is in the direction of the y-axis);
 * \n
 * @param __model__
 * @param origins The origins of the rays
 * @param detail The level of detail for the analysis
 * @param radius The radius of the sun path
 * @param method Enum, the type of sky to generate.
 */
function SkyDome(__model__, origin, detail, radius, method) {
    // --- Error Check ---
    const fn_name = 'analyze.SkyDome';
    let latitude = null;
    let north = [0, 1];
    if (__model__.debug) {
        chk.checkArgs(fn_name, 'origin', origin, [chk.isXYZ, chk.isRay, chk.isPln]);
        chk.checkArgs(fn_name, 'detail', detail, [chk.isInt]);
        if (detail < 0 || detail > 6) {
            throw new Error(fn_name + ': "detail" must be an integer between 0 and 6.');
        }
        chk.checkArgs(fn_name, 'radius', radius, [chk.isNum]);
        if (method !== _ESunPathMethod.SKY) {
            if (!__model__.modeldata.attribs.query.hasModelAttrib('geolocation')) {
                throw new Error('analyze.Solar: model attribute "geolocation" is missing, \
                    e.g. @geolocation = {"latitude":12, "longitude":34}');
            }
            else {
                const geolocation = __model__.modeldata.attribs.get.getModelAttribVal('geolocation');
                if (underscore_1.default.isObject(geolocation) && underscore_1.default.has(geolocation, 'latitude')) {
                    latitude = geolocation['latitude'];
                }
                else {
                    throw new Error('analyze.Solar: model attribute "geolocation" is missing the "latitude" key, \
                        e.g. @geolocation = {"latitude":12, "longitude":34}');
                }
            }
            if (__model__.modeldata.attribs.query.hasModelAttrib('north')) {
                north = __model__.modeldata.attribs.get.getModelAttribVal('north');
                if (!Array.isArray(north) || north.length !== 2) {
                    throw new Error('analyze.Solar: model has a "north" attribute with the wrong type, \
                    it should be a vector with two values, \
                    e.g. @north =  [1,2]');
                }
            }
        }
    }
    else {
        const geolocation = __model__.modeldata.attribs.get.getModelAttribVal('geolocation');
        latitude = geolocation['latitude'];
        if (__model__.modeldata.attribs.query.hasModelAttrib('north')) {
            north = __model__.modeldata.attribs.get.getModelAttribVal('north');
        }
    }
    // --- Error Check ---
    // create the matrix one time
    const matrix = new THREE.Matrix4();
    const origin_depth = arrs_1.getArrDepth(origin);
    if (origin_depth === 2 && origin.length === 2) {
        // origin is a ray
        matrix.makeTranslation(...origin[0]);
    }
    else if (origin_depth === 2 && origin.length === 3) {
        // origin is a plane
        // matrix = xfromSourceTargetMatrix(XYPLANE, origin as TPlane); // TODO xform not nceessary
        matrix.makeTranslation(...origin[0]);
    }
    else {
        // origin is Txyz
        matrix.makeTranslation(...origin);
    }
    // generate the positions on the sky dome
    switch (method) {
        case _ESunPathMethod.DIRECT:
            const rays_dirs_tjs1 = _solarRaysDirectTjs(latitude, north, detail);
            return _sunPathGenPosisNested(__model__, rays_dirs_tjs1, radius, matrix);
        case _ESunPathMethod.INDIRECT:
            const rays_dirs_tjs2 = _solarRaysIndirectTjs(latitude, north, detail);
            return _sunPathGenPosis(__model__, rays_dirs_tjs2, radius, matrix);
        case _ESunPathMethod.SKY:
            const rays_dirs_tjs3 = _skyRayDirsTjs(detail);
            return _sunPathGenPosis(__model__, rays_dirs_tjs3, radius, matrix);
        default:
            throw new Error('Sunpath method not recognised.');
    }
}
exports.SkyDome = SkyDome;
function _sunPathGenPosisNested(__model__, rays_dirs_tjs, radius, matrix) {
    const posis = [];
    for (const one_day_tjs of rays_dirs_tjs) {
        posis.push(_sunPathGenPosis(__model__, one_day_tjs, radius, matrix));
    }
    return posis;
}
function _sunPathGenPosis(__model__, rays_dirs_tjs, radius, matrix) {
    const posis_i = [];
    for (const direction_tjs of rays_dirs_tjs) {
        let xyz = vectors_1.vecMult([direction_tjs.x, direction_tjs.y, direction_tjs.z], radius);
        xyz = matrix_1.multMatrix(xyz, matrix);
        const posi_i = __model__.modeldata.geom.add.addPosi();
        __model__.modeldata.attribs.posis.setPosiCoords(posi_i, xyz);
        posis_i.push(posi_i);
    }
    return common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.POSI, posis_i);
}
// ================================================================================================
/**
 * Finds the nearest positions within a certain maximum radius.
 * \n
 * The neighbors to each source position is calculated as follows:
 * 1) Calculate the distance to all target positions.
 * 2) Creat the neighbors set by filtering out target positions that are further than the maximum radius.
 * 3) If the number of neighbors is greater than 'max_neighbors',
 * then select the 'max_neighbors' closest target positions.
 * \n
 * Returns a dictionary containing the nearest positions.
 * \n
 * If 'num_neighbors' is 1, the dictionary will contain two lists:
 * 1) 'posis': a list of positions, a subset of positions from the source.
 * 2) 'neighbors': a list of neighbouring positions, a subset of positions from target.
  * \n
 * If 'num_neighbors' is greater than 1, the dictionary will contain two lists:
 * 1) 'posis': a list of positions, a subset of positions from the source.
 * 2) 'neighbors': a list of lists of neighbouring positions, a subset of positions from target.
 * \n
 * @param __model__
 * @param source A list of positions, or entities from which positions can be extracted.
 * @param target A list of positions, or entities from which positions can be extracted.
 * If null, the positions in source will be used.
 * @param radius The maximum distance for neighbors. If null, Infinity will be used.
 * @param max_neighbors The maximum number of neighbors to return.
 * If null, the number of positions in target is used.
 * @returns A dictionary containing the results.
 */
function Nearest(__model__, source, target, radius, max_neighbors) {
    if (target === null) {
        target = source;
    } // TODO optimise
    source = arrs_1.arrMakeFlat(source);
    target = arrs_1.arrMakeFlat(target);
    // --- Error Check ---
    const fn_name = 'analyze.Nearest';
    let source_ents_arrs;
    let target_ents_arrs;
    if (__model__.debug) {
        source_ents_arrs = _check_ids_1.checkIDs(__model__, fn_name, 'origins', source, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], null);
        target_ents_arrs = _check_ids_1.checkIDs(__model__, fn_name, 'destinations', target, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], null);
    }
    else {
        // source_ents_arrs = splitIDs(fn_name, 'origins', source,
        //     [IDcheckObj.isID, IDcheckObj.isIDList], null) as TEntTypeIdx[];
        // target_ents_arrs = splitIDs(fn_name, 'destinations', target,
        //     [IDcheckObj.isID, IDcheckObj.isIDList], null) as TEntTypeIdx[];
        source_ents_arrs = common_id_funcs_1.idsBreak(source);
        target_ents_arrs = common_id_funcs_1.idsBreak(target);
    }
    // --- Error Check ---
    const source_posis_i = _getUniquePosis(__model__, source_ents_arrs);
    const target_posis_i = _getUniquePosis(__model__, target_ents_arrs);
    const result = _nearest(__model__, source_posis_i, target_posis_i, radius, max_neighbors);
    // return dictionary with results
    return {
        'posis': common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.POSI, result[0]),
        'neighbors': common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.POSI, result[1]),
        'distances': result[2]
    };
}
exports.Nearest = Nearest;
function _fuseDistSq(xyz1, xyz2) {
    return Math.pow(xyz1[0] - xyz2[0], 2) + Math.pow(xyz1[1] - xyz2[1], 2) + Math.pow(xyz1[2] - xyz2[2], 2);
}
function _nearest(__model__, source_posis_i, target_posis_i, dist, num_neighbors) {
    // create a list of all posis
    const set_target_posis_i = new Set(target_posis_i);
    const set_posis_i = new Set(target_posis_i);
    for (const posi_i of source_posis_i) {
        set_posis_i.add(posi_i);
    }
    const posis_i = Array.from(set_posis_i);
    // get dist and num_neighbours
    if (dist === null) {
        dist = Infinity;
    }
    if (num_neighbors === null) {
        num_neighbors = target_posis_i.length;
    }
    // find neighbor
    const map_posi_i_to_xyz = new Map();
    const typed_positions = new Float32Array(posis_i.length * 4);
    const typed_buff = new THREE.BufferGeometry();
    typed_buff.setAttribute('position', new THREE.BufferAttribute(typed_positions, 4));
    for (let i = 0; i < posis_i.length; i++) {
        const posi_i = posis_i[i];
        const xyz = __model__.modeldata.attribs.posis.getPosiCoords(posi_i);
        map_posi_i_to_xyz.set(posi_i, xyz);
        typed_positions[i * 4 + 0] = xyz[0];
        typed_positions[i * 4 + 1] = xyz[1];
        typed_positions[i * 4 + 2] = xyz[2];
        typed_positions[i * 4 + 3] = posi_i;
    }
    const kdtree = new TypedArrayUtils_js_1.TypedArrayUtils.Kdtree(typed_positions, _fuseDistSq, 4);
    // calculate the dist squared
    const num_posis = posis_i.length;
    const dist_sq = dist * dist;
    // deal with special case, num_neighbors === 1
    if (num_neighbors === 1) {
        const result1 = [[], [], []];
        for (const posi_i of source_posis_i) {
            const nn = kdtree.nearest(map_posi_i_to_xyz.get(posi_i), num_posis, dist_sq);
            let min_dist = Infinity;
            let nn_posi_i;
            for (const a_nn of nn) {
                const next_nn_posi_i = a_nn[0].obj[3];
                if (set_target_posis_i.has(next_nn_posi_i) && a_nn[1] < min_dist) {
                    min_dist = a_nn[1];
                    nn_posi_i = next_nn_posi_i;
                }
            }
            if (nn_posi_i !== undefined) {
                result1[0].push(posi_i);
                result1[1].push(nn_posi_i);
                result1[2].push(Math.sqrt(min_dist));
            }
        }
        return result1;
    }
    // create a neighbors list
    const result = [[], [], []];
    for (const posi_i of source_posis_i) {
        // TODO at the moment is gets all posis since no distinction is made between source and traget
        // TODO kdtree could be optimised
        const nn = kdtree.nearest(map_posi_i_to_xyz.get(posi_i), num_posis, dist_sq);
        const posis_i_dists = [];
        for (const a_nn of nn) {
            const nn_posi_i = a_nn[0].obj[3];
            if (set_target_posis_i.has(nn_posi_i)) {
                posis_i_dists.push([nn_posi_i, a_nn[1]]);
            }
        }
        posis_i_dists.sort((a, b) => a[1] - b[1]);
        const nn_posis_i = [];
        const nn_dists = [];
        for (const posi_i_dist of posis_i_dists) {
            nn_posis_i.push(posi_i_dist[0]);
            nn_dists.push(Math.sqrt(posi_i_dist[1]));
            if (nn_posis_i.length === num_neighbors) {
                break;
            }
        }
        if (nn_posis_i.length > 0) {
            result[0].push(posi_i);
            result[1].push(nn_posis_i);
            result[2].push(nn_dists);
        }
    }
    return result;
}
var _EShortestPathMethod;
(function (_EShortestPathMethod) {
    _EShortestPathMethod["UNDIRECTED"] = "undirected";
    _EShortestPathMethod["DIRECTED"] = "directed";
})(_EShortestPathMethod = exports._EShortestPathMethod || (exports._EShortestPathMethod = {}));
var _EShortestPathResult;
(function (_EShortestPathResult) {
    _EShortestPathResult["DISTS"] = "distances";
    _EShortestPathResult["COUNTS"] = "counts";
    _EShortestPathResult["PATHS"] = "paths";
    _EShortestPathResult["ALL"] = "all";
})(_EShortestPathResult = exports._EShortestPathResult || (exports._EShortestPathResult = {}));
/**
 * Calculates the shortest path from every source position to every target position.
 * \n
 * Paths are calculated through a network of connected edges.
 * For edges to be connected, vertices must be welded.
 * For example, if the network consists of multiple polylines, then the vertcies of those polylines must be welded.
 * \n
 * If 'directed' is selected, then the edge direction is taken into account. Each edge will be one-way.
 * If 'undirected' is selected, the edge direction is ignored. Each edge will be two-way.
 * \n
 * Each edge can be assigned a weight.
 * The shortest path is the path where the sum of the weights of the edges along the path is the minimum.
 * \n
 * By default, all edges are assigned a weight of 1.
 * Default weights can be overridden by creating a numeric attribute on edges call 'weight'.
 * \n
 * Returns a dictionary containing the shortest paths.
 * \n
 * If 'distances' is selected, the dictionary will contain two list:
 * 1) 'source_posis': a list of start positions for eah path,
 * 2) 'distances': a list of distances, one list for each path starting at each source position.
 * \n
 * If 'counts' is selected, the dictionary will contain four lists:
 * 1) 'posis': a list of positions traversed by the paths,
 * 2) 'posis_count': a list of numbers that count how often each position was traversed,
 * 3) 'edges': a list of edges traversed by the paths,
 * 4) 'edges_count': a list of numbers that count how often each edge was traversed.
 * \n
 * If 'paths' is selected, the dictionary will contain two lists of lists:
 * 1) 'posi_paths': a list of lists of positions, one list for each path,
 * 2) 'edge_paths': a list of lists of edges, one list for each path.
 * \n
 * If 'all' is selected, the dictionary will contain all lists just described.
 * \n
 * @param __model__
 * @param source Path source, a list of positions, or entities from which positions can be extracted.
 * @param target Path target, a list of positions, or entities from which positions can be extracted.
 * @param entities The network, edges, or entities from which edges can be extracted.
 * @param method Enum, the method to use, directed or undirected.
 * @param result Enum, the data to return, positions, edges, or both.
 * @returns A dictionary containing the results.
 */
function ShortestPath(__model__, source, target, entities, method, result) {
    source = source === null ? [] : arrs_1.arrMakeFlat(source);
    target = target === null ? [] : arrs_1.arrMakeFlat(target);
    entities = arrs_1.arrMakeFlat(entities);
    // --- Error Check ---
    const fn_name = 'analyze.ShortestPath';
    let source_ents_arrs;
    let target_ents_arrs;
    let ents_arrs;
    if (__model__.debug) {
        source_ents_arrs = _check_ids_1.checkIDs(__model__, fn_name, 'origins', source, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], null);
        target_ents_arrs = _check_ids_1.checkIDs(__model__, fn_name, 'destinations', target, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], null);
        ents_arrs = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], null);
    }
    else {
        // source_ents_arrs = splitIDs(fn_name, 'origins', source,
        //     [IDcheckObj.isID, IDcheckObj.isIDList], null) as TEntTypeIdx[];
        // target_ents_arrs = splitIDs(fn_name, 'destinations', target,
        //     [IDcheckObj.isID, IDcheckObj.isIDList], null) as TEntTypeIdx[];
        // ents_arrs = splitIDs(fn_name, 'entities', entities,
        //     [IDcheckObj.isID, IDcheckObj.isIDList], null) as TEntTypeIdx[];
        source_ents_arrs = common_id_funcs_1.idsBreak(source);
        target_ents_arrs = common_id_funcs_1.idsBreak(target);
        ents_arrs = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    const directed = method === _EShortestPathMethod.DIRECTED ? true : false;
    let return_dists = true;
    let return_counts = true;
    let return_paths = true;
    switch (result) {
        case _EShortestPathResult.DISTS:
            return_paths = false;
            return_counts = false;
            break;
        case _EShortestPathResult.COUNTS:
            return_dists = false;
            return_paths = false;
            break;
        case _EShortestPathResult.PATHS:
            return_dists = false;
            return_counts = false;
            break;
        default:
            // all true
            break;
    }
    const source_posis_i = _getUniquePosis(__model__, source.length === 0 ? ents_arrs : source_ents_arrs);
    const target_posis_i = _getUniquePosis(__model__, target.length === 0 ? ents_arrs : target_ents_arrs);
    const cy_elems = _cytoscapeGetElements(__model__, ents_arrs, source_posis_i, target_posis_i, directed);
    // create the cytoscape object
    const cy = cytoscape_1.default({
        elements: cy_elems,
        headless: true,
    });
    const map_edges_i = new Map();
    const map_posis_i = new Map();
    const posi_paths = [];
    const edge_paths = [];
    const all_path_dists = [];
    for (const source_posi_i of source_posis_i) {
        const path_dists = [];
        const cy_source_elem = cy.getElementById(source_posi_i.toString());
        const dijkstra = cy.elements().dijkstra({
            root: cy_source_elem,
            weight: _cytoscapeWeightFn,
            directed: directed
        });
        for (const target_posi_i of target_posis_i) {
            const cy_node = cy.getElementById(target_posi_i.toString());
            const dist = dijkstra.distanceTo(cy_node);
            const cy_path = dijkstra.pathTo(cy_node);
            const posi_path = [];
            const edge_path = [];
            for (const cy_path_elem of cy_path.toArray()) {
                if (cy_path_elem.isEdge()) {
                    const edge_i = cy_path_elem.data('idx');
                    if (return_counts) {
                        if (!map_edges_i.has(edge_i)) {
                            map_edges_i.set(edge_i, 1);
                        }
                        else {
                            map_edges_i.set(edge_i, map_edges_i.get(edge_i) + 1);
                        }
                        if (!directed) {
                            const edge2_i = cy_path_elem.data('idx2');
                            if (edge2_i !== null) {
                                if (!map_edges_i.has(edge2_i)) {
                                    map_edges_i.set(edge2_i, 1);
                                }
                                else {
                                    map_edges_i.set(edge2_i, map_edges_i.get(edge2_i) + 1);
                                }
                            }
                        }
                    }
                    if (return_paths) {
                        edge_path.push(edge_i);
                    }
                }
                else {
                    const posi_i = cy_path_elem.data('idx');
                    if (return_counts) {
                        if (!map_posis_i.has(posi_i)) {
                            map_posis_i.set(posi_i, 1);
                        }
                        else {
                            map_posis_i.set(posi_i, map_posis_i.get(posi_i) + 1);
                        }
                    }
                    if (return_paths) {
                        posi_path.push(posi_i);
                    }
                }
            }
            if (return_paths) {
                edge_paths.push(edge_path);
                posi_paths.push(posi_path);
            }
            if (return_dists) {
                path_dists.push(dist);
            }
        }
        all_path_dists.push(path_dists);
    }
    const dict = {};
    if (return_dists) {
        dict.source_posis = common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.POSI, source_posis_i);
        dict.distances = source_posis_i.length === 1 ? all_path_dists[0] : all_path_dists;
    }
    if (return_counts) {
        dict.edges = common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.EDGE, Array.from(map_edges_i.keys()));
        dict.edges_count = Array.from(map_edges_i.values());
        dict.posis = common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.POSI, Array.from(map_posis_i.keys()));
        dict.posis_count = Array.from(map_posis_i.values());
    }
    if (return_paths) {
        dict.edge_paths = common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.EDGE, edge_paths);
        dict.posi_paths = common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.POSI, posi_paths);
    }
    return dict;
}
exports.ShortestPath = ShortestPath;
function _getUniquePosis(__model__, ents_arr) {
    if (ents_arr.length === 0) {
        return [];
    }
    const set_posis_i = new Set();
    for (const [ent_type, ent_i] of ents_arr) {
        const posis_i = __model__.modeldata.geom.nav.navAnyToPosi(ent_type, ent_i);
        for (const posi_i of posis_i) {
            set_posis_i.add(posi_i);
        }
    }
    return Array.from(set_posis_i);
}
function _cytoscapeWeightFn(edge) {
    return edge.data('weight');
}
function _cytoscapeWeightFn2(edge) {
    const weight = edge.data('weight');
    if (weight < 1) {
        return 1;
    }
    return weight;
}
function _cytoscapeGetElements(__model__, ents_arr, source_posis_i, target_posis_i, directed) {
    let has_weight_attrib = false;
    if (__model__.modeldata.attribs.query.hasEntAttrib(common_1.EEntType.EDGE, 'weight')) {
        has_weight_attrib = __model__.modeldata.attribs.query.getAttribDataType(common_1.EEntType.EDGE, 'weight') === common_1.EAttribDataTypeStrs.NUMBER;
    }
    // edges, starts empty
    const set_edges_i = new Set();
    // posis, starts with cource and target
    const set_posis_i = new Set(source_posis_i);
    for (const target_posi_i of target_posis_i) {
        set_posis_i.add(target_posi_i);
    }
    // network
    for (const [ent_type, ent_i] of ents_arr) {
        const edges_i = __model__.modeldata.geom.nav.navAnyToEdge(ent_type, ent_i);
        for (const edge_i of edges_i) {
            set_edges_i.add(edge_i);
        }
        const posis_i = __model__.modeldata.geom.nav.navAnyToPosi(ent_type, ent_i);
        for (const posi_i of posis_i) {
            set_posis_i.add(posi_i);
        }
    }
    // create elements
    const elements = [];
    for (const posi_i of Array.from(set_posis_i)) {
        elements.push({ data: { id: posi_i.toString(), idx: posi_i } });
    }
    if (directed) {
        // directed
        for (const edge_i of Array.from(set_edges_i)) {
            const edge_posis_i = __model__.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.EDGE, edge_i);
            let weight = 1.0;
            if (has_weight_attrib) {
                weight = __model__.modeldata.attribs.get.getEntAttribVal(common_1.EEntType.EDGE, edge_i, 'weight');
            }
            else {
                const c0 = __model__.modeldata.attribs.posis.getPosiCoords(edge_posis_i[0]);
                const c1 = __model__.modeldata.attribs.posis.getPosiCoords(edge_posis_i[1]);
                weight = distance_1.distance(c0, c1);
            }
            elements.push({ data: { id: 'e' + edge_i,
                    source: edge_posis_i[0].toString(), target: edge_posis_i[1].toString(), weight: weight, idx: edge_i } });
        }
    }
    else {
        // undirected
        const map_edges_ab = new Map();
        for (const edge_i of Array.from(set_edges_i)) {
            let edge_posis_i = __model__.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.EDGE, edge_i);
            edge_posis_i = edge_posis_i[0] < edge_posis_i[1] ? edge_posis_i : [edge_posis_i[1], edge_posis_i[0]];
            const undir_edge_id = 'e_' + edge_posis_i[0].toString() + '_' + edge_posis_i[1].toString();
            if (map_edges_ab.has(undir_edge_id)) {
                const obj = map_edges_ab.get(undir_edge_id);
                obj['data']['idx2'] = edge_i;
                // TODO should we take the average of the two weights? Could be more than two...
            }
            else {
                let weight = 1.0;
                if (has_weight_attrib) {
                    weight = __model__.modeldata.attribs.get.getEntAttribVal(common_1.EEntType.EDGE, edge_i, 'weight');
                }
                else {
                    const c0 = __model__.modeldata.attribs.posis.getPosiCoords(edge_posis_i[0]);
                    const c1 = __model__.modeldata.attribs.posis.getPosiCoords(edge_posis_i[1]);
                    weight = distance_1.distance(c0, c1);
                }
                const obj = {
                    data: {
                        id: undir_edge_id,
                        source: edge_posis_i[0].toString(),
                        target: edge_posis_i[1].toString(),
                        weight: weight,
                        idx: edge_i,
                        idx2: null
                    }
                };
                map_edges_ab.set(undir_edge_id, obj);
                elements.push(obj);
            }
        }
    }
    return elements;
}
/**
 * Calculates the shortest path from every position in source, to the closest position in target.
 * \n
 * This differs from the 'analyze.ShortestPath()' function. If you specify multiple target positions,
 * for each cource position,
 * the 'analyze.ShortestPath()' function will calculate multiple shortest paths,
 * i.e. the shortest path to all targets.
 * This function will caculate just one shortest path,
 * i.e. the shortest path to the closest target.
 * \n
 * Paths are calculated through a network of connected edges.
 * For edges to be connected, vertices must be welded.
 * For example, if the network consists of multiple polylines, then the vertcies of those polylines must be welded.
 * \n
 * If 'directed' is selected, then the edge direction is taken into account. Each edge will be one-way.
 * If 'undirected' is selected, the edge direction is ignored. Each edge will be two-way.
 * \n
 * Each edge can be assigned a weight.
 * The shortest path is the path where the sum of the weights of the edges along the path is the minimum.
 * \n
 * By default, all edges are assigned a weight of 1.
 * Default weights can be overridden by creating a numeric attribute on edges call 'weight'.
 * \n
 * Returns a dictionary containing the shortes paths.
 * \n
 * If 'distances' is selected, the dictionary will contain one list:
 * 1) 'distances': a list of distances.
 * \n
 * If 'counts' is selected, the dictionary will contain four lists:
 * 1) 'posis': a list of positions traversed by the paths,
 * 2) 'posis_count': a list of numbers that count how often each position was traversed.
 * 3) 'edges': a list of edges traversed by the paths,
 * 4) 'edges_count': a list of numbers that count how often each edge was traversed.
 * \n
 * If 'paths' is selected, the dictionary will contain two lists of lists:
 * 1) 'posi_paths': a list of lists of positions, one list for each path.
 * 2) 'edge_paths': a list of lists of edges, one list for each path.
 * \n
 * If 'all' is selected, the dictionary will contain all lists just described.
 * \n
 * @param __model__
 * @param source Path source, a list of positions, or entities from which positions can be extracted.
 * @param target Path source, a list of positions, or entities from which positions can be extracted.
 * @param entities The network, edges, or entities from which edges can be extracted.
 * @param method Enum, the method to use, directed or undirected.
 * @param result Enum, the data to return, positions, edges, or both.
 * @returns A dictionary containing the results.
 */
function ClosestPath(__model__, source, target, entities, method, result) {
    source = source === null ? [] : arrs_1.arrMakeFlat(source);
    target = target === null ? [] : arrs_1.arrMakeFlat(target);
    entities = arrs_1.arrMakeFlat(entities);
    // --- Error Check ---
    const fn_name = 'analyze.ClosestPath';
    let source_ents_arrs;
    let target_ents_arrs;
    let ents_arrs;
    if (__model__.debug) {
        source_ents_arrs = _check_ids_1.checkIDs(__model__, fn_name, 'origins', source, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], null);
        target_ents_arrs = _check_ids_1.checkIDs(__model__, fn_name, 'destinations', target, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], null);
        ents_arrs = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], null);
    }
    else {
        // source_ents_arrs = splitIDs(fn_name, 'origins', source,
        //     [IDcheckObj.isID, IDcheckObj.isIDList], null) as TEntTypeIdx[];
        // target_ents_arrs = splitIDs(fn_name, 'destinations', target,
        //     [IDcheckObj.isID, IDcheckObj.isIDList], null) as TEntTypeIdx[];
        // ents_arrs = splitIDs(fn_name, 'entities', entities,
        //     [IDcheckObj.isID, IDcheckObj.isIDList], null) as TEntTypeIdx[];
        source_ents_arrs = common_id_funcs_1.idsBreak(source);
        target_ents_arrs = common_id_funcs_1.idsBreak(target);
        ents_arrs = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    const directed = method === _EShortestPathMethod.DIRECTED ? true : false;
    let return_dists = true;
    let return_counts = true;
    let return_paths = true;
    switch (result) {
        case _EShortestPathResult.DISTS:
            return_paths = false;
            return_counts = false;
            break;
        case _EShortestPathResult.COUNTS:
            return_dists = false;
            return_paths = false;
            break;
        case _EShortestPathResult.PATHS:
            return_dists = false;
            return_counts = false;
            break;
        default:
            // all true
            break;
    }
    const source_posis_i = _getUniquePosis(__model__, source.length === 0 ? ents_arrs : source_ents_arrs);
    const target_posis_i = _getUniquePosis(__model__, target.length === 0 ? ents_arrs : target_ents_arrs);
    const cy_elems = _cytoscapeGetElements(__model__, ents_arrs, source_posis_i, target_posis_i, directed);
    // create the cytoscape object
    const cy = cytoscape_1.default({
        elements: cy_elems,
        headless: true,
    });
    const map_edges_i = new Map();
    const map_posis_i = new Map();
    const posi_paths = [];
    const edge_paths = [];
    const path_dists = [];
    for (const source_posi_i of source_posis_i) {
        const cy_source_elem = cy.getElementById(source_posi_i.toString());
        const dijkstra = cy.elements().dijkstra({
            root: cy_source_elem,
            weight: _cytoscapeWeightFn,
            directed: directed
        });
        let closest_target_posi_i = null;
        let closest_dist = Infinity;
        for (const target_posi_i of target_posis_i) {
            // find shortest path
            const dist = dijkstra.distanceTo(cy.getElementById(target_posi_i.toString()));
            if (dist < closest_dist) {
                closest_dist = dist;
                closest_target_posi_i = target_posi_i;
            }
        }
        if (closest_target_posi_i !== null) {
            // get shortest path
            const cy_path = dijkstra.pathTo(cy.getElementById(closest_target_posi_i.toString()));
            // get the data
            const posi_path = [];
            const edge_path = [];
            for (const cy_path_elem of cy_path.toArray()) {
                if (cy_path_elem.isEdge()) {
                    const edge_i = cy_path_elem.data('idx');
                    if (return_counts) {
                        if (!map_edges_i.has(edge_i)) {
                            map_edges_i.set(edge_i, 1);
                        }
                        else {
                            map_edges_i.set(edge_i, map_edges_i.get(edge_i) + 1);
                        }
                        if (!directed) {
                            const edge2_i = cy_path_elem.data('idx2');
                            if (edge2_i !== null) {
                                if (!map_edges_i.has(edge2_i)) {
                                    map_edges_i.set(edge2_i, 1);
                                }
                                else {
                                    map_edges_i.set(edge2_i, map_edges_i.get(edge2_i) + 1);
                                }
                            }
                        }
                    }
                    if (return_paths) {
                        edge_path.push(edge_i);
                    }
                }
                else {
                    const posi_i = cy_path_elem.data('idx');
                    if (return_counts) {
                        if (!map_posis_i.has(posi_i)) {
                            map_posis_i.set(posi_i, 1);
                        }
                        else {
                            map_posis_i.set(posi_i, map_posis_i.get(posi_i) + 1);
                        }
                    }
                    if (return_paths) {
                        posi_path.push(posi_i);
                    }
                }
            }
            if (return_paths) {
                edge_paths.push(edge_path);
                posi_paths.push(posi_path);
            }
            if (return_dists) {
                path_dists.push(closest_dist);
            }
        }
        else {
            if (return_paths) {
                edge_paths.push([]);
                posi_paths.push([]);
            }
            if (return_dists) {
                path_dists.push(1e8); // TODO, cannot pas Infinity due to JSON issues
            }
        }
    }
    const dict = {};
    if (return_dists) {
        dict.source_posis = common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.POSI, source_posis_i);
        dict.distances = path_dists;
    }
    if (return_counts) {
        dict.edges = common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.EDGE, Array.from(map_edges_i.keys()));
        dict.edges_count = Array.from(map_edges_i.values());
        dict.posis = common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.POSI, Array.from(map_posis_i.keys()));
        dict.posis_count = Array.from(map_posis_i.values());
    }
    if (return_paths) {
        dict.edge_paths = common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.EDGE, edge_paths);
        dict.posi_paths = common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.POSI, posi_paths);
    }
    return dict;
}
exports.ClosestPath = ClosestPath;
// ================================================================================================
var _ECentralityMethod;
(function (_ECentralityMethod) {
    _ECentralityMethod["UNDIRECTED"] = "undirected";
    _ECentralityMethod["DIRECTED"] = "directed";
})(_ECentralityMethod = exports._ECentralityMethod || (exports._ECentralityMethod = {}));
function _cyGetPosisAndElements(__model__, ents_arr, posis_i, directed) {
    let has_weight_attrib = false;
    if (__model__.modeldata.attribs.query.hasEntAttrib(common_1.EEntType.EDGE, 'weight')) {
        has_weight_attrib = __model__.modeldata.attribs.query.getAttribDataType(common_1.EEntType.EDGE, 'weight') === common_1.EAttribDataTypeStrs.NUMBER;
    }
    // edges, starts empty
    const set_edges_i = new Set();
    // posis, starts with posis_i
    const set_posis_i = new Set(posis_i);
    // network
    for (const [ent_type, ent_i] of ents_arr) {
        const n_edges_i = __model__.modeldata.geom.nav.navAnyToEdge(ent_type, ent_i);
        for (const edge_i of n_edges_i) {
            set_edges_i.add(edge_i);
        }
        const n_posis_i = __model__.modeldata.geom.nav.navAnyToPosi(ent_type, ent_i);
        for (const posi_i of n_posis_i) {
            set_posis_i.add(posi_i);
        }
    }
    // all unique posis
    const uniq_posis_i = Array.from(set_posis_i);
    // create elements
    const elements = [];
    for (const posi_i of uniq_posis_i) {
        elements.push({ data: { id: posi_i.toString(), idx: posi_i } });
    }
    if (directed) {
        // directed
        for (const edge_i of Array.from(set_edges_i)) {
            const edge_posis_i = __model__.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.EDGE, edge_i);
            let weight = 1.0;
            if (has_weight_attrib) {
                weight = __model__.modeldata.attribs.get.getEntAttribVal(common_1.EEntType.EDGE, edge_i, 'weight');
            }
            else {
                // const c0: Txyz = __model__.modeldata.attribs.posis.getPosiCoords(edge_posis_i[0]);
                // const c1: Txyz = __model__.modeldata.attribs.posis.getPosiCoords(edge_posis_i[1]);
                weight = 1; // distance(c0, c1);
            }
            elements.push({ data: { id: 'e' + edge_i,
                    source: edge_posis_i[0].toString(), target: edge_posis_i[1].toString(), weight: weight, idx: edge_i } });
        }
    }
    else {
        // undirected
        const map_edges_ab = new Map();
        for (const edge_i of Array.from(set_edges_i)) {
            let edge_posis_i = __model__.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.EDGE, edge_i);
            edge_posis_i = edge_posis_i[0] < edge_posis_i[1] ? edge_posis_i : [edge_posis_i[1], edge_posis_i[0]];
            const undir_edge_id = 'e_' + edge_posis_i[0].toString() + '_' + edge_posis_i[1].toString();
            if (map_edges_ab.has(undir_edge_id)) {
                const obj = map_edges_ab.get(undir_edge_id);
                obj['data']['idx2'] = edge_i;
                // TODO should we take the average of the two weights? Could be more than two...
            }
            else {
                let weight = 1.0;
                if (has_weight_attrib) {
                    weight = __model__.modeldata.attribs.get.getEntAttribVal(common_1.EEntType.EDGE, edge_i, 'weight');
                }
                else {
                    // const c0: Txyz = __model__.modeldata.attribs.posis.getPosiCoords(edge_posis_i[0]);
                    // const c1: Txyz = __model__.modeldata.attribs.posis.getPosiCoords(edge_posis_i[1]);
                    weight = 1; // distance(c0, c1);
                }
                const obj = {
                    data: {
                        id: undir_edge_id,
                        source: edge_posis_i[0].toString(),
                        target: edge_posis_i[1].toString(),
                        weight: weight,
                        idx: edge_i,
                        idx2: null
                    }
                };
                map_edges_ab.set(undir_edge_id, obj);
                elements.push(obj);
            }
        }
    }
    return [elements, uniq_posis_i];
}
// ================================================================================================
/**
 * Calculates degree centrality for positions in a netowrk. Values are normalized in the range 0 to 1.
 * \n
 * The network is defined by a set of connected edges, consisting of polylines and/or polygons.
 * For edges to be connected, vertices must be welded.
 * For example, if the network consists of multiple polylines, then the vertcies of those polylines must be welded.
 * \n
 * Degree centrality is based on the idea that the centrality of a position in a network is related to
 * the number of direct links that it has to other positions.
 * \n
 * If 'undirected' is selected,  degree centrality is calculated by summing up the weights
 * of all edges connected to a position.
 * If 'directed' is selected, then two types of centrality are calculated: incoming degree and
 * outgoing degree.
 * Incoming degree is calculated by summing up the weights of all incoming edges connected to a position.
 * Outgoing degree is calculated by summing up the weights of all outgoing edges connected to a position.
 * \n
 * Default weight is 1 for all edges. Weights can be specified using an attribute called 'weight' on edges.
 * \n
 * Returns a dictionary containing the results.
 * \n
 * If 'undirected' is selected, the dictionary will contain  the following:
 * 1) 'posis': a list of position IDs.
 * 2) 'degree': a list of numbers, the values for degree centrality.
 * \n
 * If 'directed' is selected, the dictionary will contain  the following:
 * 1) 'posis': a list of position IDs.
 * 2) 'indegree': a list of numbers, the values for incoming degree centrality.
 * 3) 'outdegree': a list of numbers, the values for outgoing degree centrality.
 * \n
 * @param __model__
 * @param source A list of positions, or entities from which positions can be extracted.
 * These positions should be part of the network.
 * @param entities The network, edges, or entities from which edges can be extracted.
 * @param alpha The alpha value for the centrality calculation, ranging on [0, 1]. With value 0,
 * disregards edge weights and solely uses number of edges in the centrality calculation. With value 1,
 * disregards number of edges and solely uses the edge weights in the centrality calculation.
 * @param method Enum, the method to use, directed or undirected.
 * @returns A dictionary containing the results.
 */
function Degree(__model__, source, entities, alpha, method) {
    // source posis and network entities
    if (source === null) {
        source = [];
    }
    else {
        source = arrs_1.arrMakeFlat(source);
    }
    entities = arrs_1.arrMakeFlat(entities);
    // --- Error Check ---
    const fn_name = 'analyze.Degree';
    let source_ents_arrs = [];
    let ents_arrs;
    if (__model__.debug) {
        if (source.length > 0) {
            source_ents_arrs = _check_ids_1.checkIDs(__model__, fn_name, 'source', source, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], null);
        }
        ents_arrs = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], null);
    }
    else {
        // if (source.length > 0) {
        //     source_ents_arrs = splitIDs(fn_name, 'source', source,
        //         [IDcheckObj.isID, IDcheckObj.isIDList], null) as TEntTypeIdx[];
        // }
        // ents_arrs = splitIDs(fn_name, 'entities', entities,
        //     [IDcheckObj.isID, IDcheckObj.isIDList], null) as TEntTypeIdx[];
        source_ents_arrs = common_id_funcs_1.idsBreak(source);
        ents_arrs = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    const directed = method === _ECentralityMethod.DIRECTED ? true : false;
    const source_posis_i = _getUniquePosis(__model__, source_ents_arrs);
    // TODO deal with source === null
    const [elements, graph_posis_i] = _cyGetPosisAndElements(__model__, ents_arrs, source_posis_i, directed);
    // create the cytoscape object
    const cy_network = cytoscape_1.default({
        elements: elements,
        headless: true,
    });
    const posis_i = source_ents_arrs.length === 0 ? graph_posis_i : source_posis_i;
    if (directed) {
        return _centralityDegreeDirected(posis_i, cy_network, alpha);
    }
    else {
        return _centralityDegreeUndirected(posis_i, cy_network, alpha);
    }
}
exports.Degree = Degree;
function _centralityDegreeDirected(posis_i, cy_network, alpha) {
    const indegree = [];
    const outdegree = [];
    const cy_centrality = cy_network.elements().degreeCentralityNormalized({
        weight: _cytoscapeWeightFn,
        alpha: alpha,
        directed: true
    });
    for (const posi_i of posis_i) {
        const source_elem = cy_network.getElementById(posi_i.toString());
        indegree.push(cy_centrality.indegree(source_elem));
        outdegree.push(cy_centrality.outdegree(source_elem));
    }
    return {
        'posis': common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.POSI, posis_i),
        'indegree': indegree,
        'outdegree': outdegree
    };
}
function _centralityDegreeUndirected(posis_i, cy_network, alpha) {
    const degree = [];
    const cy_centrality = cy_network.elements().degreeCentralityNormalized({
        weight: _cytoscapeWeightFn,
        alpha: alpha,
        directed: false
    });
    for (const posi_i of posis_i) {
        const source_elem = cy_network.getElementById(posi_i.toString());
        degree.push(cy_centrality.degree(source_elem));
    }
    return {
        'posis': common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.POSI, posis_i),
        'degree': degree
    };
}
// ================================================================================================
var _ECentralityType;
(function (_ECentralityType) {
    _ECentralityType["BETWEENNESS"] = "betweenness";
    _ECentralityType["CLOSENESS"] = "closeness";
    _ECentralityType["HARMONIC"] = "harmonic";
})(_ECentralityType = exports._ECentralityType || (exports._ECentralityType = {}));
/**
 * Calculates betweenness, closeness, and harmonic centrality
 * for positions in a netowrk. Values are normalized in the range 0 to 1.
 * \n
 * The network is defined by a set of connected edges, consisting of polylines and/or polygons.
 * For edges to be connected, vertices must be welded.
 * For example, if the network consists of multiple polylines, then the vertcies of those polylines must be welded.
 * \n
 * Centralities are calculate based on distances between positions.
 * The distance between two positions is the shortest path between those positions.
 * The shortest path is the path where the sum of the weights of the edges along the path is the minimum.
 * \n
 * Default weight is 1 for all edges. Weights can be specified using an attribute called 'weight' on edges.
 * \n
 * Closeness centrality is calculated by inverting the sum of the distances to all other positions.
 * \n
 * Harmonic centrality is calculated by summing up the inverted distances to all other positions.
 * \n
 * Betweenness centrality os calculated in two steps.
 * First, the shortest path between every pair of nodes is calculated.
 * Second, the betweenness centrality of each node is then the total number of times the node is traversed
 * by the shortest paths.
 * \n
 * For closeness centrality, the network is first split up into connected sub-networks.
 * This is because closeness centrality cannot be calculated on networks that are not fully connected.
 * The closeness centrality is then calculated for each sub-network seperately.
 * \n
 * For harmonic centrality, care must be taken when defining custom weights.
 * Weight with zero values or very small values will result in errors or will distort the results.
 * This is due to the inversion operation: 1 / weight.
 * \n
 * Returns a dictionary containing the results.
 * \n
 * 1) 'posis': a list of position IDs.
 * 2) 'centrality': a list of numbers, the values for centrality, either betweenness, closeness, or harmonic.
 * \n
 * @param __model__
 * @param source A list of positions, or entities from which positions can be extracted.
 * These positions should be part of the network.
 * @param entities The network, edges, or entities from which edges can be extracted.
 * @param method Enum, the method to use, directed or undirected.
 * @param cen_type Enum, the data to return, positions, edges, or both.
 * @returns A list of centrality values, between 0 and 1.
 */
function Centrality(__model__, source, entities, method, cen_type) {
    // source posis and network entities
    if (source === null) {
        source = [];
    }
    else {
        source = arrs_1.arrMakeFlat(source);
    }
    entities = arrs_1.arrMakeFlat(entities);
    // --- Error Check ---
    const fn_name = 'analyze.Centrality';
    let source_ents_arrs = [];
    let ents_arrs;
    if (__model__.debug) {
        if (source.length > 0) {
            source_ents_arrs = _check_ids_1.checkIDs(__model__, fn_name, 'source', source, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], null);
        }
        ents_arrs = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], null);
    }
    else {
        // if (source.length > 0) {
        //     source_ents_arrs = splitIDs(fn_name, 'source', source,
        //         [IDcheckObj.isID, IDcheckObj.isIDList], null) as TEntTypeIdx[];
        // }
        // ents_arrs = splitIDs(fn_name, 'entities', entities,
        //     [IDcheckObj.isID, IDcheckObj.isIDList], null) as TEntTypeIdx[];
        source_ents_arrs = common_id_funcs_1.idsBreak(source);
        ents_arrs = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    const directed = method === _ECentralityMethod.DIRECTED ? true : false;
    const source_posis_i = _getUniquePosis(__model__, source_ents_arrs);
    // TODO deal with source === null
    const [elements, graph_posis_i] = _cyGetPosisAndElements(__model__, ents_arrs, source_posis_i, directed);
    // create the cytoscape object
    const cy_network = cytoscape_1.default({
        elements: elements,
        headless: true,
    });
    // calculate the centrality
    const posis_i = source_ents_arrs.length === 0 ? graph_posis_i : source_posis_i;
    switch (cen_type) {
        case _ECentralityType.CLOSENESS:
            return _centralityCloseness(posis_i, cy_network, directed);
        case _ECentralityType.HARMONIC:
            return _centralityHarmonic(posis_i, cy_network, directed);
        case _ECentralityType.BETWEENNESS:
            return _centralityBetweenness(posis_i, cy_network, directed);
        default:
            throw new Error('Centrality type not recognised.');
    }
}
exports.Centrality = Centrality;
function _centralityCloseness(posis_i, cy_network, directed) {
    const results = [];
    const result_posis_i = [];
    const comps = [];
    const cy_colls = cy_network.elements().components();
    cy_colls.sort((a, b) => b.length - a.length);
    for (const cy_coll of cy_colls) {
        const comp = [];
        const cy_centrality = cy_coll.closenessCentralityNormalized({
            weight: _cytoscapeWeightFn,
            harmonic: false,
            directed: directed
        });
        for (const posi_i of posis_i) {
            const source_elem = cy_coll.getElementById(posi_i.toString());
            if (source_elem.length === 0) {
                continue;
            }
            const result = cy_centrality.closeness(source_elem);
            if (isNaN(result)) {
                throw new Error('Error calculating closeness centrality.');
            }
            result_posis_i.push(posi_i);
            comp.push(posi_i);
            results.push(result);
        }
        comps.push(comp);
    }
    return {
        'posis': common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.POSI, result_posis_i),
        'centrality': results
    };
}
function _centralityHarmonic(posis_i, cy_network, directed) {
    const results = [];
    const cy_centrality = cy_network.elements().closenessCentralityNormalized({
        weight: _cytoscapeWeightFn,
        harmonic: true,
        directed: directed
    });
    for (const posi_i of posis_i) {
        const source_elem = cy_network.getElementById(posi_i.toString());
        if (source_elem.length === 0) {
            continue;
        }
        const result = cy_centrality.closeness(source_elem);
        if (isNaN(result)) {
            throw new Error('Error calculating harmonic centrality.');
        }
        results.push(result);
    }
    return {
        'posis': common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.POSI, posis_i),
        'centrality': results
    };
}
function _centralityBetweenness(posis_i, cy_network, directed) {
    const results = [];
    const cy_centrality = cy_network.elements().betweennessCentrality({
        weight: _cytoscapeWeightFn,
        directed: directed
    });
    for (const posi_i of posis_i) {
        const source_elem = cy_network.getElementById(posi_i.toString());
        const result = cy_centrality.betweennessNormalized(source_elem);
        if (isNaN(result)) {
            throw new Error('Error calculating betweenness centrality.');
        }
        results.push(result);
    }
    return {
        'posis': common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.POSI, posis_i),
        'centrality': results
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5hbHl6ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3RzL3NyYy9jb3JlL21vZHVsZXMvYmFzaWMvYW5hbHl6ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7Ozs7Ozs7Ozs7QUFFSDs7R0FFRztBQUNILGlEQUFnRDtBQUVoRCx3REFBMEM7QUFHMUMsa0RBQWlIO0FBQ2pILDJFQUFtRztBQUNuRyxrREFBK0M7QUFDL0MsZ0RBQW9HO0FBQ3BHLDREQUFnQztBQUVoQyxpREFBa0U7QUFDbEUsaUVBQTJEO0FBQzNELDhDQUErQztBQUMvQywyREFBa0U7QUFDbEUsMERBQWtDO0FBQ2xDLDZDQUErQjtBQUMvQixpRUFBMkQ7QUFDM0QsK0NBQWlDO0FBQ2pDLGlEQUE2RDtBQUM3RCxtRUFBMEU7QUFlMUUsSUFBWSxnQkFNWDtBQU5ELFdBQVksZ0JBQWdCO0lBQ3hCLG1DQUFlLENBQUE7SUFDZiwyQ0FBdUIsQ0FBQTtJQUN2QiwyQ0FBdUIsQ0FBQTtJQUN2QixtREFBK0IsQ0FBQTtJQUMvQiwrQkFBVyxDQUFBO0FBQ2YsQ0FBQyxFQU5XLGdCQUFnQixHQUFoQix3QkFBZ0IsS0FBaEIsd0JBQWdCLFFBTTNCO0FBQ0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E4Q0c7QUFDSCxTQUFnQixRQUFRLENBQUMsU0FBa0IsRUFBRSxJQUEwQixFQUMvRCxRQUEyQixFQUFFLElBQTZCLEVBQUUsTUFBd0I7SUFDeEYsUUFBUSxHQUFHLGtCQUFXLENBQUMsUUFBUSxDQUFVLENBQUM7SUFDMUMsc0JBQXNCO0lBQ3RCLE1BQU0sT0FBTyxHQUFHLGtCQUFrQixDQUFDO0lBQ25DLElBQUksU0FBd0IsQ0FBQztJQUM3QixJQUFJLFNBQVMsQ0FBQyxLQUFLLEVBQUU7UUFDakIsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLEdBQUcs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LENBQUMsQ0FBQyxDQUFDLEVBQUUsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ2pFO1FBQ0QsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM1QyxNQUFNLFFBQVEsR0FBRyxVQUFVLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQztRQUNsRCxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFDLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUMsZ0JBQWdCO1FBQ2hCLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFFLFFBQVEsQ0FBRSxDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFFLFFBQVEsQ0FBRSxDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFFLFFBQVEsQ0FBRSxDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFFLElBQUksQ0FBRSxDQUFDO1FBQ3pCLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFFLEtBQUssQ0FBRSxDQUFDO1FBQy9CLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFFLElBQUksR0FBRyxRQUFRLENBQUUsQ0FBQztRQUMxQyxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBRSxLQUFLLEdBQUcsU0FBUyxDQUFFLENBQUM7UUFDakQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUUsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFFLENBQUM7UUFDbEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUUsUUFBUSxHQUFHLFFBQVEsQ0FBRSxDQUFDO1FBQy9DLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLENB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