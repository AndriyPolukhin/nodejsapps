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

// 2. Servers:
// 2.1 HTTP
// 2.1.1 Instantiating the http server
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
// 2.2.2 Instantiating the https server

const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res);
});
// 2.2.3 Starting a https server
httpsServer.listen(config.httpsPort, () => console.log(`Running on port: ${config.httpsPort}`));

// 2.3 All the server logic for both the http and https server:
const unifiedServer = (req, res) => {
  // 2.3.1 Get the url and parse it
  const parsedUrl = url.parse(req.url, true);
  // 2.3.2 Get the path and trim it
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/||\/+$/g, '');
  // 2.3.4. Get the query string object
  const queryStringObject = parsedUrl.query;
  // 2.3.5 Get the http method
  const method = req.method.toLowerCase();
  // 2.3.6 Get the headers obejct
  const headers = req.headers;
  // 2.3.7 Get the payload, if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', (data) => {
    buffer += decoder.write(data);
  });
  req.on('end', () => {
    buffer += decoder.end();

    // 2.3.7-1 Chose the handler this request should go to.
    // 2.3.7-2 If one is not found chose the not found hanlder
    const choseHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
    // 2.3.7-3 Construct a data object to send the handler
    const data = {
      'tirmmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': buffer
    };
    // 2.3.7-4 Route the request specified in the router
    choseHandler(data, function (statusCode, payload) {
      // 2.3.7-4-1 Use the status code provided by the router, or use default: 200
      statusCode = typeof (statusCode) == 'number' ? statusCode : 200;
      // 2.3.7-4-2 Use the payload provided by the router, or use the defauld object: {}
      payload = typeof (payload) == 'object' ? payload : {};
      // 2.3.7-4-3 Convert the payload into a string
      const payloadString = JSON.stringify(payload);
      // 2.3.7-4-4 Return the response: content Type, status, payload
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
      console.log(`Running this response: ${statusCode} ${payloadString}`);
    });
  });
};

// 3. Handlers:
// 3.1 Container
const handlers = {};
// 3.2 Ping Router
handlers.ping = function (data, callback) {
  callback(200);
}


// 3.3. Not Found
handlers.notFound = function (data, callback) {
  callback(404);
};

// 4. Router
const router = {
  'ping': handlers.ping
}