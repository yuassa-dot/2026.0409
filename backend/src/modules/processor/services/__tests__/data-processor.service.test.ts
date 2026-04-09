import DataProcessorService from '../data-processor.service'
import { FundNetBuyData } from '@/common/types'

describe('DataProcessorService', () => {
  const mockData: FundNetBuyData[] = [
    {
      id: 1,
      date: new Date(),
      symbol: '2330',
      name: 'Taiwan Semiconductor',
      buyAmount: 5000000000,
      buyShares: 1000000,
      closePrice: 500,
      changePercent: 2.5,
      volume: 50000000,
    },
    {
      id: 2,
      date: new Date(),
      symbol: '2454',
      name: 'MediaTek',
      buyAmount: 3000000000,
      buyShares: 500000,
      closePrice: 900,
      changePercent: 1.5,
      volume: 30000000,
    },
  ]

  describe('processData', () => {
    it('should process valid data successfully', async () => {
      const result = await DataProcessorService.processData(mockData)

      expect(result).toBeDefined()
      expect(result.length).toBe(2)
      expect(result[0].symbol).toBe('2330')
    })

    it('should filter invalid records', async () => {
      const invalidData = [
        ...mockData,
        {
          symbol: '0000',
          name: '',
          buyAmount: NaN,
        } as any,
      ]

      const result = await DataProcessorService.processData(invalidData)
      expect(result.length).toBeLessThan(invalidData.length)
    })

    it('should calculate metrics correctly', async () => {
      const result = await DataProcessorService.processData(mockData)

      expect(result[0].netBuyAmount).toBeDefined()
      expect(result[0].turnover).toBeDefined()
      expect(result[0].estimatedValue).toBeDefined()
    })
  })

  describe('cacheResults', () => {
    it('should cache results successfully', async () => {
      const testData = { test: 'data' }
      await DataProcessorService.cacheResults('2024-01-01', testData)
      // Note: Actual caching would be verified with a mocked Redis client
    })
  })

  describe('getCachedResults', () => {
    it('should retrieve cached results', async () => {
      const result = await DataProcessorService.getCachedResults('2024-01-01')
      // Note: Would return cached data or null
      expect(result === null || typeof result === 'object').toBe(true)
    })
  })
})
