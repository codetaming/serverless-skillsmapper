'use strict'

const AWS = require('aws-sdk')

module.exports.receiveEmail = (event, context, callback) => {
  console.log(JSON.stringify(event))
  var sesNotification = event.Records[0].ses
  var destination = sesNotification.mail.destination
  var messageId = sesNotification.mail.messageId
  var source = sesNotification.mail.source
  var type = extractType(destination)
  var tags = extractTagsString(sesNotification)
  var people = extractPeople(destination)

  var payload = {
    id: messageId,
    source: source,
    type: type,
    tags: tags,
    people: people
  }

  sendSns(payload)
}

function extractTagsString (sesNotification) {
  var subject = ''
  var headers = sesNotification.mail.headers
  for (var i = 0; i < headers.length; i++) {
    if (headers[i].name === 'Subject') {
      subject = headers[i].value
    }
  }
  var tags = subject.toLowerCase()
  return tags
}

function extractType (destination) {
  var type = destination[0].replace('@skillsmapper.site', '')
  return type.toLowerCase()
}

function extractPeople (destination) {
  var people = []
  for (var i = 1; i < destination.length; i++) {
    people.push(destination[i])
  }
  return people
}

function sendSns (payload) {
  var sns = new AWS.SNS()
  var payloadStr = JSON.stringify(payload)
  console.log('Sending new message to SNS with payload: ' + payloadStr)
  sns.publish({
    Message: payloadStr,
    TargetArn: process.env.SNS_NEW_MESSAGE
  }, function (err, data) {
    if (err) {
      console.error('Error publishing to SNS')
    } else {
      console.info('Message published to SNS')
    }
  })
}
