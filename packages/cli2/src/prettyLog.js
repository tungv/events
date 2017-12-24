import chalk from 'chalk';
import format from 'date-fns/format';

const PREFIXES = {
  10: chalk.bgWhite.black.bold.dim(' SLY '),
  5: chalk.bgWhite.black.bold(' DBG '),
  3: chalk.bgGreen.bold(' INF '),
  2: chalk.bgYellow.black.bold(' WAR '),
  1: chalk.bgRed.bold(' ERR '),
  0: chalk.bgMagenta.bold(' FTL '),
};

const INVERSED_LOG_LEVELS = {
  10: 'SILLY',
  5: 'DEBUG',
  3: 'INFO',
  2: 'WARNING',
  1: 'ERROR',
  0: 'FATAL',
};

const formatMsg = (type, { payload }) => {
  switch (type) {
    case 'init-logger':
      return `log level: ${chalk.bold(INVERSED_LOG_LEVELS[payload.level])}`;
    case 'command-begin':
      return `command = ${payload.cmd}`;

    case 'config-ready':
      return `config:
  name:    ${chalk.italic(payload.name)}
  port:    ${chalk.italic(payload.port)}
  redis:   ${chalk.italic(payload.redis)}
  workers: ${chalk.italic(payload.workers)}
`;

    case 'begin-shutdown':
      return `shutting down...`;

    case 'complete-shutdown':
      return `bye!`;

    default:
      return `${type} ${JSON.stringify(payload)}`;
  }
};

export default msg =>
  `${PREFIXES[msg._l]} ${chalk.dim(format(msg._t))} ${formatMsg(
    msg.type,
    msg
  )}`;
