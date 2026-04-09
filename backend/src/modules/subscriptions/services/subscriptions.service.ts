import { logger } from '@/common/utils/logger'
import { UserSubscription } from '@/common/types'
import SubscriptionsRepository from '../repositories/subscriptions.repository'
import EmailService from '@/modules/notification/services/email.service'

interface CreateSubscriptionDto {
  email: string
  subscriptionType: 'all' | 'symbol'
  symbol?: string
  thresholdChange?: number
}

interface UpdateSubscriptionDto {
  email?: string
  subscriptionType?: 'all' | 'symbol'
  symbol?: string
  thresholdChange?: number
  enabled?: boolean
}

class SubscriptionsService {
  /**
   * Create a new subscription
   */
  async createSubscription(
    data: CreateSubscriptionDto
  ): Promise<UserSubscription> {
    try {
      logger.info(`Creating subscription for ${data.email}...`)

      // Validate input
      this.validateSubscriptionInput(data)

      // Check if subscription already exists
      const existing = await SubscriptionsRepository.getByEmail(data.email)
      if (existing) {
        logger.warn(`Subscription already exists for ${data.email}`)
        return existing
      }

      // Create subscription
      const subscription = await SubscriptionsRepository.create({
        email: data.email,
        subscriptionType: data.subscriptionType,
        symbol: data.symbol,
        thresholdChange: data.thresholdChange,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // Send confirmation email
      await EmailService.sendSubscriptionConfirmation(
        data.email,
        data.subscriptionType
      )

      logger.info(`Subscription created successfully for ${data.email}`)
      return subscription
    } catch (error) {
      logger.error('Failed to create subscription:', error)
      throw error
    }
  }

  /**
   * Get subscription by email
   */
  async getSubscriptionByEmail(email: string): Promise<UserSubscription | null> {
    try {
      logger.info(`Fetching subscription for ${email}...`)
      return await SubscriptionsRepository.getByEmail(email)
    } catch (error) {
      logger.error(`Failed to get subscription for ${email}:`, error)
      throw error
    }
  }

  /**
   * Get subscription by ID
   */
  async getSubscriptionById(id: number): Promise<UserSubscription | null> {
    try {
      return await SubscriptionsRepository.getById(id)
    } catch (error) {
      logger.error(`Failed to get subscription with ID ${id}:`, error)
      throw error
    }
  }

  /**
   * Get all subscriptions
   */
  async getAllSubscriptions(
    limit: number = 100,
    offset: number = 0
  ): Promise<{
    subscriptions: UserSubscription[]
    total: number
  }> {
    try {
      logger.info(
        `Fetching all subscriptions (limit: ${limit}, offset: ${offset})...`
      )
      const subscriptions = await SubscriptionsRepository.getAll(limit, offset)
      const total = await SubscriptionsRepository.count()

      return { subscriptions, total }
    } catch (error) {
      logger.error('Failed to get all subscriptions:', error)
      throw error
    }
  }

  /**
   * Get subscriptions by symbol
   */
  async getSubscriptionsBySymbol(symbol: string): Promise<UserSubscription[]> {
    try {
      logger.info(`Fetching subscriptions for symbol ${symbol}...`)
      return await SubscriptionsRepository.getBySymbol(symbol)
    } catch (error) {
      logger.error(`Failed to get subscriptions for ${symbol}:`, error)
      throw error
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(
    id: number,
    data: UpdateSubscriptionDto
  ): Promise<UserSubscription> {
    try {
      logger.info(`Updating subscription ${id}...`)

      const subscription = await SubscriptionsRepository.getById(id)
      if (!subscription) {
        throw new Error(`Subscription with ID ${id} not found`)
      }

      const updated = await SubscriptionsRepository.update(id, {
        ...subscription,
        ...data,
        updatedAt: new Date(),
      })

      logger.info(`Subscription ${id} updated successfully`)
      return updated
    } catch (error) {
      logger.error(`Failed to update subscription ${id}:`, error)
      throw error
    }
  }

  /**
   * Delete subscription
   */
  async deleteSubscription(id: number): Promise<void> {
    try {
      logger.info(`Deleting subscription ${id}...`)
      await SubscriptionsRepository.delete(id)
      logger.info(`Subscription ${id} deleted successfully`)
    } catch (error) {
      logger.error(`Failed to delete subscription ${id}:`, error)
      throw error
    }
  }

  /**
   * Enable subscription
   */
  async enableSubscription(id: number): Promise<UserSubscription> {
    try {
      return await this.updateSubscription(id, { enabled: true })
    } catch (error) {
      logger.error(`Failed to enable subscription ${id}:`, error)
      throw error
    }
  }

  /**
   * Disable subscription
   */
  async disableSubscription(id: number): Promise<UserSubscription> {
    try {
      return await this.updateSubscription(id, { enabled: false })
    } catch (error) {
      logger.error(`Failed to disable subscription ${id}:`, error)
      throw error
    }
  }

  /**
   * Get active subscriptions
   */
  async getActiveSubscriptions(): Promise<UserSubscription[]> {
    try {
      logger.info('Fetching active subscriptions...')
      return await SubscriptionsRepository.getActive()
    } catch (error) {
      logger.error('Failed to get active subscriptions:', error)
      throw error
    }
  }

  /**
   * Validate subscription input
   */
  private validateSubscriptionInput(data: CreateSubscriptionDto): void {
    if (!data.email || !data.email.includes('@')) {
      throw new Error('Invalid email address')
    }

    if (!data.subscriptionType || !['all', 'symbol'].includes(data.subscriptionType)) {
      throw new Error('Invalid subscription type')
    }

    if (data.subscriptionType === 'symbol' && !data.symbol) {
      throw new Error('Symbol is required for symbol subscription type')
    }
  }
}

export default new SubscriptionsService()
