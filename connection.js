const fs = require('fs');
const settings = fs.readFileSync('sqade-settings.json');
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
const connections = settings.connections;

module.exports = { 
	configMap: new Map(Object.entries(configuration)),

}
