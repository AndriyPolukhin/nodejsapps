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
  // 2.2 Get the path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');
  // 2.3. Get the query string as an object
  const queryStringObject = parsedUrl.query;
  // 2.4 Get the http method
  const method = req.method.toLowerCase();
  //2.5 Send the response
  res.end('Hello World\n');
  console.log(`Request on path: ${trimmedPath} with the method: ${method} and a query string object: `);
  console.log(queryStringObject);
});

// 3. Start the server, and have it listen to port 3000
const port = 3000;
server.listen(port, () => console.log(
  `Server is listening on port: ${port}`
));