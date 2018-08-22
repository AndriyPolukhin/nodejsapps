/*
* Primary file for a API
*
*/

// 1. Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

// 2. Server
const server = http.createServer((req, res) => {

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');
  const queryStringObject = parsedUrl.query;

  const method = req.method.toLowerCase();
  const headers = req.headers;

  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', (data) => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {
    buffer += decoder.end();

    // 2.1. Choose the handler this request should go to.
    // 2.2. If one is not found choose the not found handler
    const chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    // 2.3. Construct the data object to send to the handler
    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      'payload': buffer
    };

    // 2.4. Route the request specified in the router
    chosenHandler(data, function (statusCode, payload) {
      // 2.4.1. Use the status code provided by the handler or use  deafult 200
      statusCode = typeof (statusCode) == 'number' ? statusCode : 200;
      // 2.4.2. Use the payload object provided or use the default object {}
      payload = typeof (payload) == 'object' ? payload : {};

      // 2.4.3. Covert the payload to a String
      const payloadString = JSON.stringify(payload);
      // 2.4.4. Return the response
      res.writeHead(statusCode);
      res.end(payloadString);
      console.log('Returning this response: ', statusCode, payloadString);
    });

  });
});

// 3. Listner
const port = 3000;
server.listen(port, () => console.log(`Running on port: ${port}`));

// 4. Define Handlers
const handlers = {};

handlers.sample = function (data, callback) {
  // Callback a http status code and a payload object
  callback(406, { 'name': 'sample handler' });
};

handlers.notFound = function (data, callback) {
  callback(404);
};

// 5. Define a request router

const router = {
  'sample': handlers.sample
};