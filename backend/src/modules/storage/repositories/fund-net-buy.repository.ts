import { queryAll, queryOne, execute } from '@/config/database'
import { FundNetBuyData } from '@/common/types'
import { logger } from '@/common/utils/logger'
import { format } from 'date-fns'

class FundNetBuyRepository {
  /**
   * Save fund net buy data for a given date
   */
  async saveBatch(data: FundNetBuyData[]): Promise<number> {
    try {
      const values = data
        .map((item) => {
          const date = format(item.date, 'yyyy-MM-dd')
          return `(
            '${date}',
            ${item.stockId || 'NULL'},
            '${item.symbol}',
            '${this.escapeSql(item.name)}',
            ${item.buyAmount || 0},
            ${item.buyShares || 0},
            ${item.sellAmount || 0},
            ${item.sellShares || 0},
            ${item.netBuyAmount || item.buyAmount || 0},
            ${item.openPrice || 'NULL'},
            ${item.closePrice || 'NULL'},
            ${item.highPrice || 'NULL'},
            ${item.lowPrice || 'NULL'},
            ${item.changePercent || 'NULL'},
            ${item.changeAmount || 'NULL'},
            ${item.rank || 'NULL'},
            ${item.volume || 'NULL'},
            ${item.turnover || 'NULL'}
          )`
        })
        .join(',')

      const sql = `
        INSERT INTO fund_net_buy (
          date, stock_id, symbol, name, buy_amount, buy_shares,
          sell_amount, sell_shares, net_buy_amount, open_price,
          close_price, high_price, low_price, change_percent,
          change_amount, rank, volume, turnover
        ) VALUES ${values}
        ON CONFLICT (date, symbol) DO UPDATE SET
          buy_amount = EXCLUDED.buy_amount,
          buy_shares = EXCLUDED.buy_shares,
          sell_amount = EXCLUDED.sell_amount,
          sell_shares = EXCLUDED.sell_shares,
          net_buy_amount = EXCLUDED.net_buy_amount,
          close_price = EXCLUDED.close_price,
          change_percent = EXCLUDED.change_percent,
          change_amount = EXCLUDED.change_amount,
          rank = EXCLUDED.rank,
          volume = EXCLUDED.volume,
          turnover = EXCLUDED.turnover,
          updated_at = CURRENT_TIMESTAMP
      `

      const result = await execute(sql)
      logger.info(`Saved ${result} fund net buy records`)
      return result
    } catch (error) {
      logger.error('Failed to save fund net buy data:', error)
      throw error
    }
  }

  /**
   * Get top 30 stocks for a given date
   */
  async getTop30(date: string): Promise<FundNetBuyData[]> {
    try {
      const sql = `
        SELECT *
        FROM fund_net_buy
        WHERE date = $1 AND rank <= 30
        ORDER BY rank ASC
      `

      return await queryAll(sql, [date])
    } catch (error) {
      logger.error('Failed to get top 30 stocks:', error)
      throw error
    }
  }

  /**
   * Get stock details by symbol and date
   */
  async getStockBySymbol(
    symbol: string,
    date: string
  ): Promise<FundNetBuyData | null> {
    try {
      const sql = `
        SELECT *
        FROM fund_net_buy
        WHERE symbol = $1 AND date = $2
        LIMIT 1
      `

      return await queryOne(sql, [symbol, date])
    } catch (error) {
      logger.error(`Failed to get stock ${symbol}:`, error)
      throw error
    }
  }

  /**
   * Get latest data for a symbol
   */
  async getLatestBySymbol(symbol: string): Promise<FundNetBuyData | null> {
    try {
      const sql = `
        SELECT *
        FROM fund_net_buy
        WHERE symbol = $1
        ORDER BY date DESC
        LIMIT 1
      `

      return await queryOne(sql, [symbol])
    } catch (error) {
      logger.error(`Failed to get latest data for ${symbol}:`, error)
      throw error
    }
  }

  /**
   * Get historical data for a symbol
   */
  async getHistory(
    symbol: string,
    days: number = 30
  ): Promise<FundNetBuyData[]> {
    try {
      const sql = `
        SELECT *
        FROM fund_net_buy
        WHERE symbol = $1
        AND date >= CURRENT_DATE - INTERVAL '${days} days'
        ORDER BY date DESC
      `

      return await queryAll(sql, [symbol])
    } catch (error) {
      logger.error(`Failed to get history for ${symbol}:`, error)
      throw error
    }
  }

  /**
   * Get latest data for all top 30 stocks
   */
  async getLatestTop30(): Promise<FundNetBuyData[]> {
    try {
      const sql = `
        WITH latest_date AS (
          SELECT DISTINCT date
          FROM fund_net_buy
          ORDER BY date DESC
          LIMIT 1
        )
        SELECT *
        FROM fund_net_buy
        WHERE date = (SELECT date FROM latest_date)
        AND rank <= 30
        ORDER BY rank ASC
      `

      return await queryAll(sql)
    } catch (error) {
      logger.error('Failed to get latest top 30:', error)
      throw error
    }
  }

  /**
   * Get statistics for top 30
   */
  async getStatistics(date: string): Promise<any> {
    try {
      const sql = `
        SELECT
          COUNT(*) as total_stocks,
          SUM(buy_amount) as total_buy_amount,
          AVG(buy_amount) as avg_buy_amount,
          AVG(change_percent) as avg_change_percent,
          MAX(change_percent) as max_change_percent,
          MIN(change_percent) as min_change_percent
        FROM fund_net_buy
        WHERE date = $1 AND rank <= 30
      `

      return await queryOne(sql, [date])
    } catch (error) {
      logger.error('Failed to get statistics:', error)
      throw error
    }
  }

  /**
   * Delete old data (retention policy)
   */
  async deleteOldData(retentionDays: number = 90): Promise<number> {
    try {
      const sql = `
        DELETE FROM fund_net_buy
        WHERE date < CURRENT_DATE - INTERVAL '${retentionDays} days'
      `

      return await execute(sql)
    } catch (error) {
      logger.error('Failed to delete old data:', error)
      throw error
    }
  }

  /**
   * Escape SQL strings to prevent injection
   */
  private escapeSql(str: string): string {
    return str.replace(/'/g, "''")
  }
}

export default new FundNetBuyRepository()
