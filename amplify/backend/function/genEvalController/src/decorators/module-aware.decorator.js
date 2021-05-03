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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLWF3YXJlLmRlY29yYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3RzL3NyYy9kZWNvcmF0b3JzL21vZHVsZS1hd2FyZS5kZWNvcmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBRUEsa0RBQWtEO0FBQ2xELHdEQUF3RDtBQUV4RCx5REFBMkM7QUFFM0MsTUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBRXZCLDZCQUE2QjtBQUM3QixTQUFTLGNBQWMsQ0FBQyxJQUFjO0lBQ2xDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUUsa0NBQWtDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFL0UsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMseUJBQXlCO0lBQzFHLElBQUksTUFBTSxLQUFLLElBQUksSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1FBQ3BDLE1BQU0sR0FBRyxFQUFFLENBQUM7S0FDaEI7SUFDRCxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVMsQ0FBQztRQUN0QyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2IsTUFBTSxPQUFPLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUU3QixJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3RCLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUMsQ0FBQztTQUN2RDthQUFN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