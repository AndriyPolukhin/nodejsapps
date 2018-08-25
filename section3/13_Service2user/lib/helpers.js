/*
* Helperes for various tasks
*
*/

// 1. Dependencies
const config = require('./config');
const crypto = require('crypto');

// 2. Container for helpres
const helpers = {};

// 2.1 Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function (str) {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (e) {
    return {};
  }
};

// 2.2 Createa a SHA256 hash
helpers.hash = (str) => {
  if (typeof (str) == 'string' && str.length > 0) {
    const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
}




// Export the helpres
module.exports = helpers;