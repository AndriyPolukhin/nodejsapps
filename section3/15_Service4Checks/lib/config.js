/*
* Environment configuration file
*
*/

// 1. Dependencies

// 2. Container
const environments = {};

// 3. Staging (default) environment
environments.staging = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'staging',
  'hashingSecret': 'RogerThatYo'
};

// 4. Production environment
environments.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'production',
  'hashingSecret': 'RogerThatYo'
};
// 5. Check for the current environment
const currentEnvironment = typeof (process.env.NODE_ENV) == 'string' ?
  process.env.NODE_ENV.toLowerCase() : '';
// 6. Chose an environment to export
const environmentToExport = typeof (environments[currentEnvironment]) == 'object' ?
  environments[currentEnvironment] : environments.staging;
// 7. Export the environment
module.exports = environmentToExport;