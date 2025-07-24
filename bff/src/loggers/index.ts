import path from 'path';
import { rotateLogs } from './logRotate';
import { createLogger } from './logger';
import winston from 'winston';

// Ротация логов при запуске
rotateLogs(path.join(__dirname, '../../logs'), 'bff-errors.log', 'bff-errors-old.log');
rotateLogs(path.join(__dirname, '../../logs'), 'bff-log.log', 'bff-log-old.log');
rotateLogs(path.join(__dirname, '../../logs'), 'mattermost-messages.log', 'mattermost-messages-old.log');

export const logger = createLogger();
export const mattermostMessageLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(__dirname, '../../logs/mattermost-messages.log'), level: 'info' }),
    new winston.transports.Console({ level: 'info' })
  ]
});
