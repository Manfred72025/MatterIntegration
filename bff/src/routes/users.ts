import { Router, Request, Response } from 'express';
import mmClient from '../mattermostClient';
import { logger } from '../loggers';

const router = Router();


// Создать пользователя
router.post('/', async (req: Request, res: Response) => {
  try {
    const user = await mmClient.createUser(req.body, '', '', '');
    // Если указан team_id, добавить пользователя в команду
    if (req.body.team_id && user && user.id) {
      await mmClient.addToTeam(req.body.team_id, user.id);      
    }
    res.status(201).json(user);
  } catch (error: any) {
    logger.error({ message: error.message, stack: error.stack, data: error.response?.data, requestBody: req.body });
    res.status(500).json({ error: error.message });
  }
});

// Получить список пользователей (с пагинацией)
// Mattermost API: GET /api/v4/users?page=0&per_page=100

router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 0;
    const perPage = parseInt(req.query.perPage as string) || 100;
    const users = await mmClient.getProfiles(page, perPage);
    // Фильтрация: только активные (delete_at === 0 и (active === true или нет поля active))
    const filtered = users.filter((u: any) => (u.delete_at === 0) && (u.active === undefined || u.active === true));
    res.json(filtered);
  } catch (error: any) {
    logger.error({ message: error.message, stack: error.stack, data: error.response?.data, requestBody: req.body });
    res.status(500).json({ error: error.message });
  }
});

// Получить только имена пользователей (с пагинацией)
// Mattermost API: GET /api/v4/users?page=0&per_page=100
router.get('/usernames', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 0;
    const perPage = parseInt(req.query.perPage as string) || 100;
    const users = await mmClient.getProfiles(page, perPage);
    const usernames = users.map((u: any) => u.username);
    res.json(usernames);
  } catch (error: any) {
    logger.error({ message: error.message, stack: error.stack, data: error.response?.data, requestBody: req.body });
    res.status(500).json({ error: error.message });
  }
});

// Получить пользователей выбранной команды
router.get('/by-team/:team_id', async (req: Request, res: Response) => {
  try {
    const teamId = req.params.team_id;
    
    const users = await mmClient.getProfilesInTeam(teamId, 0, 200);
    // Фильтрация: только активные (delete_at === 0 и (active === true или нет поля active))
    const filtered = users.filter((u: any) => (u.delete_at === 0) && (u.active === undefined || u.active === true));
    res.json(filtered);
  } catch (error: any) {
    logger.error({ message: error.message, stack: error.stack, data: error.response?.data, requestBody: req.body });
    res.status(500).json({ error: error.message });
  }
});

// Обновить пользователя
// Mattermost API: PATCH /api/v4/users/{user_id}
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const user = await mmClient.patchUser({ id: req.params.id, ...req.body });
    res.json(user);
  } catch (error: any) {
    logger.error({ message: error.message, stack: error.stack, data: error.response?.data, requestBody: req.body });
    res.status(500).json({ error: error.message });
  }
});

// Удалить пользователя
// Mattermost API: DELETE /api/v4/users/{user_id}
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await mmClient.updateUserActive(req.params.id, false);
    res.json({ success: true });
  } catch (error: any) {
    logger.error({ message: error.message, stack: error.stack, data: error.response?.data, requestBody: req.body });
    res.status(500).json({ error: error.message });
  }
});

export default router; 