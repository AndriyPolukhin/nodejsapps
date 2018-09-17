/*
* Example of a TCP client (net)
* Connects to port 6000 and sends the work "ping" to the server
*
*/

// 1. DEPENDENCIES
const net = require('net');

// 2. Outbound Message
const outboundMessage = 'ping';

// 3. Create the client
const client = net.createConnection({ 'port': 6000 }, () => {
  // 3.1 Send the message
  client.write(outboundMessage);
});

// 4. PARSE THE MESSSGE FROM THE SERVER, AFTER SENDING THE MESSAGE
client.on('data', (inboundMessage) => {
  const messageString = inboundMessage.toString();
  console.log('I wrote ' + outboundMessage + ' and they send the ' + messageString);
  client.end();
});
