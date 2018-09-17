/*
* Example of a TCP client (net)
* Connects to port 6000 and sends the work "ping" to the server
* CERTIFICATES NEED TO BE INCLUDED, BECAUSE THEY ARE CREATED LOCAL and DO NOT HAVE THE REQUIRED AUTHORITY
*/


// 1. DEPENDENCIES
const tls = require('tls');
const fs = require('fs');
const path = require('path');

// 2. Outbound Message
const outboundMessage = 'ping';

// 3. Create the client

const options = {
  'ca': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
  // only required, because using the self-signed certificate
};

const client = tls.connect(6000, options, () => {
  // 3.1 Send the message
  client.write(outboundMessage);
});

// 4. PARSE THE MESSSGE FROM THE SERVER, AFTER SENDING THE MESSAGE
client.on('data', (inboundMessage) => {
  const messageString = inboundMessage.toString();
  console.log('I wrote ' + outboundMessage + ' and they send the ' + messageString);
  client.end();
});
