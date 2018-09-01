/*
* This are worker realted tasks
*
*/

// 1. Dependencies
const path = require('path');
const fs = require('fs');
const _data = require('./data');
const https = require('https');
const http = require('http');
const helpers = require('./helpers');
const url = require('url');

// 2. Instantiate/create the workersObject
const workers = {};

// 3. Loop
// 3.1 Timer to execute the workers process once per minute
workers.loop = () => {
  setInterval(() => {
    workers.getherAllChecks();
  }, 1000 * 60);
};

// 4. Gather all Checms
// @todo: gather all checks, get their data, send to a validator
workers.gatherAllChecks = () => {
  // 4.1 Get all the checks that exist in the system
  _data.list('checks', (err, checks) => {
    if (!err && checks && checks.length > 0) {
      // 4.2 Call Checks
      checks.forEach((check) => {
        // 4.2.1 Read in the check data
        _data.read('checks', check, (err, originalCheckData) => {
          if (!err && originalCheckData) {
            // 4.2.2 Pass the data to the validator and let that function continue or log errors as needed
            workers.validateCheckData(originalCheckData);
          } else {
            console.log(`Error reading one of the chek's data`);
          }
        });
      });
    } else {
      console.log(`Error: Could not find any checks to process`);
    }
  });
};

// 5. Validate Check Data: Sanity-checking of the check-data
workers.validateCehckData = (originalCheckData) => {
  // 5.1 Validate the original check data types
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
    ['http', 'https'].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false;
  originalCheckData.url = typeof (originalCheckData.url) == 'string' &&
    originalCheckData.url.trim().length > 0 ?
    originalCheckData.url.trim() : false;
  originalCheckData.method = typeof (originalCheckData.method) == 'string' &&
    ['post', 'get', 'put', 'delete'].indexOf(originalCheckData.method) > - 1 ?
    originalCheckData.method : false;
  originalCheckData.successCodes = typeof (originalCheckData.successCodes) == 'object' &&
    originalCheckData.successCodes.length > 0 ?
    originalCheckData.successCodes : false;
  originalCheckData.timeoutSeconds = typeof (originalCheckData.timeoutSeconds) == 'number' &&
    originalCheckData.timeoutSeconds % 1 === 0 &&
    originalCheckData.timeoutSeconds >= 1 &&
    originalCheckData.timeoutSeconds <= 5 ?
    originalCheckData.timeoutSeconds : false;

  // 5.2 Set the keys that may not be set (if the workers never see this check before)
  originalCheckData.state = typeof (originalCheckData.state) == 'string' &&
    ['up', 'down'].indexOf(originalCheckData.state) > -1 ?
    originalCheckData.state : 'down';
  originalCheckData.lastChecked = typeof (originalCheckData.lastChecked) == 'number' &&
    originalCheckData.lastChecked > 0 ?
    originalCheckData.lastChecked : false;
  // 5.3. If all the checks pass, then pass the data to the next function in the process
  if (
    originalCheckData.id &&
    originalCheckData.userPhone &&
    originalCheckData.protocol &&
    originalCheckData.url &&
    originalCheckData.method &&
    originalCheckData.successCodes &&
    originalCheckData.timeoutSeconds) {
    // 5.4 Perform the check
    workers.preformCheck(originalCheckData);
  } else {
    console.log(`Error: One of the checks is not proerly formatted`);
  };
};

// 6. Perform the check: send the original check data and the outcome of the check process to the next step in the process
workers.performCheck = (originalCheckData) => {
  // 6.1 Prepare the initial check outcome
  let checkOutcome = {
    'error': false,
    'reponseCode': false
  };
  // 6.2 Mark that the outcome has not been sent yet
  let outcomeSent = false;
  // 6.3. Parse the host name out of the originalCheckData(to know who is the one)
  const parsedUrl = url.parse(originalCheckData.protocol + '://' + originalCheckData.url, true);
  const hostname = parsedUrl.hostname;
  const path = parsedUrl.path; // using path, not the pathname(because we need the whole query string)

  // 6.4 Construct the request
  const requestDetails = {
    'protocol': originalCheckData.protocol + ':',
    'hostname': hostname,
    'method': originalCheckData.method.toUpperCase(),
    'path': path,
    'timeout': originalCheckData.timeoutSeconds * 1000
  };

  // 6.5 Instantiate/create the request object using http/https module
  const _moduleToUse = originalCheckData.protocol == 'http' ? 'http' : 'https';
  const req = _moduleToUse.request(requestDetails, (res) => {
    // 6.5.1 Grab the status of the send request
    const status = res.statusCode;
    // 6.5.2 Update the checkOutcome and pass the data along
    checkOutcome.responseCode = status;
    if (!outcomeSend) {
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

  // 6.7 Bind to the timeour event
  req.on('timeout', (e) => {
    // 6.7.1 Update the checkout and pass the data along
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

// 7. Process Cehck outcome and update the check data as needed and trigger the alert to the user if needed
// Special logic for accomodating a check that never been tested before
workers.processCheckOutcome = (originalCheckData, checkOutcome) => {
  // 7.1 Decide if the check is considersed up/down in this current state
  const state = !checkOutcome.error &&
    checkOutcome.responseCode &&
    originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down';
  // 7.2 Decide if the alert is warraned
  const alertWarranted = originalCheckData.lastChecked &&
    originalCheckData.state !== state ? true : false;
  // 7.3 Update the check data
  const newCheckData = originalCheckData;
  newCheckData.state = state;
  newCheckData.lastChecked = Date.now();
  // 74. Save the updates to dist
  _data.update('checks', newCheckData.id, newCheckData, (err) => {
    if (!err) {
      // 7.4.1 Send the new check data to the next phase in the process if needed
      if (alertWarranted) {
        workers.alertUserToStatusChange(newCheckData);
      } else {
        console.log(`Check outcome has not changed, not alert needed`);
      }
    } else {
      console.log(`Error trying to save updates to one of the cehcks`);
    }
  });
};

// 8. Alert User to Status Change
workers.alertUserToStatusChange = (newCheckData) => {
  const msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`;
  helpers.sendTwilioSms(newCheckData.userPhone, msg, (err, callback) => {
    if (!err) {
      console.log(`Success: User was alerted to a status change in their check, via sms: ${msg}`);
    } else {
      console.log(`Error: Could not sent sms alert to user who head a status change in their check`);
    }
  });
};

// 9. Init Script
workers.init = () => {
  // 9.1 Execute all the checks immediately
  workers.gatherAllChecks();
  // 9.2 Call a loop so the checks would continue to execute on their own
  workers.loop();
};

// 10. Export the workes
module.exports = workers;