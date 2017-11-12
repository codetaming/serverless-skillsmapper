const request = require('request')

module.exports.retrieveDetails = (event, context, callback) => {
  const output = {}
  output.email = event.email
  output.nameRetrieved = false
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
            const regex = /<h2 id="page-title" class="title">(.*)?<\/h2>/
            const results = regex.exec(body)
            if (results) {
              output.name = results[1]
              output.nameRetrieved = true
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
