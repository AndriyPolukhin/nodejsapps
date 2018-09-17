/*
* Primary file for the API
*
*/

// 1. Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');
const exampleDebuggingProblem = require('./lib/exampleDebuggingProblem');

// 2. Declare the app
const app = {};

// 3. Init function
app.init = () => {
  // 3.1 Start the server
  debugger;
  server.init();
  debugger;
  // 3.2 Start the workers
  debugger;
  workers.init();
  debugger;
  // 3.3 Start the CLI, make sure it starts last
  debugger;
  setTimeout(() => {
    cli.init();
  }, 50);
  debugger;
  // 3.4 Call the init script that will throw an Error
  // defined the foo
  debugger;
  let foo = 1;
  console.log('Just assigned 1 to foo')
  debugger;
  // increment a foo
  foo++;
  console.log('Just incremented foo')
  // multiply a foo
  debugger;
  foo = foo * foo;
  console.log('Just squared foo')
  // convert the foo to string
  debugger;
  foo = foo.toString();
  console.log('Just converted Foo')
  // call the foo
  debugger;
  exampleDebuggingProblem.init();
  console.log('Just called the library');
  debugger;
};

// 4. Execute the function
app.init();

// 5. Export the app
module.exports = app;