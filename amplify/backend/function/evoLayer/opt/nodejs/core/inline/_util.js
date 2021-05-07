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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX3V0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9nZW5fZXZhbF9wcm9jZXNzX2JhY2tlbmQvc3JjL2NvcmUvaW5saW5lL191dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsOERBQXFEO0FBRXJEOzs7OztHQUtHO0FBQ0gsU0FBZ0IsUUFBUSxDQUFDLEtBQWMsRUFBRSxFQUFVLEVBQUUsRUFBVSxFQUFFLENBQVM7SUFDdEUsSUFBSSxLQUFLLEVBQUU7UUFDUCxpQ0FBWSxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDMUM7SUFDRCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNqQyxDQUFDO0FBTEQsNEJBS0M7QUFDRDs7Ozs7R0FLRztBQUNILFNBQWdCLElBQUksQ0FBQyxLQUFjLEVBQUUsRUFBTyxFQUFFLEVBQU8sRUFBRSxFQUFPO0lBQzFELElBQUksS0FBSyxFQUFFO1FBQ1AsaUNBQVksQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQ3RDO0lBQ0QsT0FBTyxPQUFPLEVBQUUsS0FBSyxRQUFRLElBQUksT0FBTyxFQUFFLEtBQUssUUFBUSxJQUFJLE9BQU8sRUFBRSxLQUFLLFFBQVE7UUFDakYsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ3ZCLENBQUM7QUFORCxvQkFNQztBQUNEOzs7OztHQUtHO0FBQ0gsU0FBZ0IsUUFBUSxDQUFDLEtBQWMsRUFBRSxFQUFPLEVBQUUsRUFBTyxFQUFFLEVBQU87SUFDOUQsSUFBSSxLQUFLLEVBQUU7UUFDUCxpQ0FBWSxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDMUM7SUFDRCxPQUFPLE9BQU8sRUFBRSxLQUFLLFFBQVEsSUFBSSxPQUFPLEVBQUUsS0FBSyxRQUFRLElBQUksT0FBTyxFQUFFLEtBQUssUUFBUTtRQUNqRixFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDekIsQ0FBQztBQU5ELDRCQU1DIn0=