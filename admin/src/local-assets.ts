export interface LocalAsset {
  path: string
  category: string
  filename: string
}

export const LOCAL_ASSETS: LocalAsset[] = [
  // main-screen
  { path: 'main-screen/main-bg.png', category: 'main-screen', filename: 'main-bg.png' },
  { path: 'main-screen/main-btn.png', category: 'main-ui', filename: 'main-btn.png' },
  { path: 'main-screen/main-text.png', category: 'main-screen', filename: 'main-text.png' },
  // character
  { path: 'character/rabbit-front.png', category: 'character', filename: 'rabbit-front.png' },
  { path: 'character/rabbit-back.png', category: 'character', filename: 'rabbit-back.png' },
  { path: 'character/rabbit-side.png', category: 'character', filename: 'rabbit-side.png' },
  // map
  { path: 'map/straight.png', category: 'map', filename: 'straight.png' },
  { path: 'map/corner-tl.png', category: 'map', filename: 'corner-tl.png' },
  { path: 'map/corner-tr.png', category: 'map', filename: 'corner-tr.png' },
  { path: 'map/corner-bl.png', category: 'map', filename: 'corner-bl.png' },
  { path: 'map/corner-br.png', category: 'map', filename: 'corner-br.png' },
  // background
  { path: 'background/bg-1.jpg', category: 'background', filename: 'bg-1.jpg' },
  { path: 'background/bg-2.jpg', category: 'background', filename: 'bg-2.jpg' },
  { path: 'background/bg-3.jpg', category: 'background', filename: 'bg-3.jpg' },
  { path: 'background/bg-4.jpg', category: 'background', filename: 'bg-4.jpg' },
  { path: 'background/bg-5.jpg', category: 'background', filename: 'bg-5.jpg' },
  { path: 'background/bg-6.jpg', category: 'background', filename: 'bg-6.jpg' },
  // ui
  { path: 'ui/btn-forward.png', category: 'ui', filename: 'btn-forward.png' },
  { path: 'ui/btn-switch.png', category: 'ui', filename: 'btn-switch.png' },
  { path: 'ui/btn-pause.png', category: 'ui', filename: 'btn-pause.png' },
  { path: 'ui/btn-settings.png', category: 'main-ui', filename: 'btn-settings.png' },
  { path: 'ui/gauge-full.png', category: 'ui', filename: 'gauge-full.png' },
  { path: 'ui/gauge-empty.png', category: 'ui', filename: 'gauge-empty.png' },
  // audio
  { path: 'audio/bgm/menu.mp3', category: 'audio', filename: 'menu.mp3' },
  { path: 'audio/sfx/click.ogg', category: 'audio', filename: 'click.ogg' },
  { path: 'audio/sfx/combo.ogg', category: 'audio', filename: 'combo.ogg' },
  { path: 'audio/sfx/crash.ogg', category: 'audio', filename: 'crash.ogg' },
  { path: 'audio/sfx/forward.ogg', category: 'audio', filename: 'forward.ogg' },
  { path: 'audio/sfx/game-over.ogg', category: 'audio', filename: 'game-over.ogg' },
  { path: 'audio/sfx/switch.ogg', category: 'audio', filename: 'switch.ogg' },
  { path: 'audio/sfx/timer-warning.ogg', category: 'audio', filename: 'timer-warning.ogg' },
  // etc-image (게임오버/도전장)
  { path: 'game-over-screen/gameover-rabbit.png', category: 'etc-image', filename: 'gameover-rabbit.png' },
  { path: 'challenge/challenge-rabbit.png', category: 'etc-image', filename: 'challenge-rabbit.png' },
]

export function getLocalAssetUrl(path: string): string {
  return `/game-assets/${path}`
}

export function getLocalAssetsByCategory(category: string): LocalAsset[] {
  return LOCAL_ASSETS.filter((a) => a.category === category)
}
