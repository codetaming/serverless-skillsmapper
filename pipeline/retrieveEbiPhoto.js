const request = require('request')

module.exports.retrieveEbiPhoto = (event, context, callback) => {
  const output = {}
  output.email = event.email
  output.photoRetrieved = false
  if (event.url) {
    request.get({
      url: event.url
    },
      function (err, resp) {
        if (err) {
          callback(err, null)
        } else {
          if (resp.statusCode === 200) {
            const body = resp.body
            const re = /\/sites\/ebi\.ac\.uk\/files\/styles\/medium.+\.(jpeg|jpg)/
            const found = body.match(re)
            if (found) {
              output.imageUrl = 'https://www.ebi.ac.uk/' + found[0]
              output.photoRetrieved = true
            }
            callback(null, output)
          } else {
            callback(null, output)
          }
        }
      }
    )
  } else {
    callback(null, output)
  }
}
