/*
* Example HTTP2 CLIENT
*
*/

// 1. DEPENDENCIES
const http2 = require('http2');

// 2. Create a client
const client = http2.connect('http://localhost:6000');

// 3. REQUEST

// 3.1 Configuration
const req = client.request({
  ':path': '/'
});

// 3.2 When a message is recieved add the pieces of it together until the end is reached
let str = '';
req.on('data', (chunk) => {
  str += chunk;
});

// 3.3 When the message ends, log it out
req.on('end', () => {
  console.log(str);
});

// 3.4 End the request
req.end();