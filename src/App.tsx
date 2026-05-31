import { useState, useEffect } from 'react'
import { Star, TrendingUp, TrendingDown, AlertCircle, Loader2, Menu, X } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import axios from 'axios'

interface Pair {
  id: string
  symbol: string
  name: string
  type: 'crypto' | 'forex' | 'cfd'
  price: number
  change: number
  changePercent: number
  high24h: number
  low24h: number
  volume: number
}

interface ChartDataPoint {
  time: string
  close: number
}

interface NewsItem {
  id: string
  title: string
  description: string
  source: string
}

const DEFAULT_PAIRS: Pair[] = [
  {
    id: 'bitcoin',
    symbol: 'BTC/USD',
    name: 'Bitcoin',
    type: 'crypto',
    price: 67500,
    change: 2500,
    changePercent: 3.85,
    high24h: 68200,
    low24h: 65800,
    volume: 35e9,
  },
  {
    id: 'ethereum',
    symbol: 'ETH/USD',
    name: 'Ethereum',
    type: 'crypto',
    price: 3500,
    change: 150,
    changePercent: 4.48,
    high24h: 3600,
    low24h: 3350,
    volume: 18e9,
  },
  {
    id: 'eurusd',
    symbol: 'EUR/USD',
    name: 'Euro/Dollar',
    type: 'forex',
    price: 1.0950,
    change: 0.005,
    changePercent: 0.46,
    high24h: 1.102,
    low24h: 1.089,
    volume: 380e9,
  },
  {
    id: 'gbpusd',
    symbol: 'GBP/USD',
    name: 'Pound/Dollar',
    type: 'forex',
    price: 1.275,
    change: 0.008,
    changePercent: 0.63,
    high24h: 1.285,
    low24h: 1.265,
    volume: 210e9,
  },
  {
    id: 'sp500',
    symbol: 'SPX',
    name: 'S&P 500',
    type: 'cfd',
    price: 5420.5,
    change: 85.3,
    changePercent: 1.6,
    high24h: 5450,
    low24h: 5350,
    volume: 2.5e9,
  },
]

