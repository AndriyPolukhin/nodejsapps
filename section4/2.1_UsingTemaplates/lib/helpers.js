/*
* various helper functions for use
*
*/
// 0. DEPENDENCIES
const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');
const path = require('path');
const fs = require('fs');


// 1. Container for helpers
const helpers = {};

// 2. Hash the password with SHA256
helpers.hash = (str) => {
  if (typeof (str) == 'string' && str.length > 0) {
    const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

// 3. Takes a string and return an JSON object
helpers.parseJsonToObject = (str) => {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (e) {
    return {};
  }
};

// 4. Create a random string of alphanumberic characters of a given length
helpers.createRandomString = (strLength) => {
  strLength = typeof (strLength) == 'number' &&
    strLength > 0 ? strLength : false;
  if (strLength) {
    // Define the possible characters that can go into a string
    const possibleCharacters = 'abcdefghijklmopqrstuvwxyz0123456789';
    // Start a stirng
    let str = '';
    for (let i = 1; i <= strLength; i++) {
      // Get the random character from the possible characters string
      const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
      // Append the char to a string
      str += randomCharacter;
    }
    return str;
  } else {
    return false;
  }
}

// 5. Send the SMS message via Twilio
helpers.sendTwilioSms = (phone, msg, callback) => {
  // 5.1 Validate the parameters
  phone = typeof (phone) == 'string' &&
    phone.trim().length == 10 ?
    phone.trim() : false;
  msg = typeof (msg) == 'string' &&
    msg.trim().length > 0 &&
    msg.trim().length <= 1600 ?
    msg.trim() : false;
  if (phone && msg) {
    // 5.2 Configure the request payload
    const payload = {
      'From': config.twilio.fromPhone,
      'To': '+1' + phone,
      'Body': msg
    };
    // 5.3 Stringify the payload
    const stringPayload = querystring.stringify(payload);
    // 5.4 Configure the request details
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
    // 5.5 Create a request object
    const req = https.request(requestDetails, (res) => {
      // 5.5.1 Grab the status of the send request
      const status = res.statusCode;
      // 5.5.2 Callback successfully if the request went through
      if (status == 200 || status == 201) {
        callback(false);
      } else {
        callback('Status code returned: ' + status);
      }
    });
    // 5.6 Bind to the error event so it doesn't get trown
    req.on('error', (e) => {
      callback(e);
    });

    // 5.7 Add the payload
    req.write(stringPayload);
    // 5.8 End the request
    req.end();

  } else {
    callback('Given the parameters were missing or invalid');
  }
};


// 6. Get the String Content of the TEMPLATE
helpers.getTemplate = (templateName, data, callback) => {
  // 6.1 Sanity Check for the template
  templateName = typeof (templateName) == 'string' && templateName.length > 0 ? templateName : false;
  data = typeof (data) == 'object' && data !== null ? data : {};
  if (templateName) {
    // 6.2 Define the directory
    const templatesDir = path.join(__dirname, '/../templates/');
    // 6.3 Read the file
    fs.readFile(templatesDir + templateName + '.html', 'utf-8', (err, str) => {
      if (!err && str && str.length > 0) {
        // 6.4 Do the interpolation on the string
        let finalString = helpers.interpolate(str, data);
        callback(false, finalString);
      } else {
        callback('No template could be found');
      }
    });
  } else {
    callback('A valid template name was not specified');
  }
};

// 7. Add the universal header and footer to a string and pass the provided data object to the header and footer for interpolation
helpers.addUniversalTemplates = (str, data, callback) => {
  // 7.1 Sanity check the type
  str = typeof (str) == 'string' && str.length > 0 ? str : '';
  data = typeof (data) == 'object' && data !== null ? data : {};
  // 7.2 Get the header
  helpers.getTemplate('_header', data, (err, headerString) => {
    if (!err && headerString) {
      // 7.3 Get the footer
      helpers.getTemplate('_footer', data, (err, footerString) => {
        if (!err && footerString) {
          // 7.4 Add together 3 strings: header + str + footer
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


// 8. Take a given stirng and a data object and find/replace all the keys within it
helpers.interpolate = (str, data) => {
  // 8.1 Sanity check the type
  str = typeof (str) == 'string' && str.length > 0 ? str : '';
  data = typeof (data) == 'object' && data !== null ? data : {};
  // 8.2 Add the template globals to the data object
  // Append the key name with global
  for (let keyName in config.templateGlobals) {
    if (config.templateGlobals.hasOwnProperty(keyName)) {
      data['global.' + keyName] = config.templateGlobals[keyName];
    }
  }
  // 8.3 For each key in the data object we want to insert it's value into the string at the corresponding placeholder
  for (let key in data) {
    if (data.hasOwnProperty(key) && typeof (data[key]) == 'string') {
      let replace = data[key];
      let find = '{' + key + '}';
      str = str.replace(find, replace);
    }
  }
  return str;
};

















// Export
module.exports = helpers;