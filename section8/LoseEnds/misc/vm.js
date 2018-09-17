/*
* Example VM running some commands
*
*/

// 1. DEPENDENCIES
const vm = require('vm');

// 2. Define context for the script to run in
const context = {
  'foo': 25
};

// 3. Define the script that should execute
let script = new vm.Script(`

  foo = foo * 2;
  var bar = foo + 1;
  var fizz = 52

`);

// 4. Run the script
script.runInNewContext(context);
console.log(context);