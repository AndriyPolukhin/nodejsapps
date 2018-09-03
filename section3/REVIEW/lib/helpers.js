/*
* various helper functions for use
*
*/
// 0. DEPENDENCIES
const crypto = require('crypto');
const config = require('./config');


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

// Export
module.exports = helpers;