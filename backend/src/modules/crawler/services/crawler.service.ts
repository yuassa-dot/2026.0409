import axios from 'axios'
import { logger } from '@/common/utils/logger'
import { CRAWLER, DATA } from '@/common/constants'
import { RawCrawlData, ProcessedStockData } from '@/common/types'
import ParserService from './parser.service'
import StockPriceService from './stock-price.service'

class CrawlerService {
  private parserService: ParserService
  private stockPriceService: StockPriceService

  constructor() {
    this.parserService = new ParserService()
    this.stockPriceService = new StockPriceService()
  }

  /**
   * Main crawler function to fetch and process fund net buy data
   */
  async crawlFundNetBuy(): Promise<ProcessedStockData[]> {
    try {
      logger.info('Starting fund net buy data crawl...')

      // Fetch HTML from Liancang (example data source)
      const htmlContent = await this.fetchDataSource()

      // Parse HTML to extract raw data
      const rawData = await this.parserService.parseHtml(htmlContent)

      if (!rawData || rawData.length === 0) {
        logger.warn('No data found from crawler')
        return []
      }

      logger.info(`Parsed ${rawData.length} stocks from source`)

      // Fetch stock prices and details
      const enrichedData = await this.enrichDataWithPrices(rawData)

      // Sort by buy amount and take top 30
      const processedData = this.processAndRank(enrichedData)

      logger.info(`Successfully crawled ${processedData.length} top stocks`)

      return processedData
    } catch (error) {
      logger.error('Crawler error:', error)
      throw error
    }
  }

  /**
   * Fetch data from the source website
   */
  private async fetchDataSource(retries: number = 0): Promise<string> {
    try {
      const userAgent = this.getRandomUserAgent()

      const response = await axios.get(
        'https://www.liancang.com.tw/web/topMoney/list', // Example URL, replace with actual
        {
          headers: {
            'User-Agent': userAgent,
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
          },
          timeout: CRAWLER.TIMEOUT,
        }
      )

      return response.data
    } catch (error) {
      if (retries < CRAWLER.MAX_RETRIES) {
        const delay = Math.pow(2, retries) * 1000 // Exponential backoff
        logger.warn(
          `Fetch failed, retrying in ${delay}ms (attempt ${retries + 1}/${CRAWLER.MAX_RETRIES})`
        )
        await this.sleep(delay)
        return this.fetchDataSource(retries + 1)
      }

      logger.error('Failed to fetch data from source:', error)
      throw error
    }
  }

  /**
   * Enrich raw data with current stock prices
   */
  private async enrichDataWithPrices(
    rawData: RawCrawlData[]
  ): Promise<RawCrawlData[]> {
    const enriched: RawCrawlData[] = []

    for (const stock of rawData) {
      try {
        // Get stock price from external API or database
        const priceData = await this.stockPriceService.getStockPrice(
          stock.symbol
        )

        // Merge price data with raw data
        const merged = {
          ...stock,
          closePrice: priceData?.closePrice || stock.closePrice,
          changePercent: priceData?.changePercent || stock.changePercent,
        }

        enriched.push(merged)

        // Add delay to avoid rate limiting
        await this.sleep(CRAWLER.DELAY_BETWEEN_REQUESTS)
      } catch (error) {
        logger.warn(`Failed to get price for ${stock.symbol}:`, error)
        // Continue with partial data
        enriched.push(stock)
      }
    }

    return enriched
  }

  /**
   * Process and rank the crawled data
   */
  private processAndRank(data: RawCrawlData[]): ProcessedStockData[] {
    // Sort by buy amount descending
    const sorted = data.sort((a, b) => b.buyAmount - a.buyAmount)

    // Take top 30 and add ranking
    const top30 = sorted.slice(0, DATA.TOP_STOCKS_COUNT).map((stock, index) => ({
      symbol: stock.symbol,
      name: stock.name,
      buyAmount: stock.buyAmount,
      buyShares: stock.buyShares,
      closePrice: stock.closePrice || 0,
      changePercent: stock.changePercent || 0,
      rank: index + 1,
    }))

    return top30
  }

  /**
   * Get a random user agent to avoid blocking
   */
  private getRandomUserAgent(): string {
    return CRAWLER.USER_AGENTS[
      Math.floor(Math.random() * CRAWLER.USER_AGENTS.length)
    ]
  }

  /**
   * Sleep utility function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export default new CrawlerService()
