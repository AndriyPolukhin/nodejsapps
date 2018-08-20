/*
* Title: Math Library
* Description: Utility library for math-related functions
* Author: Lislie Lewis
* Date: 10/24/17
*
*/

// App Ojbect
const math = {};

// Get a random integet berween two integers
// Inspired by: http://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
math.getRandomNumber = function (min, max) {
  min = typeof (min) == 'number' && min % 1 === 0 ? min : 0;
  max = typeof (max) == 'number' && max % 1 === 0 ? max : 0;
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Export the library
module.exports = math;