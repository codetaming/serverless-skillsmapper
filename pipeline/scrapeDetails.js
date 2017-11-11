const scraper = require('google-search-scraper')

module.exports.scrapeDetails = (event, context, callback) => {
  const searchTerm = event.email.replace('@', ' [at] ')

  var options = {
    query: 'site:ebi.ac.uk ' + searchTerm,
    limit: 1
  }
  const output = {}
  output.email = event.email
  let count = 0
  scraper.search(options, function (err, url) {
    if (err) {
      callback(err, null)
    }
    if (!output.url) {
      output.url = url
    }
    count++
    if (count === (options.limit)) {
      callback(null, output)
    }
  })
}
