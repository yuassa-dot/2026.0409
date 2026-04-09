import dotenv from 'dotenv'

dotenv.config()

export const config = {
  // Application
  app: {
    name: process.env.APP_NAME || 'Taiwan Stock Fund Screening',
    version: process.env.APP_VERSION || '1.0.0',
    port: parseInt(process.env.BACKEND_PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
  },

  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'twstock_user',
    password: process.env.DB_PASSWORD || 'twstock_password',
    database: process.env.DB_NAME || 'twstock_db',
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },

  // Email
  email: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || 'noreply@twstock.com',
  },

  // Telegram
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || '',
  },

  // Crawler
  crawler: {
    timeout: parseInt(process.env.CRAWLER_TIMEOUT || '30000', 10),
    retryCount: parseInt(process.env.CRAWLER_RETRY_COUNT || '3', 10),
    userAgents: (process.env.CRAWLER_USER_AGENTS || 'Mozilla/5.0').split(','),
  },
}
