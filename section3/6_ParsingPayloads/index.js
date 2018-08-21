/*
* Primary file for the API
*
*/

// 1. Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

// 2. The server should respond to all request with a string
const server = http.createServer((req, res) => {
  // 2.1 Get the url and parse it
  const parsedUrl = url.parse(req.url, true);
  // 2.2 Get the path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');
  // 2.3 Get the query string as an object
  const queryStringObject = parsedUrl.query;
  // 2.4 Get the http method
  const method = req.method.toLowerCase();
  // 2.5 Get the headers as an object
  const headers = req.headers;
  // 2.7 Get the payload, if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';

  req.on('data', function (data) {
    buffer += decoder.write(data);
  });

  req.on('end', function () {
    buffer += decoder.end();

    // 2.8 Send the response
    res.end('Sending the Response\n');
    console.log(
      `Request on path: ${trimmedPath}
    with the ${method} method and
    a query string object: `, queryStringObject,
      `The received headers are: `, headers,
      `The recieved payload is: `, buffer);
  });

});

// 3. Server should listen to port 3000
const port = 3000;
server.listen(port, () => console.log(`Server running on port: ${port}`));