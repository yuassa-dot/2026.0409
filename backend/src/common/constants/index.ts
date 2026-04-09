// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const

// API messages
export const API_MESSAGES = {
  SUCCESS: 'Operation successful',
  ERROR: 'Operation failed',
  NOT_FOUND: 'Resource not found',
  INVALID_INPUT: 'Invalid input data',
  UNAUTHORIZED: 'Unauthorized access',
  INTERNAL_ERROR: 'Internal server error',
} as const

// Cache keys
export const CACHE_KEYS = {
  TOP_30_STOCKS: 'top30:stocks',
  STOCK_DETAIL: (symbol: string) => `stock:${symbol}`,
  DAILY_DATA: (date: string) => `daily:${date}`,
  STATISTICS: (date: string) => `stats:${date}`,
} as const

// Cache TTLs (in seconds)
export const CACHE_TTL = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 30 * 60, // 30 minutes
  LONG: 1 * 60 * 60, // 1 hour
  VERY_LONG: 24 * 60 * 60, // 24 hours
} as const

// Crawler constants
export const CRAWLER = {
  TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  DELAY_BETWEEN_REQUESTS: 100, // 100ms
  USER_AGENTS: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
  ],
} as const

// Scheduled jobs
export const CRON_SCHEDULES = {
  MORNING: '30 8 * * 1-5', // 08:30 on weekdays
  AFTERNOON: '0 13 * * 1-5', // 13:00 on weekdays
  EVENING: '0 15 * * 1-5', // 15:00 on weekdays
  DAILY_BACKUP: '0 22 * * *', // 22:00 daily
} as const

// Data constants
export const DATA = {
  TOP_STOCKS_COUNT: 30,
  MIN_VALID_PRICE: 1,
  MAX_PRICE_CHANGE_PERCENT: 100,
  DATE_FORMAT: 'yyyy-MM-dd',
  CSV_FILENAME: (date: string) => `daily_${date}.csv`,
} as const

// Email templates
export const EMAIL_TEMPLATES = {
  DAILY_REPORT: 'daily_report',
  ALERT: 'alert',
  NOTIFICATION: 'notification',
} as const

// Notification types
export const NOTIFICATION_TYPES = {
  EMAIL: 'email',
  TELEGRAM: 'telegram',
  SMS: 'sms',
} as const

// Subscription types
export const SUBSCRIPTION_TYPES = {
  ALL: 'all',
  SYMBOL: 'symbol',
  CHANGE_THRESHOLD: 'change_threshold',
} as const

// Error codes
export const ERROR_CODES = {
  DATABASE_ERROR: 'DB_ERROR',
  CRAWLER_ERROR: 'CRAWLER_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const
