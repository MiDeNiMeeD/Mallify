import winston from 'winston';

const logLevel = process.env.LOG_LEVEL || 'info';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    let msg = `${timestamp} [${service || 'app'}] ${level}: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

export const createLogger = (serviceName: string) => {
  return winston.createLogger({
    level: logLevel,
    defaultMeta: { service: serviceName },
    transports: [
      // Console transport
      new winston.transports.Console({
        format: consoleFormat,
      }),
      // File transport for errors
      new winston.transports.File({
        filename: `logs/${serviceName}-error.log`,
        level: 'error',
        format: logFormat,
      }),
      // File transport for all logs
      new winston.transports.File({
        filename: `logs/${serviceName}-combined.log`,
        format: logFormat,
      }),
    ],
  });
};

export const logger = createLogger('mallify');
