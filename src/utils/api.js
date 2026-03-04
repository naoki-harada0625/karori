const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

export async function fetchNutrition(foodName, apiKey) {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `以下の食品の栄養素を推定してJSON形式で返してください。外食チェーン店のメニューの場合は公式の栄養情報に基づいてください。

食品名: ${foodName}

以下のJSON形式のみで返してください（説明文は一切不要）:
{
  "name": "食品名",
  "calories": 500,
  "protein": 25.0,
  "fat": 20.0,
  "carbs": 50.0,
  "fiber": 2.0,
  "salt": 2.5,
  "calcium": 100,
  "iron": 1.5,
  "vitaminA": 50,
  "vitaminB1": 0.1,
  "vitaminB2": 0.15,
  "vitaminC": 5
}`,
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `APIエラー: ${response.status}`)
  }

  const data = await response.json()
  const text = data.content[0].text
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('レスポンスの形式が不正です')

  return JSON.parse(jsonMatch[0])
}

export async function fetchAdvice(meals, totalNutrition, apiKey) {
  const mealTypeLabels = {
    breakfast: '朝食',
    lunch: '昼食',
    dinner: '夕食',
    snack: '間食',
  }

  const mealSummary = Object.entries(meals)
    .map(([type, foods]) => {
      const label = mealTypeLabels[type]
      const foodList = foods.length > 0 ? foods.map(f => f.name).join('、') : 'なし'
      return `${label}: ${foodList}`
    })
    .join('\n')

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `今日の食事内容を元に栄養アドバイスをお願いします。優しく、褒めながら改善点を伝えるトーンでお願いします。

【今日の食事】
${mealSummary}

【合計栄養素】
カロリー: ${Math.round(totalNutrition.calories)}kcal（目標: 1650kcal）
たんぱく質: ${totalNutrition.protein.toFixed(1)}g（目標: 60g）
脂質: ${totalNutrition.fat.toFixed(1)}g（目標: 55g）
炭水化物: ${totalNutrition.carbs.toFixed(1)}g（目標: 220g）
食物繊維: ${totalNutrition.fiber.toFixed(1)}g（目標: 21g）
塩分: ${totalNutrition.salt.toFixed(1)}g（目標: 7.5g以下）
カルシウム: ${Math.round(totalNutrition.calcium)}mg（目標: 650mg）
鉄: ${totalNutrition.iron.toFixed(1)}mg（目標: 7.5mg）

以下のJSON形式のみで返してください（説明文は一切不要）:
{
  "score": 75,
  "comment": "総合コメント（2-3文。優しく褒めながら）",
  "calorieBalance": "カロリーバランスの評価（1-2文）",
  "nutritionComments": [
    {"nutrient": "栄養素名", "status": "good", "comment": "コメント"},
    {"nutrient": "栄養素名", "status": "low", "comment": "コメント"},
    {"nutrient": "栄養素名", "status": "high", "comment": "コメント"}
  ],
  "improvements": [
    "改善提案1（具体的なメニュー例を含む）",
    "改善提案2（具体的なメニュー例を含む）",
    "改善提案3（具体的なメニュー例を含む）"
  ]
}`,
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `APIエラー: ${response.status}`)
  }

  const data = await response.json()
  const text = data.content[0].text
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('レスポンスの形式が不正です')

  return JSON.parse(jsonMatch[0])
}
