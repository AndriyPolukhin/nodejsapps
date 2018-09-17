/*
* TEST RUNNER
*
*/

// 1. OVERRIDE THE NODE_ENV variable
process.env.NODE_ENV = 'testing';

// 2. APLICATION LOGIC FOR THE TEST RUNNER
_app = {};

// 3. CONTAINER FOR THE TEST
_app.tests = {};

// 4. Add add unit test as a dependencie file
_app.tests.unit = require('./unit');
_app.tests.api = require('./api');


// 7. COUNT TEST FUNCTION
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
  }
  return counter;
};

// 8. PRODUCE THE TEST REPORT
_app.produceTestReport = (limit, successes, errors) => {
  // 8.1 Console.log the main Data: limit, successes, errors
  console.log("");
  console.log("----------------------BEGIN TEST REPORT----------------------");
  console.log("");
  console.log("Total Tests:", limit);
  console.log("Passed: ", successes);
  console.log("Failed: ", errors.length);
  console.log("");
  // 8.2 Console.log the Errors Details
  if (errors.length > 0) {
    console.log("----------------------BEGIN ERROR DETAILS--------------------");
    console.log("");
    errors.forEach((testError) => {
      console.log('\x1b[31m%s\x1b[0m', testError.name);
      console.log(testError.error);
    });
    console.log("");
    console.log("----------------------END ERROR DETAILS--------------------");
  }

  console.log("");

  console.log("----------------------END TEST REPORT----------------------");
  process.exit(0);
};


// 9. RUN TEST FUNCTION: run and collect all the errors and successes
_app.runTests = () => {
  // 9.1 Creat the container for errors, successes, limit, counter
  let errors = [];
  let successes = 0;
  let limit = _app.countTests();
  let counter = 0;
  // 9.2 Cycle through the test
  for (let key in _app.tests) {
    if (_app.tests.hasOwnProperty(key)) {
      // 9.3 Cycle through the sub-tests
      let subTests = _app.tests[key];
      for (let testName in subTests) {
        if (subTests.hasOwnProperty(testName)) {
          // 9.4 CLOSURE: self-executed function, needed to encapsulate all the variables that are defined without the loop overriding them
          (() => {
            let tmpTestName = testName;
            let testValue = subTests[testName];
            // 9.5 CALL THE TEST
            try {
              testValue(() => {
                // 9.5.1 If it comes back without throwing, then it succeeded, so log the output (in green)
                console.log('\x1b[32m%s\x1b[0m', tmpTestName);
                counter++;
                successes++;
                if (counter == limit) {
                  _app.produceTestReport(limit, successes, errors);
                }
              });
            } catch (e) {
              // 9.6 If it thrown, than the test have FAILED, need to be catched and logged (in red)
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


// 10. RUN THE TEST
_app.runTests();