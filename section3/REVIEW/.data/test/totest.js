
// TESTING
// @todo: delete this afterwords
const _data = require('./lib/data');

_data.create('test', 'newFile', { 'Anastasia': 'Tsukrova' }, (err) => {
  console.log('this was the error', err);
});

_data.read('test', 'newFile', (err, data) => {
  console.log('this was the error', err, 'and this was the data', data);
});

_data.update('test', 'newFile', { 'Anastasia': 'Polukhina' }, (err) => {
  console.log('this was the error', err);
});

_data.delete('test', 'newFile', (err) => {
  console.log('this was the error', err);
});