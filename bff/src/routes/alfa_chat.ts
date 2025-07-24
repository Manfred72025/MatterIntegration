import { Router, Request, Response } from 'express';
import mmClient from '../mattermostClient';
import { logger } from '../loggers';

const router = Router();

function generateDiscussionName(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  // Формат: discussion-ГГГГММДД-ЧЧММСС
  return `discussion-${year}${month}${day}-${hours}${minutes}${seconds}`;
}

async function ensureChannelExists(channelId: string) {
  // Добавляем небольшую задержку для обеспечения синхронности
  await new Promise(resolve => setTimeout(resolve, 100));
  try {
    return await mmClient.getChannel(channelId);
  } catch (checkError) {
    logger.error(`Канал ${channelId} не найден после создания:`, checkError);
    throw new Error(`Созданный канал ${channelId} недоступен`);
  }
}

async function addUsersToChannel(channelId: string, user_ids: string[]) {
  const addResults = [];
  for (const user_id of user_ids) {
    logger.info({ message: `Пробую добавить пользователя в канал`, channelId, user_id });
    try {
      await mmClient.addToChannel(user_id, channelId);
      logger.info({ message: `Пользователь успешно добавлен в канал`, channelId, user_id });
      addResults.push({ user_id, status: 'added' });
    } catch (err: any) {
      logger.error({ message: `Ошибка при добавлении пользователя в канал`, channelId, user_id, error: err?.response?.data || err?.message });
      addResults.push({ user_id, status: 'error', error: err?.response?.data || err?.message });
    }
  }
  return addResults;
}

async function checkUsersExistence(user_ids: string[]) {
  return await Promise.all(user_ids.map(async (id: string) => {
    try {
      const user = await mmClient.getUser(id);
      return { id, exists: !!user, username: user?.username };
    } catch (e) {
      return { id, exists: false };
    }
  }));
}

// POST /alfa_chat/api/v1/createTopic
router.post('/api/v1/createTopic', async (req: Request, res: Response) => {
  try {
    const { team_id, discussion_name, user_ids } = req.body;
    logger.info({ message: 'Получены user_ids для добавления в канал', user_ids });
    const userChecks = await checkUsersExistence(user_ids);
    logger.info({ message: 'Результаты поиска пользователей по user_ids', userChecks });
    if (!team_id || !discussion_name || !Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({ error: 'team_id, discussion_name, user_ids обязательные поля' });
    }
    const name = generateDiscussionName();
    const display_name = discussion_name;
    const type = 'P'; // Приватный канал
    const channelPayload: any = { team_id, name, display_name, type };
    const channel = await mmClient.createChannel(channelPayload);
    const findedChanel = await ensureChannelExists(channel.id);
    const addResults = await addUsersToChannel(findedChanel.id, user_ids);
    res.status(201).json({ discussion_id: findedChanel.id, members: addResults });
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