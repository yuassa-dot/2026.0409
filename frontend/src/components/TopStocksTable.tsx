import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchTop30 } from '@/services/api'
import type { Stock } from '@/types/stock'

export default function TopStocksTable() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStocks()
  }, [])

  const loadStocks = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchTop30()
      setStocks(data)
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p>错误: {error}</p>
        <button
          onClick={loadStocks}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          重试
        </button>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold">排名</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">代码</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">名称</th>
            <th className="px-6 py-3 text-right text-sm font-semibold">
              买超金额 (百万)
            </th>
            <th className="px-6 py-3 text-right text-sm font-semibold">
              收盘价
            </th>
            <th className="px-6 py-3 text-right text-sm font-semibold">
              涨跌幅
            </th>
            <th className="px-6 py-3 text-center text-sm font-semibold">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr
              key={stock.symbol}
              className="border-b hover:bg-gray-50 transition"
            >
              <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                {stock.rank}
              </td>
              <td className="px-6 py-4 text-sm font-mono text-gray-600">
                {stock.symbol}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">{stock.name}</td>
              <td className="px-6 py-4 text-sm text-right text-gray-900">
                {(stock.buyAmount / 1000000).toFixed(1)}
              </td>
              <td className="px-6 py-4 text-sm text-right text-gray-900">
                NT${stock.closePrice?.toFixed(2)}
              </td>
              <td
                className={`px-6 py-4 text-sm text-right font-semibold ${
                  stock.changePercent && stock.changePercent > 0
                    ? 'text-green-600'
                    : stock.changePercent && stock.changePercent < 0
                      ? 'text-red-600'
                      : 'text-gray-600'
                }`}
              >
                {stock.changePercent ? stock.changePercent.toFixed(2) : '-'}%
              </td>
              <td className="px-6 py-4 text-sm text-center">
                <Link
                  to={`/stock/${stock.symbol}`}
                  className="text-blue-600 hover:text-blue-800 transition"
                >
                  详情
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {stocks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          暂无数据
        </div>
      )}
    </div>
  )
}
