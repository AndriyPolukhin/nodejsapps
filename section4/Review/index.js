/*
* Primary file for API
*
*/

// 1. Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');

// 2. App declaration
const app = {};

// 3. Set the init function
app.init = () => {
    // 3.1 Start the server
    server.init();
    // 3.2 Start the workers
    workers.init();
};

// 4. Start the App
app.init();

// 5. Export the app
module.exports = app;