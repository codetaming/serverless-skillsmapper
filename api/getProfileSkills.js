const request = require('request')

module.exports.getProfileSkills = (event, context, callback) => {
  const queryStringParameters = event.queryStringParameters
  const httpUrlForTransaction = process.env.NEO4J_URL
  const statements = []
  let filterField = ''
  let filter = ''
  if (queryStringParameters.hash !== undefined) {
    filterField = 'hash'
    filter = queryStringParameters.hash
  }
  if (queryStringParameters.email !== undefined) {
    filterField = 'email'
    filter = queryStringParameters.email
  }
  const skillProfileQuery = 'match (t:Tag)<-[r]-(:Person { ' + filterField + ': {filter}} ) where r.ended is null return type(r), t.name, t.valid order by t.name'
  statements.push({
    'statement': skillProfileQuery,
    'parameters': {filter: filter}
  })
  const profile = {}
  if (filterField.length > 0) {
    const interested = []
    const learning = []
    const using = []
    const used = []

    request.post({
      uri: httpUrlForTransaction,
      json: {statements: statements}
    },
      function (err, resp) {
        if (err) {
          console.log(err)
        } else {
          const data = resp.body.results[0].data
          for (let i = 0; i < data.length; i++) {
            const row = data[i].row
            const type = row[0]
            const tag = row[1]
            const valid = row[2]
            const pair = {}
            pair.tag = tag
            pair.valid = valid
            switch (type) {
              case 'I_AM_INTERESTED_IN':
                interested.push(pair)
                break
              case 'I_AM_LEARNING':
                learning.push(pair)
                break
              case 'I_AM_USING':
                using.push(pair)
                break
              case 'I_HAVE_USED':
                used.push(pair)
                break
            }
          }
          profile.interested = interested
          profile.using = using
          profile.learning = learning
          profile.used = used
          const response = {
            statusCode: 200,
            body: JSON.stringify(profile)
          }
          callback(null, response)
        }
      })
  }
}
