import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import StockDetail from './pages/StockDetail'
import Statistics from './pages/Statistics'
import Subscriptions from './pages/Subscriptions'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stock/:symbol" element={<StockDetail />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
      </Routes>
    </Router>
  )
}

export default App
