// Data Access Layer (DAL) для работы с API Mattermost

export const BASE_URL = 'http://localhost:3001';

export const fetchUsers = async () => {
  const response = await fetch(`${BASE_URL}/users`);
  if (!response.ok) throw new Error('Ошибка загрузки пользователей');
  return await response.json();
};

export const fetchChannels = async () => {
  const response = await fetch(`${BASE_URL}/channels`);
  if (!response.ok) throw new Error('Ошибка загрузки каналов');
  return await response.json();
};

export const fetchChannelMembers = async (channelId: string) => {
  const response = await fetch(`${BASE_URL}/channels/${channelId}/members`);
  if (!response.ok) throw new Error('Ошибка загрузки участников');
  return await response.json();
};

export const fetchTeams = async () => {
  const response = await fetch(`${BASE_URL}/alfa_chat/api/v1/getTeams`);
  if (!response.ok) throw new Error('Ошибка загрузки команд');
  const data = await response.json();
  return Array.isArray(data) ? data : (data.teams || []);
};

export const fetchDiscussions = async () => {
  const response = await fetch(`${BASE_URL}/discussions`);
  if (!response.ok) throw new Error('Ошибка загрузки обсуждений');
  const data = await response.json();
  return Array.isArray(data) ? data : (data.channels || []);
};

export const fetchDiscussionPosts = async (channelId: string) => {
  const response = await fetch(`${BASE_URL}/discussions/${channelId}/posts`);
  if (!response.ok) throw new Error('Ошибка загрузки сообщений');
  const data = await response.json();
  return data && data.posts ? Object.values(data.posts) : [];
};

export const fetchTeamUsers = async (teamId: string) => {
  const response = await fetch(`${BASE_URL}/users/by-team/${teamId}`);
  if (!response.ok) throw new Error('Ошибка загрузки пользователей команды');
  return await response.json();
};

export const createTopic = async (data: { team_id: string; discussion_name: string; user_ids: string[] }) => {
  const response = await fetch(`${BASE_URL}/alfa_chat/api/v1/createTopic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error || 'Ошибка создания топика');
  }
  return await response.json();
};

export const createUser = async (data: { email: string; username: string; password: string; team_id: string }) => {
  const response = await fetch(`${BASE_URL}/alfa_chat/api/v1/createUser`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error || 'Ошибка создания пользователя');
  }
  return await response.json();
}; 