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
  'hashingSecret': 'ThisIsASecret',
  'maxChecks': 5,
  'twilio': {
    'accountSid': 'ACb32d411ad7fe886aac54c665d25e5c5d',
    'authToken': '9455e3eb3109edc12e3d8c92768f7a67',
    'fromPhone': '+15005550006'
  }
};
// 3. Production envrionment
environments.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'production',
  'hashingSecret': 'ThisIsASecret',
  'maxChecks': 5,
  'twilio': {
    'accountSid': ' ',
    'authToken': ' ',
    'fromPhone': ' '
  }
};

// 4. Check for the current environment
const currentEnvironment = typeof (process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';
// 5. Chose the environment to export
const environmentToExport = typeof (environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// 6. Export module for the environment
module.exports = environmentToExport;