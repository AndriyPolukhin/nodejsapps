/*
* Helpers for various task
*
*/

// 1. Dependencies
const crypto = require('crypto');
const config = require('./config');


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


// Export
module.exports = helpers;

