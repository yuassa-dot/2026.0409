import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import { config } from '@/config/env'
import { logger } from '@/common/utils/logger'
import { HTTP_STATUS, API_MESSAGES } from '@/common/constants'

export function createApp(): Express {
  const app = express()

  // Security middleware
  app.use(helmet())

  // CORS configuration
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    })
  )

  // Body parser middleware
  app.use(bodyParser.json({ limit: '10mb' }))
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))

  // Request logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now()

    res.on('finish', () => {
      const duration = Date.now() - start
      logger.http(
        `${req.method} ${req.path} ${res.statusCode} - ${duration}ms`
      )
    })

    next()
  })

  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
    })
  })

  // API Routes
  app.use('/api/stocks', require('@/modules/stocks/stocks.routes').default)
  app.use(
    '/api/subscriptions',
    require('@/modules/subscriptions/subscriptions.routes').default
  )

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: API_MESSAGES.NOT_FOUND,
      timestamp: new Date().toISOString(),
    })
  })

  // Error handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error('Unhandled error:', err)

    res.status(err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: err.message || API_MESSAGES.INTERNAL_ERROR,
      error: config.app.env === 'development' ? err : undefined,
      timestamp: new Date().toISOString(),
    })
  })

  return app
}
