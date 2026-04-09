import StatisticsService from '../statistics.service'
import { FundNetBuyData } from '@/common/types'

describe('StatisticsService', () => {
  const mockData: FundNetBuyData[] = [
    {
      id: 1,
      date: new Date(),
      symbol: '2330',
      name: 'TSM',
      buyAmount: 5000000000,
      buyShares: 1000000,
      closePrice: 500,
      changePercent: 2.5,
      industry: 'Semiconductors',
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
      industry: 'Semiconductors',
    },
    {
      id: 3,
      date: new Date(),
      symbol: '2308',
      name: 'Delta Electronics',
      buyAmount: 2000000000,
      buyShares: 300000,
      closePrice: 300,
      changePercent: -0.5,
      industry: 'Electronics',
    },
  ]

  describe('generateDailyStats', () => {
    it('should generate daily statistics correctly', async () => {
      const stats = await StatisticsService.generateDailyStats(
        mockData,
        '2024-01-01'
      )

      expect(stats).toBeDefined()
      expect(stats.totalBuyAmount).toBe(10000000000)
      expect(stats.totalStocksCount).toBe(3)
      expect(stats.averageChangePercent).toBeCloseTo(1.17, 1)
    })

    it('should calculate correct average buy amount', async () => {
      const stats = await StatisticsService.generateDailyStats(
        mockData,
        '2024-01-01'
      )

      expect(stats.averageBuyAmount).toBeCloseTo(3333333333.33, 0)
    })

    it('should identify top industry', async () => {
      const stats = await StatisticsService.generateDailyStats(
        mockData,
        '2024-01-01'
      )

      expect(stats.topIndustry).toBe('Semiconductors')
    })
  })

  describe('calculateRankings', () => {
    it('should calculate rankings by buy amount', async () => {
      const rankings = await StatisticsService.calculateRankings(mockData)

      expect(rankings.byBuyAmount).toBeDefined()
      expect(rankings.byBuyAmount.length).toBe(3)
      expect(rankings.byBuyAmount[0].symbol).toBe('2330')
    })

    it('should calculate rankings by change percent', async () => {
      const rankings = await StatisticsService.calculateRankings(mockData)

      expect(rankings.byChangePercent).toBeDefined()
      expect(rankings.byChangePercent[0].symbol).toBe('2330')
    })

    it('should calculate rankings by turnover', async () => {
      const rankings = await StatisticsService.calculateRankings(mockData)

      expect(rankings.byTurnover).toBeDefined()
      expect(rankings.byTurnover.length).toBeGreaterThan(0)
    })
  })

  describe('getStatisticsComparison', () => {
    it('should compare statistics between two dates', async () => {
      const comparison = await StatisticsService.getStatisticsComparison(
        '2024-01-01',
        '2024-01-02'
      )

      expect(comparison).toBeDefined()
      expect(comparison.comparison).toBeDefined()
    })
  })

  describe('generateTrendAnalysis', () => {
    it('should generate trend analysis for a stock', async () => {
      const trend = await StatisticsService.generateTrendAnalysis('2330', 30)

      expect(trend).toBeDefined()
      expect(trend.symbol).toBe('2330')
      expect(trend.trend).toMatch(/up|down|stable/)
    })
  })
})
