import winston from 'winston';

export function createLogger() {
  return winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.File({ filename: 'logs/bff-log.log', level: 'info' }),
      new winston.transports.File({ filename: 'logs/bff-errors.log', level: 'error' }),
      new winston.transports.Console({ level: 'info' })
    ]
  });
} 