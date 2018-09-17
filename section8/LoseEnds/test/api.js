/*
* CONTAINER THE API TESTS
*
*/

// 1. DPEENDENCIES
const app = require('./../index');
const assert = require('assert');
const http = require('http');
const config = require('./../lib/config');

// 2. HOLDER FOR THE TEST
const api = {};

// 3. HELPERS
const helpers = {};
helpers.makeGetRequest = (path, callback) => {
  // 3.1 Configure the request details
  const requestDetails = {
    'protocol': 'http:',
    'hostname': 'localhost',
    'port': config.httpPort,
    'method': 'GET',
    'path': path,
    'headers': {
      'Content-Type': 'application/json '
    }
  };
  // 3.2 Send the request
  const req = http.request(requestDetails, (res) => {
    callback(res);
  });
  req.end();
};

// 4. The main init function should be able to run without throwing
api['app.init should start without throwing'] = (done) => {
  assert.doesNotThrow(() => {
    app.init((err) => {
      done();
    });
  }, TypeError);
};

// 5. Request to the PING
api['/ping should respond to GET with 200'] = (done) => {
  helpers.makeGetRequest('/ping', (res) => {
    assert.equal(res.statusCode, 200);
    done();
  });
};

// 6. Request to API/USERS
api['/api/users should respond to GET with 400'] = (done) => {
  helpers.makeGetRequest('/api/users', (res) => {
    assert.equal(res.statusCode, 400);
    done();
  });
};

// 7. Reauest to a random path
api['A random path sholud response to GET with 404'] = (done) => {
  helpers.makeGetRequest('/this/path/shouldnt/exist', (res) => {
    assert.equal(res.statusCode, 404);
    done();
  });
};


// EXPORT THE TEST TO THE RUNNER
module.exports = api;
