/*
* TEST RUNNER
*
*/

// 1. DEPENDENCIES
const helpers = require('./../lib/helpers');
const assert = require('assert');

// 2. APLICATION LOGIC FOR THE TEST RUNNER
_app = {};

// 3. CONTAINER FOR THE TEST
_app.tests = {
  'unit': {}
};

// 4. ASSERT THAT THE getANumber Function is returning a 'number'
_app.tests.unit['helpers.getANumber should return number'] = (done) => {
  let val = helpers.getANumber();
  assert.equal(typeof (val), 'number');
  done();
};

// 5. ASSERT THAT THE getANumber Function is returning a '1'
_app.tests.unit['helpers.getANumber should return 1'] = (done) => {
  let val = helpers.getANumber();
  assert.equal(val, 1);
  done();
};

// 6. ASSERT THAT THE getANumber Function is returning a '1'
_app.tests.unit['helpers.getANumber should return 2'] = (done) => {
  let val = helpers.getANumber();
  assert.equal(val, 2);
  done();
};

// COUNT TEST FUNCTION
_app.countTests = () => {
  let counter = 0;
  for (let key in _app.tests) {
    if (_app.tests.hasOwnProperty(key)) {
      let subTests = _app.tests[key];
      for (let testName in subTests) {
        if (subTests.hasOwnProperty(testName)) {
          counter++;
        }
      }
    }
    return counter;
  }
};

// PRODUCE THE TEST REPORT
_app.produceTestReport = (limit, successes, errors) => {
  console.log("");
  console.log("--------------BEGIN TEST REPORT-------------");
  console.log("");
  console.log("Total Tests:", limit);
  console.log("Total Passed:", successes);
  console.log("Total Failed:", errors);
  console.log("");
  // if there are errors print them in details
  if (errors.length > 0) {
    console.log("--------------BEGIN ERROR DETAILS-------------");
    console.log("");
    errors.forEach((testError) => {
      console.log('\x1b[31m%s\x1b[0m', testError.name);
      console.log(testError.error);
      console.log("");
    });
    console.log("");
    console.log("--------------ENDED ERROR DETAILS-------------");
  }

  console.log("");
  console.log("--------------ENDED TEST REPORT-------------");


};


// RUN TEST FUNCTION: run and collect all the errors and successes
_app.runTests = () => {
  let errors = [];
  let successes = 0;
  let limit = _app.countTests();
  let counter = 0;
  for (let key in _app.tests) {
    if (_app.tests.hasOwnProperty(key)) {
      let subTests = _app.tests[key];
      for (let testName in subTests) {
        if (subTests.hasOwnProperty(testName)) {
          (() => {
            let tmpTestName = testName;
            let testValue = subTests[testName];
            // Call the test
            try {
              testValue(() => {
                // if it callback withour throwing, then it succeded, to log it in geen
                console.log('\x1b[32m%s\x1b[0m', tmpTestName);
                counter++;
                successes++;
                if (counter == limit) {
                  _app.produceTestReport(limit, successes, errors);
                }
              });
            } catch (e) {
              // if it throws, then it failed, so capture the eror and log it in red
              errors.push({
                'name': testName,
                'error': e
              });
              console.log('\x1b[31m%s\x1b[0m', tmpTestName);
              counter++;
              if (counter == limit) {
                _app.produceTestReport(limit, successes, errors);
              }
            }
          })();
        }
      }
    }
  }
};


// RUN THE TEST
_app.runTests();