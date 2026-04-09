import cron from 'node-cron'
import { logger } from '@/common/utils/logger'
import AlertService from '@/modules/notification/services/alert.service'
import EmailService from '@/modules/notification/services/email.service'
import FundNetBuyRepository from '@/modules/storage/repositories/fund-net-buy.repository'
import StatisticsService from '@/modules/processor/services/statistics.service'
import { format } from 'date-fns'

class NotificationJob {
  private dailyTask: cron.ScheduledTask | null = null
  private alertTask: cron.ScheduledTask | null = null

  /**
   * Initialize notification jobs
   */
  public start(): void {
    logger.info('Starting notification jobs...')

    // Daily summary email at 16:30
    this.dailyTask = cron.schedule('30 16 * * 1-5', async () => {
      await this.sendDailySummary()
    })

    // Real-time alerts every 5 minutes (checks for threshold violations)
    this.alertTask = cron.schedule('*/5 * * * *', async () => {
      await this.checkAndSendAlerts()
    })

    logger.info('Notification jobs scheduled successfully')
  }

  /**
   * Send daily summary email to subscribers
   */
  private async sendDailySummary(): Promise<void> {
    try {
      const startTime = Date.now()
      const today = format(new Date(), 'yyyy-MM-dd')

      logger.info(`[NotificationJob] Sending daily summary for ${today}...`)

      // Get latest top 30 data
      const top30Data = await FundNetBuyRepository.getLatestTop30()

      if (!top30Data || top30Data.length === 0) {
        logger.warn('[NotificationJob] No data available for daily summary')
        return
      }

      // Generate statistics
      const stats = await FundNetBuyRepository.getStatistics(today)

      // Send email to all subscribers
      await EmailService.sendDailySummary({
        date: today,
        stocks: top30Data,
        statistics: stats,
      })

      const executionTime = Date.now() - startTime
      logger.info(
        `[NotificationJob] Daily summary sent in ${executionTime}ms`
      )
    } catch (error) {
      logger.error('[NotificationJob] Failed to send daily summary:', error)
    }
  }

  /**
   * Check for alert conditions and send notifications
   */
  private async checkAndSendAlerts(): Promise<void> {
    try {
      const today = format(new Date(), 'yyyy-MM-dd')

      // Get current top 30 stocks
      const currentData = await FundNetBuyRepository.getLatestTop30()

      if (!currentData || currentData.length === 0) {
        return
      }

      // Check each stock against alert rules
      for (const stock of currentData) {
        const alerts = await AlertService.checkAlertRules(stock)

        // Send alerts if conditions are met
        if (alerts.length > 0) {
          await AlertService.sendAlerts(stock, alerts)
        }
      }
    } catch (error) {
      logger.error('[NotificationJob] Alert checking failed:', error)
    }
  }

  /**
   * Stop notification jobs
   */
  public stop(): void {
    logger.info('Stopping notification jobs...')

    if (this.dailyTask) {
      this.dailyTask.stop()
      this.dailyTask.destroy()
    }

    if (this.alertTask) {
      this.alertTask.stop()
      this.alertTask.destroy()
    }

    logger.info('Notification jobs stopped')
  }
}

export default new NotificationJob()
