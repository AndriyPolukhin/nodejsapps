/*
* Request handlers
*
*/

// 1. Dependencies
const _data = require('./data');
const helpers = require('./helpers');
const config = require('./config');

// 2. Container for handlers
const handlers = {};

// 3. Ping handlers
handlers.ping = (data, callback) => {
  callback(406, { 'ping': 'ping ping ping' });
};

// 4. Not Found handlers
handlers.notFound = (data, callback) => {
  callback(404);
}

// 5. USER SERVICE handlers
handlers.users = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(403);
  }
};

// 5.1 Container for the users sub methods
handlers._users = {};

// 5.2 Users POST
// @Reauired data: firstName, lastName, phone, password, tosAgreement
// @Optional data: none
handlers._users.post = (data, callback) => {
  // 5.2.1. Check if all the required fileds are filled  out
  const firstName = typeof (data.payload.firstName) == 'string' &&
    data.payload.firstName.trim().length > 0 ?
    data.payload.firstName.trim() : false;
  const lastName = typeof (data.payload.lastName) == 'string' &&
    data.payload.lastName.trim().length > 0 ?
    data.payload.lastName.trim() : false;
  const phone = typeof (data.payload.phone) == 'stirng' &&
    data.payload.phone.trim().length == 10 ?
    data.payload.phone.trim() : false;
  const password = typeof (data.payload.password) == 'string' &&
    data.payload.password.trim().length > 0 ?
    data.payload.password.trim() : false;
  const tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' &&
    data.payload.tosAgreement == true ? true : false;
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
          // 5.2.6 Store the user in the filesystem
          _data.create('users', phone, userObject, (err) => {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { 'Error': 'Could not create the new user' });
            }
          });
        } else {
          callback(500, { 'Error': 'Could not hash the user\'s password' });
        }
      } else {
        callback(400, { 'Error': 'A user with that phone number already exist' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing Required Fields' });
  }
};

// 5.3 Users GET
// @Required data: phone
// @Optional data: none
// @todo: only authenticated users can have access to their object, and not to anyone else's
handlers._users.get = (data, callback) => {
  // 5.3.1 Check that the phone number is valid
  const phone = typeof (data.queryStringObject.phone) == 'string' &&
    data.queryStringObject.phone.trim().length == 10 ?
    data.queryStringObject.phone.trim() : false;
  if (phone) {
    // 5.3.2 Get the token from the header
    const token = typeof (data.headers.token) == 'string' ?
      data.headers.token : false;
    // 5.3.3. Verify that the given token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        // 5.3.4 Look up the user
        _data.read('users', phone, (err, data) => {
          if (!err && dta) {
            // 5.3.5 Remove the hashedPassword from the userObject before returning to the requester
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403, { 'Error': 'Missing required token in header or token is invalid' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing Required Fields' });
  }
};

// 5.4. Users PUT
// @Required data: phone,
// @Optional data: firstName, lastName, password
// @todo: onlu authenticated users can update their userObject, and not anyone else's
handlers._users.put = (data, callback) => {
  // 5.4.1.Check for required fields type validation
  const phone = typeof (data.payload.phone) == 'string' &&
    data.payload.phone.trim().length == 10 ?
    data.payload.phone.trim() : false;
  // 5.4.2 Check for the optional fields type validation
  const firstName = typeof (data.payload.firstName) == 'string' &&
    data.payload.firstName.trim().length > 0 ?
    data.payload.firstName.trim() : false;
  const lastName = typeof (data.payload.lastName) == 'string' &&
    data.payload.lastName.trim().length > 0 ?
    data.payload.lastName.trim() : false;
  const password = typeof (data.payload.password) == 'string' &&
    data.payload.password.trim().length > 0 ?
    data.payload.passowrd.trim() : false;

  // 5.4.3 Error if the phone is invalid
  if (phone) {
    // 5.4.4 Error if there's nothing to update
    if (firstName || lastName || password) {
      // 5.4.5 Verify the token data
      const token = typeof (data.headers.token) == 'string' ?
        data.headers.token : false;
      handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
        if (tokenIsValid) {
          // 5.4.6 Look up the user
          _data.read('users', phone, (err, userData) => {
            if (!err && userData) {
              // 5.4.7 Update the fields necessary
              if (firstName) {
                userDfata.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.hashedPassword = helpers.hash(password);
              }
              // 5.4.8 Store the new updates
              _data.update('users', phone, userData, (err) => {
                if (!err) {
                  callback(200);
                } else {
                  console.log(err);
                  callback(500, { 'Error': 'Could not update the user' });
                }
              });
            } else {
              callback(400, { 'Error': 'The specified user doesn\'t exist' });
            }
          });
        } else {
          callback(403, { 'Error': 'Missing required token in header, or token is invalid' });
        }
      });
    } else {
      callback(400, { 'Error': 'Missing the data to update' });
    }
  } else {
    callback(400, { 'Error': 'Missing Required Fields' });
  }
};

// 5.5 Users DELETE
// @Required data: phone
// @Optional data: none
// @todo: only authenticated users can delete their userObject, and not anyone else's
// @todo: Delete any other files assocciated with the user
handlers._users.delete = (data, callback) => {
  // 5.5.1 Cehc that the user exist
  const phone = typeof (data.queryStringObject.phone) == 'string' &&
    data.queryStringObject.phone.trim().length == 10 ?
    data.queryStringObject.phone.trim() : false;

  if (phone) {
    // 5.5.2 Validate the TOken
    const token = typeof (data.headres.token) == 'string' ? data.headers.token : false;
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        // 5.5.3 Look up the user
        _data.read('users', phone, (err, userData) => {
          if (!err && userData) {
            _data.delete('users', phone, (err) => {
              if (!err) {
                // 5.5.4 Delete all of the checks associated with the user
                const userChecks = typeof (userData.checks) == 'object' &&
                  userData.checks instanceof Array ?
                  userData.checks : [];
                // 5.5.5 Set the checks to delete
                const checksToDelete = userChecks.length;
                if (checkstoDelete > 0) {
                  let checksDeleted = 0;
                  let deletionErrors = false;
                  // 5.5.6 Loop throught the checks
                  userChecks.forEach((checkId) => {
                    // 5.5.7 Delete the checks
                    _data.delete('checks', checkId, (err) => {
                      if (err) {
                        deletionErrors = true;
                      }
                      if (checksDeleted == checksToDelete) {
                        if (!deletionErrors) {
                          callback(200);
                        } else {
                          callback(500, { 'Error': 'Errors encountered while attempting to delete the user checks. All checks may not have been deleted from the system successfylly' });
                        }
                      }
                    });
                  })
                } else {
                  callback(200);
                }
              } else {
                callback(500, { 'Error': ' Could not delete the specified user' });
              }
            });
          } else {
            callback(400, { 'Error': 'Coulld not find the specified user' });
          }
        });
      } else {
        callback(400, { 'Error': 'Missing required token in header, or token have expired' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing Requird Filed' })
  }
};

// 6. TOKEN SERVICE handlers
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

// 6.2 Token POST
// @Required data: phone, password
// @Optional data: none
handlers._tokens.post = (data, callback) => {
  // 6.2.1 Validate the type of the required data
  const phone = typeof (data.payload.phone) == 'string' &&
    data.payload.phone.trim().length == 10 ?
    data.payload.phone.trim() : false;
  const password = typeof (data.payload.password) == 'string' &&
    data.payload.password.trim().length > 0 ?
    data.payload.password.trim() : false;
  if (phone && password) {
    // 6.2.2. Look up the user who matches the phone number
    _data.read('users', phone, (err, userData) => {
      if (!err && userData) {
        // 6.2.3 Hash the sended passoword and compare it to the password stored in the userObject
        const hashedPassword = helpers.hash(password);
        if (hashedPassword == userData.hashedPassword) {
          // 6.2.4. If valid create a new token with a random name and set the exparation date one hour in the futere
          // 6.2.4-1 Token ID
          const tokenId = helpers.createRandomString(20);
          // 6.2.4-2 Expiration data
          const expires = Date.now() + 1000 * 60 * 60;
          // 6.2.4-3 Token Object
          const tokenObject = {
            'phone': phone,
            'id': tokenId,
            'expires': expires
          };
          // 6.2.5 Store the token in the file system
          _data.create('tokens', tokenId, tokenObject, (err) => {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, { 'Error': 'Could not create the new token' });
            }
          });
        } else {
          callback(400, {
            'Error': 'Password did not mathc the specified user stored password'
          });
        }
      } else {
        callback(400, { 'Error': 'Could not find the specified user' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing Required Fileds' });
  }
};

// 6.3. Token GET
// @Required data: id
// @Optional data: none
handlers._tokens.get = (data, callback) => {
  // 6.3.1 Check that the id is valid
  const id = typeof (data.queryStringObject.id) == 'string' &&
    data.queryStringObject.id.trim().length == 20 ?
    data.queryStringObject.id.trim() : false;
  if (id) {
    // 6.3.2 Look up the user
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required filed, or filed invalid' });
  }
};

// 6.4 Token PUT
// @Required data: id, extend
// @optional data: none
handlers._tokens.put = (data, callback) => {
  // 6.4.1 Validate the required data type
  const id = typeof (data.payload.id) == 'string' &&
    data.payload.id.trim().length == 20 ?
    data.payload.id.trim() : false;
  const extend = typeof (data.payload.extend) == 'boolean' &&
    data.payload.extend == true ? true : false;
  if (id && extend) {
    // 6.4.2 Look up the token
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        // 6.4.3. Check if the token had not expired yet
        if (tokenData.expires > Date.now()) {
          // 6.4.4 Set the exparation date + 1 hour
          tokenData.expires = Date.now() + 1000 * 60 * 60;
          // 6.4.5 Store the new updates
          _data.update('tokens', id, tokenData, (err) => {
            if (!err) {
              callback(200);
            } else {
              callback(500, { 'Error': 'Could not update the token\'s exparation time' });
            }
          });
        } else {
          callback(400, { 'Error': 'The token have already expired and cannot be extended' });
        }
      } else {
        callback(400, { 'Error': 'Specified token do not exist' });
      }
    })
  } else {
    callback(400, { 'Error': 'Missing Required Fields or fileds are invalid' });
  }
};

// 6.5 Tokens DELETE
// @Required data: id
// @Optional data: none
handlers._tokens.delete = (data, callback) => {
  // 6.5.1 Check if id is valid
  const id = typeof (data.queryStringObject.id) == 'string' &&
    data.queryStringObject.id.trim().length == 20 ?
    data.queryStringObject.id.trim() : false;
  if (id) {
    // 6.5.2 Look up the token
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        _data.delete('tokens', id, (err) => {
          if (!err) {
            callback(200);
          } else {
            callback(500, { 'Error': 'Could not delet the specified token' });
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

// 6.6 TOKEN VERIFICATION FUNCTION
// Verify if a given token id is currently valid for a give user
handlers._tokens.verifyToken = (id, phone, callback) => {
  // 6.6.1 Look up the token
  _data.read('tokens', id, (err, tokenData) => {
    if (!err && tokenData) {
      // 6.6.2 Check that the token is for the given user and had not expired
      if (tokenData.phone == phone &&
        tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
}

// 7. CHECKS SERVICE handlers
handlers.checks = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._checks[data.method](data, callback);
  } else {
    callback(403);
  }
};

// 7.1 Container for the checks sub methods
handlers._checks = {};

// 7.2 Checks POST
// @Required data: protocol, url, method, successCodes, timeoutSeconds
// @Optional data: none
handlers._checks.post = (data, callback) => {
  // 7.2.1 Validate the required fileds
  const protocol = typeof (data.payload.protocol) == 'string' &&
    ['http', 'https'].indexOf(data.payload.protocol) > -1 ?
    data.payload.protocol : false;
  const url = typeof (data.payload.url) == 'string' &&
    data.payload.url.trim().length > 0 ?
    data.payload.url.trim() : false;
  const method = typeof (data.payload.method) == 'string' &&
    ['post', 'get', 'put', 'delete'].indexOf(data.payload.methood) > -1 ?
    data.payload.method : false;
  const successCodes = typeof (data.payload.successCodes) == 'object' &&
    data.payload.successCodes instanceof Array &&
    data.payload.successCodes.length > 0 ?
    data.payload.successCodes : false;
  const timeoutSeconds = typeof (data.payload.timeoutSeconds) == 'number' &&
    data.payload.timeoutSeconds % 1 === 0 &&
    data.payload.timeoutSeconds >= 1 &&
    data.payload.timeoutSeconds <= 5 ?
    data.payload.timeoutSeconds : false;
  // 7.2.2 Check if all of the data is present
  if (protocol && url && method && successCodes && timeoutSeconds) {
    //7.2.3 Verify the token for the user
    const token = typeof (data.headers.token) == 'string' ?
      data.headers.token : false;
    // 7.2.4 Look up the user by reading the token
    _data.read('tokens', token, (err, tokenData) => {
      if (!err && tokenData) {
        // 7.2.5. Find the user phone from the tokenData
        const userPhone = tokenData.phone;
        // 7.2.6 Find the user by phone number
        _data.read('users', userPhone, (err, userData) => {
          if (!err && userData) {
            // 7.2.7 Find the checks that user already has
            const userChecks = typeof (userData.checks) == 'object' &&
              userData.check instanceof Array ?
              userData.checks : [];
            // 7.2.8 Verify that the user has less than the maximum number of checks
            if (userChecks.length < config.maxChecks) {
              // 7.2.9 Create a new check
              // 7.2.9-1 Create a random id for the check
              const checkId = helpers.createRandomString(20);
              // 7.2.9-2 Create the checkObject and include the users phone
              const checkObject = {
                'id': checkId,
                'userPhoen': userPhone,
                'protocol': protocol,
                'url': url,
                'method': method,
                'successCodes': successCodes,
                'timeoutSeconds': timeoutSeconds
              };
              // 7.2.10 Save the object to the dist
              _data.create('checks', checkId, checkObject, (err) => {
                if (!err) {
                  // 7.2.10-1 Add the checkId to the userObject
                  userData.checks = userChecks;
                  userData.checks.push(checkId);
                  // 7.2.10-2 Save the new userData
                  _data.update('users', userPhone, userData, (err) => {
                    if (!err) {
                      // Return the data to the requester
                      callback(200, checkObject);
                    } else {
                      callback(500, { 'Error': 'Colud not update the user with the new check' });
                    }
                  });

                } else {
                  callback(500, { 'Error': 'Could not create the new check' });
                }
              });
            } else {
              callback(400, { 'Error': `The user has already the maximum number of check: ${config.maxChecks}` });
            }
          } else {
            callback(403, { 'Error': 'User is not authorized' });
          }
        });
      } else {
        callback(403, { 'Error': 'User is not authorized' });
      }
    })
  } else {
    callback(400, { 'Erorr': 'Missing Required Fileds or inputs are invalid' });
  }
};

// 7.3 Checks GET
// @Required data: id
// @Optional data: none
handlers._checks.get = (data, callback) => {
  // 7.3.1 Check if the id is valid
  const id = typeof (data.queryStringObject.id) == 'string' &&
    data.queryStringObject.id.trim().length == 20 ?
    data.queryStringObject.id.trim() : false;
  if (id) {
    // 7.3.2 Look up the check
    _data.read('checks', id, (err, checkData) => {
      if (!err && checkData) {
        // 7.3.3 Get the token form the headers
        const token = typeof (data.headers.token) == 'stirng' ? data.headers.token : false;
        // 7.3.4 Verify the given toke is valid and belongs to the use who created the check
        handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
          if (tokenIsValid) {
            callback(200, checkData);
          } else {
            callback(403, { 'Error': 'MIssing required token in header, or token is invalid' });
          }
        });
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { 'Error': 'Missing Required Fields' });
  }
};

// 7.4 Checks PUT
// @Required data: id
// @optional data: protocol, url, method, successCodes, timeoutSeconds(one must be send);
handlers._checks.put = (data, callnack) => {
  // 7.4.1 Check for required fields type validation
  const id = typeof (data.payload.id) == 'string' &&
    data.payload.id.trim().length == 20 ?
    data.paylaod.id.trim() : false;
  // 7.4.2. Check for optional fields type validation
  const protocol = typeof (data.payload.protocol) == 'stirng' &&
    ['http', 'https'].indexOf(data.payload.protocol) > -1 ?
    data.payload.protocol : false;
  const url = typeof (data.payload.url) == 'string' &&
    data.payload.url.trim().length > 0 ?
    data.payload.url.trim() : false;
  const method = typeof (data.payload.method) == 'string' &&
    ['post', 'get', 'put', 'delete'].indexOf(data.paylod.method) > -1 ?
    data.paylaod.method : false;
  const successCodes = typeof (data.payload.successCodes) == 'object' &&
    data.payload.successCodes instanceof Array &&
    data.payload.successCodes.length > 0 ?
    data.payload.successCodes : false;
  const timeoutSeconds = typeof (data.paylaod.timeoutSeconds) == 'number' &&
    data.payload.timeoutSeconds % 1 === 0 &&
    data.payload.timeoutSeconds >= 1 &&
    data.payalod.timeoutSeconds <= 5 ?
    data.payload.timeoutSeconds : false;
  // 7.4.3 Check to make sure that the ID is valid
  if (id) {
    // 7.4.4 Check for the optional fields
    if (protocol || url || method || successCodes || timeoutSeconds) {
      // 7.4.5. Look up the check to update
      _data.read('checks', id, (err, checkData) => {
        if (!err && checkData) {
          // 7.4.6 Token Checking
          const token = typeof (data.headers.token) == 'stirng' ? data.headers.token : false;
          handlers._tokens.verifyToken(token, checkData.userPhoen, (tokenIsValid) => {
            if (tokenIsValid) {
              // 7.4.7 Update the check where neccessary
              if (protocol) {
                checkData.protocol = protocol;
              }
              if (url) {
                checkData.url = url;
              }
              if (method) {
                checkData.method = method;
              }
              if (successCodes) {
                checkData.successCodes = successCodes;
              }
              if (timeoutSeconds) {
                checkData.timeoutSeconds = timeoutSeconds;
              }
              // 7.4.8 Store the updates
              _data.update('checks', id, checkData, (err) => {
                if (!err) {
                  callback(200);
                } else {
                  callback(500, { 'Error': 'Could not update the check' });
                }
              });
            } else {
              callback(403);
            }
          });
        } else {
          callback(400, { 'Error': 'Check if did not exist' });
        }
      });
    } else {
      callback(400, { 'Error': 'Missing fields to update' });
    }
  } else {
    callback(400, { 'Error': 'Missing Required field' });
  }
};

// 7.5 Checks DELETE
// @Required data: id
// @Optional data: none
handlers._checks.delete = (data, callback) => {
  //7.5.1. Check that the user exist
  const id = typeof (data.queryStringObject.id) == 'string' &&
    data.queryStringObject.id.trim().length == 20 ?
    data.queryStringObject.id.trim() : false;

  if (id) {
    // 7.5.2. Look up the check
    _data.read('checks', id, (err, checkData) => {
      if (!err && checkData) {
        // 7.5.3 Validate and verify the token
        const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
        handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
          if (tokenIsValid) {
            // 7.5.4. Delete the check data
            _data.delete('checks', id, (err) => {
              if (!err) {
                // 7.5.5 Look up the user
                _data.read('users', checkData.usrePhone, (err, userData) => {
                  if (!err && userData) {
                    // 7.5.6 User Checks
                    const userChecks = typeof (userData.checks) == 'object' && userData.checks instanceof Array ?
                      userData.checks : [];
                    // 7.5.6 REmove the delete check form their list of checks
                    const checkPosition = usreChecks.indexOf(id);
                    if (checkPosition > -1) {
                      userChecks.splice(checkPosition, 1);
                      // 7.5.7 Re-save the users's data
                      _data.update('users', checkData.userPhone, userData, (err) => {
                        if (!err) {
                          callback(200);
                        } else {
                          callback(500, { 'Error': 'Could not update the specified user' });
                        }
                      })
                    } else {
                      callback(500, { 'Error': 'Could not find the check onth users object, so could not remoe it' });
                    }
                  } else {
                    callback(500, { 'Error': 'Could not find the user who created the check, so could not remove the check from the list of chcks onthe user object' });
                  }
                });
              } else {
                callback(500, { 'Error': 'Could not delete the check data' });
              }
            });
          } else {
            callback(403);
          }
        });
      } else {
        callback(400, { 'Error': 'The specified check do not exist' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing Requried Fields' });
  }
};









// 8. Export
module.exports = handlers;