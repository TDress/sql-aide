# sql-aide
CLI application for scripting repetitive SQL tasks specific to your needs.  

# Example
The steps below configure a db connection named 'd3vh5' and a command named 'psv-methods'

### 1. Set up your connections ([see connection.js for documentation](https://github.com/TDress/sql-aide/blob/master/connection.js)):

```json
{
  "connections": {
      "d3vh5": {
        "type": "mysql",
        "host": "mydbserver.example.com",
        "port": 1433,
        "database": "somedb",
        "login": "someuser",
        "password": "somepassword"
      }
  },
  "activeDb": "d3vh5"
}
```

### 2. Set up your command.  [See test fixtures for basic examples](https://github.com/TDress/sql-aide/blob/master/test/fixtures/custom-commands.js).  Here we demonstrate piping the output of one query into the input of a subsequent query.  We also use an option 'isProcedure' to use a stored procedure:
```json
{
  "psv-methods": {
    "isProcedure": true,
    "procedureName": "my_stored_procedure_name",
    "commandArgs": [
      "partner_name"
    ],
    "procedureArgs": [
      "partner_key"
    ],
    "argPipeMap": [
      {
        "pipeToArg": "partner_key",
        "pipeFromParams": [
          "partner_name"
        ],
        "pipeFromProcedureName": "my_proc_to_pipe_output_from",
        "isResultSet": true,
        "resultField": "partner_key"
      }
    ],
    "description": "Select available service methods by partner name"
  }
}
```

### 3. Get started at the command line by checking your database configuration and the arguments to your command:
![Image](test/exampleimg/meta.png?raw=true)

### 4. Run your command with input:
```console
@#$%*~/Documents/sql-aide 1115$ sqade psv-methods some-partner-name
```
Two stored procedures are run: ```my_proc_to_pipe_output_from``` with the CLI input, and ```my_stored_procedure_name``` afterwards using the "partner_key" in the output from the first procedure result.  Standard output at the command line is the final result set.
