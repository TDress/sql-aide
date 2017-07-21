const {
	toggleLoggingOff, toggleLoggingOn, ENOENT
} = require('../lib/test-util');
const proxyquire = require('proxyquire');
const {SETTINGS_FILE_NAME} = require('./connection');
// stub for node fs module
const fsStub = {}; 

const SETTINGS_INVALID_JSON = 'INVALIDJSON';
// test Sql query strings.  
const TEST_SQL_NO_ARGS = 'select "test without args"';
const TEST_SQL_EMPTY_ARG = 'select "test {:} arg"';
const TEST_SQL_1_ARG = 'select "test {:first} arg"';
const TEST_SQL_2_ARGS = 'select "test {:first} and {:second} args"';
const TEST_SQL_3_ARGS = `select "test {:first} and {:second} and 
  {:third} args"`;

/**
 * Tests for the parse module.
 */
exports.parseSettingsFile = { 
	testSettingsInvalidJSON: function(test) { 
		test.expect(2);
		fsStub.readFileSync = () => SETTINGS_INVALID_JSON;
		toggleLoggingOff();
    const {parseSettingsFile} = proxyquire('../lib/config-parser', {'fs': fsStub});
    const settings = parseSettingsFile(SETTINGS_FILE_NAME);
		toggleLoggingOn();

		helpers.falseSettingsProcessExits(test, settings);
		test.done();
	},
	testSettingsfileSystemError: function(test) { 
		test.expect(2);
		fsStub.readFileSync = () => { 
			// stub a node system error.  (no such file exists).
			let error = Error();
			error.code = ENOENT;
			throw error;
		}
		toggleLoggingOff();
    const {parseSettingsFile} = proxyquire('../lib/config-parser', {'fs': fsStub});
    const settings = parseSettingsFile(SETTINGS_FILE_NAME);
		toggleLoggingOn();

		helpers.falseSettingsProcessExits(test, settings);
		test.done();
	},
	testSettingsErrorOther: function(test) { 
		test.expect(1);
		fsStub.readFileSync = () => { 
			// stub unhandled system exception
			let error = Error();
			throw error;
		}
		const requireBlock = () => { 
      const {parseSettingsFile} = proxyquire('../lib/config-parser', {'fs': fsStub});
      const settings = parseSettingsFile(SETTINGS_FILE_NAME);
		}
		test.throws(
			requireBlock,
			Error,
			'Unhandled file system exception should be thrown.'
		);
		test.done();
	}
}

/**
 * Tests for ConfigParser.insertSQLArgs method.  
 */
exports.insertSQLArgs = { 
  setUp: function(callback) { 
    const {insertSQLArgs} = proxyquire('../lib/config-parser', {});   
    this.insertSQLArgs = insertSQLArgs;

    callback();
  },
  testInsertArgs: function(test) { 
    test.expect(5);

    let testArgs = [];
    let result = this.insertSQLArgs(testArgs, TEST_SQL_NO_ARGS);
    test.strictEqual(
      result, 
      TEST_SQL_NO_ARGS, 
      'SQL query string with no args results in an unchanged string'
    );

    result = this.insertSQLArgs(testArgs, TEST_SQL_EMPTY_ARG);
    test.strictEqual(
      result, 
      TEST_SQL_EMPTY_ARG, 
      'SQL query string with empty argument results in an unchanged string'
    );

    testArgs.push('one');
    result = this.insertSQLArgs(testArgs, TEST_SQL_1_ARG);
    test.strictEqual( 
      result,
      'select "test one arg"',
      'SQL query string arg should be replaced with arg value'
    );

    testArgs.push('one', 'two');
    result = this.insertSQLArgs(testArgs, TEST_SQL_2_ARGS);
    test.strictEqual( 
      result,
      'select "test one and two args"',
      '2 SQL query string args should be replaced with 2 arg values'
    );

    testArgs.push('one', 'two', 'three');
    result = this.insertSQLArgs(testArgs, TEST_SQL_3_ARGS);
    test.strictEqual( 
      result,
      'select "test one and two and \n  three args"',
      '3 SQL query string args should be replaced with 3 arg values'
    );

    test.done();
  },
  testInsertArgsExcessArgs: function(test) { 
    test.expect(1);

    const requireBlock = () => { 
      this.insertSQLArgs([1, 2, 3, 4], TEST_SQL_1_ARG);
    };
    test.throws( 
      requireBlock, 
      Error,
      'Exception should be thrown if all args are not inserted'
    );
    test.done();
  }
};

/**
 * Tests for ConfigParser.insertSQLArgs method.  
 */
exports.parseArgNames = { 
  setUp: function(callback) { 
    const {parseArgNames} = proxyquire('../lib/config-parser', {});   
    Object.assign(this, {parseArgNames});

    callback();
  },
  testParseNoArgs: function(test) { 
    test.expect(1);
    test.ok(
      !this.parseArgNames(TEST_SQL_NO_ARGS).length,
      'Arguments results should be empty when the input has no args.'
    );

    test.done();
  },
  testParseEmptyArg: function(test) { 
    test.expect(1);
    test.ok(
      !this.parseArgNames(TEST_SQL_EMPTY_ARG).length,
      'Arguments results should be empty when the input has empty arg.'
    );

    test.done();
  },
  testParseOneArg: function(test) { 
    test.expect(1);
    const expected = ['first'];
    test.strictEqual(
      this.parseArgNames(TEST_SQL_1_ARG).join(), 
      expected.join(), 
      'Arguments results should contain one arg when input has one arg.'
    );
    test.done();
  },
  testParseThreeArgs: function(test) { 
    test.expect(1);
    const expected = ['first', 'second', 'third'];
    test.strictEqual(
      this.parseArgNames(TEST_SQL_3_ARGS).join(), 
      expected.join(), 
      `Arguments results should contain 3 args when input has three args
      and they should in the array in the same order as they appear
      in the string`
    );
    test.done();
  }
};

// Helper methods for common assertions.
const helpers = { 
	falseSettingsProcessExits(test, settings) { 
		test.ok(
			!settings, 
			'The parsed settings should be false.'
		);
		test.strictEqual(
			process.exitCode, 
			1, 
			'The process exit code should be 1(error).'
		);	
	}
};
