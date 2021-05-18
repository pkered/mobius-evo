require("module-alias/register");
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const main = require("@assets/main");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
exports.runGen = main.runGen;
exports.runEval = main.runEval;
// exports.runGenEvalController = main.runGenEvalController;
exports.runGenEvalController = (input, context, callback) => {
    try {
        // console.log('data', input.body)
        console.log("~~~ input: ", input);
        const record = input.Records[0];
        if (record.eventName !== "INSERT" && record.eventName !== "MODIFY") {
            return;
        }
        console.log("DynamoDB Record: %j", record.dynamodb);
        const event = aws_sdk_1.default.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
        console.log(event);
        main.runGenEvalController(event)
    } catch (ex) { 
        console.log('error:', ex)
    }
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
