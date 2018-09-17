/*
* THIS IS THE LIBRARY THAT DEMONSTRATES SOMETHING THROWING WHEN IT'S INIT IS CALLED
*
*/

// 1. CONTAINER FOR THE MODULE
const example = {};

// 2. INIT FUNCTION
example.init = () => {
  // 2.1 THIS IS AN INTENTIONAL ERROR (bar is not defined)
  const foo = bar;

};


// 5. EXPORT THE MODULE
module.exports = example;