/* Amplify Params - DO NOT EDIT
    API_MOBIUSEVOGRAPHQL_GRAPHQLAPIENDPOINTOUTPUT
    API_MOBIUSEVOGRAPHQL_GRAPHQLAPIIDOUTPUT
Amplify Params - DO NOT EDIT */

const AWSAppSyncClient = require('aws-appsync').default;
const gql = require('graphql-tag');

const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
      id
      email
      s3ID
      jobs {
        id
        userID
        evalUrl
        genUrl
        expiration
        description
        settings
        createdAt
        endedAt
        status
        updatedAt
      }
      status
      createdAt
      updatedAt
    }
  }
`;

const client = new AWSAppSyncClient(
  {
    url:process.env.API_MOBIUSEVOGRAPHQL_GRAPHQLAPIENDPOINTOUTPUT,
    region: process.env.AWS_REGION,
    auth: {
      type: "API_KEY",
      apiKey: process.env.API_MOBIUSEVOGRAPHQL_GRAPHQLAPIIDOUTPUT
    },
    disableOffline: true
  }
);

exports.handler = async (event) => {
  console.log(event);
  try{
    const mutation = gql(createUser);
    const userAttributes = JSON.parse(event.body).request.userAttributes;
    const resolved = await client.mutate({
      mutation: mutation,
      variables: {
        id: userAttributes.sub,
        email: userAttributes.email,
        status: userAttributes["cognito:user_status"],
      }
    });
    return Promise.resolve({
      statusCode: 200,
      body: JSON.stringify(resolved.data),
      headers: {
          "Access-Control-Allow-Origin": "*"
      }
    });
  } catch(err) {
    return Promise.reject(new Error(`error creating new User in DB: ${err}`));
  };
};

// exports.handler = async (event) => {
// 	const new_promise = new Promise((resolve, reject) => {
// 		try{
// 			const mutation = gql(mutations.createUser);
// 			const userAttributes = event.request.userAttributes;
// 			const resolved = await client.mutate({
// 			  mutation: mutation,
// 			  variables: {
// 				id: userAttributes.sub,
// 				email: userAttributes.email,
// 				status: userAttributes["cognito:user_status"],
// 			  }
// 			});
// 			resolve({
// 			  statusCode: 200,
// 			  body: JSON.stringify(resolved.data),
// 			  headers: {
// 				  "Access-Control-Allow-Origin": "*"
// 			  }
// 			});
// 		} catch(err) {
// 			reject(new Error(`error creating new User in DB: ${err}`));
// 		};
// 	});
// 	return new_promise;
// };