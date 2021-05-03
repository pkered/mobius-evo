"use strict";
// =====================================================================================================================
// util - check type
// =====================================================================================================================
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 * @param fn_name
 * @param arg_name
 * @param arg
 * @param check_fns
 */
function checkArgs(fn_name, arg_name, arg, check_fns) {
    let pass = false;
    const err_arr = [];
    let ret;
    if (arg === undefined) {
        throw new Error(fn_name + ': ' + arg_name + ' is undefined' + '<br>');
    }
    for (let i = 0; i < check_fns.length; i++) {
        try {
            ret = check_fns[i](arg);
        }
        catch (err) {
            err_arr.push(err.message + '<br>');
            continue;
        }
        pass = true;
        break; // passed
    }
    if (pass === false) { // Failed all tests: argument does not fall into any valid types
        // const ret_msg = fn_name + ': ' + arg_name + ' failed the following tests:<br>';
        // throw new Error(ret_msg + err_arr.join(''));
        let err_msg = 'One of the arguments passed to the ' + fn_name + ' function is invalid. ' +
            '<ul>' +
            '<li>Function name: "' + fn_name + '" </li>' +
            '<li>Parameter name: "' + arg_name + '" </li>' +
            '<li>Argument value: ' + _getSampleStr(arg) + ' </li>' +
            '<li>Argument value data type: ' + getDataTypeStrFromValue(arg) + ' </li>' +
            '</ul>' +
            'The "' + arg_name + '" parameter accepts the following data types:' +
            '<ul>';
        for (const check_fn of check_fns) {
            err_msg = err_msg + '<li>' + _getDataTypeStrFromFunc(check_fn) + ' </li>';
        }
        err_msg = err_msg +
            '</ul>' +
            ' Make sure that the agument passed to the "' + arg_name + '" parameter matches one of the above perimtted data types.';
        throw new Error(err_msg);
    }
    return ret;
}
exports.checkArgs = checkArgs;
function _getSampleStr(arg) {
    let str;
    if (Array.isArray(arg)) {
        if (arg.length > 20) {
            str = JSON.stringify(arg.slice(0, 20)) + '...array items truncated';
        }
        else {
            str = JSON.stringify(arg);
        }
    }
    else {
        str = JSON.stringify(arg);
    }
    if (str.length > 1000) {
        return str.substring(0, 1000) + ' ...data truncated';
    }
    return str;
}
// Dict
function isDict(arg) {
    if (Array.isArray(arg) || typeof arg === 'string' || arg === null || typeof arg !== 'object') {
        throw new Error();
    }
}
exports.isDict = isDict;
// List
function isList(arg) {
    if (!Array.isArray(arg)) {
        throw new Error();
    }
}
exports.isList = isList;
// List
function isLList(arg) {
    if (!Array.isArray(arg) || !Array.isArray(arg[0])) {
        throw new Error();
    }
}
exports.isLList = isLList;
// Any
function isAny(arg) {
    if (arg === undefined) {
        throw new Error();
    }
}
exports.isAny = isAny;
// Any list
function isAnyL(arg) {
    isList(arg);
    for (let i = 0; i < arg.length; i++) {
        isAny(arg[i]);
    }
}
exports.isAnyL = isAnyL;
// Null
function isNull(arg) {
    if (arg !== null) {
        throw new Error();
    }
}
exports.isNull = isNull;
// Null list
function isNullL(arg) {
    isList(arg);
    for (let i = 0; i < arg.length; i++) {
        isNull(arg[i]);
    }
}
exports.isNullL = isNullL;
// Boolean
function isBool(arg) {
    if (typeof arg !== 'boolean') {
        throw new Error();
    }
}
exports.isBool = isBool;
// Boolean list
function isBoolL(arg) {
    isList(arg);
    for (let i = 0; i < arg.length; i++) {
        isBool(arg[i]);
    }
}
exports.isBoolL = isBoolL;
// String
function isStr(arg) {
    if (typeof arg !== 'string') {
        throw new Error();
    }
}
exports.isStr = isStr;
// String list
function isStrL(arg) {
    isList(arg);
    for (let i = 0; i < arg.length; i++) {
        isStr(arg[i]);
    }
}
exports.isStrL = isStrL;
// Numbers
function isNum(arg) {
    if (isNaN(arg)) { // } || isNaN(parseInt(arg, 10))) {
        throw new Error();
    }
}
exports.isNum = isNum;
// Number list
function isNumL(arg) {
    isList(arg);
    for (let i = 0; i < arg.length; i++) {
        isNum(arg[i]);
    }
}
exports.isNumL = isNumL;
// Number between 0 and 1
function isNum01(arg) {
    isNum(arg);
    if (arg < 0 || arg > 1) {
        throw new Error();
    }
}
exports.isNum01 = isNum01;
// Number list between 0 and 1
function isNum01L(arg) {
    isNumL(arg);
    for (let i = 0; i < arg.length; i++) {
        isNum01(arg[i]);
    }
}
exports.isNum01L = isNum01L;
// Integer
function isInt(arg) {
    if (!Number.isInteger(arg)) {
        throw new Error();
    }
}
exports.isInt = isInt;
// List Integers
function isIntL(arg) {
    isList(arg);
    for (let i = 0; i < arg.length; i++) {
        isInt(arg[i]);
    }
}
exports.isIntL = isIntL;
// List Two strings
function isStrStr(arg) {
    isStrL(arg);
    isLLen(arg, 2);
}
exports.isStrStr = isStrStr;
// List String and number
function isStrNum(arg) {
    isLLen(arg, 2);
    isStr(arg[0]);
    isNum(arg[1]);
}
exports.isStrNum = isStrNum;
// List Two numbers
function isXY(arg) {
    isNumL(arg);
    isLLen(arg, 2);
}
exports.isXY = isXY;
// List Number and Int
function isXYInt(arg) {
    isIntL(arg);
    isLLen(arg, 2);
}
exports.isXYInt = isXYInt;
// List Colour - three numbers between 0 and 1
function isColor(arg) {
    isNumL(arg);
    isLLen(arg, 3);
    isNum01L(arg);
    return;
}
exports.isColor = isColor;
// List Three Numbers
function isXYZ(arg) {
    isNumL(arg);
    isLLen(arg, 3);
}
exports.isXYZ = isXYZ;
// List of Lists Three numbers
function isXYZL(arg) {
    isList(arg);
    for (let i = 0; i < arg.length; i++) {
        isXYZ(arg[i]);
    }
}
exports.isXYZL = isXYZL;
function isXYZLL(arg) {
    isList(arg);
    for (let i = 0; i < arg.length; i++) {
        isXYZL(arg[i]);
    }
}
exports.isXYZLL = isXYZLL;
function isPln(arg) {
    isXYZL(arg);
    isLLen(arg, 3);
}
exports.isPln = isPln;
function isPlnL(arg) {
    isList(arg);
    for (let i = 0; i < arg.length; i++) {
        isPln(arg[i]);
    }
}
exports.isPlnL = isPlnL;
function isBBox(arg) {
    isXYZL(arg);
    isLLen(arg, 4);
}
exports.isBBox = isBBox;
function isBBoxL(arg) {
    isList(arg);
    for (let i = 0; i < arg.length; i++) {
        isBBox(arg[i]);
    }
}
exports.isBBoxL = isBBoxL;
function isRay(arg) {
    isXYZL(arg);
    isLLen(arg, 2);
}
exports.isRay = isRay;
function isRayL(arg) {
    isList(arg);
    for (let i = 0; i < arg.length; i++) {
        isRay(arg[i]);
    }
}
exports.isRayL = isRayL;
function isRayLL(arg) {
    isList(arg);
    for (let i = 0; i < arg.length; i++) {
        isRayL(arg[i]);
    }
}
exports.isRayLL = isRayLL;
// List of specified length
function isLLen(arg, len) {
    if (arg.length !== len) {
        throw new Error();
    }
}
exports.isLLen = isLLen;
/**
 *
 * @param check_fn
 */
