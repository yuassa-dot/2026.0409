import { logger } from '@/common/utils/logger'
import { FundNetBuyData, Statistics } from '@/common/types'
import { get, set } from '@/config/redis'
import { CACHE_KEYS, CACHE_TTL } from '@/common/constants'

interface IndustryStats {
  [key: string]: {
    count: number
    totalBuyAmount: number
    avgChangePercent: number
    symbols: string[]
  }
}

interface RankingData {
  byBuyAmount: FundNetBuyData[]
  byChangePercent: FundNetBuyData[]
  byRank: FundNetBuyData[]
  byTurnover: FundNetBuyData[]
}

class StatisticsService {
  /**
   * Generate daily statistics
   */
  async generateDailyStats(
    data: FundNetBuyData[],
    date: string
  ): Promise<Statistics> {
    try {
      logger.info(`Generating statistics for ${date}...`)

      const statistics: Statistics = {
        totalBuyAmount: 0,
        averageBuyAmount: 0,
        averageChangePercent: 0,
        topIndustry: '',
        totalStocksCount: data.length,
        data: data,
      }

      if (data.length === 0) {
        return statistics
      }

      // Calculate total and average buy amounts
      statistics.totalBuyAmount = data.reduce(
        (sum, item) => sum + (item.buyAmount || 0),
        0
      )
      statistics.averageBuyAmount = statistics.totalBuyAmount / data.length

      // Calculate average change percent
      const validChangePercents = data.filter(
        (item) => item.changePercent !== undefined
      )
      if (validChangePercents.length > 0) {
        statistics.averageChangePercent =
          validChangePercents.reduce(
            (sum, item) => sum + (item.changePercent || 0),
            0
          ) / validChangePercents.length
      }

      // Find top industry
      const industryStats = this.analyzeIndustries(data)
      const topIndustry = Object.entries(industryStats).reduce((prev, curr) =>
        curr[1].totalBuyAmount > prev[1].totalBuyAmount ? curr : prev
      )
      statistics.topIndustry = topIndustry[0]

      // Cache statistics
      await this.cacheStatistics(date, statistics)

      logger.info(`Statistics generated for ${date}`)

      return statistics
    } catch (error) {
      logger.error('Failed to generate statistics:', error)
      throw error
    }
  }

  /**
   * Analyze industry distribution
   */
  private analyzeIndustries(data: FundNetBuyData[]): IndustryStats {
    const industries: IndustryStats = {}

    for (const item of data) {
      const industry = item.industry || 'Unknown'

      if (!industries[industry]) {
        industries[industry] = {
          count: 0,
          totalBuyAmount: 0,
          avgChangePercent: 0,
          symbols: [],
        }
      }

      industries[industry].count++
      industries[industry].totalBuyAmount += item.buyAmount || 0
      industries[industry].symbols.push(item.symbol)
    }

    // Calculate average change percent for each industry
    for (const industry in industries) {
      const industryStocks = data.filter(
        (s) => (s.industry || 'Unknown') === industry
      )
      const validChangePercents = industryStocks.filter(
        (s) => s.changePercent !== undefined
      )

      if (validChangePercents.length > 0) {
        industries[industry].avgChangePercent =
          validChangePercents.reduce((sum, s) => sum + (s.changePercent || 0), 0) /
          validChangePercents.length
      }
    }

    return industries
  }

  /**
   * Calculate various rankings
   */
  async calculateRankings(data: FundNetBuyData[]): Promise<RankingData> {
    try {
      logger.info('Calculating rankings...')

      const rankings: RankingData = {
        byBuyAmount: [...data].sort(
          (a, b) => (b.buyAmount || 0) - (a.buyAmount || 0)
        ),
        byChangePercent: [...data].sort(
          (a, b) => (b.changePercent || 0) - (a.changePercent || 0)
        ),
        byRank: [...data].sort((a, b) => (a.rank || 999) - (b.rank || 999)),
        byTurnover: [...data].sort(
          (a, b) => (b.turnover || 0) - (a.turnover || 0)
        ),
      }

      // Add ranking indices
      this.addRankingIndices(rankings)

      return rankings
    } catch (error) {
      logger.error('Failed to calculate rankings:', error)
      throw error
    }
  }

  /**
   * Add ranking indices to ranking data
   */
  private addRankingIndices(rankings: RankingData): void {
    Object.keys(rankings).forEach((key) => {
      rankings[key as keyof RankingData].forEach((item, index) => {
        item.rankByBuyAmount = index + 1
      })
    })
  }

  /**
   * Get statistics comparison between dates
   */
  async getStatisticsComparison(
    date1: string,
    date2: string
  ): Promise<{
    date1: Statistics | null
    date2: Statistics | null
    comparison: {
      buyAmountChange: number
      changePercentChange: number
      stockCountChange: number
    }
  }> {
    try {
      const stats1 = await this.getStatistics(date1)
      const stats2 = await this.getStatistics(date2)

      if (!stats1 || !stats2) {
        return {
          date1: stats1,
          date2: stats2,
          comparison: {
            buyAmountChange: 0,
            changePercentChange: 0,
            stockCountChange: 0,
          },
        }
      }

      return {
        date1: stats1,
        date2: stats2,
        comparison: {
          buyAmountChange: stats2.totalBuyAmount - stats1.totalBuyAmount,
          changePercentChange:
            stats2.averageChangePercent - stats1.averageChangePercent,
          stockCountChange: stats2.totalStocksCount - stats1.totalStocksCount,
        },
      }
    } catch (error) {
      logger.error('Failed to get statistics comparison:', error)
      throw error
    }
  }

  /**
   * Cache statistics
   */
  private async cacheStatistics(
    date: string,
    stats: Statistics
  ): Promise<void> {
    try {
      const cacheKey = CACHE_KEYS.STATISTICS(date)
      await set(cacheKey, stats, CACHE_TTL.LONG)
    } catch (error) {
      logger.warn('Failed to cache statistics:', error)
    }
  }

  /**
   * Get statistics from cache or calculate
   */
  private async getStatistics(date: string): Promise<Statistics | null> {
    try {
      const cacheKey = CACHE_KEYS.STATISTICS(date)
      return await get(cacheKey)
    } catch (error) {
      logger.warn('Failed to get cached statistics:', error)
      return null
    }
  }

  /**
   * Generate trend analysis
   */
  async generateTrendAnalysis(
    symbol: string,
    days: number = 30
  ): Promise<{
    symbol: string
    avgBuyAmount: number
    trend: 'up' | 'down' | 'stable'
    buyAmountChange: number
    volatility: number
  }> {
    try {
      logger.info(`Generating trend analysis for ${symbol}...`)

      // This would typically fetch historical data and analyze trends
      // For now, return a basic structure
      return {
        symbol,
        avgBuyAmount: 0,
        trend: 'stable',
        buyAmountChange: 0,
        volatility: 0,
      }
    } catch (error) {
      logger.error(`Failed to generate trend analysis for ${symbol}:`, error)
      throw error
    }
  }
}

export default new StatisticsService()
