import winston from 'winston';

export function createLogger(logFilePath: string) {
  return winston.createLogger({
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.File({ filename: logFilePath })
    ]
  });
} 