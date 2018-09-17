/*
* EXAMPLE UDP SERVER
* CREATING A DATAGRAMM SERVER LISTENING ON PORT 6000
*/

// 1. DEPENDENCIES
const dgram = require('dgram');

// 2. Creating a server
const server = dgram.createSocket('udp4');

// 3. Configuration in case of recieved connection
server.on('message', (messageBuffer, sender) => {
  // 3.1 Do something with the message, or do something with the sender
  const messageString = messageBuffer.toString();
  console.log(messageString);
});

// 4. Bind to the server
server.bind(6000, () => {
  console.log('Server is running on port 6000');
});

