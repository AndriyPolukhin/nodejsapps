/*
* Primary file for the API
*
*/

// 1. Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');

// 2.1 Http Server
const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res);
});

httpServer.listen(config.httpPort, () => {
  console.log(`Server is running on port: ${config.httpPort} in ${config.envName} mode`);
});

// 2.2 Https Server
const httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
}
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res);
});

httpsServer.listen(config.httpsPort, () => {
  console.log(`Server running on port: ${config.httpsPort} in ${config.envName} mode`);
})


// 2.3. Unified Server
const unifiedServer = (req, res) => {
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
  const headers = req.headres;
  // 2.6 Get the paylaod if there is any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';

  req.on('data', (data) => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {

    buffer += decoder.end();

    // Chose the handler this request should go to. If one is not ound chose the notfound.handler
    const chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    // Construct a data object to send to the handlers
    const data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': buffer
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
      console.log(`Returning this response: ${statusCode} ${payloadString}`);
    });
  });
};

// 5. Handlers
const handlers = {};

// 5.1 Sample handlers
handlers.sample = (data, callback) => {
  // Callback http status code, and a payload object
  callback(406, { 'name': 'sample handler' });
};

// 5.2 Not found handlers
handlers.notFound = (data, callback) => {
  callback(404);
};

// 6. Request router
const router = {
  'sample': handlers.sample
};