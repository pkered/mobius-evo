"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inline_1 = require("@assets/core/inline/inline");
var strType;
(function (strType) {
    strType[strType["NUM"] = 0] = "NUM";
    strType[strType["VAR"] = 1] = "VAR";
    strType[strType["STR"] = 2] = "STR";
    strType[strType["OTHER"] = 3] = "OTHER";
})(strType || (strType = {}));
const varStartSymbols = new Set(['#', '@', '?']);
const reservedWords = [
    'abstract', 'arguments', 'await', 'boolean',
    'break', 'byte', 'case', 'catch',
    'char', 'class', 'const', 'continue',
    'debugger', 'default', 'delete', 'do',
    'double', 'else', 'enum', 'eval',
    'export', 'extends', 'False', 'final',
    'finally', 'float', 'for', 'function',
    'goto', 'if', 'implements', 'import',
    'in', 'instanceof', 'int', 'interface',
    'let', 'long', 'native', 'new',
    'null', 'package', 'private', 'protected',
    'public', 'return', 'short', 'static',
    'super', 'switch', 'synchronized', 'this',
    'throw', 'throws', 'transient', 'true',
    'try', 'typeof', 'var', 'void',
    'volatile', 'while', 'with', 'yield',
    'Array', 'Date', 'hasOwnProperty', 'Infinity',
    'isFinite', 'isNaN', 'isPrototypeOf', 'length',
    'Math', 'NaN', 'name', 'Number', 'Object',
    'prototype', 'String', 'toString', 'undefined', 'valueOf',
    'pythonList',
];
const allConstants = inline_1.inline_func[0][1].map(constComp => constComp[0]);
const specialVars = new Set(['model', 'undefined', 'null', 'Infinity', 'true', 'false', 'True', 'False', 'None'].concat(allConstants).concat(reservedWords));
const expressions = new Set(['query.Get', 'JSON.stringify', 'JSON.parse']);
function checkArgInput(jsString) {
    const comps = splitComponents(jsString);
    if (typeof comps === 'string') {
        return false;
    }
    let i = 0;
    while (i < comps.length) {
        const comp = comps[i];
        if (comp.type === strType.OTHER) {
            if (comp.value === ';' || comp.value === '=') {
                return false;
            }
        }
        else if (comp.type === strType.VAR && comp.value[comp.value.length - 1] !== '_') {
            if (i > 0 && comps[i - 1].type === strType.OTHER && varStartSymbols.has(comps[i - 1].value)) {
            }
            else if (i + 2 < comps.length && comps[i + 1].value === '.' && expressions.has(comp.value + '.' + comps[i + 2].value)) {
                i += 2;
            }
            else if (specialVars.has(comps[i].value)) {
            }
            else {
                return false;
            }
        }
        i++;
    }
    return true;
}
exports.checkArgInput = checkArgInput;
/**
 * __________________________________________________________________________
 * __________________________________________________________________________
 * __________________________________________________________________________
 * ____________________ SPLITTING COMPONENTS FROM STRING ____________________
 * __________________________________________________________________________
 * __________________________________________________________________________
 * __________________________________________________________________________
 *
*/
function splitComponents(str) {
    const comps = [];
    let i = 0;
    while (i < str.length) {
        let code = str.charCodeAt(i);
        // numeric (0-9) ==> number
        if (code > 47 && code < 58) {
            const startI = i;
            while ((code > 47 && code < 58) || code === 46) {
                i++;
                if (i === str.length) {
                    break;
                }
                code = str.charCodeAt(i);
            }
            comps.push({ 'type': strType.NUM, 'value': str.substring(startI, i) });
            // upper alpha (A-Z) & lower alpha (a-z) or _ ==> variable
        }
        else if ((code > 64 && code < 91) || (code > 96 && code < 123) || code === 95) {
            const startI = i;
            // upper alpha (A-Z), lower alpha (a-z), numeric (0-9) and "_" are allowed for subsequent characters.
            while ((code > 64 && code < 91) || (code > 96 && code < 123) || (code > 47 && code < 58) || code === 95) {
                i += 1;
                if (i === str.length) {
                    break;
                }
                code = str.charCodeAt(i);
            }
            comps.push({ 'type': strType.VAR, 'value': str.substring(startI, i) });
            // const varString = str.substring(startI, i);
            // if (varString === 'and' || varString === 'or' || varString === 'not') {
            //     comps.push({ 'type': strType.OTHER, 'value': varString});
            // } else {
            //     comps.push({ 'type': strType.VAR, 'value': varString});
            // }
            // double-quotes (") or single-quotes (')
        }
        else if (code === 34 || code === 39) {
            const startCode = code;
            const startI = i;
            i += 1;
            code = str.charCodeAt(i);
            if (!code) {
                return 'Error: Missing ending quote.';
            }
            while (code !== startCode) { // string must end with the same quote as well
                i += 1;
                if (i === str.length) {
                    break;
                }
                code = str.charCodeAt(i);
            }
            if (code === startCode) {
                i += 1;
            }
            const subStr = str.substring(startI, i);
            if (subStr.charCodeAt(subStr.length - 1) !== startCode) {
                return 'Error: Missing ending quote.';
            }
            comps.push({ 'type': strType.STR, 'value': str.substring(startI, i) });
            // + sign or - sign ==> + / ++ / += / - / -- / -=
        }
        else if (code === 43 || code === 45) {
            if (str.charCodeAt(i + 1) === code || str.charCodeAt(i + 1) === 61) {
                comps.push({ 'type': strType.OTHER, 'value': str.substring(i, i + 2) });
                i += 2;
            }
            else {
                comps.push({ 'type': strType.OTHER, 'value': str.charAt(i) });
                i++;
            }
            // attr.push operator (>>)
        }
        else if (code === 62 && str.charCodeAt(i + 1) === 62) {
            i += 2;
            comps.push({ 'type': strType.OTHER, 'value': '>>' });
            // comparison operator (!, <, =, >)
        }
        else if (code === 33 || (code > 59 && code < 63)) {
            const startI = i;
            i++;
            if (str.charCodeAt(i) === 61) { // !=, <=, >=, ==
                i++;
                if (str.charCodeAt(i) === 61) { // !==, ===
                    if (code === 60 || code === 62) { // mark invalid for <== and >==
                        return 'Error: <== and >== not acceptable.';
                    }
                    i++;
                }
            }
            const stringCode = str.substring(startI, i);
            if (stringCode === '=') {
                return 'Error: "=" not acceptable.';
            }
            comps.push({ 'type': strType.OTHER, 'value': stringCode });
            // or operator (||); check 1st |
        }
        else if (code === 124) {
            i++;
            if (str.charCodeAt(i) !== 124) { // check 2nd |
                return 'Error: || expected.';
            }
            comps.push({ 'type': strType.OTHER, 'value': '||' });
            i++;
        }
        else if (code === 38) { // and operator (&&); check 1st &
            i++;
            if (str.charCodeAt(i) !== 38) { // check 2nd &
                return 'Error: && expected.';
            }
            comps.push({ 'type': strType.OTHER, 'value': '&&' });
            i++;
            // others: numeric operator (*, /, %), brackets ((), [], {}), comma (,), space, ...
        }
        else {
            if (code !== 32) { // add to comp if it's not space
                comps.push({ 'type': strType.OTHER, 'value': str.charAt(i) });
            }
            i++;
        }
    }
    return comps;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vZ2VuX2V2YWxfcHJvY2Vzc19iYWNrZW5kL3NyYy91dGlscy9wYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSx1REFBeUQ7QUFFekQsSUFBSyxPQUtKO0FBTEQsV0FBSyxPQUFPO0lBQ1IsbUNBQUcsQ0FBQTtJQUNILG1DQUFHLENBQUE7SUFDSCxtQ0FBRyxDQUFBO0lBQ0gsdUNBQUssQ0FBQTtBQUNULENBQUMsRUFMSSxPQUFPLEtBQVAsT0FBTyxRQUtYO0FBQ0QsTUFBTSxlQUFlLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDakQsTUFBTSxhQUFhLEdBQUc7SUFDbEIsVUFBVSxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsU0FBUztJQUMzQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPO0lBQ2hDLE1BQU0sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFVBQVU7SUFDcEMsVUFBVSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsSUFBSTtJQUNyQyxRQUFRLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNO0lBQ2hDLFFBQVEsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLE9BQU87SUFDckMsU0FBUyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsVUFBVTtJQUNyQyxNQUFNLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxRQUFRO0lBQ3BDLElBQUksRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLFdBQVc7SUFDdEMsS0FBSyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSztJQUM5QixNQUFNLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxXQUFXO0lBQ3pDLFFBQVEsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFFBQVE7SUFDckMsT0FBTyxF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