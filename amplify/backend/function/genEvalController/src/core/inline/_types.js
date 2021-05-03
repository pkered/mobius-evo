"use strict";
/**
 * Functions to check types.
 */
Object.defineProperty(exports, "__esModule", { value: true });
// ['isNum(v)', 'Returns true if the value is a number, false otherwise.'],
// ['isInt(v)', 'Returns true if the value is a integer, false otherwise.'],
// ['isFlt(v)', 'Returns true if the value is a floating point number, false otherwise.'],
// ['isBool(v)', 'Returns true if the value is a boolean, false otherwise.'],
// ['isStr(v)', 'Returns true if the value is a string, false otherwise.'],
// ['isList(v)', 'Returns true if the value is a list, false otherwise.'],
// ['isDict(v)', 'Returns true if the value is a dictionary, false otherwise.'],
// ['isVec2(v)', 'Returns true if the value is a list of two numbers, false otherwise.'],
// ['isVec3(v)', 'Returns true if the value is a list of three numbers, false otherwise.'],
// ['isCol(v)', 'Returns true if the value is a list of three numbers in the range [0, 1], false otherwise.'],
// ['isRay(v)', 'Returns true if the value is a ray, false otherwise.'],
// ['isPln(v)', 'Returns true if the value is a plane, false otherwise.'],
// ['isNaN(v)', 'Returns true is the value is not a number (NaN), false otherwise.'],
// ['isNull(v)', 'Returns true is the value is null, false otherwise.'],
// ['isUndef(v)', 'Returns true is the value is undefined, false otherwise.'],
/**
 * Returns true if the value is a number, false otherwise.
 * @param v
 */
function isNum(debug, v) {
    return typeof v === 'number';
}
exports.isNum = isNum;
/**
 * Returns true if the value is a integer, false otherwise.
 * @param v
 */
function isInt(debug, v) {
    return Number.isInteger(v);
}
exports.isInt = isInt;
/**
 * Returns true if the value is a floating point number, false otherwise.
 * @param v
 */
function isFlt(debug, v) {
    // return !Number.isNaN(v) && v % 1 > 0;
    return typeof v === 'number';
}
exports.isFlt = isFlt;
/**
 * Returns true if the value is a boolean, false otherwise.
 * @param v
 */
function isBool(debug, v) {
    return typeof v === 'boolean';
}
exports.isBool = isBool;
/**
 * Returns true if the value is a string, false otherwise.
 * @param v
 */
function isStr(debug, v) {
    return typeof v === 'string';
}
exports.isStr = isStr;
/**
 * Returns true if the value is a list, false otherwise.
 * @param v
 */
function isList(debug, v) {
    return Array.isArray(v);
}
exports.isList = isList;
/**
 * Returns true if the value is a dictionary, false otherwise.
 * @param v
 */
function isDict(debug, v) {
    // return typeof v === 'object' && !Array.isArray(v);
    return v.constructor === Object;
}
exports.isDict = isDict;
/**
 * Returns true if the value is a list of two numbers, false otherwise.
 * @param v
 */
function isVec2(debug, v) {
    return Array.isArray(v) && v.length === 2 &&
        typeof v[0] === 'number' && typeof v[1] === 'number';
}
exports.isVec2 = isVec2;
/**
 * Returns true if the value is a list of three numbers, false otherwise.
 * @param v
 */
function isVec3(debug, v) {
    return Array.isArray(v) && v.length === 3 &&
        typeof v[0] === 'number' && typeof v[1] === 'number' && typeof v[2] === 'number';
}
exports.isVec3 = isVec3;
/**
 * Returns true if the value is a list of three numbers in the range [0, 1], false otherwise.
 * @param v
 */
function isCol(debug, v) {
    return isVec3(debug, v) && _isWithin(0, v[0], 1) && _isWithin(0, v[1], 1) && _isWithin(0, v[2], 1);
}
exports.isCol = isCol;
/**
 * Returns true if the value is a ray, false otherwise.
 * @param v
 */
