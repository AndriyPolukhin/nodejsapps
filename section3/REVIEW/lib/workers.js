/*
* This are worker related task
*
*/

// 1. Dependencies
const url = require('url');
const http = require('http');
const https = require('https');
const path = require('path');

const fs = require('fs');
const _data = require('./data');
const _logs = require('./logs');
const helpers = require('./helpers');
const util = require('util');
const debug = util.debuglog('workers');

// 2. Instantiate/create the workers object
const workers = {};



// 4. Gatherer ALL CHECKS
// Look up all checks, get their data, send to a validator
workers.gatherAllChecks = () => {
  // 4.1 Get all the checks that exist in the system
  _data.list('checks', (err, checks) => {
    if (!err && checks && checks.length > 0) {
      // 4.2 Call checks
      checks.forEach((check) => {
        // 4.2.1. Read in the chekc data
        _data.read('checks', check, (err, originalCheckData) => {
          if (!err && originalCheckData) {
            // 4.2.2 Pass the data to the validator and let that function continue or log errors as needed
            workers.validateCheckData(originalCheckData);
          } else {
            debug('Error reading one of the check\'s data');
          }
        });
      });
    } else {
      debug('Error: Could not find any checks to process');
    }
  });
}
// 5. Sanity-checking of the check-data
workers.validateCheckData = (originalCheckData) => {
  // 5.1. Validate the original Chck data
  originalCheckData = typeof (originalCheckData) == 'object' &&
    originalCheckData !== null ?
    originalCheckData : {};
  originalCheckData.id = typeof (originalCheckData.id) == 'string' &&
    originalCheckData.id.trim().length == 20 ?
    originalCheckData.id.trim() : false;
  originalCheckData.userPhone = typeof (originalCheckData.userPhone) == 'string' &&
    originalCheckData.userPhone.trim().length == 10 ?
    originalCheckData.userPhone.trim() : false;
  originalCheckData.protocol = typeof (originalCheckData.protocol) == 'string' &&
    ['http', 'https'].indexOf(originalCheckData.protocol) > -1 ?
    originalCheckData.protocol : false;
  originalCheckData.url = typeof (originalCheckData.url) == 'string' &&
    originalCheckData.url.trim().length > 0 ?
    originalCheckData.url.trim() : false;
  originalCheckData.method = typeof (originalCheckData.method) == 'string' &&
    ['post', 'get', 'put', 'delete'].indexOf(originalCheckData.method) > -1 ?
    originalCheckData.method : false;
  originalCheckData.successCodes = typeof (originalCheckData.successCodes) == 'object' &&
    originalCheckData.successCodes instanceof Array &&
    originalCheckData.successCodes.length > 0 ?
    originalCheckData.successCodes : false;
  originalCheckData.timeoutSeconds = typeof (originalCheckData.timeoutSeconds) == 'number' &&
    originalCheckData.timeoutSeconds % 1 === 0 &&
    originalCheckData.timeoutSeconds >= 1 &&
    originalCheckData.timeoutSeconds <= 5 ?
    originalCheckData.timeoutSeconds : false;

  // 5.2 Set the keys that may not be set (if the workers never see this check befoer)
  originalCheckData.state = typeof (originalCheckData.state) == 'string' &&
    ['up', 'down'].indexOf(originalCheckData.state) > -1 ?
    originalCheckData.state : 'down';
  originalCheckData.lastChecked = typeof (originalCheckData.lastChecked) == 'number' &&
    originalCheckData.lastChecked > 0 ?
    originalCheckData.lastChecked : false;
  // 5.3 If all the chekc pass, then pass the data to the next process in the process
  if (
    originalCheckData.id &&
    originalCheckData.userPhone &&
    originalCheckData.protocol &&
    originalCheckData.url &&
    originalCheckData.method &&
    originalCheckData.successCodes &&
    originalCheckData.timeoutSeconds) {
    // 5.4 Perform the check
    workers.performCheck(originalCheckData);
  } else {
    debug('Erorr: One of the checks is not properly formatted');
  };
};

