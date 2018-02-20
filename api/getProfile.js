const request = require('request')
const AWSXRay = require('aws-xray-sdk-core')
const AWS = AWSXRay.captureAWS(require('aws-sdk'))

module.exports.getProfile = (event, context, callback) => {
  const queryStringParameters = event.queryStringParameters
  const httpUrlForTransaction = process.env.NEO4J_URL
  const statements = []
  let filterField = ''
  let filter = ''
  if (queryStringParameters.hash !== undefined) {
    filterField = 'hash'
    filter = queryStringParameters.hash
  }
  if (queryStringParameters.email !== undefined) {
    filterField = 'email'
    filter = queryStringParameters.email
  }
  if (filterField.length > 0) {
    const skillProfileQuery = 'match (p:Person { ' + filterField + ': {filter}} ) ' +
      'match (p)-[:HAS_TITLE]->(t:Title) ' +
      'match (p)-[:MEMBER_OF]->(g:Group) ' +
      'match (p)-[:IS_IN]->(r:Room) ' +
      'return p.name, p.hash, t.name, collect(g.name), r.name, p.imageUrl'
    statements.push({
      'statement': skillProfileQuery,
      'parameters': {filter: filter}
    })
    const profile = {}
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
            profile.hash = row[1]
            profile.title = row[2]
            profile.group = row[3]
            profile.room = row[4]
            profile.imageUrl = row[5]
            if (!profile.imageUrl) {
              console.log('no image')
              informMissingPhoto(profile, context)
            }
            const response = {
              statusCode: 200,
              headers: {
                'Access-Control-Allow-Credentials': true,
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(profile)
            }
            callback(null, response)
          }
        }
      })
  }
}

function informMissingPhoto (profile) {
  const person = {}
  person.email = profile.email
  person.name = profile.name
  const sns = new AWS.SNS()
  const personStr = JSON.stringify(person)
  sns.publish({
    Message: personStr,
    TargetArn: process.env.SNS_NO_PHOTO
  }, function (err) {
    if (err) {
      console.error('Error publishing to SNS no-photo')
    } else {
      console.info('Message published to SNS no-photo')
    }
  })
}
