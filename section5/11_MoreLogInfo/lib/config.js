/*
* Crete and export configuration variables
*
*/

// 1. Container for all the environments
const environments = {};

// 2. Stagind (default) environment
environments.staging = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'staging',
  'hashingSecret': 'RogerThatYo',
  'maxChecks': 5,
  'twilio': {
    'accountSid': 'AC89f3df919a9d3ff39dfd61a782dc125c',
    'authToken': '4131ca10161a844a085e2458fd5cfdd1',
    'fromPhone': '+15153751452'
  },
  'templateGlobals': {
    'appName': 'Uptime Checker',
    'companyName': 'NotARealCompany, Inc',
    'yearCreated': '2018',
    'baseUrl': 'http://localhost:3000/'
  }
};

// 3. Production environment
environments.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'production',
  'hashingSecret': 'RogerThatYo',
  'maxChecks': 5,
  'twilio': {
    'accountSid': '',
    'authToken': '',
    'fromPhone': ''
  },
  'templateGlobals': {
    'appName': 'Uptime Checker',
    'companyName': 'NotARealCompany, Inc',
    'yearCreated': '2018',
    'baseUrl': 'http://localhost:5000'
  }
};

// 4. Determine which environment should be pushed as a comand-line argument
const currentEnvironment = typeof (process.env.NODE_ENV) == 'string' ?
  process.env.NODE_ENV.toLowerCase() : '';

// 5. Check that the currentEnvironment is one of the above or set to staging
const environmentToExport = typeof (environments[currentEnvironment]) == 'object' ?
  environments[currentEnvironment] : environments.staging;

// 6. Export the environment
module.exports = environmentToExport;