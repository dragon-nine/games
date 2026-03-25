import type { CSSProperties } from 'react'

interface ScoreDisplayProps {
  score: number
  fontSize?: number
  color?: string
  fontWeight?: number
  style?: CSSProperties
}

export default function ScoreDisplay({
  score,
  fontSize = 72,
  color = '#ffffff',
  fontWeight = 900,
  style,
}: ScoreDisplayProps) {
  return (
    <div
      style={{
        fontSize,
        fontWeight,
        color,
        fontFamily: '"Black Han Sans", "Noto Sans KR", sans-serif',
        lineHeight: 1.1,
        textAlign: 'center',
        ...style,
      }}
    >
      {score}
    </div>
  )
}
