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

// Export
module.exports = helpers;