import TopStocksTable from '@/components/TopStocksTable'
import { exportToCSV } from '@/services/api'
import { useState } from 'react'

export default function Home() {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    try {
      setExporting(true)
      await exportToCSV()
    } catch (error) {
      alert('导出失败，请稍后重试')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">台股投信买超筛选系统</h1>
        <p className="text-blue-100 mb-6">
          每日自动筛选投信买超最大的前30名个股
        </p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-700 rounded p-4">
            <div className="text-2xl font-bold">30</div>
            <div className="text-blue-100 text-sm">监控个股</div>
          </div>
          <div className="bg-blue-700 rounded p-4">
            <div className="text-2xl font-bold">实时</div>
            <div className="text-blue-100 text-sm">数据更新</div>
          </div>
          <div className="bg-blue-700 rounded p-4">
            <div className="text-2xl font-bold">全免费</div>
            <div className="text-blue-100 text-sm">无收费</div>
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="bg-white text-blue-600 px-6 py-2 rounded font-semibold hover:bg-gray-100 transition disabled:opacity-50"
        >
          {exporting ? '导出中...' : '导出 CSV'}
        </button>
      </div>

      {/* Info section */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">📊 数据说明</h2>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• 数据来源：理财宝、台湾证交所</li>
            <li>• 更新频率：每个交易日8:30、13:00、15:00</li>
            <li>• 显示内容：投信净买超排名前30个股</li>
            <li>• 包含信息：代码、名称、买超金额、股价、涨跌幅</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">💡 使用提示</h2>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• 点击表格中的"详情"查看个股历史数据</li>
            <li>• 支持导出CSV文件进行数据分析</li>
            <li>• 数据仅供参考，不构成投资建议</li>
            <li>• 建议结合其他指标综合分析</li>
          </ul>
        </div>
      </div>

      {/* Table section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">投信买超 Top 30</h2>
        <TopStocksTable />
      </div>

      {/* Footer info */}
      <div className="bg-gray-100 rounded-lg p-6 text-center text-gray-600 text-sm">
        <p>最后更新时间将显示在此处 | 数据实时更新中...</p>
      </div>
    </div>
  )
}
