var request = require('request')
var sha1 = require('sha1')

module.exports.storeFact = (event, context, callback) => {
  const httpUrlForTransaction = process.env.NEO4J_URL
  const message = event
  const statements = []
  const commasReplacedTags = message.tags.replace(/,/g, ' ')
  const subjectElements = commasReplacedTags.split(' ')

  function isEmail (value) {
    return value.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
  }

  function isTag (value) {
    return value.match(/^[a-zA-Z0-9-\-\+\#]+$/)
  }

  function isTwitterHandle (value) {
    return value.match(/^@(\w){1,15}$/)
  }

  function isUrl (value) {
    return value.match('^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$')
  }

  const emails = subjectElements.filter(isEmail)
  const tags = subjectElements.filter(isTag)
  const rawTwitterHandles = subjectElements.filter(isTwitterHandle)
  const twitterHandles = formatTwitterHandles(rawTwitterHandles)
  const urls = subjectElements.filter(isUrl)
  const allPeople = []
  allPeople.push(emails)
  allPeople.push(message.source)
  for (var i = 0; i < allPeople.length; i++) {
    var createPersonQuery = 'MERGE (person:Person { email: {email} })' +
      'ON CREATE SET person.created = timestamp() ' +
      'ON CREATE SET person.hash = {hash} ' +
      'ON MATCH SET person.lastSeen = timestamp() '
    statements.push({
      'statement': createPersonQuery,
      'parameters': {email: allPeople[i], hash: sha1(allPeople[i])}
    })
  }
  console.log('source: ' + message.source)
  console.log('tags: ' + JSON.stringify(tags))
  console.log('emails: ' + JSON.stringify(emails))
  console.log('twitterHandles: ' + JSON.stringify(twitterHandles))
  console.log('urls: ' + JSON.stringify(urls))
  for (let i = 0; i < tags.length; i++) {
    let createTagQuery = 'MERGE (tag:Tag { name: {name} }) ' +
      'ON CREATE SET tag.firstMentioned = timestamp() ' +
      'ON MATCH SET tag.lastMentioned = timestamp() ' +
      'return tag.name, exists(tag.lastSeen)'
    statements.push({
      'statement': createTagQuery,
      'parameters': {name: tags[i]}
    })
  }
  for (let i = 0; i < urls.length; i++) {
    let createUrlQuery = 'MERGE (website:Website { url: {url} }) ' +
      'ON CREATE SET website.firstMentioned = timestamp() ' +
      'ON MATCH SET website.lastMentioned = timestamp()'
    statements.push({
      'statement': createUrlQuery,
      'parameters': {url: urls[i]}
    })
  }
  for (let i = 0; i < twitterHandles.length; i++) {
    let createTwitterHandleQuery = 'MERGE (twitter:Twitter { handle: {handle} }) ' +
      'ON CREATE SET twitter.firstMentioned = timestamp() ' +
      'ON MATCH SET twitter.lastMentioned = timestamp()'
    statements.push({
      'statement': createTwitterHandleQuery,
      'parameters': {handle: twitterHandles[i]}
    })
  }

  let type = message.type
  type = type.toUpperCase()
  type = type.replace(/\./g, '_')
  console.log('type:' + type)
  switch (type) {
    case 'I_AM_INTERESTED_IN':
    case 'I_AM_LEARNING':
    case 'I_AM_USING':
    case 'I_HAVE_USED':
      for (let i = 0; i < tags.length; i++) {
        const endRelationshipQuery = 'MATCH (:Person { email: {email} })-[r]-(:Tag { name: {name} })' +
          ' SET r.ended = timestamp() '
        statements.push({
          'statement': endRelationshipQuery,
          'parameters': {name: tags[i], email: message.source}
        })
        const createRelationshipQuery = 'MATCH (person:Person { email: {email} })' +
          ' MATCH (tag:Tag { name: {name} })' +
          ' CREATE UNIQUE (person)-[:' + type + ' { started: timestamp() } ]-(tag)'
        statements.push({
          'statement': createRelationshipQuery,
          'parameters': {name: tags[i], email: message.source}
        })
      }
      break
    case 'I_WORK_WITH':
    case 'I_REPORT_TO':
      for (let i = 0; i < message.people.length; i++) {
        const createRelationshipQuery = 'MATCH (person:Person { email: {email} })' +
          ' MATCH (otherPerson:Person { email: {otherPerson} })' +
          ' CREATE UNIQUE (person)-[:' + type + ' { started: timestamp() } ]->(otherPerson)'
        statements.push({
          'statement': createRelationshipQuery,
          'parameters': {otherPerson: message.people[i], email: message.source}
        })
      }
      break
    case 'I_AM_ALSO':
      if (twitterHandles.length === 1 && message.source.length > 1) {
        const createTwitterLinkQuery = 'MATCH (person:Person { email: {email} })' +
          ' MATCH (twitter:Twitter { handle: {handle} })' +
          ' CREATE UNIQUE (person)-[:IS_ALSO]->(twitter)'
        statements.push({
          'statement': createTwitterLinkQuery,
          'parameters': {email: message.source, handle: twitterHandles[0]}
        })
      }
      break
    case 'I_LEARNED_FROM':
      for (let i = 0; i < emails.length; i++) {
        for (let j = 0; j < tags.length; j++) {
          const createLearningQueryEmail = 'MATCH (person:Person { email: {email} })' +
            ' MATCH (otherPerson:Person { email: {otherPerson} })' +
            ' MATCH (tag:Tag { name: {name} })' +
            ' CREATE (person)<-[:LEARNED_BY]-(learning:Learning)-[:LEARNED_ABOUT]->(tag)' +
            ' CREATE (learning)-[:LEARNED_FROM]->(otherPerson)' +
            ' SET learning.reported = timestamp() '
          statements.push({
            'statement': createLearningQueryEmail,
            'parameters': {otherPerson: emails[i], email: message.source, name: tags[j]}
          })
        }
      }
      for (let i = 0; i < twitterHandles.length; i++) {
        for (let j = 0; j < tags.length; j++) {
          const createLearningQueryTwitter = 'MATCH (person:Person { email: {email} })' +
            ' MATCH (twitter:Twitter { handle: {handle} })' +
            ' MATCH (tag:Tag { name: {name} })' +
            ' CREATE (person)<-[:LEARNED_BY]-(learning:Learning)-[:LEARNED_ABOUT]->(tag)' +
            ' CREATE (learning)-[:LEARNED_FROM]->(twitter)' +
            ' SET learning.reported = timestamp() '
          statements.push({
            'statement': createLearningQueryTwitter,
            'parameters': {handle: twitterHandles[i], email: message.source, name: tags[j]}
          })
        }
      }
      for (let i = 0; i < urls.length; i++) {
        for (let j = 0; j < tags.length; j++) {
          const createLearningQueryWebsite = 'MATCH (person:Person { email: {email} })' +
            ' MATCH (website:Website { url: {url} })' +
            ' MATCH (tag:Tag { name: {name} })' +
            ' CREATE (person)<-[:LEARNED_BY]-(learning:Learning)-[:LEARNED_ABOUT]->(tag)' +
            ' CREATE (learning)-[:LEARNED_FROM]->(website)' +
            ' SET learning.reported = timestamp() '
          statements.push({
            'statement': createLearningQueryWebsite,
            'parameters': {url: urls[i], email: message.source, name: tags[j]}
          })
        }
      }
      break
    case 'I_WORKED_ON':
      const projectName = 'test-project'
      const createProjectQuery = 'MATCH (person:Person { email: {email} })' +
        ' MERGE (project:Project { name: {name} })' +
        ' CREATE UNIQUE (person)-[:I_WORKED_ON]->(project)'
      statements.push({
        'statement': createProjectQuery,
        'parameters': {email: message.source, name: projectName}
      })

      for (let j = 0; j < tags.length; j++) {
        const createProjectQuery = 'MATCH (project:Project { name: {projectName} })' +
          ' MATCH (tag:Tag { name: {name} })' +
          ' CREATE UNIQUE (project)-[:USED]->(tag)'
        statements.push({
          'statement': createProjectQuery,
          'parameters': {projectName: projectName, name: tags[j]}
        })
      }
      break
    case 'FORGET':
      for (let i = 0; i < tags.length; i++) {
        const endRelationshipQuery = 'MATCH (:Person { email: {email} })-[r]-(:Tag { name: {name} }) delete r '
        statements.push({
          'statement': endRelationshipQuery,
          'parameters': {name: tags[i], email: message.source}
        })
      }
      break
    default:
      console.log('Invalid type: ' + type)
  }
  request.post({
    uri: httpUrlForTransaction,
    json: {statements: statements}
  },
    function (err, resp) {
      if (err) {
        console.log(err)
        callback(err, null)
      } else {
        if (resp.body.errors.length > 0) {
          console.log(JSON.stringify(resp.body.errors))
          callback(resp.body.errors, null)
        } else {
          const unknownTags = []
          for (let j = 0; j < resp.body.results.length; j++) {
            const result = (resp.body.results[j])
            if (result.data.length > 0) {
              for (let k = 0; k < result.data.length; k++) {
                const data = result.data[k]
                if (!data.row[1]) {
                  unknownTags.push(data.row[0])
                }
              }
            }
          }
          let output = {}
          output.confirmationAddress = message.source
          output.unknownTagCount = unknownTags.length
          if (unknownTags.length > 0) {
            output.unknownTags = unknownTags
          }
          callback(null, output)
        }
      }
    }
  )

  function formatTwitterHandles (rawTwitterHandles) {
    var twitterHandles = []
    for (let i = 0; i < rawTwitterHandles.length; i++) {
      const rawTwitterHandle = rawTwitterHandles[i]
      const twitterHandle = rawTwitterHandle.replace('@', '').toLowerCase()
      twitterHandles.push(twitterHandle)
    }
    return twitterHandles
  }
}
