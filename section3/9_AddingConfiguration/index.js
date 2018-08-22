/*
* Primary file for a API
*
*/

// 1. Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');

// 2. Server
const server = http.createServer((req, res) => {
  // 2.1 Get the URL and parse it
  const parsedUrl = url.parse(req.url, true);
  // 2.2 Get the path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/||\/+$/g, '');
  // 2.3 Get the query string object
  const queryStringObject = parsedUrl.query;
  // 2.4 Get the http method
  const method = req.method.toLowerCase();
  // 2.5 Get the headers as an obeject
  const headers = req.headers;
  // 2.6 Get the payload, if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', (data) => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {
    buffer += decoder.end();

    // 2.6.1 Choose the handler this request should go to.
    // 2.6.2 If one is not found choose the not found handler
    const choseHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    // 2.6.3 Construct a data object to send to the handler
    const data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': buffer
    };

    // 2.6.4 Route the request specified in the router
    choseHandler(data, function (statusCode, payload) {
      // 2.6.4-1 Use the status code provided by the handler, or use the default: 200
      statusCode = typeof (statusCode) == 'number' ? statusCode : 200;
      //2.6.4-2 Use the payload object provided or use the default object: {}
      payload = typeof (payload) == 'object' ? payload : {};
      // 2.6.4-3 Convert payload to a string
      const payloadString = JSON.stringify(payload);
      // 2.6.4-4 Return the response: contentType, status, payload
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
      console.log(`Returning this response: ${statusCode} ${payloadString}`);
    });
  })
});

// 3 Listener with configuration for environment
server.listen(config.port, () => console.log(`Runnin on port: ${config.port} in ${config.envName} mode`));

// 4. Define Handlers
const handlers = {};

handlers.sample = function (data, callback) {
  callback(406, { 'name': 'sample handler' });
};

handlers.notFound = function (data, callback) {
  callback(404);
}


// 5. Define ROuter
const router = {
  'sample': handlers.sample
}