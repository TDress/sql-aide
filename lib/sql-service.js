const mssql = require('mssql');
/**
 * Class for SQL service objects.
 */
module.exports = class SQLService { 
  /**
   * Parse the connection configuration parameters to 
   * use when connecting with the database resource.
   *
   * Throws Exception if the connection settings look
   * bad (connection should already be validated).
   * The connection module must have a valid active
   * property and a configuration Map of connections.
   *
   * @param {Object} connection Connection module object.
   * @return void Set the class `connection` and `active` 
   *    properties. The `connection` is a flat object with host,
   *    username, password, etc.  `active` is the key string
   *    for the DB currently being used.  
   */
  constructor(connection) { 
    const config = connection && connection.configMap;
    if (!config || !connection.isValid) { 
      throw Error(
        `Your connection settings appear to be invalid.
        Please check sqade-settings.json`
      );
    } 

    const active = config.has(connection.active) 
      ? connection.active : null;
    if (!active) { 
      throw Error(
        `No active connection set in connection settings.
        Make sure sqade-settings.json has property activeDB
        set to one of your defined connections.  `
      );
    }
    this.connection = config.get(active);
  }
  /**
   * Build the resource string to access the database.
   * Includes username, password, host, support, and DB name
   * @return {String} database resource
   */
  dbResource() { 
    const {
      login, 
      password, 
      host, 
      database,
      port
    } = this.connection;

    return `mssql://${login}:${password}@${host}:${port}/${database}`;
  }

  /**
   * Execute query against a database.
   *
   * @param {String} sql Query string.
   * @return {Object} result
   */
  async query(sql) { 
    const resource = this.dbResource();
    let result;

    try {
      const pool = await mssql.connect(resource);
      result = await mssql.query(sql);
    } catch (err) {
      this.error = err;
      return false;
    }

    return result;
  }

  /**
   * Execute stored procedure against a database.
   *
   * @param {String} name Stored procedure name.
   * @param {Object} args Argument names and values.
   * @return {Object} result
   */
  async storedProcQuery(name, args) { 
    const resource = this.dbResource();
    const argEntries = Object.entries(args);
    let result;

    try {
      const pool = await mssql.connect(resource);
      const request = pool.request();
      argEntries.forEach(arg => { 
        let key = arg[0];
        let value = arg[1];
        request.input(key, value);
      });

      result = await request.execute(name);
    } catch (err) {
      this.error = err;
      return false;
    }

    return result;
  }
};
