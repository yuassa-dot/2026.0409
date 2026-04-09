import cron from 'node-cron'
import { logger } from '@/common/utils/logger'
import FundNetBuyRepository from '@/modules/storage/repositories/fund-net-buy.repository'
import DataProcessorService from '@/modules/processor/services/data-processor.service'
import StatisticsService from '@/modules/processor/services/statistics.service'
import { format } from 'date-fns'

class ProcessorJob {
  private task: cron.ScheduledTask | null = null

  /**
   * Initialize processor job - runs after market close (16:00)
   */
  public start(): void {
    logger.info('Starting processor job...')

    // Run daily data processing at 16:00 (after market close)
    this.task = cron.schedule('0 16 * * 1-5', async () => {
      await this.processDaily()
    })

    logger.info('Processor job scheduled successfully (16:00 daily)')
  }

  /**
   * Process daily data
   */
  private async processDaily(): Promise<void> {
    try {
      const startTime = Date.now()
      const today = format(new Date(), 'yyyy-MM-dd')

      logger.info(`[DataProcessor] Starting daily processing for ${today}...`)

      // Get latest data from database
      const top30Data = await FundNetBuyRepository.getLatestTop30()

      if (!top30Data || top30Data.length === 0) {
        logger.warn('[DataProcessor] No data available for processing')
        return
      }

      // Process and enhance data
      const processedData = await DataProcessorService.processData(top30Data)

      // Generate statistics
      const statistics = await StatisticsService.generateDailyStats(
        processedData,
        today
      )

      // Calculate rankings and trends
      const rankings = await StatisticsService.calculateRankings(processedData)

      // Cache results for quick access
      await DataProcessorService.cacheResults(today, {
        processedData,
        statistics,
        rankings,
      })

      const executionTime = Date.now() - startTime
      logger.info(
        `[DataProcessor] Daily processing completed in ${executionTime}ms. Processed ${processedData.length} stocks.`
      )
    } catch (error) {
      logger.error('[DataProcessor] Daily processing failed:', error)
    }
  }

  /**
   * Stop processor job
   */
  public stop(): void {
    logger.info('Stopping processor job...')

    if (this.task) {
      this.task.stop()
      this.task.destroy()
    }

    logger.info('Processor job stopped')
  }
}

export default new ProcessorJob()
