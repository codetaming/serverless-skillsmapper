'use strict'
const request = require('request')

module.exports.getAllPeople = (event, context, callback) => {
  const httpUrlForTransaction = process.env.NEO4J_URL
  const statements = []

  const allPeopleQuery = 'match (p:Person)-[r]->(t:Tag) where p.name is not null and p.hash is not null return p.name, p.hash, p.imageUrl, count(r) order by p.name'

  statements.push({
    'statement': allPeopleQuery
  })

  const results = []

  request.post({
    uri: httpUrlForTransaction,
    json: {statements: statements}
  },
    function (err, resp) {
      if (err) {
        const errorResponse = {
          statusCode: 500,
          body: err
        }
        callback(null, errorResponse)
      } else {
        const data = resp.body.results[0].data
        for (let i = 0; i < data.length; i++) {
          const person = {}
          const row = data[i].row

          person.name = row[0]
          person.hash = row[1]
          person.tagCount = row[3]

          const imageUrl = row[2]

          if (imageUrl === null) {
            person.imageUrl = process.env.DEFAULT_PHOTO_URL
          } else {
            person.imageUrl = imageUrl
          }
          results.push(person)
        }

        const response = {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(results)
        }

        callback(null, response)
      }
    }
  )
}
