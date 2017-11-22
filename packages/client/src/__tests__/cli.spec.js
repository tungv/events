const mockServer = require('../__mocks__/mockServer');
const execa = require('execa');
const path = require('path');
const fs = require('fs');
const { MongoClient } = require('mongodb');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

describe('cli', () => {
  it('should work', async () => {
    const server = await mockServer(7, [
      {
        id: 1,
        type: 'DEPARTMENT_CREATED',
        payload: {
          id: 'c95803b4-b29c-40a9-923e-fc2225e001f8',
          name: 'marketing',
        },
        meta: {
          client: 'test-commiter-1',
          clientVersion: '1.0.0',
          occurredAt: 1505728418175,
        },
      },
      {
        id: 2,
        type: 'USER_REGISTERED',
        payload: {
          uid: '9d5901c0-4228-4832-adb2-41cb3a8797cd',
          email: 'abc@events.com',
          name: 'ABC',
          age: 21,
          department_id: 'c95803b4-b29c-40a9-923e-fc2225e001f8',
        },
        meta: {
          client: 'test-commiter-1',
          clientVersion: '1.0.0',
          occurredAt: 1505728418175,
        },
      },
      {
        id: 3,
        type: 'USER_REGISTERED',
        payload: {
          uid: '6d90bd42-62ef-4d3c-91aa-6f517fdcc8da',
          email: 'def@events.com',
          name: 'DEF',
          age: 23,
          department_id: 'c95803b4-b29c-40a9-923e-fc2225e001f8',
        },
        meta: {
          client: 'test-commiter-1',
          clientVersion: '1.0.0',
          occurredAt: 1505728521586,
        },
      },
      {
        id: 4,
        type: 'DEPARTMENT_CREATED',
        payload: {
          id: 'f7a094c4-dd60-40c1-bcfd-1650b5a57cc8',
          name: 'IT',
        },
        meta: {
          client: 'test-commiter-1',
          clientVersion: '1.0.0',
          occurredAt: 1505728418175,
        },
      },
      {
        id: 5,
        type: 'USER_EMAIL_UPDATED',
        payload: {
          uid: '9d5901c0-4228-4832-adb2-41cb3a8797cd',
          email: 'newemail@events.com',
        },
        meta: {
          client: 'test-commiter-1',
          clientVersion: '1.0.0',
          occurredAt: 1505728523586,
        },
      },
      {
        id: 6,
        type: 'USER_REGISTERED',
        payload: {
          uid: '3822c08a-2967-40bb-8c99-d3c76b569561',
          email: 'ghi@events.com',
          name: 'GHI',
          age: 27,
          department_id: 'f7a094c4-dd60-40c1-bcfd-1650b5a57cc8',
        },
        meta: {
          client: 'test-commiter-1',
          clientVersion: '1.0.0',
          occurredAt: 1505728528648,
        },
      },

      {
        id: 7,
        type: 'USER_EMAIL_UPDATED',
        payload: {
          uid: '9d5901c0-4228-4832-adb2-41cb3a8797cd',
          email: 'updated',
        },
      },
      {
        id: 8,
        type: 'USER_EMAIL_UPDATED',
        payload: {
          uid: '9d5901c0-4228-4832-adb2-41cb3a8797cd',
          email: 'failing',
        },
      },
      {
        id: 9,
        type: 'USER_EMAIL_UPDATED',
        payload: {
          uid: '9d5901c0-4228-4832-adb2-41cb3a8797cd',
          email: 'updated',
        },
      },
    ]);

    const { url } = server;

    const config = `
module.exports = {
  subscribe: {
    serverUrl: '${url}',
  },
  persist: {
    store: 'mongodb://localhost/client_test',
  },
  transform: {
    rulePath: '${path.resolve('./fixtures/rules/user_management.js')}',
  },
  sideEffects: {
    sideEffectsPath: '${path.resolve(
      './fixtures/sideEffects/sampleEffects.js'
    )}',
  },
  monitor: {
    port: 43333,
  },
};`;

    const configPath = '/tmp/sample.config.js';
    fs.writeFileSync(configPath, config);
    const db = await MongoClient.connect('mongodb://localhost/client_test');

    await db.dropDatabase({});

    const child = execa('node', ['src/cli.js', '-c', configPath]);

    child.stdout.once('data', async () => {
      await delay(require('is-ci') ? 3000 : 1500);
      child.kill('SIGINT');
      server.close();
    });

    const result = await child;
    console.log(result.stdout);

    if (result.stderr) {
      console.error(result.stderr);
    }
    const log = result.stdout
      .split('\n')
      .map(line => line.slice(' INF  2017-10-15T17:06:19.215+07:00: '.length))
      .join('\n');
  });
});