function _getDataTypeStrFromFunc(check_fn) {
    switch (check_fn) {
        case isAny:
            return 'anything';
        case isNull:
            return 'a null value';
        case isNullL:
            return 'a list of null values';
        case isList:
            return 'a list of values';
        case isLList:
            return 'a list of lists of values';
        case isDict:
            return 'a dictionary of values';
        case isBool:
            return 'a boolean value';
        case isBoolL:
            return 'a list of booleans';
        case isStr:
            return 'a string';
        case isStrL:
            return 'a list of strings';
        case isStrStr:
            return 'a list containing two strings';
        case isStrNum:
            return 'a list containg one string and one number';
        case isNum:
            return 'a number';
        case isNumL:
            return 'a list of numbers';
        case isInt:
            return 'an integer';
        case isXY:
            return 'a list containing two numbers';
        case isXYInt:
            return 'a list containing two integers';
        case isColor:
            return 'a list containing three numbers between 0 and 1';
        case isXYZ:
            return 'a list containing three numbers';
        case isXYZL:
            return 'a list of lists conatining three numbers';
        case isXYZLL:
            return 'a nested list of lists conatining three numbers';
        case isPln:
            return 'a plane, defined by a list of three lists, each conatining three numbers';
        case isPlnL:
            return 'a list of planes, each defined by a list of three lists, each conatining three numbers';
        case isBBox:
            return 'a bounding box, defined by a list of four lists, each conatining three numbers';
        case isBBoxL:
            return 'a list of bounding boxes, each defined by a list of four lists, each conatining three numbers';
        case isRay:
            return 'a ray, defined by a list of two lists, each conatining three numbers';
        case isRayL:
            return 'a list of rays, each defined by a list of two lists, each conatining three numbers';
        case isRayLL:
            return 'a nested list of rays, each defined by a list of two lists, each conatining three numbers';
        default:
            return 'sorry... arg type not found';
    }
}
/**
 *
 * @param arg
 */
