"use strict";
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
/**
 * Functions for working with dictionaries. The functions do not modify input dictionaries.
 */
const lodash_1 = __importDefault(require("lodash"));
const chk = __importStar(require("../_check_types"));
const _check_types_1 = require("../_check_types");
const _check_inline_args_1 = require("../_check_inline_args");
/**
 * Returns the item in the dictionary specified by key.
 * If the key does nto exist, undefined is returned.
 *
 * If a list of keys is provided, then a list of values will be returned.
 *
 * @param dict The dictionary.
 * @param key The key, either a single string or a list of strings.
 */
function dictGet(debug, dict, key) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('dictGet', arguments, 2);
        chk.checkArgs('dictGet', 'dict', dict, [_check_types_1.isDict]);
        chk.checkArgs('dictGet', 'key', key, [_check_types_1.isStr, _check_types_1.isStrL]);
    }
    if (Array.isArray(key)) {
        return key.map(a_key => dict[a_key]);
    }
    return dict[key];
}
exports.dictGet = dictGet;
/**
 * Returns an array of all the keys in a dictionary.
 *
 * @param dict The dictionary.
 */
function dictKeys(debug, dict) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('dictKeys', arguments, 1);
        chk.checkArgs('dictKeys', 'dict', dict, [_check_types_1.isDict]);
    }
    return Object.keys(dict);
}
exports.dictKeys = dictKeys;
/**
 * Returns an array of all the values in a dictionary.
 *
 * @param dict The dictionary.
 */
function dictVals(debug, dict) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('dictVals', arguments, 1);
        chk.checkArgs('dictVals', 'dict', dict, [_check_types_1.isDict]);
    }
    return Object.values(dict);
}
exports.dictVals = dictVals;
/**
 * Returns true if the dictionary contains the given key, false otherwsie.
 *
 * If a list of keys is given, a list of true/false values will be returned.
 *
 * @param dict The dictionary.
 * @param key The key, either a string or a list of strings.
 */
function dictHasKey(debug, dict, key) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('dictHasKey', arguments, 2);
        chk.checkArgs('dictHasKey', 'dict', dict, [_check_types_1.isDict]);
        chk.checkArgs('dictHasKey', 'key', key, [_check_types_1.isStr, _check_types_1.isStrL]);
    }
    if (Array.isArray(key)) {
        return key.map(a_key => dict.hasOwnProperty(a_key));
    }
    return dict.hasOwnProperty(key);
}
exports.dictHasKey = dictHasKey;
/**
 * Returns true if the dictionary contains the given value, false otherwsie.
 *
 * @param dict The dictionary.
 * @param val The value to seach for, can be any type.
 */
function dictHasVal(debug, dict, val) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('dictHasVal', arguments, 2);
        chk.checkArgs('dictHasVal', 'dict', dict, [_check_types_1.isDict]);
    }
    return Object.values(dict).indexOf(val) !== -1;
}
exports.dictHasVal = dictHasVal;
/**
 * Returns the first key in the dictionary that has the given value.
 *
 * If the value does not exist, returns null.
 *
 * @param dict The dictionary.
 * @param val The value, can be any type.
 */
function dictFind(debug, dict, val) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('dictFind', arguments, 2);
        chk.checkArgs('dictFind', 'dict', dict, [_check_types_1.isDict]);
    }
    for (const key of Object.keys(dict)) {
        if (dict[key] === val) {
            return key;
        }
    }
    return null;
}
exports.dictFind = dictFind;
/**
 * Returns a deep copy of the dictionary.
 *
 * A deep copy means that changing values in the copied dictionary will not affect the original dictionary.
 *
 * @param dict The dictionary.
 */
function dictCopy(debug, dict) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('dictCopy', arguments, 1);
        chk.checkArgs('dictCopy', 'dict', dict, [_check_types_1.isDict]);
    }
    return lodash_1.default.cloneDeep(dict);
}
exports.dictCopy = dictCopy;
/**
 * Returns true if the values in the two dictionaries are equal.
 *
 * Performs a deep comparison between values to determine if they are equivalent.
 *
 * @param dict1 The first dictionary.
 * @param dict2 The second dictionary.
 */
function dictEq(debug, dict1, dict2) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('dictEq', arguments, 2);
        chk.checkArgs('dictEq', 'dict1', dict1, [_check_types_1.isDict]);
        chk.checkArgs('dictEq', 'dict2', dict2, [_check_types_1.isDict]);
    }
    return lodash_1.default.isEqual(dict1, dict2);
}
exports.dictEq = dictEq;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2RpY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90cy9zcmMvY29yZS9pbmxpbmUvX2RpY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUE7O0dBRUc7QUFDSCxvREFBNEI7QUFDNUIscURBQXVDO0FBQ3ZDLGtEQUF3RDtBQUN4RCw4REFBcUQ7QUFFckQ7Ozs7Ozs7O0dBUUc7QUFDSCxTQUFnQixPQUFPLENBQUMsS0FBYyxFQUFFLElBQVksRUFBRSxHQUFvQjtJQUN0RSxJQUFJLEtBQUssRUFBRTtRQUNQLGlDQUFZLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN0QyxHQUFHLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMscUJBQU0sQ0FBQyxDQUFDLENBQUM7UUFDakQsR0FBRyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLG9CQUFLLEVBQUUscUJBQU0sQ0FBQyxDQUFDLENBQUM7S0FDekQ7SUFDRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFBRSxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQVUsQ0FBQztLQUFFO0lBQzNFLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBUSxDQUFDO0FBQzVCLENBQUM7QUFSRCwwQkFRQztBQUNEOzs7O0dBSUc7QUFDSCxTQUFnQixRQUFRLENBQUMsS0FBYyxFQUFFLElBQVk7SUFDakQsSUFBSSxLQUFLLEVBQUU7UUFDUCxpQ0FBWSxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDdkMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLHFCQUFNLENBQUMsQ0FBQyxD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