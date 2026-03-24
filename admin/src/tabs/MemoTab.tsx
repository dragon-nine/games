import { useState, useEffect, useCallback } from 'react'
import { getJson, putJson } from '../api'

interface Memo {
  id: string
  title: string
  content: string
  updatedAt: string
}

const STORE_KEY = 'admin/memos.json'

interface Props {
  onBanner: (type: 'success' | 'error', message: string) => void
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${mm}.${dd} ${hh}:${mi}`
}

export default function MemoTab({ onBanner }: Props) {
  const [memos, setMemos] = useState<Memo[]>([])
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  const load = useCallback(async () => {
    try {
      const data = await getJson<Memo[]>(STORE_KEY)
      setMemos(data || [])
    } catch {
      // empty
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const save = useCallback(async (updated: Memo[]) => {
    setSaving(true)
    try {
      await putJson(STORE_KEY, updated)
      setMemos(updated)
    } catch (err) {
      onBanner('error', `저장 실패: ${(err as Error).message}`)
    } finally {
      setSaving(false)
    }
  }, [onBanner])

  const selected = memos.find((m) => m.id === selectedId) || null

  const handleNew = () => {
    const memo: Memo = {
      id: Date.now().toString(),
      title: '새 메모',
      content: '',
      updatedAt: new Date().toISOString(),
    }
    const updated = [memo, ...memos]
    setMemos(updated)
    setSelectedId(memo.id)
    setEditTitle(memo.title)
    setEditContent(memo.content)
    save(updated)
  }

  const handleSelect = (memo: Memo) => {
    setSelectedId(memo.id)
    setEditTitle(memo.title)
    setEditContent(memo.content)
  }

  const handleSave = () => {
    if (!selectedId) return
    const updated = memos.map((m) =>
      m.id === selectedId
        ? { ...m, title: editTitle || '제목 없음', content: editContent, updatedAt: new Date().toISOString() }
        : m
    )
    save(updated)
    onBanner('success', '저장 완료')
  }

  const handleDelete = () => {
    if (!selectedId || !confirm('이 메모를 삭제하시겠습니까?')) return
    const updated = memos.filter((m) => m.id !== selectedId)
    setSelectedId(null)
    save(updated)
    onBanner('success', '삭제 완료')
  }

  return (
    <div>
      <h1 className="page-title">메모</h1>
      <p className="page-subtitle">팀 공유 메모 및 노트</p>

      <div className="memo-layout">
        <div className="memo-list card">
          <div className="category-header">
            <div className="card-title" style={{ marginBottom: 0 }}>목록</div>
            <button className="category-add-btn" onClick={handleNew} title="새 메모">+</button>
          </div>
          {!loaded && <div className="empty">로딩 중...</div>}
          {loaded && memos.length === 0 && <div className="empty">메모가 없습니다</div>}
          {memos.map((m) => (
            <div
              key={m.id}
              className={`memo-list-item${m.id === selectedId ? ' active' : ''}`}
              onClick={() => handleSelect(m)}
            >
              <span className="memo-list-title">{m.title}</span>
              <span className="memo-list-date">{formatDate(m.updatedAt)}</span>
            </div>
          ))}
        </div>

        <div className="memo-editor card">
          {selected ? (
            <>
              <input
                className="memo-title-input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="제목"
              />
              <textarea
                className="memo-content-input"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="내용을 입력하세요..."
              />
              <div className="memo-actions">
                <button className="memo-save-btn" onClick={handleSave} disabled={saving}>
                  {saving ? '저장 중...' : '저장'}
                </button>
                <button className="memo-delete-btn" onClick={handleDelete}>삭제</button>
              </div>
            </>
          ) : (
            <div className="empty">메모를 선택하거나 새로 만드세요</div>
          )}
        </div>
      </div>
    </div>
  )
}
