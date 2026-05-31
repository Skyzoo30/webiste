interface ChartData {
  time: number
  open: number
  high: number
  low: number
  close: number
}

interface IndicatorData {
  time: number
  value: number
}

// Simple Moving Average
export const calculateSMA = (data: ChartData[], period: number): IndicatorData[] => {
  const sma: IndicatorData[] = []
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.close, 0)
    sma.push({
      time: data[i].time,
      value: parseFloat((sum / period).toFixed(2)),
    })
  }
  return sma
}

// Exponential Moving Average
export const calculateEMA = (data: ChartData[], period: number): IndicatorData[] => {
  const ema: IndicatorData[] = []
  const k = 2 / (period + 1)
  
  let emaPrev = data.slice(0, period).reduce((acc, d) => acc + d.close, 0) / period
  
  for (let i = period; i < data.length; i++) {
    const emaNew = data[i].close * k + emaPrev * (1 - k)
    ema.push({
      time: data[i].time,
      value: parseFloat(emaNew.toFixed(2)),
    })
    emaPrev = emaNew
  }
  
  return ema
}

// Relative Strength Index
export const calculateRSI = (data: ChartData[], period: number = 14): IndicatorData[] => {
  const rsi: IndicatorData[] = []
  const changes = []
  
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i].close - data[i - 1].close)
  }
  
  for (let i = period; i < changes.length; i++) {
    const gains = changes.slice(i - period, i).filter(c => c > 0).reduce((a, b) => a + b, 0)
    const losses = Math.abs(changes.slice(i - period, i).filter(c => c < 0).reduce((a, b) => a + b, 0))
    
    const rs = losses === 0 ? 100 : gains / losses
    const rsiValue = 100 - (100 / (1 + rs))
    
    rsi.push({
      time: data[i + 1].time,
      value: parseFloat(rsiValue.toFixed(2)),
    })
  }
  
  return rsi
}

// MACD (Moving Average Convergence Divergence)
export const calculateMACD = (data: ChartData[]) => {
  const ema12 = calculateEMA(data, 12)
  const ema26 = calculateEMA(data, 26)
  
  const macd: IndicatorData[] = []
  const signal: IndicatorData[] = []
  const histogram: IndicatorData[] = []
  
  const minLength = Math.min(ema12.length, ema26.length)
  const macdLine = []
  
  for (let i = 0; i < minLength; i++) {
    const macdValue = ema12[i].value - ema26[i].value
    macdLine.push({
      time: ema12[i].time,
      value: parseFloat(macdValue.toFixed(2)),
    })
  }
  
  // Signal line (9-period EMA of MACD)
  if (macdLine.length >= 9) {
    for (let i = 8; i < macdLine.length; i++) {
      const sum = macdLine.slice(i - 8, i + 1).reduce((acc, d) => acc + d.value, 0)
      signal.push({
        time: macdLine[i].time,
        value: parseFloat((sum / 9).toFixed(2)),
      })
    }
  }
  
  return { macd: macdLine, signal, histogram }
}

// Bollinger Bands
export const calculateBollingerBands = (data: ChartData[], period: number = 20, stdDev: number = 2) => {
  const bands = []
  
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1)
    const sma = slice.reduce((acc, d) => acc + d.close, 0) / period
    
    const variance = slice.reduce((acc, d) => acc + Math.pow(d.close - sma, 2), 0) / period
    const std = Math.sqrt(variance)
    
    bands.push({
      time: data[i].time,
      upper: parseFloat((sma + std * stdDev).toFixed(2)),
      middle: parseFloat(sma.toFixed(2)),
      lower: parseFloat((sma - std * stdDev).toFixed(2)),
    })
  }
  
  return bands
}

// ATR (Average True Range)
export const calculateATR = (data: ChartData[], period: number = 14) => {
  const atr: IndicatorData[] = []
  const trueRanges = []
  
  for (let i = 1; i < data.length; i++) {
    const tr = Math.max(
      data[i].high - data[i].low,
      Math.abs(data[i].high - data[i - 1].close),
      Math.abs(data[i].low - data[i - 1].close)
    )
    trueRanges.push(tr)
  }
  
  for (let i = period - 1; i < trueRanges.length; i++) {
    const sum = trueRanges.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
    atr.push({
      time: data[i + 1].time,
      value: parseFloat((sum / period).toFixed(2)),
    })
  }
  
  return atr
}

// Stochastic Oscillator
export const calculateStochastic = (data: ChartData[], period: number = 14) => {
  const stoch: IndicatorData[] = []
  
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1)
    const low = Math.min(...slice.map(d => d.low))
    const high = Math.max(...slice.map(d => d.high))
    
    const k = ((data[i].close - low) / (high - low)) * 100
    stoch.push({
      time: data[i].time,
      value: parseFloat(k.toFixed(2)),
    })
  }
  
  return stoch
}
