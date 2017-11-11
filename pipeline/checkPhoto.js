const request = require('request')

module.exports.checkPhoto = (event, context, callback) => {
  const httpUrlForTransaction = process.env.NEO4J_URL
  const statements = []
  const skillProfileQuery = 'match (p:Person {email: {email}} ) ' +
    'return p.name, p.email, p.imageUrl'
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
          output.name = row[0]
          output.email = row[1]
          if (!row[2]) {
            output.hasPhoto = false
          } else {
            output.hasPhoto = true
          }
          callback(null, output)
        }
      }
    })
}
