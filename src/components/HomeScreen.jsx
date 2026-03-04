import { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { DAILY_GOALS, MEAL_TYPES, PFC_COLORS } from '../utils/constants'
import { formatDateJP } from '../utils/dateUtils'
import MealSection from './MealSection'
import FoodInputModal from './FoodInputModal'

function CalorieCard({ totalCalories }) {
  const goal = DAILY_GOALS.calories
  const remaining = goal - totalCalories
  const percent = Math.min((totalCalories / goal) * 100, 100)
  const isOver = totalCalories > goal

  const barColor = isOver
    ? '#F44336'
    : percent > 80
    ? '#FF9800'
    : '#4CAF50'

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#757575', marginBottom: 4 }}>今日の摂取カロリー</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: isOver ? '#F44336' : '#212121' }}>
              {Math.round(totalCalories).toLocaleString()}
            </span>
            <span style={{ fontSize: 14, color: '#757575' }}>/ {goal.toLocaleString()} kcal</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#757575', marginBottom: 4 }}>
            {isOver ? '超過' : '残り'}
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: isOver ? '#F44336' : '#4CAF50',
            }}
          >
            {isOver ? '+' : ''}{Math.abs(Math.round(remaining)).toLocaleString()} kcal
          </div>
        </div>
      </div>
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{
            width: `${percent}%`,
            background: barColor,
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: 11, color: '#BDBDBD' }}>0</span>
        <span style={{ fontSize: 11, color: '#757575' }}>目標 {goal.toLocaleString()} kcal</span>
      </div>
    </div>
  )
}

function PFCCard({ meals }) {
  const totals = useMemo(() => {
    const allFoods = Object.values(meals).flat()
    return {
      protein: allFoods.reduce((s, f) => s + (f.protein || 0) * (f.quantity || 1), 0),
      fat: allFoods.reduce((s, f) => s + (f.fat || 0) * (f.quantity || 1), 0),
      carbs: allFoods.reduce((s, f) => s + (f.carbs || 0) * (f.quantity || 1), 0),
    }
  }, [meals])

  const proteinCal = totals.protein * 4
  const fatCal = totals.fat * 9
  const carbsCal = totals.carbs * 4
  const totalCal = proteinCal + fatCal + carbsCal

  const data = totalCal > 0
    ? [
        { name: 'たんぱく質', value: Math.round(proteinCal), key: 'protein' },
        { name: '脂質', value: Math.round(fatCal), key: 'fat' },
        { name: '炭水化物', value: Math.round(carbsCal), key: 'carbs' },
      ]
    : [{ name: '未記録', value: 1, key: 'empty' }]

  const isEmpty = totalCal === 0

  return (
    <div className="card">
      <div className="card-title">PFCバランス</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 100, height: 100, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={28}
                outerRadius={44}
                paddingAngle={isEmpty ? 0 : 2}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={isEmpty ? '#E0E0E0' : PFC_COLORS[entry.key] || '#E0E0E0'}
                  />
                ))}
              </Pie>
              {!isEmpty && <Tooltip formatter={(v, n) => [`${v}kcal`, n]} />}
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1 }}>
          {[
            { key: 'protein', label: 'たんぱく質', goal: DAILY_GOALS.protein },
            { key: 'fat', label: '脂質', goal: DAILY_GOALS.fat },
            { key: 'carbs', label: '炭水化物', goal: DAILY_GOALS.carbs },
          ].map(({ key, label, goal }) => {
            const value = totals[key]
            const pct = Math.min((value / goal) * 100, 100)
            return (
              <div key={key} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: PFC_COLORS[key],
                        display: 'inline-block',
                      }}
                    />
                    {label}
                  </span>
                  <span style={{ fontSize: 12, color: '#757575' }}>
                    {value.toFixed(1)}g / {goal}g
                  </span>
                </div>
                <div className="progress-bar" style={{ height: 6 }}>
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${pct}%`, background: PFC_COLORS[key] }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function HomeScreen({ meals, apiKey, currentDate, onAddFood, onRemoveFood }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [activeMealType, setActiveMealType] = useState(null)

  const totalCalories = useMemo(() => {
    return Object.values(meals)
      .flat()
      .reduce((s, f) => s + (f.calories || 0) * (f.quantity || 1), 0)
  }, [meals])

  const handleOpenModal = (mealType) => {
    setActiveMealType(mealType)
    setModalOpen(true)
  }

  const handleAddFood = (food) => {
    onAddFood(activeMealType, food)
    setModalOpen(false)
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
        <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 2 }}>
          {formatDateJP(currentDate)}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>今日の食事記録</div>
      </div>

      <div style={{ marginTop: 12 }}>
        <CalorieCard totalCalories={totalCalories} />
        <PFCCard meals={meals} />

        {/* Meal Sections */}
        {MEAL_TYPES.map(mealType => (
          <MealSection
            key={mealType.key}
            mealType={mealType}
            foods={meals[mealType.key]}
            onAddFood={() => handleOpenModal(mealType.key)}
            onRemoveFood={(foodId) => onRemoveFood(mealType.key, foodId)}
          />
        ))}
      </div>

      {modalOpen && (
        <FoodInputModal
          apiKey={apiKey}
          onAdd={handleAddFood}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
