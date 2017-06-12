#!/usr/bin/env node
/* @flow */
import factory from '..';
import parseInput from './parseInput';
import pkg from '../../package.json';
import { parse } from 'redis-url'

const input = parseInput();

console.log('initializing server');
const server = factory({
  namespc: input.name,
  redis: parse(input.redis),
  history: { size: 10 },
  burst: {
    time: input.burstTime || 500,
    count: input.burstCount || 20,
  },
  debug: input.debug,
});

console.log('starting event store on port', input.port);
console.log('instance namespace: %s', input.name);
server.listen(input.port);

console.log('server started');
