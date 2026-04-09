import * as cheerio from 'cheerio'
import { logger } from '@/common/utils/logger'
import { RawCrawlData } from '@/common/types'

class ParserService {
  /**
   * Parse HTML content and extract fund net buy data
   */
  async parseHtml(htmlContent: string): Promise<RawCrawlData[]> {
    try {
      const $ = cheerio.load(htmlContent)
      const data: RawCrawlData[] = []

      // Parse table rows - adjust selectors based on actual website structure
      // This is a generic example; actual selectors will depend on the website
      const rows = $('table tbody tr, .data-table tr')

      rows.each((index, element) => {
        try {
          const row = $(element)

          // Extract columns - adjust selectors based on actual table structure
          const symbol = row.find('td:eq(0)').text().trim()
          const name = row.find('td:eq(1)').text().trim()
          const buyAmountStr = row.find('td:eq(2)').text().trim()
          const buySharesStr = row.find('td:eq(3)').text().trim()
          const priceStr = row.find('td:eq(4)').text().trim()
          const changeStr = row.find('td:eq(5)').text().trim()

          // Validate and parse data
          if (!symbol || !name) {
            return // Skip invalid rows
          }

          const buyAmount = this.parseNumber(buyAmountStr)
          const buyShares = this.parseNumber(buySharesStr)
          const closePrice = this.parseFloat(priceStr)
          const changePercent = this.parseFloat(changeStr)

          if (buyAmount && buyShares) {
            data.push({
              symbol,
              name,
              buyAmount,
              buyShares,
              closePrice: closePrice || undefined,
              changePercent: changePercent || undefined,
            })
          }
        } catch (error) {
          logger.debug(`Failed to parse row ${index}:`, error)
          // Continue with next row
        }
      })

      logger.info(`Parsed ${data.length} rows from HTML`)
      return this.validateAndCleanData(data)
    } catch (error) {
      logger.error('HTML parsing error:', error)
      throw new Error('Failed to parse HTML content')
    }
  }

  /**
   * Parse string to number (handling various formats)
   */
  private parseNumber(str: string): number | null {
    if (!str) return null

    // Remove common formatting characters
    const cleaned = str
      .replace(/[,\s]/g, '') // Remove commas and spaces
      .replace(/千$/g, '000') // Handle 千 (thousand)
      .replace(/百萬$/g, '000000') // Handle 百萬 (million)
      .replace(/億$/g, '00000000') // Handle 億 (hundred million)

    const parsed = parseInt(cleaned, 10)
    return !isNaN(parsed) ? parsed : null
  }

  /**
   * Parse string to float (handling various formats)
   */
  private parseFloat(str: string): number | null {
    if (!str) return null

    const cleaned = str.replace(/[,\s]/g, '')
    const parsed = parseFloat(cleaned)
    return !isNaN(parsed) ? parsed : null
  }

  /**
   * Validate and clean data
   */
  private validateAndCleanData(data: RawCrawlData[]): RawCrawlData[] {
    return data
      .filter((item) => {
        // Remove duplicates
        return item.symbol && item.name && item.buyAmount > 0
      })
      .map((item) => ({
        ...item,
        symbol: item.symbol.trim().toUpperCase(),
        name: item.name.trim(),
      }))
      .filter(
        (item, index, self) =>
          self.findIndex((x) => x.symbol === item.symbol) === index
      ) // Remove duplicates by symbol
  }

  /**
   * Extract data from JSON response (if source provides JSON API)
   */
  async parseJsonResponse(jsonData: any): Promise<RawCrawlData[]> {
    try {
      if (!Array.isArray(jsonData)) {
        logger.warn('Expected array in JSON response')
        return []
      }

      const data = jsonData
        .map((item: any) => ({
          symbol: item.symbol || item.code || '',
          name: item.name || item.stockName || '',
          buyAmount: parseInt(item.buyAmount || item.netBuy || 0, 10),
          buyShares: parseInt(item.buyShares || item.netBuyShares || 0, 10),
          closePrice: parseFloat(item.closePrice || item.price || 0),
          changePercent: parseFloat(item.changePercent || item.change || 0),
        }))
        .filter((item: RawCrawlData) => item.symbol && item.buyAmount > 0)

      logger.info(`Parsed ${data.length} items from JSON`)
      return data
    } catch (error) {
      logger.error('JSON parsing error:', error)
      throw new Error('Failed to parse JSON response')
    }
  }
}

export default new ParserService()
