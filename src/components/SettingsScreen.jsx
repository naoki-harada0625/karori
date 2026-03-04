import { useState } from 'react'
import { DAILY_GOALS, NUTRIENT_LABELS } from '../utils/constants'

export default function SettingsScreen({ apiKey, onSaveApiKey, meals, history }) {
  const [inputKey, setInputKey] = useState(apiKey)
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    onSaveApiKey(inputKey.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClear = () => {
    if (confirm('APIキーをクリアしますか？')) {
      setInputKey('')
      onSaveApiKey('')
    }
  }

  const totalFoods = Object.values(history)
    .reduce((sum, dayMeals) => sum + Object.values(dayMeals || {}).flat().length, 0)
  const totalDays = Object.keys(history).filter(d => {
    const dayMeals = history[d]
    return Object.values(dayMeals || {}).flat().length > 0
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
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>設定</div>
        <div style={{ fontSize: 14, opacity: 0.9 }}>APIキーと目標値の確認</div>
      </div>

      <div style={{ padding: '12px 0' }}>
        {/* API Key Card */}
        <div className="card">
          <div className="card-title">🔑 Anthropic APIキー</div>

          <div
            style={{
              background: '#FFF8E1',
              border: '1px solid #FFE082',
              borderRadius: 8,
              padding: '10px 12px',
              fontSize: 13,
              color: '#E65100',
              marginBottom: 16,
              lineHeight: 1.5,
            }}
          >
            ⚠️ APIキーはブラウザのlocalStorageに保存されます。共有PCではご注意ください。
          </div>

          <div style={{ marginBottom: 12 }}>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: '#757575',
                marginBottom: 6,
              }}
            >
              APIキー
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={e => setInputKey(e.target.value)}
                placeholder="sk-ant-..."
                className="input-field"
                style={{ flex: 1, fontFamily: 'monospace', fontSize: 13 }}
              />
              <button
                onClick={() => setShowKey(s => !s)}
                style={{
                  padding: '8px 12px',
                  border: '1.5px solid #E0E0E0',
                  borderRadius: 8,
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: 16,
                  fontFamily: 'inherit',
                  flexShrink: 0,
                }}
              >
                {showKey ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={handleSave}
              disabled={!inputKey.trim()}
            >
              {saved ? '✓ 保存しました' : '保存する'}
            </button>
            {apiKey && (
              <button
                className="btn"
                style={{
                  background: '#FFEBEE',
                  color: '#C62828',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 14,
                }}
                onClick={handleClear}
              >
                クリア
              </button>
            )}
          </div>

          {apiKey && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 12,
                fontSize: 13,
                color: '#4CAF50',
              }}
            >
              <span>✓</span>
              <span>APIキーが設定されています</span>
            </div>
          )}

          <div
            style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: '1px solid #F5F5F5',
              fontSize: 12,
              color: '#9E9E9E',
              lineHeight: 1.6,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4, color: '#757575' }}>APIキーの取得方法</div>
            <div>1. Anthropicの公式サイト (console.anthropic.com) にアクセス</div>
            <div>2. アカウントを作成・ログイン</div>
            <div>3. 「API Keys」メニューからキーを生成</div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="card">
          <div className="card-title">📊 利用統計</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div
              style={{
                background: '#E8F5E9',
                borderRadius: 10,
                padding: '14px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 700, color: '#2E7D32' }}>{totalDays}</div>
              <div style={{ fontSize: 12, color: '#757575' }}>記録日数</div>
            </div>
            <div
              style={{
                background: '#E3F2FD',
                borderRadius: 10,
                padding: '14px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 700, color: '#1565C0' }}>{totalFoods}</div>
              <div style={{ fontSize: 12, color: '#757575' }}>記録食品数</div>
            </div>
          </div>
        </div>

        {/* Daily Goals Card */}
        <div className="card">
          <div className="card-title">🎯 1日の目標値</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {Object.entries(DAILY_GOALS).map(([key, value], idx, arr) => {
              const info = NUTRIENT_LABELS[key]
              if (!info) return null
              return (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: idx < arr.length - 1 ? '1px solid #F5F5F5' : 'none',
                  }}
                >
                  <span style={{ fontSize: 14, color: '#424242' }}>{info.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#212121' }}>
                    {value} {info.unit}
                    {key === 'salt' && <span style={{ fontWeight: 400, color: '#9E9E9E', fontSize: 12 }}> 以下</span>}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* App Info */}
        <div className="card">
          <div className="card-title">ℹ️ アプリについて</div>
          <div style={{ fontSize: 13, color: '#757575', lineHeight: 1.8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span>アプリ名</span>
              <span style={{ color: '#212121', fontWeight: 500 }}>カロリー</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span>バージョン</span>
              <span style={{ color: '#212121', fontWeight: 500 }}>1.0.0</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span>AIモデル</span>
              <span style={{ color: '#212121', fontWeight: 500 }}>Claude Sonnet</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span>データ保存</span>
              <span style={{ color: '#212121', fontWeight: 500 }}>ブラウザ内</span>
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: '1px solid #F5F5F5',
              fontSize: 12,
              color: '#BDBDBD',
              textAlign: 'center',
              lineHeight: 1.6,
            }}
          >
            栄養素の数値はAIによる推定値です。<br />
            正確な栄養管理には専門家にご相談ください。
          </div>
        </div>
      </div>
    </div>
  )
}
