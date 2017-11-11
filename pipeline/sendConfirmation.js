const aws = require('aws-sdk')
const ses = new aws.SES()

module.exports.sendConfirmation = (event, context, callback) => {
  const message = event
  const eParams = {
    Destination: {
      ToAddresses: [message.email]
    },
    Message: {
      Body: {
        Text: {
          Data: 'Thank you for your Skills Mapper update.\n\nTo see you current profile please go to: http://profile.skillsmapper.org/?email=' + message.email + '\n\n' +
          'You can add to your profile by emailing tags in the subject line to:\n\n' +
          'i.am.interested.in@skillsmapper.org\n\n' +
          'i.am.using@skillsmapper.org\n\n' +
          'i.am.learning@skillsmapper.org\n\n' +
          'i.have.used@skillsmapper.org\n\n' +
          'If you make a mistake you can remove a tag by emailing:\n\n' +
          'forget@skillsmapper.org'
        }
      },
      Subject: {
        Data: 'Skills Mapper profile update received'
      }
    },
    Source: 'noreply@skillsmapper.org'
  }
  ses.sendEmail(eParams, function (err, data) {
    if (err) {
      callback(err, null)
    } else {
      const output = {'emailSentTo': message.email}
      callback(null, output)
    }
  })
}
