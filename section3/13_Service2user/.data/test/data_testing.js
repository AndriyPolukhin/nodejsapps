// @TEST SECTION
// 1. Dependencies
const _data = require('./lib/data');

// 2. Actual testing of the data flow

// 2.1 Create a file and write data to it
_data.create('test', 'newFile', { 'Anastasia': 'my wife' }, (err) => console.log('this was the erorr', err));

// 2.2 Read a file
_data.read('test', 'newFile', (err, data) => console.log('this was the error', err, 'and this was the data', data));

// 2.3 Update the file
_data.update('test', 'newFile', { 'Anastasia': 'loves Andriy' }, (err, data) => console.log('this was the error', err));

// 2.4 Delete a file
_data.delete('test', 'newFile', (err) => {
  console.log('this was the error', err);
});

// @TEST SECTION _END