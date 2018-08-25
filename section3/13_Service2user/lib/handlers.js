/*
* 3. Request Handlers
*
*/

// 1. Dependencies:
const _data = require('./data');
const helpers = require('./helpers');
// 2 Container
const handlers = {};

// 3. Ping Handlers
handlers.ping = function (data, callback) {
  callback(406, { 'ping': 'ping ping ping' });
};

// 4. The not found handler
handlers.notFound = function (data, callback) {
  callback(404);
}

// 5. Users
handlers.users = function (data, callback) {
  // 5.1 Acceptable methods for the route
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

// 5.2 Create a Container for the user submethods
handlers._users = {};
// 5.3. Users POST
// @Required data: firstName, lastName, phone, password, tosAgreement
// @Optional data: none
handlers._users.post = (data, callback) => {
  // 5.3.1 Check that all the required fields are filled out
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

  if (firstName && lastName && phone && password && tosAgreement) {
    // 5.3.2 Make sure that the user doesn't already exist
    _data.read('users', phone, (err, data) => {
      if (err) {
        // 5.4.1 PASSWORD HASHING
        console.log(password);
        const hashedPassword = helpers.hash(password);
        console.log(hashedPassword);
        // 5.4.2 Create a user object
        if (hashedPassword) {

          const userObject = {
            'firstName': firstName,
            'lastName': lastName,
            'phone': phone,
            'hashedPassword': hashedPassword,
            'tosAgreement': true
          };
          // 5.4.3 Store the user
          _data.create('users', phone, userObject, (err) => {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { 'Error': 'Could not create a new user' });
            }
          });
        } else {
          callback(500, { 'Error': 'Could not hash the user\'s password' });
        }

      } else {
        // User already exists
        callback(400, { 'Error': 'User with that phone number already exists' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required fields' });
  }
};

// 5.4 Users GET
// @Required data: phone
// @Optional data: none
// @TODO only let authenticated user access their object, don't let them access anyoneelses
handlers._users.get = (data, callback) => {
  // 5.4.1 Check that the phone number is provided
  const phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if (phone) {
    // Look up the user
    _data.read('users', phone, (err, data) => {
      if (!err && data) {
        // Remove the hashpassword from the user object before returning it to the requestor
        delete data.hashedPassword;
        callback(200, data);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required field' });
  }
};

// 5.5 Users PUT
// @Required data: phone
// @Optional data: firstName, lastName, password, (at least one must be specified)
// @TODO only let an authenticated user update their own object, don't let them update anyone elses
handlers._users.put = (data, callback) => {
  // 5.5.1 Check for the required field
  const phone = typeof (data.payload.phone) == 'string'
    && data.payload.phone.trim().length == 10 ?
    data.payload.phone.trim() : false;

  // 5.5.2 Check for the optional fields
  const firstName = typeof (data.payload.firstName) == 'string'
    && data.payload.firstName.trim().length > 0 ?
    data.payload.firstName.trim() : false;
  const lastName = typeof (data.payload.lastName) == 'string'
    && data.payload.lastName.trim().length > 0 ?
    data.payload.lastName.trim() : false;
  const password = typeof (data.payload.password) == 'string'
    && data.payload.password.trim().length > 0 ?
    data.payload.password.trim() : false;

  // 5.5.3 Error if the phone is invalid
  if (phone) {
    // 5.5.3-1 Error if nothing is send to update
    if (firstName || lastName || password) {
      // Look up the user
      _data.read('users', phone, (err, userData) => {
        if (!err && userData) {
          // Update the fields that are necessary
          if (firstName) {
            userData.firstName = firstName;
          }
          if (lastName) {
            userData.lastName = lastName;
          }
          if (password) {
            userData.hashedPassword = helpers.hash(password);
          }
          // Store the new updates
          _data.update('users', phone, userData, (err) => {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { 'Error': 'Could not update the user' });
            }
          })
        } else {
          callback(400, { 'Error': 'The specified user does not exist' });
        }
      });
    } else {
      callback(400, { 'Error': 'Missing fields to update' });
    }
  } else {
    callback(400, { 'Error': 'Missing required field' });
  }
};

// 5.6 Users DELETE
// @Required data: phone
// @TODO only let an authenticated user delete their object, don't let them delete anyone elses
// @TODO Cleanup (delete) anu other data files associated with this user
handlers._users.delete = (data, callback) => {
  // Check that the phone number is valid
  const phone = typeof (data.queryStringObject.phone) == 'string'
    && data.queryStringObject.phone.trim().length == 10 ?
    data.queryStringObject.phone.trim() : false;
  if (phone) {
    // look up user
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
    callback(400, { 'Error': 'Missing required field' });
  }
};

// 6. Export the handlers
module.exports = handlers;