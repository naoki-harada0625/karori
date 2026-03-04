import { useState } from 'react'

export default function MealSection({ mealType, foods, onAddFood, onRemoveFood }) {
  const [expanded, setExpanded] = useState(true)

  const totalCal = foods.reduce((s, f) => s + (f.calories || 0) * (f.quantity || 1), 0)

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Section Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>{mealType.emoji}</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#212121' }}>{mealType.label}</span>
          {foods.length > 0 && (
            <span
              style={{
                fontSize: 12,
                color: '#757575',
                background: '#F5F5F5',
                padding: '2px 8px',
                borderRadius: 99,
              }}
            >
              {foods.length}品
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {totalCal > 0 && (
            <span style={{ fontSize: 14, fontWeight: 600, color: '#4CAF50' }}>
              {Math.round(totalCal)} kcal
            </span>
          )}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="#BDBDBD"
            style={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.2s',
            }}
          >
            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div style={{ borderTop: '1px solid #F5F5F5' }}>
          {/* Food Items */}
          {foods.length === 0 ? (
            <div
              style={{
                padding: '12px 16px',
                color: '#BDBDBD',
                fontSize: 13,
                textAlign: 'center',
              }}
            >
              まだ何も記録されていません
            </div>
          ) : (
            <div>
              {foods.map((food, idx) => (
                <FoodItem
                  key={food.id || idx}
                  food={food}
                  onRemove={() => onRemoveFood(food.id)}
                  isLast={idx === foods.length - 1}
                />
              ))}
            </div>
          )}

          {/* Add Button */}
          <div style={{ padding: '10px 16px' }}>
            <button
              onClick={onAddFood}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '10px',
                background: '#F1F8E9',
                border: '1.5px dashed #81C784',
                borderRadius: 8,
                color: '#4CAF50',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ fontSize: 18 }}>＋</span>
              食品を追加
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function FoodItem({ food, onRemove, isLast }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const calories = Math.round((food.calories || 0) * (food.quantity || 1))

  return (
    <div
      style={{
        padding: '10px 16px',
        borderBottom: isLast ? 'none' : '1px solid #F5F5F5',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#212121' }}>
            {food.name}
          </span>
          {food.quantity && food.quantity !== 1 && (
            <span style={{ fontSize: 12, color: '#9E9E9E' }}>×{food.quantity}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
          <NutrientTag value={`${calories}kcal`} color="#FF7043" />
          <NutrientTag value={`P:${((food.protein || 0) * (food.quantity || 1)).toFixed(1)}g`} color="#FF6B6B" />
          <NutrientTag value={`F:${((food.fat || 0) * (food.quantity || 1)).toFixed(1)}g`} color="#FFD93D" />
          <NutrientTag value={`C:${((food.carbs || 0) * (food.quantity || 1)).toFixed(1)}g`} color="#6BCB77" />
        </div>
      </div>
      {showConfirm ? (
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={onRemove}
            style={{
              padding: '4px 10px',
              background: '#F44336',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 600,
            }}
          >
            削除
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            style={{
              padding: '4px 10px',
              background: '#E0E0E0',
              color: '#757575',
              border: 'none',
              borderRadius: 6,
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: '#F5F5F5',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#BDBDBD',
            fontSize: 16,
            flexShrink: 0,
            fontFamily: 'inherit',
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}

function NutrientTag({ value, color }) {
  return (
    <span
      style={{
        fontSize: 11,
        color,
        background: `${color}18`,
        padding: '1px 6px',
        borderRadius: 4,
        fontWeight: 500,
      }}
    >
      {value}
    </span>
  )
}
