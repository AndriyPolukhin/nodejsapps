/*
* Primary file for environment configuration
*
*/

// 1. Dependencies

// 2. Container for the environments
const environments = {};
// 3. Staging (default) environment
environments.staging = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'staginig',
  'hashingSecret': 'ThisIsASecret',
  'maxChecks': 3
}
// 4. Production environment
environments.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'production',
  'hashingSecret': 'ThisIsASecret',
  'maxChecks': 3
}
// 5. Check for the environment
const currentEnvironment = typeof (process.env.NODE_ENV) == 'string' ?
  process.env.NODE_ENV.toLowerCase() : '';
// 6. Chose the environmnet
const environmentToExport = typeof (environments[currentEnvironment]) == 'object' ?
  environments[currentEnvironment] : environments.staging;

// 7. Export the environment module
module.exports = environmentToExport;