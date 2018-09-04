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
    const chosenHandler = typeof (server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

    // Construct a data object to send to the handlers
    const data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': helpers.parseJsonToObject(buffer)
    };
    // Route the request to the handler specified in the router
    chosenHandler(data, (statusCode, payload) => {
      // Default status code
      statusCode = typeof (statusCode) == 'number' ? statusCode : 200;
      // Payload default object
      payload = typeof (payload) == 'object' ? payload : {};
      // Convert payload to a string
      const payloadString = JSON.stringify(payload);
      // Return the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
      console.log('\x1b[36m%s\x1b[0m', `Returning this response: ${statusCode} ${payloadString}`);
    });
  });
};



// 6. Request router
server.router = {
  'ping': handlers.ping,
  'users': handlers.users,
  'tokens': handlers.tokens,
  'checks': handlers.checks
};


// 7. Server init
server.init = () => {
  // 7.1 Start the http server
  server.httpServer.listen(config.httpPort, () => {
    console.log('\x1b[32m%s\x1b[0m', `Server is running on port: ${config.httpPort} in ${config.envName} mode`);
  });
  // 7.2  Start teh https server
  server.httpsServer.listen(config.httpsPort, () => {
    console.log('\x1b[33m%s\x1b[0m', `Server running on port: ${config.httpsPort} in ${config.envName} mode`);
  });
}

// 8. Export
module.exports = server;