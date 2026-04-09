import SubscriptionsService from '../services/subscriptions.service'
import SubscriptionsRepository from '../repositories/subscriptions.repository'
import { UserSubscription } from '@/common/types'

jest.mock('../repositories/subscriptions.repository')

describe('SubscriptionsService', () => {
  const mockSubscription: UserSubscription = {
    id: 1,
    email: 'test@example.com',
    subscriptionType: 'all',
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createSubscription', () => {
    it('should create a new subscription', async () => {
      ;(SubscriptionsRepository.getByEmail as jest.Mock).mockResolvedValue(null)
      ;(SubscriptionsRepository.create as jest.Mock).mockResolvedValue(
        mockSubscription
      )

      const result = await SubscriptionsService.createSubscription({
        email: 'test@example.com',
        subscriptionType: 'all',
      })

      expect(result).toEqual(mockSubscription)
      expect(SubscriptionsRepository.create).toHaveBeenCalled()
    })

    it('should reject invalid email', async () => {
      await expect(
        SubscriptionsService.createSubscription({
          email: 'invalid-email',
          subscriptionType: 'all',
        })
      ).rejects.toThrow()
    })

    it('should require symbol for symbol subscriptions', async () => {
      await expect(
        SubscriptionsService.createSubscription({
          email: 'test@example.com',
          subscriptionType: 'symbol',
        })
      ).rejects.toThrow()
    })
  })

  describe('getSubscriptionByEmail', () => {
    it('should retrieve subscription by email', async () => {
      ;(SubscriptionsRepository.getByEmail as jest.Mock).mockResolvedValue(
        mockSubscription
      )

      const result = await SubscriptionsService.getSubscriptionByEmail(
        'test@example.com'
      )

      expect(result).toEqual(mockSubscription)
      expect(SubscriptionsRepository.getByEmail).toHaveBeenCalledWith(
        'test@example.com'
      )
    })
  })

  describe('getSubscriptionById', () => {
    it('should retrieve subscription by ID', async () => {
      ;(SubscriptionsRepository.getById as jest.Mock).mockResolvedValue(
        mockSubscription
      )

      const result = await SubscriptionsService.getSubscriptionById(1)

      expect(result).toEqual(mockSubscription)
      expect(SubscriptionsRepository.getById).toHaveBeenCalledWith(1)
    })
  })

  describe('getAllSubscriptions', () => {
    it('should retrieve all subscriptions with pagination', async () => {
      const subscriptions = [mockSubscription]
      ;(SubscriptionsRepository.getAll as jest.Mock).mockResolvedValue(
        subscriptions
      )
      ;(SubscriptionsRepository.count as jest.Mock).mockResolvedValue(1)

      const result = await SubscriptionsService.getAllSubscriptions(10, 0)

      expect(result.subscriptions).toEqual(subscriptions)
      expect(result.total).toBe(1)
    })
  })

  describe('deleteSubscription', () => {
    it('should delete subscription', async () => {
      ;(SubscriptionsRepository.delete as jest.Mock).mockResolvedValue(
        undefined
      )

      await SubscriptionsService.deleteSubscription(1)

      expect(SubscriptionsRepository.delete).toHaveBeenCalledWith(1)
    })
  })

  describe('enableSubscription', () => {
    it('should enable a subscription', async () => {
      const enabled = { ...mockSubscription, enabled: true }
      ;(SubscriptionsRepository.getById as jest.Mock).mockResolvedValue(
        mockSubscription
      )
      ;(SubscriptionsRepository.update as jest.Mock).mockResolvedValue(enabled)

      const result = await SubscriptionsService.enableSubscription(1)

      expect(result.enabled).toBe(true)
    })
  })

  describe('disableSubscription', () => {
    it('should disable a subscription', async () => {
      const disabled = { ...mockSubscription, enabled: false }
      ;(SubscriptionsRepository.getById as jest.Mock).mockResolvedValue(
        mockSubscription
      )
      ;(SubscriptionsRepository.update as jest.Mock).mockResolvedValue(disabled)

      const result = await SubscriptionsService.disableSubscription(1)

      expect(result.enabled).toBe(false)
    })
  })
})
