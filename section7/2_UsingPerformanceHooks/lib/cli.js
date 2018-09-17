/*
* CLI TASKS
*
*/

// 1. DEPENDENCIES
const readline = require('readline');
const util = require('util');
const debug = util.debuglog('cli');
const events = require('events');
class _events extends events { };
const e = new _events();
const os = require('os');
const v8 = require('v8');
const _data = require('./data');
const _logs = require('./logs');
const helpers = require('./helpers');

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
// 3.3. THE EXIT HANDLER
e.on('exit', (str) => {
  cli.responders.exit();
});
// 3.4  THE STATS HANDLERS
e.on('stats', (str) => {
  cli.responders.stats();
});

// 3.5 LIST USERS
e.on('list users', (str) => {
  cli.responders.listUsers();
});
// 3.6 MORE USER INFO
e.on('more user info', (str) => {
  cli.responders.moreUserInfo(str);
});

// 3.7 LIST CHECKS
e.on('list checks', (str) => {
  cli.responders.listChecks(str);
});
// 3.8 MORE CHECK INFO
e.on('more check info', (str) => {
  cli.responders.moreCheckInfo(str);
});

// 3.9 LIST LOGS
e.on('list logs', (str) => {
  cli.responders.listLogs();
});
// 3.10 MORE LOG INFO
e.on('more log info', (str) => {
  cli.responders.moreLogInfo(str);
});
// 4. RESPONDERS
cli.responders = {};

// 4.1 HELP/MAN
cli.responders.help = () => {
  // 4.1.1 Define the list of commands that are allowed
  const commands = {
    'exit': 'Kill the CLI (and the rest of the application',
    'help': 'Show this help page',
    'man': 'Alias of the help command',
    'stats': 'Get statistics on the underlying operation system and resource utilization',
    'list users': 'Show a list of all the registered (undeleted) users in the system',
    'more user info --{userId}': 'Show details of a specific user',
    'list checks --{up} --{down}': 'Show a list of acitve checks in the system, including their state "--up", and "--down" flags are both optional',
    'more check info --{checkId}': 'Show details of a specified check',
    'list logs': 'Show a list of all the log files available to  be read (commpressed only)',
    'more log info --{fileName}': 'Show details of specified log file'
  };
  // 4.1.2 Formating the console output. Build a header for the help page, as wide as a screen
  cli.horizontalLine();
  cli.centered('\x1b[33CLI MANUAL\x1b[0m');
  cli.horizontalLine();
  cli.verticalSpace(2);
  // 4.1.3 Show each command, followed by it's explanation in white and yellow respectively
  for (let key in commands) {
    if (commands.hasOwnProperty(key)) {
      let value = commands[key];
      let line = '\x1b[33m' + key + '\x1b[0m';
      let padding = 60 - line.length;
      for (let i = 0; i < padding; i++) {
        line += ' ';
      }
      line += value;
      console.log(line);
      cli.verticalSpace();
    }
  }
  cli.verticalSpace(1);
  cli.horizontalLine();
};

// 4.1.4 HELPER FUNCTIONS FOR THE OUTPUT FORMATTING
//  4.1.4-1 VERTICAL SPACE
cli.verticalSpace = (lines) => {
  // Check the type of the input line
  lines = typeof (lines) == 'number' && lines > 0 ? lines : 1;
  // Log ou the empty string(Carrige Return);
  for (let i = 0; i < lines; i++) {
    console.log('');
  }
};
// 4.1.4-2 HORIZONTAL LINE
cli.horizontalLine = () => {
  // Get the available screen size
  let width = process.stdout.columns;
  let line = '';
  for (let i = 0; i < width; i++) {
    line += '-';
  }
  console.log(line);
};
// 4.1.4-3 CENTERED TEXT ON THE SCREEN
cli.centered = (str) => {
  // Check the type of the string
  str = typeof (str) == 'string' && str.trim().length > 0 ? str.trim() : '';
  // Get the width of the sceen
  let width = process.stdout.columns;
  // Calcaulate teh left Padding that there should be
  let leftPadding = Math.floor((width - str.length) / 2);
  // Put in the left padded spaces before the string
  let line = '';
  for (let i = 0; i < leftPadding; i++) {
    line += ' ';
  }
  line += str;
  console.log(str);
};

