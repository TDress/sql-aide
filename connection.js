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

const getSettings = () => { 
	// TO DO: create an error utility for these exceptions
	try {
		const settingsData = fs.readFileSync('sqade-settings.json');
		return settings = JSON.parse(settingsData.toString());
	} catch (e) {
		if (e.code === 'ENOENT') { 
			// TO DO: Add a reminder in the message about copying 
			// default settings file.
			colog.error('Unable to read sqade-settings.json file');
			process.exitCode = 1;
			return false;
		} else if (e instanceof SyntaxError) { 
			// To Do: get errors with line numbers from parsing json 
			colog.error(`Unable to parse sqade-settings.json file.  
				Make sure it is valid json`
			);
			process.exitCode = 1;
			return false;
		} else { 
			throw e;
		}
	}
};

const settings = getSettings();
if (settings) {
	const connections = settings.connections;
	// Run configuration settings through some validations.
	if (!connections) { 
		colog.error(`There is no connections property in your
			sqade-settings.json file.  This property must
			be set with your connection configurations.`
		);
		process.exit(1);
	}

	// To Do: iterate over config and check that we have
	// everything we need for each connection.  
	const configMap = new Map(Object.entries(connections));
	module.exports = { 
		configMap,
		active: connections.activeDB,
		updateActive: name => { 
			this.active = name;
			// TO DO: update the actual settings file
		}
	}
} 
