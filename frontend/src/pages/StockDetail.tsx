import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchStockDetail, fetchStockHistory } from '@/services/api'
import type { Stock } from '@/types/stock'

export default function StockDetail() {
  const { symbol } = useParams<{ symbol: string }>()
  const [stock, setStock] = useState<Stock | null>(null)
  const [history, setHistory] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (symbol) {
      loadStockData()
    }
  }, [symbol])

  const loadStockData = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!symbol) return

      const [stockData, historyData] = await Promise.all([
        fetchStockDetail(symbol),
        fetchStockHistory(symbol, 30),
      ])

      setStock(stockData)
      setHistory(historyData)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">加载中...</div>
      </div>
    )
  }

  if (error || !stock) {
    return (
      <div className="space-y-4">
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-800 transition"
        >
          ← 返回首页
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p>错误: {error || '未找到该股票'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link to="/" className="text-blue-600 hover:text-blue-800 transition">
        ← 返回首页
      </Link>

      {/* Stock header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{stock.name}</h1>
            <p className="text-gray-600 font-mono text-lg">{stock.symbol}</p>
          </div>
          <div
            className={`text-2xl font-bold ${
              stock.changePercent && stock.changePercent > 0
                ? 'text-green-600'
                : stock.changePercent && stock.changePercent < 0
                  ? 'text-red-600'
                  : 'text-gray-600'
            }`}
          >
            {stock.changePercent ? stock.changePercent.toFixed(2) : '-'}%
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded p-4">
            <div className="text-gray-600 text-sm mb-1">收盘价</div>
            <div className="text-xl font-bold">
              NT${stock.closePrice?.toFixed(2)}
            </div>
          </div>
          <div className="bg-gray-50 rounded p-4">
            <div className="text-gray-600 text-sm mb-1">买超金额</div>
            <div className="text-xl font-bold">
              {(stock.buyAmount / 1000000).toFixed(1)}M
            </div>
          </div>
          <div className="bg-gray-50 rounded p-4">
            <div className="text-gray-600 text-sm mb-1">买超张数</div>
            <div className="text-xl font-bold">
              {(stock.buyShares / 1000).toFixed(0)}K
            </div>
          </div>
          <div className="bg-gray-50 rounded p-4">
            <div className="text-gray-600 text-sm mb-1">成交量</div>
            <div className="text-xl font-bold">
              {stock.volume ? (stock.volume / 1000).toFixed(0) : '-'}K
            </div>
          </div>
        </div>
      </div>

      {/* Price details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">价格信息</h2>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="text-gray-600 text-sm">最高价</div>
            <div className="text-lg font-semibold">
              NT${stock.highPrice?.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-gray-600 text-sm">最低价</div>
            <div className="text-lg font-semibold">
              NT${stock.lowPrice?.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-gray-600 text-sm">开盘价</div>
            <div className="text-lg font-semibold">
              NT${stock.openPrice?.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-gray-600 text-sm">涨跌金额</div>
            <div
              className={`text-lg font-semibold ${
                stock.changePercent && stock.changePercent > 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {stock.changePercent && stock.changePercent > 0 ? '+' : ''}
              {stock.changePercent?.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* History table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">30天历史数据</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-2 text-left">日期</th>
                <th className="px-4 py-2 text-right">买超金额</th>
                <th className="px-4 py-2 text-right">收盘价</th>
                <th className="px-4 py-2 text-right">涨跌幅</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{h.date}</td>
                  <td className="px-4 py-2 text-right">
                    {(h.buyAmount / 1000000).toFixed(1)}M
                  </td>
                  <td className="px-4 py-2 text-right">
                    NT${h.closePrice?.toFixed(2)}
                  </td>
                  <td
                    className={`px-4 py-2 text-right font-semibold ${
                      h.changePercent && h.changePercent > 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {h.changePercent?.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {history.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              暂无历史数据
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
