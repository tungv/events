/* @flow */
import { createClient } from './redis-client';

import type { CommitConfig } from '../types/Config.type';
import runLua from './runLua';

const query = `
local function getKeys(from, to, key)
  local newArray = {};
  for id=from,to do
    table.insert(newArray, redis.call('hget', key, id));
  end

  return newArray
end

local from = tonumber(ARGV[1]);
local to = tonumber(ARGV[2]) or redis.call('HLEN', KEYS[1]);

return getKeys(from, to, KEYS[1])
`;

export default (config: CommitConfig) => {
  const client = createClient(config.redis);

  return async (req: any) => {
    const lastEventId = req.headers['Last-Event-ID'] || req.query.lastEventId
    const events = await runLua(client, query, {
      keys: [`${config.namespc}::events`],
      argv: [lastEventId]
    });

    // we trust the input from commit. otherwise we have to do a try-parse
    return events.map(JSON.parse);
  }
}