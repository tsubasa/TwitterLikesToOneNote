/* eslint-disable @typescript-eslint/no-explicit-any */

import util from 'util';
import path from 'path';
import * as winston from 'winston';
import 'dotenv/config';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const isPrimitive = (val: unknown) => {
  return val === null || (typeof val !== 'object' && typeof val !== 'function');
};

const formatWithInspect = (val: unknown) => {
  const prefix = isPrimitive(val) ? '' : '\n';
  const shouldFormat = typeof val !== 'string';
  return prefix + (shouldFormat ? util.inspect(val, { depth: null, colors: true }) : val);
};

export default class Logger {
  private logger: winston.Logger;

  private level: string;

  constructor(name: string, level?: LogLevel) {
    this.level = this.safeLogLevelParser(String(level ?? process.env.LOG_LEVEL ?? 'warn'));
    this.logger = winston.createLogger({
      transports: [
        new winston.transports.Console({
          level: 'debug',
          handleExceptions: true,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.colorize(),
            winston.format.printf((info) => {
              const message = formatWithInspect(info.message);
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              const splatArgs = info[Symbol.for('splat')] || [];
              const rest = splatArgs.map((data: unknown) => formatWithInspect(data)).join(' ');
              return `[${info.timestamp}] [${info.level}] ${message} ${rest}`;
            }),
          ),
        }),
        new winston.transports.File({
          level: this.level,
          handleExceptions: true,
          dirname: path.resolve(__dirname, '../../../logs'),
          filename: `${name}.log`,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.splat(),
            winston.format.json(),
          ),
        }),
      ],
    });
  }

  public log(message: any, ...optionalParams: any[]) {
    this.logger.log(this.level, message, ...optionalParams);
  }

  public error(message: any, ...optionalParams: any[]) {
    if (message instanceof Error) this.logger.error('[exception]', ...[message].concat(optionalParams));
    else this.logger.error(message, ...optionalParams);
  }

  public warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(message, ...optionalParams);
  }

  public info(message: any, ...optionalParams: any[]) {
    this.logger.info(message, ...optionalParams);
  }

  public debug(message: any, ...optionalParams: any[]) {
    this.logger.debug(message, ...optionalParams);
  }

  // eslint-disable-next-line class-methods-use-this
  private safeLogLevelParser(level: string) {
    switch (level.toLowerCase()) {
      case 'error':
        return 'error';
      case 'warn':
      case 'warning':
        return 'warn';
      case 'info':
        return 'info';
      case 'debug':
        return 'debug';
      default:
        throw new Error(`Unsupported logging level: ${level}`);
    }
  }
}
