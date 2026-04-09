import cron from 'node-cron'
import { logger } from '@/common/utils/logger'
import { CRON_SCHEDULES } from '@/common/constants'
import CrawlerService from '@/modules/crawler/services/crawler.service'
import FundNetBuyRepository from '@/modules/storage/repositories/fund-net-buy.repository'
import { format } from 'date-fns'

class CrawlerJob {
  private morningTask: cron.ScheduledTask | null = null
  private afternoonTask: cron.ScheduledTask | null = null
  private eveningTask: cron.ScheduledTask | null = null

  /**
   * Initialize crawler jobs
   */
  public start(): void {
    logger.info('Starting crawler jobs...')

    // Morning crawl (08:30 on weekdays)
    this.morningTask = cron.schedule(CRON_SCHEDULES.MORNING, async () => {
      await this.executeDelay('Morning crawl')
    })

    // Afternoon crawl (13:00 on weekdays)
    this.afternoonTask = cron.schedule(CRON_SCHEDULES.AFTERNOON, async () => {
      await this.executeDelay('Afternoon crawl')
    })

    // Evening crawl (15:00 on weekdays)
    this.eveningTask = cron.schedule(CRON_SCHEDULES.EVENING, async () => {
      await this.executeDelay('Evening crawl')
    })

    logger.info('Crawler jobs scheduled successfully')
  }

  /**
   * Execute crawler with delay for consistency
   */
  private async executeDelay(source: string): Promise<void> {
    try {
      const startTime = Date.now()
      logger.info(`[${source}] Starting crawl execution...`)

      // Execute crawler
      const crawledData = await CrawlerService.crawlFundNetBuy()

      if (crawledData && crawledData.length > 0) {
        // Add date and save to database
        const processedData = crawledData.map((stock) => ({
          ...stock,
          date: new Date(),
        }))

        await FundNetBuyRepository.saveBatch(processedData)

        const executionTime = Date.now() - startTime
        logger.info(
          `[${source}] Crawl completed successfully in ${executionTime}ms. Processed ${crawledData.length} stocks.`
        )
      } else {
        logger.warn(`[${source}] No data retrieved from crawler`)
      }
    } catch (error) {
      logger.error(`[${source}] Crawl execution failed:`, error)
    }
  }

  /**
   * Stop all crawler jobs
   */
  public stop(): void {
    logger.info('Stopping crawler jobs...')

    if (this.morningTask) {
      this.morningTask.stop()
      this.morningTask.destroy()
    }

    if (this.afternoonTask) {
      this.afternoonTask.stop()
      this.afternoonTask.destroy()
    }

    if (this.eveningTask) {
      this.eveningTask.stop()
      this.eveningTask.destroy()
    }

    logger.info('Crawler jobs stopped')
  }
}

export default new CrawlerJob()
