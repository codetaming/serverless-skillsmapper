const StackExchange = require('stackexchange')

module.exports.validateTags = (event, context, callback) => {
  const message = event
  const options = {version: 2.2}
  const se = new StackExchange(options)

  const criteria = {
    site: 'stackoverflow',
    sort: 'popular',
    order: 'desc'
  }

  const tags = message.unknownTags
  let output = {}
  const validTags = []
  se.tags.info(criteria, function (err, results) {
    if (err) {
      console.log(err)
    } else {
      for (const item of results.items) {
        if (tags.indexOf(item.name) >= 0) {
          validTags.push(item.name)
        }
      }
      output.validTags = validTags
      callback(null, output)
    }
  }, tags)
}
