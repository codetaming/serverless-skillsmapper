'use strict'

const AWS = require('aws-sdk')
const stepfunctions = new AWS.StepFunctions()
const sqs = new AWS.SQS()

module.exports.processBatchedMessage = (event, context, callback) => {
  const queueUrl = process.env.BATCH_MESSAGE_QUEUE_URL

  var params = {
    QueueUrl: queueUrl
  }

  sqs.receiveMessage(params, function (err, data) {
    if (err) {
      console.log('Receive Error', err)
    } else if (data.Messages) {
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
    }
  })
}
