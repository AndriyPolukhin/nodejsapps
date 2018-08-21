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
    res.end(`Payload received`);
    console.log(`${buffer}`);
    console.log(trimmedPath, method, headers, queryStringObject);
  });
});

// 3. Listner
const port = 3000;
server.listen(port, () => console.log(`Running on port: ${port}`));


// 4. Define handlers
const handlers = {};
// 4.1 Sample handler
handlers.sample = function (data, callback) {

  // Callback a http status code, and payload an object
  callback(406, { 'name': 'sample handler' });
};
// 4.2 Not found handler
handlers.notfound = function (data, callback) {
  callback(404);
};


// 5. Define a request router
const router = {
  'sample': handlers.sample
};