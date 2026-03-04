export const DAILY_GOALS = {
  calories: 1650,
  protein: 60,
  fat: 55,
  carbs: 220,
  fiber: 21,
  salt: 7.5,
  calcium: 650,
  iron: 7.5,
  vitaminA: 850,
  vitaminB1: 1.4,
  vitaminB2: 1.6,
  vitaminC: 100,
}

export const NUTRIENT_LABELS = {
  calories: { label: 'エネルギー', unit: 'kcal' },
  protein: { label: 'たんぱく質', unit: 'g' },
  fat: { label: '脂質', unit: 'g' },
  carbs: { label: '炭水化物', unit: 'g' },
  fiber: { label: '食物繊維', unit: 'g' },
  salt: { label: '塩分', unit: 'g' },
  calcium: { label: 'カルシウム', unit: 'mg' },
  iron: { label: '鉄', unit: 'mg' },
  vitaminA: { label: 'ビタミンA', unit: 'μg' },
  vitaminB1: { label: 'ビタミンB1', unit: 'mg' },
  vitaminB2: { label: 'ビタミンB2', unit: 'mg' },
  vitaminC: { label: 'ビタミンC', unit: 'mg' },
}

export const MEAL_TYPES = [
  { key: 'breakfast', label: '朝食', emoji: '🌅' },
  { key: 'lunch', label: '昼食', emoji: '☀️' },
  { key: 'dinner', label: '夕食', emoji: '🌙' },
  { key: 'snack', label: '間食', emoji: '🍎' },
]

export const STORAGE_KEYS = {
  HISTORY: 'karori_history',
  API_KEY: 'karori_api_key',
  TODAY_MEALS: 'karori_today_meals',
}

export const PFC_COLORS = {
  protein: '#FF6B6B',
  fat: '#FFD93D',
  carbs: '#6BCB77',
}

export const NUTRIENT_CHART_ORDER = [
  'calories', 'protein', 'fat', 'carbs', 'calcium', 'iron',
  'vitaminA', 'vitaminB1', 'vitaminB2', 'vitaminC', 'fiber', 'salt',
]