// 4.2 EXIT
cli.responders.exit = () => {
  process.exit(0);
};

// 4.3 SYSTEM STATISTICS
cli.responders.stats = () => {
  // 4.3.1 Compile an object of stats
  const stats = {
    'Load Average': os.loadavg().join(' '),
    'CPU Count': os.cpus().length,
    'Platform': os.platform(),
    'Free Memory': os.freemem(),
    'Current Malloced Memory': v8.getHeapStatistics().malloced_memory,
    'Peak Malloced Memory': v8.getHeapStatistics().peak_malloced_memory,
    'Allocated Help Used (%)': Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
    'Available Heap Allocated (%)': Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100),
    'Uptime': os.uptime() + ' Seconds'
  };

  // 4.3.2 Formatting the console output. Build a header for the stats page
  cli.horizontalLine();
  cli.centered('\x1b[33mSYSTEM STATISTICS\x1b[0m');
  cli.horizontalLine();
  cli.verticalSpace(2);
  // 4.3.3 Show each data, followed by it's value
  for (let key in stats) {
    if (stats.hasOwnProperty(key)) {
      let value = stats[key];
      let line = '\x1b[33m' + key + '\x1b[0m';
      let padding = 60 - line.length;
      for (i = 0; i < padding; i++) {
        line += ' ';
      }
      line += value;
      console.log(line);
      cli.verticalSpace();
    }
  }
  cli.verticalSpace(2);
  cli.horizontalLine();
};

