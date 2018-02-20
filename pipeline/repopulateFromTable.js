'use strict'

const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'})
const stepfunctions = new AWS.StepFunctions()

module.exports.repopulateFromTable = (event, context, callback) => {
  const tableName = process.env.MESSAGES_BACKUP_TABLE
  console.log(tableName)
  dynamodb.scan({TableName: tableName, Limit: 1000}, function (err, data) {
    if (err) {
      context.done('error', 'reading ' + tableName + ' failed: ' + err)
    } else {
      data.Items.sort(function (a, b) { return (a.time.S > b.time.S) ? 1 : ((b.time.S > a.time.S) ? -1 : 0) })
      for (var i in data.Items) {
        i = data.Items[i]
        console.log(JSON.stringify(i))
        const payload = {
          id: i.id.S,
          source: i.source.S,
          type: i.type.S,
          tags: i.tags.S,
          people: []
        }
        startStateMachine(payload)
      }
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
