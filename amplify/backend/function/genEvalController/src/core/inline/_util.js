"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _check_inline_args_1 = require("../_check_inline_args");
/**
 * Returns true if the absolute difference between the two numbers is less than the tolerance, t
 * @param n1
 * @param n2
 * @param t
 */
function isApprox(debug, n1, n2, t) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('isApprox', arguments, 1);
    }
    return Math.abs(n1 - n2) < t;
}
exports.isApprox = isApprox;
/**
 * Returns v1 < v2 < v3.
 * @param v1
 * @param v2
 * @param v3
 */
function isIn(debug, v1, v2, v3) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('isIn', arguments, 1);
    }
    return typeof v1 === 'number' && typeof v2 === 'number' && typeof v3 === 'number' &&
        v1 < v2 && v2 < v3;
}
exports.isIn = isIn;
/**
 * Returns v1 <= v2 <= v3.
 * @param v1
 * @param v2
 * @param v3
 */
function isWithin(debug, v1, v2, v3) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('isWithin', arguments, 1);
    }
    return typeof v1 === 'number' && typeof v2 === 'number' && typeof v3 === 'number' &&
        v1 <= v2 && v2 <= v3;
}
exports.isWithin = isWithin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX3V0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90cy9zcmMvY29yZS9pbmxpbmUvX3V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw4REFBcUQ7QUFFckQ7Ozs7O0dBS0c7QUFDSCxTQUFnQixRQUFRLENBQUMsS0FBYyxFQUFFLEVBQVUsRUFBRSxFQUFVLEVBQUUsQ0FBUztJQUN0RSxJQUFJLEtBQUssRUFBRTtRQUNQLGlDQUFZLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUMxQztJQUNELE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2pDLENBQUM7QUFMRCw0QkFLQztBQUNEOzs7OztHQUtHO0FBQ0gsU0FBZ0IsSUFBSSxDQUFDLEtBQWMsRUFBRSxFQUFPLEVBQUUsRUFBTyxFQUFFLEVBQU87SUFDMUQsSUFBSSxLQUFLLEVBQUU7UUFDUCxpQ0FBWSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDdEM7SUFDRCxPQUFPLE9BQU8sRUFBRSxLQUFLLFFBQVEsSUFBSSxPQUFPLEVBQUUsS0FBSyxRQUFRLElBQUksT0FBTyxFQUFFLEtBQUssUUFBUTtRQUNqRixFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDdkIsQ0FBQztBQU5ELG9CQU1DO0FBQ0Q7Ozs7O0dBS0c7QUFDSCxTQUFnQixRQUFRLENBQUMsS0FBYyxFQUFFLEVBQU8sRUFBRSxFQUFPLEVBQUUsRUFBTztJQUM5RCxJQUFJLEtBQUssRUFBRTtRQUNQLGlDQUFZLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUMxQztJQUNELE9BQU8sT0FBTyxFQUFFLEtBQUssUUFBUSxJQUFJLE9BQU8sRUFBRSxLQUFLLFFBQVEsSUFBSSxPQUFPLEVBQUUsS0FBSyxRQUFRO1FBQ2pGLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUN6QixDQUFDO0FBTkQsNEJBTUMifQ==