export default function App() {
  const [pairs, setPairs] = useState<Pair[]>(DEFAULT_PAIRS)
  const [selectedPair, setSelectedPair] = useState<Pair | null>(DEFAULT_PAIRS[0])
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [fearGreedIndex, setFearGreedIndex] = useState(65)
  const [loadingFearGreed, setLoadingFearGreed] = useState(false)
  const [news, setNews] = useState<NewsItem[]>([])
  const [loadingNews, setLoadingNews] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Fetch Fear & Greed Index
  useEffect(() => {
    const fetchFearGreed = async () => {
      try {
        setLoadingFearGreed(true)
        const response = await axios.get('https://api.alternative.me/fng/?limit=1')
        const data = response.data.data[0]
        setFearGreedIndex(parseInt(data.value))
      } catch (error) {
        console.error('Error fetching fear & greed:', error)
      } finally {
        setLoadingFearGreed(false)
      }
    }

    fetchFearGreed()
    const interval = setInterval(fetchFearGreed, 60000)
    return () => clearInterval(interval)
  }, [])

  // Fetch News
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoadingNews(true)
        const response = await axios.get('https://api.coingecko.com/api/v3/news', {
          params: { limit: 10 },
        })

        const newsItems = response.data.data?.slice(0, 3).map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description || '',
          source: item.source,
        })) || []

        setNews(newsItems)
      } catch (error) {
        console.error('Error fetching news:', error)
        setNews([
          {
            id: 'mock-1',
            title: 'Federal Reserve Signals Potential Rate Cuts',
            description: 'Fed officials hint at possible interest rate reductions',
            source: 'Financial Times',
          },
          {
            id: 'mock-2',
            title: 'Bitcoin Breaks Above $67,000',
            description: 'Major investment firms increase crypto allocation',
            source: 'CoinDesk',
          },
          {
            id: 'mock-3',
            title: 'EUR/USD Reaches 1.10 Level',
            description: 'European Central Bank maintains restrictive policy',
            source: 'Reuters',
          },
        ])
      } finally {
        setLoadingNews(false)
      }
    }

    fetchNews()
    const interval = setInterval(fetchNews, 60000)
    return () => clearInterval(interval)
  }, [])

  // Generate mock chart data
  useEffect(() => {
    if (!selectedPair) return

    const data: ChartDataPoint[] = []
    const now = Date.now()
    const basePrice = selectedPair.price

    for (let i = 50; i >= 0; i--) {
      const timestamp = now - i * 3600000
      const randomChange = (Math.random() - 0.5) * 5
      const close = basePrice + randomChange

      data.push({
        time: new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        close: parseFloat(close.toFixed(2)),
      })
    }

    setChartData(data)
  }, [selectedPair])

  const toggleFavorite = (pairId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(pairId)) {
      newFavorites.delete(pairId)
    } else {
      newFavorites.add(pairId)
    }
    setFavorites(newFavorites)
  }

  const getFearGreedColor = (value: number) => {
    if (value < 25) return 'text-red-600'
    if (value < 45) return 'text-orange-600'
    if (value < 55) return 'text-yellow-600'
    if (value < 75) return 'text-green-600'
    return 'text-green-700'
  }

  const getFearGreedLabel = (value: number) => {
    if (value < 25) return 'Extreme Fear'
    if (value < 45) return 'Fear'
    if (value < 55) return 'Neutral'
    if (value < 75) return 'Greed'
    return 'Extreme Greed'
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white">Trading Terminal</h1>
              <p className="text-slate-400 text-xs md:text-sm">Forex • Crypto • CFD</p>
            </div>
            <div className="text-right mr-4">
              <div className="text-xl md:text-2xl font-bold text-amber-400">${selectedPair?.price.toFixed(2)}</div>
              <div className={`text-xs md:text-sm font-semibold ${selectedPair && selectedPair.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {selectedPair && selectedPair.changePercent >= 0 ? '+' : ''}{selectedPair?.changePercent.toFixed(2)}%
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar - Watchlist */}
          <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block md:col-span-1`}>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 sticky top-24">
              <h2 className="text-lg font-semibold text-white mb-4">Watchlist</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {pairs.map((pair) => (
                  <button
                    key={pair.id}
                    onClick={() => {
                      setSelectedPair(pair)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedPair?.id === pair.id
                        ? 'bg-amber-500/20 border border-amber-500/50'
                        : 'bg-slate-700/50 border border-slate-600 hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-white text-sm">{pair.symbol}</div>
                        <div className="text-xs text-slate-400">{pair.name}</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(pair.id)
                        }}
                        className="text-amber-400 hover:scale-110 transition ml-2"
                      >
                        <Star size={14} fill={favorites.has(pair.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-sm font-bold text-white">${pair.price.toFixed(pair.type === 'forex' ? 4 : 2)}</div>
                      <div className={`text-xs font-semibold flex items-center gap-1 ${pair.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {pair.changePercent >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {pair.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-1 md:col-span-3 space-y-6">
            {/* Chart */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 md:p-6">
              <h3 className="text-white font-semibold mb-4 text-sm md:text-base">Price Chart</h3>
              <div className="h-64 md:h-96 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                        labelStyle={{ color: '#f1f5f9' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="close"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Loading chart...
                  </div>
                )}
              </div>
            </div>

            {/* Info Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Market Info */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 md:p-6">
                <h3 className="text-white font-semibold mb-4 text-sm">Market Info</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs md:text-sm">24h High</span>
                    <span className="text-white font-semibold text-sm md:text-base">${selectedPair?.high24h.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs md:text-sm">24h Low</span>
                    <span className="text-white font-semibold text-sm md:text-base">${selectedPair?.low24h.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs md:text-sm">24h Volume</span>
                    <span className="text-white font-semibold text-sm md:text-base">${((selectedPair?.volume || 0) / 1e9).toFixed(1)}B</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                    <span className="text-slate-400 text-xs md:text-sm">Type</span>
                    <span className="text-amber-400 font-semibold capitalize text-sm">{selectedPair?.type}</span>
                  </div>
                </div>
              </div>

              {/* Fear & Greed Index */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 md:p-6">
                <h3 className="text-white font-semibold mb-4 text-sm">Fear & Greed Index</h3>
                <div className="flex flex-col items-center justify-center py-6">
                  {loadingFearGreed ? (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Loader2 className="animate-spin" size={16} />
                      <span className="text-xs md:text-sm">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <div className={`text-4xl md:text-5xl font-bold ${getFearGreedColor(fearGreedIndex)} mb-2`}>{fearGreedIndex}</div>
                      <div className={`text-base md:text-lg font-semibold ${getFearGreedColor(fearGreedIndex)}`}>{getFearGreedLabel(fearGreedIndex)}</div>
                      <div className="w-full bg-slate-700 rounded-full h-2 mt-4">
                        <div
                          className="bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${fearGreedIndex}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* News Feed */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 md:p-6">
              <h3 className="text-white font-semibold mb-4 text-sm">Market News</h3>
              <div className="space-y-3">
                {loadingNews ? (
                  <div className="flex items-center justify-center py-8 text-slate-400">
                    <Loader2 className="animate-spin mr-2" size={16} />
                    <span className="text-xs md:text-sm">Loading news...</span>
                  </div>
                ) : news.length > 0 ? (
                  news.map((item, idx) => (
                    <div key={item.id} className={`flex gap-3 ${idx < news.length - 1 ? 'pb-3 border-b border-slate-700' : ''}`}>
                      <AlertCircle className="text-amber-400 flex-shrink-0 mt-1" size={16} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-xs md:text-sm line-clamp-2">{item.title}</div>
                        <div className="text-slate-400 text-xs mt-1 line-clamp-2">{item.description}</div>
                        <div className="text-slate-500 text-xs mt-1">{item.source}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 text-xs md:text-sm text-center py-4">No news available</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
