/*
* Request Handlers
*
*/

// 1. Dependencies




// 2. Define all the handlers
// 2.1 Container for handlers
const handlers = {};

// 3. Users handlers
handlers.users = function (data, callback) {
  // 3.1 Acceptable methods for the user route
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};
// 3.2 Container for the users submethod
handlers._users = {};
// 3.2.1 USERS - post
handlers._users.post = (data, callback) => {

};
// 3.2.2 USERS - get
// Requeired fileds: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.get = (data, callback) => {
  // Check that all the required fields are filled out
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
    // make sure that the user already exists

  } else {
    callback(400, { 'Error': 'Missing required fields' });
  }
};
// 3.2.3 USERS - put
handlers._users.put = (data, callback) => {

};
// 3.2.4 USERS - delete
handlers._user.delete = (data, callback) => {

};


// 4. Ping Handler
handlers.ping = function (data, callback) {
  callback(200, { 'ping': 'ping ping ping' });
};

// 5. Not found Handler
handlers.notFound = function (data, callback) {
  callback(404);
};




// 6. Export all of the handlers
module.exports = handlers;