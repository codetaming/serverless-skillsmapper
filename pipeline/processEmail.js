'use strict'

const AWS = require('aws-sdk')
const stepfunctions = new AWS.StepFunctions()

module.exports.processEmail = (event, context, callback) => {
  let message = event.Records[0].Sns.Message
  let notification = JSON.parse(message)
  let destination = notification.mail.destination
  let messageId = notification.mail.messageId
  let source = notification.mail.source
  let type = extractType(destination)
  let tags = extractTagsString(notification)
  let people = extractPeople(destination)

  const payload = {
    id: messageId,
    source: source,
    type: type,
    tags: tags,
    people: people
  }
  startStateMachine(payload)
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
