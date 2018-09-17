/*
* Example UDP CLIENT
* Sending a message to udp server to port 6000
*
*/

// 1. DEPENDENCIES
const dgram = require('dgram');

// 2. CLIENT
const client = dgram.createSocket('udp4');

// 3. DEFINE THE MESSAGE AND PULL IT INTO THE BUFFER
const messageString = 'This is a message';
const messageBuffer = Buffer.from(messageString);

// 4. Send of the message to the server
client.send(messageBuffer, 6000, 'localhost', (err) => {
  client.close();
});

