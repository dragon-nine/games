import { useState } from 'react'
import type { LayoutIndex } from './types'

interface Props {
  screens: LayoutIndex['screens']
  activeKey: string
  onSelect: (key: string) => void
  onCreate: (key: string, label: string) => void
}

export default function ScreenSelector({ screens, activeKey, onSelect, onCreate }: Props) {
  const [showNew, setShowNew] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [newLabel, setNewLabel] = useState('')

  const handleCreate = () => {
    if (!newKey.trim()) return
    onCreate(newKey.trim(), newLabel.trim() || newKey.trim())
    setNewKey('')
    setNewLabel('')
    setShowNew(false)
  }

  return (
    <>
      {screens.map((s) => (
        <button
          key={s.key}
          onClick={() => onSelect(s.key)}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderBottom: activeKey === s.key ? '2px solid #111' : '2px solid transparent',
            marginBottom: -2,
            background: 'transparent',
            color: activeKey === s.key ? '#111' : '#999',
            fontWeight: activeKey === s.key ? 700 : 400,
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {s.label}
        </button>
      ))}
      {showNew ? (
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '0 8px', marginBottom: -2 }}>
          <input
            placeholder="key"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #ddd', fontSize: 12, width: 80 }}
            autoFocus
          />
          <input
            placeholder="이름"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #ddd', fontSize: 12, width: 60 }}
          />
          <button onClick={handleCreate} style={{ padding: '4px 8px', borderRadius: 4, border: 'none', background: '#111', color: '#fff', fontSize: 11, cursor: 'pointer' }}>추가</button>
          <button onClick={() => setShowNew(false)} style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #ddd', background: '#fff', fontSize: 11, cursor: 'pointer' }}>취소</button>
        </div>
      ) : (
        <button
          onClick={() => setShowNew(true)}
          style={{
            padding: '10px 12px', border: 'none', borderBottom: '2px solid transparent',
            marginBottom: -2, background: 'transparent', color: '#ccc',
            fontSize: 14, cursor: 'pointer',
          }}
        >
          +
        </button>
      )}
    </>
  )
}
