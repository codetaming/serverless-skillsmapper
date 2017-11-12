const request = require('request')

module.exports.checkDetails = (event, context, callback) => {
  const httpUrlForTransaction = process.env.NEO4J_URL
  const statements = []
  const skillProfileQuery = 'match (p:Person {email: {email}} ) ' +
    'return p.name, p.imageUrl'
  statements.push({
    'statement': skillProfileQuery,
    'parameters': {email: event.email}
  })
  const output = {}
  request.post({
      uri: httpUrlForTransaction,
      json: {statements: statements}
    },
    function (err, resp) {
      if (err) {
        callback(err, null)
      } else {
        const data = resp.body.results[0].data
        if (data.length === 1) {
          const row = data[0].row
          output.email = event.email
          output.hasName = row[0] !== null
          output.hasPhoto = row[1] !== null
          callback(null, output)
        }
        else {
          output.email = event.email
          output.hasName = false
          output.hasPhoto = false
          callback(null, output)
        }
      }
    })
}
