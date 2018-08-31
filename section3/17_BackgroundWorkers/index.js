/*
* Primary file for an API
*
*/

// 1. Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');

// 2. Declare the App
const app = {};

// 3. Init function
app.init = () => {
    // 3.1. Start the server
    server.init();
    // 3.2 Start the workers
    workers.init();
};

// 4. Execute the function
app.init();

// 5. Export the app
module.exports = app;
