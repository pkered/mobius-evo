// import { INode } from '../node';
// import { IProcedure, ProcedureTypes, IFunction } from '../procedure';
// import { IPortInput, InputType } from '../port';
// import { Observable } from 'rxjs';
// import * as circularJSON from 'circular-json';
// import { _parameterTypes } from '../../core/modules';
// import { XMLHttpRequest } from 'xmlhttprequest';
// import fetch from 'node-fetch';
// let _terminateCheck: string;
// export class CodeUtils {
//     static getProcedureCode(prod: IProcedure, existingVars: string[], isMainFlowchart: Boolean,
//                             functionName: string, nodeId: string, usedFunctions?: string[]): string[] {
//         if (_terminateCheck === '' || prod.enabled === false ||
//             prod.type === ProcedureTypes.Blank ||
//             prod.type === ProcedureTypes.Comment) { return []; }
//         // mark _terminateCheck to terminate all process after this
//         if (prod.type === ProcedureTypes.Terminate && prod.enabled) {
//             // _terminateCheck = '';
//             return ['__params__.terminated = true;', 'return __params__.model;'];
//         }
//         prod.hasError = false;
//         let specialPrint = false;
//         let codeStr: string[] = [];
//         const args = prod.args;
//         let prefix = '';
//         if (args) {
//             prefix =
//             args.hasOwnProperty('0') && args[0].jsValue && args[0].jsValue.indexOf('[') === -1
//             && existingVars.indexOf(args[0].jsValue) === -1 ? 'let ' : '';
//         }
//         codeStr.push('');
//         if (isMainFlowchart && prod.type !== ProcedureTypes.Else && prod.type !== ProcedureTypes.Elseif) {
//             codeStr.push(`__params__.currentProcedure[0] = "${prod.ID}";`);
//         }
//         switch ( prod.type ) {
//             case ProcedureTypes.Variable:
//                 if (!args[0].jsValue) {
//                     codeStr.push(`${args[1].jsValue};`);
//                     break;
//                 }
//                 const repVar = this.repSetAttrib(args[0].jsValue);
//                 if (!repVar) {
//                     codeStr.push(`${prefix}${args[0].jsValue} = ${args[1].jsValue};`);
//                     if (prefix === 'let ') {
//                         existingVars.push(args[0].jsValue);
//                     }
//                 } else {
//                     codeStr.push(`${repVar[0]} ${args[1].jsValue} ${repVar[1]}`);
//                 }
//                 break;
//             case ProcedureTypes.If:
//                 specialPrint = true;
//                 // if (isMainFlowchart && prod.print) {
//                 if (prod.print) {
//                     codeStr.push(`printFunc(__params__.console,` +
//                     `'Evaluating If: (${args[0].value}) is ' + (${args[0].jsValue}), '__null__');`);
//                 }
//                 codeStr.push(`if (${args[0].jsValue}){`);
//                 // if (isMainFlowchart && prod.print) {
//                 if (prod.print) {
//                     codeStr.push(`printFunc(__params__.console,'Executing If', '__null__');`);
//                 }
//                 break;
//             case ProcedureTypes.Else:
//                 specialPrint = true;
//                 codeStr.push(`else {`);
//                 // if (isMainFlowchart && prod.print) {
//                 if (prod.print) {
//                     codeStr.push(`printFunc(__params__.console,'Executing Else', '__null__');`);
//                 }
//                 break;
//             case ProcedureTypes.Elseif:
//                 specialPrint = true;
//                 codeStr.push(`else {`);
//                 if (isMainFlowchart) {
//                     codeStr.push(`__params__.currentProcedure[0] = "${prod.ID}";`);
//                     // if (prod.print) {
//                     //     codeStr.push(`printFunc(__params__.console,` +
//                     //     `'Evaluating Else-if: (${args[0].value}) = ' + (${args[0].jsValue}), '__null__');`);
//                     // }
//                 }
//                 if (prod.print) {
//                     codeStr.push(`printFunc(__params__.console,` +
//                     `'Evaluating Else-if: (${args[0].value}) is ' + (${args[0].jsValue}), '__null__');`);
//                 }
//                 codeStr.push(`if(${args[0].jsValue}){`);
//                 // if (isMainFlowchart && prod.print) {
//                 if (prod.print) {
//                     codeStr.push(`printFunc(__params__.console,'Executing Else-if', '__null__');`);
//                 }
//                 break;
//             case ProcedureTypes.Foreach:
//                 specialPrint = true;
//                 codeStr.push(`for (${prefix} ${args[0].jsValue} of ${args[1].jsValue}){`);
//                 // if (isMainFlowchart && prod.print) {
//                 if (prod.print) {
//                     codeStr.push(`printFunc(__params__.console,` +
//                     `'Executing For-each: ${args[0].value} = ' + (${args[0].jsValue}), '__null__');`);
//                 }
//                 existingVars.push(args[0].jsValue);
//                 break;
//             case ProcedureTypes.While:
//                 specialPrint = true;
//                 codeStr.push(`while (${args[0].jsValue}){`);
//                 // if (isMainFlowchart && prod.print) {
//                 if (prod.print) {
//                     codeStr.push(`printFunc(__params__.console,` +
//                     `'Executing While: (${args[0].value}) = ' + (${args[0].jsValue}), '__null__');`);
//                 }
//                 break;
//             case ProcedureTypes.Break:
//                 codeStr.push(`break;`);
//                 break;
//             case ProcedureTypes.Continue:
//                 codeStr.push(`continue;`);
//                 break;
//             case ProcedureTypes.Constant:
//                 if (!isMainFlowchart) {
//                     return [];
//                 }
//                 let constName = args[0].jsValue;
//                 if (constName[0] === '"' || constName[0] === '\'') {
//                     constName = args[0].jsValue.substring(1, args[0].jsValue.length - 1);
//                 }
//                 codeStr.push(`__params__['constants']['${constName}'] = ${prod.resolvedValue};`);
//                 break;
//             case ProcedureTypes.AddData:
//                 let cst = args[0].value;
//                 if (!isMainFlowchart) {
//                     return [`__modules__.${_parameterTypes.addData}( __params__.model, ${cst});`];
//                 }
//                 if (cst[0] === '"' || cst[0] === '\'') {
//                     cst = args[0].value.substring(1, args[0].value.length - 1);
//                 }
//                 codeStr.push(`__params__['constants']['${cst}'] = ${prod.resolvedValue};`);
//                 if (_parameterTypes.addData) {
//                     codeStr.push(`__modules__.${_parameterTypes.addData}( __params__.model, __params__.constants['${cst}']);`);
//                 } else {
//                     codeStr.push(`__params__.model = mergeInputs( [__params__.model, __params__.constants['${cst}']]);`);
//                 }
//                 break;
//             case ProcedureTypes.Return:
//                 let check = true;
//                 const returnArgVals = [];
//                 for (const arg of args) {
//                     if (arg.name === _parameterTypes.constList) {
//                         returnArgVals.push('__params__.constants');
//                         continue;
//                     }
//                     if (arg.name === _parameterTypes.model) {
//                         returnArgVals.push('__params__.model');
//                         continue;
//                     }
//                     if (!arg.jsValue) {
//                         check = false;
//                         break;
//                     }
//                     if (arg.jsValue[0] === '#') {
//                         returnArgVals.push('`' + arg.jsValue + '`');
//                         continue;
//                     }
//                     returnArgVals.push(arg.jsValue);
//                 }
//                 if (!check) {
//                     codeStr.push(`return null;`);
//                 } else {
//                     codeStr.push(`let __return_value__ = __modules__.${_parameterTypes.return}(${returnArgVals.join(', ')});`);
//                     if (isMainFlowchart) {
//                         codeStr.push(`if (__return_value__ !== undefined && __return_value__ !== null) {` +
//                                      `__params__.console.push('<p><b>Return: <i>' + ` +
//                                      `__return_value__.toString().replace(/,/g,', ') + '</i></b></p>');` +
//                                      `} else {` +
//                                      `__params__.console.push('<p><b>Return: <i> null </i></b></p>');` +
//                                      `}`);
//                     }
//                     codeStr.push(`return __return_value__;`);
//                 }
//                 break;
//             case ProcedureTypes.MainFunction:
//                 const argVals = [];
//                 for (const arg of args.slice(1)) {
//                     if (arg.name === _parameterTypes.constList) {
//                         argVals.push('__params__.constants');
//                         continue;
//                     }
//                     if (arg.name === _parameterTypes.model) {
//                         argVals.push('__params__.model');
//                         continue;
//                     }
//                     if (arg.name === _parameterTypes.console) {
//                         argVals.push('__params__.console');
//                         continue;
//                     }
//                     if (arg.name === _parameterTypes.fileName) {
//                         argVals.push('__params__.fileName');
//                         continue;
//                     }
//                     if (arg.jsValue && arg.jsValue[0] === '#') {
//                         argVals.push('`' + arg.jsValue + '`');
//                         continue;
//                     }
//                     argVals.push(arg.jsValue);
//                 }
//                 if (prod.resolvedValue) {
//                     let prodResolvedCheck = false;
//                     for (let i = 0; i < argVals.length; i++) {
//                         if (argVals[i].indexOf('://') !== -1) {
//                             argVals[i] = prod.resolvedValue;
//                             prod.resolvedValue = null;
//                             prodResolvedCheck = true;
//                             break;
//                         }
//                     }
//                     if (!prodResolvedCheck) {
//                         argVals[1] = prod.resolvedValue;
//                     }
//                 }
//                 // const argValues = argVals.join(', ');
//                 let fnCall = `__modules__.${prod.meta.module}.${prod.meta.name}( ${argVals.join(', ')} )`;
//                 const fullName = prod.meta.module + '.' + prod.meta.name;
//                 for (const asyncFunc of _parameterTypes.asyncFuncs) {
//                     if (fullName === asyncFunc) {
//                         fnCall = 'await ' + fnCall;
//                         break;
//                     }
//                 }
//                 if ( prod.meta.module.toUpperCase() === 'OUTPUT') {
//                     if (prod.args[prod.args.length - 1].jsValue) {
//                         codeStr.push(`return ${fnCall};`);
//                     }
//                 } else if (args[0].name === '__none__' || !args[0].jsValue) {
//                     codeStr.push(`${fnCall};`);
//                 } else {
//                     const repfuncVar = this.repSetAttrib(args[0].jsValue);
//                     if (!repfuncVar) {
//                         codeStr.push(`${prefix}${args[0].jsValue} = ${fnCall};`);
//                         if (prefix === 'let ') {
//                             existingVars.push(args[0].jsValue);
//                         }
//                     } else {
//                         codeStr.push(`${repfuncVar[0]} ${fnCall} ${repfuncVar[1]}`);
//                     }
//                 }
//                 break;
//             case ProcedureTypes.LocalFuncDef:
//                 // const funcDef_prefix = `${functionName}_${nodeId}_`;
//                 let funcDef_prefix = `${nodeId}_`;
//                 if (! isMainFlowchart) {
//                     funcDef_prefix = `${functionName}_` + funcDef_prefix;
//                 }
//                 codeStr.push(`\nasync function ${funcDef_prefix}${prod.args[0].jsValue}` +
//                              `(__params__, ${prod.args.slice(1).map(arg => arg.jsValue).join(', ')}) {`);
//                 break;
//             case ProcedureTypes.LocalFuncReturn:
//                 codeStr.push(`return ${prod.args[0].jsValue};`);
//                 break;
//             case ProcedureTypes.LocalFuncCall:
//                 const lArgsVals: any = [];
//                 // const funcCall_prefix = `${functionName}_${nodeId}_`;
//                 let funcCall_prefix = `${nodeId}_`;
//                 if (! isMainFlowchart) {
//                     funcCall_prefix = `${functionName}_` + funcCall_prefix;
//                 }
//                 // let urlCheck = false;
//                 for (let i = 1; i < args.length; i++) {
//                     lArgsVals.push(args[i].jsValue);
//                 }
//                 const lfn = `await ${funcCall_prefix}${prod.meta.name}_(__params__${lArgsVals.map(val => ', ' + val).join('')})`;
//                 if (args[0].name === '__none__' || !args[0].jsValue) {
//                     codeStr.push(`${lfn};`);
//                     codeStr.push('if (__params__.terminated) { return __params__.model;}')
//                     break;
//                 }
//                 const lRepImpVar = this.repSetAttrib(args[0].jsValue);
//                 if (!lRepImpVar) {
//                     codeStr.push(`${prefix}${args[0].jsValue} = ${lfn};`);
//                 } else {
//                     codeStr.push(`${lRepImpVar[0]} ${lfn} ${lRepImpVar[1]}`);
//                 }
//                 if (prefix === 'let ') {
//                     existingVars.push(args[0].jsValue);
//                 }
//                 codeStr.push('if (__params__.terminated) { return __params__.model;}')
//                 break;
//             case ProcedureTypes.globalFuncCall:
//                 const argsVals: any = [];
//                 const namePrefix = functionName ? `${functionName}_` : '';
//                 // let urlCheck = false;
//                 if (isMainFlowchart) {
//                     usedFunctions.push(prod.meta.name);
//                 // } else {
//                 //     for (const urlfunc of _parameterTypes.urlFunctions) {
//                 //         const funcMeta = urlfunc.split('.');
//                 //         if (funcMeta[0] === prod.meta.module && funcMeta[1] === prod.meta.name) {
//                 //             urlCheck = true;
//                 //             break;
//                 //         }
//                 //     }
//                 }
//                 for (let i = 1; i < args.length; i++) {
//                     const arg = args[i];
//                     // if (urlCheck && arg.jsValue.indexOf('://') !== -1) {
//                     //     argsVals.push(prod.resolvedValue);
//                     //     prod.resolvedValue = null;
//                     // }
//                     if (arg.type.toString() !== InputType.URL.toString()) {
//                         argsVals.push(arg.jsValue);
//                         // argsVals.push(this.repGetAttrib(arg.jsValue));
//                     } else {
//                         argsVals.push(prod.resolvedValue);
//                     }
//                 }
//                 codeStr.push(`__params__.console.push('<div style="margin: 5px 0px 5px 10px; border: 1px solid #E6E6E6"><p><b> Global Function: ${prod.meta.name}</b></p>');`);
//                 const fn = `await ${namePrefix}${prod.meta.name}(__params__${argsVals.map(val => ', ' + val).join('')})`;
//                 // codeStr.push(`__params__.prevModel = __params__.model.clone();`);
//                 if (args[0].name === '__none__' || !args[0].jsValue) {
//                     codeStr.push(`${fn};`);
//                 } else {
//                     const repImpVar = this.repSetAttrib(args[0].jsValue);
//                     if (!repImpVar) {
//                         codeStr.push(`${prefix}${args[0].jsValue} = ${fn};`);
//                     } else {
//                         codeStr.push(`${repImpVar[0]} ${fn} ${repImpVar[1]}`);
//                     }
//                     if (prefix === 'let ') {
//                         existingVars.push(args[0].jsValue);
//                     }
//                 }
//                 // codeStr.push(`__params__.prevModel.merge(__params__.model);`);
//                 // codeStr.push(`__params__.model = __params__.prevModel;`);
//                 // codeStr.push(`__params__.prevModel = null;`);
//                 codeStr.push(`__params__.console.push('</div>')`);
//                 break;
//             case ProcedureTypes.Error:
//                 codeStr.push(`throw new Error('____' + ${prod.args[0].jsValue});`);
//                 break;
//         }
//         // if (isMainFlowchart && prod.print && !specialPrint && prod.args[0].name !== '__none__' && prod.args[0].jsValue) {
//         if (prod.print && !specialPrint && prod.args[0].name !== '__none__' && prod.args[0].jsValue) {
//                 // const repGet = prod.args[0].jsValue;
//             const repGet = this.repGetAttrib(prod.args[0].jsValue);
//             codeStr.push(`printFunc(__params__.console,'${prod.args[0].value}', ${repGet});`);
//         }
//         // if (isMainFlowchart && prod.selectGeom && prod.args[0].jsValue) {
//         //     // const repGet = prod.args[0].jsValue;
//         //     const repGet = this.repGetAttrib(prod.args[0].value);
//         //     const repGetJS = this.repGetAttrib(prod.args[0].jsValue);
//         //     codeStr.push(`try {` +
//         //     `\t__modules__.${_parameterTypes.select}(__params__.model, ${repGetJS}, "${repGet}"); ` +
//         //     `} catch (ex) {` +
//         //     `\t__params__.message = 'Trying to select geometric entities in node "%node%", but no entity was found';` +
//         //     `}`);
//         // }
//         if (prod.children) {
//             codeStr = codeStr.concat(CodeUtils.getProdListCode(prod.children, existingVars, isMainFlowchart,
//                                                                functionName, nodeId, usedFunctions));
//             // for (const p of prod.children) {
//             //     codeStr = codeStr.concat(CodeUtils.getProcedureCode(p, existingVars, isMainFlowchart, functionName, usedFunctions));
//             // }
//             codeStr.push(`}`);
//         }
//         return codeStr;
//     }
//     static getProdListCode(prodList: IProcedure[], existingVars: string[], isMainFlowchart: Boolean,
//                            functionName: string, nodeId: string, usedFunctions?: string[]): string[] {
//         let codeStr = [];
//         let elifcount = 0;
//         for (const p of prodList) {
//             const procedureCode = CodeUtils.getProcedureCode(p, existingVars, isMainFlowchart,
//                 functionName, nodeId, usedFunctions);
//             if ( p.type === ProcedureTypes.Elseif && p.enabled) {
//                 codeStr = codeStr.concat(procedureCode);
//                 elifcount++;
//             } else if (p.type === ProcedureTypes.Else && p.enabled) {
//                 codeStr = codeStr.concat(procedureCode);
//                 while (elifcount > 0) {
//                     codeStr.push('}');
//                     elifcount--;
//                 }
//             } else {
//                 while (elifcount > 0) {
//                     codeStr.push('}');
//                     elifcount--;
//                 }
//                 codeStr = codeStr.concat(procedureCode);
//             }
//         }
//         while (elifcount > 0) {
//             codeStr.push('}');
//             elifcount--;
//         }
//         return codeStr;
//     }
//     static repSetAttrib(val: string) {
//         if (!val || val.indexOf('@') === -1) {
//             return false;
//         }
//         // get two parts, before @ and after @
//         let val_0: string;
//         let val_1: string;
//         const atIndex: number = val.indexOf('@');
//         if (atIndex === 0) {
//             val_0 = null;
//             val_1 = val.slice(1);
//         } else {
//             val_0 = val.slice(0, atIndex);
//             val_1 = val.slice(atIndex + 1);
//         }
//         const bracketIndex = val_1.indexOf('[pythonList(');
//         if (bracketIndex !== -1) {
//             const name = val_1.slice(0, bracketIndex);
//             const index = val_1.lastIndexOf(name);
//             // return [`__modules__.${_parameterTypes.setattrib}(__params__.model, ${val_0}, '${name}', ` +
//             //         `${val_1.substring(bracketIndex + 12, index - 2)},`, `);`];
//             return [`__modules__.${_parameterTypes.setattrib}(__params__.model, ${val_0},` +
//                     `['${name}', ${val_1.substring(bracketIndex + 12, index - 2)}], `, `);`];
//         } else {
//             // return [`__modules__.${_parameterTypes.setattrib}(__params__.model, ${val_0}, '${val_1}', null, `, ');'];
//             return [`__modules__.${_parameterTypes.setattrib}(__params__.model, ${val_0}, '${val_1}', `, ');'];
//         }
//     }
//     static repGetAttrib(val: string) {
//         if (!val) { return; }
//         const res = val.split('@');
//         if (res.length === 1 ) {
//             return val;
//         }
//         let entity = res[0];
//         if (res[0] === '') {
//             entity = 'null';
//         }
//         let att_name;
//         let att_index;
//         const bracketIndex = res[1].indexOf('.slice(');
//         if (bracketIndex !== -1) {
//             att_name = res[1].slice(0, bracketIndex);
//             att_index = res[1].slice(bracketIndex + 7, -4);
//         } else {
//             att_name = res[1];
//             att_index = 'null';
//         }
//         if (att_index === 'null') {
//             return `__modules__.${_parameterTypes.getattrib}(__params__.model, ${entity}, '${att_name}', 'one_value')`;
//         }
//         return `__modules__.${_parameterTypes.getattrib}(__params__.model, ${entity}, ['${att_name}', ${att_index}], 'one_value')`;
//         // return `__modules__.${_parameterTypes.getattrib}(__params__.model, ${entity}, '${att_name}', ${att_index}, 'one_value')`;
//     }
//     static async getURLContent(url: string): Promise<any> {
//         url = url.replace('http://', 'https://');
//         if (url.indexOf('dropbox') !== -1) {
//             url = url.replace('www', 'dl').replace('dl=0', 'dl=1');
//         }
//         if (url[0] === '"' || url[0] === '\'') {
//             url = url.substring(1);
//         }
//         if (url[url.length - 1] === '"' || url[url.length - 1] === '\'') {
//             url = url.substring(0, url.length - 1);
//         }
//         const p = new Promise((resolve) => {
//             fetch(url).then(res => {
//                 if (!res.ok) {
//                     resolve('HTTP Request Error: Unable to retrieve file from ' + url);
//                     return '';
//                 }
//                 if (url.indexOf('.zip') !== -1) {
//                     res.blob().then(body => resolve(body));
//                 } else {
//                     res.text().then(body => resolve(body.replace(/(\\[bfnrtv\'\"\\])/g, '\\$1')));
//                 }
//             // }).then(body => {
//             //     resolve(body.replace(/(\\[bfnrtv\'\"\\])/g, '\\$1'));
//             });
//             // const request = new XMLHttpRequest();
//             // request.open('GET', url);
//             // request.onreadystatechange =  () => {
//             //     setTimeout(() => {
//             //         resolve('HTTP Request Error: request file timeout from url ' + url);
//             //     }, 5000);
//             // };
//             // // request.overrideMimeType('text/plain; charset=x-user-defined');
//             // request.onload = () => {
//             //     resolve(request.responseText.replace(/(\\[bfnrtv\'\"\\])/g, '\\$1'));
//             // };
//             // request.onerror = () => {
//             //     resolve('HTTP Request Error: unable to retrieve file from url ' + url);
//             // };
//             // request.send();
//         });
//         return await p;
//     }
//     static async getStartInput(arg, inputMode): Promise<any> {
//         const val = arg.jsValue || arg.value;
//         let result = val;
//         if (inputMode.toString() === InputType.URL.toString() ) {
//             result = await CodeUtils.getURLContent(val);
//             if (result.indexOf('HTTP Request Error') !== -1) {
//                 throw(new Error(result));
//             }
//             result = '`' + result + '`';
//         } else if (inputMode.toString() === InputType.File.toString()) {
//             result = window.localStorage.getItem(val.name);
//             if (!result) {
//                 const p = new Promise((resolve) => {
//                     const reader = new FileReader();
//                     reader.onload = function() {
//                         resolve(reader.result);
//                     };
//                     reader.onerror = () => {
//                         resolve('File Reading Error: unable to read file ' + val.name);
//                     };
//                     reader.readAsText(val);
//                 });
//                 result = await p;
//                 if (result.indexOf('File Reading Error') !== -1) {
//                     throw(new Error(result));
//                 }
//                 result = '`' + result + '`';
//                 // let savedFiles: any = window.localStorage.getItem('savedFileList');
//                 // if (!savedFiles) {
//                 //     window.localStorage.setItem('savedFileList', `["${val.name}"]`);
//                 // } else {
//                 //     savedFiles = JSON.parse(savedFiles);
//                 //     window.localStorage.removeItem(savedFiles[0]);
//                 //     window.localStorage.setItem('savedFileList', `["${val.name}"]`);
//                 // }
//                 // window.localStorage.setItem(val.name, result);
//                 arg.jsValue = {'name': val.name};
//             }
//         }
//         return result;
//     }
//     static loadFile(f) {
//         const stream = Observable.create(observer => {
//           const request = new XMLHttpRequest();
//           request.open('GET', f.download_url);
//           request.onload = () => {
//               if (request.status === 200) {
//                   const fl = circularJSON.parse(request.responseText);
//                   observer.next(fl);
//                   observer.complete();
//               } else {
//                   observer.error('error happened');
//               }
//           };
//           request.onerror = () => {
//           observer.error('error happened');
//           };
//           request.send();
//         });
//         stream.subscribe(loadeddata => {
//           return loadeddata;
//         });
//     }
//     // static mergeInputs(models): any {
//     //     const result = _parameterTypes.newFn();
//     //     for (const model of models) {
//     //         _parameterTypes.mergeFn(result, model);
//     //     }
//     //     return result;
//     // }
//     static mergeInputs(models): any {
//         let result = null;
//         if (models.length === 0) {
//             result = _parameterTypes.newFn();
//         } else if (models.length === 1) {
//             result = models[0].clone();
//         } else {
//             result = models[0].clone();
//             for (let i = 1; i < models.length; i++) {
//                 _parameterTypes.mergeFn(result, models[i]);
//             }
//         }
//         return result;
//     }
//     static getInputValue(inp: IPortInput, node: INode, nodeIndices: {}): Promise<string> {
//         let input: any;
//         // const x = performance.now();
//         if (node.type === 'start' || inp.edges.length === 0) {
//             input = _parameterTypes['newFn']();
//         // } else if (inp.edges.length === 1 && inp.edges[0].source.parentNode.enabled) {
//         //     input = inp.edges[0].source.value.clone();
//         //     console.log('clone time:', performance.now() - x);
//         } else {
//             let inputs = [];
//             for (const edge of inp.edges) {
//                 if (!edge.source.parentNode.enabled) {
//                     continue;
//                 }
//                 inputs.push([nodeIndices[edge.source.parentNode.id], edge.source.value]);
//             }
//             inputs = inputs.sort((a, b) => a[0] - b[0]);
//             const mergeModels = inputs.map(i => i[1])
//             input = CodeUtils.mergeInputs(mergeModels);
//             // console.log('merge time:', performance.now() - x);
//         }
//         return input;
//     }
//     public static getNodeCode(node: INode, isMainFlowchart = false, nodeIndices: {},
//                               functionName: string, nodeId: string, usedFunctions?: string[]): [string[][], string] {
//         node.hasError = false;
//         let codeStr = [];
//         // reset terminate check to false at start node (only in main flowchart's start node).
//         // for every node after that, if terminate check is true, do not execute the node.
//         if (!isMainFlowchart) {
//             // do nothing
//         } else if (node.type === 'start') {
//             _terminateCheck = null;
//         } else if (_terminateCheck) {
//             return [undefined, _terminateCheck];
//         }
//         let varsDefined: string[];
//         // procedure
//         for (const prod of node.localFunc) {
//             varsDefined = [];
//             for (const arg of prod.args.slice(1)) {
//                 varsDefined.push(arg.jsValue);
//             }
//             codeStr = codeStr.concat(CodeUtils.getProcedureCode(prod, varsDefined, isMainFlowchart, functionName,
//                                                                 nodeId, usedFunctions));
//         }
//         // input initializations
//         if (isMainFlowchart) {
//             const input = CodeUtils.getInputValue(node.input, node, nodeIndices);
//             node.input.value = input;
//         }
//         if (node.type === 'start') {
//             codeStr.push('__params__.constants = {};\n');
//         }
//         codeStr.push('_-_-_+_-_-_');
//         codeStr.push('while (true) {');
//         codeStr.push(`__modules__.${_parameterTypes.preprocess}( __params__.model);`);
//         varsDefined = [];
//         codeStr = codeStr.concat(CodeUtils.getProdListCode(node.procedure, varsDefined, isMainFlowchart, functionName,
//                                                            nodeId, usedFunctions));
//         // for (const prod of node.procedure) {
//         //     // if (node.type === 'start' && !isMainFlowchart) { break; }
//         //     codeStr = codeStr.concat(CodeUtils.getProcedureCode(prod, varsDefined, isMainFlowchart, functionName, usedFunctions));
//         // }
//         if (node.type === 'end' && node.procedure.length > 0) {
//             codeStr.push('break; }');
//             // codeStr.splice(codeStr.length - 2, 0, 'break; }');
//             // return [[codeStr, varsDefined], _terminateCheck];
//         } else {
//             codeStr.push(`__modules__.${_parameterTypes.postprocess}( __params__.model);`);
//             codeStr.push('break; }');
//             codeStr.push('return __params__.model;');
//         }
//         if (_terminateCheck === '') {
//             _terminateCheck = node.name;
//         }
//         return [[codeStr, varsDefined], _terminateCheck];
//     }
//     static getFunctionString(func: IFunction): string {
//         let fullCode = `async function ${func.name}(__params__${func.args.map(arg => ', ' + arg.name + '_').join('')}){\n`;
//         let fnCode = `var merged;\n`;
//         const numRemainingOutputs = {};
//         const nodeIndices = {};
//         let nodeIndex = 0;
//         for (const node of func.flowchart.nodes) {
//             if (!node.enabled) {
//                 continue;
//             }
//             nodeIndices[node.id] = nodeIndex;
//             nodeIndex ++;
//             numRemainingOutputs[node.id] = node.output.edges.length;
//             const nodeFuncName = `${func.name}_${node.id}`;
//             if (node.type === 'start') {
//                 fnCode += `let result_${nodeFuncName} = __params__.model;\n`;
//             } else {
//                 const codeRes = CodeUtils.getNodeCode(node, false, nodeIndices, func.name, node.id)[0];
//                 const nodecode = codeRes[0].join('\n').split('_-_-_+_-_-_');
//                 fullCode += `${nodecode[0]}\nasync function ${nodeFuncName}` +
//                             `(__params__${func.args.map(arg => ', ' + arg.name + '_').join('')}){` +
//                             nodecode[1] + `\n}\n\n`;
//                 if (node.input.edges.length === 1 && numRemainingOutputs[node.input.edges[0].source.parentNode.id] === 1) {
//                     fnCode += `\n__params__.model = result_${func.name}_${node.input.edges[0].source.parentNode.id};\n`;
//                 } else {
//                     let activeNodes = [];
//                     for (const nodeEdge of node.input.edges) {
//                         if (!nodeEdge.source.parentNode.enabled) {
//                             continue;
//                         }
//                         numRemainingOutputs[nodeEdge.source.parentNode.id] --;
//                         activeNodes.push([nodeIndices[nodeEdge.source.parentNode.id], nodeEdge.source.parentNode.id]);
//                         // if (nodeEdge.source.parentNode.type === 'start') {
//                         //     activeNodes.unshift(nodeEdge.source.parentNode.id);
//                         // } else {
//                         //     activeNodes.push(nodeEdge.source.parentNode.id);
//                         // }
//                     }
//                     if (activeNodes.length === 1) {
//                         fnCode += `\n__params__.model = duplicateModel(result_${func.name}_${activeNodes[0][1]});\n`;
//                     } else {
//                         activeNodes = activeNodes.sort((a, b) => a[0] - b[0]);
//                         fnCode += `\n__params__.model = mergeInputs([${activeNodes.map((nodeId) =>
//                             `result_${func.name}_${nodeId[1]}`).join(', ')}]);\n`;
//                     }
//                 }
//                 fnCode += `\nlet result_${nodeFuncName} = await ${nodeFuncName}(__params__${func.args.map(arg => ', ' + arg.name + '_'
//                             ).join('')});\n`;
//             }
//             if (node.type === 'end') {
//                 // fnCode += `\n__params__.model.purge();`;
//                 fnCode += `\nreturn result_${nodeFuncName};\n`;
//             }
//         }
//         fnCode += '}\n\n';
//         fullCode += fnCode;
//         return fullCode;
//     }
// }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS51dGlsc18wLTYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90cy9zcmMvbW9kZWwvY29kZS9jb2RlLnV0aWxzXzAtNi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxtQ0FBbUM7QUFDbkMsd0VBQXdFO0FBQ3hFLG1EQUFtRDtBQUNuRCxxQ0FBcUM7QUFDckMsaURBQWlEO0FBQ2pELHdEQUF3RDtBQUN4RCxtREFBbUQ7QUFDbkQsa0NBQWtDO0FBRWxDLCtCQUErQjtBQUUvQiwyQkFBMkI7QUFHM0Isa0dBQWtHO0FBQ2xHLDBHQUEwRztBQUMxRyxrRUFBa0U7QUFDbEUsb0RBQW9EO0FBQ3BELG1FQUFtRTtBQUVuRSxzRUFBc0U7QUFDdEUsd0VBQXdFO0FBQ3hFLHVDQUF1QztBQUN2QyxvRkFBb0Y7QUFDcEYsWUFBWTtBQUVaLGlDQUFpQztBQUNqQyxvQ0FBb0M7QUFFcEMsc0NBQXNDO0FBQ3RDLGtDQUFrQztBQUNsQywyQkFBMkI7QUFDM0Isc0JBQXNCO0FBQ3RCLHVCQUF1QjtBQUN2QixpR0FBaUc7QUFDakcsNkVBQTZFO0FBQzdFLFlBQVk7QUFDWiw0QkFBNEI7QUFDNUIsNkdBQTZHO0FBQzdHLDhFQUE4RTtBQUM5RSxZQUFZO0FBRVosaUNBQWlDO0FBQ2pDLDRDQUE0QztBQUM1QywwQ0FBMEM7QUFDMUMsMkRBQTJEO0FBQzNELDZCQUE2QjtBQUM3QixvQkFBb0I7QUFDcEIscUVBQXFFO0FBQ3JFLGlDQUFpQztBQUNqQyx5RkFBeUY7QUFDekYsK0NBQStDO0FBQy9DLDhEQUE4RDtBQUM5RCx3QkFBd0I7QUFDeEIsMkJBQTJCO0FBQzNCLG9GQUFvRjtBQUNwRixvQkFBb0I7QUFDcEIseUJBQXlCO0FBRXpCLHNDQUFzQztBQUN0Qyx1Q0FBdUM7QUFDdkMsMERBQTBEO0FBQzFELG9DQUFvQztBQUNwQyxxRUFBcUU7QUFDckUsdUdBQXVHO0FBQ3ZHLG9CQUFvQjtBQUNwQiw0REFBNEQ7QUFDNUQsMERBQTBEO0FBQzFE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