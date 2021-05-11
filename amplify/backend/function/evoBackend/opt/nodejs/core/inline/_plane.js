"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vectors_1 = require("@assets/libs/geom/vectors");
const arrs_1 = require("@assets/libs/util/arrs");
const _check_inline_args_1 = require("../_check_inline_args");
/**
 * Creates a plane from an origin "o", an "x" axis vector, and any other vector in the "xy" plane.
 * @param origin
 * @param x_vec
 * @param xy_vec
 */
function plnMake(debug, origin, x_vec, xy_vec) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('plnMake', arguments, 3);
    }
    // overloaded case
    const origin_dep = arrs_1.getArrDepth(origin);
    const x_vec_dep = arrs_1.getArrDepth(x_vec);
    const xy_vec_dep = arrs_1.getArrDepth(xy_vec);
    if (origin_dep === 2 || x_vec_dep === 2) {
        if (x_vec_dep === 1) {
            // only origin is Txyz[]
            return origin.map(origin_val => plnMake(debug, origin_val, x_vec, xy_vec));
        }
        else if (origin_dep === 1) {
            // only x_vec and xy_vec are Txyz[], they must be equal length
            if (xy_vec_dep === 2 && x_vec.length === xy_vec.length) {
                const vecs = [];
                for (let i = 0; i < origin.length; i++) {
                    vecs.push(plnMake(debug, origin, x_vec[i], xy_vec[i]));
                }
                return vecs;
            }
            else {
                throw new Error('Error making planes with lists of vectors: The x_vec and xy_vec lists must be of equal length.');
            }
        }
        else {
            // all origin, x_vec and xy_vec are Txyz[], they must be equal length
            if (origin.length === x_vec.length && origin.length === xy_vec.length) {
                const vecs = [];
                for (let i = 0; i < origin.length; i++) {
                    vecs.push(plnMake(debug, origin[i], x_vec[i], xy_vec[i]));
                }
                return vecs;
            }
            else {
                throw new Error('Error making planes with lists of vectors: The three lists must be of equal length.');
            }
        }
    }
    // normal case, both origin and x_vec and xy_vec are Txyz
    const x_axis = vectors_1.vecNorm(x_vec);
    const y_axis = vectors_1.vecNorm(vectors_1.vecMakeOrtho(xy_vec, x_vec));
    return [origin.slice(), x_axis, y_axis];
}
exports.plnMake = plnMake;
/**
 * Make a copy of the plane "p"
 * @param pln
 */
function plnCopy(debug, pln) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('plnCopy', arguments, 1);
    }
    // overloaded case
    const pln_dep = arrs_1.getArrDepth(pln);
    if (pln_dep === 3) {
        return pln.map(pln_one => plnCopy(debug, pln_one));
    }
    // normal case
    pln = pln;
    return [pln[0].slice(), pln[1].slice(), pln[2].slice()];
}
exports.plnCopy = plnCopy;
/**
 * Move the plane "p" relative to the global X, Y, and Z axes, by vector "v".
 * @param pln
 * @param vec
 */
function plnMove(debug, pln, vec) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('plnMove', arguments, 2);
    }
    // overloaded case
    const pln_dep = arrs_1.getArrDepth(pln);
    const vec_dep = arrs_1.getArrDepth(vec);
    if (pln_dep === 3) {
        pln = pln;
        if (vec_dep === 1) {
            vec = vec;
            return pln.map(pln_one => plnMove(debug, pln_one, vec));
        }
        else if (vec_dep === 2 && pln.length === vec.length) {
            vec = vec;
            const planes = [];
            for (let i = 0; i < pln.length; i++) {
                planes.push(plnMove(debug, pln[i], vec[i]));
            }
        }
        else {
            throw new Error('Error moving a list planes with a list of vectors: The two lists must be of equal length.');
        }
    }
    // normal case
    pln = pln;
    vec = vec;
    return [vectors_1.vecAdd(pln[0], vec), pln[1].slice(), pln[2].slice()];
}
exports.plnMove = plnMove;
/**
 * Rotate the plane "p" around the ray "r", by angle "a" (in radians).
 * @param pln
 * @param ray
 * @param ang
 */
