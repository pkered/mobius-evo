"use strict";
/**
 * Functions to work with strings.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const _check_inline_args_1 = require("../_check_inline_args");
// ['strRepl(s,search,new)', 'Replace all instances of specified search string with a new string.'],
// ['strUpp(s), 'Converts all the alphabetic characters in a string to uppercase.']
// ['strLow(s), 'Converts all the alphabetic characters in a string to lowercase.']
// ['strTrim(s), 'Removes the leading and trailing white space and line terminator characters from a string.
// ['strTrimL(s), 'Removes whitespace from the left end of a string.
// ['strTrimR(s), 'Removes whitespace from the right end of a string.
// ['strPadL(s1, m), 'Pads the start of the s1 string with white spaces so that the resulting string reaches a given length.
// ['strPadL(s1, m, s2), 'Pads the start of the s1 string with the s2 string so that the resulting string reaches a given length.
// ['strPadR(s1, m), 'Pads the end of the s1 string with white spaces so that the resulting string reaches a given length.
// ['strPadR(s1, m, s2), 'Pads the end of the s1 string with the s2 string so that the resulting string reaches a given length.
// ['strSub(s, from), 'Gets a substring beginning at the specified location.
// ['strSub(s, from, length), 'Gets a substring beginning at the specified location and having the specified length.
// ['strStarts(s1, s2), 'Returns true if the string s1 starts with s3, false otherwise.
// ['strEnds(s1, s2), 'Returns true if the string s1 ends with s3, false otherwise.
/**
 * Replace all instances of specified search string with a new string. The search string can be a regular expression.
 * @param str
 * @param search_str
 * @param new_str
 */
function strRepl(debug, str, search_str, new_str) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('strRepl', arguments, 3);
    }
    if (Array.isArray(str)) {
        return str.map(a_str => a_str.replace(search_str, new_str));
    }
    return str.replace(search_str, new_str);
}
exports.strRepl = strRepl;
/**
 * Converts all the alphabetic characters in a string to uppercase.
 * @param str
 */
function strUpp(debug, str) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('strUpp', arguments, 1);
    }
    if (Array.isArray(str)) {
        return str.map(a_str => a_str.toUpperCase());
    }
    return str.toUpperCase();
}
exports.strUpp = strUpp;
/**
 * Converts all the alphabetic characters in a string to lowercase.
 * @param str
 */
function strLow(debug, str) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('strLow', arguments, 1);
    }
    if (Array.isArray(str)) {
        return str.map(a_str => a_str.toLowerCase());
    }
    return str.toLowerCase();
}
exports.strLow = strLow;
/**
 * Removes the leading and trailing white space and line terminator characters from a string.
 * @param str
 */
function strTrim(debug, str) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('strTrim', arguments, 1);
    }
    if (Array.isArray(str)) {
        return str.map(a_str => a_str.trim());
    }
    return str.trim();
}
exports.strTrim = strTrim;
/**
 * Removes whitespace from the right end of a string.
 * @param str
 */
function strTrimR(debug, str) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('strTrimR', arguments, 1);
    }
    if (Array.isArray(str)) {
        return str.map(a_str => a_str.trimRight());
    }
    return str.trimRight();
}
exports.strTrimR = strTrimR;
/**
 * Removes whitespace from the left end of a string.
 * @param str
 */
function strTrimL(debug, str) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('strTrimL', arguments, 1);
    }
    if (Array.isArray(str)) {
        return str.map(a_str => a_str.trimLeft());
    }
    return str.trimLeft();
}
exports.strTrimL = strTrimL;
/**
 * Pads the start of the s1 string with white spaces so that the resulting string reaches a given length.
 * Pads the start of the s1 string with the s2 string so that the resulting string reaches a given length.
 * @param str
 * @param max
 * @param fill
 */
function strPadL(debug, str, max, fill) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('strPadL', arguments, 3, 2);
    }
    if (Array.isArray(str)) {
        return str.map(a_str => a_str.padStart(max, fill));
    }
    return str.padStart(max, fill);
}
exports.strPadL = strPadL;
/**
 * Pads the end of the s1 string with white spaces so that the resulting string reaches a given length.
 * Pads the end of the s1 string with the s2 string so that the resulting string reaches a given length.
 * @param str
 * @param max
 * @param fill
 */
function strPadR(debug, str, max, fill) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('strPadR', arguments, 3, 2);
    }
    if (Array.isArray(str)) {
        return str.map(a_str => a_str.padEnd(max, fill));
    }
    return str.padEnd(max, fill);
}
exports.strPadR = strPadR;
/**
 * Gets a substring beginning at the specified location.
 * Gets a substring beginning at the specified location and having the specified length.
 * @param str
 * @param from
 * @param length
 */
function strSub(debug, str, from, length) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('strSub', arguments, 3, 2);
    }
    if (Array.isArray(str)) {
        return str.map(a_str => a_str.substr(from, length));
    }
    return str.substr(from, length);
}
exports.strSub = strSub;
/**
 * Returns true if the string s1 starts with s2, false otherwise.
 * @param str
 * @param starts
 */
function strStarts(debug, str, starts) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('strStarts', arguments, 2);
    }
    if (Array.isArray(str)) {
        return str.map(a_str => a_str.startsWith(starts));
    }
    return str.startsWith(starts);
}
exports.strStarts = strStarts;
/**
 * Returns true if the string s1 ends with s2, false otherwise.
 * @param str
 * @param ends
 */
function strEnds(debug, str, ends) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('strEnds', arguments, 2);
    }
    if (Array.isArray(str)) {
        return str.map(a_str => a_str.endsWith(ends));
    }
    return str.endsWith(ends);
}
exports.strEnds = strEnds;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX3N0cnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9nZW5fZXZhbF9wcm9jZXNzX2JhY2tlbmQvc3JjL2NvcmUvaW5saW5lL19zdHJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7QUFFSCw4REFBcUQ7QUFHckQsb0dBQW9HO0FBQ3BHLG1GQUFtRjtBQUNuRixtRkFBbUY7QUFDbkYsNEdBQTRHO0FBQzVHLG9FQUFvRTtBQUNwRSxxRUFBcUU7QUFDckUsNEhBQTRIO0FBQzVILGlJQUFpSTtBQUNqSSwwSEFBMEg7QUFDMUgsK0hBQStIO0FBQy9ILDRFQUE0RTtBQUM1RSxvSEFBb0g7QUFDcEgsdUZBQXVGO0FBQ3ZGLG1GQUFtRjtBQUVuRjs7Ozs7R0FLRztBQUNILFNBQWdCLE9BQU8sQ0FBQyxLQUFjLEVBQUUsR0FBb0IsRUFBRSxVQUFrQixFQUFFLE9BQWU7SUFDN0YsSUFBSSxLQUFLLEVBQUU7UUFDUCxpQ0FBWSxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDekM7SUFDRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFBRSxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0tBQUU7SUFDeEYsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUM1QyxDQUFDO0FBTkQsMEJBTUM7QUFDRDs7O0dBR0c7QUFDSCxTQUFnQixNQUFNLENBQUMsS0FBYyxFQUFFLEdBQW9CO0lBQ3ZELElBQUksS0FBSyxFQUFFO1FBQ1AsaUNBQVksQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQ3hDO0lBQ0QsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFD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