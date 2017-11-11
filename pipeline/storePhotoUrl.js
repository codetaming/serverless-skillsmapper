const request = require('request')

module.exports.storePhotoUrl = (event, context, callback) => {
  const httpUrlForTransaction = process.env.NEO4J_URL
  const statements = []
  const output = {}
  output.email = event.email
  const updatePersonQuery = 'MERGE (person:Person { email: {email} })' +
    'SET person.imageUrl = {imageUrl} '
  statements.push({
    'statement': updatePersonQuery,
    'parameters': {email: event.email, imageUrl: event.imageUrl}
  })
  request.post({
    uri: httpUrlForTransaction,
    json: {statements: statements}
  },
    function (err, resp) {
      if (err) {
        callback(err, null)
      } else {
        if (resp.body.errors.length > 0) {
          output.photoUpdated = false
        } else {
          output.photoUpdated = true
        }
        callback(null, output)
      }
    })
}
