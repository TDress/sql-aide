const colog = require('./colog-noindent');

/**
 * This module provides functions for validating 
 * configuration settings.
 */

// Regular expressions for argument placeholders in SQL.
const RE = /\{:(.*)\}/;
const RE_GLOBAL = /\{:.*?\}/g;
const RE_SPECIAL = /[@#$%^&*()~]/;

// Valid SQL source types.
const SOURCE_TYPES = [ 
	'mssql',
	'mysql'
];
// generalized leading text for all validation errors.  
const VALIDATION_ERROR_MESSAGE = 
  `Error: Invalid connection settings
	in sqade-settings.json.  `
    .replace(/^\s+/gm, '');

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
		if (!(host && host.length)) { 
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
		if (!(database && database.length)) { 
			colog.error( 
				VALIDATION_ERROR_MESSAGE
				+ `Connection database setting must not be empty on connection ${name}.`
			);
			return false;
		}
		return true;
	},
	login(login, name) { 
		if (!(login && login.length)) { 
			colog.error( 
				VALIDATION_ERROR_MESSAGE
				+ `Connection login setting must not be empty on connection ${name}.`
			);
			return false;
		}
		return true;
	},
	password(password, name) { 
		if (!(password && password.length)) { 
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
 * Validate command configuration.
 * Command properties must be set.
 * Argument names must not have whitespace, or special characters
 *  
 * @param {String} name The command name.
 * @param {Object} config Configuration which includes properties:
 *    `sql` the query string (optional)
 *    `description` description of command that will
 *      be used when displaying command on CLI (required)
 *    `isProcedure` is this a stored procedure?  If yes
 *      then the procedureName and procedureArgs properties are required
 *    `procedureArgs` array of procedure argument names
 *    `procedureName` name of the stored procedure
 *
 * @return {Boolean} validation success or failure.  
 *    Failure will results in an error message and the
 *    process will exit gracefully.
 */
exports.validateCommand = (name, config) => { 
  const {
    sql, 
    description,
    isProcedure,
    procedureName,
    procedureArgs
  } = config;
  
  if (
    !name
    || !description
    || (sql && typeof sql !== 'string')
    || typeof description !== 'string'
  ) { 
    colog.error(
      `Command configuration invalid.  Make 
      sure that command with name "${name}" has
      properties "sql" and "description" with string
      values in file custom-commands.json`
    );
    process.exitCode = 1;
    return false;
  } else if (isProcedure || !sql)  { 
    if (
      !procedureName
      || !procedureArgs
      || typeof procedureName !== 'string'
    ) { 
      colog.error(
        `Command configuration invalid.  Make 
        sure that stored procedure command with name "${name}" 
        has properties "procedureName" and "procedureArgs" with 
        string values in file custom-commands.json`
      );
      process.exitCode = 1;
      return false;     
    }
  }

  let isValid = true;
  if (!isProcedure) { 
    const args = sql.match(RE_GLOBAL) || [];

    isValid = args.length === args.filter(arg => { 
      let argString = arg.match(RE)[1];
      return argString
        && argString.split(' ').length === 1
        && !RE_SPECIAL.test(argString);
    }).length;
  }

  if (!isValid) { 
    colog.error(
      `Command configuration invalid.  Make 
      sure that command with name "${name}" has
      sql string arguments with the form "{:arg}"
      where arg is nonempty and contains no
      special characters or white space`
    );
    process.exitCode = 1;   
  }

  return isValid;
}

/**
 * Validate connection configuration settings in 
 * sqade-settings.json file
 *
 * @param {Map} connections A map data structure
 *    containing each connection configuration entry.
 *    Entries are object properties and values with form:
 *      <connection_name>: {
 *        <setting_name>: <setting_value>
 *        ...
 *      }
 *    This function assumes the settings file does not have 
 *    a connections property if this parameter is falsy
 * @return boolean validation is succeful.
 * 		On validation failure, the process exits gracefully and we return false,
 * 		after an error message is printed to the user.
 */
exports.validateConnectionsConfig = (connections) => { 
  if (!connections) { 
    colog.error(
      `There is no connections property in your
      sqade-settings.json file.  This property must
      be set with your connection configurations`
		);
		process.exitCode = 1;
    return false;
  }

	const entries = connections.entries();
	let entry = entries.next();
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

		entry = entries.next();
	}

	return true;
}
