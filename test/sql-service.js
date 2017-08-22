const proxyquire = require('proxyquire').noPreserveCache();
const {SETTINGS_VALID} = require('./fixtures/config-validator');

const connectionSettings = JSON.parse(SETTINGS_VALID);
// stub for connection module
const connection = { 
  configMap: new Map(
    Object.entries(connectionSettings.connections)
  ),
  isValid: true, 
  active: connectionSettings.activeDb,
  activeDBResourceString: connectionSettings.activeDBResourceString
}
// stub for mssql library
let mssqlStub = {
  connectCount: 0,
  queryCount: 0,
  connect: function(resource) { 
    this.connectCount++;
    return this.connectCount;
  },
  query: function(sql) { 
    this.queryCount++;
    this.connectCount++;
    return this.queryCount;
  }
};
const SQLService = proxyquire('../lib/sql-service', { 
  'mssql': mssqlStub
});

module.exports = { 
  testConstructorSetsProperties: function(test) { 
    test.expect(1);
    const service = new SQLService(connection);
    test.deepEqual( 
      service.connection,
      connection.configMap.get(connection.active),
      'The service has the correct connection config set.'
    );
    test.done();
  },
  testConstructorThrowsException: function(test) { 
    test.expect(2);
    let badConnection = Object.assign( 
      {}, 
      connection, 
      {isValid: false}
    );
    let codeBlock = () => { 
      let service = new SQLService(badConnection);
    }
    test.throws( 
      codeBlock, 
      Error,
      `Exception is thrown if the service class is 
      not given a valid connection.`
    );

    badConnection = Object.assign(
      {},
      connection, 
      {active: null}
    );
    test.throws( 
      codeBlock, 
      Error,
      `Exception is thrown if the service is not
      given a valid activeDB.`
    );
    test.done();
  },
  testDbResourceString: function(test) { 
    test.expect(1);
    const service = new SQLService(connection);
    test.strictEqual( 
      service.dbResource(), 
      connection.activeDBResourceString,
      'DB resource matches properties on connection'
    );
    test.done();
  },
  testQuerySent: async function(test) { 
    test.expect(2);
    const service = new SQLService(connection);
    const queryCount = await service.query('test');

    test.ok( 
      mssqlStub.connectCount,
      'connect method was called.'
    );
    test.ok( 
      mssqlStub.queryCount,
      'query method was called.'
    );
    test.done();
  }
}
