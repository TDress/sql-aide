#!/usr/bin/env node 
'use strict';

const colog = require('colog');
const app = require('commander');

/**
 * Import the connection module.
 * This import implicitly validates the connection 
 * configuration and throws an exception if there is
 * an error.
 */
const connection = require('./connection');
const {core} = require('./commands/core');
// TO DO: custom object should have its own method of
// selecting a command name from configuration and returning a function
// to register the command.  this will also have to validate 
// the custom configuration.  
const custom = {};
const commandName = process.argv[2];
if (!commandName) { 
	// TO DO: show description and list of commands
} else if (core.hasOwnProperty(commandName)) { 
	core[commandName](app, connection);
} else if (custom.hasOwnProperty(commandName)) { 
	custom[commandName](app, connection);
} else { 
	colog.error(`${commandName} is not a valid command name`);
}

app.parse(process.argv);
