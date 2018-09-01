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

// 4. Log list
// List all the logs, and optionaly include the compress logs
lib.list = (includeCompressedLogs, callback) => {
  fs.readdir(lib.baseDir, (err, data) => {
    if (!err && data && data.length > 0) {
      const trimmedFileNames = [];
      data.forEach(fileName => {
        // Add the .log files
        if (fileName.indexOf('.log') > -1) {
          trimmedFileNames.push(fileName.replace('.log', ''));
        }
        // Add on the .gz files to the array
        if (fileName.indexOf('.gz.b64') > -1 && includeCompressedLogs) {
          trimmedFileNames.push(fileName.replace('.gz.b64', ''));
        }
      });
      callback(false, trimmedFileNames);
    } else {
      callback(err, data);
    }
  });
};

// 5. Compress
// Compress the contains of one .log file into a .gs.b64 file within the same directory
lib.compress = (logId, newFileId, callback) => {
  // State the files
  const sourceFile = logId + '.log';
  const destFile = newFileId + '.gz.b64';
  // Read the file
  fs.readFile(lib.baseDir + sourceFile, 'utf-8', (err, inputString) => {
    if (!err && inputString) {
      // Compress the data using gzip
      zlib.gzip(inputString, (err, buffer) => {
        if (!err && buffer) {
          // Send the data to the destination file
          fs.open(lib.baseDir + destFile, 'wx', (err, fileDescriptor) => {
            if (!err && fileDescriptor) {
              // Wtire to the destination file
              fs.writeFile(fileDescriptor, buffer.toString('base64'), (err) => {
                if (!err) {
                  fs.close(fileDescriptor, (err) => {
                    if (!err) {
                      callback(false);
                    } else {
                      callback(err);
                    }
                  });
                } else {
                  callback(err);
                }
              });
            } else {
              callback(err);
            }
          })
        } else {
          callback(err);
        }
      });
    } else {
      callback(err);
    }
  });
};


// 6. Decompresss
// Decompress contents to the string variable
lib.decompress = (fileId, callback) => {
  const fileName = fileId + '.gs.b64';
  fs.readFile(lib.baseDir + fileName, 'utf-8', (err, str) => {
    if (!err && str) {
      // Decompress the data
      const inputBuffer = Buffer.from(str, 'base64');
      zlib.unzip(inputBuffer, (err, outputBuffer) => {
        if (!err && outputBuffer) {
          // Callback
          const str = outputBuffer.toString();
          callback(false, str);
        } else {
          callback(err);
        }
      });
    } else {
      callback(err);
    }
  });
};

// Truncate the file
lib.truncate = (logId, callback) => {
  fs.truncate(lib.baseDir + logId + '.log', 0, (err) => {
    if (!err) {
      callback(false);
    } else {
      callback(err);
    }
  });
}

// Export the container
module.exports = lib;