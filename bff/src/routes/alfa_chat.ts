import { Router, Request, Response } from 'express';
import mmClient from '../mattermostClient';
import { logger } from '../loggers';

const router = Router();


// POST /alfa_chat/api/v1/createTopic
router.post('/api/v1/createTopic', async (req: Request, res: Response) => {
  try {
    const { team_id, discussion_name, user_ids } = req.body;
    if (!team_id || !discussion_name || !Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({ error: 'team_id, discussion_name, user_ids обязательные поля' });
    }
    // Генерируем уникальное имя для канала (Mattermost требует уникальное name)
    const name = `alfa_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const display_name = discussion_name;
    const type = 'P'; // Приватный канал
    const channelPayload: any = { team_id, name, display_name, type };
    const channel = await mmClient.createChannel(channelPayload);

    
    // Добавляем пользователей
    const addResults = [];
    for (const user_id of user_ids) {
      try {
        mmClient.addToChannel(channel.id, user_id);        
        addResults.push({ user_id, status: 'added' });
      } catch (err: any) {
        addResults.push({ user_id, status: 'error', error: err?.response?.data || err?.message });
      }
    }
    res.status(201).json({ discussion_id: channel.id, members: addResults });
  } catch (error: any) {
    logger.error({ message: error.message, stack: error.stack, data: error.response?.data, requestBody: req.body });
    res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
  }
});

// Создать пользователя
router.post('/api/v1/createUser', async (req, res) => {
  try {
    const user = await mmClient.createUser(req.body, '', '', '');
    if (req.body.team_id && user && user.id) {
      await mmClient.addToTeam(req.body.team_id, user.id);
    }
    res.status(201).json(user);
  } catch (error: any) {
    logger.error({ message: error.message, stack: error.stack, data: error.response?.data, requestBody: req.body });
    res.status(500).json({ error: error.message });
  }
});

// Получить список команд (teams)
router.get('/api/v1/getTeams', async (req, res) => {
  try {
    const teams = await mmClient.getTeams();
    res.json(teams);
  } catch (error: any) {
    logger.error({ message: error.message, stack: error.stack, data: error.response?.data, requestBody: req.body });
    res.status(500).json({ error: error.message });
  }
});


export default router; 