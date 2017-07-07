const {
	toggleLoggingOff, toggleLoggingOn, ENOENT
} = require('../lib/test-util');
const proxyquire = require('proxyquire');
const fsStub = {}; 

/**
 * stub the node fs core module readFileSync() method
 * to return test data.  We want to test invalid json, 
 * invalid connection configurations, etc.
 */
const SETTINGS_INVALID_JSON = 'INVALIDJSON';
const SETTINGS_VALID = `{
	"connections": { 
		"test": 
			{ 
				"type": "mssql",
				"host": "localhost",
				"port": 400,
				"database": "test",
				"login": "user",
				"password": "pass",
				"verifyOnValidate": false		
			},
		"test2": 
			{ 
				"type": "mysql",
				"host": "test.host.com",
				"port": 100,
				"database": "test",
				"login": "user",
				"password": "pass",
				"verifyOnValidate": false		
			}
	},
	"activeDb": null
}`;
const SETTINGS_MISSING_TYPE = `{
	"connections": { 
		"settingsMissingType": 
			{ 
				"host": "localhost",
				"port": 400,
				"database": "test",
				"login": "user",
				"password": "pass",
				"verifyOnValidate": false		
			}
	},
	"activeDb": null
}`;

const SETTINGS_MISSING_NAME = `{
	"connections": { 
		{ 
			"type": "mssql",
			"host": "localhost",
			"port": 400,
			"login": "user",
			"password": "pass",
			"verifyOnValidate": false
		}
	},
	"activeDb": null
}`;
const SETTINGS_MISSING_CONNECTIONS = `{
	{'missingconnectionskey': true}
}`;

module.exports = { 
	testConnectionInvalidJSON: function(test) { 
		test.expect(2);
		fsStub.readFileSync = () => SETTINGS_INVALID_JSON;
		toggleLoggingOff();
		const connection = proxyquire('../connection', {'fs': fsStub});
		toggleLoggingOn();

		helpers.undefinedConfigProcessExits(test, connection);
		test.done();
	},
	testConnectionfileSystemError: function(test) { 
		test.expect(2);
		fsStub.readFileSync = () => { 
			// stub a node system error.  (no such file exists).
			let error = Error();
			error.code = ENOENT;
			throw error;
		}
		toggleLoggingOff();
		const connection = proxyquire('../connection', {'fs': fsStub});
		toggleLoggingOn();

		helpers.undefinedConfigProcessExits(test, connection);
		test.done();
	},
	testConnectionErrorOther: function(test) { 
		test.expect(1);
		fsStub.readFileSync = () => { 
			// stub unhandled system exception
			let error = Error();
			throw error;
		}
		const requireBlock = () => { 
			const connection = proxyquire('../connection', {'fs': fsStub});
		}
		test.throws(
			requireBlock,
			Error,
			'Unhandled file system exception should be thrown.'
		);
		test.done();
	},
	testConnectionValid: function(test) { 
		test.expect(3);
		fsStub.readFileSync = () => SETTINGS_VALID;
		const connection = proxyquire('../connection', {'fs': fsStub});
		
		const config = connection.config;
		test.ok(
			config.configMap, 
			'Connection configuration map should be truthy.'
		);
		test.ok(
			config.isValid,
			'The connection settings should be valid.'
		);
		const testSettings = new Map(Object.entries(JSON.parse(SETTINGS_VALID)));
		test.deepEqual( 
			config.configMap,
			testSettings,
			`The connection settings config map contains the entries parsed from
				 the settings json.`
		)
		test.done();	
	},
	testConnectionMissingConnectionsKey: function(test) { 
		test.expect(2);
		fsStub.readFileSync = () => SETTINGS_MISSING_CONNECTIONS;
		toggleLoggingOff();
		const connection = proxyquire('../connection', {'fs': fsStub});
		toggleLoggingOn();
		
		helpers.undefinedConfigProcessExits(test, connection);
		test.done();
	},
	testConnectionMissingType: function(test) { 
		test.expect(3);
		fsStub.readFileSync = () => SETTINGS_MISSING_TYPE;
		toggleLoggingOff();
		const connection = proxyquire('../connection', {'fs': fsStub});
		toggleLoggingOn();	

		helpers.invalidConnectionSettingsProcessExits(test, connection);
		test.done();
	}

}

const helpers = { 
	// Helper methods for common assertions.
	undefinedConfigProcessExits(test, connection) { 
		const config = connection.config;
		test.ok(
			!config, 
			'The connection module config mapping should be undefined.'
		);
		test.strictEqual(
			process.exitCode, 
			1, 
			'The process exit code should be 1(error).'
		);	
	},
	invalidConnectionSettingsProcessExits(test, connection) { 
		const config = connection.config;
		test.ok( 
			config.configMap,
			'The connection module config mapping should not be undefined.'
		);
		test.strictEqual( 
			config.isValid,
			false,
			'The connection module should be in an invalid state.'
		);
		test.strictEqual(
			process.exitCode, 
			1, 
			'The process exit code should be 1(error).'
		);	
	}
};
