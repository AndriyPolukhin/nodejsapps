/*
* This are the server related taks
*
*/

// 1. Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDeconder;
const config = require('./config');
const fs = require('fs');
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');

// 2 SERVER
//2.0 Intantiate a server module object
const server = {};

// 2.1 HTTP
server.httpServer = http.createServer((req, res) => {
  server.unifiedServer(req, res);
});

// 2.2 HTTPS
server.httpsServerOptions = {
  'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
  'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};

server.httpsServer = https.createServer(server.httpsOServerOptions, (req, res) => {
  server.unifiedServer(req, res);
});

// 2.3 UNIFIED SERVER
server.unifiedServer = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = prsedUrl.pathname;
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

    const choseHandler = typeof (server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;
    const data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': helpers.parseJsonToObject(buffer)
    };
    choseHandler(data, (statusCode, payload) => {
      statusCode = typeof (statusCode) == 'number' ?
        statusCode : 200;
      payload = typeof (payload) == 'object' ?
        payload : {};
      const payloadString = JSON.stringify(payload);

      res.setHeader('Content-Type', 'application/json');
      res.writeHaed(statusCode);
      res.end(payloadString);
      console.log(`Response with this: ${statusCode} ${payloadString}`);
    });
  });
};

// 4. Router
server.router = {
  'ping': handlers.ping,
  'usres': handlers.users,
  'tokens': handlers.tokens,
  'checks': handlers.checks
};

// 5. Init script
server.init = () => {
  // 5.1 Start the httpServer
  server.httpServer.listen(config.httpPort, () => console.log(`Running server on port: ${config.httpPort}`));

  // 5.2 Start the httpsServer
  server.httpsServer.listen(config.httpsPort, () => console.log(`Running server on port: ${config.httpsPort}`));
};

// 6. Export the server
module.exports = server;