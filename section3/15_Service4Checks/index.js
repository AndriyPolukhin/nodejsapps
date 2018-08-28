/*
* Primary file for an API
*
*/

// 1. Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');
const config = require('./lib/config');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');

// 2. Server

// 2.1 Http Server
const httpServer = http
  .createServer((req, res) => {
    unifiedServer(req, res);
  });
httpServer
  .listen(config.httpPort,
    () => console.log(`Running server on port: ${config.httpPort}`));

// 2.2 Https Server
const httpsOptionServer = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
}
const httpsServer = https
  .createServer(httpsOptionServer, (req, res) => {
    unifiedServer(req, res);
  });

httpsServer
  .listen(config.httpsPort,
    () => console.log(`Running server on port: ${config.httpsPort}`));

// 2.3 Unified Server
const unifiedServer = (req, res) => {
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

    const choseHandlers = typeof (router[trimmedPath]) !== 'undefined' ?
      router[trimmedPath] : router.notFound;
    const data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'headers': headers,
      'method': method,
      'payload': buffer
    };

    choseHandlers(data, (statusCode, payload) => {
      statusCode = typeof (statusCode) == 'number' ? statusCode : 200;
      payload = typeof (payload) == 'object' ? payload : {};
      const payloadString = JSON.stringify(payload);

      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
      console.log(`Response with this ${statusCode} ${payloadString}`);
    });
  });
};

// 3. Router
const router = {
  'ping': handlers.ping,
  'users': handlers.users,
  'tokens': handlers.tokens
};