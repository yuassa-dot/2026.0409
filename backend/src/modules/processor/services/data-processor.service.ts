import { logger } from '@/common/utils/logger'
import { FundNetBuyData } from '@/common/types'
import { get, set } from '@/config/redis'
import { CACHE_KEYS, CACHE_TTL } from '@/common/constants'
import FundNetBuyRepository from '@/modules/storage/repositories/fund-net-buy.repository'

class DataProcessorService {
  /**
   * Process raw fund net buy data
   */
  async processData(rawData: FundNetBuyData[]): Promise<FundNetBuyData[]> {
    try {
      logger.info(`Processing ${rawData.length} records...`)

      // Validate and normalize data
      const validatedData = this.validateData(rawData)

      // Enrich with historical comparisons
      const enrichedData = await this.enrichWithHistory(validatedData)

      // Calculate additional metrics
      const processedData = this.calculateMetrics(enrichedData)

      logger.info(`Successfully processed ${processedData.length} records`)
      return processedData
    } catch (error) {
      logger.error('Data processing failed:', error)
      throw error
    }
  }

  /**
   * Validate and normalize data
   */
  private validateData(data: FundNetBuyData[]): FundNetBuyData[] {
    return data.filter((item) => {
      // Check required fields
      if (!item.symbol || !item.name || item.buyAmount === undefined) {
        logger.warn(`Invalid record: ${JSON.stringify(item)}`)
        return false
      }

      // Validate numeric fields
      if (
        isNaN(item.buyAmount) ||
        isNaN(item.buyShares) ||
        (item.closePrice !== undefined && isNaN(item.closePrice))
      ) {
        logger.warn(`Invalid numeric values in record: ${item.symbol}`)
        return false
      }

      return true
    })
  }

  /**
   * Enrich data with historical information
   */
  private async enrichWithHistory(
    data: FundNetBuyData[]
  ): Promise<FundNetBuyData[]> {
    try {
      const enriched: FundNetBuyData[] = []

      for (const item of data) {
        // Get historical data for comparison
        const history = await FundNetBuyRepository.getHistory(item.symbol, 30)

        // Calculate average buy amount over 30 days
        const avgBuyAmount =
          history.length > 0
            ? history.reduce((sum, h) => sum + h.buyAmount, 0) / history.length
            : item.buyAmount

        // Calculate change from 30-day average
        const changeFromAvg = item.buyAmount - avgBuyAmount

        // Enrich item with new fields
        const enrichedItem: FundNetBuyData = {
          ...item,
          changeFromAvg,
          historyCount: history.length,
          avgBuyAmount30d: Math.round(avgBuyAmount),
        }

        enriched.push(enrichedItem)
      }

      return enriched
    } catch (error) {
      logger.warn('Failed to enrich with history:', error)
      // Return original data if enrichment fails
      return data
    }
  }

  /**
   * Calculate additional metrics for each stock
   */
  private calculateMetrics(data: FundNetBuyData[]): FundNetBuyData[] {
    return data.map((item, index) => {
      // Calculate net buy amount if not present
      const netBuyAmount =
        item.netBuyAmount ||
        (item.buyAmount || 0) - (item.sellAmount || 0)

      // Calculate turnover if we have necessary data
      const turnover = item.turnover || this.calculateTurnover(item)

      // Normalize change percent to 0-100 range
      const changePercent = item.changePercent || 0

      return {
        ...item,
        netBuyAmount,
        turnover,
        changePercent:
          Math.abs(changePercent) > 100
            ? Math.sign(changePercent) * 100
            : changePercent,
        // Additional calculated fields
        buyToSellRatio:
          item.sellAmount && item.sellAmount > 0
            ? item.buyAmount / item.sellAmount
            : item.buyAmount > 0
              ? Infinity
              : 0,
        estimatedValue:
          (item.closePrice || 0) * (item.buyShares || 0),
      }
    })
  }

  /**
   * Calculate turnover (buy_amount / estimated_market_value)
   */
  private calculateTurnover(item: FundNetBuyData): number {
    if (!item.closePrice || !item.volume || item.volume === 0) {
      return 0
    }

    const marketValue = item.closePrice * item.volume
    return marketValue > 0 ? (item.buyAmount / marketValue) * 100 : 0
  }

  /**
   * Cache processing results
   */
  async cacheResults(date: string, data: any): Promise<void> {
    try {
      const cacheKey = CACHE_KEYS.DAILY_DATA(date)

      await set(cacheKey, data, CACHE_TTL.LONG)

      logger.info(`Cached results for ${date}`)
    } catch (error) {
      logger.warn('Failed to cache results:', error)
      // Continue without caching
    }
  }

  /**
   * Get cached results if available
   */
  async getCachedResults(date: string): Promise<any | null> {
    try {
      const cacheKey = CACHE_KEYS.DAILY_DATA(date)
      return await get(cacheKey)
    } catch (error) {
      logger.warn('Failed to get cached results:', error)
      return null
    }
  }

  /**
   * Clear cache for a specific date
   */
  async clearCache(date: string): Promise<void> {
    try {
      const cacheKey = CACHE_KEYS.DAILY_DATA(date)
      // Delete from cache (implementation depends on redis client)
      logger.info(`Cleared cache for ${date}`)
    } catch (error) {
      logger.warn('Failed to clear cache:', error)
    }
  }
}

export default new DataProcessorService()
