/*
* CLI TASKS
*
*/

// 1. DEPENDENCIES
const readline = require('readline');
const util = require('util');
const debug = util.debuglog('cli'); // NODE_DEBUG=cli
const events = require('events');
class _events extends events { };
const e = new _events();

// 2. CLI MODULE OBJECT
const cli = {};

// 3. INPUT PROCESSOR
cli.processInput = (str) => {
  // 3.1 Type check the data
  str = typeof (str) == 'string' &&
    str.trim().length > 0 ?
    str.trim() : false;
  // 3.2 Process the INPUT only if there is data, or ignore it
  if (str) {
    // 3.3 Codify the unique string that identify the questions allowed
    const uniqueInputs = [
      'man',
      'help',
      'exit',
      'stats',
      'list users',
      'more user info',
      'list checks',
      'more check info',
      'list logs',
      'more log info'
    ];
    // 3.4 Go through the possible inputs, and emmit an event when the match is found
    let matchFound = false;
    let counter = 0;
    uniqueInputs.some((input) => {
      if (str.toLowerCase().indexOf(input) > -1) {
        matchFound = true;
        // 3.4.1 Emit an event matching the unique Input, and include the full string given by the user
        e.emit(input, str);
        return true;
      }
    });
    // 3.5 If no match is found, tell the user to try again
    if (!matchFound) {
      console.log('Sorry, try again');
    }
  }
};

// 4. INIT SCRIPT
cli.init = () => {
  // 3.1 Send the start message to the console (dark blue);
  console.log('\x1b[34m%s\x1b[0m', 'The CLI is running');
  // 3.2 Start the interface
  const _interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
  });
  // 3.3 Create the INITIAL PROMPT
  _interface.prompt();

  // 3.4 Handler each line of INPUT Separately
  _interface.on('line', (str) => {
    // 3.4.1 Send to the input processor
    cli.processInput(str);
    // 3.4.2 Re-initialize the propmt afterwards
    _interface.prompt();
    // 3.4.3 If the user stops the CLI, kill the ptocess
    _interface.on('close', () => {
      process.exit(0);
    });
  });



};



// Export module
module.exports = cli;
