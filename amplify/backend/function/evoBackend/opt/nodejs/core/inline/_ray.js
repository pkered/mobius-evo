"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vectors_1 = require("@assets/libs/geom/vectors");
const arrs_1 = require("@assets/libs/util/arrs");
const matrix_1 = require("@assets/libs/geom/matrix");
const _check_inline_args_1 = require("../_check_inline_args");
/**
 * Creates a ray from an origin "o" and a direction vector "d".
 * Creates a ray from an origin "o", a direction vector "d", and length "l".
 * @param origin
 * @param dir
 * @param len
 */
function rayMake(debug, origin, dir, len) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('rayMake', arguments, 3, 2);
    }
    // overloaded case
    const origin_dep = arrs_1.getArrDepth(origin);
    const dir_dep = arrs_1.getArrDepth(dir);
    if (origin_dep === 2 || dir_dep === 2) {
        if (dir_dep === 1) {
            // only origin is Txyz[]
            return origin.map(origin_val => rayMake(debug, origin_val, dir, len));
        }
        else if (origin_dep === 1) {
            // only dir is Txyz[]
            return dir.map(dir_val => rayMake(debug, origin, dir_val, len));
        }
        else {
            // both origin and dir are Txyz[], they must be equal length
            if (origin.length === dir.length) {
                const vecs = [];
                for (let i = 0; i < origin.length; i++) {
                    vecs.push(rayMake(debug, origin[i], dir[i], len));
                }
                return vecs;
            }
            else {
                throw new Error('Error making rays with lists of vectors: The two lists must be of equal length.');
            }
        }
    }
    // normal case, both origin and dir are Txyz
    const ray_vec = len ? vectors_1.vecSetLen(dir, len) : dir;
    return [origin.slice(), ray_vec];
}
exports.rayMake = rayMake;
/**
 * Creates a ray between to points.
 * @param xyz1
 * @param xyz2
 */
function rayFromTo(debug, xyz1, xyz2) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('rayFromTo', arguments, 2);
    }
    // overloaded case
    const depth1 = arrs_1.getArrDepth(xyz1);
    const depth2 = arrs_1.getArrDepth(xyz2);
    if (depth1 === 2 || depth2 === 2) {
        if (depth2 === 1) {
            // only xyz1 is Txyz[]
            return xyz1.map(a_xyz1 => [a_xyz1, vectors_1.vecFromTo(a_xyz1, xyz2)]);
        }
        else if (depth1 === 1) {
            // only xyz2 is Txyz[]
            return xyz2.map(a_xyz2 => [xyz1, vectors_1.vecFromTo(xyz1, a_xyz2)]);
        }
        else {
            // both xyz1 and xyz2 are Txyz[], they must be equal length
            if (xyz1.length === xyz2.length) {
                const rays = [];
                for (let i = 0; i < xyz1.length; i++) {
                    rays.push([xyz1[i], vectors_1.vecFromTo(xyz1[i], xyz2[i])]);
                }
                return rays;
            }
            else {
                throw new Error('Error calculating vectors between two between lists of coordinates: The two lists must be of equal length.');
            }
        }
    }
    // normal case, both xyz1 and xyz2 are Txyz
    return [xyz1, vectors_1.vecFromTo(xyz1, xyz2)];
}
exports.rayFromTo = rayFromTo;
/**
 * Make a copy of the ray "r"
 * @param ray
 */
function rayCopy(debug, ray) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('rayCopy', arguments, 1);
    }
    // overloaded case
    const ray_dep = arrs_1.getArrDepth(ray);
    if (ray_dep === 3) {
        return ray.map(ray_one => rayCopy(debug, ray_one));
    }
    // normal case
    return [ray[0].slice(), ray[1].slice()];
}
exports.rayCopy = rayCopy;
/**
 * Move the ray "r" relative to the global X, Y, and Z axes, by vector "v".
 * @param ray
 * @param vec
 */
function rayMove(debug, ray, vec) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('rayMove', arguments, 2);
    }
    // overloaded case
    const ray_dep = arrs_1.getArrDepth(ray);
    const vec_dep = arrs_1.getArrDepth(vec);
    if (ray_dep === 3) {
        ray = ray;
        if (vec_dep === 1) {
            vec = vec;
            return ray.map(ray_one => rayMove(debug, ray_one, vec));
        }
        else if (vec_dep === 2 && ray.length === vec.length) {
            vec = vec;
            const rays = [];
            for (let i = 0; i < ray.length; i++) {
                rays.push(rayMove(debug, ray[i], vec[i]));
            }
        }
        else {
            throw new Error('Error moving a list rays with a list of vectors: The two lists must be of equal length.');
        }
    }
    // normal case
    ray = ray;
    vec = vec;
    return [vectors_1.vecAdd(ray[0], vec), ray[1].slice()];
}
exports.rayMove = rayMove;
/**
 * Rotate the ray "r1" around the ray "r2", by angle "a" (in radians).
 * @param ray1
 * @param ray2
 * @param ang
 */
