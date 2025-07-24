import express, { Request, Response } from 'express';

import cors from 'cors';
import router from './routes';
import { logger } from './loggers';
import { config } from './config';
import helmet from 'helmet';
import { startBot } from './bot/botStarter';


const app = express();


app.use(cors(/* { origin: config.FRONTEND_URL, credentials: true } */));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());


app.use('/', router);


app.get('/', (req: Request, res: Response) => {
  res.send('BFF сервер работает!');
});

const port = config.PORT;

app.listen(port, () => {
  logger.info(`BFF сервер запущен на ${config.BFF_URL}`);
  console.log(`BFF сервер запущен на ${config.BFF_URL}`);
}); 

// Запускаем бота
startBot();