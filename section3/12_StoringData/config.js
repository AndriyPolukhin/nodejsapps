/*
* Configuration for the environment*
*/


// Environments:

// 1. Container
const environments = {};

// 2. Staging (default) environment
environments.staging = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'staging'
};
// 3. Production environment
environments.production = {
  'httpjPort': 5000,
  'httpsPort': 5001,
  'envName': 'production'
};

// 4. Check the environment
const currentEnvironment = typeof (process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';
// 5. Chose the environment
const environmentToExport = typeof (environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// 6. Export the environment
module.exports = environmentToExport;
