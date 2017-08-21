const colog = require('colog');
/**
 * This module eliminates indentation whitespace
 * from strings passed to colog methods.  This
 * allows us to use template strings more cleanly.
 */

const cologError = colog.error;
const cologSuccess = colog.success;
const cologHeaderSuccess = colog.headerSuccess;
const cologHeaderAnswer = colog.headerAnswer;
const cologAnswer = colog.answer;

colog.error = function(str) { 
  if (typeof str !== 'string') { 
    return cologError.call(colog, JSON.stringify(str, null, '\t'));
  }
  cologError.call(colog, str.replace(/^\s+/gm, ''));
  console.log('\n');
}
colog.success = function(str) { 
  if (typeof str !== 'string') { 
    return cologSuccess.call(colog, JSON.stringify(str, null, '\t'));
  }
  cologSuccess.call(colog, str.replace(/^\s+/gm, ''));
  console.log('\n');
}
colog.headerSuccess = function(str) { 
  cologHeaderSuccess.call(colog, str.replace(/^\s+/gm, ''));
  console.log('\n');
}
colog.headerAnswer = function(str) { 
  cologHeaderAnswer.call(colog, str.replace(/^\s+/gm, ''));
  console.log('\n');
}
colog.answer = function(str) { 
  cologAnswer.call(colog, str.replace(/^\s+/gm, ''));
  console.log('\n');
}

module.exports = colog;