function getDataTypeStrFromValue(arg) {
    if (Array.isArray(arg)) {
        if (arg.length === 0) {
            return 'empty list';
        }
        const types_set = new Set();
        for (const a_arg of arg) {
            types_set.add(_typeOf(a_arg));
        }
        const types_arr = Array.from(types_set.values());
        if (types_arr.length === 1) {
            return 'a list of ' + arg.length + ' ' + types_arr[0] + 's';
        }
        else {
            let str = 'a list of length ' + arg.length + ', containing ';
            for (let i = 0; i < types_arr.length; i++) {
                if (i < types_arr.length - 2) {
                    str += types_arr[i] + 's, ';
                }
                else if (i < types_arr.length - 1) {
                    str += types_arr[i] + 's and ';
                }
                else {
                    str += types_arr[i] + 's';
                }
            }
            return str;
        }
    }
    return _typeOf(arg);
}
exports.getDataTypeStrFromValue = getDataTypeStrFromValue;
function _typeOf(arg) {
    if (arg === undefined) {
        return 'undefined';
    }
    if (arg === null) {
        return 'null';
    }
    if (Array.isArray(arg)) {
        return 'list';
    }
    if (typeof arg === 'object') {
        return 'dict';
    }
    return typeof arg;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2NoZWNrX3R5cGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdHMvc3JjL2NvcmUvX2NoZWNrX3R5cGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSx3SEFBd0g7QUFDeEgsb0JBQW9CO0FBQ3BCLHdIQUF3SDs7QUFJeEg7Ozs7OztHQU1HO0FBQ0gsU0FBZ0IsU0FBUyxDQUFDLE9BQWUsRUFBRSxRQUFnQixFQUFFLEdBQVEsRUFBRSxTQUFxQjtJQUV4RixJQUFJLElBQUksR0FBRyxLQUFLLENBQUM7SUFDakIsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ25CLElBQUksR0FBRyxDQUFDO0lBQ1IsSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFO1FBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksR0FBRyxRQUFRLEdBQUcsZUFBZSxHQUFHLE1BQU0sQ0FBQyxDQUFDO0tBQ3pFO0lBQ0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDdkMsSUFBSTtZQUNBLEdBQUcsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDM0I7UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNWLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsQ0FBQztZQUNuQyxTQUFTO1NBQ1o7UUFDRCxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ1osTUFBTSxDQUFDLFNBQVM7S0FDbkI7SUFDRCxJQUFJLElBQUksS0FBSyxLQUFLLEVBQUUsRUFBRSxnRUFBZ0U7UUFDbEYsa0ZBQWtGO1FBQ2xGLCtDQUErQztRQUMvQyxJQUFJLE9BQU8sR0FDUCxxQ0FBcUMsR0FBRyxPQUFPLEdBQUcsd0JBQXdCO1lBQzFFLE1BQU07WUFDTixzQkFBc0IsR0FBRyxPQUFPLEdBQUcsU0FBUztZ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