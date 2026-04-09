import { Request, Response, NextFunction } from 'express'
import { logger } from '@/common/utils/logger'
import { HTTP_STATUS, API_MESSAGES } from '@/common/constants'
import fundNetBuyRepository from '@/modules/storage/repositories/fund-net-buy.repository'
import csvExportService from '@/modules/storage/services/csv-export.service'
import { format } from 'date-fns'

class StocksController {
  /**
   * Get top 30 stocks for the latest date
   */
  async getTop30(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stocks = await fundNetBuyRepository.getLatestTop30()

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: stocks,
        count: stocks.length,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      logger.error('Failed to get top 30 stocks:', error)
      next(error)
    }
  }

  /**
   * Get top 30 stocks for a specific date
   */
  async getTop30ByDate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { date } = req.params

      if (!date) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Date parameter is required',
          timestamp: new Date().toISOString(),
        })
      }

      const stocks = await fundNetBuyRepository.getTop30(date)

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: stocks,
        count: stocks.length,
        date,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      logger.error('Failed to get top 30 stocks by date:', error)
      next(error)
    }
  }

  /**
   * Get stock details by symbol
   */
  async getStockDetail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { symbol } = req.params

      if (!symbol) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Symbol parameter is required',
          timestamp: new Date().toISOString(),
        })
      }

      const stock = await fundNetBuyRepository.getLatestBySymbol(symbol)

      if (!stock) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: API_MESSAGES.NOT_FOUND,
          timestamp: new Date().toISOString(),
        })
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: stock,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      logger.error('Failed to get stock detail:', error)
      next(error)
    }
  }

  /**
   * Get stock history
   */
  async getStockHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { symbol } = req.params
      const { days = 30 } = req.query

      if (!symbol) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Symbol parameter is required',
          timestamp: new Date().toISOString(),
        })
      }

      const numDays = parseInt(String(days), 10)
      const history = await fundNetBuyRepository.getHistory(symbol, numDays)

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: history,
        count: history.length,
        symbol,
        days: numDays,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      logger.error('Failed to get stock history:', error)
      next(error)
    }
  }

  /**
   * Get statistics for top 30
   */
  async getStatistics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { date } = req.query
      const dateStr = date ? String(date) : format(new Date(), 'yyyy-MM-dd')

      const stats = await fundNetBuyRepository.getStatistics(dateStr)

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          date: dateStr,
          ...stats,
        },
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      logger.error('Failed to get statistics:', error)
      next(error)
    }
  }

  /**
   * Export top 30 to CSV
   */
  async exportToCSV(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { date } = req.query
      const dateStr = date ? String(date) : format(new Date(), 'yyyy-MM-dd')

      const stocks = await fundNetBuyRepository.getTop30(dateStr)

      if (stocks.length === 0) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'No data found for the specified date',
          timestamp: new Date().toISOString(),
        })
      }

      const { filePath, fileSize } = await csvExportService.exportToCSV(
        stocks,
        dateStr
      )

      // Return file for download
      res.download(filePath, `top30_${dateStr}.csv`, (err) => {
        if (err) {
          logger.error('Failed to download CSV file:', err)
        }
      })
    } catch (error) {
      logger.error('Failed to export to CSV:', error)
      next(error)
    }
  }

  /**
   * List all CSV files
   */
  async listCSVFiles(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const files = await csvExportService.listCSVFiles()

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: files,
        count: files.length,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      logger.error('Failed to list CSV files:', error)
      next(error)
    }
  }

  /**
   * Get CSV file
   */
  async getCSVFile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { fileName } = req.params

      const filePath = csvExportService.getCSVFile(fileName)

      if (!filePath) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'CSV file not found',
          timestamp: new Date().toISOString(),
        })
      }

      res.download(filePath, fileName, (err) => {
        if (err) {
          logger.error('Failed to download CSV file:', err)
        }
      })
    } catch (error) {
      logger.error('Failed to get CSV file:', error)
      next(error)
    }
  }
}

export default new StocksController()
