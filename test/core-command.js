/**
 * Unit tests for the core commands module.
 * Mock the connection object 
 * and test for side effects on the commander
 * application object.  
 */
const {Command} = require('commander');
const {commands, DB_COMMAND} = require('../commands/core');
const {toggleLoggingOff, toggleLoggingOn} = require('../lib/test-util');
const {
  SETTINGS_VALID,
  SETTINGS_VALID_NAMES,
  NON_OPTION
} = require('./fixtures/config-validator');

const connections = JSON.parse(SETTINGS_VALID).connections;

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
			active: SETTINGS_VALID_NAMES[0], 
			updateActive: function(name) { 
				this.active = name;
				this.updateCount++;
			},
			updateCount: 0
		};
		// commander application.
		this.app = new Command();
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
		commands[DB_COMMAND](this.app, this.connection);
		let command = this.app.commands[0];
		test.ok(
      command, 
      `The command was registered to the commander program object.`
		);
		test.strictEqual(
      command.name(), 
      DB_COMMAND,
			'The correct command name was registered.'
		);
		/**
		 * Since we don't want this output to mix with the nodeunit 
		 * output, we will shut off the logging right before calling 
		 * parse() on the commander program, and then toggle logging
		 * right back on.
		 */
		toggleLoggingOff();
		this.app.parse(['node', 'sqade', DB_COMMAND, '--switch_db', NON_OPTION]);
		toggleLoggingOn();

		test.ok(
      /not\s*found/.test(console.lastSqadeOutput), 
			'`Not found` is printed to the terminal.'
		);
		let options = command.opts();
		test.ok(
      options.switch_db && options.switch_db === NON_OPTION, 
			'The option was passed into the command.'
		);
		test.strictEqual(
      this.connection.updateCount, 
      0,
			'connection.updateActive() was not called.'
		);
		test.done();
	},
	/**
	 * `db` command -- test switch_db option value is valid
	 * and the active connection is updated.  
	 */
	testDBUpdateActive: function(test) { 
		test.expect(5)
		commands[DB_COMMAND](this.app, this.connection);
		test.strictEqual(this.connection.updateCount, 0, 
			'The connection update count starts at 0.'
		);
		test.strictEqual(this.connection.active, SETTINGS_VALID_NAMES[0], 
			'The starting active connection is the first test name.'
		);

		//  turn off logging and run the command 
		toggleLoggingOff();
		this.app.parse(['node', 'sqade', DB_COMMAND, '--switch_db', SETTINGS_VALID_NAMES[1]]);
		toggleLoggingOn();

		test.strictEqual(this.connection.updateCount, 1, 
			'The connection update count is updated to 1.'
		);
		test.strictEqual(this.connection.active, SETTINGS_VALID_NAMES[1], 
			'The active connection name has been updated.'
		);
		const regex = RegExp(`connected to: ${SETTINGS_VALID_NAMES[1]}`);
		test.ok(regex.test(console.lastSqadeOutput), 
			'The output to the terminal shows the new active connection.'
		);
		test.done();
	},
	/**
	 * `db` command -- test without any option.  
	 */
	testDBNoOptions: function(test) {
		test.expect(4);
		commands[DB_COMMAND](this.app, this.connection);
		test.strictEqual(this.connection.active, SETTINGS_VALID_NAMES[0], 
			'The starting active connection is the first test name.'
		);

		toggleLoggingOff();
		this.app.parse(['node', 'sqade', DB_COMMAND]);
		toggleLoggingOn();
		
		test.strictEqual(this.connection.updateCount, 0,
			'connection.updateActive() was not called.'
		);
		test.strictEqual(this.connection.active, SETTINGS_VALID_NAMES[0], 
			'The active connection is still the first test name.'
		);
		const regex = RegExp(`connected to: ${SETTINGS_VALID_NAMES[0]}`);
		test.ok(regex.test(console.lastSqadeOutput), 
			'The output to the terminal shows the active connection.'
		);
		test.done();
	}
}






