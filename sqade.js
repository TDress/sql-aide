#!/usr/bin/env node 
'use strict';

const colog = require('./lib/colog-noindent');
const app = require('commander');

const core = require('./commands/core');
/**
 * Loading the connection and custom modules parses the 
 * settings files and implicitly validates settings and configuration.
 * `isValid` properties store the result of the validations.
 */
const connection = require('./connection');
const custom = require('./commands/custom');
/**
 * Commander normally handles parsing of argv, 
 * but we want to configure the commander object at runtime..
 */
const commandName = process.argv[2];

if (connection.isValid && custom.isValid) {
	if (!commandName) { 
		// TO DO: show description and list of commands
	} else if (core.commands.hasOwnProperty(commandName)) { 
		core.commands[commandName](app, connection);
	} else if (custom.commands.hasOwnProperty(commandName)) { 
		custom.commands[commandName](app, connection);
	} else { 
		colog.error(`${commandName} is not a valid command name`);
	}

	app.parse(process.argv);
}
