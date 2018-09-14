/*
* Library for storing and rotating logs
*
*/

// 1. Dependencies
const fs = require('fs');
const path = require('path');
const zlib = require('zlib'); // compress files

// 2. CONTAINER: for the logs function
const lib = {};
// base directory
lib.baseDir = path.join(__dirname, '/../.logs/');

// 3. APPEND: stirng into files. Create file if it do not exist yet
lib.append = (file, str, callback) => {
  // 3.1 Open the file to append
  fs.open(lib.baseDir + file + '.log', 'a', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      // 3.2 Append the str to a file and close it
      fs.appendFile(fileDescriptor, str + '\n', (err) => {
        if (!err) {
          fs.close(fileDescriptor, (err) => {
            if (!err) {
              callback(false);
            } else {
              callback('Error closing the file');
            }
          });
        } else {
          callback('Error appending to file');
        }
      });
    } else {
      callback('Could not open the file for appending');
    }
  });
}

// 4. LIST ALL: logs and compressed logs
lib.list = (includeCompressedLogs, callback) => {
  // 4.1 REad the files form the folder
  fs.readdir(lib.baseDir, (err, data) => {
    // 4.2 Check if there's any logs files
    if (!err && data && data.length > 0) {
      // 4.3 Trimm the file names
      let trimmedFileNames = [];
      data.forEach((fileName) => {
        // 4.4 Check for '.log' extension
        if (fileName.indexOf('.log') > -1) {
          trimmedFileNames.push(fileName.replace('.log', ''));
        }
        // 4.4 Check for '.gz.b64' extension
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

// 5. COMPRESS: the contents of '.log' files to '.gz.b64' files
lib.compress = (logId, newFileId, callback) => {
  // 5.1 Defined the Source File and Destination file
  const sourceFile = logId + '.log';
  const destFile = newFileId + '.gz.b64';
  // 5.2 READ: the source file
  fs.readFile(lib.baseDir + sourceFile, 'utf-8', (err, inputString) => {
    if (!err && inputString) {
      // 5.3 COMPRESS: the data using gzip
      zlib.gzip(inputString, (err, buffer) => {
        if (!err && buffer) {
          // 5.4 SEND: the data to the destFile
          fs.open(lib.baseDir + destFile, 'wx', (err, fileDescriptor) => {
            if (!err && fileDescriptor) {
              // 5.5 WRITE: to a file
              fs.writeFile(fileDescriptor, buffer.toString('base64'), (err) => {
                if (!err) {
                  // 5.6 CLOSE: the file
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

// 6. DECOMPRESSS: the content of the '.gz.b64' file to a '.log' file
lib.decompress = (fileId, callback) => {
  // 6.1 Set the filename
  const fileName = fileId + '.gz.b64';
  // 6.2 READ: the file
  fs.readFile(lib.baseDir + fileName, 'utf-8', (err, str) => {
    if (!err && str) {
      // 6.3 Decompress the data
      const inputBuffer = Buffer.from(str, 'base64');
      // 6.4 Unzip
      zlib.unzip(inputBuffer, (err, outputBuffer) => {
        if (!err && outputBuffer) {
          // 6.5 Callback the String
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

// 7. TRUNCATE: the log files
lib.truncate = (logId, callback) => {
  fs.truncate(lib.baseDir + logId + '.log', 0, (err) => {
    if (!err) {
      callback(false);
    } else {
      callback(err);
    }
  });
}

// 8. EXPORT THE MODULE
module.exports = lib;