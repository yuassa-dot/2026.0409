export interface Stock {
  id?: number
  date?: string
  symbol: string
  name: string
  buyAmount: number
  buyShares: number
  closePrice?: number
  changePercent?: number
  openPrice?: number
  highPrice?: number
  lowPrice?: number
  volume?: number
  turnover?: number
  rank?: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  timestamp: string
}

export interface PaginatedResponse<T = any> {
  success: boolean
  data: T[]
  count?: number
  pagination?: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
  timestamp: string
}
