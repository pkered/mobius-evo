"use strict";
/**
 * Functions shared by lists, dicts, strings.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const chk = __importStar(require("../_check_types"));
const _check_types_1 = require("../_check_types");
const _check_inline_args_1 = require("../_check_inline_args");
/**
 * Returns the number of items in a list, a dictionary, or a string.
 * @param data
 */
function len(debug, data) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('len', arguments, 1);
        chk.checkArgs('len', 'data', data, [_check_types_1.isStr, _check_types_1.isList, _check_types_1.isDict]);
    }
    return lodash_1.default.size(data);
}
exports.len = len;
/**
 * Makes a deep copy of a list or a dictionary.
 * @param data
 */
function copy(debug, data) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('copy', arguments, 1);
        chk.checkArgs('copy', 'data', data, [_check_types_1.isList, _check_types_1.isDict]);
    }
    return lodash_1.default.cloneDeep(data);
}
exports.copy = copy;
/**
 * Returns true of the two lists or dictionaries are equal.
 * Performs a deep comparison between values to determine if they are equivalent.
 * @param data
 */
function equal(debug, data1, data2) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('copy', arguments, 1);
        chk.checkArgs('copy', 'data1', data1, [_check_types_1.isList, _check_types_1.isDict]);
        chk.checkArgs('copy', 'data2', data2, [_check_types_1.isList, _check_types_1.isDict]);
    }
    return lodash_1.default.isEqual(data1, data2);
}
exports.equal = equal;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2NvbW1vbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3RzL3NyYy9jb3JlL2lubGluZS9fY29tbW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7Ozs7Ozs7Ozs7O0FBRUgsb0RBQTRCO0FBQzVCLHFEQUF1QztBQUN2QyxrREFBd0Q7QUFDeEQsOERBQXFEO0FBRXJEOzs7R0FHRztBQUNILFNBQWdCLEdBQUcsQ0FBQyxLQUFjLEVBQUUsSUFBUztJQUN6QyxJQUFJLEtBQUssRUFBRTtRQUNQLGlDQUFZLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNsQyxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsb0JBQUssRUFBRSxxQkFBTSxFQUFFLHFCQUFNLENBQUMsQ0FBQyxDQUFDO0tBQy9EO0lBQ0QsT0FBTyxnQkFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3QixDQUFDO0FBTkQsa0JBTUM7QUFDRDs7O0dBR0c7QUFDSCxTQUFnQixJQUFJLENBQUMsS0FBYyxFQUFFLElBQVM7SUFDMUMsSUFBSSxLQUFLLEVBQUU7UUFDUCxpQ0FBWSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbkMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLHFCQUFNLEVBQUUscUJBQU0sQ0FBQyxDQUFDLENBQUM7S0FDekQ7SUFDRCxPQUFPLGdCQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xDLENBQUM7QUFORCxvQkFNQztBQUNEOzs7O0dBSUc7QUFDSCxTQUFnQixLQUFLLENBQUMsS0FBYyxFQUFFLEtBQVUsRUFBRSxLQUFVO0lBQ3hELElBQUksS0FBSyxFQUFFO1FBQ1AsaUNBQVksQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ25DLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxxQkFBTSxFQUFFLHFCQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3hELEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxxQkFBTSxFQUFFLHFCQUFNLENBQUMsQ0FBQyxDQUFDO0tBQzNEO0lBQ0QsT0FBTyxnQkFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDeEMsQ0FBQztBQVBELHNCQU9DIn0=