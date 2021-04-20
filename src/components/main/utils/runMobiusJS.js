// import { downloadS3, downloadGIFile } from "../../../amplify-apis/userFiles";

// export async function RunEvalFile(evalUrl, genModelUrl) {
//     const evalKey = evalUrl.split('/').pop();
//     let data, evalFile;
//     const promises = [];
//     promises.push(downloadGIFile(`files/${evalKey}`, (result) => {data = result;}, () => {console.log('error')}));
//     promises.push(downloadS3(`files/${evalKey}`, (result) => {evalFile = result;}, () => {console.log('error')}));
//     const p = new Promise(async (resolve) => {
//         console.log("evalUrl:", evalUrl);
//         if (!evalFile) {
//             return false;
//         }
//         const splittedString = evalFile.split("/** * **/");
//         const argStrings = splittedString[0].split("// Parameter:");
//         const args = [];
//         if (argStrings.length > 1) {
//             for (let i = 1; i < argStrings.length - 1; i++) {
//                 args.push(JSON.parse(argStrings[i]));
//             }
//             args.push(JSON.parse(argStrings[argStrings.length - 1].split("function")[0].split("async")[0]));
//         }
//         const val0 = args.map((arg) => arg.name);
//         const val1 = args.map((arg) => arg.value);

//         const prefixString = `async function __main_func(__modules__, ` + val0 + ") {\n__debug__ = false;\n__model__ = `" + data + "`;\n";
//         const postfixString = `\n}\nreturn __main_func;`;
//         try {
//             const fn = new Function(prefixString + splittedString[1] + postfixString);
//             const result = await fn()(Modules, ...val1);
//             resolve(result.result);
//         } catch (err) {
//             console.log("error:", err);
//         }
//     }).catch((err) => {
//         throw err;
//     });
//     const result = await p;
//     console.log("eval result:", result);
//     return result;
// }
