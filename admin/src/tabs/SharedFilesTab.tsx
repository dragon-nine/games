import { useState, useEffect, useCallback, useRef } from 'react'
import type { BlobItem } from '../types'
import { listBlobs, uploadBlob, deleteBlob } from '../api'

interface Props {
  onBanner: (type: 'success' | 'error', message: string) => void
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

function getFilename(pathname: string): string {
  return pathname.split('/').pop() || pathname
}

function getFileIcon(name: string): string {
  if (/\.(xlsx?|csv)$/i.test(name)) return '📊'
  if (/\.(docx?|txt)$/i.test(name)) return '📄'
  if (/\.(pptx?|key)$/i.test(name)) return '📑'
  if (/\.(pdf)$/i.test(name)) return '📕'
  if (/\.(png|jpe?g|gif|webp|svg)$/i.test(name)) return '🖼'
  if (/\.(mp3|ogg|wav|m4a)$/i.test(name)) return '🎵'
  if (/\.(mp4|mov|avi|webm)$/i.test(name)) return '🎬'
  if (/\.(zip|rar|7z|tar|gz)$/i.test(name)) return '📦'
  return '📎'
}

function isImage(name: string): boolean {
  return /\.(png|jpe?g|gif|webp|svg)$/i.test(name)
}

export default function SharedFilesTab({ onBanner }: Props) {
  const prefix = 'shared/'
  const addRef = useRef<HTMLInputElement>(null)
  const [blobs, setBlobs] = useState<BlobItem[]>([])
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const items = await listBlobs(prefix)
      setBlobs(items)
    } catch {
      // API unavailable
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const handleUpload = async (files: FileList) => {
    for (const file of Array.from(files)) {
      try {
        await uploadBlob(file, prefix)
      } catch (err) {
        onBanner('error', `"${file.name}" 업로드 실패: ${(err as Error).message}`)
        return
      }
    }
    onBanner('success', `${files.length}개 파일 업로드 완료`)
    refresh()
  }

  const handleDelete = async (blob: BlobItem) => {
    const name = getFilename(blob.pathname)
    if (!confirm(`"${name}" 삭제하시겠습니까?`)) return
    try {
      await deleteBlob(blob.url)
      onBanner('success', '삭제 완료')
      refresh()
    } catch (err) {
      onBanner('error', `삭제 실패: ${(err as Error).message}`)
    }
  }

  return (
    <div>
      <h1 className="page-title">공유 파일</h1>
      <p className="page-subtitle">모든 파일 형식 업로드 가능 (엑셀, 이미지, 문서 등)</p>

      <div className="card">
        <div className="category-header">
          <div className="card-title" style={{ marginBottom: 0 }}>파일 목록</div>
          <span className="section-count">{blobs.length}개</span>
          <button
            className="category-add-btn"
            onClick={() => addRef.current?.click()}
            title="파일 업로드"
          >+</button>
          <input
            ref={addRef}
            type="file"
            accept="*/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => { if (e.target.files?.length) handleUpload(e.target.files); e.target.value = '' }}
          />
        </div>

        {!loaded && (
          <div className="asset-grid">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="asset-card">
                <div className="asset-card-preview"><div className="img-placeholder" style={{ width: '100%', height: '100%' }} /></div>
                <div className="asset-card-info"><div className="img-placeholder" style={{ width: '60%', height: 12, borderRadius: 4 }} /></div>
              </div>
            ))}
          </div>
        )}

        {loaded && blobs.length === 0 && (
          <div className="empty">아직 업로드된 파일이 없습니다</div>
        )}

        {loaded && blobs.length > 0 && (
          <div className="asset-grid">
            {blobs.map((b) => {
              const name = getFilename(b.pathname)
              const icon = getFileIcon(name)
              const cacheBust = b.uploadedAt ? `?t=${new Date(b.uploadedAt).getTime()}` : ''
              return (
                <div key={b.url} className="asset-card">
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noopener"
                    className="asset-card-preview"
                    style={{ textDecoration: 'none', cursor: 'pointer' }}
                  >
                    {isImage(name) ? (
                      <img
                        src={b.url + cacheBust}
                        alt={name}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <span style={{ fontSize: 40 }}>{icon}</span>
                    )}
                  </a>
                  <div className="asset-card-info">
                    <div className="asset-card-name" title={name}>{name}</div>
                    <div className="asset-card-meta">
                      <span>{formatSize(b.size)}</span>
                      <button
                        className="asset-card-delete"
                        onClick={() => handleDelete(b)}
                        title="삭제"
                      >&#x2715;</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
