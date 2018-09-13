/*
* SERVER tasks
*
*/

// 1. Dependencies
const http = require('http');
const https = require('https');
const url = require('url');

const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');
const path = require('path');

const config = require('./config');
const handlers = require('./handlers');
const helpers = require('./helpers');
const util = require('util');
const debug = util.debuglog('server');

// 2. CONTAINER FOR SERVER
const server = {};

// 3. HTTP SEVER
server.httpServer = http.createServer((req, res) => {
  server.unifiedServer(req, res);
});

// 4. HTTPS SERVER
server.httpsServerOptions = {
  'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
  'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
  /* openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem */
}
server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
  server.unifiedServer(req, res);
});

// 5. UNIFIED SERVER
server.unifiedServer = (req, res) => {
  // 5.1 URL: parsed
  const parsedUrl = url.parse(req.url, true);
  // 5.2 PATH
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');
  // 5.3 METHOD
  const method = req.method.toLowerCase();
  // 5.4 Query String object
  const queryStringObject = parsedUrl.query;
  // 5.5 Headers
  const headers = req.headers;
  // 5.6 Payload
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', (data) => {
    buffer += decoder.write(data);
  });

  // 5.7 Send the data to the route
  req.on('end', () => {
    // 5.7.1 End the buffer
    buffer += decoder.end();

    // 5.7.2 Set the handler for the request
    let chosenHandler = typeof (server.router[trimmedPath]) !== 'undefined' ?
      server.router[trimmedPath] : handlers.notFound;

    // 5.7.3 Logic for the public router for request
    chosenHandler = trimmedPath.indexOf('public/') > -1 ? handlers.public : chosenHandler;

    // 5.7.3 DATA OBJECT: construct and send to the ChosenHandler
    const data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': helpers.parseJsonToObject(buffer)
    };

    // 5.7.4 ROUTE: the request to the handler specified in the router
    chosenHandler(data, (statusCode, payload, contentType) => {
      // 7.7.4.1 CONTENT TYPE: determine
      contentType = typeof (contentType) == 'string' ? contentType : 'json';
      // 7.7.4.2 STATUS CODE: determine
      statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

      // 7.7.4.3 CONTENT SPECIFIC: parts
      let payloadString = '';
      if (contentType == 'json') {
        res.setHeader('Content-Type', 'application/json');
        payload = typeof (payload) == 'object' ? payload : {};
        payloadString = JSON.stringify(payload);
      }
      if (contentType == 'html') {
        res.setHeader('Content-Type', 'text/html');
        payloadString = typeof (payload) == 'string' ? payload : '';
      }
      if (contentType == 'favicon') {
        res.setHeader('Content-Type', 'image/x-icon');
        payloadString = typeof (payload) !== 'undefined' ? payload : '';
      }
      if (contentType == 'css') {
        res.setHeader('Content-Type', 'text/css');
        payloadString = typeof (payload) !== 'undefined' ? payload : '';
      }
      if (contentType == 'png') {
        res.setHeader('Content-Type', 'image/png');
        payloadString = typeof (payload) !== 'undefined' ? payload : '';
      }
      if (contentType == 'jpg') {
        res.setHeader('Content-Type', 'image/jpeg');
        payloadString = typeof (payload) !== 'undefined' ? payload : '';
      }
      if (contentType == 'js') {
        res.setHeader('Content-Type', 'text/javascript');
        payloadString = typeof (payload) !== 'undefined' ? payload : '';
      }
      if (contentType == 'plain') {
        res.setHeader('Content-Type', 'text/plain');
        payloadString = typeof (payload) !== 'string' ? payload : '';
      }
      // 7.7.4.4 CONTENT COMMON: parts
      res.writeHead(statusCode);
      res.end(payloadString);

      // 7.7.4.5 Status code Colors
      if (statusCode == 200) {
        debug('\x1b[32m%s\x1b[0m', method.toUpperCase() + '/' + trimmedPath + ' ' + statusCode);
      } else {
        debug('\x1b[31m%s\x1b[0m', method.toUpperCase() + '/' + trimmedPath + ' ' + statusCode);
      }
    });
  });
};


// 6. ROUTER
server.router = {
  '': handlers.index,
  'account/create': handlers.accountCreate,
  'account/edit': handlers.accountEdit,
  'account/deleted': handlers.accountDeleted,
  'session/create': handlers.sessionCreate,
  'session/deleted': handlers.sessionDeleted,
  'checks/all': handlers.checksList,
  'checks/create': handlers.checksCreate,
  'checks/edit': handlers.checksEdit,
  'ping': handlers.ping,
  'api/users': handlers.users,
  'api/tokens': handlers.tokens,
  'api/checks': handlers.checks,
  'favicon.ico': handlers.favicon,
  'public': handlers.public
};


// 7. SERVER INIT
server.init = () => {
  // 7.1 Start the HTTP SERVER
  server.httpServer.listen(config.httpPort, () => {
    console.log('\x1b[36m%s\x1b[0m', `Server is running on port: ${config.httpPort} in ${config.envName} mode`);
  });
  // 7.2 Start the HTTPS SERVER
  server.httpsServer.listen(config.httpsPort, () => {
    console.log('\x1b[35m%s\x1b[0m', `Server is running on port: ${config.httpsPort} in ${config.envName} mode`);
  });
}

// 8. EXPORT
module.exports = server;