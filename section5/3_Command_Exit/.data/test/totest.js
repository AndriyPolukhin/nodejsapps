// TESTING The data.js

// 1. Dependencies
const _data = require('./lib/data');

// 2. Test the Create function
_data.create('test', 'newFile', { 'Anastasia': 'Tsukrova' }, (err) => {
  console.log('this was the error', err);
});


// 3. Test the Read function
_data.read('test', 'newFile', (err) => {
  console.log('this was the err', err, 'this was the data', data);
});

// 4. Test the Update function
_data.update('test', 'newFile', { 'Anastasia': 'Polukhina' }, (err) => {
  console.log('this was the error', err);
});

// 5. Test the Delete function
_data.delete('test', 'newFile', (err) => {
  console.log('this was the error', err);
});


// 6. Test the SMS from Twilio
helpers.sendTwilioSms('5153751452', 'Hello there', (err) => {
  console.log('this was the error', err);
});