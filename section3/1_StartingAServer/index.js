/*
* Primary file for the API
*
*/

// 1. Dependencies

const http = require('http');

// 2. The Server should respond to all requiests with a string
const server = http.createServer((req, res) => {
  res.end('Hello world\n');
});

// 3. Start the server, and have it listen to port 3000
server.listen(3000, () => console.log(`The server is listening on the port 3000`));