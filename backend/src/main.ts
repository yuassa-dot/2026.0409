import { createApp } from './app'
import { config } from '@/config/env'
import { connectDatabase, disconnectDatabase } from '@/config/database'
import { connectRedis, disconnectRedis } from '@/config/redis'
import { logger } from '@/common/utils/logger'
import CrawlerJob from '@/jobs/crawler.job'
import ProcessorJob from '@/jobs/processor.job'
import NotificationJob from '@/jobs/notification.job'

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

    // Initialize scheduled jobs
    logger.info('Initializing scheduled jobs...')
    CrawlerJob.start()
    ProcessorJob.start()
    NotificationJob.start()
    logger.info('All scheduled jobs started successfully')

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM signal received: closing HTTP server')
      server.close(async () => {
        logger.info('HTTP server closed')

        // Stop jobs
        logger.info('Stopping scheduled jobs...')
        CrawlerJob.stop()
        ProcessorJob.stop()
        NotificationJob.stop()

        await disconnectDatabase()
        await disconnectRedis()
        process.exit(0)
      })
    })

    process.on('SIGINT', async () => {
      logger.info('SIGINT signal received: closing HTTP server')
      server.close(async () => {
        logger.info('HTTP server closed')

        // Stop jobs
        logger.info('Stopping scheduled jobs...')
        CrawlerJob.stop()
        ProcessorJob.stop()
        NotificationJob.stop()

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
