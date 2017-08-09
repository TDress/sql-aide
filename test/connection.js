const {SETTINGS_VALID} = require('./fixtures/config-validator');
const proxyquire = require('proxyquire').noPreserveCache();
const fsStub = {}; 

module.exports = { 
  tearDown: function(callback) { 
    proxyquire('../lib/config-parser', {'fs': {}});
    
    callback();
  },
	testConnectionValid: function(test) { 
		test.expect(4);
		fsStub.readFileSync = () => SETTINGS_VALID;
    proxyquire('../lib/config-parser', {'fs': fsStub});
		const connection = proxyquire('../connection', {});
		test.ok(
			connection.configMap, 
			'Connection configuration map should be truthy.'
		);
		test.ok(
			connection.isValid,
			'The connection settings should be valid.'
		);

		const testSettings = new Map(Object.entries(JSON.parse(SETTINGS_VALID)));
		test.deepEqual( 
			connection.configMap,
			testSettings,
			`The connection settings config map contains the entries parsed from
				 the settings json.`
		)

    test.strictEqual( 
      connection.active,
      SETTINGS_VALID.activeDB,
      'The active DB is parsed correctly from the settings file.'
    );
		test.done();	
	},
};

