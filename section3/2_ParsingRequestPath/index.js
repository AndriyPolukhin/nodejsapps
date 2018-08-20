/*
* Primary file for the API
*
*/

// 1. Dependencies

const http = require('http');
const url = require('url');

// 2. The server should respond to all requests with a string
const server = http.createServer((req, res) => {
  // 2.1 Get the url and parse it
  const parsedUrl = url.parse(req.url, true);
  // 2.2. Get the path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');
  // 2.3 Send the response
  res.end('Hello World\n');

  // 2.4 Log the request path
  console.log(`Request is received on ${trimmedPath}`);

});

// 3. Start the server, and have it listen to port 3000
server.listen(3000, () => console.log(`The Server is listening on port 3000`));