function plnRot(debug, pln, ray, ang) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('plnRot', arguments, 3);
    }
    // overloaded case
    const pln_dep = arrs_1.getArrDepth(pln);
    const ray_dep = arrs_1.getArrDepth(ray);
    const ang_dep = arrs_1.getArrDepth(ang);
    if (pln_dep === 3) {
        pln = pln;
        if (ray_dep === 2 && ang_dep === 0) {
            ray = ray;
            ang = ang;
            return pln.map(pln_one => plnRot(debug, pln_one, ray, ang));
        }
        else if (ray_dep === 3 && ang_dep === 1 && pln.length === ray.length && pln.length === ang.length) {
            ray = ray;
            ang = ang;
            const planes = [];
            for (let i = 0; i < pln.length; i++) {
                planes.push(plnRot(debug, pln[i], ray[i], ang[i]));
            }
            return planes;
        }
        else {
            throw new Error('Error rotating a list planes with a list of rays and angles: The three lists must be of equal length.');
        }
    }
    // normal case
    pln = pln;
    ray = ray;
    ang = ang;
    const from_ray_o_to_pln_o = vectors_1.vecFromTo(ray[0], pln[0]);
    const rot_pln_origin = vectors_1.vecAdd(ray[0], vectors_1.vecRot(from_ray_o_to_pln_o, ray[1], ang));
    return [rot_pln_origin, vectors_1.vecRot(pln[1], ray[1], ang), vectors_1.vecRot(pln[2], ray[1], ang)];
}
exports.plnRot = plnRot;
/**
 * Move the plane "p" relative to the local X, Y, and Z axes, by vector "v".
 * @param pln
 * @param vec
 */
function plnLMove(debug, pln, vec) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('plnLMake', arguments, 2);
    }
    // overloaded case
    const pln_dep = arrs_1.getArrDepth(pln);
    const vec_dep = arrs_1.getArrDepth(vec);
    if (pln_dep === 3) {
        pln = pln;
        if (vec_dep === 1) {
            vec = vec;
            return pln.map(pln_one => plnMove(debug, pln_one, vec));
        }
        else if (vec_dep === 2 && pln.length === vec.length) {
            vec = vec;
            const planes = [];
            for (let i = 0; i < pln.length; i++) {
                planes.push(plnMove(debug, pln[i], vec[i]));
            }
        }
        else {
            throw new Error('Error moving a list planes with a list of vectors: The two lists must be of equal length.');
        }
    }
    // normal case
    pln = pln;
    vec = vec;
    const z_vec = vectors_1.vecCross(pln[1], pln[2]);
    const x_move_vec = vectors_1.vecMult(pln[1], vec[0]);
    const y_move_vec = vectors_1.vecMult(pln[2], vec[1]);
    const z_move_vec = vectors_1.vecMult(z_vec, vec[2]);
    const origin = vectors_1.vecsAdd([pln[0], x_move_vec, y_move_vec, z_move_vec], false);
    return [origin, pln[1].slice(), pln[2].slice()];
}
exports.plnLMove = plnLMove;
/**
 * Rotate the plane "p" around the local X axis, by angle "a" (in radians).
 * @param pln
 * @param ang
 */
function plnLRotX(debug, pln, ang) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('plnLRotX', arguments, 2);
    }
    // overloaded case
    const pln_dep = arrs_1.getArrDepth(pln);
    const ang_dep = arrs_1.getArrDepth(ang);
    if (pln_dep === 3) {
        pln = pln;
        if (ang_dep === 0) {
            // many pln, one ang
            ang = ang;
            return pln.map(pln_one => plnLRotX(debug, pln_one, ang));
        }
        else if (ang_dep === 12 && pln.length === ang.length) {
            // many pln, many ang
            ang = ang;
            const planes = [];
            for (let i = 0; i < pln.length; i++) {
                planes.push(plnLRotX(debug, pln[i], ang[i]));
            }
            return planes;
        }
        else {
            throw new Error('Error rotating a list planes with a list of angles: The two lists must be of equal length.');
        }
    }
    // normal case
    pln = pln;
    ang = ang;
    const y_axis = vectors_1.vecRot(pln[2], pln[1], ang);
    return [pln[0].slice(), pln[1].slice(), y_axis];
}
exports.plnLRotX = plnLRotX;
/**
 * Rotate the plane "p" around the local Y axis, by angle "a" (in radians).
 * @param pln
 * @param ang
 */
function plnLRotY(debug, pln, ang) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('plnLRotY', arguments, 2);
    }
    // overloaded case
    const pln_dep = arrs_1.getArrDepth(pln);
    const ang_dep = arrs_1.getArrDepth(ang);
    if (pln_dep === 3) {
        pln = pln;
        if (ang_dep === 0) {
            // many pln, one ang
            ang = ang;
            return pln.map(pln_one => plnLRotY(debug, pln_one, ang));
        }
        else if (ang_dep === 1 && pln.length === ang.length) {
            // many pln, many ang
            ang = ang;
            const planes = [];
            for (let i = 0; i < pln.length; i++) {
                planes.push(plnLRotY(debug, pln[i], ang[i]));
            }
            return planes;
        }
        else {
            throw new Error('Error rotating a list planes with a list of angles: The two lists must be of equal length.');
        }
    }
    // normal case
    pln = pln;
    ang = ang;
    const x_axis = vectors_1.vecRot(pln[1], pln[2], ang);
    return [pln[0].slice(), x_axis, pln[2].slice()];
}
exports.plnLRotY = plnLRotY;
/**
 * Rotate the plane "p" around the local Z axis, by angle "a" (in radians).
 * @param pln
 * @param ang
 */
