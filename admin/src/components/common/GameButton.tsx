import type { CSSProperties } from 'react'

interface GameButtonProps {
  children: string
  fontSize?: number
  fontWeight?: number
  borderRadius?: number
  borderWidth?: number
  borderColor?: string
  bgColor?: string
  textColor?: string
  textStroke?: number
  textStrokeColor?: string
  paddingX?: number
  paddingY?: number
  style?: CSSProperties
  onClick?: () => void
}

export default function GameButton({
  children,
  fontSize = 32,
  fontWeight = 900,
  borderRadius = 16,
  borderWidth = 3,
  borderColor = '#1a1a1a',
  bgColor = '#2d2d2d',
  textColor = '#ffffff',
  textStroke = 2,
  textStrokeColor = '#000000',
  paddingX = 48,
  paddingY = 16,
  style,
  onClick,
}: GameButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bgColor,
        color: textColor,
        fontSize: `${fontSize}px`,
        fontWeight,
        fontStyle: 'italic',
        border: `${borderWidth}px solid ${borderColor}`,
        borderRadius: `${borderRadius}px`,
        padding: `${paddingY}px ${paddingX}px`,
        cursor: 'pointer',
        fontFamily: '"Black Han Sans", "Noto Sans KR", sans-serif',
        WebkitTextStroke: `${textStroke}px ${textStrokeColor}`,
        paintOrder: 'stroke fill',
        letterSpacing: '0.02em',
        lineHeight: 1.2,
        ...style,
      }}
    >
      {children}
    </button>
  )
}
