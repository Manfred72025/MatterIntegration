import { Router, Request, Response } from 'express';
import mmClient from '../mattermostClient';
import axios from 'axios';
import { config } from '../config';
import { logger } from '../loggers';

const router = Router();

// Получить список обсуждений (каналов типа discussion)
router.get('/', async (req: Request, res: Response) => {
  try {
    const teamsResult = await mmClient.getTeams();
    let team_id = '';
    if (Array.isArray(teamsResult) && teamsResult.length > 0) {
      team_id = teamsResult[0].id;
    } else if (typeof teamsResult === 'object' && teamsResult !== null && 'teams' in teamsResult && Array.isArray((teamsResult as any).teams) && (teamsResult as any).teams.length > 0) {
      team_id = (teamsResult as any).teams[0].id;
    } else {
      res.status(404).json({ error: 'Нет доступных команд (team)' });
      return;
    }
    const channels = await mmClient.getMyChannels(team_id);
    const discussions = channels.filter((c: any) => c.type === 'O' || c.type === 'P');
    res.json(discussions);
  } catch (error: any) {
    logger.error({ message: error.message, stack: error.stack, data: error.response?.data, requestBody: req.body });
    res.status(500).json({ error: error.message });
  }
});

// Получить сообщения в обсуждении (канале)
router.get('/:channel_id/posts', async (req: Request, res: Response) => {
  try {
    const channelId = req.params.channel_id;
    const MATTERMOST_URL = config.MATTERMOST_URL;
    const BOT_TOKEN = config.BOT_TOKEN;
    const response = await axios.get(
      `${MATTERMOST_URL}/api/v4/channels/${channelId}/posts`,
      { headers: { 'Authorization': `Bearer ${BOT_TOKEN}` } }
    );
    res.json(response.data);
  } catch (error: any) {
    logger.error({ message: error.message, stack: error.stack, data: error.response?.data, requestBody: req.body });
    res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
  }
});

export default router; 