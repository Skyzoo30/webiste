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
    if (value < 25) return '#dc2626'
    if (value < 45) return '#ea580c'
    if (value < 55) return '#eab308'
    if (value < 75) return '#22c55e'
    return '#16a34a'
  }

  const getFearGreedLabel = (value: number) => {
    if (value < 25) return 'Extreme Fear'
    if (value < 45) return 'Fear'
    if (value < 55) return 'Neutral'
    if (value < 75) return 'Greed'
    return 'Extreme Greed'
  }

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#030712',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    header: {
      borderBottom: '1px solid #334155',
      backgroundColor: '#0f172a',
      position: 'sticky' as const,
      top: 0,
      zIndex: 50,
      padding: '1rem',
    },
    headerContent: {
      maxWidth: '1280px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    headerTitle: {
      fontSize: '1.875rem',
      fontWeight: 'bold',
      color: '#f1f5f9',
      marginBottom: '0.25rem',
    },
    headerSubtitle: {
      color: '#cbd5e1',
      fontSize: '0.875rem',
    },
    headerPrice: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#fbbf24',
      textAlign: 'right' as const,
    },
    headerChange: {
      fontSize: '0.875rem',
      fontWeight: '600',
    },
    mainContent: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '1.5rem',
      width: '100%',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
    },
    card: {
      backgroundColor: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '0.5rem',
      padding: '1.5rem',
    },
    cardTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#f1f5f9',
      marginBottom: '1rem',
    },
    watchlistItem: {
      padding: '0.75rem',
      borderRadius: '0.5rem',
      marginBottom: '0.5rem',
      cursor: 'pointer',
      border: '1px solid #475569',
      backgroundColor: '#334155',
      transition: 'all 0.2s',
    },
    watchlistItemActive: {
      backgroundColor: 'rgba(251, 191, 36, 0.2)',
      borderColor: 'rgba(251, 191, 36, 0.5)',
    },
    chartContainer: {
      height: '400px',
      width: '100%',
      gridColumn: 'span 2',
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      marginTop: '1rem',
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: '0.75rem',
      borderBottom: '1px solid #334155',
    },
    infoLabel: {
      color: '#cbd5e1',
      fontSize: '0.875rem',
    },
    infoValue: {
      color: '#f1f5f9',
      fontWeight: '600',
    },
    newsItem: {
      paddingBottom: '0.75rem',
      borderBottom: '1px solid #334155',
      marginBottom: '0.75rem',
    },
    newsTitle: {
      fontWeight: '600',
      color: '#f1f5f9',
      fontSize: '0.875rem',
      marginBottom: '0.25rem',
    },
    newsDesc: {
      color: '#cbd5e1',
      fontSize: '0.75rem',
      marginBottom: '0.25rem',
    },
    newsSource: {
      color: '#94a3b8',
      fontSize: '0.75rem',
    },
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={{ flex: 1 }}>
            <div style={styles.headerTitle}>Trading Terminal</div>
            <div style={styles.headerSubtitle}>Forex • Crypto • CFD Live Data</div>
          </div>
          <div style={{ textAlign: 'right', marginRight: '1rem' }}>
            <div style={styles.headerPrice}>${selectedPair?.price.toFixed(2)}</div>
            <div style={{
              ...styles.headerChange,
              color: selectedPair && selectedPair.changePercent >= 0 ? '#4ade80' : '#f87171'
            }}>
              {selectedPair && selectedPair.changePercent >= 0 ? '+' : ''}{selectedPair?.changePercent.toFixed(2)}%
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#f1f5f9',
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'none',
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={styles.mainContent}>
          {/* Watchlist Sidebar */}
          <div style={{ gridColumn: 'span 1', minWidth: '280px' }}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Watchlist</div>
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {pairs.map((pair) => (
                  <div
                    key={pair.id}
                    onClick={() => setSelectedPair(pair)}
                    style={{
                      ...styles.watchlistItem,
                      ...(selectedPair?.id === pair.id ? styles.watchlistItemActive : {}),
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#f1f5f9', fontSize: '0.875rem' }}>{pair.symbol}</div>
                        <div style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>{pair.name}</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(pair.id)
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#fbbf24',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                        }}
                      >
                        {favorites.has(pair.id) ? '★' : '☆'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 'bold', color: '#f1f5f9', fontSize: '0.875rem' }}>
                        ${pair.price.toFixed(pair.type === 'forex' ? 4 : 2)}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: pair.changePercent >= 0 ? '#4ade80' : '#f87171',
                      }}>
                        {pair.changePercent >= 0 ? '↑' : '↓'} {pair.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div style={{ ...styles.card, gridColumn: 'span 2' }}>
            <div style={styles.cardTitle}>Price Chart - {selectedPair?.symbol}</div>
            <div style={styles.chartContainer}>
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
                      stroke="#fbbf24"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#cbd5e1' }}>
                  <Loader2 style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} size={20} />
                  Loading chart...
                </div>
              )}
            </div>
          </div>

          {/* Market Info */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>Market Info</div>
            <div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>24h High</span>
                <span style={styles.infoValue}>${selectedPair?.high24h.toFixed(2)}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>24h Low</span>
                <span style={styles.infoValue}>${selectedPair?.low24h.toFixed(2)}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>24h Volume</span>
                <span style={styles.infoValue}>${((selectedPair?.volume || 0) / 1e9).toFixed(1)}B</span>
              </div>
              <div style={{ ...styles.infoRow, borderBottom: 'none' }}>
                <span style={styles.infoLabel}>Type</span>
                <span style={{ ...styles.infoValue, color: '#fbbf24', textTransform: 'capitalize' }}>
                  {selectedPair?.type}
                </span>
              </div>
            </div>
          </div>

          {/* Fear & Greed Index */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>Fear & Greed Index</div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 0' }}>
              {loadingFearGreed ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
                  <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={16} />
                  Loading...
                </div>
              ) : (
                <>
                  <div style={{
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    color: getFearGreedColor(fearGreedIndex),
                    marginBottom: '0.5rem',
                  }}>
                    {fearGreedIndex}
                  </div>
                  <div style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: getFearGreedColor(fearGreedIndex),
                    marginBottom: '1rem',
                  }}>
                    {getFearGreedLabel(fearGreedIndex)}
                  </div>
                  <div style={{
                    width: '100%',
                    backgroundColor: '#334155',
                    borderRadius: '9999px',
                    height: '8px',
                    overflow: 'hidden',
                  }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${fearGreedIndex}%`,
                        background: 'linear-gradient(to right, #dc2626, #eab308, #22c55e)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* News Feed */}
          <div style={{ ...styles.card, gridColumn: 'span 3' }}>
            <div style={styles.cardTitle}>Market News</div>
            <div>
              {loadingNews ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: '#cbd5e1' }}>
                  <Loader2 style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} size={16} />
                  Loading news...
                </div>
              ) : news.length > 0 ? (
                news.map((item, idx) => (
                  <div key={item.id} style={{ ...styles.newsItem, borderBottom: idx < news.length - 1 ? '1px solid #334155' : 'none' }}>
                    <div style={styles.newsTitle}>{item.title}</div>
                    <div style={styles.newsDesc}>{item.description}</div>
                    <div style={styles.newsSource}>{item.source}</div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#cbd5e1', padding: '1rem' }}>No news available</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
