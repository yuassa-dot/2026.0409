import { logger } from '@/common/utils/logger'
import { FundNetBuyData } from '@/common/types'
import EmailService from './email.service'

interface AlertRule {
  type: 'buy_amount' | 'change_percent' | 'price_change' | 'volume'
  condition: 'above' | 'below'
  threshold: number
  enabled: boolean
}

interface AlertCondition {
  rule: AlertRule
  triggered: boolean
  message: string
}

interface StoredAlertRule extends AlertRule {
  id?: number
  symbol?: string
  createdAt?: Date
  updatedAt?: Date
}

class AlertService {
  private defaultRules: AlertRule[] = [
    {
      type: 'buy_amount',
      condition: 'above',
      threshold: 10000000000, // 10 billion
      enabled: true,
    },
    {
      type: 'change_percent',
      condition: 'above',
      threshold: 10,
      enabled: true,
    },
    {
      type: 'change_percent',
      condition: 'below',
      threshold: -10,
      enabled: true,
    },
  ]

  /**
   * Check if stock meets any alert conditions
   */
  async checkAlertRules(stock: FundNetBuyData): Promise<AlertCondition[]> {
    try {
      const triggers: AlertCondition[] = []

      // Check against default rules
      for (const rule of this.defaultRules) {
        if (!rule.enabled) continue

        const trigger = this.evaluateRule(stock, rule)
        if (trigger.triggered) {
          triggers.push(trigger)
        }
      }

      // Check against custom rules from database
      // This would need to be implemented with a rule repository
      // const customRules = await this.getCustomRules(stock.symbol)
      // for (const rule of customRules) {
      //   const trigger = this.evaluateRule(stock, rule)
      //   if (trigger.triggered) {
      //     triggers.push(trigger)
      //   }
      // }

      if (triggers.length > 0) {
        logger.info(
          `[AlertService] ${triggers.length} alert(s) triggered for ${stock.symbol}`
        )
      }

      return triggers
    } catch (error) {
      logger.error(
        `[AlertService] Failed to check alert rules for ${stock.symbol}:`,
        error
      )
      return []
    }
  }

  /**
   * Evaluate a single rule against a stock
   */
  private evaluateRule(stock: FundNetBuyData, rule: AlertRule): AlertCondition {
    let triggered = false
    let message = ''

    switch (rule.type) {
      case 'buy_amount':
        if (rule.condition === 'above') {
          triggered = (stock.buyAmount || 0) > rule.threshold
          message = `Buy amount (NT$${stock.buyAmount?.toLocaleString() || 0}) exceeds threshold (NT$${rule.threshold.toLocaleString()})`
        } else {
          triggered = (stock.buyAmount || 0) < rule.threshold
          message = `Buy amount (NT$${stock.buyAmount?.toLocaleString() || 0}) falls below threshold (NT$${rule.threshold.toLocaleString()})`
        }
        break

      case 'change_percent':
        if (rule.condition === 'above') {
          triggered = (stock.changePercent || 0) > rule.threshold
          message = `Price change (${stock.changePercent?.toFixed(2) || 0}%) exceeds threshold (${rule.threshold}%)`
        } else {
          triggered = (stock.changePercent || 0) < rule.threshold
          message = `Price change (${stock.changePercent?.toFixed(2) || 0}%) falls below threshold (${rule.threshold}%)`
        }
        break

      case 'price_change':
        if (rule.condition === 'above') {
          triggered = (stock.changeAmount || 0) > rule.threshold
          message = `Price change (NT$${stock.changeAmount?.toFixed(2) || 0}) exceeds threshold (NT$${rule.threshold.toFixed(2)})`
        } else {
          triggered = (stock.changeAmount || 0) < rule.threshold
          message = `Price change (NT$${stock.changeAmount?.toFixed(2) || 0}) falls below threshold (NT$${rule.threshold.toFixed(2)})`
        }
        break

      case 'volume':
        if (rule.condition === 'above') {
          triggered = (stock.volume || 0) > rule.threshold
          message = `Volume (${stock.volume?.toLocaleString() || 0}) exceeds threshold (${rule.threshold.toLocaleString()})`
        } else {
          triggered = (stock.volume || 0) < rule.threshold
          message = `Volume (${stock.volume?.toLocaleString() || 0}) falls below threshold (${rule.threshold.toLocaleString()})`
        }
        break
    }

    return {
      rule,
      triggered,
      message,
    }
  }

