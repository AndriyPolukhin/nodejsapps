/*
* THIS IS A ASYNC HOOK EXAMPLE
*
*/

// 1. DEPENDENCIES
const async_hooks = require('async_hooks');
const fs = require('fs');

// 2. DEFINE THE TARGET EXECUTION CONTENT
const targetExecutionContext = false;

// 3. ARBITRIRARY ASYNC FUNCTION
const whatTimeIsIt = (callback) => {
  setInterval(() => {
    fs.writeSync(1, 'When the setInterval runs, the execution context is ' + async_hooks.executionAsyncId() + '\n');
    callback(Date.now());
  }, 1000);
};

// 4. CALL THE FUNCTION
whatTimeIsIt((time) => {
  fs.writeSync(1, 'The time is ' + time + '\n');
});

// 5. HOOKS
const hooks = {
  init(asyncId, type, triggerAsyncId, resource) {
    fs.writeSync(1, 'Hook init ' + asyncId + '\n');
  },
  before(asyncId) {
    fs.writeSync(1, 'Hook before ' + asyncId + '\n');
  },
  after(asyncId) {
    fs.writeSync(1, 'Hook after ' + asyncId + '\n');
  },
  destroy(asyncId) {
    fs.writeSync(1, 'Hook destroy ' + asyncId + '\n');
  },
  promiseResolve(asyncId) {
    fs.writeSync(1, 'Hook promise resolve ' + asyncId + '\n');
  }
};

// 6. Create a new AsyncHooks instance
const asyncHook = async_hooks.createHook(hooks);
asyncHook.enable();
