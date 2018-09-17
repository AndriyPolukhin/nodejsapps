/*
* Example of TCP ( net ) server
* Listens to port 6000 and send the word "pong" to client
*/

// 1. DEPENDENCIES
const net = require('net');

// 2. CREATE A SERVER
const server = net.createServer((connection) => {
  // 2.1 Send the outbound message (pong);
  const outboundMessage = 'pong';
  connection.write(outboundMessage);

  // 2.2 When the client writes something, log it out
  connection.on('data', (inboundMessage) => {
    const messageString = inboundMessage.toString();
    console.log('I wrote ' + outboundMessage + " and they said " + messageString);
  });
});


// 3. Listen
server.listen(6000, () => {
  console.log('Server running on port 6000');
});