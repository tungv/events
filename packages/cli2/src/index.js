#!/usr/bin/env node

import prettyMs from 'pretty-ms';
import sade from 'sade';

import { version } from '../package.json';
import listCmd from './listCmd';
import startCmd from './startCmd';
import stopCmd from './stopCmd';

const prog = sade('heq');

prog
  .version(version)
  .option('--json', 'output logs in JSON format', false)
  .option(
    '--verbose, -x',
    'level of log, from 0 (no log) to 10 (log everything)',
    3
  );

prog
  .command('start')
  .describe('start a new heq server')
  .option('-c, --config', 'Provide path to custom config', 'heq.config.js')
  .option(
    '--name',
    'assign a name for this server. This will override `name` in config file'
  )
  .option(
    '--port',
    'http servers will listen on this port. This will override `port` in config file'
  )
  .option(
    '--redis',
    'specify the backend redis or redis cluster connection string. This will override `redis` in config file'
  )
  .option(
    '--workers',
    'specify the number of http processes to start. This will override `workers` in config file'
  )
  .option(
    '-f, --overwrite',
    'if set, command line options will persist to the config file',
    false
  )
  .option('-D, --daemon', 'Run heq server in background', false)
  .example('start -c custom.js')
  .example('start -c custom.js --daemon')
  .action(startCmd);

prog
  .command('stop [server-name]')
  .option('-c, --config', 'Provide path to custom config', 'heq.config.js')
  .describe(
    'stop a heq server. If server-name is omitted, stop command will resolve config file to get the name.'
  )
  .example('stop local-server')
  .example('stop -c config.js')
  .action(stopCmd);

prog
  .command('ls')
  .describe('list all running heq servers')
  .action(listCmd);

prog
  .command('list')
  .describe('list all running heq servers')
  .action(listCmd);

start();

async function start() {
  const startAt = Date.now();
  try {
    await prog.parse(process.argv);
    console.log('✨ done in', prettyMs(Date.now() - startAt));
  } catch (err) {
    console.error(err);
  }
}
