/*
* Library for CRUD operations: storing and editing data
*
*/

// 1. Dependencies
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

// 2. Container for the module ( to be exported)
const lib = {};
// Define the directory of a data folder
lib.baseDir = path.join(__dirname, '/../data/');

// 3. Writing data to a file
lib.create = (dir, file, data, callback) => {
  // 3.1. Open the file for writing/create the file
  fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      // Convert data to a string
      const stringData = JSON.stringify(data);
      // Write to the file and close it
      fs.writeFile(fileDescriptor, stringData, (err) => {
        if (!err) {
          // Close the file
          fs.close(fileDescriptor, (err) => {
            if (!err) {
              callback(false);
            } else {
              callback('Error closing the file');
            }
          });
        } else {
          callback('Error writing to a file');
        }
      });
    } else {
      callback('Could not create new file, it may already exist');
    }
  });
}

// 4. Reading data from a file
lib.read = (dir, file, callback) => {
  fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf-8', (err, data) => {
    if (!err && data) {
      const parsedData = helpers.parseJsonToObject(data);
      callback(false, parsedData);
    } else {
      callback(err, data);
    }
  });
};

// 5. Updating data in the file
lib.update = (dir, file, data, callback) => {
  // Open file for writing
  fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      const stringData = JSON.stringify(data);
      // Truncate the contents of the file
      fs.ftruncate(fileDescriptor, (err) => {
        if (!err) {
          // Write to the file and close it
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
              callback('Error writing to existing file');
            }
          });
        } else {
          callback('Error truncating the file');
        }
      });
    } else {
      callback('Could not open the file for updating, it may not exist yet');
    }
  });
};

// 6. Deleting data from a file/or a file
lib.delete = (dir, file, callback) => {
  // Unlink the file
  fs.unlink(lib.baseDir + dir + '/' + file + '.json', (err) => {
    if (!err) {
      callback(false);
    } else {
      callback('Error deleting the file');
    }
  });
};
// 7. Export
module.exports = lib;