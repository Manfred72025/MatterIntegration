import { Router } from 'express';

import teamsRouter from './teams';
import discussionsRouter from './discussions';
import channelsRouter from './channels';
import usersRouter from './users';

const router = Router();

// Получить список команд (teams)
router.use('/teams', teamsRouter);

// Получить список обсуждений (каналов типа discussion)
router.use('/discussions', discussionsRouter);

// Получить список каналов (channels)
router.use('/channels', channelsRouter);

// Роуты пользователей
router.use('/users', usersRouter);




export default router; 