## Deploy

Deploy a Service
```
serverless deploy -v
```

Deploy a Function
```
serverless deploy function -f hello
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

## Conventions
Uses [ESLint](https://eslint.org) with standard style guide to check ES6 syntax.