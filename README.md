# Mobius Evolver
Cloud-based Evolutionary Optimisation for Mobius Modeller.

## Requirements
Mobius Evolver has been tested and built on AWS Cloud Environment.
To get started, you will require an [aws account](https://aws.amazon.com/).

### AWS
With your AWS account (May 2021):
* you get 25GB of free storage on Dynamo DB (does not expire),

* you get the first 1 million Lambda function executions per month for free (does not expire), and

* for the the first 12 months after opening your account, you get 5GB of free storage on S3.

When you are running Mobius Evolver search that has a total of 1000 designs, then it will result in 2001 Lambda executions.  This means that you can run 499 of such searches every month without incurring any costs.  You may still incur some storage costs depending on how long you save the results, but these costs are very low. (May 2021, S3 storage cost is $0.023 / GB).

For more information on the AWS free tier, see [https://aws.amazon.com/free/](https://aws.amazon.com/free/)

For more information of AWS S3 storage costs, see [https://aws.amazon.com/s3/pricing/](https://aws.amazon.com/s3/pricing/)

### Install
[![amplifybutton](https://raw.githubusercontent.com/design-automation/mobius-evo/main/install_evolver.png)](https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/design-automation/mobius-evo)

1. Connect to GitHub.
It will create a fork of mobius-evo to your GitHub account
![Connect to GitHub](./amplify_console_01.jpg)

1. Select a service role and deploy
![Review and Deploy](./amplify_console_02.jpg)

1. Successfully Deployed
![Successfully Deployed](./amplify_console_03.jpg)

1. app settings > General
You can find the deployed link and application id here. It follows this format:
`main.<app id>.amplifyapp.com`
![App Details](./amplify_console_04.jpg)

## Uninstall
1. Take note of app id obtained from Step 4 of installation

1. Follow the app deletion steps in aws console
![Delete Application](./amplify_console_deleteApp_01.png)

1. Access AWS Cognito
![aws cognito](./amplify_console_deleteApp_02.png)

1. Delete userpool: `amplify_backend_manager_<app id>`