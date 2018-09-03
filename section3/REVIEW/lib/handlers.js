/*
* This are the Request handlers
*
*/

// 1. Dependencies
const _data = require('./data');
const helpers = require('./helpers');

// 2. Handlers Container
const handlers = {};

// 2.1 Ping handlers
handlers.ping = (data, callback) => {
  callback(200);
};

// 2.2 Not found handlers
handlers.notFound = (data, callback) => {
  callback(404);
};

// 3. USER HANDLERS
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
    // 3.2. Look up the user
    _data.read('users', phone, (err, data) => {
      if (!err && data) {
        // 3.3. Remove the hashed pasword
        delete data.hashedPassword;
        callback(200, data);
      } else {
        callback(404, { 'Error': 'The user do not exist' });
      }
    })
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
      callback(400, { 'Error': 'Missing data to update' });
    }
  } else {
    callback(400, { 'Error': 'Missing Required Field' });
  }
};

// 3.5 Handlers USER DELETE
// @required: phoen
// @todo: only let the authenticated user delete object
// @todo: delete any other assocciated files
handlers._users.delete = (data, callback) => {
  // 3.5.1. Check that the phone is valid
  const phone = typeof (data.queryStringObject.phone) == 'string' &&
    data.queryStringObject.phone.trim().length == 10 ?
    data.queryStringObject.phone.trim() : false;
  if (phone) {
    _data.read('users', phone, (err, data) => {
      if (!err && data) {
        // 3.5.2 Delete the data
        _data.delete('users', phone, (err) => {
          if (!err) {
            callback(200);
          } else {
            callback(500, { 'Error': 'Could not delete the user' });
          }
        })
      } else {
        callback(400, { 'Error': 'Could not find the specified user' });
      }
    })
  } else {
    callback(400, { 'Error': 'Missing Required Field' });
  }
};




// 9. Export the handlers
module.exports = handlers;