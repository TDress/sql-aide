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

// TO DO: create an error utility for these exceptions
try {
	const settings = fs.readFileSync('sqade-settings.json');
} catch (e) {
	if (e.code === 'ENOENT') { 
		// TO DO: Add a reminder in the message about copying 
		// default settings file.
		colog.error('Unable to read sqade-settings.json file');
		process.exit();
	} else { 
		throw e;
	}
}
const connections = settings.connections;
// Run configuration settings through some validations.
// To Do: get errors with line numbers from parsing json 
if (!connections) { 
	colog.error(`Unable to parse sqade-settings.json file.  
		Make sure it is valid json`);
	process.exit();
}
const configMap = new Map(Object.entries(connections));
// To Do: iterate over config and check that we have
// everything we need for each connection.  

module.exports = { 
	configMap,
	active: connections.activeDB,
	updateActive: function(name) => { 
		this.active = name;
		// TO DO: update the actual settings file
	}
}
