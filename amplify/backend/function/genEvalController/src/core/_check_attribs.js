"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const chk = __importStar(require("./_check_types"));
// =========================================================================================================================================
// Attribute Checks
// =========================================================================================================================================
function checkAttribName(fn_name, attrib_name) {
    chk.isStr(attrib_name); // check arg is string
    if (attrib_name === undefined) {
        throw new Error(fn_name + ': ' + 'attrib_name is undefined');
    }
    if (attrib_name.length === 0) {
        throw new Error(fn_name + ': ' + 'attrib_name not specified');
    }
    if (attrib_name.search(/\W/) !== -1) {
        throw new Error(fn_name + ': ' + 'attrib_name contains restricted characters');
    }
    if (attrib_name[0].search(/[0-9]/) !== -1) {
        throw new Error(fn_name + ': ' + 'attrib_name should not start with numbers');
    }
    // blocks writing to id
    if (attrib_name === 'id') {
        throw new Error(fn_name + ': id is not modifiable!');
    }
}
exports.checkAttribName = checkAttribName;
function checkAttribIdxKey(fn_name, idx_or_key) {
    // -- check defined index
    if (typeof idx_or_key === 'number') {
        // check if index is number
        chk.isNum(idx_or_key);
        // this is an item in a list, the item value can be any
    }
    else if (typeof idx_or_key === 'string') {
        // check if index is number
        chk.isStr(idx_or_key);
        // this is an item in an object, the item value can be any
    }
    else {
        throw new Error(fn_name + ': index or key is not a valid type: ' + idx_or_key);
    }
}
exports.checkAttribIdxKey = checkAttribIdxKey;
function checkAttribNameIdxKey(fn_name, attrib) {
    let attrib_name = null;
    let attrib_idx_key = null;
    // deconstruct the attrib arg
    if (Array.isArray(attrib)) {
        if (attrib.length !== 2) {
            throw new Error(fn_name + ': ' + 'attrib_name not specified');
        }
        attrib_name = attrib[0];
        attrib_idx_key = attrib[1];
    }
    else {
        attrib_name = attrib;
    }
    // check that the name is ok
    checkAttribName(fn_name, attrib_name);
    // check that the array index or object key is ok
    if (attrib_idx_key !== null) {
        checkAttribIdxKey(fn_name, attrib_idx_key);
    }
    // return the deconstructed attrib arg, attrib_idx_key may be null
    return [attrib_name, attrib_idx_key];
}
exports.checkAttribNameIdxKey = checkAttribNameIdxKey;
function splitAttribNameIdxKey(fn_name, attrib) {
    let attrib_name = null;
    let attrib_idx_key = null;
    // deconstruct the attrib arg
    if (Array.isArray(attrib)) {
        attrib_name = attrib[0];
        attrib_idx_key = attrib[1];
    }
    else {
        attrib_name = attrib;
    }
    // return the deconstructed attrib arg, attrib_idx_key may be null
    return [attrib_name, attrib_idx_key];
}
exports.splitAttribNameIdxKey = splitAttribNameIdxKey;
function checkAttribValue(fn_name, attrib_value) {
    // check the actual value
    chk.checkArgs(fn_name, 'attrib_value', attrib_value, [chk.isStr, chk.isNum, chk.isBool,
        chk.isNull, chk.isList, chk.isDict]);
}
exports.checkAttribValue = checkAttribValue;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2NoZWNrX2F0dHJpYnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi90cy9zcmMvY29yZS9fY2hlY2tfYXR0cmlicy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxvREFBc0M7QUFFdEMsNElBQTRJO0FBQzVJLG1CQUFtQjtBQUNuQiw0SUFBNEk7QUFDNUksU0FBZ0IsZUFBZSxDQUFDLE9BQWUsRUFBRSxXQUFtQjtJQUNoRSxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsc0JBQXNCO0lBQzlDLElBQUksV0FBVyxLQUFLLFNBQVMsRUFBRTtRQUMzQixNQUFNLElBQUksS0FBSyxDQUFFLE9BQU8sR0FBRyxJQUFJLEdBQUcsMEJBQTBCLENBQUMsQ0FBQztLQUNqRTtJQUNELElBQUksV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDMUIsTUFBTSxJQUFJLEtBQUssQ0FBRSxPQUFPLEdBQUcsSUFBSSxHQUFHLDJCQUEyQixDQUFDLENBQUM7S0FDbEU7SUFDRCxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7UUFDakMsTUFBTSxJQUFJLEtBQUssQ0FBRSxPQUFPLEdBQUcsSUFBSSxHQUFHLDRDQUE0QyxDQUFDLENBQUM7S0FDbkY7SUFDRCxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7UUFDdkMsTUFBTSxJQUFJLEtBQUssQ0FBRSxPQUFPLEdBQUcsSUFBSSxHQUFHLDJDQUEyQyxDQUFDLENBQUM7S0FDbEY7SUFDRCx1QkFBdUI7SUFDdkIsSUFBSSxXQUFXLEtBQUssSUFBSSxFQUFFO1FBQ3RCLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxHQUFHLHlCQUF5QixDQUFDLENBQUM7S0FDeEQ7QUFDTCxDQUFDO0FBbEJELDBDQWtCQztBQUNELFNBQWdCLGlC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