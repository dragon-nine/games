import type { CSSProperties } from 'react'

interface ButtonGuideProps {
  /** 가이드 텍스트 */
  text?: string
  /** 화살표 방향: 텍스트에서 버튼 쪽으로 */
  arrowDirection?: 'left' | 'right' | 'up' | 'down'
  /** 빛남 색상 */
  glowColor?: string
  /** 버튼 크기 */
  buttonSize?: number
  /** 버튼 이미지 URL (없으면 원형 플레이스홀더) */
  buttonImage?: string
  style?: CSSProperties
}

export default function ButtonGuide({
  text = '앞으로 한 칸 이동!',
  arrowDirection = 'right',
  glowColor = '#00e5ff',
  buttonSize = 72,
  buttonImage,
  style,
}: ButtonGuideProps) {
  const isHorizontal = arrowDirection === 'left' || arrowDirection === 'right'
  const isReverse = arrowDirection === 'left' || arrowDirection === 'up'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        alignItems: 'center',
        gap: 8,
        direction: isReverse ? 'rtl' : 'ltr',
        ...style,
      }}
    >
      {/* Text label */}
      <div
        style={{
          color: '#fff',
          fontSize: 15,
          fontWeight: 700,
          fontFamily: '"GMarketSans", sans-serif',
          textShadow: `0 0 8px ${glowColor}, 0 0 16px ${glowColor}40`,
          whiteSpace: 'nowrap',
          direction: 'ltr',
        }}
      >
        {text}
      </div>

      {/* Arrow */}
      <div style={{ direction: 'ltr' }}>
        <Arrow direction={arrowDirection} color={glowColor} />
      </div>

      {/* Button with glow */}
      <div
        style={{
          position: 'relative',
          width: buttonSize,
          height: buttonSize,
          direction: 'ltr',
        }}
      >
        {/* Glow ring animation */}
        <div
          style={{
            position: 'absolute',
            inset: -6,
            borderRadius: '50%',
            border: `2px solid ${glowColor}`,
            boxShadow: `0 0 12px ${glowColor}, 0 0 24px ${glowColor}80, inset 0 0 12px ${glowColor}40`,
            animation: 'btnGuidePulse 1.2s ease-in-out infinite',
          }}
        />
        {/* Button content */}
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: buttonImage ? 'transparent' : '#3a3a3a',
            border: buttonImage ? 'none' : '3px solid #555',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {buttonImage ? (
            <img
              src={buttonImage}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <span style={{ color: '#fff', fontSize: buttonSize * 0.4, fontWeight: 700 }}>▶</span>
          )}
        </div>

        {/* Keyframes injected via style tag */}
        <style>{`
          @keyframes btnGuidePulse {
            0%, 100% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.08); }
          }
          @keyframes arrowBounce {
            0%, 100% { transform: var(--arrow-translate-from); }
            50% { transform: var(--arrow-translate-to); }
          }
        `}</style>
      </div>
    </div>
  )
}

function Arrow({ direction, color }: { direction: string; color: string }) {
  const size = 14
  const shaft = 20

  const isHorizontal = direction === 'left' || direction === 'right'
  const bounceAxis = isHorizontal ? 'X' : 'Y'
  const bounceSign = (direction === 'right' || direction === 'down') ? 1 : -1

  const arrowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: isHorizontal ? 'row' : 'column',
    animation: `arrowBounce 0.8s ease-in-out infinite`,
    ['--arrow-translate-from' as string]: `translate${bounceAxis}(0px)`,
    ['--arrow-translate-to' as string]: `translate${bounceAxis}(${bounceSign * 6}px)`,
    filter: `drop-shadow(0 0 6px ${color})`,
  }

  // SVG arrow
  const rotate = direction === 'right' ? 0 : direction === 'down' ? 90 : direction === 'left' ? 180 : 270

  return (
    <div style={arrowStyle}>
      <svg
        width={shaft + size}
        height={size * 2}
        viewBox={`0 0 ${shaft + size} ${size * 2}`}
        style={{ transform: `rotate(${rotate}deg)` }}
      >
        {/* Shaft */}
        <rect
          x={0}
          y={size - 2}
          width={shaft}
          height={4}
          rx={2}
          fill={color}
        />
        {/* Arrowhead */}
        <polygon
          points={`${shaft},${size - size * 0.7} ${shaft + size},${size} ${shaft},${size + size * 0.7}`}
          fill={color}
        />
      </svg>
    </div>
  )
}
