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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS51dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3RzL3NyYy9tb2RlbC9jb2RlL2NvZGUudXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQ0EsNENBQXFFO0FBQ3JFLGtDQUFnRDtBQUNoRCwrQkFBa0M7QUFDbEMsNERBQThDO0FBQzlDLGdEQUFxRDtBQUNyRCxtREFBZ0Q7QUFDaEQsNERBQStCO0FBRS9CLElBQUksZUFBdUIsQ0FBQztBQUU1QixNQUFhLFNBQVM7SUFHbEIsTUFBTSxDQUFDLGdCQUFnQixDQUFDLElBQWdCLEVBQUUsWUFBc0IsRUFBRSxlQUF3QixFQUNsRSxZQUFvQixFQUFFLE1BQWMsRUFBRSxhQUF3QjtRQUNsRixJQUFJLGVBQWUsS0FBSyxFQUFFLElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxLQUFLO1lBQ2hELElBQUksQ0FBQyxJQUFJLEtBQUssMEJBQWMsQ0FBQyxLQUFLO1lBQ2xDLElBQUksQ0FBQyxJQUFJLEtBQUssMEJBQWMsQ0FBQyxPQUFPLEVBQUU7WUFBRSxPQUFPLEVBQUUsQ0FBQztTQUFFO1FBRXhELDJEQUEyRDtRQUMzRCxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssMEJBQWMsQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUN4RCx3QkFBd0I7WUFDeEIsT0FBTyxDQUFDLCtCQUErQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1NBQzVEO1FBRUQsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDdEIsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDO1FBQ3pCLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQztRQUN4QixJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDZixZQUFZLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQztTQUN0QztRQUNELElBQUksT0FBTyxHQUFhLEVBQUUsQ0FBQztRQUMzQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3ZCLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNoQixJQUFJLElBQUksRUFBRTtZQUNOLE1BQU07Z0JBQ04sSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQzt1QkFDL0UsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1NBQ2pFO1FBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNqQixJQUFJLGVBQWUsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLDBCQUFjLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssMEJBQWMsQ0FBQyxNQUFNLEVBQUU7WUFDN0YsT0FBTyxDQUFDLElBQUksQ0FBQyxxQ0FBcUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDbEU7UUFFRCxRQUFTLElBQUksQ0FBQyxJQUFJLEVBQUc7WUFDakIsS0FBSywwQkFBYyxDQUFDLFFBQVE7Z0JBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFO29CQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7b0JBQ3BDLE1BQU07aUJBQ1Q7Z0JBQ0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ2xELElBQUksQ0FBQyxNQUFNLEVBQUU7b0JBQ1QsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO29CQUNsRSxJQUFJLE1BQU0sS0FBSyxNQUFNLEVBQUU7d0JBQ25CLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3FCQUN0QztpQkFDSjtxQkFBTTtvQkFDSCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDaEU7Z0JBQ0QsTUFBTTtZQUVWLEtBQUssMEJBQWMsQ0FBQyxFQUFFO2dCQUNsQixZQUFZLEdBQUcsSUFBSSxDQUFDO2dCQUNwQix1Q0FBdUM7Z0JBQ3ZDLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtvQkFDWixPQUFPLENBQUMsSUFBSSxDQUFDLCtCQUErQjt3QkFDNUMscUJBQXFCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLGNBQWMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8saUJBQWlCLENBQUMsQ0FBQztpQkFDckY7Z0JBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDO2dCQUN6Qyx1Q0FBdUM7Z0JBQ3ZDLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtvQkFDWixPQUFPLENBQUMsSUFBSSxDQUFDLDJEQUEyRCxDQUFDLENBQUM7aUJBQzdFO2dCQUNELE1BQU07WUFFVixLQUFLLDBCQUFjLENBQUMsSUFBSTtnQkFDcEIsWUFBWSxHQUFHLElBQUksQ0FBQztnQkFDcEIsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDdkIsdUNBQXVDO2dCQUN2QyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7b0JBQ1osT0FBTyxDQUFDLElBQUksQ0FBQyw2REFBNkQsQ0FBQyxDQUFDO2lCQUMvRTtnQkFDRCxNQUFNO1lBRVYsS0FBSywwQkFBYyxDQUFDLE1BQU07Z0JBQ3RCLFlBQVksR0FBRyxJQUFJLENBQUM7Z0JBQ3BCLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3ZCLElBQUksZUFBZSxFQUFFO29CQUNqQixPQUFPLENBQUMsSUFBSSxDQUFDLHFDQUFxQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDL0Qsb0JBQW9CO29CQUNwQixxREFBcUQ7b0JBQ3JELDJGQUEyRjtvQkFDM0YsSUFBSTtpQkFDUDtnQkFDRCxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7b0JBQ1osT0FBTyxDQUFDLElBQUksQ0FBQywrQkFBK0I7d0JBQzVDLDBCQUEwQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxjQUFjLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLGlCQUFpQixDQUFDLENBQUM7aUJBQzFGO2dCQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQztnQkFDeEMsdUNBQXVDO2dCQUN2QyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7b0JBQ1osT0FBTyxDQUFDLElBQUksQ0FBQyxnRUFBZ0UsQ0FBQyxDQUFDO2lCQUNsRjtnQkFDRCxNQUFNO1lBRVYsS0FBSywwQkFBYyxDQUFDLE9BQU87Z0JBQ3ZCLFlBQVksR0FBRyxJQUFJLENBQUM7Z0JBQ3BCLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxNQUFNLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQztnQkFDMUUsdUNBQXVDO2dCQUN2QyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7b0JBQ1osT0FBTyxDQUFDLElBQUksQ0FBQywrQkFBK0I7d0JBQzVDLHdCQUF3QixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxXQUFXLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLGlCQUFpQixDQUFDLENBQUM7aUJBQ3JGO2dCQUNELFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNuQyxNQUFNO1lBRVYsS0FBSywwQkFBYyxDQUFDLEtBQUs7Z0JBQ3JCLFlBQVksR0FBRyxJQUFJLENBQUM7Z0JBQ3BCLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQztnQkFDNUMsdUNBQXVDO2dCQUN2QyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7b0JBQ1osT0FBTyxDQUFDLElBQUksQ0FBQywrQkFBK0I7d0JBQzVDLHNCQUFzQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLGlCQUFpQixDQUFDLENBQUM7aUJBQ3BGO2dCQUNELE1BQU07WUFFVixLQUFLLDBCQUFjLENBQUMsS0FBSztnQkFDckIsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDdkIsTUFBTTtZQUVWLEtBQUssMEJBQWMsQ0FBQyxRQUFRO2dCQUN4QixPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUMxQixNQUFNO1lBRVYsS0FBSywwQkFBYyxDQUFDLFFBQVE7Z0JBQ3hCLElBQUksQ0FBQyxlQUFlLEVBQUU7b0JBQ2xCLE9BQU8sRUFBRSxDQUFDO2lCQUNiO2dCQUNELElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7Z0JBQ2hDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFO29CQUMvQyxTQUFTLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO2lCQUN4RTtnQkFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLDRCQUE0QixTQUFTLFFBQVEsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUM7Z0JBRWpGLE1BQU07WUFFVixLQUFLLDBCQUFjLENBQUMsT0FBTztnQkFDdkIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztnQkFDeEIsSUFBSSxDQUFDLGVBQWUsRUFBRTtvQkFDbEIsT0FBTyxDQUFDLGVBQWUseUJBQWUsQ0FBQyxPQUFPLHVCQUF1QixHQUFHLElBQUksQ0FBQyxDQUFDO2lCQUNqRjtnQkFDRCxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRTtvQkFDbkMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztpQkFDOUQ7Z0JBRUQsT0FBTyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsR0FBRyxRQUFRLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO2dCQUMzRSxJQUFJLHlCQUFlLENBQUMsT0FBTyxFQUFFO29CQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUseUJBQWUsQ0FBQyxPQUFPLDZDQUE2QyxHQUFHLE1BQU0sQ0FBQyxDQUFDO2lCQUM5RztxQkFBTTtvQkFDSCxPQUFPLENBQUMsSUFBSSxDQUFDLDRFQUE0RSxHQUFHLE9BQU8sQ0FBQyxDQUFDO2lCQUN4RztnQkFFRCxNQUFNO1lBR1YsS0FBSywwQkFBYyxDQUFDLFNBQVM7Z0JBQ3pCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztnQkFDakIsTUFBTSxhQUFhLEdBQUcsRUFBRSxDQUFDO2dCQUN6QixLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRTtvQkFDcEIsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLHlCQUFlLENBQUMsU0FBUyxFQUFFO3dCQUN4QyxhQUFhLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7d0JBQzNDLFNBQVM7cUJBQ1o7b0JBQ0QsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLHlCQUFlLENBQUMsS0FBSyxFQUFFO3dCQUNwQyxhQUFhLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7d0JBQ3ZDLFNBQVM7cUJBQ1o7b0JBQ0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUU7d0JBQ2QsS0FBSyxHQUFHLEtBQUssQ0FBQzt3QkFDZCxNQUFNO3FCQUNUO29CQUNELElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7d0JBQ3hCLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLENBQUM7d0JBQzVDLFNBQVM7cUJBQ1o7b0JBQ0QsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQ25DO2dCQUNELElBQUksQ0FBQyxLQUFLLEVBQUU7b0JBQ1IsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztpQkFDaEM7cUJBQU07b0JBQ0gsT0FBTyxDQUFDLElBQUksQ0FBQyxzQ0FBc0MseUJBQWUsQ0FBQyxNQUFNLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQzNHLElBQUksZUFBZSxFQUFFO3dCQUNqQixPQUFPLENBQUMsSUFBSSxDQUFDLG9FQUFvRTs0QkFDcEUsZ0RBQWdEOzRCQUNoRCxtRUFBbUU7NEJBQ25FLFVBQVU7NEJBQ1YsaUVBQWlFOzRCQUNqRSxHQUFHLENBQUMsQ0FBQztxQkFDckI7b0JBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO2lCQUM1QztnQkFDRCxNQUFNO1lBRVYsS0FBSywwQkFBYyxDQUFDLFlBQVk7Z0JBQzVCLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQztnQkFDbkIsS0FBSyxNQUFNLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUM3QixJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUsseUJBQWUsQ0FBQyxTQUFTLEVBQUU7d0JBQ3hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQzt3QkFDckMsU0FBUztxQkFDWjtvQkFDRCxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUsseUJBQWUsQ0FBQyxLQUFLLEVBQUU7d0JBQ3BDLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQzt3QkFDakMsU0FBUztxQkFDWjtvQkFDRCxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUsseUJBQWUsQ0FBQyxPQUFPLEVBQUU7d0JBQ3RDLE9BQU8sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQzt3QkFDbkMsU0FBUztxQkFDWjtvQkFDRCxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUsseUJBQWUsQ0FBQyxRQUFRLEVBQUU7d0JBQ3ZDLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQzt3QkFDcEMsU0FBUztxQkFDWjtvQkFFRCxJQUFJLEdBQUcsQ0FBQyxPQUFPLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7d0JBQ3ZDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLENBQUM7d0JBQ3RDLFNBQVM7cUJBQ1o7b0JBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQzdCO2dCQUNELElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtvQkFDcEIsSUFBSSxpQkFBaUIsR0FBRyxLQUFLLENBQUM7b0JBQzlCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUNyQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7NEJBQ2xDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDOzRCQUNoQyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQzs0QkFDMUIsaUJBQWlCLEdBQUcsSUFBSSxDQUFDOzRCQUN6QixNQUFNO3lCQUNUO3FCQUNKO29CQUNELElBQUksQ0FBQyxpQkFBaUIsRUFBRTt3QkFDcEIsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7cUJBQ25DO2lCQUNKO2dCQUNELHdDQUF3QztnQkFDeEMsSUFBSSxNQUFNLEdBQUcsZUFBZSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQzFGLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDekQsS0FBSyxNQUFNLFNBQVMsSUFBSSx5QkFBZSxDQUFDLFVBQVUsRUFBRTtvQkFDaEQsSUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO3dCQUN4QixNQUFNLEdBQUcsUUFBUSxHQUFHLE1BQU0sQ0FBQzt3QkFDM0IsTUFBTTtxQkFDVDtpQkFDSjtnQkFDRCxJQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxLQUFLLFFBQVEsRUFBRTtvQkFDOUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRTt3QkFDekMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLE1BQU0sR0FBRyxDQUFDLENBQUM7cUJBQ3JDO2lCQUNKO3FCQUFNLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxVQUFVLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFO29CQUN4RCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQztpQkFDOUI7cUJBQU07b0JBQ0gsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ3RELElBQUksQ0FBQyxVQUFVLEVBQUU7d0JBQ2IsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxNQUFNLE1BQU0sR0FBRyxDQUFDLENBQUM7d0JBQ3pELElBQUksTUFBTSxLQUFLLE1BQU0sRUFBRTs0QkFDbkIsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7eUJBQ3RDO3FCQUNKO3lCQUFNO3dCQUNILE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7cUJBQy9EO2lCQUNKO2dCQUNELE1BQU07WUFDVixLQUFLLDBCQUFjLENBQUMsWUFBWTtnQkFDNUIsdURBQXVEO2dCQUN2RCxJQUFJLGNBQWMsR0FBRyxHQUFHLE1BQU0sR0FBRyxDQUFDO2dCQUNsQyxJQUFJLENBQUUsZUFBZSxFQUFFO29CQUNuQixjQUFjLEdBQUcsR0FBRyxZQUFZLEdBQUcsR0FBRyxjQUFjLENBQUM7aUJBQ3hEO2dCQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLGNBQWMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRTtvQkFDM0QsZ0JBQWdCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN6RixNQUFNO1lBQ1YsS0FBSywwQkFBYyxDQUFDLE1BQU07Z0JBQ3RCLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUN0QixPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO29CQUNoRCxNQUFNO2lCQUNUO2dCQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ3hCLE1BQU07WUFDVixLQUFLLDBCQUFjLENBQUMsYUFBYTtnQkFDN0IsTUFBTSxTQUFTLEdBQVEsRUFBRSxDQUFDO2dCQUMxQix3REFBd0Q7Z0JBQ3hELElBQUksZUFBZSxHQUFHLEdBQUcsTUFBTSxHQUFHLENBQUM7Z0JBQ25DLElBQUksQ0FBRSxlQUFlLEVBQUU7b0JBQ25CLGVBQWUsR0FBRyxHQUFHLFlBQVksR0FBRyxHQUFHLGVBQWUsQ0FBQztpQkFDMUQ7Z0JBQ0Qsd0JBQXdCO2dCQUN4QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDbEMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQ25DO2dCQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUE7Z0JBRTVCLE1BQU0sR0FBRyxHQUFHLFNBQVMsZUFBZSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxlQUFlLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUM7Z0JBQ2pILElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxVQUFVLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFO29CQUNqRCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztvQkFDeEIsT0FBTyxDQUFDLElBQUksQ0FBQyx3REFBd0QsQ0FBQyxDQUFBO29CQUN0RSxNQUFNO2lCQUNUO2dCQUNELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN0RCxJQUFJLENBQUMsVUFBVSxFQUFFO29CQUNiLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDO2lCQUN6RDtxQkFBTTtvQkFDSCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUM1RDtnQkFFRCxJQUFJLE1BQU0sS0FBSyxNQUFNLEVBQUU7b0JBQ25CLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUN0QztnQkFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLHdEQUF3RCxDQUFDLENBQUE7Z0JBQ3RFLE1BQU07WUFFVixLQUFLLDBCQUFjLENBQUMsY0FBYztnQkFDOUIsTUFBTSxRQUFRLEdBQVEsRUFBRSxDQUFDO2dCQUN6QixNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsWUFBWSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFFMUQsd0JBQXdCO2dCQUN4QixJQUFJLGVBQWUsRUFBRTtvQkFDakIsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN2QyxXQUFXO29CQUNYLDREQUE0RDtvQkFDNUQsK0NBQStDO29CQUMvQyxvRkFBb0Y7b0JBQ3BGLCtCQUErQjtvQkFDL0IscUJBQXFCO29CQUNyQixZQUFZO29CQUNaLFFBQVE7aUJBQ1A7Z0JBQ0QsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDO2dCQUNwQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDbEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNwQixJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssZ0JBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUU7d0JBQ2xELFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUMzQixpREFBaUQ7cUJBQ3BEO3lCQUFNO3dCQUNILFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO3FCQUNyQztvQkFDRCxJQUFJLEdBQUcsQ0FBQyxRQUFRLEVBQUU7d0JBQ2QsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNoRDtpQkFDSjtnQkFFRCxPQUFPLENBQUMsSUFBSSxDQUFDLHFIQUFxSCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksYUFBYSxDQUFDLENBQUM7Z0JBQy9KLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0JBQXNCLE1BQU0sdUNBQXVDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMxRywrQkFBK0I7Z0JBQy9CLHlHQUF5RztnQkFDekcsV0FBVztnQkFDWCxpSEFBaUg7Z0JBQ2pILElBQUk7Z0JBQ0osTUFBTSxFQUFFLEdBQUcsU0FBUyxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLGNBQWMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQztnQkFDekcsb0VBQW9FO2dCQUNwRSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssVUFBVSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRTtvQkFDakQsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7aUJBQzFCO3FCQUFNO29CQUNILE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNyRCxJQUFJLENBQUMsU0FBUyxFQUFFO3dCQUNaLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO3FCQUN4RDt5QkFBTTt3QkFDSCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO3FCQUN6RDtvQkFDRCxJQUFJLE1BQU0sS0FBSyxNQUFNLEVBQUU7d0JBQ25CLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3FCQUN0QztpQkFDSjtnQkFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLHNEQUFzRCxNQUFNLEdBQUcsQ0FBQyxDQUFDO2dCQUM5RSxpRUFBaUU7Z0JBQ2pFLDREQUE0RDtnQkFDNUQsZ0RBQWdEO2dCQUNoRCxPQUFPLENBQUMsSUFBSSxDQUFDLG1DQUFtQyxDQUFDLENBQUM7Z0JBQ2xELE1BQU07WUFDVixLQUFLLDBCQUFjLENBQUMsS0FBSztnQkFDckIsT0FBTyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDO2dCQUNuRSxNQUFNO1NBQ2I7UUFFRCxvSEFBb0g7UUFDcEgsSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLFVBQVUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRTtZQUNyRix1Q0FBdUM7WUFDM0MsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZELE9BQU8sQ0FBQyxJQUFJLENBQUMsa0NBQWtDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxPQUFPLE1BQU0sSUFBSSxDQUFDLENBQUM7U0FDdkY7UUFDRCxvRUFBb0U7UUFDcEUsOENBQThDO1FBQzlDLDREQUE0RDtRQUM1RCxnRUFBZ0U7UUFDaEUsNkJBQTZCO1FBQzdCLGdHQUFnRztRQUNoRyx5QkFBeUI7UUFDekIsa0hBQWtIO1FBQ2xILFlBQVk7UUFDWixJQUFJO1FBRUosSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2YsT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQzVDLFlBQVksRUFBRSxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUN6RixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2xCLElBQUksWUFBWSxFQUFFO2dCQUNkLFlBQVksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7YUFDckM7U0FDSjtRQUVELDJEQUEyRDtRQUMzRCxJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNoQyxPQUFPLENBQUMsSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQUM7WUFDOUMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztTQUNoQztRQUVELE9BQU8sT0FBTyxDQUFDO0lBQ25CLENBQUM7SUFFRCxNQUFNLENBQUMsZUFBZSxDQUFDLFFBQXNCLEVBQUUsWUFBc0IsRUFBRSxlQUF3QixFQUN4RSxZQUFvQixFQUFFLE1BQWMsRUFBRSxhQUF3QjtRQUNqRixJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDakIsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLEtBQUssTUFBTSxDQUFDLElBQUksUUFBUSxFQUFFO1lBQ3RCLE1BQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFDN0UsWUFBWSxFQUFFLE1BQU0sRUFBRSxhQUFhLENBQUMsQ0FBQztZQUN6QyxJQUFLLENBQUMsQ0FBQyxJQUFJLEtBQUssMEJBQWMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRTtnQkFDaEQsT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ3hDLFNBQVMsRUFBRSxDQUFDO2FBQ2Y7aUJBQU0sSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLDBCQUFjLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUU7Z0JBQ3BELE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUN4QyxPQUFPLFNBQVMsR0FBRyxDQUFDLEVBQUU7b0JBQ2xCLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ2xCLFNBQVMsRUFBRSxDQUFDO2lCQUNmO2FBQ0o7aUJBQU07Z0JBQ0gsT0FBTyxTQUFTLEdBQUcsQ0FBQyxFQUFFO29CQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNsQixTQUFTLEVBQUUsQ0FBQztpQkFDZjtnQkFDRCxPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQzthQUMzQztTQUNKO1FBQ0QsT0FBTyxTQUFTLEdBQUcsQ0FBQyxFQUFFO1lBQ2xCLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbEIsU0FBUyxFQUFFLENBQUM7U0FDZjtRQUNELE9BQU8sT0FBTyxDQUFDO0lBQ25CLENBQUM7SUFFRCxNQUFNLENBQUMsWUFBWSxDQUFDLEdBQVc7UUFDM0IsSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQ2pDLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBQ0Qsc0NBQXNDO1FBQ3RDLElBQUksS0FBYSxDQUFDO1FBQ2xCLElBQUksS0FBYSxDQUFDO1FBQ2xCLE1BQU0sT0FBTyxHQUFXLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDekMsSUFBSSxPQUFPLEtBQUssQ0FBQyxFQUFFO1lBQ2YsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNiLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3hCO2FBQU07WUFDSCxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDOUIsS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ2xDO1FBQ0QsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNuRCxJQUFJLFlBQVksS0FBSyxDQUFDLENBQUMsRUFBRTtZQUNyQixNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUMxQyxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RDLCtGQUErRjtZQUMvRixzRUFBc0U7WUFDdEUsT0FBTyxDQUFDLGVBQWUseUJBQWUsQ0FBQyxTQUFTLHNCQUFzQixLQUFLLEdBQUc7b0JBQ3RFLEtBQUssSUFBSSxNQUFNLEtBQUssQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLEVBQUUsRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztTQUNwRjthQUFNO1lBQ0gsNEdBQTRHO1lBQzVHLE9BQU8sQ0FBQyxlQUFlLHlCQUFlLENBQUMsU0FBUyxzQkFBc0IsS0FBSyxNQUFNLEtBQUssS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3RHO0lBQ0wsQ0FBQztJQUVELE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBVztRQUMzQixJQUFJLENBQUMsR0FBRyxFQUFFO1lBQUUsT0FBTztTQUFFO1FBQ3JCLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDM0IsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRztZQUNuQixPQUFPLEdBQUcsQ0FBQztTQUNkO1FBQ0QsSUFBSSxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUNmLE1BQU0sR0FBRyxNQUFNLENBQUM7U0FDbkI7UUFFRCxJQUFJLFFBQVEsQ0FBQztRQUNiLElBQUksU0FBUyxDQUFDO1FBQ2QsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMvQyxJQUFJLFlBQVksS0FBSyxDQUFDLENBQUMsRUFBRTtZQUNyQixRQUFRLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDekMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2xEO2FBQU07WUFDSCxRQUFRLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLFNBQVMsR0FBRyxNQUFNLENBQUM7U0FDdEI7UUFDRCxJQUFJLFNBQVMsS0FBSyxNQUFNLEVBQUU7WUFDdEIsT0FBTyxlQUFlLHlCQUFlLENBQUMsU0FBUyxzQkFBc0IsTUFBTSxNQUFNLFFBQVEsaUJBQWlCLENBQUM7U0FDOUc7UUFDRCxPQUFPLGVBQWUseUJBQWUsQ0FBQyxTQUFTLHNCQUFzQixNQUFNLE9BQU8sUUFBUSxNQUFNLFNBQVMsaUJBQWlCLENBQUM7UUFDM0gsNEhBQTRIO0lBQ2hJLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFXO1FBQ2xDLEdBQUcsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN6QyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDL0IsR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDMUQ7UUFDRCxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRTtZQUNuQyxHQUFHLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMxQjtRQUNELElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRTtZQUM3RCxHQUFHLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztTQUMxQztRQUNELE1BQU0sQ0FBQyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDOUIsb0JBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2xCLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFO29CQUNULE9BQU8sQ0FBQyxtREFBbUQsR0FBRyxHQUFHLENBQUMsQ0FBQztvQkFDbkUsT0FBTyxFQUFFLENBQUM7aUJBQ2I7Z0JBQ0QsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO29CQUM1QixHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7aUJBQzFDO3FCQUFNO29CQUNILEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ2pGO2dCQUNMLG9CQUFvQjtnQkFDcEIsNERBQTREO1lBQzVELENBQUMsQ0FBQyxDQUFDO1lBRUgsd0NBQXdDO1lBQ3hDLDRCQUE0QjtZQUM1Qix3Q0FBd0M7WUFDeEMseUJBQXlCO1lBQ3pCLCtFQUErRTtZQUMvRSxnQkFBZ0I7WUFDaEIsS0FBSztZQUNMLHFFQUFxRTtZQUNyRSwyQkFBMkI7WUFDM0IsNEVBQTRFO1lBQzVFLEtBQUs7WUFDTCw0QkFBNEI7WUFDNUIsOEVBQThFO1lBQzlFLEtBQUs7WUFDTCxrQkFBa0I7UUFDdEIsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLE1BQU0sQ0FBQyxDQUFDO0lBQ25CLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsU0FBUztRQUNyQyxNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsT0FBTyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUM7UUFDckMsSUFBSSxNQUFNLEdBQUcsR0FBRyxDQUFDO1FBQ2pCLElBQUksU0FBUyxDQUFDLFFBQVEsRUFBRSxLQUFLLGdCQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFHO1lBQ3BELE1BQU0sR0FBRyxNQUFNLFNBQVMsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQzdDLE1BQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2FBQzVCO1lBQ0QsTUFBTSxHQUFHLEdBQUcsR0FBRyxNQUFNLEdBQUcsR0FBRyxDQUFDO1NBQy9CO2FBQU0sSUFBSSxTQUFTLENBQUMsUUFBUSxFQUFFLEtBQUssZ0JBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUU7WUFDM0QsTUFBTSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMvQyxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNULE1BQU0sQ0FBQyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7b0JBQzlCLE1BQU0sTUFBTSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7b0JBQ2hDLE1BQU0sQ0FBQyxNQUFNLEdBQUc7d0JBQ1osT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDM0IsQ0FBQyxDQUFDO29CQUNGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsR0FBRyxFQUFFO3dCQUNsQixPQUFPLENBQUMsMENBQTBDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNuRSxDQUFDLENBQUM7b0JBQ0YsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDM0IsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDO2dCQUNqQixJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtvQkFDN0MsTUFBSyxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7aUJBQzVCO2dCQUNELE1BQU0sR0FBRyxHQUFHLEdBQUcsTUFBTSxHQUFHLEdBQUcsQ0FBQztnQkFDNUIsc0VBQXNFO2dCQUN0RSxxQkFBcUI7Z0JBQ3JCLHVFQUF1RTtnQkFDdkUsV0FBVztnQkFDWCwyQ0FBMkM7Z0JBQzNDLHFEQUFxRDtnQkFDckQsdUVBQXVFO2dCQUN2RSxJQUFJO2dCQUNKLGlEQUFpRDtnQkFDakQsR0FBRyxDQUFDLE9BQU8sR0FBRyxFQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFDLENBQUM7YUFDcEM7U0FDSjtRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDYixNQUFNLE1BQU0sR0FBRyxpQkFBVSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUMxQyxNQUFNLE9BQU8sR0FBRyxJQUFJLCtCQUFjLEVBQUUsQ0FBQztZQUVyQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDcEMsT0FBTyxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUU7Z0JBQ2xCLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUU7b0JBQ3hCLE1BQU0sRUFBRSxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUNwRCxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNsQixRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7aUJBQ3ZCO3FCQUFNO29CQUNILFFBQVEsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztpQkFDcEM7WUFDTCxDQUFDLENBQUM7WUFFRixPQUFPLENBQUMsT0FBTyxHQUFHLEdBQUcsRUFBRTtnQkFDdkIsUUFBUSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ2pDLENBQUMsQ0FBQztZQUNGLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNqQixDQUFDLENBQUMsQ0FBQztRQUVILE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDNUIsT0FBTyxVQUFVLENBQUM7UUFDcEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsb0NBQW9DO0lBQ3BDLDhDQUE4QztJQUM5QyxvQ0FBb0M7SUFDcEMsa0RBQWtEO0lBQ2xELFFBQVE7SUFDUixxQkFBcUI7SUFDckIsSUFBSTtJQUNKLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTTtRQUNyQixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNyQixNQUFNLEdBQUcseUJBQWUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUNwQzthQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDNUIsTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUM5QjthQUFNO1lBQ0gsTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUMzQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDcEMseUJBQWUsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzlDO1NBQ0o7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBSUQsZ0ZBQWdGO0lBQ2hGLHNCQUFzQjtJQUN0QixzQ0FBc0M7SUFDdEMsNkRBQTZEO0lBQzdELDhDQUE4QztJQUM5Qyx3RkFBd0Y7SUFDeEYsd0RBQXdEO0lBQ3hELGdFQUFnRTtJQUNoRSxlQUFlO0lBQ2YsMkJBQTJCO0lBQzNCLDBDQUEwQztJQUMxQyxxREFBcUQ7SUFDckQsNEJBQTRCO0lBQzVCLGdCQUFnQjtJQUNoQix3RkFBd0Y7SUFDeEYsWUFBWTtJQUNaLHVEQUF1RDtJQUN2RCxvREFBb0Q7SUFDcEQsc0RBQXNEO0lBQ3RELGdFQUFnRTtJQUNoRSxRQUFRO0lBQ1Isb0JBQW9CO0lBQ3BCLElBQUk7SUFFSixNQUFNLENBQUMsYUFBYSxDQUFDLEdBQWUsRUFBRSxJQUFXLEVBQUUsV0FBZTtRQUM5RCxNQUFNLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDakIsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFO1lBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUU7Z0JBQ2pDLFNBQVM7YUFDWjtZQUNELEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDNUM7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRU0sTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFXLEVBQUUsZUFBZSxHQUFHLEtBQUssRUFBRSxXQUFlLEVBQ3JELFlBQW9CLEVBQUUsTUFBYyxFQUFFLGFBQXdCO1FBQ3BGLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ3RCLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUVqQixzRkFBc0Y7UUFDdEYsa0ZBQWtGO1FBQ2xGLElBQUksQ0FBQyxlQUFlLEVBQUU7WUFDbEIsYUFBYTtTQUNoQjthQUFNLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxPQUFPLEVBQUU7WUFDOUIsZUFBZSxHQUFHLElBQUksQ0FBQztTQUMxQjthQUFNLElBQUksZUFBZSxFQUFFO1lBQ3hCLE9BQU8sQ0FBQyxTQUFTLEVBQUUsZUFBZSxDQUFDLENBQUM7U0FDdkM7UUFDRCxJQUFJLFdBQXFCLENBQUM7UUFFMUIsWUFBWTtRQUNaLEtBQUssTUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUMvQixXQUFXLEdBQUcsRUFBRSxDQUFDO1lBQ2pCLEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2xDLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ2pDO1lBQ0QsT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsZUFBZSxFQUFFLFlBQVksRUFDaEQsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7U0FDL0U7UUFFRCx3QkFBd0I7UUFDeEIsSUFBSSxlQUFlLEVBQUU7WUFDakIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztTQUM3RTtRQUVELElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxPQUFPLEVBQUU7WUFDdkIsT0FBTyxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1NBQ2hEO1FBR0QsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUM1QixrQ0FBa0M7UUFDbEMsT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLHlCQUFlLENBQUMsVUFBVSxzQkFBc0IsQ0FBQyxDQUFDO1FBQzlFLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFFakIsT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFdBQVcsRUFBRSxlQUFlLEVBQUUsWUFBWSxFQUMxRCxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUMzRSxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssS0FBSyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNsRCw0QkFBNEI7WUFFNUIscURBQXFEO1lBQ3JELG9EQUFvRDtTQUN2RDthQUFNO1lBQ0gsT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLHlCQUFlLENBQUMsV0FBVyxzQkFBc0IsQ0FBQyxDQUFDO1lBQy9FLDRCQUE0QjtZQUM1Qiw0Q0FBNEM7U0FDL0M7UUFFRCxJQUFJLGVBQWUsS0FBSyxFQUFFLEVBQUU7WUFDeEIsZUFBZSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7U0FDL0I7UUFFRCxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVELE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFlO1FBQ3BDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDNUQsSUFBSSxRQUFRLEdBQUcsa0JBQWtCLElBQUksQ0FBQyxJQUFJLGNBQWMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQztRQUVuSCxJQUFJLE1BQU0sR0FBRyxlQUFlLENBQUM7UUFFN0IsTUFBTSxtQkFBbUIsR0FBRyxFQUFFLENBQUM7UUFDL0IsTUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNsQixLQUFLLE1BQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFO1lBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNmLFNBQVM7YUFDWjtZQUNELFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDO1lBQ2pDLFNBQVMsRUFBRyxDQUFDO1lBQ2IsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUN4RCxNQUFNLFlBQVksR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQy9DLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxPQUFPLEVBQUU7Z0JBQ3ZCLGdFQUFnRTtnQkFDaEUsTUFBTSxJQUFJLFlBQVksWUFBWSw0Q0FBNEMsQ0FBQzthQUNsRjtpQkFBTTtnQkFDSCxNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2RixNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDNUQsUUFBUSxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsWUFBWSxFQUFFO29CQUNoRCxjQUFjLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJO29CQUN0RSxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDO2dCQUVwQywwQkFBMEI7Z0JBQzFCLDZDQUE2QztnQkFDN0MsaURBQWlEO2dCQUNqRCxvQkFBb0I7Z0JBQ3BCLFFBQVE7Z0JBQ1IsOEVBQThFO2dCQUM5RSxJQUFJO2dCQUNKLHlHQUF5RztnQkFDekcscUNBQXFDO2dCQUNyQyxnSEFBZ0g7Z0JBQ2hILGNBQWM7Z0JBQ2Qsd0VBQXdFO2dCQUN4RSxPQUFPO2dCQUVQLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDekgsTUFBTSxJQUFJLGNBQWMsWUFBWSxXQUFXLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssQ0FBQztpQkFDN0c7cUJBQU07b0JBQ0gsSUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFDO29CQUNyQixLQUFLLE1BQU0sUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFO3dCQUNyQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFOzRCQUNyQyxTQUFTO3lCQUNaO3dCQUNELG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFHLENBQUM7d0JBQ3RELFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUUsUUFBUSxJQUFJLENBQUMsSUFBSSxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztxQkFDeEg7b0JBQ0QsV0FBVyxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3RELE1BQU0sSUFBSSxjQUFjLFlBQVkscUNBQXFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztpQkFDbkk7Z0JBQ0QsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLEtBQUssRUFBRTtvQkFDckIsTUFBTSxJQUFJLGtCQUFrQixZQUFZLGNBQWMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQztpQkFDcEg7cUJBQU07b0JBQ0gsTUFBTSxJQUFJLFdBQVcsWUFBWSxjQUFjLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUM7aUJBQzdHO2FBQ0o7U0FDSjtRQUNELE1BQU0sSUFBSSxPQUFPLENBQUM7UUFDbEIsUUFBUSxJQUFJLE1BQU0sQ0FBQztRQUVuQixPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDO0NBR0o7QUE1eEJELDhCQTR4QkMifQ==