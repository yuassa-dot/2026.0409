import { Request, Response } from 'express'
import { logger } from '@/common/utils/logger'
import { HTTP_STATUS, API_MESSAGES } from '@/common/constants'
import SubscriptionsService from './services/subscriptions.service'

class SubscriptionsController {
  /**
   * Create subscription
   * POST /api/subscriptions
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { email, subscriptionType, symbol, thresholdChange } = req.body

      const subscription = await SubscriptionsService.createSubscription({
        email,
        subscriptionType,
        symbol,
        thresholdChange,
      })

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: subscription,
        message: 'Subscription created successfully',
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      logger.error('Failed to create subscription:', error)
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message || API_MESSAGES.ERROR,
        timestamp: new Date().toISOString(),
      })
    }
  }

  /**
   * Get subscription by email
   * GET /api/subscriptions/email/:email
   */
  async getByEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params

      const subscription = await SubscriptionsService.getSubscriptionByEmail(email)

      if (!subscription) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Subscription not found',
          timestamp: new Date().toISOString(),
        })
        return
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: subscription,
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      logger.error('Failed to get subscription by email:', error)
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: API_MESSAGES.INTERNAL_ERROR,
        timestamp: new Date().toISOString(),
      })
    }
  }

  /**
   * Get subscription by ID
   * GET /api/subscriptions/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const subscription = await SubscriptionsService.getSubscriptionById(
        parseInt(id, 10)
      )

      if (!subscription) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Subscription not found',
          timestamp: new Date().toISOString(),
        })
        return
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: subscription,
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      logger.error('Failed to get subscription by ID:', error)
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: API_MESSAGES.INTERNAL_ERROR,
        timestamp: new Date().toISOString(),
      })
    }
  }

  /**
   * Get all subscriptions
   * GET /api/subscriptions
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 100
      const offset = parseInt(req.query.offset as string) || 0

      const { subscriptions, total } =
        await SubscriptionsService.getAllSubscriptions(limit, offset)

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: subscriptions,
        pagination: {
          page: Math.floor(offset / limit) + 1,
          pageSize: limit,
          totalCount: total,
          totalPages: Math.ceil(total / limit),
        },
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      logger.error('Failed to get all subscriptions:', error)
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: API_MESSAGES.INTERNAL_ERROR,
        timestamp: new Date().toISOString(),
      })
    }
  }

  /**
   * Get subscriptions by symbol
   * GET /api/subscriptions/symbol/:symbol
   */
  async getBySymbol(req: Request, res: Response): Promise<void> {
    try {
      const { symbol } = req.params

      const subscriptions =
        await SubscriptionsService.getSubscriptionsBySymbol(symbol)

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: subscriptions,
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      logger.error('Failed to get subscriptions by symbol:', error)
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: API_MESSAGES.INTERNAL_ERROR,
        timestamp: new Date().toISOString(),
      })
    }
  }

  /**
   * Update subscription
   * PUT /api/subscriptions/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const updates = req.body

      const subscription = await SubscriptionsService.updateSubscription(
        parseInt(id, 10),
        updates
      )

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: subscription,
        message: 'Subscription updated successfully',
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      logger.error('Failed to update subscription:', error)
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message || API_MESSAGES.ERROR,
        timestamp: new Date().toISOString(),
      })
    }
  }

  /**
   * Delete subscription
   * DELETE /api/subscriptions/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      await SubscriptionsService.deleteSubscription(parseInt(id, 10))

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Subscription deleted successfully',
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      logger.error('Failed to delete subscription:', error)
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message || API_MESSAGES.ERROR,
        timestamp: new Date().toISOString(),
      })
    }
  }

  /**
   * Enable subscription
   * PATCH /api/subscriptions/:id/enable
   */
  async enable(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const subscription = await SubscriptionsService.enableSubscription(
        parseInt(id, 10)
      )

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: subscription,
        message: 'Subscription enabled successfully',
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      logger.error('Failed to enable subscription:', error)
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message || API_MESSAGES.ERROR,
        timestamp: new Date().toISOString(),
      })
    }
  }

  /**
   * Disable subscription
   * PATCH /api/subscriptions/:id/disable
   */
  async disable(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const subscription = await SubscriptionsService.disableSubscription(
        parseInt(id, 10)
      )

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: subscription,
        message: 'Subscription disabled successfully',
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      logger.error('Failed to disable subscription:', error)
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message || API_MESSAGES.ERROR,
        timestamp: new Date().toISOString(),
      })
    }
  }

  /**
   * Get active subscriptions
   * GET /api/subscriptions/active
   */
  async getActive(req: Request, res: Response): Promise<void> {
    try {
      const subscriptions = await SubscriptionsService.getActiveSubscriptions()

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: subscriptions,
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      logger.error('Failed to get active subscriptions:', error)
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: API_MESSAGES.INTERNAL_ERROR,
        timestamp: new Date().toISOString(),
      })
    }
  }
}

export default new SubscriptionsController()
