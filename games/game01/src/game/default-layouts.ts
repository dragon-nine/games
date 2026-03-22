import type { ScreenLayout } from './layout-types'
import { DESIGN_W } from './layout-types'

export const DEFAULT_LAYOUTS: Record<string, ScreenLayout> = {
  'main-screen': {
    screen: 'main-screen',
    designWidth: DESIGN_W,
    elements: [
      { id: 'main-text', positioning: 'group', type: 'image', order: 0, gapPx: 0, widthPx: 331 },
      { id: 'main-char', positioning: 'group', type: 'image', order: 1, gapPx: 24, widthPx: 175 },
      { id: 'bestScore', positioning: 'group', type: 'text', order: 2, gapPx: 20, widthPx: 200, label: '최고기록 0' },
      { id: 'main-btn', positioning: 'group', type: 'image', order: 3, gapPx: 20, widthPx: 214 },
      { id: 'btn-settings', positioning: 'anchor', type: 'image', anchor: 'top-right', offsetX: 20, offsetY: 20, widthPx: 35 },
    ],
  },
  'game-over': {
    screen: 'game-over',
    designWidth: DESIGN_W,
    elements: [
      { id: 'bestText', positioning: 'group', type: 'text', order: 0, gapPx: 0, widthPx: 234, label: '최고기록 0' },
      { id: 'scoreText', positioning: 'group', type: 'text', order: 1, gapPx: 12, widthPx: 156, label: '0' },
      { id: 'go-rabbit', positioning: 'group', type: 'image', order: 2, gapPx: 16, widthPx: 175 },
      { id: 'quoteText', positioning: 'group', type: 'text', order: 3, gapPx: 16, widthPx: 273, label: '퇴근은 쉬운게 아니야...\n인생이 원래 그래' },
      { id: 'go-btn-revive', positioning: 'group', type: 'image', order: 4, gapPx: 24, widthPx: 331 },
      { id: 'go-btn-home', positioning: 'group', type: 'image', order: 5, gapPx: 16, widthPx: 331 },
      { id: 'go-btn-challenge', positioning: 'group', type: 'image', order: 6, gapPx: 16, widthPx: 156 },
      { id: 'go-btn-ranking', positioning: 'group', type: 'image', order: 6, gapPx: 16, widthPx: 156 },
    ],
  },
}

/** Asset blob paths for layout preview */
export const ASSET_PATHS: Record<string, Record<string, string>> = {
  'main-screen': {
    'main-text': 'game01/main-screen/main-text.png',
    'main-char': 'game01/main-screen/main-char.png',
    'main-btn': 'game01/main-screen/main-btn.png',
    'btn-settings': 'game01/ui/btn-settings.png',
  },
  'game-over': {
    'go-rabbit': 'game01/game-over-screen/gameover-rabbit.png',
    'go-btn-revive': 'game01/game-over-screen/btn-revive.png',
    'go-btn-home': 'game01/game-over-screen/btn-home.png',
    'go-btn-challenge': 'game01/game-over-screen/btn-challenge.png',
    'go-btn-ranking': 'game01/game-over-screen/btn-ranking.png',
  },
}
