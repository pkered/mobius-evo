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
require("module-alias/register");
const modules_1 = require("./core/modules");
const Modules = __importStar(require("./core/modules"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const xmlhttprequest_1 = require("xmlhttprequest");
const node_fetch_1 = __importDefault(require("node-fetch"));
const jszip_1 = __importDefault(require("jszip"));
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
const JOB_DB = "Job-t3vtntjcprhkbk4lak5sqtfcpm-dev";
const GEN_EVAL_PARAM_DB = "GenEvalParam-t3vtntjcprhkbk4lak5sqtfcpm-dev";
const GEN_EVAL_MODEL_DB = "GenEvalModel";
const GEN_EVAL_MODEL_BUCKET = "mobius-evo-userfiles131353-dev";
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
                Bucket: GEN_EVAL_MODEL_BUCKET,
                Key: "public/" + data.owner + "/" + data.JobID + "/" + data.id + ".gi",
                Body: model,
                ContentType: "text/plain",
                ACL: "public-read",
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
                TableName: GEN_EVAL_PARAM_DB,
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
        Bucket: GEN_EVAL_MODEL_BUCKET,
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
                Bucket: GEN_EVAL_MODEL_BUCKET,
                Key: "public/" + recordInfo.owner + "/" + recordInfo.JobID + "/" + recordInfo.id + "_eval.gi",
                Body: model,
                ContentType: "text/plain",
                ACL: "public-read",
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
            TableName: JOB_DB,
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
        TableName: JOB_DB,
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
            TableName: GEN_EVAL_PARAM_DB,
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
    console.log("~~~ input: ", input);
    const record = input.Records[0];
    if (record.eventName !== "INSERT" && record.eventName !== "MODIFY") {
        return;
    }
    console.log("DynamoDB Record: %j", record.dynamodb);
    const event = aws_sdk_1.default.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
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
                TableName: JOB_DB,
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
                    FunctionName: "generate_design_func",
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
                        FunctionName: "evaluate_design_func",
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
                                TableName: GEN_EVAL_PARAM_DB,
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
                    TableName: GEN_EVAL_PARAM_DB,
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
                    TableName: GEN_EVAL_PARAM_DB,
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
function funcTest(inp) {
    console.log('~~~~~', jszip_1.default);
    console.log('____________1', inp);
}
exports.funcTest = funcTest;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi90cy9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFNakMsNENBQTZEO0FBQzdELHdEQUEwQztBQUcxQyxzREFBMEI7QUFHMUIsbURBQWdEO0FBQ2hELDREQUErQjtBQUMvQixrREFBMEI7QUFJYixRQUFBLGNBQWMsR0FBRzs7Ozs7OztDQU83QixDQUFDO0FBQ0YsZ0ZBQWdGO0FBQ2hGLDJFQUEyRTtBQUMzRSxnRUFBZ0U7QUFDaEUsZ0ZBQWdGO0FBQ2hGLElBQUk7QUFDUyxRQUFBLGVBQWUsR0FBRzs7OzsrQkFJQSx5QkFBZSxDQUFDLEdBQUc7Ozs7OzswQkFNeEIseUJBQWUsQ0FBQyxLQUFLOzs7Ozs7Ozs7Ozs7Ozs7Q0FlOUMsQ0FBQztBQUNGLE1BQU0sZUFBZSxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUJ2QixDQUFDO0FBRUYsTUFBTSxNQUFNLEdBQUcsb0NBQW9DLENBQUM7QUFDcEQsTUFBTSxpQkFBaUIsR0FBRyw2Q0FBNkMsQ0FBQztBQUN4RSxNQUFNLGlCQUFpQixHQUFHLGNBQWMsQ0FBQztBQUN6QyxNQUFNLHFCQUFxQixHQUFHLGdDQUFnQyxDQUFDO0FBRS9ELFNBQVMsY0FBYyxDQUFDLEtBQWM7SUFDbEMsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN0QyxVQUFVLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxxQkFBcUI7SUFDdkUsT0FBTyxVQUFVLENBQUM7QUFDdEIsQ0FBQztBQUNNLEtBQUssVUFBVSxpQkFBaUIsQ0FBQyxLQUFzRDtJQUMxRixNQUFNLENBQUMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1FBQzlCLG9CQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQzthQUNaLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ1YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUU7Z0JBQ1QsT0FBTyxDQUFDLG9EQUFvRCxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDM0UsT0FBTyxFQUFFLENBQUM7YUFDYjtZQUNELE9BQU8sR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3RCLENBQUMsQ0FBQzthQUNELElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUU7WUFDakIsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUMvQyxNQUFNLFVBQVUsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQzVELE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNoQixJQUFJLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN2QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQzVDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUN4QztnQkFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDbkc7WUFDRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDekMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUMxQixJQUFJLEtBQUssQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUMvRCxPQUFPLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUNyQztnQkFDRCxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUM7WUFDckIsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLFlBQVksR0FBRywwQ0FBMEMsR0FBRyxJQUFJLEdBQUcsOENBQThDLENBQUM7WUFDdEgsSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFO2dCQUNiLFlBQVksR0FBRywwQ0FBMEMsR0FBRyxJQUFJLEdBQUcsdUNBQXVDLEdBQUcsS0FBSyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7YUFDcEk7WUFDRCxNQUFNLGFBQWEsR0FBRywwQkFBMEIsQ0FBQztZQUNqRCxNQUFNLEVBQUUsR0FBRyxJQUFJLFFBQVEsQ0FBQyxZQUFZLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxDQUFDO1lBQzFFLE1BQU0sTUFBTSxHQUFHLE1BQU0sRUFBRSxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDNUMsTUFBTSxDQUFDLEtBQUssR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzVDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzFCLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixDQUFDLENBQUMsQ0FBQztJQUNYLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1FBQ2IsTUFBTSxHQUFHLENBQUM7SUFDZCxDQUFDLENBQUMsQ0FBQztJQUNILE9BQU8sTUFBTSxDQUFDLENBQUM7QUFDbkIsQ0FBQztBQTFDRCw4Q0EwQ0M7QUFFTSxLQUFLLFVBQVUscUJBQXFCLENBQUMsS0FBdUM7SUFDL0Usb0JBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO1NBQ1osSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7UUFDVixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRTtZQUNULE9BQU8sRUFBRSxDQUFDO1NBQ2I7UUFDRCxPQUFPLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN0QixDQUFDLENBQUM7U0FDRCxJQUFJLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxFQUFFO1FBQ3JCLE1BQU0sRUFBRSxHQUFHLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDckQsTUFBTSxNQUFNLEdBQUcsTUFBTSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMvQixDQUFDLENBQUMsQ0FBQztBQUNYLENBQUM7QUFiRCxzREFhQztBQUNELEtBQUssVUFBVSxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsS0FBSyxHQUFHLElBQUksRUFBRSxNQUFNLEdBQUcsSUFBSTtJQUM5RCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQy9DLE1BQU0sVUFBVSxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDNUQsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ2hCLElBQUksVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDdkIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzVDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3hDO1FBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ25HO0lBQ0QsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3pDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtRQUMxQixJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUMzQyxPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDM0I7UUFDRCxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUM7SUFDckIsQ0FBQyxDQUFDLENBQUM7SUFDSCxJQUFJLFlBQVksR0FBRywwQ0FBMEMsR0FBRyxJQUFJLEdBQUcsOENBQThDLENBQUM7SUFDdEgsSUFBSSxLQUFLLEVBQUU7UUFDUCxZQUFZLEdBQUcsMENBQTBDLEdBQUcsSUFBSSxHQUFHLDBDQUEwQyxLQUFLLE9BQU8sQ0FBQztLQUM3SDtJQUNELE1BQU0sYUFBYSxHQUFHLDBCQUEwQixDQUFDO0lBQ2pELE1BQU0sRUFBRSxHQUFHLElBQUksUUFBUSxDQUFDLFlBQVksR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLEdBQUcsYUFBYSxDQUFDLENBQUM7SUFDMUUsTUFBTSxNQUFNLEdBQUcsTUFBTSxFQUFFLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUM1QyxPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDO0FBQ00sS0FBSyxVQUFVLFdBQVcsQ0FBQyxLQUE0RDtJQUMxRixNQUFNLFdBQVcsR0FBRyxFQUFFLENBQUM7SUFDdkIsSUFBSSxPQUFPLENBQUM7SUFDWixJQUFJLFFBQVEsQ0FBQztJQUNiLFdBQVcsQ0FBQyxJQUFJLENBQ1osSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtRQUNwQixvQkFBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7YUFDZixJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtZQUNWLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFO2dCQUNULE9BQU8sQ0FBQyxvREFBb0QsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzlFLE9BQU8sRUFBRSxDQUFDO2FBQ2I7WUFDRCxPQUFPLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN0QixDQUFDLENBQUM7YUFDRCxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFO1lBQ2pCLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDZixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEIsQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtRQUNiLE1BQU0sR0FBRyxDQUFDO0lBQ2QsQ0FBQyxDQUFDLENBQ0wsQ0FBQztJQUNGLFdBQVcsQ0FBQyxJQUFJLENBQ1osSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtRQUNwQixvQkFBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7YUFDaEIsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7WUFDVixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRTtnQkFDVCxPQUFPLENBQUMsb0RBQW9ELEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUMvRSxPQUFPLEVBQUUsQ0FBQzthQUNiO1lBQ0QsT0FBTyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdEIsQ0FBQyxDQUFDO2FBQ0QsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRTtZQUNqQixRQUFRLEdBQUcsSUFBSSxDQUFDO1lBQ2hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQixDQUFDLENBQUMsQ0FBQztJQUNYLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1FBQ2IsTUFBTSxHQUFHLENBQUM7SUFDZCxDQUFDLENBQUMsQ0FDTCxDQUFDO0lBQ0YsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQy9CLE1BQU0sU0FBUyxHQUFHLE1BQU0saUJBQWlCLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDMUUsTUFBTSxRQUFRLEdBQUcsY0FBYyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUVqRCxNQUFNLFVBQVUsR0FBRyxNQUFNLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDckUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDL0IsT0FBTyxZQUFZLENBQUM7QUFDeEIsQ0FBQztBQS9DRCxrQ0ErQ0M7QUFFTSxLQUFLLFVBQVUsTUFBTSxDQUFDLElBQUk7SUFDN0IsTUFBTSxTQUFTLEdBQUcsSUFBSSxpQkFBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUMzRSxNQUFNLEVBQUUsR0FBRyxJQUFJLGlCQUFHLENBQUMsRUFBRSxFQUFFLENBQUM7SUFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO1FBQy9CLE9BQU8sRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSx5REFBeUQsRUFBRSxDQUFDO0tBQ3ZHO0lBQ0QsTUFBTSxDQUFDLEdBQUcsSUFBSSxPQUFPLENBQTZDLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUNoRixJQUFJO1lBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sT0FBTyxHQUFHLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNsRCxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNWLE9BQU8sQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLCtDQUErQyxFQUFFLENBQUMsQ0FBQzthQUMvRjtZQUVELE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbEQsTUFBTSxVQUFVLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUM1RCxNQUFNLElBQUksR0FBRyxFQUFFLENBQUM7WUFDaEIsSUFBSSxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDdkIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUM1QyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDeEM7Z0JBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ25HO1lBQ0QsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDMUIsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDckQsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDaEM7Z0JBQ0QsT0FBTyxHQUFHLENBQUMsS0FBSyxDQUFDO1lBQ3JCLENBQUMsQ0FBQyxDQUFDO1lBQ0gsK0VBQStFO1lBQy9FLDJFQUEyRTtZQUMzRSwrQ0FBK0M7WUFDL0MsaUVBQWlFO1lBRWpFLE1BQU0sWUFBWSxHQUFHLDBDQUEwQyxHQUFHLElBQUksR0FBRyw4Q0FBOEMsQ0FBQztZQUN4SCxNQUFNLGFBQWEsR0FBRywwQkFBMEIsQ0FBQztZQUNqRCxNQUFNLEVBQUUsR0FBRyxJQUFJLFFBQVEsQ0FBQyxZQUFZLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxDQUFDO1lBQzFFLE1BQU0sTUFBTSxHQUFHLE1BQU0sRUFBRSxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDNUMsTUFBTSxLQUFLLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRTlELElBQUksWUFBWSxHQUFHLEtBQUssQ0FBQztZQUN6QixJQUFJLFlBQVksR0FBRyxLQUFLLENBQUM7WUFFekIsRUFBRSxDQUFDLFNBQVMsQ0FDUjtnQkFDSSxNQUFNLEVBQUUscUJBQXFCO2dCQUM3QixHQUFHLEVBQUUsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsS0FBSztnQkFDdEUsSUFBSSxFQUFFLEtBQUs7Z0JBQ1gsV0FBVyxFQUFFLFlBQVk7Z0JBQ3pCLEdBQUcsRUFBRSxhQUFhO2FBQ3JCLEVBQ0QsVUFBVSxHQUFHLEVBQUUsTUFBTTtnQkFDakIsSUFBSSxHQUFHLEVBQUU7b0JBQ0wsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDN0MsT0FBTyxDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsK0NBQStDLEVBQUUsQ0FBQyxDQUFDO2lCQUMvRjtxQkFBTTtvQkFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLENBQUM7b0JBQ3pDLFlBQVksR0FBRyxJQUFJLENBQUM7b0JBQ3BCLElBQUksWUFBWSxFQUFFO3dCQUNkLE9BQU8sQ0FBQyxFQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO3FCQUNoQztpQkFDSjtZQUNMLENBQUMsQ0FDSixDQUFDO1lBQ0YsTUFBTSxNQUFNLEdBQUc7Z0JBQ1gsU0FBUyxFQUFFLGlCQUFpQjtnQkFDNUIsSUFBSSxFQUFFO29CQUNGLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRTtvQkFDWCxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7b0JBQ2pCLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztvQkFDakIsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO29CQUMzQixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07b0JBQ25CLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztvQkFDckIsTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztvQkFDbkMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO29CQUNqQixJQUFJLEVBQUUsSUFBSTtvQkFDVixTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUU7b0JBQ25DLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtvQkFDbkMsWUFBWSxFQUFFLElBQUk7aUJBQ3JCO2FBQ0osQ0FBQztZQUNGLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFVBQVUsR0FBRyxFQUFFLE1BQU07Z0JBQ3ZDLElBQUksR0FBRyxFQUFFO29CQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBQzVDLE9BQU8sQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLG9EQUFvRCxFQUFFLENBQUMsQ0FBQztpQkFDcEc7cUJBQU07b0JBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO29CQUN4QyxZQUFZLEdBQUcsSUFBSSxDQUFDO29CQUNwQixJQUFJLFlBQVksRUFBRTt3QkFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7d0JBQzlDLE9BQU8sQ0FBQyxFQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO3FCQUNoQztpQkFDSjtZQUNMLENBQUMsQ0FBQyxDQUFDO1NBQ047UUFBQyxPQUFPLEVBQUUsRUFBRTtZQUNULE9BQU8sQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLGFBQWEsR0FBRyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztTQUMxRTtJQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxNQUFNLENBQUMsQ0FBQztBQUNuQixDQUFDO0FBcEdELHdCQW9HQztBQUVNLEtBQUssVUFBVSxPQUFPLENBQUMsVUFBVTtJQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLGlCQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQzNFLE1BQU0sRUFBRSxHQUFHLElBQUksaUJBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQztJQUN4QixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDeEMsTUFBTSxNQUFNLEdBQUc7UUFDWCxNQUFNLEVBQUUscUJBQXFCO1FBQzdCLDBDQUEwQztRQUMxQyxHQUFHLEVBQUUsU0FBUyxHQUFHLFVBQVUsQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLFVBQVUsQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLFVBQVUsQ0FBQyxFQUFFLEdBQUcsS0FBSztLQUMzRixDQUFDO0lBQ0YsTUFBTSxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQy9DLElBQUksQ0FBQyxDQUFDLEVBQUU7UUFDSixPQUFPLEVBQUUsU0FBUyxFQUFFLDJDQUEyQyxFQUFFLENBQUM7S0FDckU7SUFDRCxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN0QyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7UUFDeEIsT0FBTyxFQUFFLFNBQVMsRUFBRSwyQ0FBMkMsRUFBRSxDQUFDO0tBQ3JFO0lBQ0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUU7UUFDckIsT0FBTyxFQUFFLFNBQVMsRUFBRSx3Q0FBd0MsRUFBRSxDQUFDO0tBQ2xFO0lBQ0QsTUFBTSxDQUFDLEdBQUcsSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO1FBQ3BDLElBQUk7WUFDQSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDNUMsTUFBTSxRQUFRLEdBQUcsTUFBTSxjQUFjLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzFELElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ1gsT0FBTyxDQUFDLEVBQUUsU0FBUyxFQUFFLHNEQUFzRCxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2FBQ3ZHO1lBQ0QsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNuRCxNQUFNLFVBQVUsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQzVELE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNoQixJQUFJLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN2QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQzVDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUN4QztnQkFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDbkc7WUFDRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDekMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRTFDLE1BQU0sWUFBWSxHQUFHLDBDQUEwQyxHQUFHLElBQUksR0FBRyx3Q0FBd0MsR0FBRyxJQUFJLEdBQUcsTUFBTSxDQUFDO1lBQ2xJLE1BQU0sYUFBYSxHQUFHLDBCQUEwQixDQUFDO1lBQ2pELE1BQU0sRUFBRSxHQUFHLElBQUksUUFBUSxDQUFDLFlBQVksR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLEdBQUcsYUFBYSxDQUFDLENBQUM7WUFDMUUsTUFBTSxNQUFNLEdBQUcsTUFBTSxFQUFFLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztZQUM1QyxNQUFNLEtBQUssR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDOUQsRUFBRSxDQUFDLFNBQVMsQ0FDUjtnQkFDSSxNQUFNLEVBQUUscUJBQXFCO2dCQUM3QixHQUFHLEVBQUUsU0FBUyxHQUFHLFVBQVUsQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLFVBQVUsQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLFVBQVUsQ0FBQyxFQUFFLEdBQUcsVUFBVTtnQkFDN0YsSUFBSSxFQUFFLEtBQUs7Z0JBQ1gsV0FBVyxFQUFFLFlBQVk7Z0JBQ3pCLEdBQUcsRUFBRSxhQUFhO2FBQ3JCLEVBQ0QsVUFBVSxHQUFHLEVBQUUsSUFBSTtnQkFDZixJQUFJLEdBQUcsRUFBRTtvQkFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUM5QyxPQUFPLENBQUMsRUFBRSxTQUFTLEVBQUUsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7aUJBQ3ZDO3FCQUFNO29CQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztvQkFDOUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDMUI7WUFDTCxDQUFDLENBQ0osQ0FBQztTQUNMO1FBQUMsT0FBTyxFQUFFLEVBQUU7WUFDVCxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ2xDLE9BQU8sQ0FBQyxFQUFFLFNBQVMsRUFBRSxjQUFjLEdBQUcsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7U0FDdkQ7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUNILE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDO0lBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3BDLE9BQU8sTUFBTSxDQUFDO0FBRWxCLENBQUM7QUF2RUQsMEJBdUVDO0FBRUQsU0FBUyxZQUFZLENBQUMsZUFBZSxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLGFBQWE7SUFDcEYseUVBQXlFO0lBQ3pFLFdBQVc7SUFDWCxNQUFNLFVBQVUsR0FBRztRQUNmLEVBQUUsRUFBRSxlQUFlLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxRQUFRO1FBQzFDLEtBQUssRUFBRSxlQUFlLENBQUMsS0FBSztRQUM1QixLQUFLLEVBQUUsUUFBUTtRQUNmLFVBQVUsRUFBRSxhQUFhO1FBQ3pCLE1BQU0sRUFBRSxlQUFlLENBQUMsTUFBTTtRQUM5QixPQUFPLEVBQUUsZUFBZSxDQUFDLE9BQU87UUFDaEMsS0FBSyxFQUFFLGVBQWUsQ0FBQyxLQUFLO1FBQzVCLE1BQU0sRUFBRSxJQUFJO1FBQ1osS0FBSyxFQUFFLElBQUk7UUFDWCxJQUFJLEVBQUUsSUFBSTtRQUNWLFlBQVksRUFBRSxLQUFLO1FBQ25CLFdBQVcsRUFBRSxLQUFLO1FBQ2xCLFdBQVcsRUFBRSxLQUFLO0tBQ3JCLENBQUM7SUFDRixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7SUFDbEIsT0FBTyxJQUFJLEVBQUU7UUFDVCxNQUFNLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDckIsS0FBSyxNQUFNLEtBQUssSUFBSSxRQUFRLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQzdDLElBQUksS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDOUIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMxRCxNQUFNLGFBQWEsR0FBRyxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO2dCQUNwRixJQUFJLGVBQWUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxHQUFHLEVBQUU7b0JBQ2xELE9BQU8sR0FBRyxDQUFDLENBQUM7aUJBQ2Y7cUJBQU0sSUFBSSxlQUFlLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLENBQUMsR0FBRyxFQUFFO29CQUN6RCxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUM7aUJBQ2hCO2dCQUNELElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUM1QyxJQUFJLE9BQU8sR0FBRyxDQUFDLEVBQUU7b0JBQ2IsU0FBUyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQzVHO3FCQUFNO29CQUNILFNBQVMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDM0c7Z0JBQ0QsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7YUFDaEY7aUJBQU07Z0JBQ0gsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUM5RDtTQUNKO1FBQ0QsVUFBVSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7UUFDOUIsSUFBSSxjQUFjLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ25DLElBQUksY0FBYyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQzdELE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsU0FBUyxDQUFDLENBQUE7Z0JBQzFDLElBQUksU0FBUyxHQUFHLEVBQUUsRUFBRTtvQkFDaEIsY0FBYyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQ2xELE1BQU07aUJBQ1Q7Z0JBQ0QsU0FBUyxJQUFJLENBQUMsQ0FBQzthQUNsQjtpQkFBTTtnQkFDSCxjQUFjLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDbEQsTUFBTTthQUNUO1NBQ0o7YUFBTTtZQUNILGNBQWMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFBO1lBQ3RDLGNBQWMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2xELE1BQU07U0FDVDtRQUNELE1BQU07S0FDVDtJQUNELE9BQU8sVUFBVSxDQUFDO0FBQ3RCLENBQUM7QUFFRCxTQUFTLG9CQUFvQixDQUFDLFNBQVMsRUFBRSxTQUFTO0lBQzlDLEtBQUssTUFBTSxhQUFhLElBQUksU0FBUyxFQUFFO1FBQ25DLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxhQUFhLENBQUMsTUFBTSxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssYUFBYSxDQUFDLE1BQU0sRUFBRTtZQUN4RixPQUFPLElBQUksQ0FBQztTQUNmO0tBQ0o7SUFDRCxPQUFPLEtBQUssQ0FBQztBQUNqQixDQUFDO0FBRUQsMEVBQTBFO0FBRTFFLFNBQVMsZ0JBQWdCLENBQUMsY0FBcUIsRUFBRSxjQUFxQixFQUFFLGVBQXVCLEVBQUUsYUFBcUI7SUFDbEgseURBQXlEO0lBQ3pELElBQUksZUFBZSxHQUFHLEVBQUUsQ0FBQztJQUN6QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsZUFBZSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3RDLElBQUksY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDN0IsTUFBTTtTQUNUO1FBQ0QsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3RFLGVBQWUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNsRTtJQUNELDhFQUE4RTtJQUM5RSxRQUFRO0lBQ1IsZUFBZSxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwRSxxRUFBcUU7SUFDckUsMERBQTBEO0lBQzFELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxlQUFlLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQzdDLElBQUksQ0FBQyxHQUFHLGFBQWEsRUFBRTtZQUNuQixlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztZQUNoQyxjQUFjLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzNDO2FBQU07WUFDSCxjQUFjLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzNDO0tBQ0o7QUFDTCxDQUFDO0FBRUQsS0FBSyxVQUFVLGNBQWMsQ0FBQyxPQUFPO0lBQ2pDLE1BQU0sRUFBRSxHQUFHLElBQUksaUJBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQztJQUN4QixNQUFNLFdBQVcsR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1FBQ3hDLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUN4QyxNQUFNLFFBQVEsR0FBRyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUN6RSxNQUFNLElBQUksR0FBRztnQkFDVCxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDO2dCQUMzQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQzthQUNuQixDQUFDO1lBQ0YsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsVUFBVSxHQUFHLEVBQUUsSUFBSTtnQkFDbEMsSUFBSSxHQUFHLEVBQUU7b0JBQ0wsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUM1QixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ2pCO3FCQUFNO29CQUNILE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2lCQUN4QztZQUNMLENBQUMsQ0FBQyxDQUFDO1NBQ047YUFBTTtZQUNILE1BQU0sT0FBTyxHQUFHLElBQUksK0JBQWMsRUFBRSxDQUFDO1lBQ3JDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzdCLE9BQU8sQ0FBQyxNQUFNLEdBQUcsS0FBSyxJQUFJLEVBQUU7Z0JBQ3hCLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUU7b0JBQ3hCLE9BQU8sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7aUJBQ2pDO3FCQUFNO29CQUNILE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDakI7WUFDTCxDQUFDLENBQUM7WUFDRixPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDbEI7SUFDTCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtRQUNiLE1BQU0sR0FBRyxDQUFDO0lBQ2QsQ0FBQyxDQUFDLENBQUM7SUFDSCxPQUFPLFdBQVcsQ0FBQztBQUN2QixDQUFDO0FBRUQsS0FBSyxVQUFVLFdBQVcsQ0FBQyxLQUFhLEVBQUUsR0FBWSxFQUFFLE1BQWM7SUFDbEUsTUFBTSxTQUFTLEdBQUcsSUFBSSxpQkFBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUMzRSxNQUFNLGtCQUFrQixHQUFHLElBQUksT0FBTyxDQUFVLENBQUMsT0FBTyxFQUFFLEVBQUU7UUFDeEQsU0FBUyxDQUFDLE1BQU0sQ0FDWjtZQUNJLFNBQVMsRUFBRSxNQUFNO1lBQ2pCLEdBQUcsRUFBRTtnQkFDRCxFQUFFLEVBQUUsS0FBSzthQUNaO1lBQ0QsZ0JBQWdCLEVBQUUsb0RBQW9EO1lBQ3RFLHlCQUF5QixFQUFFO2dCQUN2QixJQUFJLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUU7Z0JBQzlCLElBQUksRUFBRSxHQUFHO2dCQUNULElBQUksRUFBRSxNQUFNO2dCQUNaLElBQUksRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTthQUNqQztZQUNELFlBQVksRUFBRSxhQUFhO1NBQzlCLEVBQ0QsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDWixJQUFJLEdBQUcsRUFBRTtnQkFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUMxQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDbEI7aUJBQU07Z0JBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO2dCQUM1QyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDakI7UUFDTCxDQUFDLENBQ0osQ0FBQztJQUNOLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1FBQ2IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN4QyxNQUFNLEdBQUcsQ0FBQztJQUNkLENBQUMsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxrQkFBa0IsQ0FBQztBQUM3QixDQUFDO0FBRUQsU0FBUyxjQUFjLENBQUMsS0FBYSxFQUFFLFNBQXNDLEVBQUUsR0FBVztJQUN0RixTQUFTLENBQUMsTUFBTSxDQUNaO1FBQ0ksU0FBUyxFQUFFLE1BQU07UUFDakIsR0FBRyxFQUFFO1lBQ0QsRUFBRSxFQUFFLEtBQUs7U0FDWjtRQUNELGdCQUFnQixFQUFFLDZEQUE2RDtRQUMvRSx5QkFBeUIsRUFBRTtZQUN2QixJQUFJLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUU7WUFDOUIsSUFBSSxFQUFFLFlBQVk7WUFDbEIsSUFBSSxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFO1lBQzlCLElBQUksRUFBRSxHQUFHO1NBQ1o7UUFDRCxZQUFZLEVBQUUsYUFBYTtLQUM5QixFQUNELENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ1osSUFBSSxHQUFHLEVBQUU7WUFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQzdDO2FBQU07WUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLENBQUM7U0FDL0M7SUFDTCxDQUFDLENBQ0osQ0FBQztJQUNGLHdCQUF3QjtBQUM1QixDQUFDO0FBRUQsS0FBSyxVQUFVLGFBQWEsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxjQUFjO0lBQ3ZFLE1BQU0sU0FBUyxHQUFHLElBQUksaUJBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDM0UsTUFBTSxDQUFDLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtRQUM5QixTQUFTLENBQUMsS0FBSyxDQUNYO1lBQ0ksU0FBUyxFQUFFLGlCQUFpQjtZQUM1QixTQUFTLEVBQUUsU0FBUztZQUNwQixzQkFBc0IsRUFBRSxlQUFlO1lBQ3ZDLHlCQUF5QixFQUFFO2dCQUN2QixNQUFNLEVBQUUsS0FBSzthQUNoQjtTQUNKLEVBQ0QsVUFBVSxHQUFHLEVBQUUsUUFBUTtZQUNuQixJQUFJLEdBQUcsRUFBRTtnQkFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLCtCQUErQixFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUNsRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDakI7aUJBQU07Z0JBQ0gsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUMzQjtRQUNMLENBQUMsQ0FDSixDQUFDO0lBQ04sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7UUFDYixNQUFNLEdBQUcsQ0FBQztJQUNkLENBQUMsQ0FBQyxDQUFDO0lBQ0gsSUFBSSxTQUFTLEdBQVEsTUFBTSxDQUFDLENBQUM7SUFDN0IsSUFBSSxDQUFDLFNBQVMsRUFBRTtRQUNaLE9BQU87S0FDVjtJQUNELFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFTLEVBQUUsRUFBRTtRQUM1QixJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sS0FBSyxRQUFRLEVBQUU7WUFDakMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUN6QztRQUNELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDOUIsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUE7U0FDbkM7UUFDRCxjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEQsQ0FBQyxDQUFDLENBQUM7SUFDSCxTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQztJQUNoRSxTQUFTLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQU0sRUFBRSxDQUFNLEVBQUUsRUFBRTtRQUMxQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRTtZQUNuQixPQUFPLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztTQUMxQjtRQUNELE9BQU8sQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQzdCLENBQUMsQ0FBQyxDQUFDO0lBQ0gsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDdkMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7UUFDbEMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFDakMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFDakMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUU7WUFDMUIsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7U0FDL0I7UUFDRCxXQUFXLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2xDO0FBQ0wsQ0FBQztBQUVNLEtBQUssVUFBVSxvQkFBb0IsQ0FBQyxLQUFLO0lBQzVDLE1BQU0sU0FBUyxHQUFHLElBQUksaUJBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDM0UsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBRyxDQUFDLE1BQU0sQ0FBQztRQUMxQixNQUFNLEVBQUUsV0FBVztRQUNuQixXQUFXLEVBQUU7WUFDVCxPQUFPLEVBQUUsTUFBTTtZQUNmLFFBQVEsRUFBRSxJQUFJO1NBQ2pCO0tBQ0osQ0FBQyxDQUFDO0lBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDbEMsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoQyxJQUFJLE1BQU0sQ0FBQyxTQUFTLEtBQUssUUFBUSxJQUFJLE1BQU0sQ0FBQyxTQUFTLEtBQUssUUFBUSxFQUFFO1FBQ2hFLE9BQU87S0FDVjtJQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3BELE1BQU0sS0FBSyxHQUFHLGlCQUFHLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMxRSxPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzlDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUU7UUFDL0MsT0FBTyxLQUFLLENBQUM7S0FDaEI7SUFDRCxJQUFJLE9BQU8sS0FBSyxDQUFDLE1BQU0sS0FBSyxRQUFRLEVBQUU7UUFDbEMsT0FBTyxLQUFLLENBQUM7S0FDaEI7SUFDRCxNQUFNLGVBQWUsR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDO0lBQzlDLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7SUFDdEMsTUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQztJQUM5QyxNQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDO0lBQzFDLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUM7SUFDcEMsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsVUFBVSxDQUFDO0lBRW5FLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztJQUNwQixLQUFLLE1BQU0sTUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQUU7UUFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDbkMsTUFBTSxPQUFPLEdBQUcsTUFBTSxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMscUNBQXFDLENBQUMsQ0FBQztZQUNuRCxPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUNELGdDQUFnQztRQUNoQyxNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2xELE1BQU0sVUFBVSxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDNUQsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLElBQUksVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDdkIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUM1QyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMxQztZQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNyRztRQUNELE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUNqQixJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsR0FBRyxLQUFLLFFBQVEsRUFBRTtnQkFDcEMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ3pCO1lBQ0QsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEdBQUcsS0FBSyxRQUFRLEVBQUU7Z0JBQ3BDLENBQUMsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUN6QjtZQUNELElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO2dCQUN0QyxDQUFDLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDM0I7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDVCxTQUFTO1NBQ1o7UUFDRCxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDO0tBQzdCO0lBQ0QsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO0lBQ3BCLE1BQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQztJQUN2QixNQUFNLFdBQVcsR0FBRyxFQUFFLENBQUM7SUFDdkIsTUFBTSxvQkFBb0IsR0FBRyxFQUFFLENBQUM7SUFDaEMsTUFBTSxjQUFjLEdBQUcsRUFBRSxDQUFDO0lBRTFCLE1BQU0sYUFBYSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUN2RSxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUM7SUFDdEIsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM1RixpQkFBaUI7SUFDakIsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDO0lBQ3BCLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztJQUNyQixPQUFPLFdBQVcsR0FBRyxXQUFXLEVBQUU7UUFDOUIsSUFBSSxXQUFXLEtBQUssQ0FBQyxFQUFFO1lBQ25CLFdBQVcsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO1NBQ25DO1FBQ0QsNEVBQTRFO1FBQzVFLCtDQUErQztRQUMvQyxNQUFNLGVBQWUsR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQzVDLFNBQVMsQ0FBQyxHQUFHLENBQ1Q7Z0JBQ0ksU0FBUyxFQUFFLE1BQU07Z0JBQ2pCLEdBQUcsRUFBRTtvQkFDRCxFQUFFLEVBQUUsS0FBSyxDQUFDLEVBQUU7aUJBQ2Y7YUFDSixFQUNELENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUNaLElBQUksR0FBRyxFQUFFO29CQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ2pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDakI7cUJBQU07b0JBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztvQkFDL0QsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQzVCO1lBQ0wsQ0FBQyxDQUNKLENBQUM7UUFDTixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtZQUNiLE1BQU0sR0FBRyxDQUFDO1FBQ2QsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLFFBQVEsR0FBRyxNQUFNLGVBQWUsQ0FBQztRQUN2QyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ1gsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDeEMsTUFBTSxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDaEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBQ2pDLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBRUQsOEVBQThFO1FBQzlFLE9BQU87UUFDUCxNQUFNLGNBQWMsR0FDaEIsZUFBZSxHQUFHLENBQUMsR0FBRyxXQUFXLENBQUMsTUFBTSxHQUFHLFdBQVcsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLGVBQWUsR0FBRyxDQUFDLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUNoSixPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ3BELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxjQUFjLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDckMsTUFBTSxTQUFTLEdBQUcsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLFVBQVUsQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDM0csT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDdEMsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMzQixXQUFXLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQy9CO1FBQ0QsYUFBYSxFQUFFLENBQUM7UUFDaEIsV0FBVyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7UUFFaEMsK0VBQStFO1FBQy9FLDRCQUE0QjtRQUM1QixNQUFNLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFDdkIsS0FBSyxNQUFNLEtBQUssSUFBSSxXQUFXLEVBQUU7WUFDN0IsSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFO2dCQUNiLFNBQVM7YUFDWjtZQUNELFdBQVcsQ0FBQyxJQUFJLENBQ1osSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDcEIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDeEMsVUFBVTtnQkFDVixNQUFNLENBQUMsTUFBTSxDQUNUO29CQUNJLFlBQVksRUFBRSxzQkFBc0I7b0JBQ3BDLE9BQU8sRUFBRSxTQUFTO2lCQUNyQixFQUNELENBQUMsR0FBRyxFQUFFLFdBQVcsRUFBRSxFQUFFO29CQUNqQixJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRTt3QkFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQzt3QkFDeEQsT0FBTyxDQUFDOzRCQUNKLE9BQU8sRUFBRSxLQUFLOzRCQUNkLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRTs0QkFDWixLQUFLLEVBQUUsYUFBYSxHQUFHLEdBQUcsQ0FBQyxPQUFPO3lCQUNyQyxDQUFDLENBQUM7cUJBQ047b0JBQ0QsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7b0JBQzdELElBQUksU0FBUyxDQUFDLFNBQVMsRUFBRTt3QkFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQzt3QkFDeEQsT0FBTyxDQUFDOzRCQUNKLE9BQU8sRUFBRSxLQUFLOzRCQUNkLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRTs0QkFDWixLQUFLLEVBQUUsU0FBUyxDQUFDLFNBQVM7eUJBQzdCLENBQUMsQ0FBQztxQkFDTjtvQkFDRCxXQUFXO29CQUNYLE1BQU0sQ0FBQyxNQUFNLENBQ1Q7d0JBQ0ksWUFBWSxFQUFFLHNCQUFzQjt3QkFDcEMsT0FBTyxFQUFFLFNBQVM7cUJBQ3JCLEVBQ0QsQ0FBQyxHQUFHLEVBQUUsWUFBWSxFQUFFLEVBQUU7d0JBQ2xCLElBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFOzRCQUN0QixPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQzs0QkFDcEQsT0FBTyxDQUFDO2dDQUNKLE9BQU8sRUFBRSxLQUFLO2dDQUNkLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRTtnQ0FDWixLQUFLLEVBQUUsY0FBYyxHQUFHLEdBQUcsQ0FBQyxPQUFPOzZCQUN0QyxDQUFDLENBQUM7eUJBQ047d0JBQ0QsSUFBSTs0QkFDQSxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQzs0QkFDL0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsVUFBVSxDQUFDLENBQUM7NEJBQ3hDLElBQUksVUFBVSxDQUFDLFNBQVMsRUFBRTtnQ0FDdEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dDQUNyRSxPQUFPLENBQUM7b0NBQ0osT0FBTyxFQUFFLEtBQUs7b0NBQ2QsRUFBRSxFQUFFLEtBQUssQ0FBQyxFQUFFO29DQUNaLEtBQUssRUFBRSxVQUFVLENBQUMsU0FBUztpQ0FDOUIsQ0FBQyxDQUFDOzZCQUNOOzRCQUNELGtEQUFrRDs0QkFDbEQsS0FBSyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDOzRCQUM5QyxLQUFLLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUM7NEJBQy9CLE9BQU8sQ0FBQztnQ0FDSixPQUFPLEVBQUUsSUFBSTtnQ0FDYixFQUFFLEVBQUUsS0FBSyxDQUFDLEVBQUU7NkJBQ2YsQ0FBQyxDQUFDO3lCQUNOO3dCQUFDLE9BQU8sRUFBRSxFQUFFOzRCQUNULE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDOzRCQUN2RCxPQUFPLENBQUM7Z0NBQ0osT0FBTyxFQUFFLEtBQUs7Z0NBQ2QsRUFBRSxFQUFFLEtBQUssQ0FBQyxFQUFFO2dDQUNaLEtBQUssRUFBRSx1Q0FBdUM7NkJBQ2pELENBQUMsQ0FBQzt5QkFDTjtvQkFFTCxDQUFDLENBQ0osQ0FBQztnQkFDTixDQUFDLENBQ0osQ0FBQztZQUNOLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNiLE1BQU0sR0FBRyxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQ0wsQ0FBQztTQUNMO1FBRUQsdUNBQXVDO1FBQ3ZDLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUM1QyxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxDQUFBO1lBQ3hDLEtBQUssTUFBTSxDQUFDLElBQUksT0FBTyxFQUFFO2dCQUNyQixJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRTtvQkFDWixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTt3QkFDekMsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUU7NEJBQzVCLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUMxQyxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQzs0QkFDbkIsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7NEJBQ2hCLEtBQUssQ0FBQyxVQUFVLEdBQUcsY0FBYyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUM7NEJBQzdDLEtBQUssQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDOzRCQUN6QixLQUFLLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQzs0QkFDekIsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzs0QkFDeEIsUUFBUSxHQUFHLElBQUksQ0FBQzs0QkFDaEIsTUFBTSxNQUFNLEdBQUc7Z0NBQ1gsU0FBUyxFQUFFLGlCQUFpQjtnQ0FDNUIsSUFBSSxFQUFFO29DQUNGLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRTtvQ0FDWixLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUs7b0NBQ2xCLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSztvQ0FDbEIsVUFBVSxFQUFFLEtBQUssQ0FBQyxVQUFVO29DQUM1QixNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU07b0NBQ3BCLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTztvQ0FDdEIsTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztvQ0FDcEMsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLO29DQUNsQixJQUFJLEVBQUUsS0FBSztvQ0FDWCxTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUU7b0NBQ25DLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtvQ0FDbkMsS0FBSyxFQUFFLENBQUM7b0NBQ1IsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDLEtBQUssR0FBRztvQ0FDMUIsWUFBWSxFQUFFLENBQUMsQ0FBQyxLQUFLO2lDQUN4Qjs2QkFDSixDQUFDOzRCQUNGLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtnQ0FDNUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUU7b0NBQ2hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQ0FDbEIsQ0FBQyxDQUFDLENBQUE7NEJBQ04sQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDSixNQUFNO3lCQUNUO3FCQUNKO2lCQUNKO2FBQ0o7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILG9DQUFvQztRQUNwQyxPQUFPLFdBQVcsQ0FBQyxNQUFNLEdBQUcsZUFBZSxFQUFFO1lBQ3pDLE1BQU0sUUFBUSxHQUFHLGFBQWEsSUFBSSxXQUFXLENBQUMsTUFBTSxHQUFHLGVBQWUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLGVBQWUsQ0FBQztZQUM5SCxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsV0FBVyxFQUFFLGVBQWUsRUFBRSxRQUFRLENBQUMsQ0FBQztTQUN6RTtRQUVELDJCQUEyQjtRQUMzQixLQUFLLE1BQU0sS0FBSyxJQUFJLFdBQVcsRUFBRTtZQUM3QixJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRTtnQkFDckIsS0FBSyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7Z0JBQzFCLE1BQU0sZ0JBQWdCLEdBQUc7b0JBQ3JCLFNBQVMsRUFBRSxpQkFBaUI7b0JBQzVCLEdBQUcsRUFBRTt3QkFDRCxFQUFFLEVBQUUsS0FBSyxDQUFDLEVBQUU7cUJBQ2Y7b0JBQ0QsZ0JBQWdCLEVBQUUsNkNBQTZDO29CQUMvRCx5QkFBeUIsRUFBRTt3QkFDdkIsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLO3dCQUNsQixLQUFLLEVBQUUsS0FBSyxDQUFDLFVBQVU7d0JBQ3ZCLElBQUksRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtxQkFDakM7b0JBQ0QsWUFBWSxFQUFFLGFBQWE7aUJBQzlCLENBQUM7Z0JBQ0YsTUFBTSxDQUFDLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtvQkFDOUIsU0FBUyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLEdBQUcsRUFBRSxJQUFJO3dCQUNsRCxJQUFJLEdBQUcsRUFBRTs0QkFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLHNEQUFzRCxFQUFFLEdBQUcsQ0FBQyxDQUFDOzRCQUN6RSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7eUJBQ2pCOzZCQUFNOzRCQUNILE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzt5QkFDakI7b0JBQ0wsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7b0JBQ2IsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDOUMsTUFBTSxHQUFHLENBQUM7Z0JBQ2QsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2hDO1NBQ0o7UUFFRCwyQkFBMkI7UUFDM0IsS0FBSyxNQUFNLEtBQUssSUFBSSxXQUFXLEVBQUU7WUFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUU7Z0JBQ3BCLEtBQUssQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO2dCQUN6QixNQUFNLGdCQUFnQixHQUFHO29CQUNyQixTQUFTLEVBQUUsaUJBQWlCO29CQUM1QixHQUFHLEVBQUU7d0JBQ0QsRUFBRSxFQUFFLEtBQUssQ0FBQyxFQUFFO3FCQUNmO29CQUNELGdCQUFnQixFQUFFLHlFQUF5RTtvQkFDM0YseUJBQXlCLEVBQUU7d0JBQ3ZCLElBQUksRUFBRSxLQUFLO3dCQUNYLElBQUksRUFBRSxLQUFLLENBQUMsS0FBSzt3QkFDakIsSUFBSSxFQUFFLEtBQUssQ0FBQyxVQUFVO3dCQUN0QixJQUFJLEVBQUUsZUFBZTt3QkFDckIsSUFBSSxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFO3FCQUNqQztvQkFDRCxZQUFZLEVBQUUsYUFBYTtpQkFDOUIsQ0FBQztnQkFDRixNQUFNLENBQUMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO29CQUM5QixTQUFTLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLFVBQVUsR0FBRyxFQUFFLElBQUk7d0JBQ2xELElBQUksR0FBRyxFQUFFOzRCQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0VBQXNFLEVBQUUsR0FBRyxDQUFDLENBQUM7NEJBQ3pGLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzt5QkFDakI7NkJBQU07NEJBQ0gsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO3lCQUNqQjtvQkFDTCxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtvQkFDYixPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUM5QyxNQUFNLEdBQUcsQ0FBQztnQkFDZCxDQUFDLENBQUMsQ0FBQztnQkFDSCxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDaEM7U0FDSjtRQUNELElBQUksV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDMUIsTUFBTTtTQUNUO0tBQ0o7SUFDRCxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUM7U0FDbEMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsK0JBQStCLENBQUMsQ0FBQztTQUN4RCxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUN0QyxJQUFJLFFBQVEsRUFBRTtRQUNWLE1BQU0sV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0tBQ25EO1NBQU07UUFDSCxNQUFNLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQztLQUNuRDtJQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUNoQyxPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDO0FBMVZELG9EQTBWQztBQUVELFNBQWdCLFFBQVEsQ0FBRSxHQUFHO0lBQ3pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLGVBQUssQ0FBQyxDQUFDO0lBQzVCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDLENBQUM7QUFIRCw0QkFHQyJ9