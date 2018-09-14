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

// 3. INPUT HANDLERS
// 3.1 THE MAN HANDLER
e.on('man', (str) => {
  cli.responders.help();
});
// 3.2 THE HELP HANDLER
e.on('help', (str) => {
  cli.responders.help();
});

// 3.3 THE EXIT HANDLER
e.on('exit', (str) => {
  cli.responders.exit();
});

// 3.4 THE STATS HANDLER
e.on('stats', (str) => {
  cli.responders.stats();
});

// 3.5 THE LIST USERS HANDLER
e.on('list users', (str) => {
  cli.responders.listUsers();
});

// 3.6 THE MORE USER INFO HANDLER
e.on('more user info', (str) => {
  cli.responders.moreUserInfo(str);
});
// 3.7 THE LIST CHECKS HANDLER
e.on('list checks', (str) => {
  cli.responders.listChecks(str);
});
// 3.8 THE MORE CHECK INFO HANDLER
e.on('more check info', (str) => {
  cli.responders.moreUserInfo(str);
});
// 3.9 THE LIST LOGS HANDLER
e.on('list logs', (str) => {
  cli.responders.listLogs();
});
// 3.10 THE MORE LOGS INFO HANDLER
e.on('more log info', (str) => {
  cli.responders.moreLogInfo(str);
});

// 4. REPSONPERS
cli.responders = {};

// 4.1 HELP / MAN
cli.responders.help = () => {
  console.log('You asked for HELP');
};

// 4.2 EXIT
cli.responders.exit = () => {
  // console.log('You asked for EXIT');
  process.exit(0);
};

// 4.3 STATS
cli.responders.stats = () => {
  console.log('You asked for STATS');
};

// 4.4 List users
cli.responders.listUsers = () => {
  console.log('You asked for USER LIST');
};

// 4.5 More user info
cli.responders.moreUserInfo = (str) => {
  console.log('You asked for MORE USER INFO:', str);
};

// 4.6 List checks
cli.responders.listChecks = (str) => {
  console.log('You asked for the LIST OF CHECKS: ', str);
};

// 4.7 More check info
cli.responders.moreCheckInfo = (str) => {
  console.log('You asked for MORE CHECK INFO: ', str);
};

// 4.8 List logs
cli.responders.listLogs = () => {
  console.log('You asked for LIST OF LOGS');
};

// 4.9 More log info
cli.responders.moreLogInfo = (str) => {
  console.log('You asked for MORE LOG INFO: ', str);
};


// 5. INPUT PROCESSOR
cli.processInput = (str) => {
  // 5.1 TYPE CHECK THE DATA
  str = typeof (str) == 'string' &&
    str.trim().length > 0 ?
    str.trim() : false;
  // 5.2 PROCESS the INPUT only if there is such data
  if (str) {
    // 5.3 Codify the unique string that identify the questions allowed
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
    // 5.4 GO through the possible inputs, and emit an event when the match is found
    let matchFound = false;
    let counter = 0;
    uniqueInputs.some((input) => {
      if (str.toLowerCase().indexOf(input) > -1) {
        matchFound = true;
        // 5.4.1 Emit an event matching the unique Input, and include the full string given by the user
        e.emit(input, str);
        return true;
      }
    });
    // 5.5 If no match is found, tell the user to try again
    if (!matchFound) {
      console.log('Sorry, try again with the following commands:', uniqueInputs);
      console.log('Sorry, try again');
    }
  }
};

// 6. INIT SCRIPT
cli.init = () => {
  // 6.1 Send the start message to the console (dark blue)
  console.log('\x1b[34m%s\x1b[0m', 'The CLI is Running');
  // 6.2 Create the INTERFACE
  const _interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
  });
  // 6.3 Create the INITIAL PROMPT
  _interface.prompt();
  // 6.4 Handel each line of the INPUT Separatelly
  _interface.on('line', (str) => {
    // 6.4.1 Send to the input processor
    cli.processInput(str);
    // 6.4.2 Re-initialize the prompt afterwards
    _interface.prompt();
    // 6.4.3 If the user stops the CLI, kill the process
    _interface.on('close', () => {
      process.exit();
    });
  });
};

// Export module
module.exports = cli;