function rayRot(debug, ray1, ray2, ang) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('rayRot', arguments, 3);
    }
    // overloaded case
    const ray1_dep = arrs_1.getArrDepth(ray1);
    const ray2_dep = arrs_1.getArrDepth(ray2);
    const ang_dep = arrs_1.getArrDepth(ang);
    if (ray1_dep === 3) {
        ray1 = ray1;
        if (ray2_dep === 2 && ang_dep === 0) {
            ray2 = ray2;
            ang = ang;
            return ray1.map(ray1_one => rayRot(debug, ray1_one, ray2, ang));
        }
        else if (ray2_dep === 3 && ang_dep === 1 && ray1.length === ray2.length && ray1.length === ang.length) {
            ray2 = ray2;
            ang = ang;
            const rays = [];
            for (let i = 0; i < ray1.length; i++) {
                rays.push(rayRot(debug, ray1[i], ray2[i], ang[i]));
            }
            return rays;
        }
        else {
            throw new Error('Error rotating a list planes with a list of ray2s and angles: The three lists must be of equal length.');
        }
    }
    // normal case
    ray1 = ray1;
    ray2 = ray2;
    ang = ang;
    const from_ray2_o_to_ray1_o = vectors_1.vecFromTo(ray2[0], ray1[0]);
    const rot_ray1_origin = vectors_1.vecAdd(ray2[0], vectors_1.vecRot(from_ray2_o_to_ray1_o, ray2[1], ang));
    return [rot_ray1_origin, vectors_1.vecRot(ray1[1], ray2[1], ang)];
}
exports.rayRot = rayRot;
/**
 * Move the ray "r" relative to the ray direction vector, by distance "d".
 * @param ray
 * @param dist
 */
function rayLMove(debug, ray, dist) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('rayLMove', arguments, 2);
    }
    // overloaded case
    const ray_dep = arrs_1.getArrDepth(ray);
    const dist_dep = arrs_1.getArrDepth(dist);
    if (ray_dep === 3) {
        ray = ray;
        if (dist_dep === 0) {
            dist = dist;
            return ray.map(ray_one => rayLMove(debug, ray_one, dist));
        }
        else if (dist_dep === 1 && ray.length === dist.length) {
            dist = dist;
            const rays = [];
            for (let i = 0; i < ray.length; i++) {
                rays.push(rayLMove(debug, ray[i], dist[i]));
            }
        }
        else {
            throw new Error('Error moving a list rays with a list of distances: The two lists must be of equal length.');
        }
    }
    // normal case
    ray = ray;
    dist = dist;
    const vec = vectors_1.vecMult(vectors_1.vecNorm(ray[1]), dist);
    return [vectors_1.vecAdd(ray[0], vec), ray[1].slice()];
}
exports.rayLMove = rayLMove;
/**
 * Create a ray from a plane "p", with the same origin and with a direction along the plane z axis.
 * @param pln
 */
function rayFromPln(debug, pln) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('rayFromPln', arguments, 1);
    }
    // overloaded case
    const pln_dep = arrs_1.getArrDepth(pln);
    if (pln_dep === 3) {
        return pln.map(pln_one => rayFromPln(debug, pln_one));
    }
    // normal case
    pln = pln;
    return [pln[0].slice(), vectors_1.vecCross(pln[1], pln[2])];
}
exports.rayFromPln = rayFromPln;
/**
 * Transforms a ray from a local coordinate system define by plane "p" to the global coordinate system.
 * @param r
 * @param p
 */
function rayLtoG(debug, r, p) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('rayLtoG', arguments, 2);
    }
    return _rayXForm(debug, r, p, true);
}
exports.rayLtoG = rayLtoG;
/**
 * Transforms a ray from the global coordinate system to a local coordinate system define by plane "p".
 * @param r
 * @param p
 */
