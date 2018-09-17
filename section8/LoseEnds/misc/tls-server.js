/*
* Example of TLS  server
* Listens to port 6000 and send the word "pong" to client
*/

// 1. DEPENDENCIES
const tls = require('tls');
const fs = require('fs');
const path = require('path');

// 1. ADD SERVER OPTIONS
const options = {
  'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
  'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};

// 2. CREATE A SERVER
const server = tls.createServer(options, (connection) => {
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