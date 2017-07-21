const fs = require('fs');
const colog = require('colog');

// Regular expressions for variable placeholders.
const RE = /\{:(\S+)\}/;
const RE_GLOBAL = /\{:(\S+)\}/g;

/**
 * Parse settings from file.
 * return object parsed from json.  
 * throws Exception.
 *
 * @param {String} filename Name of the file to be parsed.
 * @return Object parsed json or falls on error.
 */
exports.parseSettingsFile = (filename) => { 
	// TO DO: create an error utility for these exceptions
	try {
		const settingsData = fs.readFileSync(filename);
		return JSON.parse(settingsData.toString());
	} catch (e) {
		if (e.code === 'ENOENT') { 
			// TO DO: Add a reminder in the message about copying 
			// default settings file.
			colog.error(`Unable to read ${filename} file`);
			process.exitCode = 1;
			return false;
		} else if (e instanceof SyntaxError) { 
			// To Do: get errors with line numbers from parsing json 
			colog.error(
				`Unable to parse ${filename} file.  
				Make sure it is valid json`
			);
			process.exitCode = 1;
			return false;
		} else { 
			throw e;
		}
	}
};

/**
 * Parse argument names from string.
 * Argument names are inside of the placeholder syntax.
 * EG input: `{:arg_name}`
 *    output: [`arg_name]
 *
 * @param {String} str String with argument placeholders
 *    where placeholders look like `{:arg}`
 * @return {Array} Argument names, in the order they appear in 
 *    the input string.  Empty names are discarded.
 */
exports.parseArgNames = (str) => { 
  return (str.match(RE_GLOBAL) || [])
    .map(arg => { 
      return arg.match(RE)[1];
    })
    .filter(Boolean);
};

/**
 * Insert SQL variable argument values into query, 
 * replacing placeholders.  The arguments are sorted in order of
 * where they appear in the query string.  Each placeholder 
 * is replaced by shifting the arguments array.  
 * throws Exception
 *
 * @param {Array} args Argument values (passed in via CLI).
 * @param {String} sql Query string.
 * @return {String} Query string with placeholders replaced by 
 *    argument values.
 */
exports.insertSQLArgs = (args, sql) => { 
  let result = sql;
  while (args.length && RE.test(result)) {
    result = result.replace(RE, args.shift());
  }
  
  if (args.length || RE.test(result)) { 
    // We unexpectedly were unable to build the query!
    throw new Error(
      `There was an error inserting the command arguments
       into the SQL query string.`
    );
  }

  return result;

};
