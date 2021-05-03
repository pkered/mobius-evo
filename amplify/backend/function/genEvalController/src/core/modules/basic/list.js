"use strict";
/**
 * The `list` module has functions for working with lists of items.
 * These functions have no direct link with the model, the are generic functions for manipulating lists.
 * The functions are often used when manipulating lists of IDs of entities in the model.
 * These functions neither make nor modify anything in the model.
 * In addition to these functions, there are also various inline functions available for working with lists.
 */
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 */
const chk = __importStar(require("../../_check_types"));
const common_id_funcs_1 = require("@assets/libs/geo-info/common_id_funcs");
const arrs_1 = require("@assets/libs/util/arrs");
// ================================================================================================
var _EAddMethod;
(function (_EAddMethod) {
    _EAddMethod["TO_START"] = "to_start";
    _EAddMethod["TO_END"] = "to_end";
    _EAddMethod["EXTEND_START"] = "extend_start";
    _EAddMethod["EXTEND_END"] = "extend_end";
    _EAddMethod["SORTED_ALPHA"] = "alpha_descending";
    _EAddMethod["SORTED_REV_ALPHA"] = "alpha_ascending";
    _EAddMethod["SORTED_NUM"] = "numeric_descending";
    _EAddMethod["SORTED_REV_NUM"] = "numeric_ascending";
    _EAddMethod["SORTED_ID"] = "ID_descending";
    _EAddMethod["SORTED_REV_ID"] = "ID_ascending";
})(_EAddMethod = exports._EAddMethod || (exports._EAddMethod = {}));
/**
 * Adds an item to a list.
 *
 * @param list List to add the item to.
 * @param item Item to add.
 * @param method Enum, select the method.
 * @returns void
 * @example append = list.Add([1,2,3], 4, 'at_end')
 * @example_info Expected value of list is [1,2,3,4].
 * @example append = list.Add([1,2,3], [4, 5], 'at_end')
 * @example_info Expected value of list is [1,2,3,[4,5]].
 * @example append = list.Add([1,2,3], [4,5], 'extend_end')
 * @example_info Expected value of list is [1,2,3,4,5].
 * @example append = list.Add(["a", "c", "d"], "b", 'alpha_descending')
 * @example_info Expected value of list is ["a", "b", "c", "d"].
 */
function Add(list, item, method) {
    // --- Error Check ---
    const fn_name = 'list.Add';
    chk.checkArgs(fn_name, 'list', list, [chk.isList]);
    chk.checkArgs(fn_name, 'value', item, [chk.isAny]);
    // --- Error Check ---
    let str_value;
    switch (method) {
        case _EAddMethod.TO_START:
            list.unshift(item);
            break;
        case _EAddMethod.TO_END:
            list.push(item);
            break;
        case _EAddMethod.EXTEND_START:
            if (!Array.isArray(item)) {
                item = [item];
            }
            for (let i = item.length - 1; i >= 0; i--) {
                list.unshift(item[i]);
            }
            break;
        case _EAddMethod.EXTEND_END:
            if (!Array.isArray(item)) {
                item = [item];
            }
            for (let i = 0; i < item.length; i++) {
                list.push(item[i]);
            }
            break;
        case _EAddMethod.SORTED_ALPHA:
            str_value = item + '';
            for (let i = 0; i < list.length + 1; i++) {
                if (str_value < list[i] + '' || i === list.length) {
                    list.splice(i, 0, item);
                    break;
                }
            }
            break;
        case _EAddMethod.SORTED_REV_ALPHA:
            str_value = item + '';
            for (let i = 0; i < list.length + 1; i++) {
                if (str_value > list[i] + '' || i === list.length) {
                    list.splice(i, 0, item);
                    break;
                }
            }
            break;
        case _EAddMethod.SORTED_NUM:
            for (let i = 0; i < list.length + 1; i++) {
                if (item - list[i] > 0 || i === list.length) {
                    list.splice(i, 0, item);
                    break;
                }
            }
            break;
        case _EAddMethod.SORTED_REV_NUM:
            for (let i = 0; i < list.length + 1; i++) {
                if (item - list[i] < 0 || i === list.length) {
                    list.splice(i, 0, item);
                    break;
                }
            }
            break;
        case _EAddMethod.SORTED_ID:
            for (let i = 0; i < list.length + 1; i++) {
                if (_compareID(item, list[i]) > 0 || i === list.length) {
                    list.splice(i, 0, item);
                    break;
                }
            }
            break;
        case _EAddMethod.SORTED_REV_ID:
            for (let i = 0; i < list.length + 1; i++) {
                if (_compareID(item, list[i]) < 0 || i === list.length) {
                    list.splice(i, 0, item);
                    break;
                }
            }
            break;
        default:
            break;
    }
}
exports.Add = Add;
// ================================================================================================
var _ERemoveMethod;
(function (_ERemoveMethod) {
    _ERemoveMethod["REMOVE_INDEX"] = "index";
    _ERemoveMethod["REMOVE_FIRST_VALUE"] = "first_value";
    _ERemoveMethod["REMOVE_LAST_VALUE"] = "last_value";
    _ERemoveMethod["REMOVE_ALL_VALUES"] = "all_values";
})(_ERemoveMethod = exports._ERemoveMethod || (exports._ERemoveMethod = {}));
/**
 * Removes items in a list.
 * \n
 * If @param method is set to 'index', then @param item should be the index of the item to be replaced.
 * Negative indexes are allowed.
 * If @param method is not set to 'index', then @param item should be the value.
 *
 * @param list The list in which to remove items
 * @param item The item to remove, either the index of the item or the value. Negative indexes are allowed.
 * @param method Enum, select the method for removing items from the list.
 * @returns void
 */
