/*
* UNIT TESTs
*
*/


// 1. DEPENDENCIES
const helpers = require('./../lib/helpers');
const assert = require('assert');
const logs = require('./../lib/logs');
const exampleDebuggingProblem = require('./../lib/exampleDebuggingProblem');

// 2. CONTAINER
const unit = {};


// 3. FIRST EXAMPLE TESTS

// 3.1. ASSERT THAT THE getANumber Function is returning a 'number'
unit['helpers.getANumber sholud return a number'] = (done) => {
  let val = helpers.getANumber();
  assert.equal(typeof (val), 'number');
  done();
};

// 3.2. ASSERT THAT THE getANumber Function is returning a '1'
unit['helpers.getANumber should return 1'] = (done) => {
  let val = helpers.getANumber();
  assert.equal(val, 1);
  done();
};

// 3.3. ASSERT THAT THE getANumber Function is returning a '2'
unit['helpers.getANumber sholud return 2'] = (done) => {
  let val = helpers.getANumber();
  assert.equal(val, 2);
  done();
}


// 4. LOG TESTS
// 4.1 Logs.list should callback an array and a false error
unit['logs.list should callback a false error and an array of log names'] = (done) => {
  logs.list(true, (err, logFileNames) => {
    assert.equal(err, false);
    assert.ok(logFileNames instanceof Array);
    assert.ok(logFileNames.length > 1);
    done();
  });
};
// 4.2 logs.truncate should not throw if the logId do not exists
unit['logs.truncate should not throw if the logId do not exists. It should callback an error instead'] = (done) => {
  assert.doesNotThrow(() => {
    logs.truncate('I do not exist', (err) => {
      assert.ok(err);
      done();
    });
  }, TypeError);
};
// 4.3 exampleDebuggingProblem.init sholud not throw, but it does
unit['exampleDebuggingProblem.init should not throw, when called'] = (done) => {
  assert.doesNotThrow(() => {
    exampleDebuggingProblem.init();
    done();
  });
};

// EXPORT THE TEST TO THE RUNNER
module.exports = unit;