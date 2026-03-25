import type { CSSProperties } from 'react'

interface MainTitleProps {
  line1?: string
  line2?: string
  line1Size?: number
  line2Size?: number
  gradientFrom?: string
  gradientTo?: string
  strokeWidth?: number
  strokeColor?: string
  outerStrokeWidth?: number
  outerStrokeColor?: string
  line2Color?: string
  style?: CSSProperties
}

export default function MainTitle({
  line1 = '직장인 잔혹사',
  line2 = '당신의 하루를 견뎌내세요...',
  line1Size = 56,
  line2Size = 24,
  gradientFrom = '#1a6fc4',
  gradientTo = '#7ec8e3',
  strokeWidth = 6,
  strokeColor = '#000000',
  outerStrokeWidth = 3,
  outerStrokeColor = '#ffffff',
  line2Color = '#ffffff',
  style,
}: MainTitleProps) {
  return (
    <div style={{ textAlign: 'center', ...style }}>
      {/* Line 1: gradient text with double stroke (outer white + inner black) */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {/* Layer 1: Outer stroke (white) — 맨 뒤 */}
        <div
          style={{
            fontSize: line1Size,
            fontWeight: 900,
            fontFamily: '"Black Han Sans", "GMarketSans", sans-serif',
            lineHeight: 1.2,
            color: 'transparent',
            WebkitTextStroke: `${strokeWidth + outerStrokeWidth * 2}px ${outerStrokeColor}`,
            paintOrder: 'stroke fill',
            letterSpacing: '0.02em',
          }}
        >
          {line1}
        </div>
        {/* Layer 2: Inner stroke (black) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            fontSize: line1Size,
            fontWeight: 900,
            fontFamily: '"Black Han Sans", "GMarketSans", sans-serif',
            lineHeight: 1.2,
            color: 'transparent',
            WebkitTextStroke: `${strokeWidth}px ${strokeColor}`,
            paintOrder: 'stroke fill',
            letterSpacing: '0.02em',
          }}
        >
          {line1}
        </div>
        {/* Layer 3: Gradient fill — 맨 앞 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            fontSize: line1Size,
            fontWeight: 900,
            fontFamily: '"Black Han Sans", "GMarketSans", sans-serif',
            lineHeight: 1.2,
            letterSpacing: '0.02em',
            background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {line1}
        </div>
      </div>

      {/* Line 2: white text with double stroke */}
      <div style={{ position: 'relative', display: 'inline-block', marginTop: 4 }}>
        {/* Outer stroke (white) */}
        <div
          style={{
            fontSize: line2Size,
            fontWeight: 700,
            fontFamily: '"Black Han Sans", "GMarketSans", sans-serif',
            color: 'transparent',
            WebkitTextStroke: `${Math.max(1, strokeWidth * 0.6) + outerStrokeWidth}px ${outerStrokeColor}`,
            paintOrder: 'stroke fill',
            lineHeight: 1.3,
            letterSpacing: '0.01em',
          }}
        >
          {line2}
        </div>
        {/* Inner stroke (black) + fill */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            fontSize: line2Size,
            fontWeight: 700,
            fontFamily: '"Black Han Sans", "GMarketSans", sans-serif',
            color: line2Color,
            WebkitTextStroke: `${Math.max(1, strokeWidth * 0.6)}px ${strokeColor}`,
            paintOrder: 'stroke fill',
            lineHeight: 1.3,
            letterSpacing: '0.01em',
          }}
        >
          {line2}
        </div>
      </div>
    </div>
  )
}
