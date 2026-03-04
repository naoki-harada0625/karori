import { useState, useRef, useEffect } from 'react'
import { fetchNutrition } from '../utils/api'
import { NUTRIENT_LABELS } from '../utils/constants'

const QUANTITY_OPTIONS = [0.5, 1, 1.5, 2, 2.5, 3]

const EXAMPLE_FOODS = [
  'てりやきマック',
  'カルボナーラ',
  'おにぎり2個',
  'コメダ アイスカフェラテ',
  'ざるそば',
  'チキンラーメン',
]

const NUTRIENT_DISPLAY = [
  { key: 'calories', label: 'カロリー', unit: 'kcal', color: '#FF7043' },
  { key: 'protein', label: 'たんぱく質', unit: 'g', color: '#FF6B6B' },
  { key: 'fat', label: '脂質', unit: 'g', color: '#FFD93D' },
  { key: 'carbs', label: '炭水化物', unit: 'g', color: '#6BCB77' },
  { key: 'fiber', label: '食物繊維', unit: 'g', color: '#4DB6AC' },
  { key: 'salt', label: '塩分', unit: 'g', color: '#9575CD' },
]

export default function FoodInputModal({ apiKey, onAdd, onClose }) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const inputRef = useRef(null)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const handleSearch = async () => {
    if (!query.trim()) return
    if (!apiKey) {
      setError('APIキーが設定されていません。設定画面で入力してください。')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await fetchNutrition(query.trim(), apiKey)
      setResult(data)
      setQuantity(1)
    } catch (e) {
      setError(e.message || '栄養素の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleAdd = () => {
    if (!result) return
    onAdd({ ...result, quantity })
  }

  const effectiveCalories = result ? Math.round((result.calories || 0) * quantity) : 0

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-header">
          <h2>食品を追加</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Search Input */}
          <div style={{ marginBottom: 16 }}>
            <div className="input-search-row">
              <input
                ref={inputRef}
                className="input-field"
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="食品名や料理名を入力..."
                disabled={loading}
              />
              <button
                className="btn btn-primary"
                onClick={handleSearch}
                disabled={loading || !query.trim()}
              >
                {loading ? '検索中' : '検索'}
              </button>
            </div>
          </div>

          {/* Example Tags */}
          {!result && !loading && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: '#9E9E9E', marginBottom: 8 }}>入力例：</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {EXAMPLE_FOODS.map(food => (
                  <button
                    key={food}
                    onClick={() => setQuery(food)}
                    style={{
                      padding: '4px 10px',
                      background: '#F1F8E9',
                      border: '1px solid #A5D6A7',
                      borderRadius: 99,
                      fontSize: 12,
                      color: '#388E3C',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {food}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="loading-overlay">
              <div className="loading-spinner" />
              <div style={{ fontSize: 14, color: '#757575' }}>
                AIが栄養素を推定しています...
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              style={{
                background: '#FFEBEE',
                border: '1px solid #FFCDD2',
                borderRadius: 8,
                padding: '12px 16px',
                fontSize: 14,
                color: '#C62828',
                marginBottom: 16,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div>
              {/* Food Name */}
              <div
                style={{
                  background: '#F1F8E9',
                  borderRadius: 10,
                  padding: '14px 16px',
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: 12, color: '#757575', marginBottom: 4 }}>検索結果</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#212121' }}>
                  {result.name}
                </div>
              </div>

              {/* Nutrition Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                {NUTRIENT_DISPLAY.map(({ key, label, unit, color }) => {
                  const baseValue = result[key] || 0
                  const adjustedValue = key === 'calories'
                    ? Math.round(baseValue * quantity)
                    : (baseValue * quantity).toFixed(1)
                  return (
                    <div
                      key={key}
                      style={{
                        background: `${color}12`,
                        borderRadius: 8,
                        padding: '10px',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: 11, color: '#757575', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color }}>
                        {adjustedValue}
                        <span style={{ fontSize: 10, fontWeight: 400, color: '#9E9E9E' }}>{unit}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* More Nutrients */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: '#9E9E9E', marginBottom: 8 }}>その他の栄養素</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {[
                    { key: 'calcium', label: 'Ca', unit: 'mg' },
                    { key: 'iron', label: '鉄', unit: 'mg' },
                    { key: 'vitaminA', label: 'VA', unit: 'μg' },
                    { key: 'vitaminB1', label: 'VB1', unit: 'mg' },
                    { key: 'vitaminB2', label: 'VB2', unit: 'mg' },
                    { key: 'vitaminC', label: 'VC', unit: 'mg' },
                  ].map(({ key, label, unit }) => (
                    <div
                      key={key}
                      style={{
                        background: '#F5F5F5',
                        borderRadius: 6,
                        padding: '4px 10px',
                        fontSize: 12,
                        color: '#757575',
                      }}
                    >
                      {label}: {((result[key] || 0) * quantity).toFixed(1)}{unit}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#757575', marginBottom: 10 }}>
                  数量
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {QUANTITY_OPTIONS.map(q => (
                    <button
                      key={q}
                      onClick={() => setQuantity(q)}
                      style={{
                        flex: 1,
                        padding: '8px 4px',
                        border: quantity === q ? '2px solid #4CAF50' : '1.5px solid #E0E0E0',
                        borderRadius: 8,
                        background: quantity === q ? '#F1F8E9' : 'white',
                        color: quantity === q ? '#4CAF50' : '#757575',
                        fontSize: 13,
                        fontWeight: quantity === q ? 700 : 400,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div
                style={{
                  background: '#E8F5E9',
                  borderRadius: 10,
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <span style={{ fontSize: 14, color: '#388E3C' }}>合計</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#2E7D32' }}>
                  {effectiveCalories.toLocaleString()} kcal
                </span>
              </div>

              {/* Add Button */}
              <button className="btn btn-primary btn-full" onClick={handleAdd}>
                ✓ 食事に追加する
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
