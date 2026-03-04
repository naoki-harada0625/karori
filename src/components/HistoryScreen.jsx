import { useState, useMemo } from 'react'
import { DAILY_GOALS } from '../utils/constants'
import { formatDateJP, formatDateShort, getDaysInMonth, getFirstDayOfMonth } from '../utils/dateUtils'

function computeTotals(dayMeals) {
  if (!dayMeals) return null
  const allFoods = Object.values(dayMeals).flat()
  if (allFoods.length === 0) return null
  return {
    calories: allFoods.reduce((s, f) => s + (f.calories || 0) * (f.quantity || 1), 0),
    protein: allFoods.reduce((s, f) => s + (f.protein || 0) * (f.quantity || 1), 0),
    fat: allFoods.reduce((s, f) => s + (f.fat || 0) * (f.quantity || 1), 0),
    carbs: allFoods.reduce((s, f) => s + (f.carbs || 0) * (f.quantity || 1), 0),
    foodCount: allFoods.length,
  }
}

function CalorieBar({ calories }) {
  const pct = Math.min((calories / DAILY_GOALS.calories) * 100, 100)
  const isOver = calories > DAILY_GOALS.calories
  const color = isOver ? '#EF5350' : pct > 80 ? '#FFA726' : '#66BB6A'
  return (
    <div style={{ marginTop: 4 }}>
      <div className="progress-bar" style={{ height: 6 }}>
        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function DayDetail({ dateStr, dayMeals, onClose }) {
  const totals = computeTotals(dayMeals)
  const MEAL_LABELS = { breakfast: '朝食', lunch: '昼食', dinner: '夕食', snack: '間食' }
  const MEAL_EMOJIS = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-header">
          <h2>{formatDateJP(dateStr)}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {totals && (
            <div
              style={{
                background: '#E8F5E9',
                borderRadius: 10,
                padding: '14px 16px',
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 12, color: '#757575', marginBottom: 6 }}>合計カロリー</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#2E7D32' }}>
                {Math.round(totals.calories).toLocaleString()} kcal
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                {[
                  { label: 'P', value: `${totals.protein.toFixed(1)}g`, color: '#FF6B6B' },
                  { label: 'F', value: `${totals.fat.toFixed(1)}g`, color: '#FFD93D' },
                  { label: 'C', value: `${totals.carbs.toFixed(1)}g`, color: '#6BCB77' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ fontSize: 13, color: '#757575' }}>
                    <span style={{ fontWeight: 700, color }}>{label}: </span>{value}
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.entries(MEAL_LABELS).map(([key, label]) => {
            const foods = dayMeals?.[key] || []
            if (foods.length === 0) return null
            return (
              <div key={key} style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#757575',
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>{MEAL_EMOJIS[key]}</span>
                  {label}
                </div>
                {foods.map((food, idx) => (
                  <div
                    key={food.id || idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: idx < foods.length - 1 ? '1px solid #F5F5F5' : 'none',
                    }}
                  >
                    <span style={{ fontSize: 14, color: '#212121' }}>
                      {food.name}
                      {food.quantity && food.quantity !== 1 && (
                        <span style={{ color: '#9E9E9E', fontSize: 12 }}> ×{food.quantity}</span>
                      )}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#FF7043' }}>
                      {Math.round((food.calories || 0) * (food.quantity || 1))} kcal
                    </span>
                  </div>
                ))}
              </div>
            )
          })}

          {!totals && (
            <div className="empty-state">
              <div className="empty-state-emoji">📭</div>
              <div className="empty-state-text">この日の記録はありません</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Calendar({ year, month, history, onSelectDate, selectedDate }) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 2,
          marginBottom: 8,
        }}
      >
        {weekdays.map((w, i) => (
          <div
            key={w}
            style={{
              textAlign: 'center',
              fontSize: 11,
              fontWeight: 600,
              color: i === 0 ? '#EF5350' : i === 6 ? '#1565C0' : '#9E9E9E',
              padding: '4px 0',
            }}
          >
            {w}
          </div>
        ))}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 4,
        }}
      >
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayData = history[dateStr]
          const totals = computeTotals(dayData)
          const isSelected = selectedDate === dateStr
          const isToday = dateStr === new Date().toISOString().split('T')[0]
          const pct = totals ? Math.min((totals.calories / DAILY_GOALS.calories) * 100, 100) : 0
          const dotColor = totals
            ? totals.calories > DAILY_GOALS.calories
              ? '#EF5350'
              : pct > 70
              ? '#66BB6A'
              : '#FFA726'
            : null

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              style={{
                aspectRatio: '1',
                borderRadius: 8,
                border: isSelected
                  ? '2px solid #4CAF50'
                  : isToday
                  ? '2px solid #A5D6A7'
                  : '1px solid transparent',
                background: isSelected ? '#E8F5E9' : 'white',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                padding: '4px 2px',
                fontFamily: 'inherit',
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: isToday ? 700 : 400,
                  color: isSelected ? '#2E7D32' : isToday ? '#4CAF50' : '#424242',
                }}
              >
                {day}
              </span>
              {dotColor && (
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: dotColor,
                  }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function HistoryScreen({ history, currentDate }) {
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState(null)

  const sortedDates = useMemo(() => {
    return Object.keys(history)
      .filter(d => computeTotals(history[d]) !== null)
      .sort((a, b) => b.localeCompare(a))
  }, [history])

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(y => y - 1)
      setViewMonth(11)
    } else {
      setViewMonth(m => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(y => y + 1)
      setViewMonth(0)
    } else {
      setViewMonth(m => m + 1)
    }
  }

  const monthName = `${viewYear}年${viewMonth + 1}月`

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
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>食事履歴</div>
        <div style={{ fontSize: 14, opacity: 0.9 }}>{sortedDates.length}日分の記録</div>
      </div>

      <div style={{ padding: '12px 0' }}>
        {/* Calendar Card */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <button
              onClick={handlePrevMonth}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '1px solid #E0E0E0',
                background: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                color: '#757575',
                fontFamily: 'inherit',
              }}
            >
              ‹
            </button>
            <span style={{ fontSize: 16, fontWeight: 700 }}>{monthName}</span>
            <button
              onClick={handleNextMonth}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '1px solid #E0E0E0',
                background: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                color: '#757575',
                fontFamily: 'inherit',
              }}
            >
              ›
            </button>
          </div>
          <Calendar
            year={viewYear}
            month={viewMonth}
            history={history}
            onSelectDate={setSelectedDate}
            selectedDate={selectedDate}
          />
        </div>

        {/* History List */}
        {sortedDates.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-emoji">📅</div>
              <div className="empty-state-text">
                まだ食事が記録されていません<br />
                ホームから食事を追加してみましょう
              </div>
            </div>
          </div>
        ) : (
          <div>
            {sortedDates.map(dateStr => {
              const dayMeals = history[dateStr]
              const totals = computeTotals(dayMeals)
              if (!totals) return null
              const isToday = dateStr === currentDate

              return (
                <div
                  key={dateStr}
                  className="card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedDate(dateStr)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#212121' }}>
                          {formatDateJP(dateStr)}
                        </span>
                        {isToday && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: '#4CAF50',
                              background: '#E8F5E9',
                              padding: '1px 6px',
                              borderRadius: 99,
                            }}
                          >
                            今日
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 10, fontSize: 12, color: '#9E9E9E' }}>
                        <span>P: {totals.protein.toFixed(1)}g</span>
                        <span>F: {totals.fat.toFixed(1)}g</span>
                        <span>C: {totals.carbs.toFixed(1)}g</span>
                        <span>{totals.foodCount}品</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#212121' }}>
                        {Math.round(totals.calories).toLocaleString()}
                      </div>
                      <div style={{ fontSize: 11, color: '#9E9E9E' }}>kcal</div>
                    </div>
                  </div>
                  <CalorieBar calories={totals.calories} />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Day Detail Modal */}
      {selectedDate && (
        <DayDetail
          dateStr={selectedDate}
          dayMeals={history[selectedDate]}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  )
}
