/*
* Create and export configuration variables
*
*/

// 1. Container for all the environments
const environments = {};

// 2. Staging (defaul) environment
environments.staging = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'staging',
  'hashingSecret': 'ThisIsASecret',
  'maxChecks': 5,
  'twilio': {
    'accountSid': 'AC89f3df919a9d3ff39dfd61a782dc125c',
    'authToken': '4131ca10161a844a085e2458fd5cfdd1',
    'fromPhone': '+15153751452'
  },
  'templateGlobals': {
    'appName': 'UptimeChecker',
    'companyName': 'NotARealCompany, Inc',
    'yearCreated': '2018',
    'baseUrl': 'http://localhost:3000'
  }
};
// 3. Production environment
environments.production = {
  'httpsPort': 5000,
  'httpsPort': 5001,
  'envName': 'production',
  'hashingSecret': 'ThisIsASecret',
  'maxChecks': 5,
  'twilio': {
    'accountSid': '',
    'authToken': '',
    'fromPhone': ''
  },
  'templateGlobals': {
    'appName': 'UptimeChecker',
    'companyName': 'NotARealCompany',
    'yearCreated': '2018',
    'baseUrl': 'http://localhost:5000'
  }
};

// 4. Determine which environment should be pushed as a command-line arg
const currentEnvironment = typeof (process.env.NODE_ENV) == 'string' ?
  process.env.NODE_ENV.toLowerCase() : '';
// 5. Check that the current environment is the one above, or set to staging
const environmentToExport = typeof (environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// 6. Export the environment
module.exports = environmentToExport;