/**
 * Unit tests for the core commands module.
 * Mock the connection object 
 * and test for side effects on the commander
 * application object.  
 */
// const core = require('../commands/core');
const app = require('commander');
const {core, DB_COMMAND} = require('../commands/core');

// mock database names
const NAMES = [ 
	'test1', 'test2', 'test3'
];
// option name to use for testing a nonexistent option value.
const NON_OPTION = 'NON-OPTION';
// mock connection configuration (sqade-settings.json)
let connections = {};
NAMES.forEach(name => { 
	connections[name] = {};
});

/*
 * Set up functions for toggling console logging on 
 * and off for the purposes of testing. 
 * We are not mocking the process object so the command's
 * output will be written to stdout/stderror.
 * Since we don't want this output to mix with the nodeunit 
 * output, we will shut off the logging right before calling 
 * parse() on the commander program, and then toggle logging
 * right back on.
 */
const oldConsole = { 
	error: console.error,
	log: console.log
};
const toggleLoggingOff = () => { 
	Object.keys(oldConsole).forEach(out => { 
		console[out] = function(message) { 
			console.lastSqadeOutput = message;
			// don't send any output to the terminal during tests.
		}
	});
}
const toggleLoggingOn = () => {
	Object.keys(oldConsole).forEach(out => { 
		console[out] = oldConsole[out];
	});
};

module.exports = { 
	setUp: function(callback) { 
		/**
		 * Mock connection object.
		 * Use a counter updateCount to test if the updateActive
		 * method has been called on the connection object.
		 */
		const configMap = new Map(Object.entries(connections));
		this.connection = { 
			configMap, 
			active: NAMES[0], 
			updateActive: function(name) { 
				this.active = name;
				this.updateCount++;
			},
			updateCount: 0
		};
		// commander application.
		this.app = app;
		callback();
	},
	tearDown: function(callback) { 
		callback();
	},
	/**
	 * `db` command-- test switch_db option value is invalid.  
	 * (The database name does not exist in the connections.)
	 */ 
	testDBCommandBadOption: function(test) { 
		test.expect(5);
		core[DB_COMMAND](this.app, this.connection);
		let command = this.app.commands[0];
		test.ok(command, `The command was registered to the 
			Commander program object.`)
		test.strictEqual(command.name(), DB_COMMAND,
			'The correct command name was registered.');
		//  turn off logging and run the command 
		toggleLoggingOff();
		this.app.parse(['node', 'sqade', DB_COMMAND, '--switch_db', NON_OPTION]);
		toggleLoggingOn();

		test.ok(/not\s*found/.test(console.lastSqadeOutput), 
			'`Not found` is printed to the terminal.');
		let options = command.opts();
		test.ok(options.switch_db && options.switch_db === NON_OPTION, 
			'The option was passed into the command.');
		test.strictEqual(this.connection.updateCount, 0,
			'connection.updateActive() was not called.');
		test.done();
	},
	/**
	 * `db` command -- test switch_db option value is valid
	 * and the active connection is updated.  
	 */
	testDBUpdateActive: function(test) { 
		test.done();
	}
}






