// TESTING DATA STORING
const _data = require('./lib/data');

// @WRITING TO A FILE
_data.create('test', 'newFile', { 'Anastasia': 'Tsukrova' }, (err) => {
  console.log('this was the error', err);
});
// @READING FROM THE FILE
_data.read('test', 'newFile', (err, data) => {
  console.log('this was the error', err, 'and this was the data', data);
});

// @UPDATE THE EXISING FILE
_data.update('test', 'newFile', { 'Anastasia': 'Polukhina' }, (err) => {
  console.log('this was the error', err);
});

// @DELETE THE EXISTING FILE
_data.delete('test', 'newFile', (err) => {
  console.log('this was the error', err);
});