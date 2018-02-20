'use strict'

const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'})
const stepfunctions = new AWS.StepFunctions()

module.exports.repopulateFromTable = (event, context, callback) => {
  const tableName = process.env.MESSAGES_RECEIVED_TABLE
  dynamodb.scan({TableName: tableName, Limit: 10}, function (err, data) {
    if (err) {
      context.done('error', 'reading dynamodb failed: ' + err)
    }
    for (var i in data.Items) {
      i = data.Items[i]
      const payload = {
        id: i.messageId.S,
        source: i.source.S,
        type: i.type.S,
        tags: i.tags.S,
        people: ''
      }
      console.log(JSON.stringify(payload))
      // startStateMachine(payload)
    }
  })
}

function startStateMachine (payload) {
  const stateMachineArn = process.env.STATEMACHINE_ARN
  const params = {
    stateMachineArn,
    'input': JSON.stringify({message: payload})
  }
  console.log(JSON.stringify(params))
  stepfunctions.startExecution(params, function (err, data) {
    if (err) console.log(err, err.stack)
    else console.log(data)
  })
}
