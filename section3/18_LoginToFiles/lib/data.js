/*
* Library for storing and editing data
*
*/

// 1. Dependencies
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

// 2. Container for the module (to be exported)
const lib = {};
// Define the directory of a data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// 3. Writing data to a file
lib.create = (dir, file, data, callback) => {
  // 3.1 Open the file for writing/creat a file
  fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fileDescriptor) {
    if (!err && fileDescriptor) {
      // 3.2 Convert data to a string
      const stringData = JSON.stringify(data);
      // 3.3 Write to the file and close it
      fs.writeFile(fileDescriptor, stringData, (err) => {
        if (!err) {
          // 3.4 Close the file
          fs.close(fileDescriptor, (err) => {
            if (!err) {
              callback(false);
            } else {
              callback(`Error closing ${file}`);
            }
          })
        } else {
          callback(`Error writing to a ${file}`);
        }
      });
    } else {
      callback(`Could not create ${file}, it may already exists`);
    }
  });
};

// 4. Reading data from a file
lib.read = (dir, file, callback) => {
  fs.readFile(lib.baseDir = dir + '/' + file + '.json', 'utf-8', (err, data) => {
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
  // 5.1. Open the file for writing
  fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      // 5.2 Stringify the data
      const stringData = JSON.stringify(data);
      // 5.3 Truncate the contents of the file
      fs.ftruncate(fileDescriptor, (err) => {
        if (!err) {
          // 5.4. Write to the file
          fs.writeFile(fileDescriptor, stringData, (err) => {
            if (!err) {
              // 5.5. Close the file
              fs.close(fileDescriptor, (err) => {
                if (!err) {
                  callback(false);
                } else {
                  callback(`Error closing the ${file}`);
                }
              });
            } else {
              callback('Error writing to existing file');
            }
          });
        } else {
          callback(`Error truncationg the ${file}`);
        }
      });
    } else {
      callback(`Could not open the ${file} for updating, it may not exist yet`);
    }
  });
};

// 6. Deleting data from a file/or a file
lib.delete = (dir, file, callback) => {
  // 6.1. Unlink the file from the system
  fs.unlink(lib.baseDir + dir + '/' + file + '.json', (err) => {
    if (!err) {
      callback(false);
    } else {
      callback(`Error deleting the ${file}`);
    }
  });
};

// 7. List all the files in the directory
lib.list = (dir, callback) => {
  // 7.1 Read the file names
  fs.readdir(lib.baseDir + dir + '/', (err, data) => {
    if (!err && data && data.length > 0) {
      // 7.2 Trim the file names
      let trimmedFileNames = [];
      data.forEach((fileName) => {
        trimmedFileNames.push(fileName.replace('.json', ''));
      });
    } else {
      callback(err, data);
    }
  });
};

// 8. Exporting the module
module.exports = lib;