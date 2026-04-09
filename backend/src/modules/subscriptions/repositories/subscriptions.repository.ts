import { logger } from '@/common/utils/logger'
import { UserSubscription } from '@/common/types'
import { getConnection } from '@/config/database'

class SubscriptionsRepository {
  private tableName = 'user_subscriptions'

  /**
   * Create a new subscription
   */
  async create(subscription: UserSubscription): Promise<UserSubscription> {
    try {
      const pool = getConnection()

      const query = `
        INSERT INTO ${this.tableName}
        (email, subscription_type, symbol, threshold_change, enabled, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `

      const result = await pool.query(query, [
        subscription.email,
        subscription.subscriptionType,
        subscription.symbol,
        subscription.thresholdChange,
        subscription.enabled !== false,
        subscription.createdAt,
        subscription.updatedAt,
      ])

      logger.info(`Subscription created: ${subscription.email}`)
      return this.mapRow(result.rows[0])
    } catch (error) {
      logger.error('Failed to create subscription:', error)
      throw error
    }
  }

  /**
   * Get subscription by ID
   */
  async getById(id: number): Promise<UserSubscription | null> {
    try {
      const pool = getConnection()

      const result = await pool.query(
        `SELECT * FROM ${this.tableName} WHERE id = $1`,
        [id]
      )

      return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null
    } catch (error) {
      logger.error(`Failed to get subscription by ID ${id}:`, error)
      throw error
    }
  }

  /**
   * Get subscription by email
   */
  async getByEmail(email: string): Promise<UserSubscription | null> {
    try {
      const pool = getConnection()

      const result = await pool.query(
        `SELECT * FROM ${this.tableName} WHERE email = $1 LIMIT 1`,
        [email]
      )

      return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null
    } catch (error) {
      logger.error(`Failed to get subscription by email ${email}:`, error)
      throw error
    }
  }

  /**
   * Get all subscriptions
   */
  async getAll(limit: number = 100, offset: number = 0): Promise<UserSubscription[]> {
    try {
      const pool = getConnection()

      const result = await pool.query(
        `SELECT * FROM ${this.tableName} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
        [limit, offset]
      )

      return result.rows.map((row) => this.mapRow(row))
    } catch (error) {
      logger.error('Failed to get all subscriptions:', error)
      throw error
    }
  }

  /**
   * Get subscriptions by symbol
   */
  async getBySymbol(symbol: string): Promise<UserSubscription[]> {
    try {
      const pool = getConnection()

      const result = await pool.query(
        `SELECT * FROM ${this.tableName} WHERE symbol = $1 OR subscription_type = 'all' ORDER BY created_at DESC`,
        [symbol]
      )

      return result.rows.map((row) => this.mapRow(row))
    } catch (error) {
      logger.error(`Failed to get subscriptions by symbol ${symbol}:`, error)
      throw error
    }
  }

  /**
   * Get active subscriptions
   */
  async getActive(): Promise<UserSubscription[]> {
    try {
      const pool = getConnection()

      const result = await pool.query(
        `SELECT * FROM ${this.tableName} WHERE enabled = true ORDER BY created_at DESC`
      )

      return result.rows.map((row) => this.mapRow(row))
    } catch (error) {
      logger.error('Failed to get active subscriptions:', error)
      throw error
    }
  }

  /**
   * Update subscription
   */
  async update(id: number, subscription: UserSubscription): Promise<UserSubscription> {
    try {
      const pool = getConnection()

      const query = `
        UPDATE ${this.tableName}
        SET email = $1, subscription_type = $2, symbol = $3, threshold_change = $4, enabled = $5, updated_at = $6
        WHERE id = $7
        RETURNING *
      `

      const result = await pool.query(query, [
        subscription.email,
        subscription.subscriptionType,
        subscription.symbol,
        subscription.thresholdChange,
        subscription.enabled,
        subscription.updatedAt,
        id,
      ])

      logger.info(`Subscription updated: ${id}`)
      return this.mapRow(result.rows[0])
    } catch (error) {
      logger.error(`Failed to update subscription ${id}:`, error)
      throw error
    }
  }

  /**
   * Delete subscription
   */
  async delete(id: number): Promise<void> {
    try {
      const pool = getConnection()

      await pool.query(`DELETE FROM ${this.tableName} WHERE id = $1`, [id])

      logger.info(`Subscription deleted: ${id}`)
    } catch (error) {
      logger.error(`Failed to delete subscription ${id}:`, error)
      throw error
    }
  }

  /**
   * Count total subscriptions
   */
  async count(): Promise<number> {
    try {
      const pool = getConnection()

      const result = await pool.query(
        `SELECT COUNT(*) as count FROM ${this.tableName}`
      )

      return parseInt(result.rows[0].count, 10)
    } catch (error) {
      logger.error('Failed to count subscriptions:', error)
      throw error
    }
  }

  /**
   * Map database row to UserSubscription
   */
  private mapRow(row: any): UserSubscription {
    return {
      id: row.id,
      email: row.email,
      phone: row.phone,
      symbol: row.symbol,
      subscriptionType: row.subscription_type,
      thresholdChange: row.threshold_change,
      enabled: row.enabled,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }
}

export default new SubscriptionsRepository()
