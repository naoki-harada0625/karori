import { useMemo } from 'react'
import { DAILY_GOALS, NUTRIENT_LABELS, NUTRIENT_CHART_ORDER } from '../utils/constants'

function getStatus(key, value, goal) {
  if (key === 'salt') {
    if (value <= goal * 0.67) return 'good'
    if (value <= goal) return 'good'
    return 'high'
  }
  const ratio = value / goal
  if (ratio < 0.6) return 'low'
  if (ratio <= 1.2) return 'good'
  return 'high'
}

const STATUS_CONFIG = {
  good: { label: '適正', color: '#4CAF50', bg: '#E8F5E9', barColor: '#66BB6A' },
  low: { label: '不足', color: '#F57C00', bg: '#FFF8E1', barColor: '#FFA726' },
  high: { label: '過剰', color: '#C62828', bg: '#FFEBEE', barColor: '#EF5350' },
}

function NutrientBar({ nutrientKey, value, goal, label, unit }) {
  const displayValue = nutrientKey === 'calories' ? Math.round(value) : parseFloat(value.toFixed(1))
  const displayGoal = goal

  const status = getStatus(nutrientKey, value, goal)
  const config = STATUS_CONFIG[status]

  const barPercent = nutrientKey === 'salt'
    ? Math.min((value / goal) * 100, 150)
    : Math.min((value / goal) * 100, 150)

  const clampedBar = Math.min(barPercent, 100)
  const isOver = barPercent > 100

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#212121' }}>{label}</span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: config.color,
              background: config.bg,
              padding: '1px 6px',
              borderRadius: 99,
            }}
          >
            {config.label}
          </span>
        </div>
        <div style={{ fontSize: 12, color: '#757575', textAlign: 'right' }}>
          <span style={{ fontWeight: 600, color: '#212121' }}>
            {displayValue}{unit}
          </span>
          <span style={{ color: '#BDBDBD' }}> / {displayGoal}{unit}</span>
          {nutrientKey === 'salt' && (
            <span style={{ color: '#BDBDBD', fontSize: 10 }}> 以下</span>
          )}
        </div>
      </div>
      <div style={{ position: 'relative', height: 12, background: '#F5F5F5', borderRadius: 99, overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${clampedBar}%`,
            background: isOver
              ? `linear-gradient(90deg, ${config.barColor} 0%, ${config.barColor} 100%)`
              : `linear-gradient(90deg, ${config.barColor}CC 0%, ${config.barColor} 100%)`,
            borderRadius: 99,
            transition: 'width 0.5s ease',
          }}
        />
        {/* Goal line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '100%',
            width: 2,
            background: 'rgba(0,0,0,0.1)',
          }}
        />
      </div>
    </div>
  )
}

export default function NutritionChartScreen({ meals }) {
  const totals = useMemo(() => {
    const allFoods = Object.values(meals).flat()
    const result = {}
    for (const key of Object.keys(DAILY_GOALS)) {
      result[key] = allFoods.reduce((s, f) => s + (f[key] || 0) * (f.quantity || 1), 0)
    }
    return result
  }, [meals])

  const hasData = Object.values(meals).flat().length > 0

  const goodCount = NUTRIENT_CHART_ORDER.filter(key => {
    const status = getStatus(key, totals[key] || 0, DAILY_GOALS[key])
    return status === 'good'
  }).length

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
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>栄養素グラフ</div>
        <div style={{ fontSize: 14, opacity: 0.9 }}>今日の達成状況</div>
      </div>

      <div style={{ padding: '12px 0' }}>
        {/* Summary Card */}
        {hasData && (
          <div className="card">
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { label: '適正', count: NUTRIENT_CHART_ORDER.filter(k => getStatus(k, totals[k] || 0, DAILY_GOALS[k]) === 'good').length, ...STATUS_CONFIG.good },
                { label: '不足', count: NUTRIENT_CHART_ORDER.filter(k => getStatus(k, totals[k] || 0, DAILY_GOALS[k]) === 'low').length, ...STATUS_CONFIG.low },
                { label: '過剰', count: NUTRIENT_CHART_ORDER.filter(k => getStatus(k, totals[k] || 0, DAILY_GOALS[k]) === 'high').length, ...STATUS_CONFIG.high },
              ].map(({ label, count, color, bg }) => (
                <div
                  key={label}
                  style={{
                    flex: 1,
                    background: bg,
                    borderRadius: 10,
                    padding: '12px 8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 24, fontWeight: 700, color }}>{count}</div>
                  <div style={{ fontSize: 11, color, fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: 10, color: '#9E9E9E' }}>/ {NUTRIENT_CHART_ORDER.length}項目</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chart Card */}
        <div className="card">
          {!hasData ? (
            <div className="empty-state">
              <div className="empty-state-emoji">📊</div>
              <div className="empty-state-text">
                食事を記録すると<br />栄養素グラフが表示されます
              </div>
            </div>
          ) : (
            <div>
              {NUTRIENT_CHART_ORDER.map(key => {
                const info = NUTRIENT_LABELS[key]
                if (!info) return null
                return (
                  <NutrientBar
                    key={key}
                    nutrientKey={key}
                    value={totals[key] || 0}
                    goal={DAILY_GOALS[key]}
                    label={info.label}
                    unit={info.unit}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="card">
          <div className="card-title">見方</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 36,
                    height: 10,
                    borderRadius: 99,
                    background: config.barColor,
                  }}
                />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: config.color,
                    minWidth: 32,
                  }}
                >
                  {config.label}
                </span>
                <span style={{ fontSize: 12, color: '#9E9E9E' }}>
                  {key === 'good' && '目標値の60〜120%'}
                  {key === 'low' && '目標値の60%未満'}
                  {key === 'high' && '目標値の120%超'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
