const proxyquire = require('proxyquire');
const {
  validateCommand, validateConnectionsConfig
} = require('../lib/config-validator');
const {
	toggleLoggingOff, toggleLoggingOn, ENOENT
} = require('../lib/test-util');
// fixture data for command and connection configuration
const { 
  VALID_CONFIG,
  VALID_NAME,
  SETTINGS_VALID,
  SETTINGS_MISSING_TYPE,
  SETTINGS_MISSING_NAME,
  SETTINGS_MISSING_CONNECTIONS
} = require('./fixtures/config-validator');
// stub for file system module
const fsStub = {}; 

exports.validateCommand = { 
  setUp: function(callback) { 
    /**
     * Reset process exit code to undefined
     * before each test.  
     */
    process.exitCode = undefined;
    callback();
  },
  testUndefinedName: function(test) { 
    test.expect(2);
    toggleLoggingOff();
    test.ok(
      !validateCommand(undefined, VALID_CONFIG), 
      'Undefined name results in validation failure.'
    );
    toggleLoggingOn();

    test.strictEqual(
      process.exitCode,
      1,
      'Undefined name results in graceful process exit.'
    );

    test.done();
  },
  testUndefinedConfigProperties: function(test) { 
    test.expect(2);
    toggleLoggingOff();
    let testConfig = Object.assign(
      {}, 
      {sql: VALID_CONFIG.sql}
    );
    test.ok(
      !validateCommand(VALID_NAME, testConfig),
      'Undefined config description prop causes failure.'
    );

    testConfig = Object.assign(
      {}, 
      {description: VALID_CONFIG.description}
    );
    test.ok(
      !validateCommand(VALID_NAME, testConfig),
      'Undefined config sql prop causes failure.'
    );

    toggleLoggingOn();
    test.done();
  },
  testNonStringConfigValues: function(test) { 
    test.expect(2);
    toggleLoggingOff();
    let testConfig = Object.assign(
      {description: {'description': VALID_CONFIG.description}}, 
      {sql: VALID_CONFIG.sql}
    );
    test.ok(
      !validateCommand(VALID_NAME, testConfig),
      'Description value of type object should cause failure.'
    );

    testConfig = Object.assign(
      {sql: {sql: VALID_CONFIG.sql}}, 
      {description: VALID_CONFIG.description}
    );
    test.ok(
      !validateCommand(VALID_NAME, testConfig),
      'Sql value of type object should cause failure.'
    );

    toggleLoggingOn();   
    test.done();
  },
  testFalsyConfigValues: function(test) { 
    test.expect(2);
    toggleLoggingOff();
    let testConfig = Object.assign(
      {description: undefined}, 
      {sql: VALID_CONFIG.sql}
    );
    test.ok(
      !validateCommand(VALID_NAME, testConfig),
      'Undefined config description value causes failure.'
    );

    testConfig = Object.assign(
      {sql: ''}, 
      {description: VALID_CONFIG.description}
    );
    test.ok(
      !validateCommand(VALID_NAME, testConfig),
      'Empty string config sql value causes failure.'
    );

    toggleLoggingOn();
    test.done();   
  },
  testArgumentInvalid: function(test) { 
    test.expect(3);
    toggleLoggingOff();
    let testConfig = Object.assign(
      {sql: 'select "{:argument name with whitespace}"'}, 
      {description: VALID_CONFIG.description}
    );
    test.ok(
      !validateCommand(VALID_NAME, testConfig),
      'sql argument placeholder with whitespace causes failure' 
    );

    testConfig = Object.assign( 
      {sql: 'select "{:}"'},
      {description: VALID_CONFIG.description}
    );
    test.ok(
      !validateCommand(VALID_NAME, testConfig),
      'Placeholder with empty argument causes failure' 
    );

    testConfig = Object.assign( 
      {sql: 'select "{:%$*}"'}, 
      {description: VALID_CONFIG.description}
    );
    test.ok( 
      !validateCommand(VALID_NAME, testConfig), 
      'Placeholder arg with Non-Word characters causes failure.'
    );

    toggleLoggingOn();
    test.done();      
  },
  testValidConfig: function(test) { 
    test.expect(4);
    toggleLoggingOff();
    test.ok( 
      validateCommand(VALID_NAME, VALID_CONFIG), 
      'Valid config with multiple args is valid.'
    );

    let testConfig = Object.assign( 
      {sql: 'select "{:one-argument}"'},
      {description: VALID_CONFIG.description}
    );
    test.ok(
      validateCommand(VALID_NAME, testConfig),
      'Valid config with one arg is valid.'
    );

    testConfig = Object.assign( 
      {sql: 'select "no arguments"'},
      {description: VALID_CONFIG.description}
    );
    test.ok(
      validateCommand(VALID_NAME, testConfig),
      'Valid config with zero args is valid.'
    );

    test.notStrictEqual(
      process.exitCode,
      1,
      `Valid config should not result in 
        process exiting with error.`
    );

    toggleLoggingOn();
    test.done();
  }
};

exports.validateConnectionsConfig = { 
  setUp: function(callback) { 
    /**
     * Reset process exit code to undefined
     * before each test.  
     */
    process.exitCode = undefined;
    callback();
  },
  testValidConnectionConfig: function(test) { 
    test.expect(2);
    const configMap = new Map(Object.entries(
      JSON.parse(SETTINGS_VALID).connections
    ));
    test.ok(
      validateConnectionsConfig(configMap), 
      'A valid connection config map returns true.'
    );
    test.notStrictEqual( 
      process.exitCode,
      1,
      'Process should not be in error state.'
    );
    test.done()
  },
  testConnectionMissingConnectionsKey: function(test) { 
		test.expect(2);
    toggleLoggingOff();
    test.ok( 
      !validateConnectionsConfig(undefined),
      'Invalid connection config returns false.'
    );
    toggleLoggingOn();
    test.strictEqual( 
      process.exitCode,
      1,
      'Process should be in error state.'
    );
		test.done();
	},
	testConnectionMissingType: function(test) { 
		test.expect(2);
    const configMap = new Map(Object.entries(
      JSON.parse(SETTINGS_MISSING_TYPE).connections
    ));
    toggleLoggingOff();
    test.ok( 
      !validateConnectionsConfig(configMap),
      'Invalid connection config returns false.'
    );
    toggleLoggingOn();
    test.strictEqual( 
      process.exitCode,
      1,
      'Process should be in error state.'
    );
		test.done();
	},
	testConnectionMissingName: function(test) { 
		test.expect(2);
    const configMap = new Map(Object.entries(
      JSON.parse(SETTINGS_MISSING_NAME).connections
    ));
    toggleLoggingOff();
    test.ok( 
      !validateConnectionsConfig(configMap),
      'Invalid connection config returns false.'
    );
    toggleLoggingOn();
    test.strictEqual( 
      process.exitCode,
      1,
      'Process should be in error state.'
    );
		test.done();
	}
}
