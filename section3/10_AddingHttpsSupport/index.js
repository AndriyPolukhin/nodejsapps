/*
* Primary file for a API
*
*/

// 1. Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');

// Servers:
// 1. HTTP:

// 1.1 Instantiating the http server
const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res);
});

// 1.2. Start the http server
httpServer.listen(config.httpPort, () => console.log(`Running on port: ${config.httpPort}`));

// 2. HTTPS
// 2.1. Instantiate the https server
const httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res);
});
// 2.2 Start the https server
httpsServer.listen(config.httpsPort, () => console.log(`Running on port: ${config.httpsPort}`));


// 4. All the server logic for both the http and https server
const unifiedServer = (req, res) => {
  // 2.1 Get the URL and parse it
  const parsedUrl = url.parse(req.url, true);
  // 2.2 Get the path and trim it
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/||\/+$/g, '');
  // 2.3 Get the query string Object
  const queryStringObject = parsedUrl.query;
  // 2.4 Get the http method
  const method = req.method;
  // 2.5 Get the headres object
  const headers = req.headers;
  // 2.6 Get the payload, if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', (data) => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {
    buffer += decoder.end();

    // 2.6.1 Chose the handler this request should go to.
    // 2.6.2 If one is not found chose the not found handler
    const choseHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    // 2.6.3 Construct a data object to send to the handler
    const data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headres': headers,
      'payload': buffer
    };

    // 2.6.4 Route the request specified in the router
    choseHandler(data, function (statusCode, payload) {
      // 2.6.4-1 Use the status code provided by the route, or use default: 200
      statusCode = typeof (statusCode) == 'number' ? statusCode : 200;
      // 2.6.4-2 Use the payload provided by the router, ot use the default object: {}
      payload = typeof (payload) == 'object' ? payload : {};
      // 2.6.4-3 Convert payload to a string
      const payloadString = JSON.stringify(payload);
      // 2.6.4-4 Return the response: contentType, status, payload
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
      console.log(`Running this response: ${statusCode} ${payloadString}`);
    });
  });
};




// 4. Handlers
const handlers = {};

handlers.sample = function (data, callback) {
  callback(406, { 'name': 'sample handler' })
};

handlers.notFound = function (data, callback) {
  callback(404);
};
// 5. Router
const router = {
  'sample': handlers.sample
};