function Remove(list, item, method) {
    // --- Error Check ---
    const fn_name = 'list.Remove';
    chk.checkArgs(fn_name, 'list', list, [chk.isList]);
    chk.checkArgs(fn_name, 'item', item, [chk.isAny]);
    // --- Error Check ---
    let index;
    switch (method) {
        case _ERemoveMethod.REMOVE_INDEX:
            index = item;
            if (!isNaN(index)) {
                if (index < 0) {
                    index = list.length + index;
                }
                list.splice(index, 1);
            }
            break;
        case _ERemoveMethod.REMOVE_FIRST_VALUE:
            index = list.indexOf(item);
            if (index !== -1) {
                list.splice(index, 1);
            }
            break;
        case _ERemoveMethod.REMOVE_LAST_VALUE:
            index = list.lastIndexOf(item);
            if (index !== -1) {
                list.splice(index, 1);
            }
            break;
        case _ERemoveMethod.REMOVE_ALL_VALUES:
            for (index = 0; index < list.length; index++) {
                if (list[index] === item) {
                    list.splice(index, 1);
                    index -= 1;
                }
            }
            break;
        default:
            throw new Error('list.Remove: Remove method not recognised.');
    }
}
exports.Remove = Remove;
// ================================================================================================
var _EReplaceMethod;
(function (_EReplaceMethod) {
    _EReplaceMethod["REPLACE_INDEX"] = "index";
    _EReplaceMethod["REPLACE_FIRST_VALUE"] = "first_value";
    _EReplaceMethod["REPLACE_LAST_VALUE"] = "last_value";
    _EReplaceMethod["REPLACE_ALL_VALUES"] = "all_values";
})(_EReplaceMethod = exports._EReplaceMethod || (exports._EReplaceMethod = {}));
/**
 * Replaces items in a list.
 * \n
 * If @param method is set to 'index', then @param old_item should be the index of the item to be replaced. Negative indexes are allowed.
 * If @param method is not set to 'index', then @param old_item should be the value.
 *
 * @param list The list in which to replace items
 * @param old_item The old item to replace.
 * @param new_item The new item.
 * @param method Enum, select the method for replacing items in the list.
 * @returns void
 */
