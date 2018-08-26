/*
* HANDLERS
*
*/

// 3. Handlers
const handlers = {};
handlers.ping = function (data, callback) {
  callback(406, { 'ping': 'ping ping ping' });
};

handlers.notFound = function (data, callback) {
  callback(404);
};

handlers.users = (data, callback) => {
  callback(200, { 'users': 'user is here' });
};


module.exports = handlers;