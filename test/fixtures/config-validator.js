/**
 * Fixture data for setting configurations.
 * Includes a test data for sqade-settings.json
 * and custom-commands.json
 */

// command configuration
const VALID_CONFIG = { 
  sql: 'select "{:one} then {:two} then {:three}"',
  description: 'this command is a test'
};
const VALID_CONFIG_SP = { 
    "isProcedure": true,
    "procedureName": "example-name", 
    "commandArgs": [ 
      "example_arg1",  
      "example_arg2",
      "example_arg3"
    ],
    "procedureArgs": [ 
      "example_arg1",
      "example-field-name"
    ],
    "argPipeMap": [ 
      {
        "pipeToArg": "example-field-name",
        "pipeFromParams": [ 
          "example_arg2", 
          "example_arg3"
        ],
        "pipeFromProcedureName": "example-procedure-name",
        "isResultSet": false,
        "resultField": "example-field-name"
      }
    ],
    "description": "Example stored procedure description"
};
const VALID_NAME = 'test';

/*
 * Test connections.  We want to test 
 * invalid and valid connection configurations.  
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
				"database": "test2",
				"login": "user",
				"password": "pass",
				"verifyOnValidate": false		
			}
	},
	"activeDb": "test2",
  "activeDBResourceString": "mssql://user:pass@test.host.com:100/test2"
}`;
const SETTINGS_VALID_NAMES = ['test', 'test2'];

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
	"connections": [ 
		{ 
			"type": "mssql",
			"host": "localhost",
			"port": 400,
			"login": "user",
			"password": "pass",
			"verifyOnValidate": false
		}
	],
	"activeDb": null
}`;
const SETTINGS_MISSING_CONNECTIONS = `{
	{'missingconnectionskey': true}
}`;

// option name to use for testing a nonexistent option value.
const NON_OPTION = 'NON-OPTION';

module.exports = { 
  VALID_CONFIG,
  VALID_CONFIG_SP,
  VALID_NAME,
  SETTINGS_MISSING_CONNECTIONS,
  SETTINGS_MISSING_NAME,
  SETTINGS_MISSING_TYPE,
  SETTINGS_VALID,
  SETTINGS_VALID_NAMES,
  NON_OPTION
};
