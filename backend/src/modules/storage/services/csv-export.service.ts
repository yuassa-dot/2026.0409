import fs from 'fs'
import path from 'path'
import { Parser } from 'json2csv'
import { format } from 'date-fns'
import { logger } from '@/common/utils/logger'
import { FundNetBuyData } from '@/common/types'
import { DATA } from '@/common/constants'

class CsvExportService {
  private dataDir = path.join(process.cwd(), 'data', 'csv')

  constructor() {
    // Create data directory if it doesn't exist
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true })
    }
  }

  /**
   * Export fund net buy data to CSV
   */
  async exportToCSV(
    data: FundNetBuyData[],
    date: string
  ): Promise<{ filePath: string; fileSize: number }> {
    try {
      const fileName = DATA.CSV_FILENAME(date)
      const filePath = path.join(this.dataDir, fileName)

      // Prepare CSV data
      const csvData = this.prepareCSVData(data)

      // Convert to CSV format
      const parser = new Parser({
        fields: [
          'rank',
          'symbol',
          'name',
          'buyAmount',
          'buyShares',
          'closePrice',
          'changePercent',
          'openPrice',
          'highPrice',
          'lowPrice',
          'volume',
          'turnover',
        ],
        header: true,
        flatten: false,
      })

      const csv = parser.parse(csvData)

      // Write to file
      fs.writeFileSync(filePath, csv, 'utf-8')

      const fileSize = fs.statSync(filePath).size

      logger.info(
        `Exported ${csvData.length} records to ${fileName} (${fileSize} bytes)`
      )

      return { filePath, fileSize }
    } catch (error) {
      logger.error('CSV export error:', error)
      throw new Error('Failed to export data to CSV')
    }
  }

  /**
   * Get all CSV files
   */
  async listCSVFiles(): Promise<
    Array<{
      fileName: string
      filePath: string
      fileSize: number
      createdAt: Date
    }>
  > {
    try {
      const files = fs.readdirSync(this.dataDir)

      return files
        .filter((file) => file.endsWith('.csv'))
        .map((file) => {
          const filePath = path.join(this.dataDir, file)
          const stats = fs.statSync(filePath)

          return {
            fileName: file,
            filePath,
            fileSize: stats.size,
            createdAt: stats.birthtime,
          }
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } catch (error) {
      logger.error('Failed to list CSV files:', error)
      return []
    }
  }

  /**
   * Get CSV file for download
   */
  getCSVFile(fileName: string): string | null {
    try {
      const filePath = path.join(this.dataDir, fileName)

      // Security: prevent directory traversal
      if (!filePath.startsWith(this.dataDir)) {
        logger.warn(`Attempted to access file outside data directory: ${fileName}`)
        return null
      }

      if (!fs.existsSync(filePath)) {
        logger.warn(`CSV file not found: ${fileName}`)
        return null
      }

      return filePath
    } catch (error) {
      logger.error('Failed to get CSV file:', error)
      return null
    }
  }

  /**
   * Delete old CSV files (retention policy)
   */
  async deleteOldCSVFiles(retentionDays: number = 90): Promise<number> {
    try {
      const files = fs.readdirSync(this.dataDir)
      const now = Date.now()
      let deletedCount = 0

      for (const file of files) {
        if (!file.endsWith('.csv')) continue

        const filePath = path.join(this.dataDir, file)
        const stats = fs.statSync(filePath)
        const ageInDays = (now - stats.birthtime.getTime()) / (1000 * 60 * 60 * 24)

        if (ageInDays > retentionDays) {
          fs.unlinkSync(filePath)
          deletedCount++
          logger.info(`Deleted old CSV file: ${file}`)
        }
      }

      logger.info(`Deleted ${deletedCount} old CSV files`)
      return deletedCount
    } catch (error) {
      logger.error('Failed to delete old CSV files:', error)
      return 0
    }
  }

  /**
   * Prepare data for CSV export
   */
  private prepareCSVData(data: FundNetBuyData[]): any[] {
    return data.map((item) => ({
      rank: item.rank || '-',
      symbol: item.symbol,
      name: item.name,
      buyAmount: this.formatNumber(item.buyAmount),
      buyShares: this.formatNumber(item.buyShares),
      closePrice: item.closePrice?.toFixed(2) || '-',
      changePercent: item.changePercent?.toFixed(2) || '-',
      openPrice: item.openPrice?.toFixed(2) || '-',
      highPrice: item.highPrice?.toFixed(2) || '-',
      lowPrice: item.lowPrice?.toFixed(2) || '-',
      volume: this.formatNumber(item.volume),
      turnover: item.turnover?.toFixed(0) || '-',
    }))
  }

  /**
   * Format large numbers with commas
   */
  private formatNumber(num: number | undefined): string {
    if (!num) return '-'
    return num.toLocaleString('zh-TW')
  }
}

export default new CsvExportService()
