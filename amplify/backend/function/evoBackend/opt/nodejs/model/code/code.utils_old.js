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
//                             functionName?: string, nodeId?: string, usedFunctions?: string[]): string[] {
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
//                 const fnCall = `__modules__.${prod.meta.module}.${prod.meta.name}( ${argVals.join(', ')} )`;
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
//                 let funcDef_prefix = '';
//                 if (! isMainFlowchart) {
//                     funcDef_prefix = `${functionName}_${nodeId}_`;
//                 }
//                 codeStr.push(`\nfunction ${funcDef_prefix}${prod.args[0].jsValue}` +
//                              `(__params__, ${prod.args.slice(1).map(arg => arg.jsValue).join(', ')}) {`);
//                 break;
//             case ProcedureTypes.LocalFuncReturn:
//                 codeStr.push(`return ${prod.args[0].jsValue};`);
//                 break;
//             case ProcedureTypes.LocalFuncCall:
//                 const lArgsVals: any = [];
//                 let funcCall_prefix = '';
//                 if (! isMainFlowchart) {
//                     funcCall_prefix = `${functionName}_${nodeId}_`;
//                 }
//                 // let urlCheck = false;
//                 for (let i = 1; i < args.length; i++) {
//                     lArgsVals.push(args[i].jsValue);
//                 }
//                 const lfn = `${funcCall_prefix}${prod.meta.name}_(__params__${lArgsVals.map(val => ', ' + val).join('')})`;
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
//                 // argsVals = argsVals.join(', ');
//                 // const fn = `${namePrefix}${prod.meta.name}(__params__, ${argsVals} )`;
//                 const fn = `${namePrefix}${prod.meta.name}(__params__${argsVals.map(val => ', ' + val).join('')})`;
//                 if (args[0].name === '__none__' || !args[0].jsValue) {
//                     codeStr.push(`${fn};`);
//                     codeStr.push(`__params__.console.push('</div>')`);
//                     break;
//                 }
//                 const repImpVar = this.repSetAttrib(args[0].jsValue);
//                 if (!repImpVar) {
//                     codeStr.push(`${prefix}${args[0].jsValue} = ${fn};`);
//                 } else {
//                     codeStr.push(`${repImpVar[0]} ${fn} ${repImpVar[1]}`);
//                 }
//                 if (prefix === 'let ') {
//                     existingVars.push(args[0].jsValue);
//                 }
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
//                            functionName?: string, nodeId?: string, usedFunctions?: string[]): string[] {
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
//     static mergeInputs(models): any {
//         const result = _parameterTypes.newFn();
//         for (const model of models) {
//             _parameterTypes.mergeFn(result, model);
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
//                               functionName?: string, nodeId?: string, usedFunctions?: string[]): [string[][], string] {
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
//         codeStr.push('_-_-_+_-_-_')
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
//         let fullCode = `function ${func.name}(__params__${func.args.map(arg => ', ' + arg.name + '_').join('')}){\n`;
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
//                 fullCode += `${nodecode[0]}\nfunction ${nodeFuncName}` +
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
//                 fnCode += `let result_${nodeFuncName} = ${nodeFuncName}(__params__${func.args.map(arg => ', ' + arg.name + '_'
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS51dGlsc19vbGQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9nZW5fZXZhbF9wcm9jZXNzX2JhY2tlbmQvc3JjL21vZGVsL2NvZGUvY29kZS51dGlsc19vbGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsbUNBQW1DO0FBQ25DLHdFQUF3RTtBQUN4RSxtREFBbUQ7QUFDbkQscUNBQXFDO0FBQ3JDLGlEQUFpRDtBQUNqRCx3REFBd0Q7QUFDeEQsbURBQW1EO0FBQ25ELGtDQUFrQztBQUVsQywrQkFBK0I7QUFFL0IsMkJBQTJCO0FBRzNCLGtHQUFrRztBQUNsRyw0R0FBNEc7QUFDNUcsa0VBQWtFO0FBQ2xFLG9EQUFvRDtBQUNwRCxtRUFBbUU7QUFFbkUsc0VBQXNFO0FBQ3RFLHdFQUF3RTtBQUN4RSx1Q0FBdUM7QUFDdkMsb0ZBQW9GO0FBQ3BGLFlBQVk7QUFFWixpQ0FBaUM7QUFDakMsb0NBQW9DO0FBRXBDLHNDQUFzQztBQUN0QyxrQ0FBa0M7QUFDbEMsMkJBQTJCO0FBQzNCLHNCQUFzQjtBQUN0Qix1QkFBdUI7QUFDdkIsaUdBQWlHO0FBQ2pHLDZFQUE2RTtBQUM3RSxZQUFZO0FBQ1osNEJBQTRCO0FBQzVCLDZHQUE2RztBQUM3Ryw4RUFBOEU7QUFDOUUsWUFBWTtBQUVaLGlDQUFpQztBQUNqQyw0Q0FBNEM7QUFDNUMsMENBQTBDO0FBQzFDLDJEQUEyRDtBQUMzRCw2QkFBNkI7QUFDN0Isb0JBQW9CO0FBQ3BCLHFFQUFxRTtBQUNyRSxpQ0FBaUM7QUFDakMseUZBQXlGO0FBQ3pGLCtDQUErQztBQUMvQyw4REFBOEQ7QUFDOUQsd0JBQXdCO0FBQ3hCLDJCQUEyQjtBQUMzQixvRkFBb0Y7QUFDcEYsb0JBQW9CO0FBQ3BCLHlCQUF5QjtBQUV6QixzQ0FBc0M7QUFDdEMsdUNBQXVDO0FBQ3ZDLDBEQUEwRDtBQUMxRCxvQ0FBb0M7QUFDcEMscUVBQXFFO0FBQ3JFLHVHQUF1RztBQUN2Ryxv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