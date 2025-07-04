import axios from 'axios';
import { Client } from 'pg';
import WebSocket from 'ws';

// Конфигурация Mattermost
const MATTERMOST_URL = 'http://localhost:8065'; // адрес вашего сервера
const BOT_TOKEN = 'yyomz659ttdyujsruay3m7kq7w'; // вставьте сюда токен бота

// Конфигурация PostgreSQL
const pgClient = new Client({
  host: 'localhost',
  port: 5432,
  user: 'matterbot',
  password: 'matterbot_password',
  database: 'matterbot',
});

async function initDb() {
  await pgClient.connect();
  await pgClient.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      post_id VARCHAR(50),
      channel_id VARCHAR(50),
      user_id VARCHAR(50),
      message TEXT,
      create_at BIGINT
    );
  `);
  console.log('Таблица messages готова!');
}

// Пример: получить список каналов
async function getChannels() {
  try {
    const response = await axios.get(`${MATTERMOST_URL}/api/v4/channels`, {
      headers: {
        'Authorization': `Bearer ${BOT_TOKEN}`,
      },
    });
    console.log('Каналы:', response.data);
  } catch (error) {
    console.error('Ошибка при получении каналов:', error);
  }
}

let ws: WebSocket | null = null;

// Запуск WebSocket для получения событий
async function startWebSocket() {
  // Получаем токен для подключения к WebSocket
  const wsUrl = MATTERMOST_URL.replace('http', 'ws') + '/api/v4/websocket';
  ws = new WebSocket(wsUrl, {
    headers: {
      'Authorization': `Bearer ${BOT_TOKEN}`,
    },
  });

  ws.on('open', () => {
    console.log('WebSocket подключён к Mattermost!');
  });

  ws.on('message', async (data: WebSocket.RawData) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.event === 'posted') {
        const postData = JSON.parse(msg.data.post);
        // Сохраняем сообщение в БД
        await pgClient.query(
          'INSERT INTO messages (post_id, channel_id, user_id, message, create_at) VALUES ($1, $2, $3, $4, $5)',
          [postData.id, postData.channel_id, postData.user_id, postData.message, postData.create_at]
        );
        console.log('Сохранено сообщение:', postData.message);
      }
    } catch (e) {
      // Игнорируем невалидные сообщения
    }
  });

  ws.on('close', () => {
    console.log('WebSocket отключён.');
  });

  ws.on('error', (err: Error) => {
    console.error('Ошибка WebSocket:', err);
  });
}

initDb().then(async () => {
  await startWebSocket();
  await printAllMessages();
});

// Функция для вывода последних 10 сообщений из БД
async function printAllMessages() {
  try {
    const res = await pgClient.query('SELECT * FROM messages ORDER BY id DESC LIMIT 10');
    console.log('Последние сообщения в БД:', res.rows);
  } catch (e) {
    console.error('Ошибка при выводе сообщений из БД:', e);
  }
}

getChannels(); 