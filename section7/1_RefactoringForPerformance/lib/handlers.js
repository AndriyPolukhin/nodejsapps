/*
* ROUTE REQUEST HANDLERS
*
*/

// 1. MAIN DEPENDENCIES
const _data = require('./data');
const helpers = require('./helpers');
const config = require('./config');
const _url = require('url');
const dns = require('dns');

// 2. CONTAINER: for the handlers
const handlers = {};

/*
*  I. HELPERS HANDLERS
*
*/

// 1. PING
handlers.ping = (data, callback) => {
  callback(200);
};
// 2. NOT FOUND
handlers.notFound = (data, callback) => {
  callback(404);
};

/*
* II. HTML DATA API HANDLERS
*
*/

// 1. INDEX PAGE HANDLER
handlers.index = (data, callback) => {
  // 1.1 REJECT REQUEST: all but the GET
  if (data.method == 'get') {
    // 1.2 Prepare data for interpolation
    const templateData = {
      'head.title': 'Uptime Monitoring - Made Simpe',
      'head.description': 'We offer free, simple uptime monitoring for HTTP/HTTPS sites of all kinds. When your site goes down, we\'ll send you a text to let you know',
      'body.class': 'index'
    };
    // 1.3 Make template into a string
    helpers.getTemplate('index', templateData, (err, str) => {
      if (!err && str) {
        // 1.4 Add Universal haeder and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str) {
            // 1.5 Return the html page as requested
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
};
// 2. ACCOUNT CREATE HANDLER
handlers.accountCreate = (data, callback) => {
  // 2.1 REJECT REQUEST: all but the GET
  if (data.method == 'get') {
    // 2.2 Prepare data for interpolation
    const templateData = {
      'head.title': 'Create an Account',
      'head.description': 'Signup is easy and only takes a few seconds',
      'body.class': 'accountCreate'
    };
    // 2.3 Make template into a string
    helpers.getTemplate('accountCreate', templateData, (err, str) => {
      if (!err && str) {
        //2.4 Add Universal haeder and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str) {
            // 2.5 Return the html page as requested
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
};

// 3. SESSION CREATE HANDLER
handlers.sessionCreate = (data, callback) => {
  // 3.1 REJECT REQUEST: all but the GET
  if (data.method == 'get') {
    // 3.2 Prepare data for interpolation
    const templateData = {
      'head.title': 'Login to your Account',
      'head.description': 'Please enter your phone and password to access your account',
      'body.class': 'sessionCreate'
    };
    // 3.3 Make template into a string
    helpers.getTemplate('sessionCreate', templateData, (err, str) => {
      if (!err && str) {
        // 3.4 Add Universal haeder and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str) {
            // 3.5 Return the html page as requested
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
// 4. SESSION DELETE HANDLER
handlers.sessionDeleted = (data, callback) => {
  // 4.1 REJECT REQUEST: all but the GET
  if (data.method == 'get') {
    // 4.2 Prepare data for interpolation
    const templateData = {
      'head.title': 'Logged Out',
      'head.description': 'You have been logged out out of your account',
      'body.class': 'sessionDeleted'
    };
    // 4.3 Make template into a string
    helpers.getTemplate('sessionDeleted', templateData, (err, str) => {
      if (!err && str) {
        // 4.4 Add Universal haeder and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str) {
            // 4.5 Return the html page as requested
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
};

// 5. ACCOUNT EDIT HANDLER
handlers.accountEdit = (data, callback) => {
  // 5.1 REJECT REQUEST: all but the GET
  if (data.method == 'get') {
    // 5.2 Prepare data for interpolation
    const templateData = {
      'head.title': 'Account Settings',
      'body.class': 'accountEdit'
    };
    // 5.3 Make template into a string
    helpers.getTemplate('accountEdit', templateData, (err, str) => {
      if (!err && str) {
        // 5.4 Add Universal haeder and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str) {
            // 5.5 Return the html page as requested
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
};
// 6. ACCOUNT DELETE HANDLER
handlers.accountDeleted = (data, callback) => {
  // 4.1 REJECT REQUEST: all but the GET
  if (data.method == 'get') {
    // 4.2 Prepare data for interpolation
    const templateData = {
      'head.title': 'Account Deleted',
      'head.description': 'Your account has been deleted',
      'body.class': 'accountDeleted'
    };
    // 4.3 Make template into a string
    helpers.getTemplate('accountDeleted', templateData, (err, str) => {
      if (!err && str) {
        // 4.4 Add Universal haeder and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str) {
            // 4.5 Return the html page as requested
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
};
// 7. CHECK CREATE HANDLER
handlers.checksCreate = (data, callback) => {
  // 7.1 REJECT REQUEST: all but the GET
  if (data.method == 'get') {
    // 7.2 Prepare data for interpolation
    const templateData = {
      'head.title': 'Create a new Check',
      'body.class': 'checksCreate'
    };
    // 7.3 Make template into a string
    helpers.getTemplate('checksCreate', templateData, (err, str) => {
      if (!err && str) {
        // 7.4 Add Universal haeder and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str) {
            // 7.5 Return the html page as requested
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
};
// 8. CHECKS ALL / DASHBOARD HANDLER
handlers.checksList = (data, callback) => {
  // 8.1 REJECT REQUEST: all but the GET
  if (data.method == 'get') {
    // 8.2 Prepare data for interpolation
    const templateData = {
      'head.title': 'Dashboard',
      'body.class': 'checksList'
    };
    // 8.3 Make template into a string
    helpers.getTemplate('checksList', templateData, (err, str) => {
      if (!err && str) {
        // 8.4 Add Universal haeder and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str) {
            // 8.5 Return the html page as requested
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
};
// 9. CHECKS EDIT HANDLER
handlers.checksEdit = (data, callback) => {
  // 9.1 REJECT REQUEST: all but the GET
  if (data.method == 'get') {
    // 9.2 Prepare data for interpolation
    const templateData = {
      'head.title': 'Checks Details',
      'body.class': 'checksEdit'
    };
    // 9.3 Make template into a string
    helpers.getTemplate('checksEdit', templateData, (err, str) => {
      if (!err && str) {
        // 9.4 Add Universal haeder and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str) {
            // 9.5 Return the html page as requested
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
};
// 10. STATIC ASSETS HANDLER
handlers.public = (data, callback) => {
  // 10.1 REJECT REQUEST: all but the GET
  if (data.method == 'get') {
    // 10.2 Get the file name from the request
    let trimmedAssetName = data.trimmedPath.replace('public/', '').trim();
    if (trimmedAssetName) {
      // 10.3 Fetch the asset
      helpers.getStaticAsset(trimmedAssetName, (err, data) => {
        if (!err && data) {
          // 10.4 Determine the content Type of the asset
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
};
// 11. FAVICON HANDLER
handlers.favicon = (data, callback) => {
  // 11.1 REJECT REQUEST: all but the GET
  if (data.method == 'get') {
    // 11.2 Fetch the favicon
    helpers.getStaticAsset('favicon.ico', (err, data) => {
      if (!err && data) {
        // 11.3 Return the data
        callback(200, data, 'favicon');
      } else {
        callback(500);
      }
    });
  } else {
    callback(405)
  }
};

/*
* III. JSON DATA API HADNLERS
*
*/

// 1. USER SERVICE

// 1.1 MAIN CONTAINER
handlers.users = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

// 1.2 _SUB_CONTAINER
handlers._users = {};

// 1.3 USERS POST HANDLER
// @required data: firstName, lastName, phone, password, tosAgreement
// @optional data: none
handlers._users.post = (data, callback) => {
  // 1.3.1 Check that the all fileds type is correct
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

  // 1.3.2 Check that all the fields are present
  if (firstName, lastName, phone, password, tosAgreement) {
    // 1.3.3 Check that the user do not exist
    _data.read('users', phone, (err, data) => {
      if (err) {
        // 1.3.4 Create the user Object
        const hashedPassword = helpers.hash(password);
        if (hashedPassword) {
          const userObject = {
            'firstName': firstName,
            'lastName': lastName,
            'phone': phone,
            'hashedPassword': hashedPassword,
            'tosAgreement': true
          };
          // 1.3.5 Store the user data to the file system
          _data.create('users', phone, userObject, (err) => {
            if (!err) {
              callback(200);
            } else {
              callback(500, { 'Error': 'Could not create user' });
            }
          });
        } else {
          callback(500, {
            'Error': 'Could not hash the user\'s password'
          });
        }
      } else {
        callback(400, { 'Error': 'User with this phone number already exist' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing Required Field to Create User' })
  }
};

// 1.4 USERS GET HANDLER
// @required data: phone
// @optional data: none
// @todo: only let the authenticated users to access their data
handlers._users.get = (data, callback) => {
  //1.4.1 Check that the phone is has a valid type and length
  const phone = typeof (data.queryStringObject.phone) == 'string' &&
    data.queryStringObject.phone.trim().length == 10 ?
    data.queryStringObject.phone.trim() : false;

  if (phone) {
    // 1.4.2 VERIFY TOKEN: provided in headers
    const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        // 1.4.3 Fetch the user data
        _data.read('users', phone, (err, data) => {
          if (!err && data) {
            // 1.4.4 Password should be removed
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404, { 'Error': 'The user do not exist' });
          }
        });
      } else {
        callback(403, { 'Error': 'Provided token is invalid, or expired' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing Required Fields to GET USER DATA' })
  }
};

// 1.5 USERS PUT HANDLER
// @required data: phone
// @optional data: firstName, lastName, password (at least one should be provided)
// @todo: only authenticated user can access their data
handlers._users.put = (data, callback) => {
  // 1.5.1 Check the required field type and length
  const phone = typeof (data.payload.phone) == 'string' &&
    data.payload.phone.trim().length == 10 ?
    data.payload.phone.trim() : false;

  // 1.5.2 Check the optional fileds type
  const firstName = typeof (data.payload.firstName) == 'string' &&
    data.payload.firstName.trim().length > 0 ?
    data.payload.firstName.trim() : false;
  const lastName = typeof (data.payload.lastName) == 'string' &&
    data.payload.lastName.trim().length > 0 ?
    data.payload.lastName.trim() : false;
  const password = typeof (data.payload.password) == 'string' &&
    data.payload.password.trim().length > 0 ?
    data.payload.password.trim() : false;

  // 1.5.3 Phone is valid => proceed
  if (phone) {
    // 1.5.4 Optional fields should be present => proceed
    if (firstName || lastName || password) {
      // 1.5.5 VERIFY TOKEN: provided in headers
      const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
      handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
        if (tokenIsValid) {
          // 1.5.6 Fetch the user data
          _data.read('users', phone, (err, userData) => {
            if (!err && userData) {
              // 1.5.7 Update the userData object with provided optional data
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.hashedPassword = helpers.hash(password);
              }
              // 1.5.8 Store the user data to the file system
              _data.update('users', phone, userData, (err) => {
                if (!err) {
                  callback(200);
                } else {
                  console.log(err);
                  callback(500, { 'Error': 'Could not update the user data' });
                }
              });
            } else {
              callback(400, { 'Error': 'The specified user do not exist' });
            }
          });
        } else {
          callback(403, { 'Error': 'Provided token is invalid, or expired' });
        }
      });
    } else {
      callback(400, { 'Error': 'Data for Updates is not provided' });
    }
  } else {
    callback(400, { 'Error': 'Missing Required Field to update user' });
  }
};

// 1.6 USERS DELETE HANDLER
// @required data: phone
// @todo: only authenticated user can access their data
// @todo: delete any other associated files
handlers._users.delete = (data, callback) => {
  // 1.6.1 Check the required field type and length
  const phone = typeof (data.queryStringObject.phone) == 'string' &&
    data.queryStringObject.phone.trim().length == 10 ?
    data.queryStringObject.phone.trim() : false;

  // 1.6.2 Phone is valid => proceed
  if (phone) {
    // 1.6.3 VERIFY TOKEN: provided in headers
    const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        // 1.6.4 Fetch the user data
        _data.read('users', phone, (err, userData) => {
          if (!err && userData) {
            // 1.6.5 Delete the user data
            _data.delete('users', phone, (err) => {
              if (!err) {
                // 1.6.6 Delete other associated data with the user (checks)
                const userChecks = typeof (userData.checks) == 'object' &&
                  userData.checks instanceof Array ?
                  userData.checks : [];
                const checksToDelete = userChecks.length;
                if (checksToDelete > 0) {
                  // 1.6.7 Set the loop for deletion
                  let checksDeleted = 0;
                  let deletionErrors = false;
                  userChecks.forEach((checkId) => {
                    // 1.6.8 Delete the checks
                    _data.delete('checks', checkId, (err) => {
                      if (err) {
                        deletionErrors = true;
                      }
                      checksDeleted++;
                      if (checksDeleted == checksToDelete) {
                        if (!deletionErrors) {
                          callback(200);
                        } else {
                          callback(500, { 'Error': 'Errors encountered, could not delete all checks' });
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
            });
          } else {
            callback(400, { 'Error': 'Specified user is not found' });
          }
        });
      } else {
        callback(403, { 'Error': 'Provided token is invalid, or expired' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing Required Field to Delete User Data' });
  }
};

// 2. TOKEN SERVICE

// 2.1 MAIN CONTAINER
handlers.tokens = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

// 2.2 _SUB_CONTAINER
handlers._tokens = {};

// 2.3 TOKENS POST HANDLER
// @required data: phone, password
// @optional data: none
handlers._tokens.post = (data, callback) => {
  // 2.3.1 Check the type of the required data
  const phone = typeof (data.payload.phone) == 'string' &&
    data.payload.phone.trim().length == 10 ?
    data.payload.phone.trim() : false;
  const password = typeof (data.payload.password) == 'string' &&
    data.payload.password.trim().length > 0 ?
    data.payload.password.trim() : false;

  // 2.3.2 If the data is valid => proceed
  if (phone && password) {
    // 2.3.3 Fetch the user, who matches the phone number
    _data.read('users', phone, (err, userData) => {
      if (!err && userData) {
        // 2.3.4 Compare the provided password with the stored password
        const hashedPassword = helpers.hash(password);
        if (hashedPassword == userData.hashedPassword) {
          // 2.3.5 Create a new TOKEN
          const tokenId = helpers.createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60;
          const tokenObject = {
            'phone': phone,
            'id': tokenId,
            'expires': expires
          };
          // 2.3.6 Store the token in the file system
          _data.create('tokens', tokenId, tokenObject, (err) => {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, { 'Error': 'Could not create a token' });
            }
          });
        } else {
          callback(400, { 'Error': 'Password do not match the users password' });
        }
      } else {
        callback(400, { 'Error': 'User do not exist' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing Required fileds for the token' });
  }
};

// 2.4 TOKENS GET HANDLER
// @required data: id
// @optional data: none
handlers._tokens.get = (data, callback) => {
  // 2.4.1 Check the type of the required data
  const id = typeof (data.queryStringObject.id) == 'string' &&
    data.queryStringObject.id.trim().length == 20 ?
    data.queryStringObject.id.trim() : false;
  if (id) {
    // 2.4.2 Fetch the token
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { 'Error': 'Missing Required Field to get the Token' });
  }
};

// 2.5 TOKENS PUT HANDLER
// @required data: id, extend
// @optional data: none
handlers._tokens.put = (data, callback) => {
  // 2.5.1 Check the typeof the required fields and validate them to proceed
  const id = typeof (data.payload.id) == 'string' &&
    data.payload.id.trim().length == 20 ?
    data.payload.id.trim() : false;
  const extend = typeof (data.payload.extend) == 'boolean' &&
    data.payload.extend == true ? true : false;
  if (id && extend) {
    // 2.5.2 Fetch the token
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        // 2.5.3 Check if the token is valid
        if (tokenData.expires > Date.now()) {
          // 2.5.4 Set the exparation date + 1 HOUR from now
          tokenData.expires = Date.now() + 1000 * 60 * 60;
          // 2.5.5 Store the data to the file system
          _data.update('tokens', id, tokenData, (err) => {
            if (!err) {
              callback(200);
            } else {
              callback(500, { 'Error': 'Could not update the token' });
            }
          });
        } else {
          callback(400, { 'Error': 'Token have expired' });
        }
      } else {
        callback(400, { 'Error': 'No such Token exists' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required fileds, or they are invalid to update the Token' });
  }
};

// 2.6 TOKENS DELETE HANDLER
// @required data: id
// @optional data: none
handlers._tokens.delete = (data, callback) => {
  // 2.6.1 Chec teh typeof of the required data and validate it
  const id = typeof (data.queryStringObject.id) == 'string' &&
    data.queryStringObject.id.trim().length == 20 ?
    data.queryStringObject.id.trim() : false;
  if (id) {
    // 2.6.2 Feth the token
    _data.read('tokens', id, (err, data) => {
      if (!err && data) {
        // 2.6.3 Delete the token data
        _data.delete('tokens', id, (err) => {
          if (!err) {
            callback(200);
          } else {
            callback(500, { 'Error': 'Could not delete Token' });
          }
        });
      } else {
        callback(400, { 'Error': ' Could not find the token' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing Required Fileds to delete the Token' });
  }
};

// 2.7 Verify if the TokenId is currently valid for the given user
handlers._tokens.verifyToken = (id, phone, callback) => {
  // 2.7.1 Fet the token
  _data.read('tokens', id, (err, tokenData) => {
    if (!err && tokenData) {
      // 2.7.2 Check that the token corresponds to the user and valid
      if (tokenData.phone == phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
}

// 3. CHECKS SERVICE
// 3.1 MAIN CONTAINER
handlers.checks = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._checks[data.method](data, callback);
  } else {
    callback(403);
  }
}
// 3.2 _SUB_CONTAINER
handlers._checks = {};

// 3.3 CHECKS POST HANDLER
// @required data: protocol, url, method, successCodes, timeoutSeconds
// @optional data: none
handlers._checks.post = (data, callback) => {
  // 3.3.1 Validate the typeof the required data
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
    // 3.3.2 Validate the token
    const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
    // 3.3.3 Fetch the user data through the token data
    _data.read('tokens', token, (err, tokenData) => {
      if (!err && tokenData) {
        // 3.3.4 Get the User phone number
        const userPhone = tokenData.phone;
        // 3.3.5 Get the user data
        _data.read('users', userPhone, (err, userData) => {
          if (!err && userData) {
            // 3.3.6 Validate the checks type
            const userChecks = typeof (userData.checks) == 'object' &&
              userData.checks instanceof Array ?
              userData.checks : [];
            // 3.3.7 Verify that the user has less than the maximum number of checks
            if (userChecks.length < config.maxChecks) {
              // 3.3.8 Verify that the url given has DNS entries and can be resolved
              const parsedUrl = _url.parse(protocol + '://' + url, true);
              const hostname = typeof (parsedUrl.hostname) == 'string' &&
                parsedUrl.hostname.length > 0 ?
                parsedUrl.hostname : false;
              dns.resolve(hostname, (err, records) => {
                if (!err && records) {
                  // 3.3.9 Create a random id for the new check and checkObject
                  const checkId = helpers.createRandomString(20);
                  const checkObject = {
                    'id': checkId,
                    'userPhone': userPhone,
                    'protocol': protocol,
                    'url': url,
                    'method': method,
                    'successCodes': successCodes,
                    'timeoutSeconds': timeoutSeconds
                  };
                  // 3.3.10 Store the object to the file system
                  _data.create('checks', checkId, checkObject, (err) => {
                    if (!err) {
                      // 3.3.11 Add teh checkId to the userObject
                      userData.checks = userChecks;
                      userData.checks.push(checkId);
                      // 3.3.12 Store the new userData to the file system
                      _data.update('users', userPhone, userData, (err) => {
                        if (!err) {
                          callback(200, checkObject);
                        } else {
                          callback(500, { 'Error': 'Could not update the user with the new check' });
                        }
                      });
                    } else {
                      callback(500, { 'Error': 'Could not create the new check' });
                    }
                  });
                } else {
                  callback(400, { 'Error': 'The hostname of the URL entered did not resolved to any DNS entries' });
                }
              });
            } else {
              callback(400, { 'Error': `User has the maximum number of checks ${config.maxChecks}` });
            }
          } else {
            callback(400, { 'Error': 'User doesn\'t exist' });
          }
        });
      } else {
        callback(403, { 'Error': 'Token is invalid, or expired' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing Required fields for the Checks Creation' });
  }
};

// 3.4 CHECKS GET HANDLER
// @required data: id
// @optional data: none
handlers._checks.get = (data, callback) => {
  //3.4.1 Validate the required data
  const id = typeof (data.queryStringObject.id) == 'string' &&
    data.queryStringObject.id.trim().length == 20 ?
    data.queryStringObject.id.trim() : false;
  if (id) {
    // 3.4.2 Fetch the chekc by id
    _data.read('checks', id, (err, checkData) => {
      if (!err && checkData) {
        // 3.4.3 Verify the provided token
        const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
        handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
          if (tokenIsValid) {
            // 3.4.4 Return the check data to the user
            callback(200, checkData);
          } else {
            callback(403, { 'Error': 'The provided token is invalid' });
          }
        });
      } else {
        callback(404, { 'Error': 'Theres no such check data' });
      }
    });
  } else {
    callback(400, { 'Error': 'The ID  to get the Check is invalid' });
  }
};

// 3.5 CHECKS PUT HANDLER
// @required data: id
// @optional data: protocol, url, method, successCodes, timeoutSeconds ( one should be provided)
handlers._checks.put = (data, callback) => {
  // 3.5.1 Validate the required data type
  const id = typeof (data.payload.id) == 'string' &&
    data.payload.id.trim().length == 20 ?
    data.payload.id.trim() : false;
  // 3.5.2 Validate the optional data type
  const protocol = typeof (data.payload.protocol) == 'string' &&
    ['http', 'https'].indexOf(data.payload.protocol) > -1 ?
    data.payload.protocol : false;
  const url = typeof (data.payload.url) == 'string' &&
    data.payload.url.trim().length > 0 ?
    data.payload.url.trim() : false;
  const method = typeof (data.payload.method) == 'string' &&
    ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 &&
    data.payload.method instanceof Array ?
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
  // 3.5.2 Validate the required data
  if (id) {
    // 3.5.3 Check for optional data
    if (protocol || url || method || successCodes || timeoutSeconds) {
      // 3.5.4 Fetch the check data
      _data.read('checks', id, (err, checkData) => {
        if (!err && checkData) {
          // 3.5.5 Verify the provided token
          const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
          handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
            if (tokenIsValid) {
              // 3.5.6 Update the check data with optional data
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
              // 3.5.6 Store the check data updates to the file system
              _data.update('checks', id, checkData, (err) => {
                if (!err) {
                  callback(200, checkData);
                } else {
                  callback(500, { 'Error': 'Could not update the check' });
                }
              });
            } else {
              callback(403, { 'Error': 'The token is invalid, or expired' });
            }
          });
        } else {
          callback(400, { 'Error': 'There is no such checkData' });
        }
      });
    } else {
      callback(400, { 'Error': 'No data to update the check' });
    }
  } else {
    callback(400, { 'Error': 'Missing Required Filed to update the check' });
  }
};

// 3.6 CHECKS DELETE HANDLER
// @required data: id
// @optional data: none
handlers._checks.delete = (data, callback) => {
  // 3.6.1 Validate the required data
  const id = typeof (data.queryStringObject.id) == 'string' &&
    data.queryStringObject.id.trim().length == 20 ?
    data.queryStringObject.id.trim() : false;
  if (id) {
    // 3.6.2 Fetch the check
    _data.read('checks', id, (err, checkData) => {
      if (!err && checkData) {
        // 3.6.3 Verify the provided token
        const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
        handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
          if (tokenIsValid) {
            // 3.6.4. Delete the check data
            _data.delete('checks', id, (err) => {
              if (!err) {
                // 3.6.5 Fetch the user Data to update the check array
                _data.read('users', checkData.userPhone, (err, userData) => {
                  if (!err && userData) {
                    // 3.6.6 Get the user checks list
                    const userChecks = typeof (userData.checks) == 'object' &&
                      userData.checks instanceof Array ?
                      userData.checks : [];
                    // 3.6.7 Delete the deleted checks from the checks list
                    const checkPosition = userChecks.indexOf(id);
                    if (checkPosition > -1) {
                      userChecks.splice(checkPosition, 1);
                      // 3.6.8 Store the user data to the file system
                      _data.update('users', checkData.userPhone, userData, (err) => {
                        if (!err) {
                          callback(200);
                        } else {
                          callback(500, { 'Error': 'Could not update the user' });
                        }
                      });
                    } else {
                      callback(500, { 'Error': 'Could not find the checks on the user object, so could not remove it' });
                    }
                  } else {
                    callback(500, { 'Error': ' Could not find the user who created the check, so could not delte the check from the list of checks' });
                  }
                });
              } else {
                callback(500, { 'Error': 'Could not delete the check' });
              }
            });
          } else {
            callback(403, { 'Error': 'The token is invalid, or expired' });
          }
        });
      } else {
        callback(400, { 'Error': 'No such check' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required data to delete a check' });
  }
};

// 4. ERRORs HANDLER
handlers.exampleError = (data, callback) => {
  const err = new Error('This is an example error');
  throw (err);
};



// 3. EXPORT THE HANDLERS
module.exports = handlers;
