/*
* This are the Request handlers
*
*/

// 1. Dependencies
const _data = require('./data');
const helpers = require('./helpers');
const config = require('./config');

// 2. Handlers Container
const handlers = {};

// COMMON HELPERS:
// 2.1 Ping handlers
handlers.ping = (data, callback) => {
  callback(200);
};

// 2.2 Not found handlers
handlers.notFound = (data, callback) => {
  callback(404);
};

/*
*  I. HTML API HANDLERS
*
*/

// 1. INDEX HANDLERS
handlers.index = (data, callback) => {
  // 1.1  Reject any request that is not a GET
  if (data.method == 'get') {
    // 1.2 Prepare the data for interpolation
    let templateData = {
      'head.title': 'Uptime MOnitoring  - Made Simple',
      'head.description': 'We offer free, simple uptime monitoring for HTTP/HTTPS sites of all kinds. When your site goes down, we\'ll send you a text to let you know',
      'body.class': 'index'
    }

    // 1.3 Read in the template as a string
    helpers.getTemplate('index', templateData, (err, str) => {
      if (!err && str) {
        // 1.4 Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str) {
            // 1.5 Return the page as html
            callback(200, str, 'html');
          } else {
            callback(500, undefined, 'html');
          }
        });
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html');
  }
}

// 2. CREATE ACCOUNT HANDLER
handlers.accountCreate = (data, callback) => {
  // 2.1 Reject all the request that isn't a GET
  if (data.method == 'get') {
    // 2.2 Prepare data for interpolation
    let templateData = {
      'head.title': 'Create an Account',
      'head.description': 'Signup is easy and only takes a few seconds',
      'body.class': 'accountCreate'
    };
    // 2.3 Read in a template as a string
    helpers.getTemplate('accountCreate', templateData, (err, str) => {
      if (!err && str) {
        // 2.4 Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str) {
            callback(200, str, 'html');
          } else {
            callback(500, undefined, 'html');
          }
        });
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html');
  }
}

// 3. CREATE SESSION HANDLER
handlers.sessionCreate = (data, callback) => {
  // 3.1 Reject all the request that isn't a GET
  if (data.method == 'get') {
    // 3.2 Prepare data for interpolation
    let templateData = {
      'head.title': 'Login to your Account',
      'head.description': 'Please enter your phone number and password to access your account',
      'body.class': 'sessionCreate'
    };
    // 3.3 Read in a template as a string
    helpers.getTemplate('sessionCreate', templateData, (err, str) => {
      if (!err && str) {
        // 3.4 Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str) {
            callback(200, str, 'html');
          } else {
            callback(500, undefined, 'html');
          }
        });
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html');
  }
}

// 4. DELETED SESSION HANDLER
handlers.sessionDeleted = (data, callback) => {
  // 4.1 Reject any request that isn't a get
  if (data.method == 'get') {
    // 4.2 Prepare the data for interpolation
    let templateData = {
      'head.title': 'Logged Out',
      'head.description': 'You have been logged out of your account',
      'body.class': 'sessionDeleted'
    };
    // 4.3 Read in a template as a string
    helpers.getTemplate('sessionDeleted', templateData, (err, str) => {
      if (!err && str) {
        //Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str) {
            callback(200, str, 'html');
          } else {
            callback(500, undefined, 'html');
          }
        });
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html');
  }
}

/*
*  II. STATIC ASSETS HANDLERS
*
*/

// 2. Favicon handlers
handlers.favicon = (data, callback) => {
  // 2.1 Reject any method that isn't a GET
  if (data.method == 'get') {
    // 2.2 Server the favicon.
    // Read in the favicon's data
    helpers.getStaticAsset('favicon.ico', (err, data) => {
      if (!err && data) {
        // 2.2 Callback the data
        callback(200, data, 'favicon');
      } else {
        callback(500);
      }
    });
  } else {
    callback(405);
  }
}

