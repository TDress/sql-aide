/**
 * This module provides useful functions and constants
 * for testing with a nodeunit.
 */

// store console object methods so we can overwrite them.
const oldConsole = { 
	error: console.error,
	log: console.log
};

/**
 * Error codes used for SystemError exceptions by node.
 */
const ENOENT = 'ENOENT';
const EACCES = 'EACCES';
const EEXIST = 'EEXIST';

module.exports = { 
	/*
	 * Functions that toggle console logging on 
	 * and off for the purposes of testing. 
	 * We are not mocking the process object so the command's
	 * output will be written to stdout/stderror.
	 */
	toggleLoggingOff() { 
		Object.keys(oldConsole).forEach(out => { 
			console[out] = function(message) { 
				console.lastSqadeOutput = message;
				// don't send any output to the terminal during tests.
			}
		});
	},
	toggleLoggingOn() {
		Object.keys(oldConsole).forEach(out => { 
			console[out] = oldConsole[out];
		});
	},
	ENOENT,
	EACCES,
	EEXIST
}
