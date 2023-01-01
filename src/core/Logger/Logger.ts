/* eslint-disable @typescript-eslint/no-explicit-any */

import path from 'path';
import * as winston from 'winston';
import 'dotenv/config';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

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
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf((info) => {
              let stackTrace = '';
              if (typeof info.message?.stack === 'string') {
                stackTrace = `\n[${info.timestamp}] [exception] ${info.message?.stack}`;
              }
              return `[${info.timestamp}] [${info.level}] ${
                typeof info.message === 'object' ? JSON.stringify(info.message, null, 2) : info.message
              }${stackTrace}`;
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
    this.logger.log(this.level, this.safeMessageParser(message, optionalParams));
  }

  public error(message: any, ...optionalParams: any[]) {
    if (message instanceof Error) this.logger.error(message);
    else this.logger.error(this.safeMessageParser(message, optionalParams));
  }

  public warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(this.safeMessageParser(message, optionalParams));
  }

  public info(message: any, ...optionalParams: any[]) {
    this.logger.info(this.safeMessageParser(message, optionalParams));
  }

  public debug(message: any, ...optionalParams: any[]) {
    this.logger.debug(this.safeMessageParser(message, optionalParams));
  }

  // eslint-disable-next-line class-methods-use-this
  private safeMessageParser(message: any, optionalParams: any[]) {
    return [
      typeof message === 'object' ? JSON.stringify(message, null, 2) : message,
      ...optionalParams.map((v) => (typeof v === 'object' ? JSON.stringify(v, null, 2) : v)),
    ].join(' ');
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
