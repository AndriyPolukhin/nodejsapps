/*
* REQUEST HANDLERS
*
*/

// 1. Dependencies
const _data = require('./data');
const helpers = require('./helpers');
// 2. Handlers Container

const handlers = {};

// 3. Ping Handler
handlers.ping = function (data, callback) {
  callback(406, { 'ping': 'ping ping ping' });
};

// 4. Not found handler
handlers.notFound = function (data, callback) {
  callback(404);
};



// 5. Users handler
handlers.users = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

// 5.1 Container for the users sub methods
handlers._users = {};

// 5.2  Users POST
// @Required data: firstName, lastName, phone, password, tosAgreement
// @Optional data: none
handlers._users.post = (data, callback) => {
  // 5.2.1 Check if all the required fields are filled out
  const firstName = typeof (data.payload.firstName) == 'string'
    && data.payload.firstName.trim().length > 0 ?
    data.payload.firstName.trim() : false;
  const lastName = typeof (data.payload.lastName) == 'string'
    && data.payload.lastName.trim().length > 0 ?
    data.payload.lastName.trim() : false;
  const phone = typeof (data.payload.phone) == 'string'
    && data.payload.phone.trim().length == 10 ?
    data.payload.phone.trim() : false;
  const password = typeof (data.payload.password) == 'string'
    && data.payload.password.trim().length > 0 ?
    data.payload.password.trim() : false;
  const tosAgreement = typeof (data.payload.tosAgreement) == 'boolean'
    && data.payload.tosAgreement == true ? true : false;
  // 5.2.2. Check if all of the data is present before continue
  if (firstName, lastName, phone, password, tosAgreement) {
    // 5.2.3 Make sure that the user already exist (based on the phone number included in user file)
    _data.read('users', phone, (err, data) => {
      if (err) {
        // 5.2.4 Password should be hashed
        const hashedPassword = helpers.hash(password);
        // 5.2.5 Create the user object
        if (hashedPassword) {
          const userObject = {
            'firstName': firstName,
            'lastName': lastName,
            'phone': phone,
            'hashedPassword': hashedPassword,
            'tosAgreement': true
          };

          // 5.2.6 Store the user
          _data.create('users', phone, userObject, (err) => {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { 'Error': 'Colud not create the new user' });
            }
          });
        } else {
          callback(500, { 'Error': 'Could not hash the user\'s password' });
        }
      } else {
        // 5.2.3-1 User exist
        callback(400, { 'Error': 'A user with that phone number already exist' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing Required fields' });
  }
};


// 5.3 Users GET
// @Required data: phone
// @Optional data: none
// @TODO : Only let authenticated user access their object, don't let them access anyone else's
handlers._users.get = (data, callback) => {
  // 5.3.1. Check that the phone number is valid
  const phone = typeof (data.queryStringObject.phone) == 'string'
    && data.queryStringObject.phone.trim().length == 10 ?
    data.queryStringObject.phone.trim() : false;

  if (phone) {
    // 5.3.1-1 GET THE TOKEN FROM THE HEADERS
    const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
    // 5.3.1-2 Verify that the given token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        // Look up the user
        _data.read('users', phone, (err, data) => {
          if (!err && data) {
            // 5.3.2. Remove the hashed password from the user object before returning to the requester
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403, { 'Error': 'Missing required token and header or token is invalid' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing Required field' });
  }
};
// 5.4 Users PUT
// @Required data: phone
// @Optional data: firstName, lastName, password (at least  one must be specified)
// @TODO Only authenticated users can update their user object, and not anyone else's
handlers._users.put = (data, callback) => {
  // 5.4.1 Check for the required field
  const phone = typeof (data.payload.phone) == 'string'
    && data.payload.phone.trim().length == 10 ?
    data.payload.phone.trim() : false;

  // 5.4.2. Check for optional fields
  const firstName = typeof (data.payload.firstName) == 'string'
    && data.payload.firstName.trim().length > 0 ?
    data.payload.firstName.trim() : false;
  const lastName = typeof (data.payload.lastName) == 'string'
    && data.payload.lastName.trim().length > 0 ?
    data.payload.lastName.trim() : false;
  const password = typeof (data.payload.password) == 'string'
    && data.payload.password.trim() > 0 ?
    data.payload.password.trim() : false;

  // 5.4.3 Error if the phone is invalid
  if (phone) {
    // 5.4.3-1 Error if there's nothing to update
    if (firstName || lastName || password) {
      // Verify token
      const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
      handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
        if (tokenIsValid) {
          // 5.4.3-2 Look up the user
          _data.read('users', phone, (err, userData) => {
            if (!err && userData) {
              // 5.4.3-3 Update the fields necessary
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.hashedPassword = helpers.hash(password);
              }
              // 5.4.3.4 Store the new updates
              _data.update('users', phone, userData, (err) => {
                if (!err) {
                  callback(200);
                } else {
                  console.log(err);
                  callback(500, { 'Erorr': 'Could not update the user' });
                }
              });
            } else {
              callback(400, { 'Error': 'The specified usre doesn\'t exist' });
            }
          });
        } else {
          callback(403, { 'Error': 'Missing required token in header, or token is expired ' });
        }
      });

    } else {
      callback(400, { 'Error': 'Missing fields to update' });
    }
  } else {
    callback(400, { 'Error': 'Missing Required Field' });
  }

};
// 5.5 Users DELETE
// @Required data: phone
// @Optional data: none
// @TODO Only authenticated users can update their user object, and not anyone else's
// @TODO Delete any other files associated with the user
handlers._users.delete = (data, callback) => {
  // 5.5.1 Check that the user exists
  const phone = typeof (data.queryStringObject.phone) == 'string'
    && data.queryStringObject.phone.trim().length == 10 ?
    data.queryStringObject.phone.trim() : false;

  if (phone) {
    // Token Validation
    const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
    handlers._token.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        // 5.5.2 Look up the user
        _data.read('users', phone, (err, data) => {
          if (!err && data) {
            _data.delete('users', phone, (err) => {
              if (!err) {
                callback(200);
              } else {
                callback(500, { 'Error': 'Could not delete the specified user' });
              }
            });
          } else {
            callback(400, { 'Error': 'Could not find the specified user' });
          }
        });
      } else {
        callback(403, { 'Error': 'Missing required token in header, or token is expired ' });
      }
    })

  } else {
    callback(400, { 'Error': 'Missing required filed' });
  }
};

// 6. TOKENS HANDLERS
handlers.tokens = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

// 6.1 Container for the tokens sub methods
handlers._tokens = {};
// 6.2. TOKEN POST
// @Requited data: phone, password
// @Optional data: none
handlers._tokens.post = (data, callback) => {
  const phone = typeof (data.payload.phone) == 'string' &&
    data.payload.phone.trim().length == 10 ?
    data.payload.phone.trim() : false;
  const password = typeof (data.payload.password) == 'string' &&
    data.payload.password.trim().length > 0 ?
    data.payload.password.trim() : false;
  if (phone && password) {
    // 6.2.1 Look up the user who matches that phone number
    _data.read('users', phone, (err, userData) => {
      if (!err && userData) {
        // 6.2.2. Hash the send password and compare it to the password sotred in the user object
        const hashedPassword = helpers.hash(password);
        if (hashedPassword == userData.hashedPassword) {
          // 6.2.3 If valid createa a new token with a random name and set the exparation date one hour in the future
          // Random string of letter as id for the token
          const tokenId = helpers.createRandomString(20);
          // Expires
          const expires = Date.now() + 1000 * 60 * 60;
          // Token Object
          const tokenObject = {
            'phone': phone,
            'id': tokenId,
            'expires': expires
          };

          // 6.2.4. Store the token
          _data.create('tokens', tokenId, tokenObject, (err) => {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, { 'Error': 'Could not create the new token' });
            }
          });
        } else {
          callback(400, { 'Error': 'Password did not match the specified users stored password' });
        }
      } else {
        callback(400, { 'Error': 'Could not find the specified usre' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing Required Fields' });
  }
};
// 6.3. TOKEN GET
// @Required data: id
// @Optional data: none

handlers._tokens.get = (data, callback) => {
  // 6.3.1. Check that the id is valid
  const id = typeof (data.queryStringObject.id) == 'string' &&
    data.queryStringObject.id.trim().length == 20 ?
    data.queryStringObject.id.trim() : false;
  if (id) {
    // Look up user
    _data.read('tokens', id, (err, tokenData) => {
      // Remove the hashed password from the user object before returning it.
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required field, or field invalid' });
  }
};



// 6.4 TOKEN PUT
// @Required data: id, extend
// @Optional data: none
handlers._tokens.put = (data, callback) => {
  const id = typeof (data.payload.id) == 'string' &&
    data.payload.id.trim().length == 20 ?
    data.payload.id.trim() : false;
  const extend = typeof (data.payload.extend) == 'boolean' &&
    data.payload.extend == true ? true : false;
  if (id && extend) {
    // 6.4.1. Look up the token
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        // 6.4.2. Check if the token is not expired yet
        if (tokenData.expires > Date.now()) {
          // 6.4.3. Set the exparation from hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60;
          // 6.4.4. Store the new updates
          _data.update('tokens', id, tokenData, (err) => {
            if (!err) {
              callback(200);
            } else {
              callback(500, { 'Error': 'Could not update the token\'s exparation' });
            }
          })
        } else {
          callback(400, { 'Error': 'The token has already expired and cannot be extended' });
        }

      } else {
        callback(400, { 'Error': 'Specified token do not exist' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing Required Filed(s) or field(s) are invalid' });
  }
};
// 6.5 TOKEN DELETE
// @Required data: id
// @Optional data: none
handlers._tokens.delete = (data, callback) => {
  // 6.5.1 Check that id is valid
  const id = typeof (data.queryStringObject.id) == 'string' &&
    data.queryStringObject.id.trim().length == 20 ?
    data.queryStringObject.id.trim() : false;
  if (id) {
    // Look up the token
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        _data.delete('tokens', id, (err) => {
          if (!err) {
            callback(200);
          } else {
            callback(500, { 'Error': 'Could not delete the specified token' });
          }
        });
      } else {
        callback(400, { 'Error': 'Could not find the specified token' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing Required Fields' });
  }
};


// 7. VERIFICATION FUNCTION
// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = (id, phone, callback) => {
  // 7.1 Look up the token
  _data.read('tokens', id, (err, tokenData) => {
    if (!err && tokenData) {
      // 7.2 Check that the token is for the given user and has not expiried
      if (tokenData.phone == phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  })
};



// Export handlers
module.exports = handlers;