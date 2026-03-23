import type { LayoutElement, ScreenLayout } from './layout-types'
import { DEFAULT_LAYOUTS } from './default-layouts'

const BLOB_BASE = 'https://hhgnhfkftrktusxf.public.blob.vercel-storage.com'

interface LoadedLayout {
  elements: LayoutElement[]
  groupVAlign: 'center' | 'top'
}

const layoutCache = new Map<string, LoadedLayout>()

function parseLayout(data: ScreenLayout | { elements?: LayoutElement[]; groupVAlign?: string }): LoadedLayout {
  return {
    elements: data.elements || [],
    groupVAlign: (data as ScreenLayout).groupVAlign === 'top' ? 'top' : 'center',
  }
}

/**
 * Fetch layout JSON. Tries in order:
 * 1. Local static file (public/layout/{screen}.json) — works in dev & prod
 * 2. Vercel Blob — remote storage
 * 3. Built-in defaults — hardcoded fallback
 */
export async function loadLayout(gameId: string, screen: string): Promise<LayoutElement[]> {
  const loaded = await loadLayoutFull(gameId, screen)
  return loaded.elements
}

export async function loadLayoutFull(gameId: string, screen: string): Promise<LoadedLayout> {
  const cacheKey = `${gameId}/${screen}`
  if (layoutCache.has(cacheKey)) return layoutCache.get(cacheKey)!

  // Try local static file first
  try {
    const base = import.meta.env.BASE_URL || '/'
    const localUrl = `${base}layout/${screen}.json`
    const res = await fetch(localUrl)
    if (res.ok) {
      const layout = await res.json()
      const loaded = parseLayout(layout)
      layoutCache.set(cacheKey, loaded)
      return loaded
    }
  } catch { /* try blob */ }

  // Try blob
  try {
    const url = `${BLOB_BASE}/${gameId}/layout/${screen}.json`
    const res = await fetch(url)
    if (res.ok) {
      const layout = await res.json()
      const loaded = parseLayout(layout)
      layoutCache.set(cacheKey, loaded)
      return loaded
    }
  } catch { /* fallback to defaults */ }

  const defaults = DEFAULT_LAYOUTS[screen]
  const loaded: LoadedLayout = {
    elements: defaults?.elements || [],
    groupVAlign: defaults?.groupVAlign === 'top' ? 'top' : 'center',
  }
  layoutCache.set(cacheKey, loaded)
  return loaded
}

/** Clear cache */
export function clearLayoutCache() {
  layoutCache.clear()
}
