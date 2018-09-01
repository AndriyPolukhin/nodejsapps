/*
* Helpers for various task
*
*/

// 1. Dependencies
const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');

// 2. Container
const helpers = {};

// 3. Create a SHA hash
helpers.hash = (str) => {
  if (typeof (str) == 'string' && str.length > 0) {
    const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
}

// 4. Takes a stirng and return an object or false
// Parse the json string to an object in all cases without throwing
helpers.parseJsonToObject = (str) => {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (e) {
    return {};
  }
}


// 5. Create a string of random alphanumeric characters of a given length
helpers.createRandomString = (strLength) => {
  strLength = typeof (strLength) == 'number' && strLength > 0 ? strLength : false;
  if (strLength) {
    // 5.1 Define all the possible characters that can go into a string
    const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    // Start the final string
    let str = '';
    for (i = 1; i <= strLength; i++) {
      // 5.2 Get the random character from the possibleCharacters string
      let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
      // 5.3 Append this character to the final string
      str += randomCharacter;
    }
    // 5.4 Return string
    return str;
  } else {
    return false;
  }
}

// 6. Send on SMS message via Twillio
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
      'To': '+38' + phone,
      'Body': msg
    };
    // 6.3 Stringify the payload
    const stringPayload = querystring.stringify(payload);
    // 6.4 Configure the request details
    const requestDetails = {
      'protocol': 'https:',
      'hostname': 'api.twilio.com',
      'method': 'POST',
      'path': '/2010-04-01/Accounts/' +
        config.twilio.accountSid +
        '/Messages.json',
      'auth': config.twilio.accoutSid +
        ':' + config.twilio.authToken,
      'headers': {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
      }
    };
    // 6.5 Instantiate/Create the request object
    const req = https.request(requestDetails, (res) => {
      // 6.5.1 Grab the status of the send request
      const status = res.statusCode;
      // 6.5.2 Callback successfully if the request went throught
      if (status == 200 || status == 201) {
        callback(false);
      } else {
        callback(`Status code returnded was ${status}`);
      }
    });
    // 6.5.3 Bind to the error event, so it doesn't get thrown
    req.on('error', (e) => {
      callback(e);
    });
    // 6.5.4 Add the payload to the request
    req.write(stringPayload);
    // 6.5.5 End the request
    req.end();
  } else {
    callback('Given parameteers missing or invalid');
  }
}

// Export
module.exports = helpers;

