import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { listBlobs, uploadBlob } from '../api'

/* ── Types ── */

interface LayoutElement {
  id: string
  x: number        // 0-1 ratio (center anchor)
  y: number        // 0-1 ratio (center anchor)
  widthRatio: number // 0-1 ratio
  type: 'text' | 'image'
  label?: string
  imageUrl?: string
}

interface ScreenLayout {
  screen: string
  elements: LayoutElement[]
}

/* ── Constants ── */

// Reference phone resolution (9:16)
const PHONE_W = 390
const PHONE_H = 693 // 390 * 16/9 ≈ 693

const SCREEN_OPTIONS = [
  { key: 'game-over', label: '게임오버 스크린' },
]

const SCREEN_DEFAULTS: Record<string, LayoutElement[]> = {
  'game-over': [
    { id: 'bestText', x: 0.5, y: 0.12, widthRatio: 0.6, type: 'text', label: '최고기록 33' },
    { id: 'scoreText', x: 0.5, y: 0.20, widthRatio: 0.4, type: 'text', label: '33' },
    { id: 'go-rabbit', x: 0.5, y: 0.35, widthRatio: 0.45, type: 'image' },
    { id: 'quoteText', x: 0.5, y: 0.47, widthRatio: 0.7, type: 'text', label: '퇴근은 쉬운게 아니야...\n인생이 원래 그래' },
    { id: 'go-btn-revive', x: 0.5, y: 0.58, widthRatio: 0.85, type: 'image' },
    { id: 'go-btn-home', x: 0.5, y: 0.68, widthRatio: 0.85, type: 'image' },
    { id: 'go-btn-challenge', x: 0.35, y: 0.78, widthRatio: 0.40, type: 'image' },
    { id: 'go-btn-ranking', x: 0.65, y: 0.78, widthRatio: 0.40, type: 'image' },
  ],
}

const ASSET_PATHS: Record<string, string> = {
  'go-rabbit': 'game01/game-over-screen/gameover-rabbit.png',
  'go-btn-revive': 'game01/game-over-screen/btn-revive.png',
  'go-btn-home': 'game01/game-over-screen/btn-home.png',
  'go-btn-challenge': 'game01/game-over-screen/btn-challenge.png',
  'go-btn-ranking': 'game01/game-over-screen/btn-ranking.png',
}

/* ── Helpers ── */

// Convert px gap change to ratio (based on phone height)
function pxToRatioY(px: number) { return px / PHONE_H }

/* ── Props ── */

interface Props {
  gameId: string
  gameName: string
  onBanner: (type: 'success' | 'error', message: string) => void
}

/* ── Component ── */

