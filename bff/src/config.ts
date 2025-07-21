import dotenv from 'dotenv';
dotenv.config();

export const config = {
  MATTERMOST_URL: process.env.MATTERMOST_URL || 'http://localhost:8065',
  BOT_TOKEN: process.env.BOT_TOKEN || '',
  //FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  BFF_URL: process.env.BFF_URL || `http://localhost:${process.env.PORT || 3001}`,
  PORT: process.env.PORT ? Number(process.env.PORT) : 3001,
}; 