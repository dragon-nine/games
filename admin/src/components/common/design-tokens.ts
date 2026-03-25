/** 직장인 잔혹사 디자인 시스템 토큰 */

export const colors = {
  // 배경
  dark: '#2d2d2d',
  darker: '#1a1a1f',
  modalBg: '#2a292e',
  black: '#000000',
  gameOverBtnLg: '#24282c',
  gameOverBtnSm: '#231816',
  gameOverBtnLine: '#4d4340',

  // 강조
  red: '#c41e1e',
  redLight: '#e53935',
  redDark: '#8b1a1a',
  cyan: '#00e5ff',
  blue: '#1a6fc4',
  blueLight: '#7ec8e3',

  // 중성
  blueGray: '#4a5a6a',
  blueGrayLight: '#5a7080',
  blueGrayDark: '#3a4a5a',
  gray: '#3c3c44',
  grayText: '#969696',
  white: '#ffffff',
  stroke: '#000000',
} as const

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const

export const spacing = {
  '2xs': 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const

export const font = {
  primary: 'GMarketSans, sans-serif',
  weight: {
    regular: 400,
    bold: 700,
    black: 900,
  },
} as const

/**
 * 타입 스케일 — 6단계 크기 시스템 (2xl ~ xs)
 * 모든 텍스트는 이 스케일 안에서 선택. 용도는 매핑으로 관리.
 */
export const typeScale = {
  '2xl': { fontSize: 72, fontWeight: 900, stroke: 6 },
  xl: { fontSize: 56, fontWeight: 900, stroke: 6 },
  lg: { fontSize: 28, fontWeight: 900, stroke: 3 },
  md: { fontSize: 22, fontWeight: 700, stroke: 2.5 },
  sm: { fontSize: 16, fontWeight: 700, stroke: 0 },
  xs: { fontSize: 13, fontWeight: 700, stroke: 0 },
} as const

/** 용도별 스케일 매핑 */
export const typeUsage: Record<string, { scale: keyof typeof typeScale; usages: string[] }> = {
  '2xl': { scale: '2xl', usages: ['게임 점수 (HUD, 게임오버, 도전장)'] },
  xl: { scale: 'xl', usages: ['메인 타이틀 (직장인 잔혹사)'] },
  lg: { scale: 'lg', usages: ['홈으로 가기', '광고보고 부활', '퇴근하기'] },
  md: { scale: 'md', usages: ['도전장 보내기', '랭킹 보기', '서브타이틀'] },
  sm: { scale: 'sm', usages: ['카카오톡 CTA', '게임오버 멘트'] },
  xs: { scale: 'xs', usages: ['가이드 텍스트', '라벨', '최고기록'] },
}
