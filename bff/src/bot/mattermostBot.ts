import WebSocket from 'ws';
import { mattermostMessageLogger } from '../loggers';
import { config } from '../config';
import mmClient from '../mattermostClient';

// Тип события WebSocket Mattermost
interface WebSocketEvent {
  event: string;
  data?: any;
}

interface PostMessage {
  id: string;
  message: string;
  channel_id: string;
  user_id: string;
  root_id?: string;
  [key: string]: any;
}

// Конфиг для подключения к Mattermost
const MATTERMOST_WS_URL = (config.MATTERMOST_URL.replace(/^http/, 'ws') + '/api/v4/websocket');
const BOT_TOKEN = config.BOT_TOKEN;

export class MattermostBot {
  private ws: WebSocket | null = null;
  private client: any = null; // Mattermost API клиент
  private userCache: Map<string, string> = new Map(); // user_id -> username

  constructor(client?: any) {
    if (client) {
      this.client = client;
    } else {
      this.client = mmClient;
    }
  }

  start() {
    this.ws = new WebSocket(MATTERMOST_WS_URL, {
      headers: {
        Authorization: `Bearer ${BOT_TOKEN}`,
      },
    });

    this.ws.on('open', () => {
      mattermostMessageLogger.info('WebSocket соединение с Mattermost установлено.');
      console.log('MattermostBot: WebSocket соединение с Mattermost установлено.');
    });

    this.ws.on('message', async (data) => {
      try {
        const event: WebSocketEvent = JSON.parse(data.toString());
        await this.handleWebSocketEvent(event);
      } catch (err) {
        mattermostMessageLogger.error({
          message: 'Ошибка обработки сообщения Mattermost',
          error: err,
          raw: data.toString(),
          timestamp: new Date().toISOString(),
        });
      }
    });

    this.ws.on('error', (err) => {
      mattermostMessageLogger.error({
        message: 'WebSocket ERROR',
        error: err,
        timestamp: new Date().toISOString(),
      });
    });

    this.ws.on('close', () => {
      mattermostMessageLogger.info({
        message: 'WebSocket соединение закрыто',
        timestamp: new Date().toISOString(),
      });
    });
  }

  private async handleWebSocketEvent(event: WebSocketEvent): Promise<void> {
    switch (event.event) {
      case 'posted':
        await this.handleNewPost(event);
        break;
      case 'post_edited':
        await this.handleEditedPost(event);
        break;
      case 'post_deleted':
        await this.handleDeletedPost(event);
        break;
      case 'hello':
        mattermostMessageLogger.info('Received hello from WebSocket');
        break;
      default:
        mattermostMessageLogger.debug(`Unhandled event: ${event.event}`);
    }
  }

  private async getUsernameById(userId: string): Promise<string> {
    if (this.userCache.has(userId)) {
      return this.userCache.get(userId)!;
    }
    try {
      const user = await this.client.getUser(userId);
      const username = user?.username || userId;
      this.userCache.set(userId, username);
      return username;
    } catch (err) {
      return userId;
    }
  }

  private async handleNewPost(event: WebSocketEvent): Promise<void> {
    let post: PostMessage | null = null;
    if (event.data && event.data.post) {
      try {
        post = JSON.parse(event.data.post);
      } catch (err) {
        mattermostMessageLogger.error({
          message: 'Ошибка парсинга нового поста',
          error: err,
          raw: event.data.post,
          timestamp: new Date().toISOString(),
        });
      }
    }
    if (post) {
      const username = await this.getUsernameById(post.user_id);
      mattermostMessageLogger.info({
        type: 'mattermost_message',
        user_id: post.user_id,
        username,
        message: post.message,
        timestamp: new Date().toISOString(),
      });
      console.log(`MattermostBot: Получено сообщение от пользователя ${username}: ${post.message}`);
      await this.processMessage(post);
    }
  }

  private async handleEditedPost(event: WebSocketEvent): Promise<void> {
    await this.logPostEvent(event, 'mattermost_message_edited', 'Ошибка парсинга отредактированного поста');
  }

  private async handleDeletedPost(event: WebSocketEvent): Promise<void> {
    await this.logPostEvent(event, 'mattermost_message_deleted', 'Ошибка парсинга удалённого поста');
  }

  private async logPostEvent(event: WebSocketEvent, type: string, errorMsg: string): Promise<void> {
    if (event.data && event.data.post) {
      try {
        const post: PostMessage = JSON.parse(event.data.post);
        const username = await this.getUsernameById(post.user_id);
        mattermostMessageLogger.info({
          type,
          user_id: post.user_id,
          username,
          message: post.message,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        mattermostMessageLogger.error({
          message: errorMsg,
          error: err,
          raw: event.data.post,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  private async processMessage(post: PostMessage): Promise<void> {
    // Здесь можно добавить кастомную логику обработки сообщений
    // Например, реагирование на команды, анализ контента и т.д.
    if (post.message && post.message.toLowerCase().includes('привет')) {
      mattermostMessageLogger.info('Detected greeting message');
      // Можно отправить ответ
      // await this.sendResponse(post.channel_id, 'Привет! 👋');
    }
    // Обработка команды закрытия обсуждения
    if (post.message) {
      const msg = post.message.toLowerCase();
      if ( msg.includes('закрыть обсуждение')) {
        mattermostMessageLogger.info('Detected close discussion command');
        await this.sendResponse(post.channel_id, 'обсуждение закрыто', post.root_id);
      }
    }
  }

  private async sendResponse(channelId: string, message: string, rootId?: string): Promise<void> {
    try {
      if (!this.client) throw new Error('Mattermost client не инициализирован');
      await this.client.createPost({
        channel_id: channelId,
        message: message,
        root_id: rootId
      });
      mattermostMessageLogger.info(`Sent response to channel ${channelId}`);
    } catch (error) {
      mattermostMessageLogger.error('Error sending response:', error);
    }
  }
} 