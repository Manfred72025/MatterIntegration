import { Router, Request, Response } from 'express';
import mmClient from '../mattermostClient';
import { logger } from '../loggers';

const router = Router();

// Получить список команд (teams)
router.get('/', async (req: Request, res: Response) => {
  try {
    const teams = await mmClient.getTeams();
    res.json(teams);
  } catch (error: any) {
    logger.error({ message: error.message, stack: error.stack, data: error.response?.data, requestBody: req.body });
    res.status(500).json({ error: error.message });
  }
});

export default router; 