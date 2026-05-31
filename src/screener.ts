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

interface ScreenerResult {
  pair: Pair
  score: number
  signals: string[]
  trend: 'bullish' | 'bearish' | 'neutral'
}

export const screenPairs = (pairs: Pair[], rsi: number, macd: string, bb: string): ScreenerResult[] => {
  return pairs.map((pair) => {
    const signals: string[] = []
    let score = 50

    // RSI signals
    if (rsi < 30) {
      signals.push('Oversold (RSI < 30)')
      score += 20
    } else if (rsi > 70) {
      signals.push('Overbought (RSI > 70)')
      score -= 20
    }

    // MACD signals
    if (macd === 'bullish') {
      signals.push('MACD Bullish')
      score += 15
    } else if (macd === 'bearish') {
      signals.push('MACD Bearish')
      score -= 15
    }

    // Bollinger Bands signals
    if (bb === 'upper') {
      signals.push('Price at Upper Band')
      score -= 10
    } else if (bb === 'lower') {
      signals.push('Price at Lower Band')
      score += 10
    }

    // Price action
    if (pair.changePercent > 5) {
      signals.push('Strong Uptrend')
      score += 10
    } else if (pair.changePercent < -5) {
      signals.push('Strong Downtrend')
      score -= 10
    }

    // Volume
    if (pair.volume > 10e9) {
      signals.push('High Volume')
      score += 5
    }

    const trend = score > 60 ? 'bullish' : score < 40 ? 'bearish' : 'neutral'

    return {
      pair,
      score: Math.min(100, Math.max(0, score)),
      signals,
      trend,
    }
  })
}

export const filterByCondition = (pairs: Pair[], condition: 'gainers' | 'losers' | 'highVolume' | 'volatile'): Pair[] => {
  switch (condition) {
    case 'gainers':
      return pairs.filter(p => p.changePercent > 2).sort((a, b) => b.changePercent - a.changePercent)
    case 'losers':
      return pairs.filter(p => p.changePercent < -2).sort((a, b) => a.changePercent - b.changePercent)
    case 'highVolume':
      return pairs.filter(p => p.volume > 15e9).sort((a, b) => b.volume - a.volume)
    case 'volatile':
      return pairs.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    default:
      return pairs
  }
}
