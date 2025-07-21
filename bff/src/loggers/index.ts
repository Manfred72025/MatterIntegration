import path from 'path';
import { rotateLogs } from './logRotate';
import { createLogger } from './logger';

// Ротация логов при запуске
rotateLogs(path.join(__dirname, '../../logs'), 'bff-errors.log', 'bff-errors-old.log');

export const logger = createLogger(path.join(__dirname, '../../logs/bff-errors.log'));
