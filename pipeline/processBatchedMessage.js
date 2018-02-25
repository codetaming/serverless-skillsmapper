'use strict'

const AWS = require('aws-sdk')
const stepfunctions = new AWS.StepFunctions()
const sqs = new AWS.SQS()

module.exports.processBatchedMessage = (event, context, callback) => {
  console.log('processBatchedMessage')
  const queueUrl = process.env.BATCH_MESSAGE_QUEUE_URL

  var params = {
    QueueUrl: queueUrl
  }

  sqs.receiveMessage(params, function (err, data) {
    if (err) {
      console.log('Receive Error', err)
    } else if (data.Messages) {
      const message = JSON.parse(data.Messages[0].Body)
      console.log('Processing: ' + JSON.stringify(message))
      startStateMachine(message)
      var deleteParams = {
        QueueUrl: queueUrl,
        ReceiptHandle: data.Messages[0].ReceiptHandle
      }
      sqs.deleteMessage(deleteParams, function (err, data) {
        if (err) {
          console.log('Delete Error', err)
        } else {
          console.log('Message Deleted', data)
        }
      })
    } else {
      console.log('No message')
    }
    callback(null, 'finished')
  })
}

function startStateMachine (payload) {
  const stateMachineArn = process.env.STATEMACHINE_ARN
  console.log('Starting state machine: ' + stateMachineArn)
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
