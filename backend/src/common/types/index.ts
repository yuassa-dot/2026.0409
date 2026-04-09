// Stock data types
export interface Stock {
  id?: number
  symbol: string
  name: string
  industry?: string
  marketCap?: number
  createdAt?: Date
  updatedAt?: Date
}

export interface FundNetBuyData {
  id?: number
  date: Date
  stockId?: number
  symbol: string
  name: string
  buyAmount: number
  buyShares: number
  sellAmount?: number
  sellShares?: number
  netBuyAmount?: number
  openPrice?: number
  closePrice?: number
  highPrice?: number
  lowPrice?: number
  changePercent?: number
  changeAmount?: number
  rank?: number
  volume?: number
  turnover?: number
  createdAt?: Date
  updatedAt?: Date
}

export interface PriceHistory {
  id?: number
  stockId: number
  date: Date
  openPrice: number
  closePrice: number
  highPrice: number
  lowPrice: number
  changePercent: number
  volume: number
  turnover?: number
  createdAt?: Date
}

export interface UserSubscription {
  id?: number
  email?: string
  phone?: string
  symbol?: string
  subscriptionType?: 'all' | 'symbol'
  thresholdChange?: number
  enabled?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface CrawlerLog {
  id?: number
  date: Date
  status: 'success' | 'failed'
  message: string
  itemsCount?: number
  errorMessage?: string
  executionTimeMs?: number
  createdAt?: Date
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: any
  timestamp: string
}

export interface PaginatedResponse<T = any> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
  timestamp: string
}

// Crawler types
export interface RawCrawlData {
  symbol: string
  name: string
  buyAmount: number
  buyShares: number
  closePrice?: number
  changePercent?: number
}

export interface ProcessedStockData {
  symbol: string
  name: string
  buyAmount: number
  buyShares: number
  rank: number
  closePrice: number
  changePercent: number
}

// Statistics types
export interface Statistics {
  totalBuyAmount: number
  averageBuyAmount: number
  averageChangePercent: number
  topIndustry: string
  totalStocksCount: number
  data: FundNetBuyData[]
}
