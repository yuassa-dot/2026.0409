import { createApp } from './app'
import { config } from '@/config/env'
import { connectDatabase, disconnectDatabase } from '@/config/database'
import { connectRedis, disconnectRedis } from '@/config/redis'
import { logger } from '@/common/utils/logger'

async function main(): Promise<void> {
  try {
    logger.info(`Starting ${config.app.name} v${config.app.version}`)

    // Connect to database
    logger.info('Connecting to database...')
    await connectDatabase()

    // Connect to Redis
    logger.info('Connecting to Redis...')
    await connectRedis()

    // Create and start Express app
    const app = createApp()

    const server = app.listen(config.app.port, () => {
      logger.info(
        `Server is running on http://localhost:${config.app.port}`
      )
      logger.info(`Environment: ${config.app.env}`)
    })

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM signal received: closing HTTP server')
      server.close(async () => {
        logger.info('HTTP server closed')
        await disconnectDatabase()
        await disconnectRedis()
        process.exit(0)
      })
    })

    process.on('SIGINT', async () => {
      logger.info('SIGINT signal received: closing HTTP server')
      server.close(async () => {
        logger.info('HTTP server closed')
        await disconnectDatabase()
        await disconnectRedis()
        process.exit(0)
      })
    })
  } catch (error) {
    logger.error('Fatal error:', error)
    process.exit(1)
  }
}

main()
