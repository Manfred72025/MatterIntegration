import { Client4 } from '@mattermost/client';
import { config } from './config';

const MATTERMOST_URL = config.MATTERMOST_URL;
const BOT_TOKEN = config.BOT_TOKEN; // используйте свой токен

const mmClient = new Client4();
mmClient.setUrl(MATTERMOST_URL);
mmClient.setToken(BOT_TOKEN);

export default mmClient; 