function Replace(list, old_item, new_item, method) {
    // --- Error Check ---
    const fn_name = 'list.Replace';
    chk.checkArgs(fn_name, 'list', list, [chk.isList]);
    chk.checkArgs(fn_name, 'item', old_item, [chk.isAny]);
    chk.checkArgs(fn_name, 'new_value', new_item, [chk.isAny]);
    // --- Error Check ---
    let index;
    switch (method) {
        case _EReplaceMethod.REPLACE_INDEX:
            index = old_item;
            if (!isNaN(index)) {
                if (index < 0) {
                    index = list.length + index;
                }
                list[index] = new_item;
            }
            break;
        case _EReplaceMethod.REPLACE_FIRST_VALUE:
            index = list.indexOf(old_item);
            if (index !== -1) {
                list[index] = new_item;
            }
            break;
        case _EReplaceMethod.REPLACE_LAST_VALUE:
            index = list.lastIndexOf(old_item);
            if (index !== -1) {
                list[index] = new_item;
            }
            break;
        case _EReplaceMethod.REPLACE_ALL_VALUES:
            for (index = 0; index < list.length; index++) {
                if (list[index] === old_item) {
                    list[index] = new_item;
                }
            }
            break;
        default:
            throw new Error('list.Replace: Replace method not recognised.');
    }
}
exports.Replace = Replace;
// ================================================================================================
/**
 * Sorts an list, based on the values of the items in the list.
 * \n
 * For alphabetical sort, values are sorted character by character,
 * numbers before upper case alphabets, upper case alphabets before lower case alphabets.
 *
 * @param list List to sort.
 * @param method Enum; specifies the sort method to use.
 * @returns void
 * @example list.Sort(list, 'alpha')
 * @example_info where list = ["1","2","10","Orange","apple"]
 * Expected value of list is ["1","10","2","Orange","apple"].
 * @example list.Sort(list, 'numeric')
 * @example_info where list = [56,6,48]
 * Expected value of list is [6,48,56].
 */
function Sort(list, method) {
    // --- Error Check ---
    chk.checkArgs('list.Sort', 'list', list, [chk.isList]);
    // --- Error Check ---
    _sort(list, method);
}
exports.Sort = Sort;
var _ESortMethod;
(function (_ESortMethod) {
    _ESortMethod["REV"] = "reverse";
    _ESortMethod["ALPHA"] = "alpha_descending";
    _ESortMethod["REV_ALPHA"] = "alpha_ascending";
    _ESortMethod["NUM"] = "numeric_descending";
    _ESortMethod["REV_NUM"] = "numeric_ascending";
    _ESortMethod["ID"] = "ID_descending";
    _ESortMethod["REV_ID"] = "ID_ascending";
    _ESortMethod["SHIFT"] = "shift_1";
    _ESortMethod["REV_SHIFT"] = "reverse_shift_1";
    _ESortMethod["RANDOM"] = "random";
})(_ESortMethod = exports._ESortMethod || (exports._ESortMethod = {}));
function _compareID(id1, id2) {
    const [ent_type1, index1] = common_id_funcs_1.idsBreak(id1);
    const [ent_type2, index2] = common_id_funcs_1.idsBreak(id2);
    if (ent_type1 !== ent_type2) {
        return ent_type1 - ent_type2;
    }
    if (index1 !== index2) {
        return index1 - index2;
    }
    return 0;
}
function _compareNumList(l1, l2, depth) {
    if (depth === 1) {
        return l1[0] - l2[0];
    }
    if (depth === 2) {
        return l1[0][0] - l2[0][0];
    }
    let val1 = l1;
    let val2 = l2;
    for (let i = 0; i < depth; i++) {
        val1 = val1[0];
        val2 = val2[0];
    }
    return val1 - val2;
}
function _sort(list, method) {
    switch (method) {
        case _ESortMethod.REV:
            list.reverse();
            break;
        case _ESortMethod.ALPHA:
            list.sort().reverse();
            break;
        case _ESortMethod.REV_ALPHA:
            list.sort();
            break;
        case _ESortMethod.NUM:
            if (Array.isArray(list[0])) {
                const depth = arrs_1.getArrDepth(list[0]);
                list.sort((a, b) => _compareNumList(a, b, depth)).reverse();
            }
            else {
                list.sort((a, b) => b - a);
            }
            break;
        case _ESortMethod.REV_NUM:
            if (Array.isArray(list[0])) {
                const depth = arrs_1.getArrDepth(list[0]);
                list.sort((a, b) => _compareNumList(a, b, depth));
            }
            else {
                list.sort((a, b) => a - b);
            }
            break;
        case _ESortMethod.ID:
            list.sort(_compareID).reverse();
            break;
        case _ESortMethod.REV_ID:
            list.sort(_compareID);
            break;
        case _ESortMethod.SHIFT:
            const last = list.pop();
            list.unshift(last);
            break;
        case _ESortMethod.REV_SHIFT:
            const first = list.shift();
            list.push(first);
            break;
        case _ESortMethod.RANDOM:
            list.sort(() => .5 - Math.random());
            break;
        default:
            throw new Error('list.Sort: Sort method not recognised.');
    }
}
// ================================================================================================
/**
 * Removes and inserts items in a list.
 * \n
 * If no items_to_add are specified, then items are only removed.
 * If num_to_remove is 0, then values are only inserted.
 *
 * @param list List to splice.
 * @param index Zero-based index after which to starting removing or inserting items.
 * @param num_to_remove Number of items to remove.
 * @param items_to_insert Optional, list of items to add, or null.
 * @returns void
 * @example result = list.Splice(list1, 1, 3, [2.2, 3.3])
 * @example_info where list1 = [10, 20, 30, 40, 50]
 * Expected value of result is [10, 2.2, 3.3, 50]. New items were added where the items were removed.
 */