function isRay(debug, v) {
    return Array.isArray(v) && v.length === 2 && isVec3(debug, v[0]) && isVec3(debug, v[1]);
}
exports.isRay = isRay;
/**
 * Returns true if the value is a plane, false otherwise.
 * @param v
 */
function isPln(debug, v) {
    return Array.isArray(v) && v.length === 3 && isVec3(debug, v[0]) && isVec3(debug, v[1]) && isVec3(debug, v[2]);
}
exports.isPln = isPln;
/**
 * Returns true is the value is not a number (NaN), false otherwise.
 * @param v
 */
function isNaN(debug, v) {
    return Number.isNaN(v);
}
exports.isNaN = isNaN;
/**
 * Returns true is the value is null, false otherwise.
 * @param v
 */
function isNull(debug, v) {
    return v === null;
}
exports.isNull = isNull;
/**
 * Returns true is the value is undefined, false otherwise.
 * @param v
 */
function isUndef(debug, v) {
    return v === undefined;
}
exports.isUndef = isUndef;
/**
 * To be completed...
 * @param v1
 * @param v2
 * @param v3
 */
function _isIn(v1, v2, v3) {
    return typeof v1 === 'number' && typeof v2 === 'number' && typeof v3 === 'number' &&
        v1 < v2 && v2 < v3;
}
exports._isIn = _isIn;
/**
 * To be completed...
 * @param v1
 * @param v2
 * @param v3
 */
function _isWithin(v1, v2, v3) {
    return typeof v1 === 'number' && typeof v2 === 'number' && typeof v3 === 'number' &&
        v1 <= v2 && v2 <= v3;
}
exports._isWithin = _isWithin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX3R5cGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdHMvc3JjL2NvcmUvaW5saW5lL190eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsMkVBQTJFO0FBQzNFLDRFQUE0RTtBQUM1RSwwRkFBMEY7QUFDMUYsNkVBQTZFO0FBQzdFLDJFQUEyRTtBQUMzRSwwRUFBMEU7QUFDMUUsZ0ZBQWdGO0FBQ2hGLHlGQUF5RjtBQUN6RiwyRkFBMkY7QUFDM0YsOEdBQThHO0FBQzlHLHdFQUF3RTtBQUN4RSwwRUFBMEU7QUFDMUUscUZBQXFGO0FBQ3JGLHdFQUF3RTtBQUN4RSw4RUFBOEU7QUFFOUU7OztHQUdHO0FBQ0gsU0FBZ0IsS0FBSyxDQUFDLEtBQWMsRUFBRSxDQUFNO0lBQ3hDLE9BQU8sT0FBTyxDQUFDLEtBQUssUUFBUSxDQUFDO0FBQ2pDLENBQUM7QUFGRCxzQkFFQztBQUNEOzs7R0FHRztBQUNILFNBQWdCLEtBQUssQ0FBQyxLQUFjLEVBQUUsQ0FBTTtJQUN4QyxPQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDL0IsQ0FBQztBQUZELHNCQUVDO0FBQ0Q7OztHQUdHO0FBQ0gsU0FBZ0IsS0FBSyxDQUFDLEtBQWMsRUFBRSxDQUFNO0lBQ3hDLHdDQUF3QztJQUN4QyxPQUFPLE9BQU8sQ0FBQyxLQUFLLFFBQVEsQ0FBQztBQUNqQyxDQUFDO0FBSEQsc0JBR0M7QUFDRDs7O0dBR0c7QUFDSCxTQUFnQixNQUFNLENBQUMsS0FBYyxFQUFFLENBQU07SUFDekMsT0FBTyxPQUFPLENBQUMsS0FBSyxTQUFTLENBQUM7QUFDbEMsQ0FBQztBQUZELHdCQUVDO0FBQ0Q7OztHQUdHO0FBQ0gsU0FBZ0IsS0FBSyxDQUFDLEtBQWMsRUFBRSxDQUFNO0lBQ3hDLE9BQU8sT0FBTyxDQUFDLEtBQUssUUFBUSxDQUFDO0FBQ2pDLENBQUM7QUFGRCxzQkFFQztBQUNEOzs7R0FHRztBQUNI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