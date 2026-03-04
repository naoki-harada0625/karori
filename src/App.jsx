import { useState, useEffect, useCallback } from 'react'
import './App.css'
import { STORAGE_KEYS } from './utils/constants'
import { getTodayString } from './utils/dateUtils'
import TabNav from './components/TabNav'
import HomeScreen from './components/HomeScreen'
import NutritionChartScreen from './components/NutritionChartScreen'
import AdviceScreen from './components/AdviceScreen'
import HistoryScreen from './components/HistoryScreen'
import SettingsScreen from './components/SettingsScreen'

const EMPTY_MEALS = {
  breakfast: [],
  lunch: [],
  dinner: [],
  snack: [],
}

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [apiKey, setApiKey] = useState('')
  const [meals, setMeals] = useState(EMPTY_MEALS)
  const [history, setHistory] = useState({})
  const [currentDate] = useState(getTodayString())

  // Load from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem(STORAGE_KEYS.API_KEY) || ''
    setApiKey(savedApiKey)

    const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY)
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory)
        setHistory(parsed)
        if (parsed[currentDate]) {
          setMeals(parsed[currentDate])
        }
      } catch {
        // ignore parse errors
      }
    }
  }, [currentDate])

  // Save today's meals to history whenever meals change
  const saveMeals = useCallback((newMeals) => {
    setMeals(newMeals)
    setHistory(prev => {
      const updated = { ...prev, [currentDate]: newMeals }
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated))
      return updated
    })
  }, [currentDate])

  const handleAddFood = useCallback((mealType, food) => {
    setMeals(prev => {
      const updated = {
        ...prev,
        [mealType]: [...prev[mealType], { ...food, id: Date.now() + Math.random() }],
      }
      setHistory(h => {
        const newHistory = { ...h, [currentDate]: updated }
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(newHistory))
        return newHistory
      })
      return updated
    })
  }, [currentDate])

  const handleRemoveFood = useCallback((mealType, foodId) => {
    setMeals(prev => {
      const updated = {
        ...prev,
        [mealType]: prev[mealType].filter(f => f.id !== foodId),
      }
      setHistory(h => {
        const newHistory = { ...h, [currentDate]: updated }
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(newHistory))
        return newHistory
      })
      return updated
    })
  }, [currentDate])

  const handleSaveApiKey = useCallback((key) => {
    setApiKey(key)
    localStorage.setItem(STORAGE_KEYS.API_KEY, key)
  }, [])

  const tabProps = {
    meals,
    history,
    apiKey,
    currentDate,
    onAddFood: handleAddFood,
    onRemoveFood: handleRemoveFood,
    onSaveMeals: saveMeals,
    onSaveApiKey: handleSaveApiKey,
    onTabChange: setActiveTab,
  }

  // Show settings if no API key
  const showApiKeyWarning = !apiKey && activeTab !== 'settings'

  return (
    <div className="app-container">
      {showApiKeyWarning && (
        <div
          style={{
            background: '#FFF3E0',
            borderBottom: '1px solid #FFB74D',
            padding: '10px 16px',
            fontSize: 13,
            color: '#E65100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <span>⚠️ APIキーが設定されていません</span>
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              background: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            設定する
          </button>
        </div>
      )}

      <div className="screen">
        {activeTab === 'home' && <HomeScreen {...tabProps} />}
        {activeTab === 'nutrition' && <NutritionChartScreen {...tabProps} />}
        {activeTab === 'advice' && <AdviceScreen {...tabProps} />}
        {activeTab === 'history' && <HistoryScreen {...tabProps} />}
        {activeTab === 'settings' && <SettingsScreen {...tabProps} />}
      </div>

      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default App
