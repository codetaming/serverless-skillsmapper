var request = require('request')

module.exports.getSkill = (event, context, callback) => {
  const httpUrlForTransaction = process.env.NEO4J_URL
  const pathParameters = event.pathParameters
  const statements = []
  if (pathParameters.tag !== undefined) {
    const skillQuery = 'match (t:Tag { name:{tag} })<-[r]-(p:Person) where r.ended is null return type(r), p.name, p.email, p.imageUrl, p.hash order by p.name'
    statements.push({
      'statement': skillQuery,
      'parameters': {tag: pathParameters.tag}
    })
  }
  const skill = {}

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
          const name = row[1]
          const email = row[2]
          const imageUrl = row[3]
          const hash = row[4]
          const result = {}
          result.name = name
          result.email = email
          if (imageUrl === null) {
            result.imageUrl = process.env.DEFAULT_PHOTO_URL
          } else {
            result.imageUrl = imageUrl
          }
          result.hash = hash
          switch (type) {
            case 'I_AM_INTERESTED_IN':
              interested.push(result)
              break
            case 'I_AM_LEARNING':
              learning.push(result)
              break
            case 'I_AM_USING':
              using.push(result)
              break
            case 'I_HAVE_USED':
              used.push(result)
              break
          }
        }
        skill.interested = interested
        skill.using = using
        skill.learning = learning
        skill.used = used
        const response = {
          statusCode: 200,
          body: JSON.stringify(skill)
        }
        callback(null, response)
      }
    })
}
