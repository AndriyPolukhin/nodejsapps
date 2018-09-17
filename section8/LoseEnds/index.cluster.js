/*
* Primary file for the API
*
*/

// 1. Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');
const cluster = require('cluster');
const os = require('os');

// 2. Declare the app
const app = {};

// 3. Init function
app.init = (callback) => {

  // ON MASTER THREAD
  if (cluster.isMaster) {
    // 3.1 Start the workers
    workers.init();
    // 3.2 Start the CLI, make sure it starts last
    setTimeout(() => {
      cli.init();
      callback();
    }, 50);

    // FORK THE PROCESS
    for (let i = 0; i < os.cpus().length; i++) {
      cluster.fork();
    }
  } else {
    // NOT THE MASTER THREAD
    // 3.3 Start the server
    server.init();
  }
};

// 4. SELF INVOKING ONLY IF REQUERED DIRECTLY !!!
if (require.main === module) {
  app.init(() => { });
};

// 5. Export the app
module.exports = app;