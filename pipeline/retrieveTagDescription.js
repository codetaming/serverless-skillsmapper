const request = require('request')

module.exports.retrieveTagDescription = (event, context, callback) => {
  const message = event
  console.log('Message: ' + JSON.stringify(message))
  let remaining = message.tagsSetValid.length
  const tagDescriptionsRetrieved = []
  if (message.tagsSetValid != null) {
    for (const tag of message.tagsSetValid) {
      console.log('Getting description for: ' + tag)
      remaining = remaining - 1
      getDescription(callback, tag, tagDescriptionsRetrieved, remaining)
    }
  } else {
    const output = {'tagDescriptionsRetrieved': tagDescriptionsRetrieved}
    callback(null, output)
  }
}

function toTitleCase (str) {
  return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase() })
}

function getDescription (callback, tag, tagDescriptionsRetrieved, remaining) {
  const httpUrlForTransaction = process.env.NEO4J_URL
  var soUrl = 'http://stackoverflow.com/tags/' + tag + '/info'
  request.get({
      url: soUrl
    },
    function (err, resp) {
      if (err) {
        console.error(JSON.stringify(err))
      } else {
        if (resp.statusCode === 200) {
          var body = resp.body
          var descriptionRegEx = /<div class=\"welovestackoverflow\" id=\"wiki-excerpt\">\s+?<p>\s+(.+)\s+<\/p>\s+<\/div>/
          var descriptionMatches = body.match(descriptionRegEx)
          if (descriptionMatches != null) {
            var description = ''
            if (descriptionMatches.length === 2) {
              description = descriptionMatches[1]
            }

            var title = toTitleCase(tag.replace('-', ' '))

            var statements = []
            var updateTagQuery = 'MATCH (tag:Tag { name: {name} })' +
              'SET tag.queried = true ' +
              'SET tag.description = {description} ' +
              'SET tag.title = {title}'
            statements.push({
              'statement': updateTagQuery,
              'parameters': {name: tag, description: description, title: title}
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
                    tagDescriptionsRetrieved.push(tag)
                    if (remaining === 0) {
                      const output = {'tagDescriptionsRetrieved': tagDescriptionsRetrieved}
                      callback(null, output)
                    }
                  }
                }
              }
            )
          } else {
            console.error('No description found in response')
            const output = {'tagDescriptionsRetrieved': tagDescriptionsRetrieved}
            callback(null, output)
          }
        } else {
          console.error('Error retrieving description')
          console.error(JSON.stringify(resp))
          const output = {'tagDescriptionsRetrieved': tagDescriptionsRetrieved}
          callback(null, output)
        }
      }
    }
  )
}
