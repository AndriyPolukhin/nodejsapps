/*
* Title: Jokes Library
* Description: Utility library for getting a list of Jokes
* Author: Lislie Lewis
* Date 14/24/17
*
*/

// Dependencies
const fs = require('fs');

// App Object
const jokes = {};

// Get all the jokes and return them to the user
jokes.allJokes = function () {

  // Read the text file containing the jokes
  const fileContents = fs.readFileSync(__dirname + '/jokes.txt', 'utf8');

  // Turn the string inot an array
  const arrayOfJokes = fileContents.split(/\r?\n/);

  // Return the array
  return arrayOfJokes;
};


// Export the library
module.exports = jokes;