const {
	toggleLoggingOff, toggleLoggingOn, ENOENT
} = require('../lib/test-util');
const proxyquire = require('proxyquire');
const fsStub = {}; 

/**
 * stub the node fs core module readFileSync() method
 * to return test data.  We want to test 
 * invalid connection configurations, etc.
 */
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
	testConnectionValid: function(test) { 
		test.expect(3);
		fsStub.readFileSync = () => SETTINGS_VALID;
    proxyquire('../lib/parse', {'fs': fsStub});
		const connection = proxyquire('../connection', {});
		
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
    proxyquire('../lib/parse', {'fs': fsStub});
		const connection = proxyquire('../connection', {});
		toggleLoggingOn();
		
		helpers.undefinedConfigProcessExits(test, connection);
		test.done();
	},
	testConnectionMissingType: function(test) { 
		test.expect(3);
		fsStub.readFileSync = () => SETTINGS_MISSING_TYPE;
		toggleLoggingOff();
    proxyquire('../lib/parse', {'fs': fsStub});
		const connection = proxyquire('../connection', {});
		toggleLoggingOn();	

		helpers.invalidConnectionSettingsProcessExits(test, connection);
		test.done();
	}
};

// Helper methods for common assertions.
const helpers = { 
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
