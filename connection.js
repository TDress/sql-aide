const fs = require('fs');
const colog = require('colog');
/**
 * ADD YOUR CONNECTIONS TO sqade-settings.json 
 * SEE https://github.com/TDress/sql-aide
 *
 * Parse connections from sqade-settings.json
 * Below is some documentation on how to set
 * configuration settings for your database connections
 * in that file.  
 * TO DO: clean up the example below and add 
 * 		another one for a different database management system
 *
 * Connection object properties are validated for correct form 
 * and type on every run from the command line in order to
 * catch typos and other simple mistakes.
 * Additionally, you can set the `verifyOnValidate` key to 
 * true to run a trivial test query against the database 
 * to ensure that the connection is working.  
 * Note that this verification is only performed for the
 * currently active database, and will be run on every command.  
 *
 * connection keys: 
 * 		type {string} The type of SQL database management system.  
 * 			Case insensitive.
 * 			Valid types: `mysql`, `mssql`. 
 * 		host {string} The host of the database server.
 * 		port {integer} The port number of the database server.
 * 		database {string} The name of the database to connect to.
 * 		login {string} The login string to authenticate with.
 * 		password: {string} The password to use for authentication.
 * 		verifyOnValidate {Boolean} True to run a basic connection 
 * 			health check on each command.  This is NOT a health
 * 			check of the database in any way -- only a
 * 			verification that the connection to the database 
 * 			engine is good.
 *
 *			   E.G.
 *					myDb: { 
 *						type: mssql
 *						host: localhost,
 *						port: 400, 
 *						database: db1,
 *						login: username, 
 *						password: weakPassword,
 *						verifyOnValidate: true
 *					}
 */

// Valid SQL source types.
const SOURCE_TYPES = [ 
	'mssql',
	'mysql'
];

// generalized leading text for all validation errors.  
const VALIDATION_ERROR_MESSAGE = `Error: Invalid connection settings
	in sqade-settings.json.  `;

// utility function for connection settings validation
const notEmpty = (val) => val && val.length;
/**
 * connection setting keys that require validation
 * and functions for performing validation.  
 * More robust validations can be added later
 * but for now we will just check that the setting
 * has a non-empty value.
 */
const CONNECTION_KEYS = { 
	type(type, name) { 
		if (SOURCE_TYPES.indexOf(type) === -1) { 
			colog.error(
				VALIDATION_ERROR_MESSAGE
				+ 'Connection type setting must be one of the following: \n'
				+ SOURCE_TYPES.reduce((carry, val) => carry + val + '\n', '')
				+ '\n' + `On connection ${name}`
			);
			return false;
		}
		return true;
	}, 
	host(host, name) { 
		if (!notEmpty(host)) { 
			colog.error( 
				VALIDATION_ERROR_MESSAGE
				+ `Connection host setting must not be empty on connection ${name}.` 
			);
			return false;
		}
		return true;
	},
	port(port, name) { 
		if (!Number.isInteger(port) || port < 1) {
			colog.error( 
				VALIDATION_ERROR_MESSAGE
				+ `Connection port setting must be a positive 
					integer on connection ${name}.`
			);
			return false;
		}
		return true;
	},
	database(database, name) { 
		if (!notEmpty(database)) { 
			colog.error( 
				VALIDATION_ERROR_MESSAGE
				+ `Connection database setting must not be empty on connection ${name}.`
			);
			return false;
		}
		return true;
	},
	login(login, name) { 
		if (!notEmpty(login)) { 
			colog.error( 
				VALIDATION_ERROR_MESSAGE
				+ `Connection login setting must not be empty on connection ${name}.`
			);
			return false;
		}
		return true;
	},
	password(password, name) { 
		if (!notEmpty(password)) { 
			colog.error( 
				VALIDATION_ERROR_MESSAGE
				+ `Connection host setting must not be empty on connection ${name}.`
			);
			return false;
		}
		return true;
	}
};

/**
 * Validate each settings object, checking all required
 * keys.  
 * @param {Map} settingsMap the settings json parsed from sqade-settings.json
 * @return boolean validation is succeful.
 * 		On validation failure, the process exits gracefully and we return false,
 * 		after an error message is printed to the user.
 */
const validateSettings = (settingsMap) => { 
	const connections = settingsMap.entries();
	let entry = connections.next();
	while (!entry.done) {
		let connectionName = entry.value[0];
		let connectionValues = entry.value[1];
		// The connection name is not empty.
		if (connectionName.length < 1) { 
			colog.error(
				VALIDATION_ERROR_MESSAGE
				+ `Connections must have a non-empty name key.`
			);
			process.exitCode = 1;
			return false;
		}
		let isValid = Object.keys(CONNECTION_KEYS).reduce((carry, current) => {
			return carry 
				&& CONNECTION_KEYS[current](connectionValues[current], connectionName);
		}, true);

		if (!isValid) { 
			process.exitCode = 1;
			return false;
		}

		entry = connections.next();
	}

	return true;
}

/**
 * Parse settings from file.
 * return object parsed from json.  
 */
const parseSettings = () => { 
	// TO DO: create an error utility for these exceptions
	try {
		const settingsData = fs.readFileSync('sqade-settings.json');
		return JSON.parse(settingsData.toString());
	} catch (e) {
		if (e.code === 'ENOENT') { 
			// TO DO: Add a reminder in the message about copying 
			// default settings file.
			colog.error('Unable to read sqade-settings.json file');
			process.exitCode = 1;
			return false;
		} else if (e instanceof SyntaxError) { 
			// To Do: get errors with line numbers from parsing json 
			colog.error(
				`Unable to parse sqade-settings.json file.  
				Make sure it is valid json`
			);
			process.exitCode = 1;
			return false;
		} else { 
			throw e;
		}
	}
};

const settings = parseSettings();
if (settings) {
	const connections = settings.connections;
	if (connections) {
		// To Do: iterate over config and check that we have
		// everything we need for each connection.  
		const configMap = new Map(Object.entries(connections));
		const isValid = validateSettings(configMap);
		exports.config = { 
			configMap,
			isValid,
			active: connections.activeDB,
			updateActive: name => { 
				this.active = name;
				// TO DO: update the actual settings file
			}
		}
	} else {
		colog.error(
			`There is no connections property in your
			sqade-settings.json file.  This property must
			be set with your connection configurations.`
		);
		process.exitCode = 1;
	}
} 

