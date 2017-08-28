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
 * Return a function to be used for the command, piping any 
 * arguments which we need to retrieve from the results of other commands.  
 * NOTE: currently only stored procedure commands are supported for piping
 *
 * Parse arguments and description from the command settings
 * and set up the commander object.
 *
 * @param {String} name The command name.
 * @param {Object} commandConfig Configuration for the command.
 * @return {Function} A function to be called when configuring 
 *    commander with the new command.
 */
const registerCommandPiped = (name, commandConfig) => { 
  const {
    description,
    isProcedure,
    procedureName,
    commandArgs,
    procedureArgs,
    argPipeMap
  } = commandConfig;
  // Add command description for display.
  commandDescriptions[name] = description;

  const argsCommander = commandArgs.reduce((car, arg) => { 
    return `${car}<${arg}> `;
  }, '');

  return function(app, connection) { 
    app
      .command(`${name} ${argsCommander}`)
      .description(description)
      .action(async (...params) => { 
        let result;
        const service = new SQLService(connection);
        let commandInputs = {}, procedureInputs = {};
        // Get command argument names and values.  
        for(let i = 0; i < commandArgs.length; i++) { 
          commandInputs[commandArgs[i]] = params[i];
        }
        // Fill in any procedure arguments that are also command arguments.
        commandArgs.forEach(name => { 
          if (procedureArgs.indexOf(name) >= 0) { 
            procedureInputs[name] = commandInputs[name];
          }
        });

        /**
         * Get remaining procedure inputs by executing commands that will 
         * retrieve vaules we need to pipe into those inputs.
         */
        for(let obj of argPipeMap) { 
          let result;
          let pipeInputs = obj.pipeFromParams.reduce((car, name) => { 
            car[name] = commandInputs[name];
            return car;
          }, {});
          colog.question(`Procedure: ${obj.pipeFromProcedureName}`);
          colog.question(`Params: ${JSON.stringify(pipeInputs)}`);
          result = await service.storedProcQuery(
            obj.pipeFromProcedureName, 
            pipeInputs
          );
          colog.answer(result);

          // extract the field from the record or record set
          let fieldValue = obj.isResultSet
            ? result.recordset[0][obj.resultField] 
            : result.record[obj.resultField];
          procedureInputs[obj.pipeToArg] = fieldValue;
        }

        // Here we execute our final target procedure after all inputs are prepared.
        colog.question(
          `Procedure: ${procedureName}   Params: ${JSON.stringify(procedureInputs)}`);
        result = await service.storedProcQuery(procedureName, procedureInputs);

        if (!result) { 
          colog.error(`Error.  Message from database server: 
              ${service.error}`);
          process.exitCode = 1;
        } else { 
          colog.success(result);
          return result;
        }
      });
  };
};

/**
 * Return a function to be used for the command.  
 * Parse arguments and description from the command settings
 * and set up the commander object.
 *
 * @param {String} name The command name.
 * @param {Object} commandConfig Configuration for the command.
 * @return {Function} A function to be called when configuring 
 *    commander with the new command.
 */
const registerCommand = (name, commandConfig) => { 
  const {
    sql, 
    description,
    isProcedure,
    procedureName,
    procedureArgs
  } = commandConfig;
  // Add command description for display.
  commandDescriptions[name] = description;

  // argument names
  let args = [];
  if (!sql || isProcedure) { 
    args = procedureArgs || commandArgs;
  } else { 
    // parse out arguments for the command from the sql string
    args = parseArgNames(sql);
  }
  const argsCommander = args.reduce((car, arg) => { 
    return `${car}<${arg}> `;
  }, '');

  return function(app, connection) { 
    app
      .command(`${name} ${argsCommander}`)
      .description(description)
      .action(async (...params) => { 
        let result;
        const service = new SQLService(connection);
        if (!sql || isProcedure) { 
          let inputs = {};
          for(let i = 0; i < params.length; i++) { 
            inputs[args[i]] = params[i];
          }
          result = await service.storedProcQuery(procedureName, inputs);
        } else { 
          const queryStr = insertSQLArgs(params, sql);
          result = await service.query(queryStr);
        }
        if (!result) { 
          colog.error(`Error.  Message from database server: 
              ${service.error}`);
          process.exitCode = 1;
        } else { 
          colog.success(result);
          return result;
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
    if (entry[1].argPipeMap && entry[1].argPipeMap.length > 0) { 
      commands[entry[0]] = registerCommandPiped(entry[0], entry[1]);
    } else { 
      commands[entry[0]] = registerCommand(entry[0], entry[1]);
    }
  });
}

module.exports = { 
  isValid,
  commands, 
  commandDescriptions,
  SETTINGS_FILE_NAME
};
