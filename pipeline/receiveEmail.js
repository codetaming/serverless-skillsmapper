'use strict'

const AWS = require('aws-sdk')

module.exports.receiveEmail = (event, context, callback) => {
  console.log(JSON.stringify(event))
  var message = event.Records[0].Sns.Message
  var notification = JSON.parse(message)
  var destination = notification.mail.destination
  var messageId = notification.mail.messageId
  var source = notification.mail.source
  var type = extractType(destination)
  var tags = extractTagsString(notification)
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
  var type = destination[0].replace('@skillsmapper.org', '')
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
  console.log(process.env.SNS_MESSAGE_RECEIVED)
  sns.publish({
    Message: JSON.stringify(payload),
    TargetArn: process.env.SNS_MESSAGE_RECEIVED
  }, function (err, data) {
    if (err) {
      console.error('Error publishing to SNS:\n' + JSON.stringify(err))
    } else {
      console.info('Message published to SNS')
    }
  })
}
