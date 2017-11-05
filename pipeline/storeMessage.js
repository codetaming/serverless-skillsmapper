const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'})

module.exports.storeMessage = (event, context, callback) => {
  var message = event
  message.datetime = new Date().getTime().toString()
  dynamodb.putItem({
    'TableName': process.env.MESSAGES_RECEIVED_TABLE,
    'Item': {
      'id': {'S': message.id},
      'timestamp': {'S': message.datetime},
      'source': {'S': message.source},
      'type': {'S': message.type},
      'tags': {'S': message.tags}
    }
  }, function (err) {
    if (err) {
      let result = 'fail'
      console.log(result)
      callback(err, result)
    } else {
      let result = 'success'
      console.log(result)
      callback(null, result)
    }
  })
}
