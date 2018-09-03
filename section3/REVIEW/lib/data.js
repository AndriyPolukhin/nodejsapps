/*
* LIbrary for storing and editing data
*
*/

// 1. Dependencies
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

// 2. Container for the library
const lib = {};
// base dir on the data object using path
lib.baseDir = path.join(__dirname, '/../.data/');

// 3. Write to a file
lib.create = (dir, file, data, callback) => {
  // Open the file for writing
  fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      // Convert data to a string
      const stringData = JSON.stringify(data);
      // Write to file and close it
      fs.writeFile(fileDescriptor, stringData, (err) => {
        if (!err) {
          fs.close(fileDescriptor, (err) => {
            if (!err) {
              callback(false);
            } else {
              callback('Error closing the file');
            }
          });
        } else {
          callback('Error writing to a new file');
        }
      });
    } else {
      callback('Could not create new file it may already exist');
    }
  });
};


// 4. Read data from a file
lib.read = (dir, file, callback) => {
  fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf-8', (err, data) => {
    if (!err && data) {
      const parsedData = helpers.parseJsonToObject(data);
      callback(false, parsedData);
    } else {
      callback(err, data);
    }
  });
}

// 5. Update the file
lib.update = (dir, file, data, callback) => {
  // Open the file for writing
  fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      // Convert the data to a string
      const stringData = JSON.stringify(data);
      // Truncate the file
      fs.ftruncate(fileDescriptor, (err) => {
        if (!err) {
          // Write to the file and close it
          fs.writeFile(fileDescriptor, stringData, (err) => {
            if (!err) {
              fs.close(fileDescriptor, (err) => {
                if (!err) {
                  callback(false);
                } else {
                  callback('Could not close the file');
                }
              });
            } else {
              callback('Could not write to the file');
            }
          });
        } else {
          callback('Error truncating file');
        }
      });
    } else {
      callback('Could not open the file for update, it may not exist yet.');
    }
  });
};

// 6. Delete data
lib.delete = (dir, file, callback) => {
  // Unlink the file
  fs.unlink(lib.baseDir + dir + '/' + file + '.json', (err) => {
    if (!err) {
      callback(false);
    } else {
      callback('this was the errror', err);
    }
  });
};


// 8. Export the library
module.exports = lib;