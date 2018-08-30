/*
* Helpers for various tasks
*
*/

// 1. Dependencies
const crypto = require('crypto');
const config = require('./config');

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
}

// 4. Takes a string and return an object or false
// Pare the json string to an object in all cases withour throwing
helpers.parseJsonToObject = (str) => {
  try {
    const obj = JSON.parse(obj);
    return obj;
  } catch (e) {
    return {};
  }
}


// 5. Create a string of random alphanumeric characters of a give length
helpers.createRandomString = (strLength) => {
  strLength = typeof (strLength) == 'number' &&
    strLength > 0 ? strLength : false;
  if (strLength) {
    // 5.1. Define all the possible characters that can go into a string
    const possibleCharacters = 'abcdefghijklmopqrstuvwxyz0123456789';
    // Start the final string
    let str = '';
    for (i = 1; i <= strLength; i++) {
      // 5.2. Get the random character from the possibleCharacters string
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

// 6. Exports
module.exports = helpers;