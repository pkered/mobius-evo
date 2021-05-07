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
    const event = input;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2dlbl9ldmFsX3Byb2Nlc3NfYmFja2VuZC9zcmMvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUNqQyxzREFBMEI7QUFDMUIsNERBQStCO0FBRS9CLG1EQUFnRDtBQUNoRCw0QkFBNEI7QUFDNUIsaURBQWlEO0FBR2pELDhEQUFnRDtBQUNoRCxrREFBbUU7QUFHbkUsdURBQXVEO0FBQ3ZELGtFQUFrRTtBQUNsRSxrRUFBa0U7QUFDbEUsd0NBQXdDO0FBQ3hDLGtEQUFrRDtBQUVyQyxRQUFBLGNBQWMsR0FBRzs7Ozs7OztDQU83QixDQUFDO0FBQ0YsZ0ZBQWdGO0FBQ2hGLDJFQUEyRTtBQUMzRSxnRUFBZ0U7QUFDaEUsZ0ZBQWdGO0FBQ2hGLElBQUk7QUFDUyxRQUFBLGVBQWUsR0FBRzs7OzsrQkFJQSx5QkFBZSxDQUFDLEdBQUc7Ozs7OzswQkFNeEIseUJBQWUsQ0FBQyxLQUFLOzs7Ozs7Ozs7Ozs7Ozs7Q0FlOUMsQ0FBQztBQUNGLE1BQU0sZUFBZSxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUJ2QixDQUFDO0FBR0YsU0FBUyxjQUFjLENBQUMsS0FBYztJQUNsQyxJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RDLFVBQVUsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLHFCQUFxQjtJQUN2RSxPQUFPLFVBQVUsQ0FBQztBQUN0QixDQUFDO0FBQ00sS0FBSyxVQUFVLGlCQUFpQixDQUFDLEtBQXNEO0lBQzFGLE1BQU0sQ0FBQyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7UUFDOUIsb0JBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO2FB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