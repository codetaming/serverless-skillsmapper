const request = require('request')
const aws = require('aws-sdk')

module.exports.getSkillDescription = (event, context, callback) => {
  const httpUrlForTransaction = process.env.NEO4J_URL
  const pathParameters = event.pathParameters
  const statements = []

  if (pathParameters.tag !== undefined) {
    const tagDescriptionQuery = 'match (t:Tag { name: {name} } ) return t.name, t.title, t.description, exists(t.queried)'
    statements.push({
      'statement': tagDescriptionQuery,
      'parameters': {name: pathParameters.tag}
    })
  }
  const profile = {}
  console.log(JSON.stringify(statements))
  request.post({
    uri: httpUrlForTransaction,
    json: {statements: statements}
  },
    function (err, resp) {
      if (err) {
        console.log(JSON.stringify(err))
      } else {
        const data = resp.body.results[0].data
        if (data.length === 1) {
          const row = data[0].row
          profile.name = row[0]
          profile.title = row[1]
          profile.description = row[2]
          if (!row[3]) {
            console.log('no description')
            informMissingDescription(profile, context)
          } else {
            const response = {
              statusCode: 200,
              body: JSON.stringify(profile)
            }
            callback(null, response)
          }
        }
      }
    })
}

function informMissingDescription (profile) {
  const message = {}
  message.tag = profile.name
  const sns = new aws.SNS()
  const tagStr = JSON.stringify(message)
  sns.publish({
    Message: tagStr,
    TargetArn: process.env.SNS_NO_DESCRIPTION
  }, function (err) {
    if (err) {
      console.error('Error publishing to SNS no-desc')
    } else {
      console.info('Message published to SNS no-desc')
    }
  })
}
