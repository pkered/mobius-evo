"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const procedure_1 = require("../procedure");
const port_1 = require("../port");
const rxjs_1 = require("rxjs");
const circularJSON = __importStar(require("circular-json"));
const modules_1 = require("../../core/modules");
const xmlhttprequest_1 = require("xmlhttprequest");
const node_fetch_1 = __importDefault(require("node-fetch"));
let _terminateCheck;
class CodeUtils {
    static getProcedureCode(prod, existingVars, isMainFlowchart, functionName, nodeId, usedFunctions) {
        if (_terminateCheck === '' || prod.enabled === false ||
            prod.type === procedure_1.ProcedureTypes.Blank ||
            prod.type === procedure_1.ProcedureTypes.Comment) {
            return [];
        }
        // mark _terminateCheck to terminate all process after this
        if (prod.type === procedure_1.ProcedureTypes.Terminate && prod.enabled) {
            // _terminateCheck = '';
            return ['__params__.terminated = true;', 'return null;'];
        }
        prod.hasError = false;
        let specialPrint = false;
        let loopVarIndex = null;
        if (prod.children) {
            loopVarIndex = existingVars.length;
        }
        let codeStr = [];
        const args = prod.args;
        let prefix = '';
        if (args) {
            prefix =
                args.hasOwnProperty('0') && args[0].jsValue && args[0].jsValue.indexOf('[') === -1
                    && existingVars.indexOf(args[0].jsValue) === -1 ? 'let ' : '';
        }
        codeStr.push('');
        if (isMainFlowchart && prod.type !== procedure_1.ProcedureTypes.Else && prod.type !== procedure_1.ProcedureTypes.Elseif) {
            codeStr.push(`__params__.currentProcedure[0] = "${prod.ID}";`);
        }
        switch (prod.type) {
            case procedure_1.ProcedureTypes.Variable:
                if (!args[0].jsValue) {
                    codeStr.push(`${args[1].jsValue};`);
                    break;
                }
                const repVar = this.repSetAttrib(args[0].jsValue);
                if (!repVar) {
                    codeStr.push(`${prefix}${args[0].jsValue} = ${args[1].jsValue};`);
                    if (prefix === 'let ') {
                        existingVars.push(args[0].jsValue);
                    }
                }
                else {
                    codeStr.push(`${repVar[0]} ${args[1].jsValue} ${repVar[1]}`);
                }
                break;
            case procedure_1.ProcedureTypes.If:
                specialPrint = true;
                // if (isMainFlowchart && prod.print) {
                if (prod.print) {
                    codeStr.push(`printFunc(__params__.console,` +
                        `\`Evaluating If: (${args[0].value}) is \` + (${args[0].jsValue}), '__null__');`);
                }
                codeStr.push(`if (${args[0].jsValue}){`);
                // if (isMainFlowchart && prod.print) {
                if (prod.print) {
                    codeStr.push(`printFunc(__params__.console,'Executing If', '__null__');`);
                }
                break;
            case procedure_1.ProcedureTypes.Else:
                specialPrint = true;
                codeStr.push(`else {`);
                // if (isMainFlowchart && prod.print) {
                if (prod.print) {
                    codeStr.push(`printFunc(__params__.console,'Executing Else', '__null__');`);
                }
                break;
            case procedure_1.ProcedureTypes.Elseif:
                specialPrint = true;
                codeStr.push(`else {`);
                if (isMainFlowchart) {
                    codeStr.push(`__params__.currentProcedure[0] = "${prod.ID}";`);
                    // if (prod.print) {
                    //     codeStr.push(`printFunc(__params__.console,` +
                    //     `'Evaluating Else-if: (${args[0].value}) = ' + (${args[0].jsValue}), '__null__');`);
                    // }
                }
                if (prod.print) {
                    codeStr.push(`printFunc(__params__.console,` +
                        `\`Evaluating Else-if: (${args[0].value}) is \` + (${args[0].jsValue}), '__null__');`);
                }
                codeStr.push(`if(${args[0].jsValue}){`);
                // if (isMainFlowchart && prod.print) {
                if (prod.print) {
                    codeStr.push(`printFunc(__params__.console,'Executing Else-if', '__null__');`);
                }
                break;
            case procedure_1.ProcedureTypes.Foreach:
                specialPrint = true;
                codeStr.push(`for (${prefix} ${args[0].jsValue} of ${args[1].jsValue}){`);
                // if (isMainFlowchart && prod.print) {
                if (prod.print) {
                    codeStr.push(`printFunc(__params__.console,` +
                        `'Executing For-each: ${args[0].value} = ' + (${args[0].jsValue}), '__null__');`);
                }
                existingVars.push(args[0].jsValue);
                break;
            case procedure_1.ProcedureTypes.While:
                specialPrint = true;
                codeStr.push(`while (${args[0].jsValue}){`);
                // if (isMainFlowchart && prod.print) {
                if (prod.print) {
                    codeStr.push(`printFunc(__params__.console,` +
                        `'Executing While: (${args[0].value}) = ' + (${args[0].jsValue}), '__null__');`);
                }
                break;
            case procedure_1.ProcedureTypes.Break:
                codeStr.push(`break;`);
                break;
            case procedure_1.ProcedureTypes.Continue:
                codeStr.push(`continue;`);
                break;
            case procedure_1.ProcedureTypes.Constant:
                if (!isMainFlowchart) {
                    return [];
                }
                let constName = args[0].jsValue;
                if (constName[0] === '"' || constName[0] === '\'') {
                    constName = args[0].jsValue.substring(1, args[0].jsValue.length - 1);
                }
                codeStr.push(`__params__['constants']['${constName}'] = ${prod.resolvedValue};`);
                break;
            case procedure_1.ProcedureTypes.AddData:
                let cst = args[0].value;
                if (!isMainFlowchart) {
                    return [`__modules__.${modules_1._parameterTypes.addData}( __params__.model, ${cst});`];
                }
                if (cst[0] === '"' || cst[0] === '\'') {
                    cst = args[0].value.substring(1, args[0].value.length - 1);
                }
                codeStr.push(`__params__['constants']['${cst}'] = ${prod.resolvedValue};`);
                if (modules_1._parameterTypes.addData) {
                    codeStr.push(`__modules__.${modules_1._parameterTypes.addData}( __params__.model, __params__.constants['${cst}']);`);
                }
                else {
                    codeStr.push(`__params__.model = mergeInputs( [__params__.model, __params__.constants['${cst}']]);`);
                }
                break;
            case procedure_1.ProcedureTypes.EndReturn:
                let check = true;
                const returnArgVals = [];
                for (const arg of args) {
                    if (arg.name === modules_1._parameterTypes.constList) {
                        returnArgVals.push('__params__.constants');
                        continue;
                    }
                    if (arg.name === modules_1._parameterTypes.model) {
                        returnArgVals.push('__params__.model');
                        continue;
                    }
                    if (!arg.jsValue) {
                        check = false;
                        break;
                    }
                    if (arg.jsValue[0] === '#') {
                        returnArgVals.push('`' + arg.jsValue + '`');
                        continue;
                    }
                    returnArgVals.push(arg.jsValue);
                }
                if (!check) {
                    codeStr.push(`return null;`);
                }
                else {
                    codeStr.push(`let __return_value__ = __modules__.${modules_1._parameterTypes.return}(${returnArgVals.join(', ')});`);
                    if (isMainFlowchart) {
                        codeStr.push(`if (__return_value__ !== undefined && __return_value__ !== null) {` +
                            `__params__.console.push('<p><b>Return: <i>' + ` +
                            `__return_value__.toString().replace(/,/g,', ') + '</i></b></p>');` +
                            `} else {` +
                            `__params__.console.push('<p><b>Return: <i> null </i></b></p>');` +
                            `}`);
                    }
                    codeStr.push(`return __return_value__;`);
                }
                break;
            case procedure_1.ProcedureTypes.MainFunction:
                const argVals = [];
                for (const arg of args.slice(1)) {
                    if (arg.name === modules_1._parameterTypes.constList) {
                        argVals.push('__params__.constants');
                        continue;
                    }
                    if (arg.name === modules_1._parameterTypes.model) {
                        argVals.push('__params__.model');
                        continue;
                    }
                    if (arg.name === modules_1._parameterTypes.console) {
                        argVals.push('__params__.console');
                        continue;
                    }
                    if (arg.name === modules_1._parameterTypes.fileName) {
                        argVals.push('__params__.fileName');
                        continue;
                    }
                    if (arg.jsValue && arg.jsValue[0] === '#') {
                        argVals.push('`' + arg.jsValue + '`');
                        continue;
                    }
                    argVals.push(arg.jsValue);
                }
                if (prod.resolvedValue) {
                    let prodResolvedCheck = false;
                    for (let i = 0; i < argVals.length; i++) {
                        if (argVals[i].indexOf('://') !== -1) {
                            argVals[i] = prod.resolvedValue;
                            prod.resolvedValue = null;
                            prodResolvedCheck = true;
                            break;
                        }
                    }
                    if (!prodResolvedCheck) {
                        argVals[1] = prod.resolvedValue;
                    }
                }
                // const argValues = argVals.join(', ');
                let fnCall = `__modules__.${prod.meta.module}.${prod.meta.name}( ${argVals.join(', ')} )`;
                const fullName = prod.meta.module + '.' + prod.meta.name;
                for (const asyncFunc of modules_1._parameterTypes.asyncFuncs) {
                    if (fullName === asyncFunc) {
                        fnCall = 'await ' + fnCall;
                        break;
                    }
                }
                if (prod.meta.module.toUpperCase() === 'OUTPUT') {
                    if (prod.args[prod.args.length - 1].jsValue) {
                        codeStr.push(`return ${fnCall};`);
                    }
                }
                else if (args[0].name === '__none__' || !args[0].jsValue) {
                    codeStr.push(`${fnCall};`);
                }
                else {
                    const repfuncVar = this.repSetAttrib(args[0].jsValue);
                    if (!repfuncVar) {
                        codeStr.push(`${prefix}${args[0].jsValue} = ${fnCall};`);
                        if (prefix === 'let ') {
                            existingVars.push(args[0].jsValue);
                        }
                    }
                    else {
                        codeStr.push(`${repfuncVar[0]} ${fnCall} ${repfuncVar[1]}`);
                    }
                }
                break;
            case procedure_1.ProcedureTypes.LocalFuncDef:
                // const funcDef_prefix = `${functionName}_${nodeId}_`;
                let funcDef_prefix = `${nodeId}_`;
                if (!isMainFlowchart) {
                    funcDef_prefix = `${functionName}_` + funcDef_prefix;
                }
                codeStr.push(`\nasync function ${funcDef_prefix}${prod.args[0].jsValue}` +
                    `(__params__, ${prod.args.slice(1).map(arg => arg.jsValue).join(', ')}) {`);
                break;
            case procedure_1.ProcedureTypes.Return:
                if (prod.args.length > 0) {
                    codeStr.push(`return ${prod.args[0].jsValue};`);
                    break;
                }
                codeStr.push(`return;`);
                break;
            case procedure_1.ProcedureTypes.LocalFuncCall:
                const lArgsVals = [];
                // const funcCall_prefix = `${functionName}_${nodeId}_`;
                let funcCall_prefix = `${nodeId}_`;
                if (!isMainFlowchart) {
                    funcCall_prefix = `${functionName}_` + funcCall_prefix;
                }
                // let urlCheck = false;
                for (let i = 1; i < args.length; i++) {
                    lArgsVals.push(args[i].jsValue);
                }
                console.log(funcCall_prefix);
                const lfn = `await ${funcCall_prefix}${prod.meta.name}_(__params__${lArgsVals.map(val => ', ' + val).join('')})`;
                if (args[0].name === '__none__' || !args[0].jsValue) {
                    codeStr.push(`${lfn};`);
                    codeStr.push('if (__params__.terminated) { return __params__.model;}');
                    break;
                }
                const lRepImpVar = this.repSetAttrib(args[0].jsValue);
                if (!lRepImpVar) {
                    codeStr.push(`${prefix}${args[0].jsValue} = ${lfn};`);
                }
                else {
                    codeStr.push(`${lRepImpVar[0]} ${lfn} ${lRepImpVar[1]}`);
                }
                if (prefix === 'let ') {
                    existingVars.push(args[0].jsValue);
                }
                codeStr.push('if (__params__.terminated) { return __params__.model;}');
                break;
            case procedure_1.ProcedureTypes.globalFuncCall:
                const argsVals = [];
                const namePrefix = functionName ? `${functionName}_` : '';
                // let urlCheck = false;
                if (isMainFlowchart) {
                    usedFunctions.push(prod.meta.name);
                    // } else {
                    //     for (const urlfunc of _parameterTypes.urlFunctions) {
                    //         const funcMeta = urlfunc.split('.');
                    //         if (funcMeta[0] === prod.meta.module && funcMeta[1] === prod.meta.name) {
                    //             urlCheck = true;
                    //             break;
                    //         }
                    //     }
                }
                const prepArgs = [];
                for (let i = 1; i < args.length; i++) {
                    const arg = args[i];
                    if (arg.type.toString() !== port_1.InputType.URL.toString()) {
                        argsVals.push(arg.jsValue);
                        // argsVals.push(this.repGetAttrib(arg.jsValue));
                    }
                    else {
                        argsVals.push(prod.resolvedValue);
                    }
                    if (arg.isEntity) {
                        prepArgs.push(argsVals[argsVals.length - 1]);
                    }
                }
                codeStr.push(`__params__.console.push('<div style="margin: 5px 0px 5px 10px; border: 1px solid #E6E6E6"><p><b> Global Function: ${prod.meta.name}</b></p>');`);
                codeStr.push(`__params__.curr_ss.${nodeId} = __params__.model.prepGlobalFunc([${prepArgs.join(', ')}]);`);
                // if (prepArgs.length === 0) {
                //     codeStr.push(`__params__.curr_ss.${nodeId} = __params__.model.prepGlobalFunc([${argsVals[0]}]);`);
                // } else {
                //     codeStr.push(`__params__.curr_ss.${nodeId} = __params__.model.prepGlobalFunc([${prepArgs.join(', ')}]);`);
                // }
                const fn = `await ${namePrefix}${prod.meta.name}(__params__${argsVals.map(val => ', ' + val).join('')})`;
                // codeStr.push(`__params__.prevModel = __params__.model.clone();`);
                if (args[0].name === '__none__' || !args[0].jsValue) {
                    codeStr.push(`${fn};`);
                }
                else {
                    const repImpVar = this.repSetAttrib(args[0].jsValue);
                    if (!repImpVar) {
                        codeStr.push(`${prefix}${args[0].jsValue} = ${fn};`);
                    }
                    else {
                        codeStr.push(`${repImpVar[0]} ${fn} ${repImpVar[1]}`);
                    }
                    if (prefix === 'let ') {
                        existingVars.push(args[0].jsValue);
                    }
                }
                codeStr.push(`__params__.model.postGlobalFunc(__params__.curr_ss.${nodeId})`);
                // codeStr.push(`__params__.prevModel.merge(__params__.model);`);
                // codeStr.push(`__params__.model = __params__.prevModel;`);
                // codeStr.push(`__params__.prevModel = null;`);
                codeStr.push(`__params__.console.push('</div>')`);
                break;
            case procedure_1.ProcedureTypes.Error:
                codeStr.push(`throw new Error('____' + ${prod.args[0].jsValue});`);
                break;
        }
        // if (isMainFlowchart && prod.print && !specialPrint && prod.args[0].name !== '__none__' && prod.args[0].jsValue) {
        if (prod.print && !specialPrint && prod.args[0].name !== '__none__' && prod.args[0].jsValue) {
            // const repGet = prod.args[0].jsValue;
            const repGet = this.repGetAttrib(prod.args[0].jsValue);
            codeStr.push(`printFunc(__params__.console,\`${prod.args[0].value}\`, ${repGet});`);
        }
        // if (isMainFlowchart && prod.selectGeom && prod.args[0].jsValue) {
        //     // const repGet = prod.args[0].jsValue;
        //     const repGet = this.repGetAttrib(prod.args[0].value);
        //     const repGetJS = this.repGetAttrib(prod.args[0].jsValue);
        //     codeStr.push(`try {` +
        //     `\t__modules__.${_parameterTypes.select}(__params__.model, ${repGetJS}, "${repGet}"); ` +
        //     `} catch (ex) {` +
        //     `\t__params__.message = 'Trying to select geometric entities in node "%node%", but no entity was found';` +
        //     `}`);
        // }
        if (prod.children) {
            codeStr = codeStr.concat(CodeUtils.getProdListCode(prod.children, existingVars, isMainFlowchart, functionName, nodeId, usedFunctions));
            codeStr.push(`}`);
            if (loopVarIndex) {
                existingVars.splice(loopVarIndex);
            }
        }
        // mark _terminateCheck to terminate all process after this
        if (prod.terminate && prod.enabled) {
            codeStr.push('__params__.terminated = true;');
            codeStr.push('return null;');
        }
        return codeStr;
    }
    static getProdListCode(prodList, existingVars, isMainFlowchart, functionName, nodeId, usedFunctions) {
        let codeStr = [];
        let elifcount = 0;
        for (const p of prodList) {
            const procedureCode = CodeUtils.getProcedureCode(p, existingVars, isMainFlowchart, functionName, nodeId, usedFunctions);
            if (p.type === procedure_1.ProcedureTypes.Elseif && p.enabled) {
                codeStr = codeStr.concat(procedureCode);
                elifcount++;
            }
            else if (p.type === procedure_1.ProcedureTypes.Else && p.enabled) {
                codeStr = codeStr.concat(procedureCode);
                while (elifcount > 0) {
                    codeStr.push('}');
                    elifcount--;
                }
            }
            else {
                while (elifcount > 0) {
                    codeStr.push('}');
                    elifcount--;
                }
                codeStr = codeStr.concat(procedureCode);
            }
        }
        while (elifcount > 0) {
            codeStr.push('}');
            elifcount--;
        }
        return codeStr;
    }
    static repSetAttrib(val) {
        if (!val || val.indexOf('@') === -1) {
            return false;
        }
        // get two parts, before @ and after @
        let val_0;
        let val_1;
        const atIndex = val.indexOf('@');
        if (atIndex === 0) {
            val_0 = null;
            val_1 = val.slice(1);
        }
        else {
            val_0 = val.slice(0, atIndex);
            val_1 = val.slice(atIndex + 1);
        }
        const bracketIndex = val_1.indexOf('[pythonList(');
        if (bracketIndex !== -1) {
            const name = val_1.slice(0, bracketIndex);
            const index = val_1.lastIndexOf(name);
            // return [`__modules__.${_parameterTypes.setattrib}(__params__.model, ${val_0}, '${name}', ` +
            //         `${val_1.substring(bracketIndex + 12, index - 2)},`, `);`];
            return [`__modules__.${modules_1._parameterTypes.setattrib}(__params__.model, ${val_0},` +
                    `['${name}', ${val_1.substring(bracketIndex + 12, index - 2)}], `, `);`];
        }
        else {
            // return [`__modules__.${_parameterTypes.setattrib}(__params__.model, ${val_0}, '${val_1}', null, `, ');'];
            return [`__modules__.${modules_1._parameterTypes.setattrib}(__params__.model, ${val_0}, '${val_1}', `, ');'];
        }
    }
    static repGetAttrib(val) {
        if (!val) {
            return;
        }
        const res = val.split('@');
        if (res.length === 1) {
            return val;
        }
        let entity = res[0];
        if (res[0] === '') {
            entity = 'null';
        }
        let att_name;
        let att_index;
        const bracketIndex = res[1].indexOf('.slice(');
        if (bracketIndex !== -1) {
            att_name = res[1].slice(0, bracketIndex);
            att_index = res[1].slice(bracketIndex + 7, -4);
        }
        else {
            att_name = res[1];
            att_index = 'null';
        }
        if (att_index === 'null') {
            return `__modules__.${modules_1._parameterTypes.getattrib}(__params__.model, ${entity}, '${att_name}', 'one_value')`;
        }
        return `__modules__.${modules_1._parameterTypes.getattrib}(__params__.model, ${entity}, ['${att_name}', ${att_index}], 'one_value')`;
        // return `__modules__.${_parameterTypes.getattrib}(__params__.model, ${entity}, '${att_name}', ${att_index}, 'one_value')`;
    }
    static async getURLContent(url) {
        url = url.replace('http://', 'https://');
        if (url.indexOf('dropbox') !== -1) {
            url = url.replace('www', 'dl').replace('dl=0', 'dl=1');
        }
        if (url[0] === '"' || url[0] === '\'') {
            url = url.substring(1);
        }
        if (url[url.length - 1] === '"' || url[url.length - 1] === '\'') {
            url = url.substring(0, url.length - 1);
        }
        const p = new Promise((resolve) => {
            node_fetch_1.default(url).then(res => {
                if (!res.ok) {
                    resolve('HTTP Request Error: Unable to retrieve file from ' + url);
                    return '';
                }
                if (url.indexOf('.zip') !== -1) {
                    res.blob().then(body => resolve(body));
                }
                else {
                    res.text().then(body => resolve(body.replace(/(\\[bfnrtv\'\"\\])/g, '\\$1')));
                }
                // }).then(body => {
                //     resolve(body.replace(/(\\[bfnrtv\'\"\\])/g, '\\$1'));
            });
            // const request = new XMLHttpRequest();
            // request.open('GET', url);
            // request.onreadystatechange =  () => {
            //     setTimeout(() => {
            //         resolve('HTTP Request Error: request file timeout from url ' + url);
            //     }, 5000);
            // };
            // // request.overrideMimeType('text/plain; charset=x-user-defined');
            // request.onload = () => {
            //     resolve(request.responseText.replace(/(\\[bfnrtv\'\"\\])/g, '\\$1'));
            // };
            // request.onerror = () => {
            //     resolve('HTTP Request Error: unable to retrieve file from url ' + url);
            // };
            // request.send();
        });
        return await p;
    }
    static async getStartInput(arg, inputMode) {
        const val = arg.jsValue || arg.value;
        let result = val;
        if (inputMode.toString() === port_1.InputType.URL.toString()) {
            result = await CodeUtils.getURLContent(val);
            if (result.indexOf('HTTP Request Error') !== -1) {
                throw (new Error(result));
            }
            result = '`' + result + '`';
        }
        else if (inputMode.toString() === port_1.InputType.File.toString()) {
            result = window.localStorage.getItem(val.name);
            if (!result) {
                const p = new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = function () {
                        resolve(reader.result);
                    };
                    reader.onerror = () => {
                        resolve('File Reading Error: unable to read file ' + val.name);
                    };
                    reader.readAsText(val);
                });
                result = await p;
                if (result.indexOf('File Reading Error') !== -1) {
                    throw (new Error(result));
                }
                result = '`' + result + '`';
                // let savedFiles: any = window.localStorage.getItem('savedFileList');
                // if (!savedFiles) {
                //     window.localStorage.setItem('savedFileList', `["${val.name}"]`);
                // } else {
                //     savedFiles = JSON.parse(savedFiles);
                //     window.localStorage.removeItem(savedFiles[0]);
                //     window.localStorage.setItem('savedFileList', `["${val.name}"]`);
                // }
                // window.localStorage.setItem(val.name, result);
                arg.jsValue = { 'name': val.name };
            }
        }
        return result;
    }
    static loadFile(f) {
        const stream = rxjs_1.Observable.create(observer => {
            const request = new xmlhttprequest_1.XMLHttpRequest();
            request.open('GET', f.download_url);
            request.onload = () => {
                if (request.status === 200) {
                    const fl = circularJSON.parse(request.responseText);
                    observer.next(fl);
                    observer.complete();
                }
                else {
                    observer.error('error happened');
                }
            };
            request.onerror = () => {
                observer.error('error happened');
            };
            request.send();
        });
        stream.subscribe(loadeddata => {
            return loadeddata;
        });
    }
    // static mergeInputs(models): any {
    //     const result = _parameterTypes.newFn();
    //     for (const model of models) {
    //         _parameterTypes.mergeFn(result, model);
    //     }
    //     return result;
    // }
    static mergeInputs(models) {
        let result = null;
        if (models.length === 0) {
            result = modules_1._parameterTypes.newFn();
        }
        else if (models.length === 1) {
            result = models[0].clone();
        }
        else {
            result = models[0].clone();
            for (let i = 1; i < models.length; i++) {
                modules_1._parameterTypes.mergeFn(result, models[i]);
            }
        }
        return result;
    }
    // static getInputValue(inp: IPortInput, node: INode, nodeIndices: {}): string {
    //     let input: any;
    //     // const x = performance.now();
    //     if (node.type === 'start' || inp.edges.length === 0) {
    //         input = _parameterTypes['newFn']();
    //     // } else if (inp.edges.length === 1 && inp.edges[0].source.parentNode.enabled) {
    //     //     input = inp.edges[0].source.value.clone();
    //     //     console.log('clone time:', performance.now() - x);
    //     } else {
    //         let inputs = [];
    //         for (const edge of inp.edges) {
    //             if (!edge.source.parentNode.enabled) {
    //                 continue;
    //             }
    //             inputs.push([nodeIndices[edge.source.parentNode.id], edge.source.value]);
    //         }
    //         inputs = inputs.sort((a, b) => a[0] - b[0]);
    //         const mergeModels = inputs.map(i => i[1])
    //         input = CodeUtils.mergeInputs(mergeModels);
    //         // console.log('merge time:', performance.now() - x);
    //     }
    //     return input;
    // }
    static getInputValue(inp, node, nodeIndices) {
        const input = [];
        for (const edge of inp.edges) {
            if (!edge.source.parentNode.enabled) {
                continue;
            }
            input.push(edge.source.parentNode.model);
        }
        return input;
    }
    static getNodeCode(node, isMainFlowchart = false, nodeIndices, functionName, nodeId, usedFunctions) {
        node.hasError = false;
        let codeStr = [];
        // reset terminate check to false at start node (only in main flowchart's start node).
        // for every node after that, if terminate check is true, do not execute the node.
        if (!isMainFlowchart) {
            // do nothing
        }
        else if (node.type === 'start') {
            _terminateCheck = null;
        }
        else if (_terminateCheck) {
            return [undefined, _terminateCheck];
        }
        let varsDefined;
        // procedure
        for (const prod of node.localFunc) {
            varsDefined = [];
            for (const arg of prod.args.slice(1)) {
                varsDefined.push(arg.jsValue);
            }
            codeStr = codeStr.concat(CodeUtils.getProcedureCode(prod, varsDefined, isMainFlowchart, functionName, nodeId, usedFunctions));
        }
        // input initializations
        if (isMainFlowchart) {
            node.input.value = CodeUtils.getInputValue(node.input, node, nodeIndices);
        }
        if (node.type === 'start') {
            codeStr.push('__params__.constants = {};\n');
        }
        codeStr.push('_-_-_+_-_-_');
        // codeStr.push('while (true) {');
        codeStr.push(`__modules__.${modules_1._parameterTypes.preprocess}( __params__.model);`);
        varsDefined = [];
        codeStr = codeStr.concat(CodeUtils.getProdListCode(node.procedure, varsDefined, isMainFlowchart, functionName, nodeId, usedFunctions));
        if (node.type === 'end' && node.procedure.length > 0) {
            // codeStr.push('break; }');
            // codeStr.splice(codeStr.length - 2, 0, 'break; }');
            // return [[codeStr, varsDefined], _terminateCheck];
        }
        else {
            codeStr.push(`__modules__.${modules_1._parameterTypes.postprocess}( __params__.model);`);
            // codeStr.push('break; }');
            // codeStr.push('return __params__.model;');
        }
        if (_terminateCheck === '') {
            _terminateCheck = node.name;
        }
        return [[codeStr, varsDefined], _terminateCheck];
    }
    static getFunctionString(func) {
        func.args.forEach(arg => arg.name = arg.name.toUpperCase());
        let fullCode = `async function ${func.name}(__params__${func.args.map(arg => ', ' + arg.name + '_').join('')}){\n`;
        let fnCode = `var merged;\n`;
        const numRemainingOutputs = {};
        const nodeIndices = {};
        let nodeIndex = 0;
        for (const node of func.flowchart.nodes) {
            if (!node.enabled) {
                continue;
            }
            nodeIndices[node.id] = nodeIndex;
            nodeIndex++;
            numRemainingOutputs[node.id] = node.output.edges.length;
            const nodeFuncName = `${func.name}_${node.id}`;
            if (node.type === 'start') {
                // fnCode += `let result_${nodeFuncName} = __params__.model;\n`;
                fnCode += `let ssid_${nodeFuncName} = __params__.model.getActiveSnapshot();\n`;
            }
            else {
                const codeRes = CodeUtils.getNodeCode(node, false, nodeIndices, func.name, node.id)[0];
                const nodecode = codeRes[0].join('\n').split('_-_-_+_-_-_');
                fullCode += `${nodecode[0]}\nasync function ${nodeFuncName}` +
                    `(__params__${func.args.map(arg => ', ' + arg.name + '_').join('')}){` +
                    nodecode[1] + `\n}\n\n`;
                // const activeNodes = [];
                // for (const nodeEdge of node.input.edges) {
                //     if (!nodeEdge.source.parentNode.enabled) {
                //         continue;
                //     }
                //     activeNodes.push(`ssid_${func.name}_${nodeEdge.source.parentNode.id}`);
                // }
                // fnCode += `\nlet ssid_${nodeFuncName} = __params__.model.nextSnapshot([${activeNodes.join(',')}]);\n`;
                // // if (activeNodes.length !== 1) {
                // //     fnCode += `\nlet ssid_${nodeFuncName} = __params__.model.nextSnapshot([${activeNodes.join(',')}]);\n`;
                // // } else {
                // //     fnCode += `\nlet ssid_${nodeFuncName} = ${activeNodes[0]};\n`;
                // // }
                if (node.type !== 'end' && node.input.edges.length === 1 && node.input.edges[0].source.parentNode.output.edges.length === 1) {
                    fnCode += `\nlet ssid_${nodeFuncName} = ssid_${func.name}_${node.input.edges[0].source.parentNode.id};\n`;
                }
                else {
                    let activeNodes = [];
                    for (const nodeEdge of node.input.edges) {
                        if (!nodeEdge.source.parentNode.enabled) {
                            continue;
                        }
                        numRemainingOutputs[nodeEdge.source.parentNode.id]--;
                        activeNodes.push([nodeIndices[nodeEdge.source.parentNode.id], `ssid_${func.name}_${nodeEdge.source.parentNode.id}`]);
                    }
                    activeNodes = activeNodes.sort((a, b) => a[0] - b[0]);
                    fnCode += `\nlet ssid_${nodeFuncName} = __params__.model.nextSnapshot([${activeNodes.map(nodeId => nodeId[1]).join(', ')}]);\n`;
                }
                if (node.type === 'end') {
                    fnCode += `\nreturn await ${nodeFuncName}(__params__${func.args.map(arg => ', ' + arg.name + '_').join('')});\n`;
                }
                else {
                    fnCode += `\nawait ${nodeFuncName}(__params__${func.args.map(arg => ', ' + arg.name + '_').join('')});\n`;
                }
            }
        }
        fnCode += '}\n\n';
        fullCode += fnCode;
        return fullCode;
    }
}
exports.CodeUtils = CodeUtils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS51dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2dlbl9ldmFsX3Byb2Nlc3NfYmFja2VuZC9zcmMvbW9kZWwvY29kZS9jb2RlLnV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUNBLDRDQUFxRTtBQUNyRSxrQ0FBZ0Q7QUFDaEQsK0JBQWtDO0FBQ2xDLDREQUE4QztBQUM5QyxnREFBcUQ7QUFDckQsbURBQWdEO0FBQ2hELDREQUErQjtBQUUvQixJQUFJLGVBQXVCLENBQUM7QUFFNUIsTUFBYSxTQUFTO0lBR2xCLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFnQixFQUFFLFlBQXNCLEVBQUUsZUFBd0IsRUFDbEUsWUFBb0IsRUFBRSxNQUFjLEVBQUUsYUFBd0I7UUFDbEYsSUFBSSxlQUFlLEtBQUssRUFBRSxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssS0FBSztZQUNoRCxJQUFJLENBQUMsSUFBSSxLQUFLLDBCQUFjLENBQUMsS0FBSztZQUNsQyxJQUFJLENBQUMsSUFBSSxLQUFLLDBCQUFjLENBQUMsT0FBTyxFQUFFO1lBQUUsT0FBTyxFQUFFLENBQUM7U0FBRTtRQUV4RCwyREFBMkQ7UUFDM0QsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLDBCQUFjLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDeEQsd0JBQXdCO1lBQ3hCLE9BQU8sQ0FBQywrQkFBK0IsRUFBRSxjQUFjLENBQUMsQ0FBQztTQUM1RDtRQUVELElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ3RCLElBQUksWUFBWSxHQUFHLEtBQUssQ0FBQztRQUN6QixJQUFJLFlBQVksR0FBRyxJQUFJLENBQUM7UUFDeEIsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2YsWUFBWSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUM7U0FDdEM7UUFDRCxJQUFJLE9BQU8sR0FB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