import { useState, useMemo } from 'react'
import { fetchAdvice } from '../utils/api'
import { DAILY_GOALS } from '../utils/constants'

const STATUS_COLORS = {
  good: { bg: '#E8F5E9', color: '#2E7D32', icon: '✓' },
  low: { bg: '#FFF8E1', color: '#E65100', icon: '↑' },
  high: { bg: '#FFEBEE', color: '#C62828', icon: '↓' },
}

function ScoreRing({ score }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  const color =
    score >= 80 ? '#4CAF50' : score >= 60 ? '#FFA726' : '#EF5350'

  return (
    <div style={{ position: 'relative', width: 140, height: 140 }}>
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#F5F5F5"
          strokeWidth="12"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: 36, fontWeight: 700, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 12, color: '#9E9E9E', marginTop: 2 }}>点</span>
      </div>
    </div>
  )
}

export default function AdviceScreen({ meals, apiKey }) {
  const [advice, setAdvice] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const totalNutrition = useMemo(() => {
    const allFoods = Object.values(meals).flat()
    const result = {}
    for (const key of Object.keys(DAILY_GOALS)) {
      result[key] = allFoods.reduce((s, f) => s + (f[key] || 0) * (f.quantity || 1), 0)
    }
    return result
  }, [meals])

  const hasData = Object.values(meals).flat().length > 0

  const handleGetAdvice = async () => {
    if (!apiKey) {
      setError('APIキーが設定されていません。設定画面で入力してください。')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await fetchAdvice(meals, totalNutrition, apiKey)
      setAdvice(result)
    } catch (e) {
      setError(e.message || 'アドバイスの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
          padding: '24px 20px 16px',
          color: 'white',
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>AIアドバイス</div>
        <div style={{ fontSize: 14, opacity: 0.9 }}>今日の食事を分析します</div>
      </div>

      <div style={{ padding: '12px 0' }}>
        {!hasData ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-emoji">🤖</div>
              <div className="empty-state-text">
                食事を記録してから<br />アドバイスをもらいましょう
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Get Advice Button */}
            {!advice && !loading && (
              <div className="card">
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
                  <div style={{ fontSize: 15, color: '#757575', marginBottom: 20, lineHeight: 1.6 }}>
                    今日の食事内容をAIが分析して<br />
                    栄養アドバイスをお届けします
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={handleGetAdvice}
                    style={{ fontSize: 15, padding: '12px 32px' }}
                  >
                    ✨ アドバイスをもらう
                  </button>
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="card">
                <div className="loading-overlay">
                  <div className="loading-spinner" />
                  <div style={{ fontSize: 14, color: '#757575', textAlign: 'center', lineHeight: 1.6 }}>
                    AIが今日の食事を分析中...<br />
                    <span style={{ fontSize: 12, color: '#BDBDBD' }}>少々お待ちください</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="card">
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
                <button className="btn btn-outline btn-full" onClick={handleGetAdvice}>
                  再試行
                </button>
              </div>
            )}

            {/* Advice Result */}
            {advice && !loading && (
              <>
                {/* Score Card */}
                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <ScoreRing score={advice.score || 0} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: '#757575', marginBottom: 6 }}>健康スコア</div>
                      <div style={{ fontSize: 14, color: '#212121', lineHeight: 1.6 }}>
                        {advice.comment}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calorie Balance */}
                <div className="card">
                  <div className="card-title">🔥 カロリーバランス</div>
                  <div
                    style={{
                      background: '#F5F5F5',
                      borderRadius: 8,
                      padding: '12px 14px',
                      fontSize: 14,
                      color: '#424242',
                      lineHeight: 1.7,
                    }}
                  >
                    {advice.calorieBalance}
                  </div>
                </div>

                {/* Nutrition Comments */}
                {advice.nutritionComments && advice.nutritionComments.length > 0 && (
                  <div className="card">
                    <div className="card-title">📋 栄養素の評価</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {advice.nutritionComments.map((item, idx) => {
                        const status = item.status || 'good'
                        const config = STATUS_COLORS[status] || STATUS_COLORS.good
                        return (
                          <div
                            key={idx}
                            style={{
                              background: config.bg,
                              borderRadius: 8,
                              padding: '10px 14px',
                              display: 'flex',
                              gap: 10,
                              alignItems: 'flex-start',
                            }}
                          >
                            <span
                              style={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: config.color,
                                minWidth: 20,
                                textAlign: 'center',
                              }}
                            >
                              {config.icon}
                            </span>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: config.color, marginBottom: 2 }}>
                                {item.nutrient}
                              </div>
                              <div style={{ fontSize: 13, color: '#424242', lineHeight: 1.5 }}>
                                {item.comment}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Improvements */}
                {advice.improvements && advice.improvements.length > 0 && (
                  <div className="card">
                    <div className="card-title">💡 改善提案</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {advice.improvements.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            gap: 10,
                            alignItems: 'flex-start',
                          }}
                        >
                          <span
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              background: '#4CAF50',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 12,
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {idx + 1}
                          </span>
                          <div style={{ fontSize: 14, color: '#424242', lineHeight: 1.6 }}>
                            {item}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Refresh Button */}
                <div style={{ padding: '0 16px' }}>
                  <button className="btn btn-outline btn-full" onClick={handleGetAdvice}>
                    🔄 再分析する
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
