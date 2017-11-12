const request = require('request')

module.exports.storeDetails = (event, context, callback) => {
  const httpUrlForTransaction = process.env.NEO4J_URL
  const statements = []
  const output = {}
  output.email = event.email
  const updatePersonQuery = 'MERGE (person:Person { email: {email} })' +
    'SET person.name = {name} '
  statements.push({
    'statement': updatePersonQuery,
    'parameters': {email: event.email, name: event.name}
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
          output.nameUpdated = false
        } else {
          output.nameUpdated = true
        }
        callback(null, output)
      }
    })
}