// 3. Public Assets
handlers.public = (data, callback) => {
  // 3.1 Reject any method that isn't a GET
  if (data.method == 'get') {
    // 3.2 Get the file name that been requested
    let trimmedAssetName = data.trimmedPath.replace('public/', '').trim();
    // 3.3. Continue if there is a file
    if (trimmedAssetName.length > 0) {
      // 3.4 Read in the asset's data
      helpers.getStaticAsset(trimmedAssetName, (err, data) => {
        if (!err && data) {
          // 3.5 What kind of asset the data has
          // Determine the content type (default to plain text)
          let contentType = 'plain';
          if (trimmedAssetName.indexOf('.css') > -1) {
            contentType = 'css';
          }
          if (trimmedAssetName.indexOf('.js') > -1) {
            contentType = 'js';
          }
          if (trimmedAssetName.indexOf('.png') > -1) {
            contentType = 'png';
          }
          if (trimmedAssetName.indexOf('.jpg') > -1) {
            contentType = 'jpg';
          }
          if (trimmedAssetName.indexOf('.ico') > -1) {
            contentType = 'favicon';
          }

          // 3.6 Callback the data
          callback(200, data, contentType);
        } else {
          callback(404);
        }
      });
    } else {
      callback(404);
    }
  } else {
    callback(405);
  }
}

/*
*  III. JSON API HANDLERS
*
*/

// 3. USER SERVICE
handlers.users = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};
// 3.1 Container for the users sub methods
handlers._users = {};

// 3.2. Handlers USER POST
// @required data: firstName, lastName, phone, password, tosAgreement
// @optional data: none
handlers._users.post = (data, callback) => {
  // 3.2.1 Check that all the fields are filled out
  const firstName = typeof (data.payload.firstName) == 'string' &&
    data.payload.firstName.trim().length > 0 ?
    data.payload.firstName.trim() : false;
  const lastName = typeof (data.payload.lastName) == 'string' &&
    data.payload.lastName.trim().length > 0 ?
    data.payload.lastName.trim() : false;
  const phone = typeof (data.payload.phone) == 'string' &&
    data.payload.phone.trim().length == 10 ?
    data.payload.phone.trim() : false;
  const password = typeof (data.payload.password) == 'string' &&
    data.payload.password.trim().length > 0 ?
    data.payload.password.trim() : false;
  const tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' &&
    data.payload.tosAgreement == true ? true : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    // 3.2.2. Make user that the user doesn't exist
    _data.read('users', phone, (err, data) => {
      if (err) {
        // 3.2.3 Hash the password
        const hashedPassword = helpers.hash(password);
        if (hashedPassword) {
          // 3.2.4 Creat the user object
          const userObject = {
            'firstName': firstName,
            'lastName': lastName,
            'phone': phone,
            'hashedPassword': hashedPassword,
            'tosAgreement': true
          };
          // Store the user
          _data.create('users', phone, userObject, (err) => {
            if (!err) {
              callback(200);
            } else {
              callback(500, { 'Error': 'Could not hash the user\'s password' });
            }
          })
        } else {
          callback(500, { 'Error': 'COuld not hash the user\'s password' });
        }

      } else {
        callback(400, { 'Error': 'User with that phone number already exist' });
      }
    })
  } else {
    callback(400, { 'Error': 'Missing Required Fields' });
  }

};

