const fs = require('fs');
const colog = require('colog');

/**
 * Parse settings from file.
 * return object parsed from json.  
 * throws Exception.
 *
 * @param {String} filename Name of the file to be parsed.
 * @return Object parsed json or falls on error.
 */
exports.parseSettings = (filename) => { 
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
