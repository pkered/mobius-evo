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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX3JheS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3RzL3NyYy9jb3JlL2lubGluZS9fcmF5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsdURBQThIO0FBQzlILGlEQUFxRDtBQUNyRCxxREFBbUU7QUFDbkUsOERBQXFEO0FBRXJEOzs7Ozs7R0FNRztBQUNILFNBQWdCLE9BQU8sQ0FBQyxLQUFjLEVBQUUsTUFBbUIsRUFBRSxHQUFnQixFQUFFLEdBQVk7SUFDdkYsSUFBSSxLQUFLLEVBQUU7UUFDUCxpQ0FBWSxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQzVDO0lBQ0Qsa0JBQWtCO0lBQ2xCLE1BQU0sVUFBVSxHQUFXLGtCQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDL0MsTUFBTSxPQUFPLEdBQVcsa0JBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN6QyxJQUFJLFVBQVUsS0FBSyxDQUFDLElBQUksT0FBTyxLQUFLLENBQUMsRUFBRTtRQUNuQyxJQUFJLE9BQU8sS0FBSyxDQUFDLEVBQUU7WUFDZix3QkFBd0I7WUFDeEIsT0FBUSxNQUFpQixDQUFDLEdBQUcsQ0FBRSxVQUFVLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsVUFBa0IsRUFBRSxHQUFXLEVBQUUsR0FBRyxDQUFTLENBQUMsQ0FBQztTQUM5RzthQUFNLElBQUksVUFBVSxLQUFLLENBQUMsRUFBRTtZQUN6QixxQkFBcUI7WUFDckIsT0FBUSxHQUFjLENBQUMsR0FBRyxDQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFjLEVBQUUsT0FBZSxFQUFFLEdBQUcsQ0FBUyxDQUFDLENBQUM7U0FDeEc7YUFBTTtZQUNILDREQUE0RDtZQUM1RCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssR0FBRyxDQUFDLE1BQU0sRUFBRTtnQkFDOUIsTUFBTSxJQUFJLEdB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