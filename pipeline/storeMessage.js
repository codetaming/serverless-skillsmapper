const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'})

module.exports.storeMessage = (event, context, callback) => {
  const message = event
  const datetime = new Date().getTime().toString()
  dynamodb.putItem({
    'TableName': process.env.MESSAGES_RECEIVED_TABLE,
    'Item': {
      'id': {'S': message.id},
      'timestamp': {'S': datetime},
      'source': {'S': message.source},
      'type': {'S': message.type},
      'tags': {'S': message.tags}
    }
  }, function (err, data) {
    if (err) {
      console.log(err)
    } else {
      console.log('put successful')
      return JSON.stringify(event)
    }
  })
}