function Splice(list, index, num_to_remove, items_to_insert) {
    // --- Error Check ---
    const fn_name = 'list.Splice';
    chk.checkArgs(fn_name, 'list', list, [chk.isList]);
    chk.checkArgs(fn_name, 'index', index, [chk.isInt]);
    chk.checkArgs(fn_name, 'num_to_remove', num_to_remove, [chk.isInt]);
    chk.checkArgs(fn_name, 'values_to_add', items_to_insert, [chk.isList]);
    // --- Error Check ---
    // avoid the spread operator
    list.splice(index, num_to_remove);
    if (items_to_insert !== null && items_to_insert.length) {
        for (let i = 0; i < items_to_insert.length; i++) {
            list.splice(index + i, 0, items_to_insert[i]);
        }
    }
}
exports.Splice = Splice;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3RzL3NyYy9jb3JlL21vZHVsZXMvYmFzaWMvbGlzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7QUFFSDs7R0FFRztBQUVILHdEQUEwQztBQUUxQywyRUFBaUU7QUFFakUsaURBQXFEO0FBR3JELG1HQUFtRztBQUNuRyxJQUFZLFdBV1g7QUFYRCxXQUFZLFdBQVc7SUFDbkIsb0NBQXFCLENBQUE7SUFDckIsZ0NBQWlCLENBQUE7SUFDakIsNENBQTZCLENBQUE7SUFDN0Isd0NBQXlCLENBQUE7SUFDekIsZ0RBQWlDLENBQUE7SUFDakMsbURBQW9DLENBQUE7SUFDcEMsZ0RBQWlDLENBQUE7SUFDakMsbURBQW9DLENBQUE7SUFDcEMsMENBQTJCLENBQUE7SUFDM0IsNkNBQThCLENBQUE7QUFDbEMsQ0FBQyxFQVhXLFdBQVcsR0FBWCxtQkFBVyxLQUFYLG1CQUFXLFFBV3RCO0FBQ0Q7Ozs7Ozs7Ozs7Ozs7OztHQWVHO0FBQ0gsU0FBZ0IsR0FBRyxDQUFDLElBQVcsRUFBRSxJQUFlLEVBQUUsTUFBbUI7SUFDakUsc0JBQXNCO0lBQ3RCLE1BQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQztJQUMzQixHQUFHLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDbkQsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ25ELHNCQUFzQjtJQUN0QixJQUFJLFNBQWlCLENBQUM7SUFDdEIsUUFBUSxNQUFNLEVBQUU7UUFDWixLQUFLLFdBQVcsQ0FBQyxRQUFRO1lBQ3JCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkIs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