import { useRef, useState } from 'react'
import type { LayoutElement, GroupElement } from './types'
import { Eye, EyeOff, Lock, Unlock, Copy, Trash2, GripVertical } from 'lucide-react'

interface Props {
  elements: LayoutElement[]
  selectedId: string | null
  onSelect: (id: string) => void
  onUpdate: (id: string, patch: Partial<LayoutElement>) => void
  onRemove: (id: string) => void
  onDuplicate: (id: string) => void
  onReorder: (id: string, patch: Partial<LayoutElement>) => void
}

export default function ElementList({ elements, selectedId, onSelect, onUpdate, onRemove, onDuplicate, onReorder }: Props) {
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const dragRef = useRef<string | null>(null)

  const sorted = [...elements].sort((a, b) => {
    if (a.positioning === 'group' && b.positioning === 'group') return a.order - b.order
    if (a.positioning === 'group') return -1
    return 1
  })

  const handleDragStart = (id: string) => {
    dragRef.current = id
    setDragId(id)
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    setDragOverId(id)
  }

  const handleDrop = (targetId: string) => {
    const sourceId = dragRef.current
    if (!sourceId || sourceId === targetId) { setDragId(null); setDragOverId(null); return }

    const source = elements.find((e) => e.id === sourceId)
    const target = elements.find((e) => e.id === targetId)
    if (!source || !target) { setDragId(null); setDragOverId(null); return }

    // Only reorder group elements
    if (source.positioning === 'group' && target.positioning === 'group') {
      const targetOrder = (target as GroupElement).order
      onReorder(sourceId, { order: targetOrder })
      // Shift other elements
      elements
        .filter((e): e is GroupElement => e.positioning === 'group' && e.id !== sourceId)
        .forEach((e) => {
          const srcOrder = (source as GroupElement).order
          if (srcOrder < targetOrder) {
            if (e.order > srcOrder && e.order <= targetOrder) onReorder(e.id, { order: e.order - 1 })
          } else {
            if (e.order >= targetOrder && e.order < srcOrder) onReorder(e.id, { order: e.order + 1 })
          }
        })
    }

    setDragId(null)
    setDragOverId(null)
  }

  return (
    <div style={{ background: '#fafafa', borderRadius: 12, border: '1px solid #eee', overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #eee' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#555' }}>요소 목록</span>
        <span style={{ fontSize: 11, color: '#bbb', marginLeft: 6 }}>{elements.length}</span>
      </div>
      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
        {sorted.map((el) => (
          <div
            key={el.id}
            draggable={el.positioning === 'group'}
            onDragStart={() => handleDragStart(el.id)}
            onDragOver={(e) => handleDragOver(e, el.id)}
            onDrop={() => handleDrop(el.id)}
            onDragEnd={() => { setDragId(null); setDragOverId(null) }}
            onClick={() => onSelect(el.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px',
              background: selectedId === el.id ? '#e8f0fe' : dragOverId === el.id ? '#f0f5ff' : 'transparent',
              opacity: dragId === el.id ? 0.4 : 1,
              cursor: 'pointer',
              borderBottom: '1px solid #f0f0f0',
              transition: 'background 0.1s',
            }}
          >
            {/* Drag handle */}
            {el.positioning === 'group' && (
              <span style={{ cursor: 'grab', color: '#ccc', display: 'flex' }}>
                <GripVertical size={14} />
              </span>
            )}
            <TypeDot type={el.type} />
            <span style={{ fontSize: 12, color: '#333', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {el.label || el.id}
            </span>
            <span style={{ fontSize: 10, color: '#ccc', flexShrink: 0 }}>
              {el.positioning === 'group' ? `#${(el as GroupElement).order}` : 'anchor'}
            </span>
            <IconBtn onClick={(e) => { e.stopPropagation(); onUpdate(el.id, { visible: el.visible === false }) }}>
              {el.visible === false ? <EyeOff size={12} /> : <Eye size={12} />}
            </IconBtn>
            <IconBtn onClick={(e) => { e.stopPropagation(); onUpdate(el.id, { locked: !el.locked }) }}>
              {el.locked ? <Lock size={12} /> : <Unlock size={12} />}
            </IconBtn>
            <IconBtn onClick={(e) => { e.stopPropagation(); onDuplicate(el.id) }}>
              <Copy size={12} />
            </IconBtn>
            <IconBtn onClick={(e) => { e.stopPropagation(); onRemove(el.id) }}>
              <Trash2 size={12} />
            </IconBtn>
          </div>
        ))}
        {elements.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', fontSize: 12, color: '#bbb' }}>
            요소가 없습니다
          </div>
        )}
      </div>
    </div>
  )
}

function TypeDot({ type }: { type: string }) {
  const bg: Record<string, string> = { text: '#3182f6', image: '#e53935', button: '#111' }
  return <div style={{ width: 8, height: 8, borderRadius: 4, background: bg[type] || '#999', flexShrink: 0 }} />
}

function IconBtn({ children, onClick }: { children: React.ReactNode; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button onClick={onClick} style={{ padding: 2, background: 'transparent', border: 'none', color: '#bbb', cursor: 'pointer', display: 'flex' }}>
      {children}
    </button>
  )
}
