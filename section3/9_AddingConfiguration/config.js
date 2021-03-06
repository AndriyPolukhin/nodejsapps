/*
* Create and export configuration variables
*
*/

// 1. Container for the environments
const environments = {};
// 2. Strging(default) environment
environments.staging = {
  'port': 3000,
  'envName': 'staging'
};
// 3. Production environment
environments.production = {
  'port': 5000,
  'envName': 'production'
};

// 4. Determine which environmentt was passed as a command-line argument
const currentEnvironment = typeof (process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// 5. Check that the current environment is one of the environments above, if not, default to staging
const environmentToExport = typeof (environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// 6. Export the module
module.exports = environmentToExport;