// 6. Perform the check: send the original check data and the outcome of the check process to the next step in the process
workers.performCheck = (originalCheckData) => {
  // 6.1 Prepare the initial check outcome
  let checkOutcome = {
    'error': false,
    'responseCode': false
  };
  // 6.2. Mark that the outcome has not been sent yet
  let outcomeSent = false;
  // 6.3 Parse the host name out of the originalCheckData ( to know who is the one)
  const parsedUrl = url.parse(originalCheckData.protocol + '://' + originalCheckData.url, true);
  const hostname = parsedUrl.hostname;
  const path = parsedUrl.path; // Using path, not the pathname(because we need the whole query string)

  // 6.4 Construct the request
  const requestDetails = {
    'protocol': originalCheckData.protocol + ':',
    'hostname': hostname,
    'method': originalCheckData.method.toUpperCase(),
    'path': path,
    'timeout': originalCheckData.timeoutSeconds * 1000
  };

  // 6.5. Instantiate/create the request object using http/https module
  const _moduleToUse = originalCheckData.protocol == 'http' ? http : https;
  const req = _moduleToUse.request(requestDetails, (res) => {
    // 6.5.1. Grab the status cf the send request
    const status = res.statusCode;
    // 6.5.2. Update the checkOutcome and pass the data along
    checkOutcome.responseCode = status;
    if (!outcomeSent) {
      workers.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });
  // 6.6. Bind to the error event so it doesn't get thrown
  req.on('error', (e) => {
    // 6.6.1 Update the checkoutcome and pass the data along
    checkOutcome.error = {
      'error': true,
      'value': e
    };
    if (!outcomeSent) {
      workers.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  // 6.7 Bind to the timeout event
  req.on('timeout', (e) => {
    // 6.7.1 Update he checkout na pass the data along
    checkOutcome.error = {
      'error': true,
      'value': 'timeout'
    };
    if (!outcomeSent) {
      workers.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  // 6.8 End the request
  req.end();
};

// 7. Process Check Outcome and update the check data as needed and trigger the alert to the user if needed
// Special logic for accomodating a check that never been tested before
workers.processCheckOutcome = (originalCheckData, checkOutcome) => {
  // 7.1 Decide if the check is considered up/donw in this current state
  const state = !checkOutcome.error &&
    checkOutcome.responseCode &&
    originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down';
  // 7.2 Decide if the alert is warranted
  const alertWarranted = originalCheckData.lastChecked &&
    originalCheckData.state !== state ? true : false;


  // 7.3 Update the check data
  const timeOfCheck = Date.now();
  workers.log(originalCheckData, checkOutcome, state, alertWarranted, timeOfCheck);
  const newCheckData = originalCheckData;
  newCheckData.state = state;
  newCheckData.lastChecked = timeOfCheck;


  // 7.4 Save the updates to disk
  _data.update('checks', newCheckData.id, newCheckData, (err) => {
    if (!err) {
      // 7.4.1. Send the new check data to the next phase in the process if needed
      if (alertWarranted) {
        workers.alertUserToStatusChange(newCheckData);
      } else {
        debug('Check outcome has not changed, no alert needed');
      }
    } else {
      debug('Error trying to save udpates to one of the checks');
    }
  });
};

// 8. Alert User to Status Change
workers.alertUserToStatusChange = (newCheckData) => {
  const msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`;
  helpers.sendTwilioSms(newCheckData.userPhone, msg, (err) => {
    if (!err) {
      debug('Success: User was alerted to a status change in their check, via sms:', msg);
    } else {
      debug('Error: Could not send sms alert to user who head a status cahnge in their check');
    }
  });
};

// Workers log function
workers.log = (originalCheckData, checkOutcome, state, alertWarranted, timeOfCheck) => {
  // 2.1 Form the log data
  const logData = {
    'check': originalCheckData,
    'outcome': checkOutcome,
    'state': state,
    'alert': alertWarranted,
    'time': timeOfCheck
  };
  // 2.2 Convert to a string
  const logString = JSON.stringify(logData);
  // 2.3 Determine the name of the log file
  const logFileName = originalCheckData.id;
  // 2.4 Append the log string to the file
  _logs.append(logFileName, logString, (err) => {
    if (!err) {
      debug(`Logging to file succeded`);
    } else {
      debug(`Loggin to file failed`);
    }
  });
};

// 3. Loop
// 3.1 Timer to execute the worker process once per minute
workers.loop = () => {
  setInterval(() => {
    workers.gatherAllChecks();
  }, 1000 * 60);
};
// 3.2  Rotate/Compress Logs files
workers.rotateLogs = () => {
  // 3.2.1 List all the uncompressed log files
  _logs.list(false, (err, logs) => {
    if (!err && logs && logs.length > 0) {
      logs.forEach((logName) => {
        // 3.2.2 Compress the data to a different file
        const logId = logName.replace('.log', '');
        const newFileId = logId + '-' + Date.now();
        _logs.compress(logId, newFileId, (err) => {
          if (!err) {
            // 3.2.3 Truncating the log
            _logs.truncate(logId, (err) => {
              if (!err) {
                debug('Success truncating the log file');
              } else {
                debug('Error truncating the log file');
              }
            });
          } else {
            debug('Error compressing one of the log files');
          }
        });
      });
    } else {
      debug('Error could not find any logs ro rotate');
    }
  })
}
// 3.3  Log Rotation Loop
// Timer to execute the log rotation process once per day
workers.logRotationLoop = () => {
  setInterval(() => {
    workers.rotateLogs();
  }, 1000 * 60 * 60 * 24)
}



// 9. Init Script
workers.init = () => {
  // debug the files
  console.log('\x1b[33m%s\x1b[0m', `Background Workers are running`);
  // 7.1 Execute all the checks immediately
  workers.gatherAllChecks();
  // 7.2 Call a loop so the checks would continue to execute on their own
  workers.loop();
  // 7.3 Compress All the logs immediately
  workers.rotateLogs();
  // 7.4 Compression loop
  workers.logRotationLoop();

};

// 10. Export the workers
module.exports = workers;