/* Amplify Params - DO NOT EDIT
	API_MOBIUSEVOGRAPHQL_GENEVALPARAMTABLE_ARN
	API_MOBIUSEVOGRAPHQL_GENEVALPARAMTABLE_NAME
	API_MOBIUSEVOGRAPHQL_GRAPHQLAPIIDOUTPUT
	API_MOBIUSEVOGRAPHQL_JOBTABLE_ARN
	API_MOBIUSEVOGRAPHQL_JOBTABLE_NAME
	ENV
	FUNCTION_EVOEVALUATE_NAME
	FUNCTION_EVOGENERATE_NAME
	REGION
	STORAGE_MOBIUSEVOUSERFILES_BUCKETNAME
Amplify Params - DO NOT EDIT */

exports.handler = async (event) => {
    // TODO implement
    const response = {
        statusCode: 200,
    //  Uncomment below to enable CORS requests
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
        }, 
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
