import { useState, useEffect, useCallback } from 'react'
import { getJson, putJson } from '../api'

interface CheckItem {
  id: string
  text: string
  done: boolean
}

interface Checklist {
  id: string
  title: string
  items: CheckItem[]
  updatedAt: string
}

const STORE_KEY = 'admin/checklists.json'

interface Props {
  onBanner: (type: 'success' | 'error', message: string) => void
}

export default function ChecklistTab({ onBanner }: Props) {
  const [lists, setLists] = useState<Checklist[]>([])
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newItemTexts, setNewItemTexts] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    try {
      const data = await getJson<Checklist[]>(STORE_KEY)
      setLists(data || [])
    } catch {
      // empty
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const save = useCallback(async (updated: Checklist[]) => {
    setSaving(true)
    try {
      await putJson(STORE_KEY, updated)
      setLists(updated)
    } catch (err) {
      onBanner('error', `저장 실패: ${(err as Error).message}`)
    } finally {
      setSaving(false)
    }
  }, [onBanner])

  const handleNewList = () => {
    const list: Checklist = {
      id: Date.now().toString(),
      title: '새 체크리스트',
      items: [],
      updatedAt: new Date().toISOString(),
    }
    save([list, ...lists])
  }

  const handleDeleteList = (listId: string) => {
    if (!confirm('이 체크리스트를 삭제하시겠습니까?')) return
    save(lists.filter((l) => l.id !== listId))
    onBanner('success', '삭제 완료')
  }

  const handleTitleChange = (listId: string, title: string) => {
    setLists((prev) => prev.map((l) => l.id === listId ? { ...l, title } : l))
  }

  const handleTitleBlur = (listId: string) => {
    const list = lists.find((l) => l.id === listId)
    if (list) save(lists.map((l) => l.id === listId ? { ...l, updatedAt: new Date().toISOString() } : l))
  }

  const handleToggle = (listId: string, itemId: string) => {
    const updated = lists.map((l) => {
      if (l.id !== listId) return l
      return {
        ...l,
        items: l.items.map((item) => item.id === itemId ? { ...item, done: !item.done } : item),
        updatedAt: new Date().toISOString(),
      }
    })
    save(updated)
  }

  const handleAddItem = (listId: string) => {
    const text = (newItemTexts[listId] || '').trim()
    if (!text) return
    const item: CheckItem = { id: Date.now().toString(), text, done: false }
    const updated = lists.map((l) => {
      if (l.id !== listId) return l
      return { ...l, items: [...l.items, item], updatedAt: new Date().toISOString() }
    })
    setNewItemTexts((prev) => ({ ...prev, [listId]: '' }))
    save(updated)
  }

  const handleDeleteItem = (listId: string, itemId: string) => {
    const updated = lists.map((l) => {
      if (l.id !== listId) return l
      return { ...l, items: l.items.filter((i) => i.id !== itemId), updatedAt: new Date().toISOString() }
    })
    save(updated)
  }

  return (
    <div>
      <h1 className="page-title">체크리스트</h1>
      <p className="page-subtitle">출시 준비, 업무 관리 등</p>

      <div style={{ marginBottom: 16 }}>
        <button className="cl-new-btn" onClick={handleNewList}>+ 새 체크리스트</button>
      </div>

      {!loaded && <div className="card"><div className="empty">로딩 중...</div></div>}
      {loaded && lists.length === 0 && <div className="card"><div className="empty">체크리스트가 없습니다</div></div>}

      <div className="cl-grid">
        {lists.map((list) => {
          const doneCount = list.items.filter((i) => i.done).length
          const total = list.items.length
          return (
            <div key={list.id} className="card cl-card">
              <div className="cl-card-header">
                <input
                  className="cl-title-input"
                  value={list.title}
                  onChange={(e) => handleTitleChange(list.id, e.target.value)}
                  onBlur={() => handleTitleBlur(list.id)}
                />
                <span className="cl-progress">{total > 0 ? `${doneCount}/${total}` : ''}</span>
                <button className="cl-delete-list" onClick={() => handleDeleteList(list.id)} title="삭제">&#x2715;</button>
              </div>

              {total > 0 && (
                <div className="cl-progress-bar">
                  <div className="cl-progress-fill" style={{ width: `${total > 0 ? (doneCount / total) * 100 : 0}%` }} />
                </div>
              )}

              <div className="cl-items">
                {list.items.map((item) => (
                  <div key={item.id} className={`cl-item${item.done ? ' done' : ''}`}>
                    <label className="cl-checkbox">
                      <input type="checkbox" checked={item.done} onChange={() => handleToggle(list.id, item.id)} />
                      <span className="cl-checkmark" />
                    </label>
                    <span className="cl-item-text">{item.text}</span>
                    <button className="cl-item-delete" onClick={() => handleDeleteItem(list.id, item.id)}>&#x2715;</button>
                  </div>
                ))}
              </div>

              <div className="cl-add-item">
                <input
                  className="cl-add-input"
                  placeholder="항목 추가..."
                  value={newItemTexts[list.id] || ''}
                  onChange={(e) => setNewItemTexts((prev) => ({ ...prev, [list.id]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddItem(list.id) }}
                />
                <button className="cl-add-btn" onClick={() => handleAddItem(list.id)}>추가</button>
              </div>
            </div>
          )
        })}
      </div>

      {saving && <div style={{ textAlign: 'center', padding: 8, color: 'var(--text-tertiary)', fontSize: 13 }}>저장 중...</div>}
    </div>
  )
}
