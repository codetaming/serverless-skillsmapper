# Serverless Skills Mapper

This is an implementation of the Skills Mapper application using the [Serverless Framework](https://serverless.com/).

It is meant as a test ground for trying out functionality.

## Deploy

Deploy a Service
```
serverless deploy -v
```

Deploy a Function
```
serverless deploy function -f functionName
```

Deploy Client
```
serverless client deploy -v
```

## Run Locally

[Run a function locally](https://serverless.com/framework/docs/providers/aws/cli-reference/invoke-local/#)
```
serverless invoke local --function functionName
```
with data
```
serverless invoke local --function getProfile --path ../example/getProfile.json
```

## Step Functions

[https://github.com/horike37/serverless-step-functions](https://github.com/horike37/serverless-step-functions)

## Conventions
Uses [ESLint](https://eslint.org) with standard style guide to check ES6 syntax.


## Serverless
Using Serverless 1.21.1 as 1.22.0+ has a [breaking bug](https://github.com/serverless/serverless/issues/4329)
```
npm install -g serverless@1.22.0
```
Now using Serverless 1.24.1 which appears to have resolved the issue

## Testing

https://medium.com/vandium-software/unit-testing-aws-lambda-functions-in-node-js-7ad6c8f5000

## EC2 Deployment
I was getting fed up with deploying Serverless over a slow connection so created an EC2 instance to deploy from. See [aws-scripts](aws-scripts). This is better done using Travis-CI.