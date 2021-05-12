"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const xmlhttprequest_1 = require("xmlhttprequest");
// import * as fs from "fs";
// import * as circularJSON from "circular-json";
const Modules = __importStar(require("@assets/core/modules"));
const modules_1 = require("@assets/core/modules");
// import { CodeUtils } from "./model/code/code.utils";
// import { IFlowchart, FlowchartUtils } from "./model/flowchart";
// import { IProcedure, ProcedureTypes } from "./model/procedure";
// import { INode } from "./model/node";
// import { checkArgInput } from "./utils/parser";
exports.pythonListFunc = `
function pythonList(x, l){
    if (x < 0) {
        return x + l;
    }
    return x;
}
`;
// export const mergeInputsFunc = ` function mergeInputs(models){     let result
// = __modules__.${_parameterTypes.new}();     try {         result.debug =
// __debug__;     } catch (ex) {}     for (let model of models){
// __modules__.${_parameterTypes.merge}(result, model);     }     return result;
// }
exports.mergeInputsFunc = `
function mergeInputs(models){
    let result = null;
    if (models.length === 0) {
        result = __modules__.${modules_1._parameterTypes.new}();
    } else if (models.length === 1) {
        result = models[0].clone();
    } else {
        result = models[0].clone();
        for (let i = 1; i < models.length; i++) {
            __modules__.${modules_1._parameterTypes.merge}(result, models[i]);
        }
    }
    try {
        result.debug = __debug__;
    } catch (ex) {}
    return result;
}
function duplicateModel(model){
    const result = model.clone();
    try {
        result.debug = __debug__;
    } catch (ex) {}
    return result;
}
`;
const printFuncString = `
function printFunc(_console, name, value){
    let val;
    if (!value) {
        val = value;
    } else if (typeof value === 'number' || value === undefined) {
        val = value;
    } else if (typeof value === 'string') {
        val = '"' + value + '"';
    } else if (value.constructor === [].constructor) {
        val = JSON.stringify(value);
    } else if (value.constructor === {}.constructor) {
        val = JSON.stringify(value);
    } else {
        val = value;
    }
    _console.push('_ ' + name + ': ' + val );
    return val;
}
`;
function getModelString(model) {
    let model_data = model.exportGI(null);
    model_data = model_data.replace(/\\/g, "\\\\\\"); // TODO temporary fix
    return model_data;
}
async function runJavascriptFile(event) {
    const p = new Promise((resolve) => {
        node_fetch_1.default(event.file)
            .then((res) => {
            if (!res.ok) {
                resolve("HTTP Request Error: request file timeout from url " + event.file);
                return "";
            }
            return res.text();
        })
            .then(async (body) => {
            const splittedString = body.split("/** * **/");
            const argStrings = splittedString[0].split("// Parameter:");
            const args = [];
            if (argStrings.length > 1) {
                for (let i = 1; i < argStrings.length - 1; i++) {
                    args.push(JSON.parse(argStrings[i]));
                }
                args.push(JSON.parse(argStrings[argStrings.length - 1].split("function")[0].split("async")[0]));
            }
            const val0 = args.map((arg) => arg.name);
            const val1 = args.map((arg) => {
                if (event.parameters && event.parameters.hasOwnProperty(arg.name)) {
                    return event.parameters[arg.name];
                }
                return arg.value;
            });
            let prefixString = `async function __main_func(__modules__, ` + val0 + `) {\n__debug__ = false;\n__model__ = null;\n`;
            if (event.model) {
                prefixString = `async function __main_func(__modules__, ` + val0 + `) {\n__debug__ = false;\n__model__ = ` + event.model + `;\n`;
            }
            const postfixString = `\n}\nreturn __main_func;`;
            const fn = new Function(prefixString + splittedString[1] + postfixString);
            const result = await fn()(Modules, ...val1);
            result.model = getModelString(result.model);
            console.log(result.model);
            resolve("successful");
        });
    }).catch((err) => {
        throw err;
    });
    return await p;
}
exports.runJavascriptFile = runJavascriptFile;
async function runJavascriptFileTest(event) {
    node_fetch_1.default(event.file)
        .then((res) => {
        if (!res.ok) {
            return "";
        }
        return res.text();
    })
        .then(async (dataFile) => {
        const fn = new Function(dataFile.replace(/\\/g, ""));
        const result = await fn()(Modules);
        console.log(result.result);
    });
}
exports.runJavascriptFileTest = runJavascriptFileTest;
async function testExecuteJSFile(file, model = null, params = null) {
    const splittedString = file.split("/** * **/");
    const argStrings = splittedString[0].split("// Parameter:");
    const args = [];
    if (argStrings.length > 1) {
        for (let i = 1; i < argStrings.length - 1; i++) {
            args.push(JSON.parse(argStrings[i]));
        }
        args.push(JSON.parse(argStrings[argStrings.length - 1].split("function")[0].split("async")[0]));
    }
    const val0 = args.map((arg) => arg.name);
    const val1 = args.map((arg) => {
        if (params && params.hasOwnProperty(arg.name)) {
            return params[arg.name];
        }
        return arg.value;
    });
    let prefixString = `async function __main_func(__modules__, ` + val0 + `) {\n__debug__ = false;\n__model__ = null;\n`;
    if (model) {
        prefixString = `async function __main_func(__modules__, ` + val0 + `) {\n__debug__ = false;\n__model__ = \`${model}\`;\n`;
    }
    const postfixString = `\n}\nreturn __main_func;`;
    const fn = new Function(prefixString + splittedString[1] + postfixString);
    const result = await fn()(Modules, ...val1);
    return result;
}
async function testGenEval(event) {
    const promiseList = [];
    let genFile;
    let evalFile;
    promiseList.push(new Promise((resolve) => {
        node_fetch_1.default(event.genFile)
            .then((res) => {
            if (!res.ok) {
                resolve("HTTP Request Error: request file timeout from url " + event.genFile);
                return "";
            }
            return res.text();
        })
            .then(async (body) => {
            genFile = body;
            resolve(null);
        });
    }).catch((err) => {
        throw err;
    }));
    promiseList.push(new Promise((resolve) => {
        node_fetch_1.default(event.evalFile)
            .then((res) => {
            if (!res.ok) {
                resolve("HTTP Request Error: request file timeout from url " + event.evalFile);
                return "";
            }
            return res.text();
        })
            .then(async (body) => {
            evalFile = body;
            resolve(null);
        });
    }).catch((err) => {
        throw err;
    }));
    await Promise.all(promiseList);
    const genResult = await testExecuteJSFile(genFile, null, event.genParams);
    const genModel = getModelString(genResult.model);
    const evalResult = await testExecuteJSFile(evalFile, genModel, null);
    console.log(evalResult.result);
    return "successful";
}
exports.testGenEval = testGenEval;
async function runGen(data) {
    const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient({ region: "us-east-1" });
    const s3 = new aws_sdk_1.default.S3();
    if (!data.genUrl || !data.evalUrl) {
        return { __success__: false, __error__: 'Gen Error: gen file or eval file URLs are not provided.' };
    }
    const p = new Promise(async (resolve) => {
        try {
            console.log("genURL:", data.genUrl);
            const genFile = await getGenEvalFile(data.genUrl);
            if (!genFile) {
                resolve({ __success__: false, __error__: 'Gen Error: Unable to place Gen Model onto S3.' });
            }
            const splittedString = genFile.split("/** * **/");
            const argStrings = splittedString[0].split("// Parameter:");
            const args = [];
            if (argStrings.length > 1) {
                for (let i = 1; i < argStrings.length - 1; i++) {
                    args.push(JSON.parse(argStrings[i]));
                }
                args.push(JSON.parse(argStrings[argStrings.length - 1].split("function")[0].split("async")[0]));
            }
            const val0 = args.map((arg) => arg.name);
            const val1 = args.map((arg) => {
                if (data.params && data.params.hasOwnProperty(arg.name)) {
                    return data.params[arg.name];
                }
                return arg.value;
            });
            // const addedString = `__debug__ = false;\n__model__ = null;\n` const fn = new
            // Function('__modules__', ...val0, addedString + splittedString[1]); const
            // result = fn(Modules, ...val1); const model =
            // JSON.stringify(result.model.getData()).replace(/\\/g, '\\\\');
            const prefixString = `async function __main_func(__modules__, ` + val0 + `) {\n__debug__ = false;\n__model__ = null;\n`;
            const postfixString = `\n}\nreturn __main_func;`;
            const fn = new Function(prefixString + splittedString[1] + postfixString);
            const result = await fn()(Modules, ...val1);
            const model = getModelString(result.model).replace(/\\/g, "");
            let checkModelDB = false;
            let checkParamDB = false;
            s3.putObject({
                Bucket: process.env.STORAGE_MOBIUSEVOUSERFILES_BUCKETNAME,
                Key: "public/" + data.owner + "/" + data.JobID + "/" + data.id + ".gi",
                Body: model,
                ContentType: "text/plain",
            }, function (err, result) {
                if (err) {
                    console.log("Error placing gen model:", err);
                    resolve({ __success__: false, __error__: 'Gen Error: Unable to place Gen Model onto S3.' });
                }
                else {
                    console.log("successfully placed model");
                    checkModelDB = true;
                    if (checkParamDB) {
                        resolve({ __success__: true });
                    }
                }
            });
            const params = {
                TableName: process.env.API_MOBIUSEVOGRAPHQL_GENEVALPARAMTABLE_NAME,
                Item: {
                    id: data.id,
                    JobID: data.JobID,
                    GenID: data.GenID,
                    generation: data.generation,
                    genUrl: data.genUrl,
                    evalUrl: data.evalUrl,
                    params: JSON.stringify(data.params),
                    owner: data.owner,
                    live: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    errorMessage: null
                },
            };
            docClient.put(params, function (err, result) {
                if (err) {
                    console.log("Error placing gen data:", err);
                    resolve({ __success__: false, __error__: 'Gen Error: Unable to place Gen Data onto DynamoDB.' });
                }
                else {
                    console.log("successfully placed data");
                    checkParamDB = true;
                    if (checkModelDB) {
                        console.log("ending function (data side)...");
                        resolve({ __success__: true });
                    }
                }
            });
        }
        catch (ex) {
            resolve({ __success__: false, __error__: 'Gen Error: ' + ex.message });
        }
    });
    return await p;
}
exports.runGen = runGen;
async function runEval(recordInfo) {
    const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient({ region: "us-east-1" });
    const s3 = new aws_sdk_1.default.S3();
    console.log("param id:", recordInfo.id);
    const params = {
        Bucket: process.env.STORAGE_MOBIUSEVOUSERFILES_BUCKETNAME,
        // Key: "models/" + recordInfo.id + ".gi",
        Key: "public/" + recordInfo.owner + "/" + recordInfo.JobID + "/" + recordInfo.id + ".gi",
    };
    const r = await s3.getObject(params).promise();
    if (!r) {
        return { __error__: 'Eval Error: Unable to retrieve Gen model.' };
    }
    const data = r.Body.toString("utf-8");
    if (!data || data === null) {
        return { __error__: 'Eval Error: Unable to retrieve Gen model.' };
    }
    if (!recordInfo.evalUrl) {
        return { __error__: 'Eval Error: No eval file url provided.' };
    }
    const p = new Promise(async (resolve) => {
        try {
            console.log("evalUrl:", recordInfo.evalUrl);
            const evalFile = await getGenEvalFile(recordInfo.evalUrl);
            if (!evalFile) {
                resolve({ __error__: 'Eval Error: Unable to retrieve eval file from url - ' + recordInfo.evalUrl });
            }
            const splittedString = evalFile.split("/** * **/");
            const argStrings = splittedString[0].split("// Parameter:");
            const args = [];
            if (argStrings.length > 1) {
                for (let i = 1; i < argStrings.length - 1; i++) {
                    args.push(JSON.parse(argStrings[i]));
                }
                args.push(JSON.parse(argStrings[argStrings.length - 1].split("function")[0].split("async")[0]));
            }
            const val0 = args.map((arg) => arg.name);
            const val1 = args.map((arg) => arg.value);
            const prefixString = `async function __main_func(__modules__, ` + val0 + ") {\n__debug__ = false;\n__model__ = `" + data + "`;\n";
            const postfixString = `\n}\nreturn __main_func;`;
            const fn = new Function(prefixString + splittedString[1] + postfixString);
            const result = await fn()(Modules, ...val1);
            const model = getModelString(result.model).replace(/\\/g, "");
            s3.putObject({
                Bucket: process.env.STORAGE_MOBIUSEVOUSERFILES_BUCKETNAME,
                Key: "public/" + recordInfo.owner + "/" + recordInfo.JobID + "/" + recordInfo.id + "_eval.gi",
                Body: model,
                ContentType: "text/plain",
            }, function (err, data) {
                if (err) {
                    console.log("Error placing eval model:", err);
                    resolve({ __error__: err.message });
                }
                else {
                    console.log("successfully placed eval model");
                    resolve(result.result);
                }
            });
        }
        catch (ex) {
            console.log('error catched:', ex);
            resolve({ __error__: 'Eval Error: ' + ex.message });
        }
    });
    const result = await p;
    console.log("eval result:", result);
    return result;
}
exports.runEval = runEval;
function mutateDesign(existing_design, paramMap, existingParams, newIDNum, newGeneration) {
    // const newID = existing_design.id.split('_'); newID[newID.length - 1] =
    // newIDNum
    const new_design = {
        id: existing_design.JobID + "_" + newIDNum,
        JobID: existing_design.JobID,
        GenID: newIDNum,
        generation: newGeneration,
        genUrl: existing_design.genUrl,
        evalUrl: existing_design.evalUrl,
        owner: existing_design.owner,
        params: null,
        score: null,
        live: true,
        scoreWritten: false,
        liveWritten: false,
        deadWritten: false,
    };
    let failCount = 0;
    while (true) {
        const new_param = {};
        for (const param of paramMap[new_design.genUrl]) {
            if (param.hasOwnProperty("step")) {
                let pos_neg = Math.floor(Math.random() * 2) == 0 ? -1 : 1;
                const existing_step = (existing_design.params[param.name] - param.min) / param.step;
                if (existing_design.params[param.name] === param.min) {
                    pos_neg = 1;
                }
                else if (existing_design.params[param.name] === param.max) {
                    pos_neg = -1;
                }
                let added_val = Math.pow(Math.random(), 50);
                if (pos_neg < 0) {
                    added_val = -1 - Math.floor((added_val * (existing_design.params[param.name] - param.min)) / param.step);
                }
                else {
                    added_val = 1 + Math.floor((added_val * (param.max - existing_design.params[param.name])) / param.step);
                }
                new_param[param.name] = param.min + (existing_step + added_val) * param.step;
            }
            else {
                new_param[param.name] = existing_design.params[param.name];
            }
        }
        new_design.params = new_param;
        if (existingParams[new_design.genUrl]) {
            if (existingParams[new_design.genUrl].indexOf(new_param) !== -1) {
                console.log('duplicate param:', new_param);
                if (failCount > 10) {
                    existingParams[new_design.genUrl].push(new_param);
                    break;
                }
                failCount += 1;
            }
            else {
                existingParams[new_design.genUrl].push(new_param);
                break;
            }
        }
        else {
            existingParams[new_design.genUrl] = [];
            existingParams[new_design.genUrl].push(new_param);
            break;
        }
        break;
    }
    return new_design;
}
function checkDuplicateDesign(newDesign, allParams) {
    for (const existingParam of allParams) {
        if (newDesign.genUrl === existingParam.genUrl && newDesign.params === existingParam.params) {
            return true;
        }
    }
    return false;
}
// function getRandomDesign(designList, tournamentSize, eliminateSize) { }
function tournamentSelect(liveDesignList, deadDesignList, tournament_size, survival_size) {
    // select tournamentSize number of designs from live list
    let selectedDesigns = [];
    for (let i = 0; i < tournament_size; i++) {
        if (liveDesignList.length === 0) {
            break;
        }
        const randomIndex = Math.floor(Math.random() * liveDesignList.length);
        selectedDesigns.push(liveDesignList.splice(randomIndex, 1)[0]);
    }
    // sort the selectedDesigns list in ascending order according to each design's
    // score
    selectedDesigns = selectedDesigns.sort((a, b) => a.score - b.score);
    // mark the first <eliminateSize> entries as dead and add them to the
    // deadDesignList, add the rest back to the liveDesignList
    for (let j = 0; j < selectedDesigns.length; j++) {
        if (j < survival_size) {
            selectedDesigns[j].live = false;
            deadDesignList.push(selectedDesigns[j]);
        }
        else {
            liveDesignList.push(selectedDesigns[j]);
        }
    }
}
async function getGenEvalFile(fileUrl) {
    const s3 = new aws_sdk_1.default.S3();
    const filePromise = new Promise((resolve) => {
        if (fileUrl.indexOf("s3.amazonaws") !== -1) {
            const urlSplit = decodeURIComponent(fileUrl).split(".s3.amazonaws.com/");
            const item = {
                Bucket: urlSplit[0].replace("https://", ""),
                Key: urlSplit[1],
            };
            s3.getObject(item, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                    resolve(null);
                }
                else {
                    resolve(data.Body.toString("utf-8"));
                }
            });
        }
        else {
            const request = new xmlhttprequest_1.XMLHttpRequest();
            request.open("GET", fileUrl);
            request.onload = async () => {
                if (request.status === 200) {
                    resolve(request.responseText);
                }
                else {
                    resolve(null);
                }
            };
            request.send();
        }
    }).catch((err) => {
        throw err;
    });
    return filePromise;
}
async function updateJobDB(jobID, run, status) {
    const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient({ region: "us-east-1" });
    const jobDBUpdatePromise = new Promise((resolve) => {
        docClient.update({
            TableName: process.env.API_MOBIUSEVOGRAPHQL_JOBTABLE_NAME,
            Key: {
                id: jobID,
            },
            UpdateExpression: "set endedAt=:t, run=:r, jobStatus=:s, updatedAt=:u",
            ExpressionAttributeValues: {
                ":t": new Date().toISOString(),
                ":r": run,
                ":s": status,
                ":u": new Date().toISOString(),
            },
            ReturnValues: "UPDATED_NEW",
        }, (err, record) => {
            if (err) {
                console.log("error updating job db", err);
                resolve(false);
            }
            else {
                console.log("successfully updating job db");
                resolve(true);
            }
        });
    }).catch((err) => {
        console.log("job db update error", err);
        throw err;
    });
    await jobDBUpdatePromise;
}
function updateJobError(jobID, docClient, msg) {
    docClient.update({
        TableName: process.env.API_MOBIUSEVOGRAPHQL_JOBTABLE_NAME,
        Key: {
            id: jobID,
        },
        UpdateExpression: "set endedAt=:t, jobStatus=:s, updatedAt=:u, errorMessage=:m",
        ExpressionAttributeValues: {
            ":t": new Date().toISOString(),
            ":s": "terminated",
            ":u": new Date().toISOString(),
            ":m": msg,
        },
        ReturnValues: "UPDATED_NEW",
    }, (err, record) => {
        if (err) {
            console.log("error updating job db", err);
        }
        else {
            console.log("successfully updating job db");
        }
    });
    // throw new Error(msg);
}
async function getJobEntries(jobID, allEntries, liveEntries, existingParams) {
    const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient({ region: "us-east-1" });
    const p = new Promise((resolve) => {
        docClient.query({
            TableName: process.env.API_MOBIUSEVOGRAPHQL_GENEVALPARAMTABLE_NAME,
            IndexName: "byJobID",
            KeyConditionExpression: "JobID = :job ",
            ExpressionAttributeValues: {
                ":job": jobID,
            },
        }, function (err, response) {
            if (err) {
                console.log("Error retrieving parent data:", err);
                resolve(null);
            }
            else {
                resolve(response.Items);
            }
        });
    }).catch((err) => {
        throw err;
    });
    let prevItems = await p;
    if (!prevItems) {
        return;
    }
    prevItems.forEach((item) => {
        if (typeof item.params === "string") {
            item.params = JSON.parse(item.params);
        }
        allEntries.push(item);
        if (!existingParams[item.genUrl]) {
            existingParams[item.genUrl] = [];
        }
        existingParams[item.genUrl].push(item.params);
    });
    prevItems = prevItems.filter((item) => item.live === true);
    prevItems = prevItems.sort((a, b) => {
        if (a.live !== b.live) {
            return b.live - a.live;
        }
        return b.score - a.score;
    });
    for (let i = 0; i < prevItems.length; i++) {
        prevItems[i].scoreWritten = false;
        prevItems[i].liveWritten = false;
        prevItems[i].deadWritten = false;
        if (!prevItems[i].generation) {
            prevItems[i].generation = 1;
        }
        liveEntries.push(prevItems[i]);
    }
}
async function runGenEvalController(input) {
    const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient({ region: "us-east-1" });
    const lambda = new aws_sdk_1.default.Lambda({
        region: "us-east-1",
        httpOptions: {
            timeout: 600000,
            xhrAsync: true,
        },
    });
    // console.log("~~~ input: ", input);
    // const record = input.Records[0];
    // if (record.eventName !== "INSERT" && record.eventName !== "MODIFY") {
    //     return;
    // }
    // console.log("DynamoDB Record: %j", record.dynamodb);
    // const event = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
    let inputJSON;
    console.log("~~~ input: ", input);
    console.log("~~~ input type: ", typeof input);
    try {
        inputJSON = JSON.parse(input);
    }
    catch (ex) {
        inputJSON = input;
    }
    const event = inputJSON;
    console.log("Unmarshalled Record: %j", event);
    if (!event.genUrl || !event.evalUrl || !event.run) {
        return false;
    }
    if (typeof event.genUrl === "string") {
        return false;
    }
    const population_size = event.population_size;
    const max_designs = event.max_designs;
    const tournament_size = event.tournament_size;
    const survival_size = event.survival_size;
    const expiration = event.expiration;
    const expiration_time = Math.round(Date.now() / 1000) + expiration;
    const paramMap = {};
    for (const genUrl of event.genUrl) {
        console.log(" __ genUrl:", genUrl);
        const genFile = await getGenEvalFile(genUrl);
        if (!genFile) {
            console.log("Error: Unable to Retrieve Gen File!");
            return false;
        }
        // const genFile = genResult[0];
        const splittedString = genFile.split("/** * **/");
        const argStrings = splittedString[0].split("// Parameter:");
        const params = [];
        if (argStrings.length > 1) {
            for (let i = 1; i < argStrings.length - 1; i++) {
                params.push(JSON.parse(argStrings[i]));
            }
            params.push(JSON.parse(argStrings[argStrings.length - 1].split("function")[0].split("async")[0]));
        }
        params.forEach((x) => {
            if (x.min && typeof x.min !== "number") {
                x.min = Number(x.min);
            }
            if (x.max && typeof x.max !== "number") {
                x.max = Number(x.max);
            }
            if (x.step && typeof x.step !== "number") {
                x.step = Number(x.step);
            }
        });
        if (!params) {
            continue;
        }
        paramMap[genUrl] = params;
    }
    let allEntries = [];
    const liveEntries = [];
    const deadEntries = [];
    const updateDynamoPromises = [];
    const existingParams = {};
    await getJobEntries(event.id, allEntries, liveEntries, existingParams);
    let newGeneration = 0;
    liveEntries.forEach((entry) => (newGeneration = Math.max(entry.generation, newGeneration)));
    // run simulation
    let designCount = 0;
    let hasError = false;
    while (designCount < max_designs) {
        if (designCount === 0) {
            designCount = allEntries.length;
        }
        // check if the job should still be running:  _ check JOB_DB for the job, if
        // job.run is not true, stop the run and return
        const runCheckPromise = new Promise((resolve) => {
            docClient.get({
                TableName: process.env.API_MOBIUSEVOGRAPHQL_JOBTABLE_NAME,
                Key: {
                    id: event.id,
                },
            }, (err, record) => {
                if (err) {
                    console.log(err);
                    resolve(null);
                }
                else {
                    console.log("... run check for", event.id, "; items:", record);
                    resolve(record.Item.run);
                }
            });
        }).catch((err) => {
            throw err;
        });
        const runCheck = await runCheckPromise;
        if (!runCheck) {
            await Promise.all(updateDynamoPromises);
            await updateJobDB(event.id, false, "cancelled");
            console.log("run cancelled !!!");
            return false;
        }
        // mutate designs until reaching max number of designs or twice the population
        // size
        const mutationNumber = population_size * 2 - liveEntries.length < max_designs - designCount ? population_size * 2 - liveEntries.length : max_designs - designCount;
        console.log("number of mutations:", mutationNumber);
        for (let i = 0; i < mutationNumber; i++) {
            const newDesign = mutateDesign(liveEntries[i], paramMap, existingParams, allEntries.length, newGeneration);
            console.log("new design:", newDesign);
            allEntries.push(newDesign);
            liveEntries.push(newDesign);
        }
        newGeneration++;
        designCount = allEntries.length;
        // for each of the live entries, run gen then run eval sequentially. each entry
        // is added to a promiselist
        const promiseList = [];
        for (const entry of liveEntries) {
            if (entry.score) {
                continue;
            }
            promiseList.push(new Promise((resolve) => {
                const entryBlob = JSON.stringify(entry);
                // run gen
                lambda.invoke({
                    FunctionName: process.env.FUNCTION_EVOGENERATE_NAME,
                    Payload: entryBlob,
                }, (err, genResponse) => {
                    if (err || !genResponse) {
                        console.log("Gen File error:", entry.params, '\n', err);
                        resolve({
                            success: false,
                            id: entry.id,
                            error: "Gen Error: " + err.message
                        });
                    }
                    const genResult = JSON.parse(genResponse.Payload.toString());
                    if (genResult.__error__) {
                        console.log("Gen File error:", entry.params, '\n', err);
                        resolve({
                            success: false,
                            id: entry.id,
                            error: genResult.__error__
                        });
                    }
                    // run eval
                    lambda.invoke({
                        FunctionName: process.env.FUNCTION_EVOEVALUATE_NAME,
                        Payload: entryBlob,
                    }, (err, evalResponse) => {
                        if (err || !evalResponse) {
                            console.log("Eval Error:", entry.params, '\n', err);
                            resolve({
                                success: false,
                                id: entry.id,
                                error: "Eval Error: " + err.message
                            });
                        }
                        try {
                            const evalResult = JSON.parse(evalResponse.Payload.toString());
                            console.log("eval result:", evalResult);
                            if (evalResult.__error__) {
                                console.log("Eval Error:", entry.params, '\n', evalResult.__error__);
                                resolve({
                                    success: false,
                                    id: entry.id,
                                    error: evalResult.__error__
                                });
                            }
                            // const evalScore = new Number(response.Payload);
                            entry.evalResult = JSON.stringify(evalResult);
                            entry.score = evalResult.score;
                            resolve({
                                success: true,
                                id: entry.id
                            });
                        }
                        catch (ex) {
                            console.log("failed parsing evalResult", entry.params);
                            resolve({
                                success: false,
                                id: entry.id,
                                error: "Eval Error: failed parsing evalResult"
                            });
                        }
                    });
                });
            }).catch((err) => {
                throw err;
            }));
        }
        // wait for all promises to be resolved
        await Promise.all(promiseList).then((results) => {
            console.log('execute results:', results);
            for (const r of results) {
                if (!r.success) {
                    for (let i = 0; i < liveEntries.length; i++) {
                        if (liveEntries[i].id === r.id) {
                            const entry = liveEntries.splice(i, 1)[0];
                            entry.live = false;
                            entry.score = 0;
                            entry.evalResult = `{"Error": "${r.error}"}`;
                            entry.liveWritten = true;
                            entry.deadWritten = true;
                            deadEntries.push(entry);
                            hasError = true;
                            const params = {
                                TableName: process.env.API_MOBIUSEVOGRAPHQL_GENEVALPARAMTABLE_NAME,
                                Item: {
                                    id: entry.id,
                                    JobID: entry.JobID,
                                    GenID: entry.GenID,
                                    generation: entry.generation,
                                    genUrl: entry.genUrl,
                                    evalUrl: entry.evalUrl,
                                    params: JSON.stringify(entry.params),
                                    owner: entry.owner,
                                    live: false,
                                    createdAt: new Date().toISOString(),
                                    updatedAt: new Date().toISOString(),
                                    score: 0,
                                    evalResult: `"${r.error}"`,
                                    errorMessage: r.error
                                },
                            };
                            updateDynamoPromises.push(new Promise(resolve => {
                                docClient.put(params, (err, data) => {
                                    resolve(null);
                                });
                            }));
                            break;
                        }
                    }
                }
            }
        });
        // select the entries based on score
        while (liveEntries.length > population_size) {
            const elimSize = survival_size <= liveEntries.length - population_size ? survival_size : liveEntries.length - population_size;
            tournamentSelect(liveEntries, deadEntries, tournament_size, elimSize);
        }
        // update each live entries
        for (const entry of liveEntries) {
            if (!entry.scoreWritten) {
                entry.scoreWritten = true;
                const updateParamEntry = {
                    TableName: process.env.API_MOBIUSEVOGRAPHQL_GENEVALPARAMTABLE_NAME,
                    Key: {
                        id: entry.id,
                    },
                    UpdateExpression: "set score=:sc, evalResult=:ev, updatedAt=:u",
                    ExpressionAttributeValues: {
                        ":sc": entry.score,
                        ":ev": entry.evalResult,
                        ":u": new Date().toISOString(),
                    },
                    ReturnValues: "UPDATED_NEW",
                };
                const p = new Promise((resolve) => {
                    docClient.update(updateParamEntry, function (err, data) {
                        if (err) {
                            console.log("Error placing data (live entry's score, evalResult):", err);
                            resolve(null);
                        }
                        else {
                            resolve(null);
                        }
                    });
                }).catch((err) => {
                    console.log("live entry writing error:", err);
                    throw err;
                });
                updateDynamoPromises.push(p);
            }
        }
        // update each dead entries
        for (const entry of deadEntries) {
            if (!entry.deadWritten) {
                entry.deadWritten = true;
                const updateParamEntry = {
                    TableName: process.env.API_MOBIUSEVOGRAPHQL_GENEVALPARAMTABLE_NAME,
                    Key: {
                        id: entry.id,
                    },
                    UpdateExpression: "set live = :l, score=:s, evalResult=:e, expirationTime=:x, updatedAt=:u",
                    ExpressionAttributeValues: {
                        ":l": false,
                        ":s": entry.score,
                        ":e": entry.evalResult,
                        ":x": expiration_time,
                        ":u": new Date().toISOString(),
                    },
                    ReturnValues: "UPDATED_NEW",
                };
                const p = new Promise((resolve) => {
                    docClient.update(updateParamEntry, function (err, data) {
                        if (err) {
                            console.log("Error placing data (dead entry's score, evalResult, expirationTime):", err);
                            resolve(null);
                        }
                        else {
                            resolve(null);
                        }
                    });
                }).catch((err) => {
                    console.log("dead entry writing error:", err);
                    throw err;
                });
                updateDynamoPromises.push(p);
            }
        }
        if (liveEntries.length === 0) {
            break;
        }
    }
    await Promise.all(updateDynamoPromises)
        .then(() => console.log("updateDynamoPromises finishes"))
        .catch((err) => console.log(err));
    if (hasError) {
        await updateJobDB(event.id, false, "cancelled");
    }
    else {
        await updateJobDB(event.id, false, "completed");
    }
    console.log("process complete");
    return true;
}
exports.runGenEvalController = runGenEvalController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQ2pDLHNEQUEwQjtBQUMxQiw0REFBK0I7QUFFL0IsbURBQWdEO0FBQ2hELDRCQUE0QjtBQUM1QixpREFBaUQ7QUFHakQsOERBQWdEO0FBQ2hELGtEQUFtRTtBQUduRSx1REFBdUQ7QUFDdkQsa0VBQWtFO0FBQ2xFLGtFQUFrRTtBQUNsRSx3Q0FBd0M7QUFDeEMsa0RBQWtEO0FBRXJDLFFBQUEsY0FBYyxHQUFHOzs7Ozs7O0NBTzdCLENBQUM7QUFDRixnRkFBZ0Y7QUFDaEYsMkVBQTJFO0FBQzNFLGdFQUFnRTtBQUNoRSxnRkFBZ0Y7QUFDaEYsSUFBSTtBQUNTLFFBQUEsZUFBZSxHQUFHOzs7OytCQUlBLHlCQUFlLENBQUMsR0FBRzs7Ozs7OzBCQU14Qix5QkFBZSxDQUFDLEtBQUs7Ozs7Ozs7Ozs7Ozs7OztDQWU5QyxDQUFDO0FBQ0YsTUFBTSxlQUFlLEdBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FtQnZCLENBQUM7QUFHRixTQUFTLGNBQWMsQ0FBQyxLQUFjO0lBQ2xDLElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMscUJBQXFCO0lBQ3ZFLE9BQU8sVUFBVSxDQUFDO0FBQ3RCLENBQUM7QUFDTSxLQUFLLFVBQVUsaUJBQWlCLENBQUMsS0FBc0Q7SUFDMUYsTUFBTSxDQUFDLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtRQUM5QixvQkFBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7YUFDWixJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtZQUNWLElB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