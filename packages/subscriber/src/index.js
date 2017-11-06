const request = require('request');
const kefir = require('kefir');
const parseMessage = require('./parseMessage');
const getChunks = require('./getChunks');

const subscribe = (url, headers = {}) => {
  const stream = request(url, { headers });
  const raw$ = kefir.stream(emitter => {
    const emitString = data => {
      emitter.emit(String(data));
    };

    const errorString = data => {
      emitter.error(String(data));
    };

    const end = () => {
      emitter.end();
    };

    stream.on('data', emitString);
    stream.on('error', errorString);
    stream.on('end', end);

    return () => {
      stream.removeListener('data', emitString);
      stream.removeListener('error', errorString);
      stream.removeListener('end', end);
      stream.end();
    };
  });

  const events$ = raw$.thru(getChunks).flatten(obj => {
    return obj.data ? JSON.parse(obj.data) : [];
  });

  return {
    raw$,
    events$,
    abort: () => stream.abort(),
  };
};

module.exports = subscribe;
