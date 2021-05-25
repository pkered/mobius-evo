# Mobius Evolver
Cloud-based Evolutionary Optimisation for Mobius Modeller.

## Requirements
Mobius Evolver has been built on the Amazon AWS cloud computing platform.

The instructions below will explain how to install Mobius Evolver on your own AWS Account. 
Before you start, you will require:
* a [Github account](https://github.com/join)
* an [Amazon AWS account](https://portal.aws.amazon.com/billing/signup)

### Amazon AWS Cloud Computing
With your AWS account (May 2021):
* you get 25GB of free storage on Dynamo DB (does not expire),
* you get the first 1 million Lambda function executions per month for free (does not expire), and
* for the the first 12 months after opening your account, you get 5GB of free storage on S3.

When you are running Mobius Evolver search that has a total of 1000 designs, then it will result in 2001 Lambda executions.  This means that you can run 499 of such searches every month without incurring any Lambda costs. You may still incur some storage costs depending on how long you save the results, but these costs are very low. (May 2021, S3 storage cost is $0.023 / GB).

* For more information on the AWS free tier, see [https://aws.amazon.com/free/](https://aws.amazon.com/free/)
* For more information of AWS S3 storage costs, see [https://aws.amazon.com/s3/pricing/](https://aws.amazon.com/s3/pricing/)

### Install Mobius Evolver
Installation is very straightforward. In your browser, make sure you are logged into both your GitHub account and your AWS account. Then click this `Install Mobius Evolver` button.

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

1. This step will create a fork of mobius-evo to your GitHub account
* Click the `Connect to GitHub` button.

![Connect to GitHub](./amplify_console_01.jpg)

2. This step will start the deployment of Mobius Evolver on your AWS account.
* Click `Create new role`, 
* Click `Next` until the new role has been created.
* Click the refresh button just above above the `Create new role` button.
* Select the new role from the drop down list.
* Click the `Save and Deploy` button.

![Review and Deploy](./amplify_console_02.jpg)

3. The automated setup process takes around 20 minutes. There are four stages: provision, build, deploy, and verify. Once you see a green tick next to each stage, the process has completed.
* Click the URL link at the bottom left. It follows this format:
`https://main.<app id>.amplifyapp.com`
* Your personal version of Mobius Evolver will open up in the browser.

![Successfully Deployed](./amplify_console_03.jpg)

4. You can now log out of your GitHub and AWS account. You can continue to use Mobius Evolver.

## Uninstall Mobius Evolver
1. Log into your AWS account, the AWS Console will be visible. 

2. Find your Mobius Evolver app in the Console.
* In the search bar at the top of the AWS Console, type `Amplify` 
* Click `AWS Amplify` link that pops up.

![aws cognito](./amplify_console_deleteApp_01.png)

3. Delete the app.
* A page displaying all your apps opens up. Click on the `mobiusevo` app.
* In the top right hand corner, click `Action` and select `Delete App`.
* Follow the app deletion steps in AWS Console.

![Delete Application](./amplify_console_deleteApp_02.png)

4. Find your Cognito User Pool in the Console.
* In the search bar at the top of the AWS Console, type `Cognito` 
* Click the `Cognito` link that pops up.

![aws cognito](./amplify_console_deleteApp_03.png)

5. Delete the user pool.
* Click `Mange User Pools`
* Select the user pool for Mobius Evolver. It follows this format: `amplify_backend_manager_<app id>`
* Click `Delete Pool` in the top right hand corner.
