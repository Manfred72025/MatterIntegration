import { Router, Request, Response } from 'express';
import axios from 'axios';
import mmClient from '../mattermostClient';
import { config } from '../config';
import { logger } from '../loggers';

const router = Router();

const MATTERMOST_URL = config.MATTERMOST_URL;
const BOT_TOKEN = config.BOT_TOKEN;

// Получить список каналов первой команды
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
    const channels = await mmClient.getChannels(team_id);
    res.json(channels);
  } catch (error: any) {
    logger.error({ message: error.message, stack: error.stack, data: error.response?.data, requestBody: req.body });
    res.status(500).json({ error: error.message });
  }
});

// Создать канал (обсуждение)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { team_id, name, display_name, type, purpose, header, user_ids } = req.body;
    if (!team_id || !name || !display_name || !type) {
      res.status(400).json({ error: 'team_id, name, display_name, type — обязательные поля' });
      return;
    }
    const channelPayload: any = { team_id, name, display_name, type };
    if (purpose) channelPayload.purpose = purpose;
    if (header) channelPayload.header = header;
    const channel = await mmClient.createChannel(channelPayload);
    if (Array.isArray(user_ids) && user_ids.length > 0) {
      const addResults = [];
      for (const user_id of user_ids) {
        try {
          await axios.post(
            `${MATTERMOST_URL}/api/v4/channels/${channel.id}/members`,
            { user_id },
            { headers: { 'Authorization': `Bearer ${BOT_TOKEN}` } }
          );
          addResults.push({ user_id, status: 'added' });
        } catch (err: any) {
          addResults.push({ user_id, status: 'error', error: err?.response?.data || err?.message });
        }
      }
      res.status(201).json({ channel, members: addResults });
      return;
    }
    res.status(201).json(channel);
  } catch (error: any) {
    logger.error({ message: error.message, stack: error.stack, data: error.response?.data, requestBody: req.body });
    res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
  }
});

// Добавить пользователя в канал
router.post('/:channel_id/members', async (req: Request, res: Response) => {
  try {
    const response = await axios.post(
      `${MATTERMOST_URL}/api/v4/channels/${req.params.channel_id}/members`,
      req.body,
      { headers: { 'Authorization': `Bearer ${BOT_TOKEN}` } }
    );
    res.status(201).json(response.data);
  } catch (error: any) {
    logger.error({ message: error.message, stack: error.stack, data: error.response?.data, requestBody: req.body });
    res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
  }
});

// Получить участников канала
router.get('/:channel_id/members', async (req: Request, res: Response) => {
  try {
    const channelId = req.params.channel_id;
    const members = await mmClient.getChannelMembers(channelId);
    res.json(members);
  } catch (error: any) {
    logger.error({ message: error.message, stack: error.stack, data: error.response?.data, requestBody: req.body });
    res.status(500).json({ error: error.message });
  }
});

// Создать обсуждение (thread) в канале по display_name
router.post('/:channel_name/thread', async (req: Request, res: Response) => {
  const { channel_name } = req.params;
  const { message } = req.body;
  if (!message) {
    res.status(400).json({ error: 'Необходимо указать message' });
    return;
  }
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
    const channels = await mmClient.getChannels(team_id);
    const channel = channels.find((c: any) => c.display_name === channel_name);
    if (!channel) {
      res.status(404).json({ error: `Канал с display_name='${channel_name}' не найден` });
      return;
    }
    const post = await mmClient.createPost({
      channel_id: channel.id,
      message,
    });
    res.status(201).json(post);
  } catch (error: any) {
    logger.error({ message: error.message, stack: error.stack, data: error.response?.data, requestBody: req.body });
    res.status(500).json({ error: error.message });
  }
});

// Удалить канал (обсуждение)
router.delete('/:channel_id', async (req: Request, res: Response) => {
  try {
    const response = await axios.delete(
      `${MATTERMOST_URL}/api/v4/channels/${req.params.channel_id}`,
      { headers: { 'Authorization': `Bearer ${BOT_TOKEN}` } }
    );
    res.status(200).json({ success: true });
  } catch (error: any) {
    logger.error({ message: error.message, stack: error.stack, data: error.response?.data, requestBody: req.body });
    res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
  }
});

export default router; 