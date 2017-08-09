const colog = require('colog');
/**
 * This module eliminates indentation whitespace
 * from strings passed to colog methods.  This
 * allows us to use template strings more cleanly.
 */

const cologError = colog.error;
const cologSuccess = colog.success;

colog.error = function(str) { 
  cologError.call(colog, str.replace(/^\s+/gm, ''));
}
colog.success = function(str) { 
  cologSuccess.call(colog, str.replace(/^\s+/gm, ''));
}

module.exports = colog;
