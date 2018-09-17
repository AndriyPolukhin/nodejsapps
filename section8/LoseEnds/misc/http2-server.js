/*
* Examples HTTP2 Server
*
*/

// 1. DEPENDENCIES
const http2 = require('http2');

// 2. INIT A SERVER
const server = http2.createServer();

// 3. CONFIGURE BEHAVIOR

// 3.1 On a stream, send back html
server.on('stream', (stream, headers) => {
  stream.respond({
    'status': 200,
    'content-type': 'text/html'
  });
  stream.end(
    `<html>
      <body>
        <p>Hello from http2 server</p>
      </body>
    </html>`);
});

// 4. Listen on a port
server.listen(6000, () => {
  console.log(`Server is running on port: 6000`);
});