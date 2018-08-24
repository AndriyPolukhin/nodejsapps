/*
* Create and export cinfiguration variables
*
*/

// 1. Container for the environmnets
const environments = {};

// 2. Staging (default) environment
environments.staging = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'staging'
};

// 3. Production environment
environments.production = {
  'httpPort': 5000,
  'httpsPort': 50001,
  'envName': 'production'
};

// 4. Determine which environment was passed as a command-line argument
const currentEnvironment = typeof (process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';
// 5. Check that the current environment is one of the environments above, if not, default to the staging
const environmentToExport = typeof (environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;
// 6. Export environment module
module.exports = environmentToExport;