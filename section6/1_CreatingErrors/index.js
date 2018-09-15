/*
* Primary file for the API
*
*/

// 1. Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');

// 2. Declare the app
const app = {};

// 3. Init function
app.init = () => {
  // 3.1 Start the server
  server.init();
  // 3.2 Start the workers
  workers.init();
  // 3.3 Start the CLI, make sure it starts last
  setTimeout(() => {
    cli.init();
  }, 50);
};

// 4. Execute the function
app.init();

// 5. Export the app
module.exports = app;