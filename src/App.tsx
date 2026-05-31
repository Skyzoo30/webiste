import { useState, useEffect, useRef } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts'
import { Star, Bell, Settings, Eye, EyeOff, TrendingUp, TrendingDown, Plus, Trash2, Menu, X } from 'lucide-react'
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

interface ChartData {
  time: number
  open: number
  high: number
  low: number
  close: number
}

interface Alert {
  id: string
  symbol: string
  type: 'above' | 'below'
  price: number
  active: boolean
}

interface ChartSettings {
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w'
  chartType: 'candlestick' | 'line' | 'area'
  indicators: string[]
  theme: 'light' | 'dark'
}

const DEFAULT_PAIRS: Pair[] = [
  { id: 'btc', symbol: 'BTC/USD', name: 'Bitcoin', type: 'crypto', price: 67500, change: 2500, changePercent: 3.85, high24h: 68200, low24h: 65800, volume: 35e9 },
  { id: 'eth', symbol: 'ETH/USD', name: 'Ethereum', type: 'crypto', price: 3500, change: 150, changePercent: 4.48, high24h: 3600, low24h: 3350, volume: 18e9 },
  { id: 'eur', symbol: 'EUR/USD', name: 'Euro/Dollar', type: 'forex', price: 1.0950, change: 0.005, changePercent: 0.46, high24h: 1.102, low24h: 1.089, volume: 380e9 },
  { id: 'gbp', symbol: 'GBP/USD', name: 'Pound/Dollar', type: 'forex', price: 1.275, change: 0.008, changePercent: 0.63, high24h: 1.285, low24h: 1.265, volume: 210e9 },
  { id: 'spx', symbol: 'SPX', name: 'S&P 500', type: 'cfd', price: 5420.5, change: 85.3, changePercent: 1.6, high24h: 5450, low24h: 5350, volume: 2.5e9 },
]

