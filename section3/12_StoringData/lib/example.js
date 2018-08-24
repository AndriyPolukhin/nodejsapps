const _data = require('./lib/data');

// TESTING
// @TODO delete this
// writing
/*
_data.create('test', 'newFile', { 'foo': 'bar' }, function (err) {
    console.log('this was the eror', err);
});
*/
/*
// reading
_data.read('test', 'newFile', function (err, data) {
    console.log('this was the error', err, 'and this was the data', data);
});
*/
/*
// updating
_data.update('test', 'newFile', { 'fizz': 'buzz' }, function (err) {
    console.log('this was the error', err);
});
*/
_data.delete('test', 'newFile', function (err) {
  console.log('this was the erorr', err);
});