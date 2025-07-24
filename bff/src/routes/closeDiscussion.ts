import { Router } from 'express';
import { config } from '../config';
import { mattermostMessageLogger } from '../loggers';

const router = Router();

// Проверка токена для команды закрытия обсуждения
function verifyMattermostToken(token: string): boolean {
  return token === config.COMAND_CLOSE_DISCUSSION_TOKEN;
}

// Заглушка для логирования закрытия обсуждения
function logDiscussionClosure(user_id: string, channel_id: string, channel_name: string, text: string) {
  // Лог в консоль
  console.log('Discussion closed:', { user_id, channel_id, channel_name, text });
  // Лог в файл через логгер
  mattermostMessageLogger.info({
    type: 'discussion_closed',
    user_id,
    channel_id,
    channel_name,
    text,
    timestamp: new Date().toISOString(),
  });
}

// Обработчик команды /closeDiscussion
router.post('/mattermost/close-discussion', async (req, res) => {
  try {
    // Извлекаем данные из запроса Mattermost
    const {
      token,           // Токен для проверки подлинности
      team_id,         // ID команды
      team_domain,     // Домен команды
      channel_id,      // ID канала
      channel_name,    // Имя канала
      user_id,         // ID пользователя
      user_name,       // Имя пользователя
      command,         // Сама команда (/closeDiscussion)
      text,            // Текст после команды
      response_url,    // URL для отложенного ответа
      trigger_id       // ID для интерактивных элементов
    } = req.body;

    console.log('Received close discussion command:', {
      user_name,
      channel_name,
      text: text || '(no additional text)'
    });

    // Проверяем токен (если настроен)
    if (config.COMAND_CLOSE_DISCUSSION_TOKEN !== '' && !verifyMattermostToken(token)) {
      return res.status(401).json({
        response_type: 'ephemeral',
        text: 'Unauthorized request'
      });
    }

    // Проверяем права пользователя (пример) //, "manfred7"
    const allowedUsers = ['admin', 'moderator', 'manfred7']; // Можно настроить через переменные окружения
    if (!allowedUsers.includes(user_name) && !(text && text.includes('force'))) {
      return res.json({
        response_type: 'ephemeral',
        text: '❌ У вас нет прав для закрытия дискуссии. Только модераторы могут выполнить эту команду.'
      });
    }

    // Логируем закрытие дискуссии
    logDiscussionClosure(user_id, channel_id, channel_name, text);

    // Определяем причину закрытия
    const reason = text ? text.trim() : 'Причина не указана';
    
    // Формируем ответ
    const responseText = `### 🔒 Дискуссия закрыта\n\n` +
      `**Закрыта:** @${user_name}\n` +
      `**Время:** ${new Date().toLocaleString('ru-RU')}\n` +
      `**Причина:** ${reason}\n\n` +
      `_Дальнейшие сообщения в этой дискуссии не рекомендуются._`;

    // Создаем attachments для более красивого отображения
    const response = {
      response_type: 'in_channel', // Ответ виден всем в канале
      text: responseText,
      attachments: [
        {
          color: '#ff6b6b', // Красный цвет для обозначения закрытия
          fields: [
            {
              title: 'Статус',
              value: 'Закрыта',
              short: true
            },
            {
              title: 'Модератор',
              value: `@${user_name}`,
              short: true
            }
          ],
          footer: 'Discussion Management Bot',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };

    // Отправляем ответ
    res.json(response);

    // Опционально: отправляем дополнительное уведомление через webhook
    // await sendDelayedNotification(response_url, channel_id, user_name);

  } catch (error) {
    console.error('Error processing close discussion command:', error);
    mattermostMessageLogger.error({
      message: 'Error processing close discussion command',
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    res.json({
      response_type: 'ephemeral',
      text: '❌ Произошла ошибка при обработке команды. Попробуйте позже.'
    });
  }
});

export default router; 