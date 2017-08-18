const colog = require('../lib/colog-noindent');
const SQLService = require('../lib/sql-service');
const {
  parseSettingsFile, 
  insertSQLArgs, 
  parseArgNames
} = require('../lib/config-parser');
const {validateCommand} = require('../lib/config-validator');

const SETTINGS_FILE_NAME = 'commands/custom-commands.json';

// commands to be exported
const commands = {};
/**
 * command descriptions for display.  
 * it is possible to inspect the commander application commands
 * inside the commands object, but only if the command has 
 * already been registered.  Instead we will explicitly define
 * the description when we register the command.
 */
const commandDescriptions = {};

/**
 * Return a function to be used for the command.  
 * Parse arguments and description from the command settings
 * and set up the commander object.
 *
 * @param {String} name The command name.
 * @param {Object} commandConfig Configuration for the command.
 *    Includes properties: `sql`, `description`
 * @return {Function} A function to be called when configuring 
 *    commander with the new command.
 */
const registerCommand = (name, commandConfig) => { 
  const {sql, description} = commandConfig;
  commandDescriptions[name] = description;
  // parse out arguments for the command from the sql string
  const args = parseArgNames(sql);
  const argsCommander = args.reduce((car, arg) => { 
    return `${car}<${arg}> `;
  }, '');
  return function(app, connection) { 
    app
      .command(`${name} ${argsCommander}`)
      .description(description)
      .action(async (...params) => { 
        const service = new SQLService(connection);
        const queryStr = insertSQLArgs(args, sql);
        const result = await service.query(queryStr);
        if (!result) { 
          colog.error(`Error.  Message from database server: 
              ${service.error}`);
          process.exitCode = 1;
        } else { 
          colog.success(result);
        }
      });
  };
};

const config = parseSettingsFile(SETTINGS_FILE_NAME);
const commandEntries = config && Object.entries(config);
/**
 * Validate the command entries in the settings file.
 * Upon validation failure the process will exit gracefully
 * and no commands will be set on this module.
 */
const isValid = commandEntries && commandEntries.reduce((carry, entry) => { 
  return carry && validateCommand(entry[0], entry[1]);
}, true);

if (isValid) { 
  commandEntries.forEach(entry => { 
    commands[entry[0]] = registerCommand(entry[0], entry[1]);
  });
}

module.exports = { 
  isValid,
  commands, 
  commandDescriptions,
  SETTINGS_FILE_NAME
};
