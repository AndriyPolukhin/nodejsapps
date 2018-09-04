/*
* Library for storing and rotating logs
*
*/

// 1. Dependencies
const fs = require('fs');
const path = require('path');
const zlib = require('zlib'); // compressing files

// 2. COntainer for the module
const lib = {};
// base directory
lib.baseDir = path.join(__dirname, '/../.logs/');

// 3. The Append function
// Append a string to a file. Create a file if it do not exist
lib.append = (file, str, callback) => {
  // 3.1 Open the file for appending
  fs.open(lib.baseDir + file + '.log', 'a', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      // 3.2 Append to a file an close it
      fs.appendFile(fileDescriptor, str + '\n', (err) => {
        if (!err) {
          fs.close(fileDescriptor, (err) => {
            if (!err) {
              callback(false);
            } else {
              callback('Error closing file that was being appended');
            }
          });
        } else {
          callback('Error appending to file');
        }
      });
    } else {
      callback('Could not open file for appending');
    }
  });
};


// Export
module.exports = lib;