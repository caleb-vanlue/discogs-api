import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    name: process.env.DB_NAME || 'discogs',
  },
  discogs: {
    username: process.env.DISCOGS_USERNAME,
    apiToken: process.env.DISCOGS_API_TOKEN,
    baseUrl: process.env.DISCOGS_API_BASE_URL || 'https://api.discogs.com',
  },
  port: parseInt(process.env.PORT ?? '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
}));
