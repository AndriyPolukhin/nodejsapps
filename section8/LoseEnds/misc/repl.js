/*
* EXAMPLE REPL SERVER
* Take in 'fizz' and log out 'baz'
*/

// 1. DEPENDENCIES
const repl = require('repl');

// 2. START THE REPL
repl.start({
  'prompt': '> ',
  'eval': (str) => {
    // evaluation function
    console.log("At the evaluation state: ", str);

    // if the user said "fizz", say "buzz" to them
    if (str.indexOf('fizz') > -1) {
      console.log('buzz');
    }
  }
});

