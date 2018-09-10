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

// 4. List all the logs, and optionaly include the compressed logs
lib.list = (includeCompressedLogs, callback) => {
  // 4.1 Read the files from a folder
  fs.readdir(lib.baseDir, (err, data) => {
    if (!err && data && data.length > 0) {
      let trimmedFileNames = [];
      data.forEach((fileName) => {
        // 4.2 Add the .log files
        if (fileName.indexOf('.log') > -1) {
          trimmedFileNames.push(fileName.replace('.log', ''));
        }
        // 4.3 Add on the .gz base64
        if (fileName.indexOf('.gz.b64') > -1 && includeCompressedLogs) {
          trimmedFileNames.push(fileName.replace('.gz.b64', ''));
        }
      });
      callback(false, trimmedFileNames);
    } else {
      callback(err, data);
    }
  });
}

// 5. Compresss the contents of .log file to a .gz.b64 in same dir
lib.compress = (logId, newFileId, callback) => {
  // 5.1 Define the call id
  const sourceFile = logId + '.log';
  // 5.2. Define the destination file
  const destFile = newFileId + '.gz.b64';
  // 5.3. Read the source file
  fs.readFile(lib.baseDir + sourceFile, 'utf-8', (err, inputString) => {
    if (!err && inputString) {
      // 5.4. Compress the data unsing gzip
      zlib.gzip(inputString, (err, buffer) => {
        if (!err && buffer) {
          // 5.5 Send the data to the destFile
          fs.open(lib.baseDir + destFile, 'wx', (err, fileDescriptor) => {
            if (!err && fileDescriptor) {
              // 5.6 Write to the dest file
              fs.writeFile(fileDescriptor, buffer.toString('base64'), (err) => {
                if (!err) {
                  // 5.7 Close the file
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
          });
        } else {
          callback(err);
        }
      });
    } else {
      callback(err);
    }
  });
};

// 6. Decompress the content of the .gz.b64 filr to a string file
lib.decompress = (fileId, callback) => {
  // 6.1 File Name
  const fileName = fileId + '.gz.b64';
  // 6.2 Read the file
  fs.readFile(lib.baseDir + fileName, 'utf-8', (err, str) => {
    if (!err && str) {
      // 6.3 Decompress the data
      const inputBuffer = Buffer.from(str, 'base64');
      // 6.4 Unzip
      zlib.unzip(inputBuffer, (err, outputBuffer) => {
        if (!err && outputBuffer) {
          // 6.5 Callback the string
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
}

// 7. Truncate the log files
lib.truncate = (logId, callback) => {
  fs.truncate(lib.baseDir + logId + '.log', 0, (err) => {
    if (!err) {
      callback(false);
    } else {
      callback(err);
    }
  });
}


// Export
module.exports = lib;