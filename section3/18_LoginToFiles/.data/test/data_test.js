// Testing data storing
const _data = require('../../lib/data');

// 1. Writing to a file
_data.create('test', 'newFile', { 'Anastaia': 'Tsukrova' }, (err) => {
  console.log('this was the error', err);
});
// 2. Reading from a file
_data.read('test', 'newFile', (err, data) => {
  console.log('this was the error', err, 'and this was the data', data);
});

// 3. Update the file
_data.update('test', 'newFile', { 'Anastasia': 'Polukhina' }, (err) => {
  console.log('this was the error', err);
});

// 4. Delete the existing file
_data.delete('test', 'newFile', (err) => {
  console.log('this was the erorr', err);
});


// @TODO Get RID OF THIS LATER
helpers.sendTwilioSms('0933570119', 'This is Twilio API in action', (err) => {
  console.log('this was the error', err);
});