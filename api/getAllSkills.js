const request = require('request')

module.exports.getAllSkills = (event, context, callback) => {
  const httpUrlForTransaction = process.env.NEO4J_URL
  const statements = []
  const allTagsQuery = 'match (t:Tag)<-[r]-(:Person) return t.name, t.description, count(r) order by t.name'
  statements.push({
    'statement': allTagsQuery
  })
  var results = []
  request.post({
    uri: httpUrlForTransaction,
    json: {statements: statements}
  },
    function (err, resp) {
      if (err) {
        console.log(JSON.stringify(err))
      } else {
        var data = resp.body.results[0].data
        console.log(JSON.stringify(data))
        for (var i = 0; i < data.length; i++) {
          var skill = {}
          var row = data[i].row
          console.log(JSON.stringify(data[i]))
          skill.name = row[0]
          skill.description = row[1]
          skill.count = row[2]
          results.push(skill)
        }

        const response = {
          statusCode: 200,
          body: JSON.stringify(results)
        }

        callback(null, response)
      }
    }
  )
}
