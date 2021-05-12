"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Mathjs = __importStar(require("mathjs"));
const _check_inline_args_1 = require("../_check_inline_args");
/**
 * To be completed...
 * @param val
 */
function boolean(debug, val) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('boolean', arguments, 1);
    }
    return Mathjs.boolean(val);
}
exports.boolean = boolean;
/**
 * To be completed...
 * @param val
 */
function number(debug, val) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('number', arguments, 1);
    }
    return Mathjs.number(val);
}
exports.number = number;
/**
 * To be completed...
 * @param val
 */
function string(debug, val) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('string', arguments, 1);
    }
    return Mathjs.string(val);
}
exports.string = string;
/**
 * Returns the median absolute deviation of the list
 * @param list
 */
function mad(debug, list) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('mad', arguments, 1);
    }
    return Mathjs.mad(list);
}
exports.mad = mad;
/**
 * Returns the mean value of the list
 * @param list
 */
function mean(debug, list) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('mean', arguments, 1);
    }
    return Mathjs.mean(list);
}
exports.mean = mean;
/**
 * Returns the median of the list
 * @param list
 */
function median(debug, list) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('median', arguments, 1);
    }
    return Mathjs.median(list);
}
exports.median = median;
/**
 * Returns the mode of the list
 * @param list
 */
function mode(debug, list) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('mode', arguments, 1);
    }
    return Mathjs.mode(list);
}
exports.mode = mode;
/**
 * Returns the product of all values in a list
 * @param list
 */
function prod(debug, list) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('prod', arguments, 1);
    }
    return Mathjs.prod(list);
}
exports.prod = prod;
/**
 * Returns the standard deviation of the list
 * @param list
 */
function std(debug, list) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('std', arguments, 1);
    }
    return Mathjs.std(list);
}
exports.std = std;
/**
 * Returns the variance of the list
 * @param list
 */
function vari(debug, list) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('vari', arguments, 1);
    }
    return Mathjs.var(list);
}
exports.vari = vari;
/**
 * Returns the sum of all values in a list
 * @param list
 */
function sum(debug, list) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('sum', arguments, 1);
    }
    return Mathjs.sum(list);
}
exports.sum = sum;
/**
 * Returns the hypotenuse of all values in a list
 * @param list
 */
function hypot(debug, list) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('hypot', arguments, 1);
    }
    return Mathjs.hypot(list);
}
exports.hypot = hypot;
/**
 * Returns the norm of a list
 * @param list
 */
function norm(debug, list) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('norm', arguments, 1);
    }
    return Mathjs.norm(list);
}
exports.norm = norm;
/**
 * Returns the square of the number
 * @param list
 */
function square(debug, list) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('square', arguments, 1);
    }
    return Mathjs.square(list);
}
exports.square = square;
/**
 * Returns the cube of the number
 * @param list
 */
function cube(debug, list) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('cube', arguments, 1);
    }
    return Mathjs.cube(list);
}
exports.cube = cube;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX21hdGhqcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2dlbl9ldmFsX3Byb2Nlc3NfYmFja2VuZC9zcmMvY29yZS9pbmxpbmUvX21hdGhqcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSwrQ0FBaUM7QUFDakMsOERBQXFEO0FBQ3JEOzs7R0FHRztBQUNILFNBQWdCLE9BQU8sQ0FBQyxLQUFjLEVBQUUsR0FBVztJQUMvQyxJQUFJLEtBQUssRUFBRTtRQUNQLGlDQUFZLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUN6QztJQUNELE9BQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMvQixDQUFDO0FBTEQsMEJBS0M7QUFDRDs7O0dBR0c7QUFDSCxTQUFnQixNQUFNLENBQUMsS0FBYyxFQUFFLEdBQVc7SUFDOUMsSUFBSSxLQUFLLEVBQUU7UUFDUCxpQ0FBWSxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDeEM7SUFDRCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDOUIsQ0FBQztBQUxELHdCQUtDO0FBQ0Q7OztHQUdHO0FBQ0gsU0FBZ0IsTUFBTSxDQUFDLEtBQWMsRUFBRSxHQUFXO0lBQzlDLElBQUksS0FBSyxFQUFFO1FBQ1AsaUNBQVksQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQ3hDO0lBQ0QsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzlCLENBQUM7QUFMRCx3QkFLQztBQUNEOzs7R0FHRztBQUNILFNBQWdCLEdBQUcsQ0FBQyxLQUFjLEVBQUUsSUFBWTtJQUM1QyxJQUFJLEtBQUssRUFBRTtRQUNQLGlDQUFZLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUNy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