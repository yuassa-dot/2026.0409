import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FundNetBuyData } from '../types/stock'
import Charts from '../components/Charts'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { api } from '../services/api'

interface StatisticsData {
  totalBuyAmount: number
  averageBuyAmount: number
  averageChangePercent: number
  topIndustry: string
  totalStocksCount: number
  data: FundNetBuyData[]
}

const Statistics: React.FC = () => {
  const navigate = useNavigate()
  const [statistics, setStatistics] = useState<StatisticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  useEffect(() => {
    fetchStatistics()
  }, [selectedDate])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch top 30 stocks
      const response = await api.get<any>('/stocks/top30')
      if (response.data && response.data.data) {
        const data = response.data.data

        // Calculate statistics
        const totalBuyAmount = data.reduce(
          (sum: number, stock: FundNetBuyData) => sum + (stock.buyAmount || 0),
          0
        )
        const averageBuyAmount = totalBuyAmount / data.length
        const averageChangePercent =
          data.reduce(
            (sum: number, stock: FundNetBuyData) =>
              sum + (stock.changePercent || 0),
            0
          ) / data.length

        // Find top industry
        const industryMap: { [key: string]: number } = {}
        data.forEach((stock: FundNetBuyData) => {
          const industry = stock.industry || 'Unknown'
          industryMap[industry] = (industryMap[industry] || 0) + (stock.buyAmount || 0)
        })

        const topIndustry =
          Object.entries(industryMap).reduce((prev, curr) =>
            curr[1] > prev[1] ? curr : prev
          )?.[0] || 'Unknown'

        setStatistics({
          totalBuyAmount,
          averageBuyAmount,
          averageChangePercent,
          topIndustry,
          totalStocksCount: data.length,
          data,
        })
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Fund Net Buy Statistics
          </h1>

          <div className="flex items-center gap-4">
            <label className="text-gray-700 font-medium">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : statistics ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Total Stocks</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {statistics.totalStocksCount}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">
                  Total Buy Amount
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  NT${(statistics.totalBuyAmount / 1000000).toFixed(1)}M
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">
                  Average Buy Amount
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  NT${(statistics.averageBuyAmount / 1000000).toFixed(1)}M
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium">
                  Average Change %
                </p>
                <p
                  className={`text-3xl font-bold mt-2 ${
                    statistics.averageChangePercent >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {statistics.averageChangePercent.toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Industry Information */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Top Performing Industry
              </h2>
              <p className="text-2xl font-semibold text-blue-600">
                {statistics.topIndustry}
              </p>
            </div>

            {/* Charts */}
            <Charts data={statistics.data} title="Market Analysis" />

            {/* Back Button */}
            <div className="mt-8">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Back to Home
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No data available</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default Statistics
