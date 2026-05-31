interface ChartSettings {
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w'
  chartType: 'candlestick' | 'line' | 'area'
  indicators: string[]
  theme: 'light' | 'dark'
}

interface UserPreferences {
  favorites: string[]
  alerts: any[]
  settings: ChartSettings
  lastPair: string
}

const STORAGE_KEY = 'trading-terminal-pro'

export const savePreferences = (prefs: UserPreferences) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch (error) {
    console.error('Error saving preferences:', error)
  }
}

export const loadPreferences = (): UserPreferences | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Error loading preferences:', error)
    return null
  }
}

export const clearPreferences = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing preferences:', error)
  }
}

export const saveChartSettings = (settings: ChartSettings) => {
  try {
    localStorage.setItem('chart-settings', JSON.stringify(settings))
  } catch (error) {
    console.error('Error saving chart settings:', error)
  }
}

export const loadChartSettings = (): ChartSettings | null => {
  try {
    const data = localStorage.getItem('chart-settings')
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Error loading chart settings:', error)
    return null
  }
}

export const saveFavorites = (favorites: string[]) => {
  try {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  } catch (error) {
    console.error('Error saving favorites:', error)
  }
}

export const loadFavorites = (): string[] => {
  try {
    const data = localStorage.getItem('favorites')
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error loading favorites:', error)
    return []
  }
}

export const saveAlerts = (alerts: any[]) => {
  try {
    localStorage.setItem('alerts', JSON.stringify(alerts))
  } catch (error) {
    console.error('Error saving alerts:', error)
  }
}

export const loadAlerts = (): any[] => {
  try {
    const data = localStorage.getItem('alerts')
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error loading alerts:', error)
    return []
  }
}
