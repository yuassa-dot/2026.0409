import winston from 'winston'
import { config } from '@/config/env'
import path from 'path'
import fs from 'fs'

const logsDir = path.join(process.cwd(), 'logs')

// Create logs directory if it doesn't exist
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

winston.addColors(colors)

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) =>
      `${info.timestamp} ${info.level}: ${info.message}`
  )
)

const transports = [
  // Console transport
  new winston.transports.Console(),

  // File transports
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: winston.format.uncolorize(),
  }),

  new winston.transports.File({
    filename: path.join(logsDir, 'all.log'),
    format: winston.format.uncolorize(),
  }),

  new winston.transports.File({
    filename: path.join(logsDir, 'crawler.log'),
    level: 'debug',
    format: winston.format.uncolorize(),
  }),
]

export const logger = winston.createLogger({
  level: config.app.env === 'development' ? 'debug' : 'warn',
  levels,
  format,
  transports,
})
