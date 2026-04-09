import { logger } from '@/common/utils/logger'
import { FundNetBuyData } from '@/common/types'

interface StockRanking {
  symbol: string
  name: string
  rank: number
  metric: number
  percentile: number
}

interface RankingResult {
  metric: string
  rankings: StockRanking[]
  timestamp: Date
}

class RankingService {
  /**
   * Rank stocks by buy amount
   */
  rankByBuyAmount(data: FundNetBuyData[]): RankingResult {
    try {
      const sorted = [...data].sort(
        (a, b) => (b.buyAmount || 0) - (a.buyAmount || 0)
      )

      const maxBuyAmount = sorted[0]?.buyAmount || 1
      const rankings = sorted.map((item, index) => ({
        symbol: item.symbol,
        name: item.name,
        rank: index + 1,
        metric: item.buyAmount || 0,
        percentile: 100 - (index / sorted.length) * 100,
      }))

      return {
        metric: 'buy_amount',
        rankings,
        timestamp: new Date(),
      }
    } catch (error) {
      logger.error('Failed to rank by buy amount:', error)
      throw error
    }
  }

  /**
   * Rank stocks by price change percentage
   */
  rankByChangePercent(data: FundNetBuyData[]): RankingResult {
    try {
      const validData = data.filter(
        (item) => item.changePercent !== undefined
      )
      const sorted = [...validData].sort(
        (a, b) => (b.changePercent || 0) - (a.changePercent || 0)
      )

      const rankings = sorted.map((item, index) => ({
        symbol: item.symbol,
        name: item.name,
        rank: index + 1,
        metric: item.changePercent || 0,
        percentile: 100 - (index / sorted.length) * 100,
      }))

      return {
        metric: 'change_percent',
        rankings,
        timestamp: new Date(),
      }
    } catch (error) {
      logger.error('Failed to rank by change percent:', error)
      throw error
    }
  }

  /**
   * Rank stocks by turnover
   */
  rankByTurnover(data: FundNetBuyData[]): RankingResult {
    try {
      const validData = data.filter((item) => item.turnover !== undefined)
      const sorted = [...validData].sort(
        (a, b) => (b.turnover || 0) - (a.turnover || 0)
      )

      const rankings = sorted.map((item, index) => ({
        symbol: item.symbol,
        name: item.name,
        rank: index + 1,
        metric: item.turnover || 0,
        percentile: 100 - (index / sorted.length) * 100,
      }))

      return {
        metric: 'turnover',
        rankings,
        timestamp: new Date(),
      }
    } catch (error) {
      logger.error('Failed to rank by turnover:', error)
      throw error
    }
  }

  /**
   * Rank stocks by price
   */
  rankByPrice(data: FundNetBuyData[]): RankingResult {
    try {
      const validData = data.filter(
        (item) => item.closePrice !== undefined && item.closePrice > 0
      )
      const sorted = [...validData].sort(
        (a, b) => (b.closePrice || 0) - (a.closePrice || 0)
      )

      const rankings = sorted.map((item, index) => ({
        symbol: item.symbol,
        name: item.name,
        rank: index + 1,
        metric: item.closePrice || 0,
        percentile: 100 - (index / sorted.length) * 100,
      }))

      return {
        metric: 'close_price',
        rankings,
        timestamp: new Date(),
      }
    } catch (error) {
      logger.error('Failed to rank by price:', error)
      throw error
    }
  }

  /**
   * Rank stocks by volume
   */
  rankByVolume(data: FundNetBuyData[]): RankingResult {
    try {
      const validData = data.filter((item) => item.volume !== undefined)
      const sorted = [...validData].sort(
        (a, b) => (b.volume || 0) - (a.volume || 0)
      )

      const rankings = sorted.map((item, index) => ({
        symbol: item.symbol,
        name: item.name,
        rank: index + 1,
        metric: item.volume || 0,
        percentile: 100 - (index / sorted.length) * 100,
      }))

      return {
        metric: 'volume',
        rankings,
        timestamp: new Date(),
      }
    } catch (error) {
      logger.error('Failed to rank by volume:', error)
      throw error
    }
  }

  /**
   * Combine multiple rankings into composite score
   */
  compositeRanking(
    data: FundNetBuyData[],
    weights: {
      buyAmount?: number
      changePercent?: number
      rank?: number
      turnover?: number
      price?: number
    } = {
      buyAmount: 0.4,
      changePercent: 0.3,
      rank: 0.2,
      turnover: 0.1,
    }
  ): RankingResult {
    try {
      // Generate individual rankings
      const rankBuyAmount = this.rankByBuyAmount(data)
      const rankChangePercent = this.rankByChangePercent(data)
      const rankTurnover = this.rankByTurnover(data)

      // Create ranking maps for quick lookup
      const buyAmountMap = new Map(
        rankBuyAmount.rankings.map((r) => [r.symbol, r.percentile])
      )
      const changePercentMap = new Map(
        rankChangePercent.rankings.map((r) => [r.symbol, r.percentile])
      )
      const turnoverMap = new Map(
        rankTurnover.rankings.map((r) => [r.symbol, r.percentile])
      )

      // Calculate composite scores
      const compositeScores: StockRanking[] = data.map((item, index) => ({
        symbol: item.symbol,
        name: item.name,
        rank: index + 1,
        metric:
          (buyAmountMap.get(item.symbol) || 0) * (weights.buyAmount || 0.4) +
          (changePercentMap.get(item.symbol) || 0) *
            (weights.changePercent || 0.3) +
          (turnoverMap.get(item.symbol) || 0) * (weights.turnover || 0.1),
        percentile:
          (buyAmountMap.get(item.symbol) || 0) * (weights.buyAmount || 0.4) +
          (changePercentMap.get(item.symbol) || 0) *
            (weights.changePercent || 0.3) +
          (turnoverMap.get(item.symbol) || 0) * (weights.turnover || 0.1),
      }))

      // Sort by composite score
      compositeScores.sort((a, b) => b.metric - a.metric)

      // Update ranks
      compositeScores.forEach((item, index) => {
        item.rank = index + 1
      })

      return {
        metric: 'composite',
        rankings: compositeScores,
        timestamp: new Date(),
      }
    } catch (error) {
      logger.error('Failed to calculate composite ranking:', error)
      throw error
    }
  }

  /**
   * Get ranking for specific stock
   */
  getStockRanking(
    rankings: RankingResult,
    symbol: string
  ): StockRanking | undefined {
    return rankings.rankings.find((r) => r.symbol === symbol)
  }

  /**
   * Get top N stocks from ranking
   */
  getTopN(rankings: RankingResult, n: number = 10): StockRanking[] {
    return rankings.rankings.slice(0, n)
  }

  /**
   * Get percentile rank for stock
   */
  getPercentileRank(rankings: RankingResult, symbol: string): number {
    const stock = this.getStockRanking(rankings, symbol)
    return stock ? stock.percentile : 0
  }
}

export default new RankingService()
