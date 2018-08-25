/*
* LIbrary for storing and editing data
*
*/

// 1. Dependencies
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

// 2. Container for the module and baseDirectory
const lib = {};
// Set the base directoiry for the whole file
lib.baseDir = path.join(__dirname, '/../.data/');

// 3. Write to a file
lib.create = function (dir, file, data, callback) {
  // 3.1 Try to open a file for writing
  fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fileDescriptor) => {
    // 3.1.1. Using a "ERROR PATTERN" in the callback
    if (!err && fileDescriptor) {
      // 3.1.2 Conver the data to a string
      const stringData = JSON.stringify(data);
      // 3.1.3 Write to file and close it:
      fs.writeFile(fileDescriptor, stringData, (err) => {
        // 3.2.1 Continue if there is no error
        if (!err) {
          // 3.2.1 Close the file
          fs.close(fileDescriptor, (err) => {
            if (!err) {
              // 3.2.2 Callback false, using error back pattern
              callback(false);
            } else {
              callback('Error closing new file');
            }
          });
        } else {
          callback('Error writing to a new file');
        }
      });
    } else {
      callback('Could not create a new file, it may already exist');
    }
  });

};
// 4. Read from a file
lib.read = function (dir, file, callback) {
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
lib.update = function (dir, file, data, callback) {
  fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      const stringData = JSON.stringify(data);
      // 5.1 Truncate the content of the file before writing
      fs.ftruncate(fileDescriptor, (err) => {
        if (!err) {
          // 5.2 Write to the file and close it
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
              callback('Error writing to file');
            }
          });
        } else {
          callback('Error truncating a file');
        }
      });
    } else {
      callback('Could not open a file for update, it may not exist yet');
    }
  })
};

// 6. Delete the file
lib.delete = function (dir, file, callback) {
  // Unlink a file from the file system
  fs.unlink(lib.baseDir + dir + '/' + file + '.json', (err) => {
    if (!err) {
      callback(false);
    } else {
      callback('Error could not delete a file');
    }
  });
};


// 7. Export the module
module.exports = lib;