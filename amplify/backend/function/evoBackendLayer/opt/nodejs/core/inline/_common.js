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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2NvbW1vbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2dlbl9ldmFsX3Byb2Nlc3NfYmFja2VuZC9zcmMvY29yZS9pbmxpbmUvX2NvbW1vbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7Ozs7OztBQUVILG9EQUE0QjtBQUM1QixxREFBdUM7QUFDdkMsa0RBQXdEO0FBQ3hELDhEQUFxRDtBQUVyRDs7O0dBR0c7QUFDSCxTQUFnQixHQUFHLENBQUMsS0FBYyxFQUFFLElBQVM7SUFDekMsSUFBSSxLQUFLLEVBQUU7UUFDUCxpQ0FBWSxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbEMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLG9CQUFLLEVBQUUscUJBQU0sRUFBRSxxQkFBTSxDQUFDLENBQUMsQ0FBQztLQUMvRDtJQUNELE9BQU8sZ0JBQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDN0IsQ0FBQztBQU5ELGtCQU1DO0FBQ0Q7OztHQUdHO0FBQ0gsU0FBZ0IsSUFBSSxDQUFDLEtBQWMsRUFBRSxJQUFTO0lBQzFDLElBQUksS0FBSyxFQUFFO1FBQ1AsaUNBQVksQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ25DLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxxQkFBTSxFQUFFLHFCQUFNLENBQUMsQ0FBQyxDQUFDO0tBQ3pEO0lBQ0QsT0FBTyxnQkFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsQyxDQUFDO0FBTkQsb0JBTUM7QUFDRDs7OztHQUlHO0FBQ0gsU0FBZ0IsS0FBSyxDQUFDLEtBQWMsRUFBRSxLQUFVLEVBQUUsS0FBVTtJQUN4RCxJQUFJLEtBQUssRUFBRTtRQUNQLGlDQUFZLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNuQyxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUMscUJBQU0sRUFBRSxxQkFBTSxDQUFDLENBQUMsQ0FBQztRQUN4RCxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUMscUJBQU0sRUFBRSxxQkFBTSxDQUFDLENBQUMsQ0FBQztLQUMzRDtJQUNELE9BQU8sZ0JBQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3hDLENBQUM7QUFQRCxzQkFPQyJ9