// 3.3 Handlers USER GET
// @required: phone
// @optional: none
// @todo: only let the authenticated users access their object
handlers._users.get = (data, callback) => {
  // 3.1. Check that the phone is valid
  const phone = typeof (data.queryStringObject.phone) == 'string' &&
    data.queryStringObject.phone.trim().length == 10 ?
    data.queryStringObject.phone.trim() : false;

  if (phone) {
    // 3.1.1 Vefify the token
    // Get the token from the headers
    const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
    // 3.1.2 Verify the token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        // 3.2. Look up the user
        _data.read('users', phone, (err, data) => {
          if (!err && data) {
            // 3.3. Remove the hashed pasword
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404, { 'Error': 'The user do not exist' });
          }
        });
      } else {
        callback(403, { 'Error': 'The token id is not valid, or expired' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing Required Field' });
  }

};

// 3.4 Handlers USER PUT
// @required: phone
// @optional: firstName, lastName, password (at least one should be)
// @todo: only authenticated users can update the data
handlers._users.put = (data, callback) => {
  // 3.4.1 Check for the required field
  const phone = typeof (data.payload.phone) == 'string' &&
    data.payload.phone.trim().length == 10 ?
    data.payload.phone.trim() : false;
  // 3.4.2 Check for the optional fields
  const firstName = typeof (data.payload.firstName) == 'string' &&
    data.payload.firstName.trim().length > 0 ?
    data.payload.firtsName.trim() : false;
  const lastName = typeof (data.payload.lastName) == 'string' &&
    data.payload.lastName.trim().length > 0 ?
    data.payload.lastName.trim() : false;
  const password = typeof (data.payload.password) == 'string' &&
    data.payload.password.trim().length > 0 ?
    data.payload.password.trim() : false;

  // 3.4.2 Continue if the phone is valid
  if (phone) {
    // 3.4.3 Error if there's nothing to update
    if (firstName || lastName || password) {

      // 3.4.3.1 Verify the token
      const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
      handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
        if (tokenIsValid) {
          // 3.4.4. Look up the user
          _data.read('users', phone, (err, userData) => {
            if (!err && userData) {
              // 3.4.5 Update the fields
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.hashedPassword = helpers.hash(password);
              }
              // 3.4.5. Store the updates
              _data.update('users', phone, userData, (err) => {
                if (!err) {
                  callback(200);
                } else {
                  console.log(err);
                  callback(500, { 'Error': 'Could not update the user' });
                }
              });
            } else {
              callback(400, { 'Error': 'The specified user do not exist' });
            }
          });
        } else {
          callback(403, { 'Error': 'Token is invalid or expired' });
        }
      });
    } else {
      callback(400, { 'Error': 'Missing data to update' });
    }
  } else {
    callback(400, { 'Error': 'Missing Required Field' });
  }
};

