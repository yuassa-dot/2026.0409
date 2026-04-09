export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-4">关于我们</h3>
            <p className="text-gray-400 text-sm">
              提供台股投信买超数据的实时筛选和分析
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-4">数据来源</h3>
            <p className="text-gray-400 text-sm">
              数据来自理财宝、台湾证交所等公开数据源
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-4">免责声明</h3>
            <p className="text-gray-400 text-sm">
              本站仅供参考，不构成投资建议
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 text-center text-gray-400 text-sm">
          <p>© 2024 Taiwan Stock Fund Screening. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
