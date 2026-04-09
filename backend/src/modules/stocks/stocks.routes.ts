import { Router } from 'express'
import stocksController from './stocks.controller'

const router = Router()

// Get top 30 stocks (latest date)
router.get('/top-30', stocksController.getTop30.bind(stocksController))

// Get top 30 stocks for specific date
router.get('/top-30/:date', stocksController.getTop30ByDate.bind(stocksController))

// Get stock detail by symbol
router.get('/detail/:symbol', stocksController.getStockDetail.bind(stocksController))

// Get stock history
router.get('/history/:symbol', stocksController.getStockHistory.bind(stocksController))

// Get statistics
router.get('/statistics', stocksController.getStatistics.bind(stocksController))

// Export to CSV
router.get('/export/csv', stocksController.exportToCSV.bind(stocksController))

// List CSV files
router.get('/export/list', stocksController.listCSVFiles.bind(stocksController))

// Download CSV file
router.get('/export/download/:fileName', stocksController.getCSVFile.bind(stocksController))

export default router
