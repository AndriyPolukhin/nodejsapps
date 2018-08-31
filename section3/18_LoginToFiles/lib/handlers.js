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

// 5. USER handlers

// 5.1 Container for user sub-methods