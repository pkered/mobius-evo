"use strict";
/**
 * Set functions for working with sets, using lists as a data structure. Does not modify input list.
 */
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
 * Generates a list of unique items.
 * @param list
 */
function setMake(debug, list) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('setMake', arguments, 1);
    }
    return Array.from(new Set(list));
}
exports.setMake = setMake;
/**
 * Generates a list of unique items from the union of the two input lists.
 * @param list1
 * @param list2
 */
function setUni(debug, list1, list2) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('setUni', arguments, 2);
    }
    return Mathjs.setUnion(list1, list2);
}
exports.setUni = setUni;
/**
 * Generates a list of unique items from the intersection of the two input lists.
 * @param list1
 * @param list2
 */
function setInt(debug, list1, list2) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('setInt', arguments, 2);
    }
    return Mathjs.setIntersect(list1, list2);
}
exports.setInt = setInt;
/**
 * Generates a list of unique items from the difference of the two input lists.
 * @param list1
 * @param list2
 */
function setDif(debug, list1, list2) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('setDif', arguments, 2);
    }
    return Mathjs.setDifference(list1, list2);
}
exports.setDif = setDif;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX3NldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2dlbl9ldmFsX3Byb2Nlc3NfYmFja2VuZC9zcmMvY29yZS9pbmxpbmUvX3NldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7OztBQUVILCtDQUFpQztBQUNqQyw4REFBcUQ7QUFDckQ7OztHQUdHO0FBQ0gsU0FBZ0IsT0FBTyxDQUFDLEtBQWMsRUFBRSxJQUFXO0lBQy9DLElBQUksS0FBSyxFQUFFO1FBQ1AsaUNBQVksQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQ3pDO0lBQ0QsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDckMsQ0FBQztBQUxELDBCQUtDO0FBQ0Q7Ozs7R0FJRztBQUNILFNBQWdCLE1BQU0sQ0FBQyxLQUFjLEVBQUUsS0FBWSxFQUFFLEtBQVk7SUFDN0QsSUFBSSxLQUFLLEVBQUU7UUFDUCxpQ0FBWSxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDeEM7SUFDRCxPQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3pDLENBQUM7QUFMRCx3QkFLQztBQUNEOzs7O0dBSUc7QUFDSCxTQUFnQixNQUFNLENBQUMsS0FBYyxFQUFFLEtBQVksRUFBRSxLQUFZO0lBQzdELElBQUksS0FBSyxFQUFFO1FBQ1AsaUNBQVksQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQ3hDO0lBQ0QsT0FBTyxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM3QyxDQUFDO0FBTEQsd0JBS0M7QUFDRDs7OztHQUlHO0FBQ0gsU0FBZ0IsTUFBTSxDQUFDLEtBQWMsRUFBRSxLQUFZLEVBQUUsS0FBWTtJQUM3RCxJQUFJLEtBQUssRUFBRTtRQUNQLGlDQUFZLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUN4QztJQUNELE9BQU8sTUFBTSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDOUMsQ0FBQztBQUxELHdCQUtDIn0=