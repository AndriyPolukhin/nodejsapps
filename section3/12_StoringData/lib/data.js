/*
* LIbrary for storing and editing data
*
*/

// 1. Dependencies
const fs = require('fs');
const path = require('path');

// 2. COntainer for the module ( to be exported )
const lib = {};

// 2.1. Define the base directory of the foider
lib.baseDir = path.join(__dirname, '/../.data/');

// 3. Write data to a file
lib.create = function (dir, file, data, callback) {
  // 3.1 Open the file for writing
  fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', function (err, fileDescriptor) {
    if (!err && fileDescriptor) {
      // 3.1.1 Convert data to string
      const stringData = JSON.stringify(data);
      //3.1.2 Write to file and close it
      fs.writeFile(fileDescriptor, stringData, function (err) {
        if (!err) {
          // 3.1.3 Close the file
          fs.close(fileDescriptor, function (err) {
            if (!err) {
              callback(false);
            } else {
              callback('Error closing new file')
            }
          });
        } else {
          callback('Error writing to new file');
        }
      })
    } else {
      callback('Could not create new file, it may already exists');
    }
  });
};

// 4. Read data from a file
lib.read = function (dir, file, callback) {
  fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf-8', function (err, data) {
    callback(err, data);
  });
};

// 5. Update the data
lib.update = function (dir, file, data, callback) {
  // 5.1 Open the file for writing
  fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', function (err, fileDescriptor) {
    if (!err && fileDescriptor) {
      // 5.2 Conver the data to a string
      const stringData = JSON.stringify(data);

      // 5.3 Truncate the file
      fs.ftruncate(fileDescriptor, function (err) {
        if (!err) {
          // 5.4 Write to the file and close it
          fs.writeFile(fileDescriptor, stringData, function (err) {
            if (!err) {
              fs.close(fileDescriptor, function (err) {
                if (!err) {
                  callback(false);
                } else {
                  callback('Error closing the file')
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
  })
};

// Delete a file
lib.delete = function (dir, file, callback) {
  // Unlink the file
  fs.unlink(lib.baseDir + dir + '/' + file + '.json', function (err) {
    if (!err) {
      callback(false);
    } else {
      callback('Error deleting file');
    }
  });
};

// Export the module
module.exports = lib;