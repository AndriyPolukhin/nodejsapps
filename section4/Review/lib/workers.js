/*
* WORKERS tasks
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

// 2. CONTAINER FOR WORKERS
const workers = {};

// 3. GATHER ALL CHECKS: Fetch all checks data, validate it
workers.gatherAllChecks = () => {
  // 3.1 Fetch all checks on the system
  _data.list('checks', (err, checks) => {
    if (!err && checks && checks.length > 0) {
      // 3.2  Cycle through the checks
      checks.forEach((check) => {
        // 3.3 Fetch the checks data
        _data.read('checks', check, (err, originalCheckData) => {
          if (!err && originalCheckData) {
            // 3.4 Validate the check data
            workes.validateCheckData(originalCheckData);
          } else {
            debug(`Error reading the check data`);
          }
        });
      });
    } else {
      debug(`Error reading one of the checks data`);
    }
  });
};

// 4. VALIDATE CHECK DATA: check the type of the check-data
workers.validateCheckData = (originalCheckData) => {
  // 4.1 Validate the type for the data
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
  // 4.2 Set the keys that may not be set (first time workes checks run)
  originalCheckData.state = typeof (originalCheckData.state) == 'string' &&
    ['up', 'down'].indexOf(originalCheckData.state) > -1 ?
    originalCheckData.state : 'down';
  originalCheckData.lastChecked = typeof (originalCheckData.lastChecked) == 'number' &&
    originalCheckData.lastChecked > 0 ?
    originalCheckData.lastChecked : false;
  // 4.3 Send the validated data to the Perform Check function
  if (
    originalCheckData.id &&
    originalCheckData.userPhone &&
    originalCheckData.protocol &&
    originalCheckData.url &&
    originalCheckData.method &&
    originalCheckData.successCodes &&
    originalCheckData.timeoutSeconds
  ) {
    workers.preformCheck(originalCheckData);
  } else {
    debug(`Error: One of the checks data is not properly formatted`);
  }
};

// 5. PERFORM CHECK: check the original check data and provide the outcome of the check
workers.performCheck = (originalCheckData) => {
  // 5.1 Set the initial check outcome
  let checkOutcome = {
    'error': false,
    'responseCode': false;
  };
  // 5.2 Indicate that the outcome is not sent
  let outcomeSent = false;
  // 5.3 Parse the hostname from the original check data
  const parsedUrl = url.parse(originalCheckData.protocol + '://' + originalCheckData.url, true);
  const hostname = parsedUrl.hostname;
  const path = parsedUrl.path; // Provides the whole query string

  // 5.4 Construct the request
  const requestDetails = {
    'protocol': originalCheckData.protocol + ':',
    'hostname': hostname,
    'method': originalCheckData.method.toUpperCase(),
    'path': path,
    'timeout': originalCheckData.timeoutSeconds * 1000
  };

  // 5.5 Create the request module using http/https
  const _moduleToUse = originalCheckData.protocol == 'http' ? http : https;
  const req = _moduleToUse.request(requestDetails, (res) => {
    // 5.5.1 Get the status of the request
    const status = res.statusCode;
    // 5.5.2 Update the checkoutcome
    checkOutcome.responseCode = status;
    if (!outcomeSent) {
      workers.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });
  // 5.6 Bind to the error event, so it doesn't get thrown
  req.on('error', (e) => {
    // 5.6.1 Update the checkoutcome
    checkOutcome.error = {
      'error': true,
      'value': e
    };
    if (!outcomeSent) {
      workers.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });
  // 5.7 Bind to the timeout event
  req.on('timeout', (e) => {
    // 5.7.1 Update the checkoutcome
    checkOutcome.error = {
      'error': true,
      'value': 'timeout'
    };
    if (!outcomeSent) {
      workers.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });
  // 5.8 End the request
  req.end();
};

// 6. PROCESS CHECK OUTCOME: update the check data as needed and trigger the alert
workers.processCheckOutcome = (originalCheckData, checkOutcome) => {
  // 6.1 Decide if check state is up/down
  const state = !checkOutcome.error &&
    checkOutcome.responseCode &&
    originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down';
  // 6.2 Decide if alert is warranted
  const alertWarranted = originalCheckData.lastChecked &&
    originalCheckData.state !== state ? true : false;
  // 6.3 Update the check data
  const timeOfCheck = Date.now();
  workers.log(originalCheckData, checkOutcome, state, alertWarranted, timeOfCheck);
  const newCheckData = originalCheckData;
  newCheckData.state = state;
  newCheckData.lastChecked = timeOfCheck;
  // 6.4 Store the updates to the file system
  _data.update('checks', newCheckData.id, newCheckData, (err) => {
    if (!err) {
      // 6.4.1 Alert the user of status change
      if (alertWarranted) {
        workers.alertUserToStatusChange(newCheckData);
      } else {
        debug(`Check outcome has not changed, no alert needed`);
      }
    } else {
      debug(`Error trying to save the updates to one of the checks`);
    }
  });
}

// 7. ALERT USER TO STATUS CHANGE
workers.alertUserToStatusChange = (newCheckData) => {
  // 7.1 Construct a message to the user
  const msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`;
  helpers.sendTwilioSms(newCheckData.userPhone, msg, (err) => {
    if (!err) {
      debug(`Success: User was alerted to a status change in their check, via sms: ${msg}`);
    } else {
      debug(`Error: Could not send sms alert to user who head a staus change in their check`);
    }
  });
};

// 8. WORKERS LOG
workers.log = (originalCheckData, checkOutcome, state, alertWarranted, timeOfCheck) => {
  // 8.1 Form the log data
  const logData = {
    'check': originalCheckData,
    'outcome': checkOutcome,
    'state': state,
    'alert': alertWarranted,
    'time': timeOfCheck
  };
  // 8.2 Convert to a string
  const logString = JSON.stringify(logData);
  // 8.3 Determine the name of the log file
  const logFileName = originalCheckData.id;
  // 8.4 Append the log string to the file
  _logs.append(logFileName, logString, (err) => {
    if (!err) {
      debug(`Logging to file succeded`);
    } else {
      debug(`Logging to file failed`);
    }
  });
};

// 9. LOOP: timer to execute the worker process once per minute
workers.loop = () => {
  setInterval(() => {
    workers.gatherAllChecks();
  }, 1000 * 60);
};

// 10. ROTATE AND COMPRESS FILES
workers.rotateLogs = () => {
  // 10.1 List all the uncompressed log files
  _logs.list(false, (err, logs) => {
    if (!err && logs && logs.length > 0) {
      // 10.2 Loop through the logs and get the new file id
      logs.forEach((logName) => {
        const logId = logName.replace('.log', '');
        const newFileId = logId + '-' + Date.now();
        // 10.3 Compress the logs
        _logs.compress(logId, newFileId, (err) => {
          if (!err) {
            // 10.4 Truncate the logs
            _logs.truncate(logId, (err) => {
              if (!err) {
                debug(`Success truncating the log file`);
              } else {
                debug(`Error truncating the log file`);
              }
            });
          } else {
            debug(`Error compressing one of the log files`);
          }
        });
      });
    }
  });
};

// 11. LOG ROTATION LOOP: timer to execute the log rotation process once per day
workers.logRotationLoop = () => {
  setInterval(() => {
    workers.rotateLogs();
  }, 1000 * 60 * 60 * 24);
};


// 12. INIT SCRIPT
workers.init = () => {
  // 12.1 Debug files
  console.log('\x1b[33m%s\x1b[0m', `Background workers are running`);
  // 12.2 Execute all the checks immediately
  workers.gatherAllChecks();
  // 12.3 Call the loop, so the checks would continue to execute
  workers.loop();
  // 12.4 Compress all the logs immediately
  workers.rotateLogs();
  // 12.5 Call the loop, so the logs would continue to rotate
  workers.logRotationLoop();
};

// 13. Export Workres
module.exports = workers;