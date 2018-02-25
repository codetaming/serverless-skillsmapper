'use strict'

const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'})
const sqs = new AWS.SQS()

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
        var params = {
          MessageBody: JSON.stringify(payload),
          QueueUrl: process.env.BATCH_MESSAGE_QUEUE_URL
        }
        sqs.sendMessage(params, function (err, data) {
          if (err) {
            console.log('error:', 'Fail Send Message' + err)
          } else {
            console.log('data:', data.MessageId)
          }
        })
      }
    }
  })
  let result = 'success'
  callback(null, result)
}
