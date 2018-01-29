import MongoHeartbeat from 'mongo-heartbeat';
import { MongoClient } from 'mongodb';

const cache = {};

export default async url => {
  try {
    if (cache[url]) {
      return cache[url];
    }

    const db = await MongoClient.connect(url);
    const hb = MongoHeartbeat(db, {
      interval: 5 * 60 * 1000,
      timeout: 30000,
      tolerance: 3,
    });

    hb.on('error', err => {
      console.error('mongodb didnt respond the heartbeat message');
      process.nextTick(function() {
        process.exit(1);
      });
    });

    cache[url] = db;

    return db;
  } catch (ex) {
    console.error(ex);
    process.exit(1);
  }
};