  /**
   * Send alerts for triggered conditions
   */
  async sendAlerts(
    stock: FundNetBuyData,
    alerts: AlertCondition[]
  ): Promise<void> {
    try {
      for (const alert of alerts) {
        await this.sendAlert(stock, alert)
      }
    } catch (error) {
      logger.error(`[AlertService] Failed to send alerts for ${stock.symbol}:`, error)
    }
  }

  /**
   * Send a single alert
   */
  private async sendAlert(
    stock: FundNetBuyData,
    alert: AlertCondition
  ): Promise<void> {
    try {
      // Send email alert
      await EmailService.sendAlert({
        symbol: stock.symbol,
        name: stock.name,
        reason: alert.message,
        currentValue: this.getMetricValue(stock, alert.rule.type),
        threshold: alert.rule.threshold,
      })

      logger.info(
        `[AlertService] Alert sent for ${stock.symbol}: ${alert.message}`
      )
    } catch (error) {
      logger.error(
        `[AlertService] Failed to send alert for ${stock.symbol}:`,
        error
      )
    }
  }

  /**
   * Get metric value from stock based on alert type
   */
  private getMetricValue(
    stock: FundNetBuyData,
    metricType: string
  ): number {
    switch (metricType) {
      case 'buy_amount':
        return stock.buyAmount || 0
      case 'change_percent':
        return stock.changePercent || 0
      case 'price_change':
        return stock.changeAmount || 0
      case 'volume':
        return stock.volume || 0
      default:
        return 0
    }
  }

  /**
   * Create a custom alert rule
   */
  async createAlertRule(rule: StoredAlertRule): Promise<StoredAlertRule> {
    try {
      // This would typically save to database
      // const created = await AlertRuleRepository.create(rule)
      logger.info(`[AlertService] Custom alert rule created: ${rule.type}`)
      return rule
    } catch (error) {
      logger.error('[AlertService] Failed to create alert rule:', error)
      throw error
    }
  }

  /**
   * Get custom rules for a stock symbol
   */
  async getCustomRules(symbol: string): Promise<StoredAlertRule[]> {
    try {
      // This would typically fetch from database
      // const rules = await AlertRuleRepository.getBySymbol(symbol)
      return []
    } catch (error) {
      logger.error(
        `[AlertService] Failed to get custom rules for ${symbol}:`,
        error
      )
      return []
    }
  }

  /**
   * Update an alert rule
   */
  async updateAlertRule(
    id: number,
    updates: Partial<StoredAlertRule>
  ): Promise<void> {
    try {
      // This would typically update in database
      // await AlertRuleRepository.update(id, updates)
      logger.info(`[AlertService] Alert rule updated: ${id}`)
    } catch (error) {
      logger.error('[AlertService] Failed to update alert rule:', error)
      throw error
    }
  }

  /**
   * Delete an alert rule
   */
  async deleteAlertRule(id: number): Promise<void> {
    try {
      // This would typically delete from database
      // await AlertRuleRepository.delete(id)
      logger.info(`[AlertService] Alert rule deleted: ${id}`)
    } catch (error) {
      logger.error('[AlertService] Failed to delete alert rule:', error)
      throw error
    }
  }

  /**
   * Enable/disable an alert rule
   */
  async toggleAlertRule(id: number, enabled: boolean): Promise<void> {
    try {
      // This would typically update in database
      // await AlertRuleRepository.update(id, { enabled })
      logger.info(`[AlertService] Alert rule ${id} toggled to ${enabled}`)
    } catch (error) {
      logger.error('[AlertService] Failed to toggle alert rule:', error)
      throw error
    }
  }

  /**
   * Get all default alert rules
   */
  getDefaultRules(): AlertRule[] {
    return this.defaultRules
  }

  /**
   * Update default alert rules
   */
  updateDefaultRules(rules: AlertRule[]): void {
    this.defaultRules = rules
    logger.info('[AlertService] Default alert rules updated')
  }
}

export default new AlertService()
