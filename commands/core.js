const colog = require('colog');

// command names
const DB_COMMAND = 'db';
/**
 * Core commands for sqade.
 * Each property is the name of a command and its value
 * is a function that registers the command configuration.
 */
let commands = {};
commands[DB_COMMAND] = (app, connection) => { 
	const active = connection.active;
	app
		.command('db')
		.description('manage your DB connections')
		.option('-s, --switch_db <dbname>', 'switch to connection with name provided')
		.action((options) => { 
			const {switch_db} = options;
			if (switch_db && connection.configMap.has(switch_db)) { 
				connection.updateActive(switch_db);
				colog.success(`Now connected to: ${switch_db}.`);
				process.exitCode = 0;
			} else if (switch_db) { 
				process.exitCode = 1;
				return colog.error(
					`The connection with name ${switch_db} was not
					found in sqade-settings.json`
				);
			} else { 
				// no options.  show the current connection name.  
				colog.success(`Currently connected to: ${active}`);
				process.exitCode = 0;
			}
		});
};

module.exports = { 
  DB_COMMAND, 
  commands
};

