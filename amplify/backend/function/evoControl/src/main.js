require("module-alias/register");
Object.defineProperty(exports, "__esModule", { value: true });
const main = require("@assets/main");
exports.runGen = main.runGen;
exports.runEval = main.runEval;
// exports.runGenEvalController = main.runGenEvalController;
exports.runGenEvalController = (input, context, callback) => {
    try {
        console.log('data', input.body)
        main.runGenEvalController(JSON.parse(input.body))
    } catch (ex) { }
    // const response = {
    //     statusCode: 200,
    // //  Uncomment below to enable CORS requests
    //     headers: {
    //         "Access-Control-Allow-Methods": "PUT",
    //         "Access-Control-Allow-Headers": "Content-Type",
    //         "Access-Control-Allow-Origin": "*"
    //     }, 
    //     body: JSON.stringify('Hello from Lambda!'),
    // };
    // return response;
};
