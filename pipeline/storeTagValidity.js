const request = require('request')

module.exports.storeTagValidity = (event, context, callback) => {
  const httpUrlForTransaction = process.env.NEO4J_URL
  const message = event
  const tagsSetValid = []

  const updateTagQuery = 'MATCH (tag:Tag { name: {name} })' +
    'SET tag.valid = true ' +
    'SET tag.validated = timestamp() '

  let output = {}

  for (const tag of message.validTags) {
    const statements = []
    statements.push({
      'statement': updateTagQuery,
      'parameters': {name: tag, valid: message.valid}
    })
    request.post({
      uri: httpUrlForTransaction,
      json: {statements: statements}
    },
      function (err, resp) {
        if (err) {
          console.log(err)
        } else {
          if (resp.body.errors.length > 0) {
            console.log(JSON.stringify(resp.body.errors))
          } else {
            tagsSetValid.push(tag)
            if (tagsSetValid.length === message.validTags.length) {
              output.tagsSetValid = tagsSetValid
            }
          }
          callback(null, output)
        }
      })
  }
}
