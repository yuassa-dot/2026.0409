import React, { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { FundNetBuyData } from '../types/stock'

interface ChartsProps {
  data?: FundNetBuyData[]
  title?: string
}

interface IndustryData {
  name: string
  value: number
}

const COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7c7c',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7c7c',
  '#0088fe',
  '#00c49f',
]

export const Charts: React.FC<ChartsProps> = ({ data = [], title = 'Data Analysis' }) => {
  const [industryData, setIndustryData] = useState<IndustryData[]>([])
  const [priceChangeData, setPriceChangeData] = useState<any[]>([])
  const [buyAmountData, setBuyAmountData] = useState<any[]>([])

  useEffect(() => {
    if (!data || data.length === 0) return

    // Process industry distribution
    const industryMap: { [key: string]: number } = {}
    data.forEach((stock) => {
      const industry = stock.industry || 'Unknown'
      industryMap[industry] = (industryMap[industry] || 0) + 1
    })

    const industryList = Object.entries(industryMap).map(([name, value]) => ({
      name,
      value,
    }))
    setIndustryData(industryList)

    // Process price change data (top 10)
    const topByPrice = [...data]
      .sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0))
      .slice(0, 10)
    setPriceChangeData(
      topByPrice.map((stock) => ({
        name: stock.symbol,
        change: parseFloat((stock.changePercent || 0).toFixed(2)),
      }))
    )

    // Process buy amount data (top 10)
    const topByBuyAmount = [...data]
      .sort((a, b) => (b.buyAmount || 0) - (a.buyAmount || 0))
      .slice(0, 10)
    setBuyAmountData(
      topByBuyAmount.map((stock) => ({
        name: stock.symbol,
        amount: Math.round((stock.buyAmount || 0) / 1000000), // Convert to millions
      }))
    )
  }, [data])

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-8 text-gray-800">{title}</h2>

      {data.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No data available</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Industry Distribution Pie Chart */}
          {industryData.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                Industry Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={industryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {industryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top 10 by Price Change */}
          {priceChangeData.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                Top 10 Stocks by Price Change %
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priceChangeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`${value.toFixed(2)}%`, 'Change %']}
                  />
                  <Bar dataKey="change" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top 10 by Buy Amount */}
          {buyAmountData.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                Top 10 Stocks by Buy Amount (Millions NTD)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={buyAmountData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`${value.toLocaleString()} M`, 'Amount']}
                  />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Summary Statistics */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Summary Statistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded border border-gray-200 p-4">
                <p className="text-gray-600 text-sm">Total Stocks</p>
                <p className="text-2xl font-bold text-gray-800">{data.length}</p>
              </div>
              <div className="bg-white rounded border border-gray-200 p-4">
                <p className="text-gray-600 text-sm">Total Buy Amount</p>
                <p className="text-2xl font-bold text-gray-800">
                  NT${(
                    data.reduce((sum, s) => sum + (s.buyAmount || 0), 0) / 1000000
                  ).toFixed(1)}M
                </p>
              </div>
              <div className="bg-white rounded border border-gray-200 p-4">
                <p className="text-gray-600 text-sm">Avg Buy Amount</p>
                <p className="text-2xl font-bold text-gray-800">
                  NT${(
                    data.reduce((sum, s) => sum + (s.buyAmount || 0), 0) /
                      data.length /
                      1000000
                  ).toFixed(1)}M
                </p>
              </div>
              <div className="bg-white rounded border border-gray-200 p-4">
                <p className="text-gray-600 text-sm">Avg Change %</p>
                <p
                  className={`text-2xl font-bold ${
                    (data.reduce((sum, s) => sum + (s.changePercent || 0), 0) /
                      data.length) >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {(
                    data.reduce((sum, s) => sum + (s.changePercent || 0), 0) /
                    data.length
                  ).toFixed(2)}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Charts
