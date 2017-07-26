/**
 * testing fixtures for custom commands.
 */
const COMMAND_MISSING_NAME = 
  `{ 
    "sql": "select example from examples where example_id={:example_id}",
    "description": "Example description"
  }`;

const COMMAND_MISSING_SQL = 
  `{ 
    "example-command-name": {
      "description": "Example description"
    }
  }`;

const COMMAND_ONE_ARGUMENT = 
   `{ 
    "example-command-name": {
      "sql": "select example from examples where example_id={:example_id}",
      "description": "Example description"
    }
  }`;

const COMMAND_TWO_ARGUMENTS = 
   `{ 
    "example-command-name": {
      "sql": "select {:arg1} from examples where example_id={:arg2}",
      "description": "Example description"
    }
  }`;

const COMMAND_THREE_ARGUMENTS = 
   `{ 
    "example-command-name": {
      "sql": "select {:arg1} from {:arg2} where example_id={:arg3}",
      "description": "Example description"
    }
  }`;

const COMMAND_MULTIPLE = 
   `{ 
    "example-command-name": {
      "sql": "select example from examples where example_id={:example_id}",
      "description": "Example description"
    },
    "example-command-name2": {
      "sql": "select example from examples where example_id={:example_id2}",
      "description": "Example description 2"
    },
    "example-command-name3": {
      "sql": "select example from examples where example_id={:example_id3}",
      "description": "Example description 3"
    }
  }`;

module.exports = { 
  COMMAND_MISSING_NAME,
  COMMAND_MISSING_SQL,
  COMMAND_ONE_ARGUMENT,
  COMMAND_TWO_ARGUMENTS,
  COMMAND_THREE_ARGUMENTS,
  COMMAND_MULTIPLE
};