function plnLRotZ(debug, pln, ang) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('plnLRotZ', arguments, 2);
    }
    // overloaded case
    const pln_dep = arrs_1.getArrDepth(pln);
    const ang_dep = arrs_1.getArrDepth(ang);
    if (pln_dep === 3) {
        pln = pln;
        if (ang_dep === 0) {
            // many pln, one ang
            ang = ang;
            return pln.map(pln_one => plnLRotZ(debug, pln_one, ang));
        }
        else if (ang_dep === 1 && pln.length === ang.length) {
            // many pln, many ang
            ang = ang;
            const planes = [];
            for (let i = 0; i < pln.length; i++) {
                planes.push(plnLRotZ(debug, pln[i], ang[i]));
            }
            return planes;
        }
        else {
            throw new Error('Error rotating a list planes with a list of angles: The two lists must be of equal length.');
        }
    }
    // normal case
    pln = pln;
    ang = ang;
    const z_vec = vectors_1.vecCross(pln[1], pln[2]);
    const x_axis = vectors_1.vecRot(pln[1], z_vec, ang);
    const y_axis = vectors_1.vecRot(pln[2], z_vec, ang);
    return [pln[0].slice(), x_axis, y_axis];
}
exports.plnLRotZ = plnLRotZ;
/**
 * Generate a plane from a ray...
 * @param ray
 */
function plnFromRay(debug, ray) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('plnFromRay', arguments, 1);
    }
    // overloaded case
    const ray_dep = arrs_1.getArrDepth(ray);
    if (ray_dep === 3) {
        return ray.map(ray_one => plnFromRay(debug, ray_one));
    }
    // normal case
    ray = ray;
    const z_vec = vectors_1.vecNorm(ray[1]);
    let vec = [0, 0, 1];
    if (vectors_1.vecDot(vec, z_vec) === 1) {
        vec = [1, 0, 0];
    }
    const x_axis = vectors_1.vecCross(vec, z_vec);
    const y_axis = vectors_1.vecCross(x_axis, z_vec);
    return [ray[0].slice(), x_axis, y_axis];
}
exports.plnFromRay = plnFromRay;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX3BsYW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vZ2VuX2V2YWxfcHJvY2Vzc19iYWNrZW5kL3NyYy9jb3JlL2lubGluZS9fcGxhbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFTQSx1REFBaUk7QUFDakksaURBQXFEO0FBQ3JELDhEQUFxRDtBQUdyRDs7Ozs7R0FLRztBQUNILFNBQWdCLE9BQU8sQ0FBQyxLQUFjLEVBQUUsTUFBbUIsRUFBRSxLQUFrQixFQUFFLE1BQW1CO0lBQ2hHLElBQUksS0FBSyxFQUFFO1FBQ1AsaUNBQVksQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQ3pDO0lBQ0Qsa0JBQWtCO0lBQ2xCLE1BQU0sVUFBVSxHQUFXLGtCQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDL0MsTUFBTSxTQUFTLEdBQVcsa0JBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM3QyxNQUFNLFVBQVUsR0FBVyxrQkFBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQy9DLElBQUksVUFBVSxLQUFLLENBQUMsSUFBSSxTQUFTLEtBQUssQ0FBQyxFQUFFO1FBQ3JDLElBQUksU0FBUyxLQUFLLENBQUMsRUFBRTtZQUNqQix3QkFBd0I7WUFDeEIsT0FBUSxNQUFpQixDQUFDLEdBQUcsQ0FBRSxVQUFVLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsVUFBa0IsRUFBRSxLQUFhLEVBQUUsTUFBYyxDQUFXLENBQUMsQ0FBQztTQUM3SDthQUFNLElBQUksVUFBVSxLQUFLLENBQUMsRUFBRTtZQUN6Qiw4REFBOEQ7WUFDOUQsSUFBSSxVQUFVLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssTUFBTSxDQUFDLE1BQU0sRUFBRTtnQkFDcEQsTUFBTSxJQUFJLEdBQWEsRUFBRSxDQUFDO2dCQUMxQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFB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