export default function App() {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)

  const [pairs, setPairs] = useState<Pair[]>(DEFAULT_PAIRS)
  const [selectedPair, setSelectedPair] = useState<Pair>(DEFAULT_PAIRS[0])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [settings, setSettings] = useState<ChartSettings>({
    timeframe: '1h',
    chartType: 'candlestick',
    indicators: ['sma20', 'sma50'],
    theme: 'dark',
  })
  const [showSettings, setShowSettings] = useState(false)
  const [showAlerts, setShowAlerts] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [newAlertPrice, setNewAlertPrice] = useState('')
  const [newAlertType, setNewAlertType] = useState<'above' | 'below'>('above')

  // Generate mock candlestick data
  const generateChartData = (basePrice: number, count: number = 100): ChartData[] => {
    const data: ChartData[] = []
    const now = Math.floor(Date.now() / 1000)
    const timeframeSeconds = {
      '1m': 60,
      '5m': 300,
      '15m': 900,
      '1h': 3600,
      '4h': 14400,
      '1d': 86400,
      '1w': 604800,
    }[settings.timeframe] || 3600

    for (let i = count - 1; i >= 0; i--) {
      const time = now - i * timeframeSeconds
      const volatility = basePrice * 0.02
      const open = basePrice + (Math.random() - 0.5) * volatility
      const close = open + (Math.random() - 0.5) * volatility
      const high = Math.max(open, close) + Math.random() * (volatility / 2)
      const low = Math.min(open, close) - Math.random() * (volatility / 2)

      data.push({
        time: Math.floor(time / timeframeSeconds) * timeframeSeconds,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
      })
    }

    return data
  }

  // Initialize TradingView chart
  useEffect(() => {
    if (!chartContainerRef.current) return

    const chartData = generateChartData(selectedPair.price)
    setChartData(chartData)

    // Cleanup old chart
    if (chartRef.current) {
      chartRef.current.remove()
    }

    const backgroundColor = settings.theme === 'dark' ? '#0f172a' : '#ffffff'
    const textColor = settings.theme === 'dark' ? '#f1f5f9' : '#000000'
    const gridColor = settings.theme === 'dark' ? '#334155' : '#e2e8f0'

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor: textColor,
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    })

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#4ade80',
      downColor: '#f87171',
      borderUpColor: '#4ade80',
      borderDownColor: '#f87171',
      wickUpColor: '#4ade80',
      wickDownColor: '#f87171',
    })

    candleSeries.setData(chartData)

    // Add SMA indicators if enabled
    if (settings.indicators.includes('sma20')) {
      const sma20 = calculateSMA(chartData, 20)
      const lineSeries = chart.addLineSeries({ color: '#fbbf24', lineWidth: 2 })
      lineSeries.setData(sma20)
    }

    if (settings.indicators.includes('sma50')) {
      const sma50 = calculateSMA(chartData, 50)
      const lineSeries = chart.addLineSeries({ color: '#f59e0b', lineWidth: 2 })
      lineSeries.setData(sma50)
    }

    chart.timeScale().fitContent()

    chartRef.current = chart
    candleSeriesRef.current = candleSeries

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [selectedPair, settings])

  const calculateSMA = (data: ChartData[], period: number) => {
    const sma = []
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.close, 0)
      sma.push({
        time: data[i].time,
        value: parseFloat((sum / period).toFixed(2)),
      })
    }
    return sma
  }

  const toggleFavorite = (pairId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(pairId)) {
      newFavorites.delete(pairId)
    } else {
      newFavorites.add(pairId)
    }
    setFavorites(newFavorites)
  }

  const addAlert = () => {
    if (!newAlertPrice) return
    const alert: Alert = {
      id: Date.now().toString(),
      symbol: selectedPair.symbol,
      type: newAlertType,
      price: parseFloat(newAlertPrice),
      active: true,
    }
    setAlerts([...alerts, alert])
    setNewAlertPrice('')
  }

  const removeAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id))
  }

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, active: !a.active } : a))
  }

  const styles = {
    container: { minHeight: '100vh', backgroundColor: '#030712', display: 'flex', flexDirection: 'column' as const },
    header: { borderBottom: '1px solid #334155', backgroundColor: '#0f172a', position: 'sticky' as const, top: 0, zIndex: 50, padding: '1rem' },
    headerContent: { maxWidth: '1600px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
    headerTitle: { fontSize: '1.875rem', fontWeight: 'bold', color: '#f1f5f9' },
    headerPrice: { fontSize: '1.5rem', fontWeight: 'bold', color: '#fbbf24' },
    mainGrid: { display: 'grid', gridTemplateColumns: '280px 1fr 320px', gap: '1rem', padding: '1rem', maxWidth: '1600px', margin: '0 auto', width: '100%', flex: 1, overflow: 'hidden' },
    sidebar: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', padding: '1rem', overflowY: 'auto' as const, maxHeight: 'calc(100vh - 120px)' },
    card: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' },
    cardTitle: { fontSize: '0.875rem', fontWeight: '600', color: '#f1f5f9', marginBottom: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
    watchlistItem: { padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer', border: '1px solid #475569', backgroundColor: '#334155', transition: 'all 0.2s' },
    watchlistItemActive: { backgroundColor: 'rgba(251, 191, 36, 0.2)', borderColor: 'rgba(251, 191, 36, 0.5)' },
    button: { padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500', transition: 'all 0.2s' },
    buttonPrimary: { backgroundColor: '#fbbf24', color: '#000000' },
    buttonSecondary: { backgroundColor: '#334155', color: '#f1f5f9', border: '1px solid #475569' },
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <div style={styles.headerTitle}>Trading Terminal Pro</div>
            <div style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>Advanced CFD & Futures</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={styles.headerPrice}>${selectedPair.price.toFixed(2)}</div>
            <div style={{ color: selectedPair.changePercent >= 0 ? '#4ade80' : '#f87171', fontSize: '0.875rem', fontWeight: '600' }}>
              {selectedPair.changePercent >= 0 ? '+' : ''}{selectedPair.changePercent.toFixed(2)}%
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: 'none', border: 'none', color: '#f1f5f9', cursor: 'pointer', display: 'none' }}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 320px', gap: '1rem', padding: '1rem', flex: 1, overflow: 'hidden', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
        {/* Left Sidebar - Watchlist */}
        <div style={styles.sidebar}>
          <div style={styles.cardTitle}>Watchlist</div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Search..."
              style={{
                flex: 1,
                padding: '0.5rem',
                backgroundColor: '#334155',
                border: '1px solid #475569',
                borderRadius: '0.375rem',
                color: '#f1f5f9',
                fontSize: '0.875rem',
              }}
            />
          </div>
          <div style={{ maxHeight: '600px', overflowY: 'auto' as const }}>
            {pairs.map((pair) => (
              <div
                key={pair.id}
                onClick={() => setSelectedPair(pair)}
                style={{
                  ...styles.watchlistItem,
                  ...(selectedPair.id === pair.id ? styles.watchlistItemActive : {}),
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#f1f5f9', fontSize: '0.875rem' }}>{pair.symbol}</div>
                    <div style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>{pair.name}</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(pair.id) }}
                    style={{ background: 'none', border: 'none', color: '#fbbf24', cursor: 'pointer', fontSize: '1rem' }}
                  >
                    {favorites.has(pair.id) ? '★' : '☆'}
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 'bold', color: '#f1f5f9', fontSize: '0.875rem' }}>
                    ${pair.price.toFixed(pair.type === 'forex' ? 4 : 2)}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', color: pair.changePercent >= 0 ? '#4ade80' : '#f87171' }}>
                    {pair.changePercent >= 0 ? '↑' : '↓'} {pair.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center - Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Chart Controls */}
          <div style={{ ...styles.card, marginBottom: 0 }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {(['1m', '5m', '15m', '1h', '4h', '1d', '1w'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setSettings({ ...settings, timeframe: tf })}
                    style={{
                      ...styles.button,
                      ...(settings.timeframe === tf ? styles.buttonPrimary : styles.buttonSecondary),
                    }}
                  >
                    {tf}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                style={{ ...styles.button, ...styles.buttonSecondary, marginLeft: 'auto' }}
              >
                <Settings size={16} style={{ display: 'inline', marginRight: '0.25rem' }} /> Settings
              </button>
              <button
                onClick={() => setShowAlerts(!showAlerts)}
                style={{ ...styles.button, ...styles.buttonSecondary }}
              >
                <Bell size={16} style={{ display: 'inline', marginRight: '0.25rem' }} /> Alerts
              </button>
            </div>
          </div>

          {/* Chart */}
          <div style={{ ...styles.card, flex: 1, overflow: 'hidden', marginBottom: 0 }}>
            <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
          </div>

          {/* Chart Info */}
          <div style={{ ...styles.card, marginBottom: 0, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ color: '#cbd5e1', fontSize: '0.75rem', textTransform: 'uppercase' }}>24h High</div>
              <div style={{ color: '#f1f5f9', fontWeight: 'bold' }}>${selectedPair.high24h.toFixed(2)}</div>
            </div>
            <div>
              <div style={{ color: '#cbd5e1', fontSize: '0.75rem', textTransform: 'uppercase' }}>24h Low</div>
              <div style={{ color: '#f1f5f9', fontWeight: 'bold' }}>${selectedPair.low24h.toFixed(2)}</div>
            </div>
            <div>
              <div style={{ color: '#cbd5e1', fontSize: '0.75rem', textTransform: 'uppercase' }}>24h Volume</div>
              <div style={{ color: '#f1f5f9', fontWeight: 'bold' }}>${(selectedPair.volume / 1e9).toFixed(1)}B</div>
            </div>
            <div>
              <div style={{ color: '#cbd5e1', fontSize: '0.75rem', textTransform: 'uppercase' }}>Type</div>
              <div style={{ color: '#fbbf24', fontWeight: 'bold', textTransform: 'capitalize' }}>{selectedPair.type}</div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Alerts & Settings */}
        <div style={styles.sidebar}>
          {showAlerts && (
            <>
              <div style={styles.cardTitle}>Price Alerts</div>
              <div style={{ marginBottom: '1rem' }}>
                <select
                  value={newAlertType}
                  onChange={(e) => setNewAlertType(e.target.value as 'above' | 'below')}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#334155',
                    border: '1px solid #475569',
                    borderRadius: '0.375rem',
                    color: '#f1f5f9',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="above">Price Above</option>
                  <option value="below">Price Below</option>
                </select>
                <input
                  type="number"
                  placeholder="Price"
                  value={newAlertPrice}
                  onChange={(e) => setNewAlertPrice(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#334155',
                    border: '1px solid #475569',
                    borderRadius: '0.375rem',
                    color: '#f1f5f9',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                />
                <button
                  onClick={addAlert}
                  style={{ ...styles.button, ...styles.buttonPrimary, width: '100%' }}
                >
                  <Plus size={16} style={{ display: 'inline', marginRight: '0.25rem' }} /> Add Alert
                </button>
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto' as const }}>
                {alerts.map((alert) => (
                  <div key={alert.id} style={{ ...styles.card, marginBottom: '0.5rem', padding: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ fontSize: '0.875rem', color: '#f1f5f9', fontWeight: '600' }}>
                        {alert.symbol} {alert.type === 'above' ? '↑' : '↓'} ${alert.price}
                      </div>
                      <button
                        onClick={() => removeAlert(alert.id)}
                        style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => toggleAlert(alert.id)}
                      style={{
                        width: '100%',
                        padding: '0.25rem',
                        fontSize: '0.75rem',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        backgroundColor: alert.active ? '#4ade80' : '#334155',
                        color: alert.active ? '#000000' : '#f1f5f9',
                      }}
                    >
                      {alert.active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {showSettings && (
            <>
              <div style={styles.cardTitle}>Chart Settings</div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ color: '#cbd5e1', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>Chart Type</label>
                  <select
                    value={settings.chartType}
                    onChange={(e) => setSettings({ ...settings, chartType: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: '#334155',
                      border: '1px solid #475569',
                      borderRadius: '0.375rem',
                      color: '#f1f5f9',
                      fontSize: '0.875rem',
                    }}
                  >
                    <option value="candlestick">Candlestick</option>
                    <option value="line">Line</option>
                    <option value="area">Area</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ color: '#cbd5e1', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>Indicators</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {['sma20', 'sma50', 'rsi', 'macd'].map((ind) => (
                      <label key={ind} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={settings.indicators.includes(ind)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSettings({ ...settings, indicators: [...settings.indicators, ind] })
                            } else {
                              setSettings({ ...settings, indicators: settings.indicators.filter(i => i !== ind) })
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>{ind.toUpperCase()}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ color: '#cbd5e1', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>Theme</label>
                  <select
                    value={settings.theme}
                    onChange={(e) => setSettings({ ...settings, theme: e.target.value as 'light' | 'dark' })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: '#334155',
                      border: '1px solid #475569',
                      borderRadius: '0.375rem',
                      color: '#f1f5f9',
                      fontSize: '0.875rem',
                    }}
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Market Stats */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>Market Stats</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <div style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>Volatility</div>
                <div style={{ color: '#fbbf24', fontWeight: 'bold' }}>2.4%</div>
              </div>
              <div>
                <div style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>RSI (14)</div>
                <div style={{ color: '#4ade80', fontWeight: 'bold' }}>65.2</div>
              </div>
              <div>
                <div style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>MACD</div>
                <div style={{ color: '#4ade80', fontWeight: 'bold' }}>Bullish</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
