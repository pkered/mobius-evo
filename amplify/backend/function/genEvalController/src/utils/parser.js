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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdHMvc3JjL3V0aWxzL3BhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHVEQUF5RDtBQUV6RCxJQUFLLE9BS0o7QUFMRCxXQUFLLE9BQU87SUFDUixtQ0FBRyxDQUFBO0lBQ0gsbUNBQUcsQ0FBQTtJQUNILG1DQUFHLENBQUE7SUFDSCx1Q0FBSyxDQUFBO0FBQ1QsQ0FBQyxFQUxJLE9BQU8sS0FBUCxPQUFPLFFBS1g7QUFDRCxNQUFNLGVBQWUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNqRCxNQUFNLGFBQWEsR0FBRztJQUNsQixVQUFVLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxTQUFTO0lBQzNDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU87SUFDaEMsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsVUFBVTtJQUNwQyxVQUFVLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxJQUFJO0lBQ3JDLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU07SUFDaEMsUUFBUSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsT0FBTztJQUNyQyxTQUFTLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxVQUFVO0lBQ3JDLE1BQU0sRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLFFBQVE7SUFDcEMsSUFBSSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsV0FBVztJQUN0QyxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLO0lBQzlCLE1BQU0sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFdBQVc7SUFDekMsUUFBUSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsUUFBUTtJQUNyQyxPQUFPLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxNQUFNO0lBQ3pDLE9B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