// 4.4 LIST USERS
cli.responders.listUsers = () => {
  // 4.4.1 Call the _data.list function to get the file names from the directory
  _data.list('users', (err, userIds) => {
    if (!err && userIds && userIds.length > 0) {
      cli.verticalSpace();
      // 4.4.2 Loop through the list of users
      userIds.forEach((userId) => {
        _data.read('users', userId, (err, userData) => {
          if (!err && userData) {
            // 4.4.3 Construct the line to log out
            let line = 'Name: ' + userData.firstName + ' ' +
              userData.lastName + ' Phone: ' +
              userData.phone + ' Checks: ';
            let numberOfChecks = typeof (userData.checks) == 'object' &&
              userData.checks instanceof Array &&
              userData.checks.length > 0 ?
              userData.checks.length : 0;
            line += numberOfChecks;
            console.log(line);
            cli.verticalSpace();
          }
        });
      });
    }
  });
};
// 4.5 MORE USER INFO
cli.responders.moreUserInfo = (str) => {
  // 4.5.1. Get the id from the string that was provided
  let arr = str.split('--');
  let userId = typeof (arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;
  if (userId) {
    // 4.5.2 Look up the user
    _data.read('users', userId, (err, userData) => {
      if (!err && userData) {
        // 4.5.3 Remove the password
        delete userData.hashedPassword;
        // 4.5.4 Print the json object of the user with text highlighting
        cli.verticalSpace();
        console.dir(userData, { 'colors': true });
        cli.verticalSpace();
      }
    });
  }
};

// 4.6 LIST CHECKS
cli.responders.listChecks = (str) => {
  // 4.6.1 List out the checks
  _data.list('checks', (err, checkIds) => {
    if (!err && checkIds && checkIds.length > 0) {
      cli.verticalSpace();
      // 4.6.2 Loop through for individual check output
      checkIds.forEach((checkId) => {
        _data.read('checks', checkId, (err, checkData) => {
          // 4.6.3 Default to false
          let includeCheck = false;
          let lowerString = str.toLowerCase();
          // 4.6.4. Get the state, default to "down"
          let state = typeof (checkData.state) == 'string' ?
            checkData.state : 'down';
          // 4.6.5 Get the state, default to "unknown"
          const stateOrUnknown = typeof (checkData.state) == 'string' ? checkData.state : 'unknown';
          // 4.6.6 If there's a state, or hasn't specified any state include the current check accordingly
          if (
            (lowerString.indexOf('--' + state) > -1) ||
            (lowerString.indexOf('--down') == -1) &&
            (lowerString.indexOf('--up') == -1)
          ) {
            let line = 'ID: ' + checkData.id + ' ' +
              checkData.method.toUpperCase() + ' ' +
              checkData.protocol + '://' +
              checkData.url + ' State: ' + stateOrUnknown;
            console.log(line);
            cli.verticalSpace();
          }
        });
      });
    }
  });
};
// 4.7. MORE CHECK INFO
cli.responders.moreCheckInfo = (str) => {
  // 4.7.1 Get the id from the string that was provided
  let arr = str.split('--');
  let checkId = typeof (arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;
  if (checkId) {
    // 4.7.2 Look up the check
    _data.read('checks', checkId, (err, checkData) => {
      if (!err && checkData) {
        // 4.7.3 Print the json object of the user with text highlighting
        cli.verticalSpace();
        console.dir(checkData, { 'colors': true });
        cli.verticalSpace();
      }
    });
  }
};

// 4.8 LIST LOGS
cli.responders.listLogs = () => {
  // 4.8.1 List All logs with a built-previously function from the _logs lib
  _logs.list(true, (err, logFileNames) => {
    if (!err && logFileNames) {
      cli.verticalSpace();
      // 4.8.2 Loop through, so for each file name print it's name
      logFileNames.forEach((logFileName) => {
        if (logFileName.indexOf('-') > -1) {
          console.log(logFileName);
          cli.verticalSpace();
        }
      });
    }
  });
};
// 4.9 MORE LOG INFO
cli.responders.moreLogInfo = (str) => {
  // 4.9.1 Get the Id from the string
  let arr = str.split('--');
  let logFileName = typeof (arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;
  if (logFileName) {
    cli.verticalSpace();
    // 4.9.2 DECOMPRESS THE LOG FILE
    _logs.decompress(logFileName, (err, strData) => {
      if (!err && strData) {
        // 4.9.3 SPLIT THE LOG FILE LINE BY LINE as an array
        let arr = strData.split('\n');
        // 4.9.4 Loop through the array
        arr.forEach((jsonString) => {
          let logObject = helpers.parseJsonToObject(jsonString);
          if (logObject && JSON.stringify(logObject) !== '{}') {
            console.dir(logObject, { 'colors': true });
            cli.verticalSpace();
          }
        });
      }
    });
  }
};
// 5. INPUT PROCESSOR
cli.processInput = (str) => {
  // 5.1 Check the type of the string
  str = typeof (str) == 'string' && str.trim().length > 0 ? str.trim() : false;
  // 5.2 Obly process the input, if there is an input from the user
  if (str) {
    // 5.3 Codify the unique strings that provide feedback
    const uniqueInputs = [
      'help',
      'man',
      'exit',
      'stats',
      'list users',
      'more user info',
      'list checks',
      'more check info',
      'list logs',
      'more log info'
    ];
    // 5.4 Go through the possible inputs and emit an event if match is found
    let matchFound = false;
    let counter = 0;
    uniqueInputs.some((input) => {
      if (str.toLowerCase().indexOf(input) > -1) {
        matchFound = true;
        // 5.5 Emit the event matching the unique input, and include the full string from the user
        e.emit(input, str);
        return true;
      }
    });
    // 5.6 If no match found, try again
    if (!matchFound) {
      console.log('For the list of available commands use: help');
    }
  }
};

// 6. INIT SCRIPT
cli.init = () => {
  // 6.1 Send the start message to the console (dark blue)
  console.log('\x1b[34mCLI is Running\x1b[0m');
  // 6.2 Start the interface
  const _interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
  });
  // 6.3 Create the initial prompt
  _interface.prompt();
  // 6.4. Handel each line of input separately
  _interface.on('line', (str) => {
    // 6.4.1 Send to the input processor
    cli.processInput(str);
    // 6.4.2 RE-initialize the Prompt
    _interface.prompt();
    // 6.4.3 If the user stops the cli, kill the process
    _interface.on('close', () => {
      process.exit(0);
    });
  });
};
// 7. EXPORT MODULE
module.exports = cli;