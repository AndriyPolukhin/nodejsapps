/*
* Library for storing and editing data
*
*/

// 1. Dependencies:
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');


// 2. CONTAINER: for the functions
const lib = {};
// route for the data to be fetch/put
lib.baseDir = path.join(__dirname, '/../.data/');

// 3. CREATE: create a/write to a file
lib.create = (dir, file, data, callback) => {
  // 3.1 USE OPEN: create a/write to a file
  fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      // 3.2 Convert the data to a string
      const stringData = JSON.stringify(data);
      // 3.3 Write data to the file and close it
      fs.writeFile(fileDescriptor, stringData, (err) => {
        if (!err) {
          fs.close(fileDesciprot, (err) => {
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
      callback('Could not create new file, it may already exist');
    }
  });
}

// 4. READ: data from a file
lib.read = (dir, file, callback) => {
  // 4.1 USE READ: to view the data
  fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf-8', (err, data) => {
    if (!err && data) {
      // 4.2 Parse data to object
      const parsedData = helpers.parseJsonToObject(data);
      callback(false, parsedData);
    } else {
      callback(err, data);
    }
  });
}

// 5. UPDATE: put new data to a file
lib.update = (dir, file, data, callback) => {
  // 5.1 OPEN: file for writing
  fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', (err, fileDesciptor) => {
    if (!err && fileDesciptor) {
      // 5.2 Convert the data to a string
      const stringData = JSON.stringify(data);
      // 5.3 Truncate the file (in order to append new data)
      fs.ftruncate(fileDesciptor, (err) => {
        if (!err) {
          // 5.4 Write to a file and close it
          fs.writeFile(fileDesciptor, stringData, (err) => {
            if (!err) {
              fs.close(fileDescriptor, (err) => {
                if (!err) {
                  callback(false);
                } else {
                  callback('Could not close the file');
                }
              })
            } else {
              callback('Could not write to a file');
            }
          })
        } else {
          callback('Error truncating file');
        }
      });
    } else {
      callback('Could not open the file for updates, it may not exist yet');
    }
  });
}

// 6. DELETE: the files will be deleted
lib.delete = (dir, file, callback) => {
  // 6.1 USE UNLINK: to delete from file system
  fs.unlink(lib.baseDir + dir + '/' + file + '.json', (err) => {
    if (!err) {
      callback(false);
    } else {
      callback('Could not delete the file');
    }
  });
}

// 7. LIST ALL: files in the directory
lib.list = (dir, callback) => {
  // 7.1 Readdir: use to read file names
  fs.readdir(lib.baseDir + dir + '/', (err, data) => {
    // 7.2 Check if there any data
    if (!err && data && data.length > 0) {
      // 7.3 Trimm the file names
      let trimmedFileNames = [];
      data.forEach((fileName) => {
        trimmedFileNames.push(fileName.replace('.json', ''));
      });
      callback(false, trimmedFileNames);
    } else {
      callback(err, data);
    }
  });
}

// 8. Export the library
module.exports = lib;