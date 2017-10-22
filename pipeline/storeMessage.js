const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'})

module.exports.storeMessage = (event, context, callback) => {
  const messageText = event.Records[0].Sns.Message
  const message = JSON.parse(messageText)
  const datetime = new Date().getTime().toString()
  console.log(datetime)
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
    }
  })
}
