import axios from 'axios'
import { logger } from '@/common/utils/logger'
import { CRAWLER } from '@/common/constants'

interface StockPriceData {
  symbol: string
  closePrice: number
  changePercent: number
  timestamp: Date
}

class StockPriceService {
  /**
   * Get stock price from external data source
   * This is a placeholder - actual implementation depends on available APIs
   */
  async getStockPrice(symbol: string): Promise<StockPriceData | null> {
    try {
      // Example using TWSE API (Taiwan Stock Exchange)
      const priceData = await this.fetchFromTWSE(symbol)

      if (priceData) {
        return {
          symbol,
          closePrice: priceData.closePrice,
          changePercent: priceData.changePercent,
          timestamp: new Date(),
        }
      }

      return null
    } catch (error) {
      logger.warn(`Failed to fetch price for ${symbol}:`, error)
      return null
    }
  }

  /**
   * Fetch from Taiwan Stock Exchange API
   */
  private async fetchFromTWSE(symbol: string): Promise<any> {
    try {
      const userAgent = this.getRandomUserAgent()

      // TWSE provides an OpenAPI for stock data
      const response = await axios.get(
        `https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=${this.getCurrentDate()}&stockNo=${symbol}`,
        {
          headers: {
            'User-Agent': userAgent,
          },
          timeout: CRAWLER.TIMEOUT,
        }
      )

      const data = response.data
      if (!data.data || data.data.length === 0) {
        return null
      }

      const latestData = data.data[data.data.length - 1]

      return {
        closePrice: parseFloat(latestData[6]), // Close price
        changePercent:
          (parseFloat(latestData[6]) - parseFloat(latestData[3])) /
          parseFloat(latestData[3]) *
          100,
      }
    } catch (error) {
      logger.debug('TWSE fetch error:', error)
      return null
    }
  }

  /**
   * Fetch from alternative API (if available)
   */
  private async fetchFromAlternativeAPI(symbol: string): Promise<any> {
    try {
      const userAgent = this.getRandomUserAgent()

      // Example using a different data source
      const response = await axios.get(
        `https://api.example.com/stock/${symbol}`,
        {
          headers: {
            'User-Agent': userAgent,
          },
          timeout: CRAWLER.TIMEOUT,
        }
      )

      const data = response.data

      return {
        closePrice: data.price,
        changePercent: data.changePercent,
      }
    } catch (error) {
      logger.debug('Alternative API fetch error:', error)
      return null
    }
  }

  /**
   * Get current date in YYYYMMDD format (TWSE requires this)
   */
  private getCurrentDate(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')

    return `${year}${month}${day}`
  }

  /**
   * Get random user agent
   */
  private getRandomUserAgent(): string {
    return CRAWLER.USER_AGENTS[
      Math.floor(Math.random() * CRAWLER.USER_AGENTS.length)
    ]
  }
}

export default new StockPriceService()
