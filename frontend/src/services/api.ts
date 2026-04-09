import axios from 'axios'
import type { Stock, ApiResponse } from '@/types/stock'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API error:', error)
    throw error
  }
)

/**
 * Get top 30 stocks for latest date
 */
export async function fetchTop30(): Promise<Stock[]> {
  try {
    const response = await api.get<ApiResponse<Stock[]>>('/stocks/top-30')
    return response.data.data || []
  } catch (error) {
    console.error('Failed to fetch top 30 stocks:', error)
    throw error
  }
}

/**
 * Get top 30 stocks for specific date
 */
export async function fetchTop30ByDate(date: string): Promise<Stock[]> {
  try {
    const response = await api.get<ApiResponse<Stock[]>>(
      `/stocks/top-30/${date}`
    )
    return response.data.data || []
  } catch (error) {
    console.error('Failed to fetch top 30 stocks by date:', error)
    throw error
  }
}

/**
 * Get stock detail by symbol
 */
export async function fetchStockDetail(symbol: string): Promise<Stock | null> {
  try {
    const response = await api.get<ApiResponse<Stock>>(
      `/stocks/detail/${symbol}`
    )
    return response.data.data || null
  } catch (error) {
    console.error('Failed to fetch stock detail:', error)
    throw error
  }
}

/**
 * Get stock history
 */
export async function fetchStockHistory(
  symbol: string,
  days: number = 30
): Promise<Stock[]> {
  try {
    const response = await api.get<ApiResponse<Stock[]>>(
      `/stocks/history/${symbol}`,
      { params: { days } }
    )
    return response.data.data || []
  } catch (error) {
    console.error('Failed to fetch stock history:', error)
    throw error
  }
}

/**
 * Get statistics
 */
export async function fetchStatistics(date?: string): Promise<any> {
  try {
    const response = await api.get<ApiResponse>('/stocks/statistics', {
      params: date ? { date } : undefined,
    })
    return response.data.data || null
  } catch (error) {
    console.error('Failed to fetch statistics:', error)
    throw error
  }
}

/**
 * Export to CSV
 */
export async function exportToCSV(date?: string): Promise<void> {
  try {
    const response = await api.get('/stocks/export/csv', {
      params: date ? { date } : undefined,
      responseType: 'blob',
    })

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `top30_${date || 'latest'}.csv`)
    document.body.appendChild(link)
    link.click()
    link.parentNode?.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to export CSV:', error)
    throw error
  }
}

/**
 * List CSV files
 */
export async function listCSVFiles(): Promise<any[]> {
  try {
    const response = await api.get<ApiResponse>('/stocks/export/list')
    return response.data.data || []
  } catch (error) {
    console.error('Failed to list CSV files:', error)
    throw error
  }
}
