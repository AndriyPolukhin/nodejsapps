/*
*Various helpers function for the in app use
*
*/

// 1. Dependencies
const config = require('./config');
const https = require('https');

const fs = require('fs');
const path = require('path');

const querystring = require('querystring');
const crypto = require('crypto');

// 2. CONTAINER: for the helper functions
const helpers = {};

// 3. CRYPTO: Hash the password with SHA256
helpers.hash = (str) => {
  if (typeof (str) == 'string' && str.length > 0) {
    const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};
// 4. JSON OBJECT: Take a string and return an JSON object
helpers.parseJsonToObject = (str) => {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (e) {
    return {};
  }
};
// 5. RANDOM STRING: Create a random string of alphanumeric characters of a given length
helpers.createRandomString = (strLength) => {
  // 5.1 Check the typeof str and it's length
  strLength = typeof (strLength) == 'number' &&
    strLength > 0 ? strLength : false;
  // 5.2  Validate the str to proceed
  if (strLength) {
    // 5.3 Define possible charactes that can be in a string
    const possibleCharacters = 'abcdefghijklmopqrstuvwxyz0123456789';
    // 5.4 String Creation
    let str = '';
    for (let i = 1; i <= strLength; i++) {
      // 5.4.1 Get the random character from the possibleBharacters
      const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
      // 5.4.2 Append the random character to a string
      str += randomCharacter;
    }
    return str;
  } else {
    return false;
  }
};
// 6. TWILIO: Send the SMS message via Twilio
helpers.sendTwilioSms = (phone, msg, callback) => {
  // 6.1 Validate the typeof parameters
  phone = typeof (phone) == 'string' &&
    phone.trim().length == 10 ?
    phone.trim() : false;
  msg = typeof (msg) == 'string' &&
    msg.trim().length > 0 &&
    msg.trim().length <= 1600 ?
    msg.trim() : false;
  if (phone && msg) {
    // 6.2 Configure the payload
    const payload = {
      'From': config.twilio.fromPhone,
      'To': '+1' + phone,
      'Body': msg
    };
    // 6.3 Stringify the payload
    const stringPayload = querystring.stringify(payload);
    // 6.4 Configure the request details
    const requestDetails = {
      'protocol': 'https:',
      'hostname': 'api.twilio.com',
      'method': 'POST',
      'path': '/2010-04-01/Accounts/' + config.twilio.accountSid + '/Messages.json',
      'auth': config.twilio.accountSid + ':' + config.twilio.authToken,
      'headers': {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
      }
    };
    // 6.5 Create a request object
    const req = https.request(requestDetails, (res) => {
      // 6.5.1 Get the status of teh send request
      const status = res.statusCode;
      // 6.5.2 Callback successfully if the request went through
      if (status == 200 || status == 201) {
        callback(false);
      } else {
        callback(`Status code returned: ${status}`);
      }
    });
    // 6.6 Bind to the error event, so it doesn't get throuwn
    req.on('error', (e) => {
      callback(e);
    });
    // 6.7 Add the payload
    req.write(stringPayload);
    // 6.8 END THE REQUEST
    req.end();
  } else {
    callback(`Required parameters are invalid, or missing`);
  }
};
// 7. FETCH THE TEMPLATE: Get the String Content of the TEMPLATE
helpers.getTemplate = (templateName, data, callback) => {
  // 7.1 Check the typeof the provided data
  templateName = typeof (templateName) == 'string'
    && templateName.length > 0 ? templateName : false;
  data = typeof (data) == 'object' &&
    data !== null ? data : {};
  if (templateName) {
    // 7.2 Fetch the template from the folder
    const templatesDir = path.join(__dirname, '/../templates/');
    fs.readFile(templatesDir + templateName + '.html', 'utf-8', (err, str) => {
      if (!err && str && str.length > 0) {
        // 7.3 Interpolate the string before returning
        let finalString = helpers.interpolate(str, data);
        callback(false, finalString);
      } else {
        callback('No template could be found');
      }
    });
  } else {
    callback('A valid template name was not provided');
  }
};
// 8. UNIVERSAL TEMPLATES: Add the universal header and footer to a string and pass the provided data object to the header and footer for interpolation
helpers.addUniversalTemplates = (str, data, callback) => {
  // 8.1 Check the data type
  str = typeof (str) == 'string' && str.length > 0 ? str : '';
  data = typeof (data) == 'object' && data !== null ? data : {};
  // 8.2 Fetch the header template
  helpers.getTemplate('_header', data, (err, headerString) => {
    if (!err && headerString) {
      // 8.3 Fetch the footer template
      helpers.getTemplate('_footer', data, (err, footerString) => {
        if (!err && footerString) {
          // 8.4 Add Strings together: header + str + footer
          const fullString = headerString + str + footerString;
          callback(false, fullString);
        } else {
          callback('Could not find the footer template');
        }
      });
    } else {
      callback('Could not find the header template');
    }
  });
}
// 9. INTERPOLATE: Take a given string and a data object and find/replace all the keys within it
helpers.interpolate = (str, data) => {
  // 9.1 Check the typeof data
  str = typeof (str) == 'string' && str.length > 0 ? str : '';
  data = typeof (data) == 'object' && data !== null ? data : {};
  // 9.2 Append the template keys to the data object
  for (let keyName in config.templateGlobals) {
    if (config.templateGlobals.hasOwnProperty(keyName)) {
      data['global.' + keyName] = config.templateGlobals[keyName];
    }
  }
  // 9.3 INSERT THE data key value into the string
  for (let key in data) {
    if (data.hasOwnProperty(key) && typeof (data[key]) == 'string') {
      let replace = data[key];
      let find = '{' + key + '}';
      str = str.replace(find, replace);
    }
  }
  return str;
};
// 10. GET STATIC ASSETS: Get the contents of the static/public assets
helpers.getStaticAsset = (fileName, callback) => {
  // 10.1 Check the type of the data
  fileName = typeof (fileName) == 'string' &&
    fileName.length > 0 ? fileName : false;
  if (fileName) {
    // 10.2 Fetch the assets
    const publicDir = path.join(__dirname, '/../public/');
    fs.readFile(publicDir + fileName, (err, data) => {
      if (!err && data) {
        callback(false, data);
      } else {
        callback('No file could be found');
      }
    });
  } else {
    callback('No file could be found');
  }
};
// 11. Export the helpers
module.exports = helpers;
