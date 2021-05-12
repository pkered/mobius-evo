"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// import * as doc from './typedoc-json/doc.json';
// const doc = require('@assets/typedoc-json/doc.json');
const Modules = __importStar(require("../core/modules"));
const module_list = [];
// todo: bug fix for defaults
function extract_params(func) {
    const fnStr = func.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '');
    let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).split(','); // .match( /([^\s,]+)/g);
    if (result === null || result[0] === '') {
        result = [];
    }
    const final_result = result.map(function (r) {
        r = r.trim();
        const r_value = r.split('=');
        if (r_value.length === 1) {
            return { name: r_value[0].trim(), value: undefined };
        }
        else {
            return { name: r_value[0].trim(), value: undefined };
        }
    });
    let hasReturn = true;
    if (fnStr.indexOf('return') === -1 || fnStr.indexOf('return;') !== -1) {
        hasReturn = false;
    }
    return [final_result, hasReturn];
}
for (const m_name in Modules) {
    if (!Modules[m_name]) {
        continue;
    }
    // if (m_name[0] === '_') { continue; }
    const modObj = {};
    modObj.module = m_name;
    modObj.functions = [];
    for (const fn_name of Object.keys(Modules[m_name])) {
        // if (fn_name[0] === '_') { continue; }
        const func = Modules[m_name][fn_name];
        const fnObj = {};
        fnObj.module = m_name;
        fnObj.name = fn_name;
        fnObj.argCount = func.length;
        const args = extract_params(func);
        fnObj.args = args[0];
        fnObj.hasReturn = args[1];
        modObj.functions.push(fnObj);
    }
    module_list.push(modObj);
}
function analyzeParamType(fn, paramType) {
    if (paramType.type === 'array') {
        return `${analyzeParamType(fn, paramType.elementType)}[]`;
    }
    else if (paramType.type === 'intrinsic' || paramType.type === 'reference') {
        return paramType.name;
    }
    else if (paramType.type === 'union') {
        return paramType.types.map((tp) => analyzeParamType(fn, tp)).join(' | ');
    }
    else if (paramType.type === 'tuple') {
        return '[' + paramType.elements.map((tp) => analyzeParamType(fn, tp)).join(', ') + ']';
    }
    else {
        /**
         * TODO: Update unrecognized param type here
         */
        console.log('param type requires updating:', paramType);
        console.log('in function:', fn.module + '.' + fn.name);
        return paramType.type;
    }
}
// const docs = {};
// for (const mod of doc.children) {
//     let modName: any = mod.name.split('/');
//     modName = modName[modName.length - 1];
//     if (modName.substr(0, 1) === '"' || modName.substr(0, 1) === '\'') {
//         modName = modName.substr(1, modName.length - 2);
//     } else {
//         modName = modName.substr(0, modName.length - 1);
//     }
//     if (modName.substr(0, 1) === '_' || modName === 'index') {
//         continue;
//     }
//     const moduleDoc = {};
//     if (mod.comment && mod.comment.shortText) {
//         moduleDoc['description'] = mod.comment.shortText;
//     }
//     for (const func of mod.children) {
//         const fn = {};
//         fn['name'] = func.name;
//         fn['module'] = modName;
//         if (!func['signatures']) { continue; }
//         if (func['signatures'][0].comment) {
//             const cmmt = func['signatures'][0].comment;
//             fn['description'] = cmmt.shortText;
//             if (cmmt.text) {
//                 fn['description'] = fn['description'] + cmmt.text;
//             }
//             if (cmmt.tags) {
//                 for (const fnTag of cmmt.tags) {
//                     if (fnTag.tag === 'summary') { fn['summary'] = fnTag.text;
//                     } else {
//                         if (fn[fnTag.tag]) {
//                             fn[fnTag.tag].push(fnTag.text);
//                         } else {
//                             fn[fnTag.tag] = [fnTag.text];
//                         }
//                     }
//                 }
//             }
//             fn['returns'] = cmmt.returns;
//             if (fn['returns']) { fn['returns'] = fn['returns'].trim(); }
//         }
//         fn['parameters'] = [];
//         if (func['signatures'][0].parameters) {
//             for (const param of func['signatures'][0].parameters) {
//                 let namecheck = true;
//                 for (const systemVarName in Modules._parameterTypes) {
//                     if (param.name === Modules._parameterTypes[systemVarName]) {
//                         namecheck = false;
//                         break;
//                     }
//                 }
//                 if (!namecheck) {
//                     fn['parameters'].push(undefined);
//                     continue;
//                 }
//                 const pr = {};
//                 pr['name'] = param.name;
//                 if (param.comment) {
//                     pr['description'] = param.comment.shortText || param.comment.text;
//                 }
//                 pr['type'] = analyzeParamType(fn, param.type);
//                 fn['parameters'].push(pr);
//             }
//         }
//         moduleDoc[func.name] = fn;
//     }
//     docs[modName] = moduleDoc;
// }
exports.ModuleList = module_list;
// export const ModuleDocList = docs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLWF3YXJlLmRlY29yYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2dlbl9ldmFsX3Byb2Nlc3NfYmFja2VuZC9zcmMvZGVjb3JhdG9ycy9tb2R1bGUtYXdhcmUuZGVjb3JhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUVBLGtEQUFrRDtBQUNsRCx3REFBd0Q7QUFFeEQseURBQTJDO0FBRTNDLE1BQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQztBQUV2Qiw2QkFBNkI7QUFDN0IsU0FBUyxjQUFjLENBQUMsSUFBYztJQUNsQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFFLGtDQUFrQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRS9FLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLHlCQUF5QjtJQUMxRyxJQUFJLE1BQU0sS0FBSyxJQUFJLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtRQUNwQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0tBQ2hCO0lBQ0QsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFTLENBQUM7UUFDdEMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNiLE1BQU0sT0FBTyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFN0IsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN0QixPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFB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