export default function LayoutEditorTab({ gameId, onBanner }: Props) {
  const [screen, setScreen] = useState('game-over')
  const [elements, setElements] = useState<LayoutElement[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [assetUrls, setAssetUrls] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const phoneRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    id: string
    startX: number
    startY: number
    startElX: number
    startElY: number
  } | null>(null)

  // Load asset URLs from Blob
  useEffect(() => {
    async function loadAssets() {
      try {
        const blobs = await listBlobs(`${gameId}/game-over-screen/`)
        const urls: Record<string, string> = {}
        for (const [key, path] of Object.entries(ASSET_PATHS)) {
          const blob = blobs.find((b) => b.pathname === path)
          if (blob) urls[key] = blob.url
        }
        setAssetUrls(urls)
      } catch { /* ignore */ }
    }
    loadAssets()
  }, [gameId])

  // Load layout from Blob or use defaults
  useEffect(() => {
    async function loadLayout() {
      try {
        const blobs = await listBlobs(`${gameId}/layout/`)
        const layoutBlob = blobs.find((b) => b.pathname === `${gameId}/layout/${screen}.json`)
        if (layoutBlob) {
          const res = await fetch(layoutBlob.url)
          const data: ScreenLayout = await res.json()
          const els = data.elements.map((el) => ({
            ...el,
            imageUrl: assetUrls[el.id],
            label: SCREEN_DEFAULTS[screen]?.find((d) => d.id === el.id)?.label ?? el.label,
          }))
          setElements(els)
          return
        }
      } catch { /* ignore */ }
      setElements(
        (SCREEN_DEFAULTS[screen] || []).map((el) => ({
          ...el,
          imageUrl: assetUrls[el.id],
        })),
      )
    }
    loadLayout()
  }, [screen, gameId, assetUrls])

  // Update element
  const updateEl = useCallback((id: string, patch: Partial<LayoutElement>) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...patch } : el)))
  }, [])

  // ── Drag handlers ──
  const handlePointerDown = useCallback(
    (e: React.PointerEvent, id: string) => {
      e.preventDefault()
      e.currentTarget.setPointerCapture(e.pointerId)
      const el = elements.find((el) => el.id === id)
      if (!el) return
      setSelectedId(id)
      dragRef.current = { id, startX: e.clientX, startY: e.clientY, startElX: el.x, startElY: el.y }
    },
    [elements],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current || !phoneRef.current) return
      const rect = phoneRef.current.getBoundingClientRect()
      const dx = (e.clientX - dragRef.current.startX) / rect.width
      const dy = (e.clientY - dragRef.current.startY) / rect.height
      const newX = Math.max(0, Math.min(1, dragRef.current.startElX + dx))
      const newY = Math.max(0, Math.min(1, dragRef.current.startElY + dy))
      updateEl(dragRef.current.id, { x: newX, y: newY })
    },
    [updateEl],
  )

  const handlePointerUp = useCallback(() => {
    dragRef.current = null
  }, [])

  // ── Alignment actions ──

  // Center selected element horizontally
  const centerSelectedH = () => {
    if (selectedId) updateEl(selectedId, { x: 0.5 })
  }

  // Center ALL elements horizontally (x=0.5)
  const centerAllH = () => {
    setElements((prev) => prev.map((el) => ({ ...el, x: 0.5 })))
  }

  // Center entire group vertically (shift so group midpoint = 0.5)
  const centerGroupV = () => {
    if (elements.length === 0) return
    const ys = elements.map((el) => el.y)
    const mid = (Math.min(...ys) + Math.max(...ys)) / 2
    const offset = 0.5 - mid
    setElements((prev) =>
      prev.map((el) => ({ ...el, y: clampY(el.y + offset) })),
    )
  }

  // Distribute evenly (equal vertical spacing)
  const distributeEvenly = () => {
    const sorted = [...elements].sort((a, b) => a.y - b.y)
    if (sorted.length < 2) return
    const pad = 0.06
    const step = (1 - pad * 2) / (sorted.length - 1)
    const idToY: Record<string, number> = {}
    sorted.forEach((el, i) => { idToY[el.id] = pad + step * i })
    setElements((prev) => prev.map((el) => ({ ...el, y: idToY[el.id] ?? el.y })))
  }

  // Adjust gap by actual px amount (applied to vertical spacing)
  const adjustGapPx = (deltaPx: number) => {
    const sorted = [...elements].sort((a, b) => a.y - b.y)
    if (sorted.length < 2) return
    // Calculate current total gap in ratio
    const first = sorted[0].y
    const last = sorted[sorted.length - 1].y
    const totalSpan = last - first
    if (totalSpan < 0.001) return
    // Add deltaPx converted to ratio
    const deltaRatio = pxToRatioY(deltaPx)
    const newSpan = Math.max(0.05, totalSpan + deltaRatio * (sorted.length - 1))
    const scale = newSpan / totalSpan
    const center = (first + last) / 2
    setElements((prev) =>
      prev.map((el) => ({
        ...el,
        y: clampY(center + (el.y - center) * scale),
      })),
    )
  }

  // Reset to defaults
  const resetDefaults = () => {
    setElements(
      (SCREEN_DEFAULTS[screen] || []).map((el) => ({
        ...el,
        imageUrl: assetUrls[el.id],
      })),
    )
    setSelectedId(null)
  }

  // Save
  const handleSave = async () => {
    setSaving(true)
    try {
      const layout: ScreenLayout = {
        screen,
        elements: elements.map(({ id, x, y, widthRatio, type }) => ({ id, x, y, widthRatio, type })),
      }
      const blob = new Blob([JSON.stringify(layout, null, 2)], { type: 'application/json' })
      const file = new File([blob], `${screen}.json`, { type: 'application/json' })
      await uploadBlob(file, `${gameId}/layout/`, `${screen}.json`)
      onBanner('success', '레이아웃이 저장되었습니다')
    } catch (err) {
      onBanner('error', `저장 실패: ${(err as Error).message}`)
    }
    setSaving(false)
  }

  const selected = elements.find((el) => el.id === selectedId)

  // Compute px values for inspector display
  const selectedPx = useMemo(() => {
    if (!selected) return null
    return {
      x: Math.round(selected.x * PHONE_W),
      y: Math.round(selected.y * PHONE_H),
      w: Math.round(selected.widthRatio * PHONE_W),
    }
  }, [selected])

  return (
    <div className="le">
      <div className="le-header">
        <h2>레이아웃 편집</h2>
        <select value={screen} onChange={(e) => setScreen(e.target.value)}>
          {SCREEN_OPTIONS.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Toolbar */}
      <div className="le-toolbar">
        <div className="le-toolbar-group">
          <span className="le-toolbar-label">정렬</span>
          <button className="le-btn" onClick={centerSelectedH} disabled={!selectedId} title="선택 요소 수평 중앙">
            ↔ 중앙
          </button>
          <button className="le-btn" onClick={centerAllH} title="전체 수평 중앙">
            ⊞ 전체 중앙
          </button>
          <button className="le-btn" onClick={centerGroupV} title="전체 수직 중앙">
            ↕ 수직 중앙
          </button>
        </div>
        <div className="le-toolbar-group">
          <span className="le-toolbar-label">간격</span>
          <button className="le-btn" onClick={distributeEvenly} title="균등 배분">
            ⇕ 균등
          </button>
          <button className="le-btn" onClick={() => adjustGapPx(4)} title="간격 +4px">+ 4px</button>
          <button className="le-btn" onClick={() => adjustGapPx(-4)} title="간격 -4px">- 4px</button>
          <button className="le-btn" onClick={() => adjustGapPx(12)} title="간격 +12px">+ 12px</button>
          <button className="le-btn" onClick={() => adjustGapPx(-12)} title="간격 -12px">- 12px</button>
        </div>
        <div className="le-toolbar-group le-toolbar-actions">
          <button className="le-btn le-btn-ghost" onClick={resetDefaults} title="기본값 복원">
            ↺ 초기화
          </button>
          <button className="le-btn le-btn-save" onClick={handleSave} disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      <div className="le-body">
        {/* Phone Preview */}
        <div className="le-phone-wrap">
          <div className="le-phone-bezel">
            <div className="le-phone-notch" />
            <div
              className="le-phone-screen"
              ref={phoneRef}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onClick={() => setSelectedId(null)}
            >
              {elements.map((el) => (
                <div
                  key={el.id}
                  className={`le-el${el.id === selectedId ? ' le-el-selected' : ''}`}
                  style={{
                    left: `${el.x * 100}%`,
                    top: `${el.y * 100}%`,
                    width: `${el.widthRatio * 100}%`,
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    handlePointerDown(e, el.id)
                  }}
                >
                  {el.type === 'image' && assetUrls[el.id] ? (
                    <img src={assetUrls[el.id]} alt={el.id} draggable={false} />
                  ) : (
                    <div className="le-el-text">{el.label || el.id}</div>
                  )}
                  <div className="le-el-tag">{el.id}</div>
                </div>
              ))}
            </div>
            <div className="le-phone-home" />
          </div>
          <div className="le-phone-ref">기준: {PHONE_W}×{PHONE_H}px</div>
        </div>

        {/* Inspector */}
        <div className="le-inspector">
          <h3>속성</h3>
          {selected && selectedPx ? (
            <div className="le-fields">
              <div className="le-field">
                <label>ID</label>
                <span className="le-field-val">{selected.id}</span>
              </div>
              <div className="le-field">
                <label>X</label>
                <div className="le-field-row">
                  <input
                    type="number"
                    min={0} max={1} step={0.01}
                    value={selected.x.toFixed(3)}
                    onChange={(e) => updateEl(selected.id, { x: parseFloat(e.target.value) || 0 })}
                  />
                  <span className="le-field-px">{selectedPx.x}px</span>
                </div>
              </div>
              <div className="le-field">
                <label>Y</label>
                <div className="le-field-row">
                  <input
                    type="number"
                    min={0} max={1} step={0.01}
                    value={selected.y.toFixed(3)}
                    onChange={(e) => updateEl(selected.id, { y: parseFloat(e.target.value) || 0 })}
                  />
                  <span className="le-field-px">{selectedPx.y}px</span>
                </div>
              </div>
              <div className="le-field">
                <label>너비</label>
                <div className="le-field-row">
                  <input
                    type="number"
                    min={0.05} max={1} step={0.05}
                    value={selected.widthRatio.toFixed(2)}
                    onChange={(e) => updateEl(selected.id, { widthRatio: parseFloat(e.target.value) || 0.5 })}
                  />
                  <span className="le-field-px">{selectedPx.w}px</span>
                </div>
              </div>
              <div className="le-field-actions">
                <button className="le-btn le-btn-sm" onClick={centerSelectedH}>↔ 수평 중앙</button>
              </div>
            </div>
          ) : (
            <p className="le-hint">요소를 클릭하여 선택하세요</p>
          )}

          {/* Element list */}
          <h3 style={{ marginTop: 20 }}>요소 목록</h3>
          <div className="le-el-list">
            {elements.map((el) => (
              <div
                key={el.id}
                className={`le-el-item${el.id === selectedId ? ' active' : ''}`}
                onClick={() => setSelectedId(el.id)}
              >
                <span className="le-el-item-type">{el.type === 'image' ? '🖼' : 'T'}</span>
                <span className="le-el-item-id">{el.id}</span>
                <span className="le-el-item-pos">
                  {Math.round(el.x * PHONE_W)}, {Math.round(el.y * PHONE_H)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function clampY(v: number) { return Math.max(0.02, Math.min(0.98, v)) }
