/*
* Helpers for various tasks
*
*/

// 1. Dependencies
const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');

// 2. Container
const helpers = {};

// 3. Creat a SHA hash
helpers.hash = (str) => {
  if (typeof (str) == 'string' && str.length > 0) {
    const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

// 4. Take a string and return an object or false
// Parse the json string to an object in all cases withour trowing
helpers.parseJsonToObject = (str) => {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (e) {
    return {};
  }
}

// 5. Creata a string of random alphanumeric characters of a given length
helpers.createRandomString = (strLength) => {
  // 5.1 Validate the string type
  strLength = typeof (strLength) == 'number' &&
    strLength > 0 ? strLength : false;
  if (strLength) {
    // 5.2 Define all possible alphanumberic characters that can go into the string
    const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    // 5.3 Create the final string
    let str = '';
    for (i = 1; i <= strLength; i++) {
      let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
      str += randomCharacter;
    }
    // 5.4 Return the created string
    return str;
  } else {
    return false;
  }
};

// 6. Send on SMS message via Twilio
helpers.sendTwilioSms = (phone, msg, callback) => {
  // 6.1 Validate the parameters
  phone = typeof (phone) == 'string' &&
    phone.trim().length == 10 ?
    phone.trim() : false;
  msg = typeof (msg) == 'string' &&
    msg.trim().length > 0 &&
    msg.trim().length <= 1600 ?
    msg.trim() : false;
  if (phone && msg) {
    // 6.2 Configure the request payload
    const payload = {
      'From': config.twilio.fromPhone,
      'To': '1' + phone,
      'Body': msg
    };
    // 6.3 Stringify the payload
    const stringPayload = querystring.stringify(payload);
    // 6.4 Configyre the request details
    const requrestDetails = {
      'protocol': 'https',
      'hostname': 'api.twilio.com',
      'method': 'POST',
      'path': '/2010-04-01/Accounts/' +
        config.twilio.accountSid +
        '/Messages.json',
      'auth': config.twilio.accountSid +
        ':' + config.twilio.authToken,
      'headers': {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
      }
    };
    // 6.5 Intantiate/Create the request object
    const req = https.request(requestDetails, (res) => {
      // 6.5.1. Grab the status of the send request
      const status = res.statusCode;
      // 6.5.2 Callback successfully if the request went throught
      if (status == 200 || status == 201) {
        callback(false);
      } else {
        callback(`Status code returned was ${status}`);
      }
    });
    // 6.5.3 Bind to the error event, so ti doesn't get thrown
    req.on('error', (e) => {
      callback(e);
    });
    // 6.5.4 Add the payload to the request
    req.write(stringPayload);
    // 6.5.5 End the request
    req.end();
  } else {
    callback(`Some of the given parameters missing or invalid`);
  }
}




// Export
module.exports = helpers;