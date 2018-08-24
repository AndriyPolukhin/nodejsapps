/*
* Primary file for an API
*
*/

// 1. Dependencies:
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');
const handlers = require('./lib/handlers');

// Server:
// 2.1 HTTP
// 2.1.1 Instantiate the https server
const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res);
});
// 2.1.2 Starting a http server
httpServer.listen(config.httpPort, () => console.log(`Running on ${config.httpPort}`));

// 2.2 HTTPS
// 2.2.1 Creating server options
const httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};

// 2.2.2 Instantiate the https server
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res);
});
// 2.2.3 Startring a https server
httpsServer.listen(config.httpsPort, console.log(`Running on  ${config.httpsPort}`));

// 2.3 All the server logic for both the http and https server:
const unifiedServer = (req, res) => {
  // 2.3.1 Get the url and parse it
  const parsedUrl = url.parse(req.url, true);
  // 2.3.2 Get the path and trimm it
  const path = parsedUrl.path;
  const trimmedPath = path.replace(/^\/||\/+$/g, '');
  // 2.3.3 Get the query stirng object
  const queryStringObject = parsedUrl.query;
  // 2.3.4 Get the method
  const method = req.method.toLowerCase();
  // 2.3.5 Get the headers object
  const headers = req.headers;
  // 2.3.6 Get the payload, if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', (data) => {
    buffer += decoder.write(data);
  });
  req.on('end', () => {
    buffer += decoder.end();

    // 2.3.7 Handlers
    // 2.3.7-1 Choose the handler this request should go to.
    // 2.3.7-2 If one is not found chose the not found handler
    const choseHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
    // 2.3.7-3 Construct a data object to send the handler
    const data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': buffer
    };
    // 2.3.7-4 Route the request specified in the router
    choseHandler(data, function (statusCode, payload) {
      // 2.3.7-4-1 Use the statusCode provided by the router, or use default: 200
      statusCode = typeof (statusCode) == 'number' ? statusCode : 200;
      // 2.3.7-4-2 Use the payload provided by the router, or use the default object: {}
      payload = typeof (paylaod) == 'object' ? payload : {};
      // 2.3.7-4-3 Convert the payload into a string
      const payloadString = JSON.stringify(payload);
      // 2.3.7-4-4 Return the response: Content Type, status, payload
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
      console.log(`Running this response: ${statusCode}, ${payloadString}`);
    });
  });
};



// Router
const router = {
  'ping': handlers.ping,
  'users': handlers.users
};