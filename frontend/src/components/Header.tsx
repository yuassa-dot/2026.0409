import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-blue-600">
              🎯 台股投信买超筛选
            </h1>
          </Link>
          <nav className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-blue-600 transition"
            >
              首页
            </Link>
            <Link
              to="/statistics"
              className="text-gray-600 hover:text-blue-600 transition"
            >
              统计分析
            </Link>
            <Link
              to="/subscriptions"
              className="text-gray-600 hover:text-blue-600 transition"
            >
              订阅管理
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600 transition"
            >
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
