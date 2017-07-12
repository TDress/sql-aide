const {
	toggleLoggingOff, toggleLoggingOn, ENOENT
} = require('../lib/test-util');
const proxyquire = require('proxyquire');
const {SETTINGS_FILE_NAME} = require('./connection');
const fsStub = {}; 

const SETTINGS_INVALID_JSON = 'INVALIDJSON';

/**
 * Tests for the parse module.
 */
module.exports = { 
	testSettingsInvalidJSON: function(test) { 
		test.expect(2);
		fsStub.readFileSync = () => SETTINGS_INVALID_JSON;
		toggleLoggingOff();
    const {parseSettings} = proxyquire('../lib/parse', {'fs': fsStub});
    const settings = parseSettings(SETTINGS_FILE_NAME);
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
    const {parseSettings} = proxyquire('../lib/parse', {'fs': fsStub});
    const settings = parseSettings(SETTINGS_FILE_NAME);
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
      const {parseSettings} = proxyquire('../lib/parse', {'fs': fsStub});
      const settings = parseSettings(SETTINGS_FILE_NAME);
		}
		test.throws(
			requireBlock,
			Error,
			'Unhandled file system exception should be thrown.'
		);
		test.done();
	}
}

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