function rayGtoL(debug, r, p) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('rayGtoL', arguments, 2);
    }
    return _rayXForm(debug, r, p, false);
}
exports.rayGtoL = rayGtoL;
function _rayXForm(debug, r, p, to_global) {
    // overloaded case
    const depth1 = arrs_1.getArrDepth(r);
    const depth2 = arrs_1.getArrDepth(p);
    if (depth1 === 2 && depth2 === 2) {
        // r is TRay and p is TPlane
        r = r;
        p = p;
        const p2 = [[0, 0, 0], p[1], p[2]];
        const origin = matrix_1.multMatrix(r[0], matrix_1.xformMatrix(p, to_global));
        const dir = matrix_1.multMatrix(r[1], matrix_1.xformMatrix(p2, to_global));
        return [origin, dir];
    }
    else if (depth1 === 3 && depth2 === 2) {
        // r is TRay[] and p is TPlane
        r = r;
        p = p;
        const p2 = [[0, 0, 0], p[1], p[2]];
        const m = matrix_1.xformMatrix(p, to_global);
        const m2 = matrix_1.xformMatrix(p2, to_global);
        const result = [];
        for (const a_r of r) {
            const origin = matrix_1.multMatrix(a_r[0], m);
            const dir = matrix_1.multMatrix(a_r[1], m2);
            result.push([origin, dir]);
        }
        return result;
    }
    else if (depth1 === 2 && depth2 === 3) {
        // r is TRay and p is TPlane[]
        r = r;
        p = p;
        const result = [];
        for (const a_p of p) {
            const p2 = [[0, 0, 0], a_p[1], a_p[2]];
            const origin = matrix_1.multMatrix(r[0], matrix_1.xformMatrix(a_p, to_global));
            const dir = matrix_1.multMatrix(r[1], matrix_1.xformMatrix(p2, to_global));
            result.push([origin, dir]);
        }
        return result;
    }
    else if (depth1 === 3 && depth2 === 3) {
        // r is TRay[] p is TPlane[], they must be equal length
        r = r;
        p = p;
        if (r.length !== p.length) {
            throw new Error('Error transforming rays: The list of rays and list of planes must be of equal length.');
        }
        const result = [];
        for (let i = 0; i < r.length; i++) {
            const p2 = [[0, 0, 0], p[i][1], p[i][2]];
            const origin = matrix_1.multMatrix(r[i][0], matrix_1.xformMatrix(p[i], to_global));
            const dir = matrix_1.multMatrix(r[i][1], matrix_1.xformMatrix(p2, to_global));
            result.push([origin, dir]);
        }
        return result;
    }
    throw new Error('Error transforming rays: Cannot process the input lists.');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX3JheS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2dlbl9ldmFsX3Byb2Nlc3NfYmFja2VuZC9zcmMvY29yZS9pbmxpbmUvX3JheS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHVEQUE4SDtBQUM5SCxpREFBcUQ7QUFDckQscURBQW1FO0FBQ25FLDhEQUFxRDtBQUVyRDs7Ozs7O0dBTUc7QUFDSCxTQUFnQixPQUFPLENBQUMsS0FBYyxFQUFFLE1BQW1CLEVBQUUsR0FBZ0IsRUFBRSxHQUFZO0lBQ3ZGLElBQUksS0FBSyxFQUFFO1FBQ1AsaUNBQVksQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUM1QztJQUNELGtCQUFrQjtJQUNsQixNQUFNLFVBQVUsR0FBVyxrQkFBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQy9DLE1BQU0sT0FBTyxHQUFXLGtCQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDekMsSUFBSSxVQUFVLEtBQUssQ0FBQyxJQUFJLE9BQU8sS0FBSyxDQUFDLEVBQUU7UUFDbkMsSUFBSSxPQUFPLEtBQUssQ0FBQyxFQUFFO1lBQ2Ysd0JBQXdCO1lBQ3hCLE9BQVEsTUFBaUIsQ0FBQyxHQUFHLENBQUUsVUFBVSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLFVBQWtCLEVBQUUsR0FBVyxFQUFFLEdBQUcsQ0FBUyxDQUFDLENBQUM7U0FDOUc7YUFBTSxJQUFJLFVBQVUsS0FBSyxDQUFDLEVBQUU7WUFDekIscUJBQXFCO1lBQ3JCLE9BQVEsR0FBYyxDQUFDLEdBQUcsQ0FBRSxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBYyxFQUFFLE9BQWUsRUFBRSxHQUFHLENBQVMsQ0FBQyxDQUFDO1NBQ3hHO2FBQU07WUFDSCw0REFBNEQ7WUFDNUQsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLEdB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