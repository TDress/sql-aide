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
const settingsInvalidJSON = 'INVALIDJSON';
const settingsMissingType = `{
	"connections": { 
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
const settingsMissingDatabase = `{
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
const settingsMissingConnections = `{
	"connect": { 
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

module.exports = { 
	testConnectionInvalidJSON: function(test) { 
		test.expect(2);
		fsStub.readFileSync = () => settingsInvalidJSON;
		toggleLoggingOff();
		const connection = proxyquire('../connection', {'fs': fsStub});
		toggleLoggingOn();
		test.strictEqual(Object.keys(connection).length, 0, 
			'The connection module should be empty.'
		);
		test.strictEqual(process.exitCode, 1, 
			'The process exit code should be 1(error).'
		);
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
		test.strictEqual(Object.keys(connection).length, 0, 
			'The connection module should be empty.'
		);
		test.strictEqual(process.exitCode, 1, 
			'The process exit code should be 1(error).'
		);
		test.done();
	},

}
