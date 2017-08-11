const {Command} = require('commander');
const {toggleLoggingOff, toggleLoggingOn} = require('../lib/test-util');
const proxyquire = require('proxyquire').noPreserveCache();
const { 
  COMMAND_MISSING_NAME,
  COMMAND_MISSING_SQL,
  COMMAND_ONE_ARGUMENT,
  COMMAND_TWO_ARGUMENTS,
  COMMAND_THREE_ARGUMENTS,
  COMMAND_MULTIPLE
} = require('./fixtures/custom-commands');

const fsStub = {}; 

/**
 * Tests for custom commands parsed from custom-commands.json
 */

module.exports = {
  setUp: function(callback) { 
		// commander application.
		this.app = new Command();

    callback();
  },
  testValidCommandOneArgument: function(test) { 
    test.expect(7);
		fsStub.readFileSync = () => COMMAND_ONE_ARGUMENT;
    const config = JSON.parse(COMMAND_ONE_ARGUMENT);
    const ConfigParser = proxyquire('../lib/config-parser', {'fs': fsStub});
		const custom = proxyquire('../commands/custom', {'../lib/config-parser': ConfigParser});
    helperTestCustomModuleValid(test, custom, config);

    custom.commands[Object.keys(config)[0]](this.app, {});
    const command = this.app.commands[0];
    helperTestValidCommand(test, command, config);

    test.done();
  },
  testValidCommandTwoArguments: function(test) { 
    test.expect(7);
		fsStub.readFileSync = () => COMMAND_TWO_ARGUMENTS;
    const config = JSON.parse(COMMAND_TWO_ARGUMENTS);
    const ConfigParser = proxyquire('../lib/config-parser', {'fs': fsStub});
		const custom = proxyquire('../commands/custom', {'../lib/config-parser': ConfigParser});
    helperTestCustomModuleValid(test, custom, config);

    custom.commands[Object.keys(config)[0]](this.app, {});
    const command = this.app.commands[0];
    helperTestValidCommand(test, command, config);

    test.done();   
  },
  testValidCommandThreeArguments: function(test) { 
    test.expect(7);
		fsStub.readFileSync = () => COMMAND_THREE_ARGUMENTS;
    const config = JSON.parse(COMMAND_THREE_ARGUMENTS);
    const ConfigParser = proxyquire('../lib/config-parser', {'fs': fsStub});
		const custom = proxyquire('../commands/custom', {'../lib/config-parser': ConfigParser});
    helperTestCustomModuleValid(test, custom, config);

    custom.commands[Object.keys(config)[0]](this.app, {});
    const command = this.app.commands[0];
    helperTestValidCommand(test, command, config);

    test.done();     
  },
  testValidMultipleCommands: function(test) { 
    test.expect(15);
		fsStub.readFileSync = () => COMMAND_MULTIPLE;
    const config = JSON.parse(COMMAND_MULTIPLE);
    const ConfigParser = proxyquire('../lib/config-parser', {'fs': fsStub});
		const custom = proxyquire('../commands/custom', {'../lib/config-parser': ConfigParser});
    helperTestCustomModuleValid(test, custom, config);

    Object.keys(custom.commands).forEach((name, i) => { 
      custom.commands[name](this.app, {});
      let command = this.app.commands[i];
      helperTestValidCommand(test, command, config);
    });

    test.done();        
  },
  testInvalidCommand: function(test) { 
    test.expect(4);
		fsStub.readFileSync = () => COMMAND_MISSING_NAME;
    let config = JSON.parse(COMMAND_MISSING_NAME);
    let ConfigParser = proxyquire('../lib/config-parser', {'fs': fsStub});
    toggleLoggingOff();
		let custom = proxyquire('../commands/custom', {'../lib/config-parser': ConfigParser});
    toggleLoggingOn();
    
    test.ok( 
      !custom.isValid,
      `command configuration results 
        in invalid custom module.`
    );
    test.ok( 
      !Object.keys(custom.commands).length,
      `Invalid command configuration results
        in empty commands object.`
    );

		fsStub.readFileSync = () => COMMAND_MISSING_SQL;
    config = JSON.parse(COMMAND_MISSING_SQL);
    ConfigParser = proxyquire('../lib/config-parser', {'fs': fsStub});
    toggleLoggingOff();
		custom = proxyquire('../commands/custom', {'../lib/config-parser': ConfigParser});
    toggleLoggingOn();
    
    test.ok( 
      !custom.isValid,
      `Invalid command configuration results 
        in invalid custom module.`
    );
    test.ok( 
      !Object.keys(custom.commands).length,
      `Invalid command configuration results
        in empty commands object.`
    );

    test.done();
  }

}

/**
 * Helper function to run assertions on a custom command
 * module that is expected to be valid.
 *
 * @param {Object} test Node unit test object.
 * @param {Object} custom Custom command module.
 * @param {Object} config Fixture data for a custom command
 *    configuration, in place of a custom-commands.json file.
 * @return void Runs 3 test assertions.
 */
const helperTestCustomModuleValid = (test, custom, config) => { 
  const configCommandNames = Object.keys(config);
  const commandNames = Object.keys(custom.commands);
  test.ok( 
    custom.isValid,
    'Custom module should be valid.'
  );
  test.strictEqual( 
    commandNames.toString(),
    configCommandNames.toString(),
    'Command names match those in the test configuration.'
  );
  test.ok( 
    commandNames.filter(name => {
      return typeof custom.commands[name] === 'function' 
        && custom.commands[name].length === 2;
    }).length,
    commandNames.length,
    'Each command property value is a function with 2 arguments.'
  ); 
}

/**
 * Helper function to run assertions on a commander
 * application command object that is expected to have
 * successfully been registered with the test configuration
 * command.
 *
 * @param {Object} test Node unit test object.
 * @param {Object} command Commander.js command object.
 * @param {Object} config Fixture data for a custom command
 *    configuration, in place of a custom-commands.json file.
 * @return void Runs 3 test assertions.
 */
const helperTestValidCommand = (test, command, config) => { 
    const commandName = command.name();
    const expectedArgs = config[commandName].args;
    const expectedDescription = config[commandName].description;

		test.ok(
      command, 
      `The command was registered to the commander program object.`
		);
		test.notStrictEqual(
      Object.keys(config).indexOf(commandName),
      -1,
			'The correct command name was registered.'
		);
		test.strictEqual(
      command.description(), 
      expectedDescription,
			'The correct command description was registered.'
		);
    test.strictEqual( 
      command._args.map(arg => arg.name).join(','),
      expectedArgs, 
      'The correct arguments were registered.'
    );
}
