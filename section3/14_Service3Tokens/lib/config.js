/*
* Environment configuration file
*
*/

// 1. Container
const environments = {};

// 2. Staging (default) environment
environments.staging = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'staging',
  'hashed': 'ThisIsASecret ?????'
}
// 3. Production envrionment
environments.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'production',
  'hashed': 'ThisIsASecret'
}

// 4. Check for the current environment
const currentEnvironment = typeof (process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';
// 5. Chose the environment to export
const environmentToExport = typeof (environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// 6. Export module for the environment
module.exports = environmentToExport;