const request = require('request')

module.exports.retrieveEbiPhoto = (event, context, callback) => {
  const baseUrl = 'https://www.ebi.ac.uk/about/people/'
  const output = {}
  output.email = event.email
  output.photoRetrieved = false
  if (event.name) {
    const nameStr = event.name.replace(/\s+/g, '-').toLowerCase()
    const personUrl = baseUrl + nameStr
    request.get({
      url: personUrl
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
