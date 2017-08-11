/**
 * Format command descriptions in a string.
 *
 * @param {Object} commandDescriptions Object of command names
 *    and their descriptions.
 * @return {String} Formatted string of descriptions for display.  
 */
exports.getCommandDescriptions = (commandDescriptions) => { 
  const names = Object.keys(commandDescriptions);
  const getSpaces = count => { 
    let spaces = '';
    for(let i = 0; i < count; i++) { 
      spaces += ' ';
    }
    return spaces;
  };

  const longestNameLength = names.reduce((car, name) => { 
    if (name.length > car) { 
      return name.length;
    }

    return car;
  }, 0);

  return names.reduce((car, name) => { 
    const padding = getSpaces(5 + (longestNameLength - name.length));
    return `${car}${name}${padding}${commandDescriptions[name]}\n`;
  }, '');
}

