"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const isect = __importStar(require("@libs/geom/intersect"));
const dist = __importStar(require("@libs/geom/distance"));
const _check_inline_args_1 = require("../_check_inline_args");
/**
 * Returns the intersection xyz between two rays, where...
    ['intersect(r1, r2)', 'Returns the intersection xyz between two infinite rays'],
    ['intersect(r1, r2, m)', 'Returns the intersection xyz between two rays, where ' +
        'if m=2, rays are infinite in both directions, ' +
        'if m=1 rays are infinite in one direction, ' +
        'and if m=0, rays are not infinite.'],
    ['intersect(r, p)', 'Returns the intersection xyz between an infinite ray r and an infinite plane p'],
    ['intersect(r, p, m)', 'Returns the intersection xyz between a ray r and an infinite plane p, where ' +
        'if m=2, the ray is infinite in both directions, ' +
        'if m=1 the ray is infinite in one direction, ' +
        'and if m=0, the ray is not infinite.'],
 * @param r1
 * @param r2
 * @param met
 */
function intersect(debug, r1, r2, met = 2) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('intersect', arguments, 3, 2);
    }
    return isect.intersect(r1, r2, met);
}
exports.intersect = intersect;
/**
 * Returns the xyz from projecting an xyz c onto an infinite ray r...
    ['project(c, r)', 'Returns the xyz from projecting an xyz c onto an infinite ray r'],
    ['project(c, r, m)', 'Returns the xyz from projecting an xyz c onto an infinite ray r, where ' +
        'if m=2, the ray is infinite in both directions, ' +
        'if m=1 the ray is infinite in one direction, ' +
        'and if m=0, the ray is not infinite.'],
    ['project(c, p)', 'Returns the xyz from projecting an xyz c onto an infinite plane p']
 * @param c
 * @param r
 * @param met
 */
function project(debug, c, r, met = 2) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('project', arguments, 3, 2);
    }
    return isect.project(c, r, met);
}
exports.project = project;
/**
 * Returns the Euclidean distance between two xyzs, c1 and c2'
 * Returns the Euclidean distance between an xyz c and an infinite ray r'
 * Returns the Euclidean distance between an xyz c and an infinite plane p'
 * @param c1
 * @param c2
 */
function distance(debug, c1, c2) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('distance', arguments, 2);
    }
    return dist.distance(c1, c2);
}
exports.distance = distance;
/**
 * Returns the Manhattan distance between two xyzs, c1 and c2
 * Returns the Manhattan distance between an xyz c and an infinite ray r'
 * Returns the Manhattan distance between an xyz c and an infinite plane p'
 * @param c1
 * @param c2
 */
function distanceM(debug, c1, c2) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('distanceM', arguments, 2);
    }
    return dist.distanceManhattan(c1, c2);
}
exports.distanceM = distanceM;
/**
 * Returns the Manhattan squared distance between two xyzs, c1 and c2
 * Returns the Manhattan squared distance between an xyz c and an infinite ray r'
 * Returns the Manhattan squared distance between an xyz c and an infinite plane p'
 * @param c1
 * @param c2
 */
function distanceMS(debug, c1, c2) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('distanceMS', arguments, 2);
    }
    return dist.distanceManhattanSq(c1, c2);
}
exports.distanceMS = distanceMS;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2dlb21ldHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vZ2VuX2V2YWxfcHJvY2Vzc19iYWNrZW5kL3NyYy9jb3JlL2lubGluZS9fZ2VvbWV0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsNERBQThDO0FBQzlDLDBEQUE0QztBQUM1Qyw4REFBcUQ7QUFLckQ7Ozs7Ozs7Ozs7Ozs7OztHQWVHO0FBQ0gsU0FBZ0IsU0FBUyxDQUFDLEtBQWMsRUFBRSxFQUFRLEVBQUUsRUFBZSxFQUFFLE1BQWMsQ0FBQztJQUNoRixJQUFJLEtBQUssRUFBRTtRQUNQLGlDQUFZLENBQUMsV0FBVyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDOUM7SUFDRCxPQUFPLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN4QyxDQUFDO0FBTEQsOEJBS0M7QUFDRDs7Ozs7Ozs7Ozs7R0FXRztBQUNILFNBQWdCLE9BQU8sQ0FBQyxLQUFjLEVBQUUsQ0FBTyxFQUFFLENBQWMsRUFBRSxNQUFjLENBQUM7SUFDNUUsSUFBSSxLQUFLLEVBQUU7UUFDUCxpQ0FBWSxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQzVDO0lBQ0QsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDcEMsQ0FBQztBQUxELDBCQUtDO0FBQ0Q7Ozs7OztHQU1HO0FBQ0gsU0FBZ0IsUUFBUSxDQUFDLEtBQWMsRUFBRSxFQUFRLEVBQUUsRUFBb0I7SUFDbkUsSUFBSSxLQUFLLEVBQUU7UUFDUCxpQ0FBWSxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDMUM7SUFDRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ2pDLENBQUM7QUFMRCw0QkFLQztBQUNEOzs7Ozs7R0FNRztBQUNILFNBQWdCLFNBQVMsQ0FBQyxLQUFjLEVBQUUsRUFBUSxFQUFFLEVBQW9CO0lBQ3BFLElBQUksS0FBSyxFQUFFO1FBQ1AsaUNBQVksQ0FBQyxXQUFXLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQzNDO0lBQ0QsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQzFDLENBQUM7QUFMRCw4QkFLQztBQUNEOzs7Ozs7R0FNRztBQUNILFNBQWdCLFVBQVUsQ0FBQyxLQUFjLEVBQUUsRUFBUSxFQUFFLEVBQW9CO0lBQ3JFLElBQUksS0FBSyxFQUFFO1FBQ1AsaUNBQVksQ0FBQyxZQUFZLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQzVDO0lBQ0QsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQzVDLENBQUM7QUFMRCxnQ0FLQyJ9