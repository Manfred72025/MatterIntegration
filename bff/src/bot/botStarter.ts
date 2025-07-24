import { MattermostBot } from './mattermostBot';
import { logger } from '../loggers';

export function startBot() {
  try {
    const bot = new MattermostBot();
    bot.start();
  } catch (error) {
    logger.error({
      message: 'Ошибка запуска MattermostBot',
      error,
      timestamp: new Date().toISOString(),
    });
  }
}
