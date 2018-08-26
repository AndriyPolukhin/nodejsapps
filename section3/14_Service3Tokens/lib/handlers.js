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
// @TODO : Only let authenticated user access their object, don't let them access anyone elses
handlers._users.get = (data, callback) => {
  // 5.3.1. Check that the phone number is valid
  const phone = typeof (data.queryStringObject.phone) == 'string'
    && data.queryStringObject.phone.trim().length == 10 ?
    data.queryStringObject.phone.trim() : false;

  if (phone) {
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
    callback(400, { 'Error': 'Missing required filed' });
  }
};






// Export handlers
module.exports = handlers;