// 3.5 Handlers USER DELETE
// @required: phone
// @todo: only let the authenticated user delete object
// @todo: delete any other assocciated files
handlers._users.delete = (data, callback) => {
  // 3.5.1. Check that the phone is valid
  const phone = typeof (data.queryStringObject.phone) == 'string' &&
    data.queryStringObject.phone.trim().length == 10 ?
    data.queryStringObject.phone.trim() : false;
  if (phone) {

    // 3.5.1.1 Verify the token
    const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        _data.read('users', phone, (err, userData) => {
          if (!err && userData) {
            // 3.5.2 Delete the data
            _data.delete('users', phone, (err) => {
              if (!err) {
                // 3.5.3 Delete the data associated with the user (checks)
                const userChecks = typeof (userData.checks) == 'object' &&
                  userData.checks instanceof Array ?
                  userData.checks : [];
                const checksToDelete = userChecks.length;
                if (checksToDelete > 0) {
                  // 3.5.4 Delete some checks
                  let checksDeleted = 0;
                  let deletionErrors = false;
                  // 3.5.5 Loop  throught the checks
                  userChecks.forEach((checkId) => {
                    // 3.5.6 Delete a check
                    _data.delete('checks', checkId, (err) => {
                      if (err) {
                        deletionErrors = true;
                      }
                      checksDeleted++;
                      if (checksDeleted == checksToDelete) {
                        if (!deletionErrors) {
                          callback(200);
                        } else {
                          callback(500, { 'Error': 'Errors encountered, could not delete all the checks' });
                        }
                      }
                    });
                  });
                } else {
                  callback(200);
                }
              } else {
                callback(500, { 'Error': 'Could not delete the user' });
              }
            })
          } else {
            callback(400, { 'Error': 'Could not find the specified user' });
          }
        });
      } else {
        callback(403, { 'Error': 'The token have expired, or invalid' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing Required Field' });
  }
};

// 4. TOKEN SERVICE
handlers.tokens = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

// 4.1 Container for the sub methods
handlers._tokens = {};

// 4.2 Token POST
// @required data: phone, password
// @optional data: none
handlers._tokens.post = (data, callback) => {
  // 4.2.1 Check the required data
  const phone = typeof (data.payload.phone) == 'string' &&
    data.payload.phone.trim().length == 10 ?
    data.payload.phone.trim() : false;
  const password = typeof (data.payload.password) == 'string' &&
    data.payload.password.trim().length > 0 ?
    data.payload.password.trim() : false;

  if (phone && password) {
    // 4.2.2 Look up the user who matches the phone
    _data.read('users', phone, (err, userData) => {
      if (!err && userData) {
        // 4.2.3 Hash the send password and compare it to the stored password
        const hashedPassword = helpers.hash(password);
        if (hashedPassword == userData.hashedPassword) {
          // 4.2.4 If valid create a new token with a random name. Set exparation data
          const tokenId = helpers.createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60;
          const tokenObject = {
            'phone': phone,
            'id': tokenId,
            'expires': expires
          };
          // Store the token
          _data.create('tokens', tokenId, tokenObject, (err) => {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callbacka(500, { 'Errror': 'Could not create a token' });
            }
          })
        } else {
          callback(400, { 'Error': 'Password did not match the specified users stored password' });
        }
      } else {
        callback(400, { 'Error': 'Specified user do not exist' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required Fields' });
  }
};
// 4.3. Token GET
// @required: id
// @optional: none
handlers._tokens.get = (data, callback) => {
  // 4.3.1 Check that the id is valid
  const id = typeof (data.queryStringObject.id) == 'string' &&
    data.queryStringObject.id.trim().length == 20 ?
    data.queryStringObject.id.trim() : false;
  if (id) {
    // Read teh token
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { 'Error': 'Missing Required Fields' });
  }
}
// 4.4 Token PUT
// @require: id, extend
// @optional: none
handlers._tokens.put = (data, callback) => {
  // 4.4.1 validate the required fileds
  const id = typeof (data.payload.id) == 'string' &&
    data.payload.id.trim().length == 20 ?
    data.payload.id.trim() : false;
  const extend = typeof (data.payload.extend) == 'boolean' &&
    data.payload.extend == true ? true : false;
  if (id && extend) {
    // 4.4.2 Look up the token
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        // 4.4.3 Check if the token have not expired
        if (tokenData.expires > Date.now()) {
          // 4.4.4 Set the exparation to 1 hour into the future
          tokenData.expires = Date.now() + 1000 * 60 * 60;
          // 4.4.5 Save the data to disk
          _data.update('tokens', id, tokenData, (err) => {
            if (!err) {
              callback(200);
            } else {
              callback(500, { 'Error': 'Could not update the token' });
            }
          })
        } else {
          callback(400, { 'Error': 'The token have expired' });
        }
      } else {
        callback(400, { 'Error': 'Specified token do not exist' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing Required Fields or fields are invalid' });
  }
}
// 4.5 Token Delete
// @required: id
// @optional: none
handlers._tokens.delete = (data, callback) => {
  // 4.5.1 Check if the id is valid
  const id = typeof (data.queryStringObject.id) == 'string' &&
    data.queryStringObject.id.trim().length == 20 ?
    data.queryStringObject.id.trim() : false;
  if (id) {
    // 4.5.2 Look up the token
    _data.read('tokens', id, (err, data) => {
      if (!err && data) {
        // 4.5.3 Delete the data
        _data.delete('tokens', id, (err) => {
          if (!err) {
            callback(200);
          } else {
            callback(500, { 'Error': 'Could not delete the token' });
          }
        })
      } else {
        callback(400, { 'Error': 'Could not find the specified token ' });
      }
    })
  } else {
    callback(400, { 'Error': 'Missing Required Fields' });
  }
};



// 4.6 Verify TokenId is currently valid for the given user
handlers._tokens.verifyToken = (id, phone, callback) => {
  // 4.6.1 Look up the token
  _data.read('tokens', id, (err, tokenData) => {
    if (!err && tokenData) {
      // 4.6.2 Check taht the token is for the given user and have not expired
      if (tokenData.phone == phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

// 5. CHECKS SERVICE
handlers.checks = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._checks[data.method](data, callback);
  } else {
    callback(403);
  }
}

// 5.1. Create a container for sub method for checks
handlers._checks = {};

// 5.2. Checks POST
// @requried: protocol, url, method, successCodes, timeoutSeconds
// @optional: none
handlers._checks.post = (data, callback) => {

  // 5.2.1 Validate the inputs
  const protocol = typeof (data.payload.protocol) == 'string' &&
    ['http', 'https'].indexOf(data.payload.protocol) > -1 ?
    data.payload.protocol : false;
  const url = typeof (data.payload.url) == 'string' &&
    data.payload.url.trim().length > 0 ?
    data.payload.url.trim() : false;
  const method = typeof (data.payload.method) == 'string' &&
    ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ?
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

  if (protocol && url && method && successCodes && timeoutSeconds) {
    // 5.2.2 Check that the token is valid
    const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
    // 5.2.3. Look up the user by reading the token
    _data.read('tokens', token, (err, tokenData) => {
      if (!err && tokenData) {
        // 5.2.4. Get the user phone number
        const userPhone = tokenData.phone;
        // 5.2.5 Ge the user data
        _data.read('users', userPhone, (err, userData) => {
          if (!err && userData) {
            const userChecks = typeof (userData.checks) == 'object' &&
              userData.checks instanceof Array ?
              userData.checks : [];
            // 5.2.6 Verify that the user has less than the maximumChecks number
            if (userChecks.length < config.maxChecks) {
              // 5.2.7 Create the random id for the new check
              const checkId = helpers.createRandomString(20);
              // 5.2.8 Create the checksObject and include the usersPhone
              const checkObject = {
                'id': checkId,
                'userPhone': userPhone,
                'protocol': protocol,
                'url': url,
                'method': method,
                'successCodes': successCodes,
                'timeoutSeconds': timeoutSeconds
              };
              // 5.2.9 Save the object to the system
              _data.create('checks', checkId, checkObject, (err) => {
                if (!err) {
                  // 5.2.10. Add the checkId to the userObject
                  userData.checks = userChecks;
                  userData.checks.push(checkId);
                  // 5.2.11 Save the new data
                  _data.update('users', userPhone, userData, (err) => {
                    if (!err) {
                      // 5.2.12 Return the data about the new check to the requestor
                      callback(200, checkObject);
                    } else {
                      callback(500, { 'Error': 'Could not update the user with the new check' });
                    }
                  })
                } else {
                  callback(500, { 'Error': 'Could not create the new check' });
                }
              })
            } else {
              callback(400, { 'Error': `The user already has the maximum number of checks ${config.maxChecks}` });
            }
          } else {
            callback(403, { 'Error': 'The user do not exist' });
          }
        })
      } else {
        callback(403, { 'Error': 'Token is invalid, or expired' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing Required inputs, or inputs are invalid' });
  }
}

// 5.3. Checks GET
// @requried: id
// @optional: none
handlers._checks.get = (data, callback) => {
  // 5.3.1. Check that id is valid
  const id = typeof (data.queryStringObject.id) == 'string' &&
    data.queryStringObject.id.trim().length == 20 ?
    data.queryStringObject.id.trim() : false;
  if (id) {
    // 5.3.2 Look up the check
    _data.read('checks', id, (err, checkData) => {
      if (!err && checkData) {
        // 5.3.3. Varify the token
        const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
        handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
          if (tokenIsValid) {
            // 5.3.4 Return the data to the user
            callback(200, checkData);
          } else {
            callback(403, { 'Error': 'The provided token is invalid' });
          }
        });
      } else {
        callback(404, { 'Error': 'There no such check data' });
      }
    })
  } else {
    callback(400, { 'Error': 'The id is invalid' });
  }
}

// 5.4. Checks PUT
// @requried: id
// @optional: protocol, url, method, successCodes, timeoutSeconds ( one should be present)
handlers._checks.put = (data, callback) => {
  // 5.4.1 Check for the required fields type
  const id = typeof (data.payload.id) == 'string' &&
    data.payload.id.trim().length == 20 ?
    data.payload.id.trim() : false;
  // 5.4.2 Check for optional fields type
  const protocol = typeof (data.payload.protocol) == 'string' &&
    ['https', 'http'].indexOf(data.payload.protocol) > - 1 ?
    data.payload.protocol : false;
  const url = typeof (data.payload.url) == 'string' &&
    data.payload.url.trim().length > 0 ?
    data.payload.url.trim() : false;
  const method = typeof (data.payload.method) == 'string' &&
    ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ?
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

  // 5.4.3 Check for id validation
  if (id) {
    // 5.4.4 Check for optional fields
    if (protocol || url || method || successCodes || timeoutSeconds) {
      // 5.4.5. Look up the check
      _data.read('checks', id, (err, checkData) => {
        if (!err && checkData) {
          // 5.4.6 Verify token data
          const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
          handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
            if (tokenIsValid) {
              // 5.4.7 Update the check where neccessary
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
              // 5.4.8 Store the update
              _data.update('checks', id, checkData, (err) => {
                if (!err) {
                  callback(200);
                } else {
                  callback(500, { 'Error': 'Could not update the check' });
                }
              })
            } else {
              callback(403, { 'Error': 'Your not authorized' });
            }
          })
        } else {
          callback(400, { 'Error': 'There is no check data id' });
        }
      });
    } else {
      callback(400, { 'Error': 'No fields to update' });
    }
  } else {
    callback(400, { 'Erorr': 'Missing Required field' });
  }
}

// 5.5. Checks DELETE
// @requried: id
// @optional: none
handlers._checks.delete = (data, callback) => {
  // 5.5.1  Check if id is valid
  const id = typeof (data.queryStringObject.id) == 'string' &&
    data.queryStringObject.id.trim().length == 20 ?
    data.queryStringObject.id.trim() : false;
  if (id) {
    // 5.5.2 Look up the check to delete
    _data.read('checks', id, (err, checkData) => {
      if (!err && checkData) {
        const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
        handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
          if (tokenIsValid) {
            // 5.5.3 Delete the check data
            _data.delete('checks', id, (err) => {
              if (!err) {
                // 5.5.4 Look up the user and modify the check
                _data.read('users', checkData.userPhone, (err, userData) => {
                  if (!err && userData) {
                    // 5.5.5 Find the userChecks
                    const userChecks = typeof (userData.checks) == 'object' && userData.checks instanceof Array ?
                      userData.checks : [];
                    // 5.5.6 Remove the deleted checks form the checks
                    const checkPosition = userChecks.indexOf(id);
                    if (checkPosition > -1) {
                      userChecks.splice(checkPosition, 1);
                      //5.5.7 resave the users data
                      _data.update('users', checkData.userPhone, userData, (err) => {
                        if (!err) {
                          callback(200);
                        } else {
                          callback(500, { 'Error': 'Could not update the user' });
                        }
                      });
                    } else {
                      callback(500, { 'Error': 'Could not find the checks on the user object so could not remove it' });
                    }

                  } else {
                    callback(500, { 'Error': 'Could notfind the user who created the cehck, so could not delete the check from the list of checks' });
                  }
                });
              } else {
                callback(500, { 'Error': 'Could not delete the check data' });
              }
            })
          } else {
            callback(403, { 'Error': 'Token is invalid or expired' });
          }
        })
      } else {
        callback(400, { 'Error': ' There is no such check by id' });
      }
    })
  } else {
    callback(403, { 'Error': 'Missing required field' });
  }
}

// 9. Export the handlers
module.exports = handlers;
