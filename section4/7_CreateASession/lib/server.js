/*
* SERVER related tasks
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

// 2. Instantiate the server object
const server = {};

// 2.1 Http Server
server.httpServer = http.createServer((req, res) => {
  server.unifiedServer(req, res);
});



// 2.2 Https Server
server.httpsServerOptions = {
  'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
  'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
}
server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
  server.unifiedServer(req, res);
});




// 2.3. Unified Server
server.unifiedServer = (req, res) => {
  // 2.1 get the url and parse it
  const parsedUrl = url.parse(req.url, true);
  // 2.2 get the path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');
  // 2.3 what is the method
  const method = req.method.toLowerCase();
  // 2.4 Query String as an object
  const queryStringObject = parsedUrl.query;
  // 2.5 Get the headres as an object
  const headers = req.headers;
  // 2.6 Get the paylaod if there is any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';

  req.on('data', (data) => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {

    buffer += decoder.end();

    // Chose the handler this request should go to. If one is not ound chose the notfound.handler
    let chosenHandler = typeof (server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

    // Add logic for the  public router
    // If the requrest is within the public directory use the public handlers instead
    chosenHandler = trimmedPath.indexOf('public/') > -1 ? handlers.public : chosenHandler;
    // Construct a data object to send to the handlers
    const data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': helpers.parseJsonToObject(buffer)
    };
    // Route the request to the handler specified in the router
    chosenHandler(data, (statusCode, payload, contentType) => {

      // Determine the type of response (default to JSON)
      contentType = typeof (contentType) == 'string' ? contentType : 'json';

      // Default status code
      statusCode = typeof (statusCode) == 'number' ? statusCode : 200;


      // Return the response parts that are content specifig
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
        payloadString = typeof (payload) == 'string' ? payload : '';
      }
      // Return the response parts that are common to all contents types
      res.writeHead(statusCode);
      res.end(payloadString);

      // if the response is 200, print green, otherwise print red
      if (statusCode == 200) {
        debug('\x1b[32m%s\x1b[0m', method.toUpperCase() + '/' + trimmedPath + ' ' + statusCode);
      } else {
        debug('\x1b[31m%s\x1b[0m', method.toUpperCase() + '/' + trimmedPath + ' ' + statusCode);
      }
    });
  });
};



// 6. Request router
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


// 7. Server init
server.init = () => {
  // 7.1 Start the http server
  server.httpServer.listen(config.httpPort, () => {
    console.log('\x1b[36m%s\x1b[0m', `Server is running on port: ${config.httpPort} in ${config.envName} mode`);
  });
  // 7.2  Start teh https server
  server.httpsServer.listen(config.httpsPort, () => {
    console.log('\x1b[35m%s\x1b[0m', `Server running on port: ${config.httpsPort} in ${config.envName} mode`);
  });
}

// 8. Export
module.exports = server;