import type { CSSProperties } from 'react'

interface MessageCardProps {
  message: string
  bgColor?: string
  textColor?: string
  fontSize?: number
  borderRadius?: number
  padding?: number
  style?: CSSProperties
}

export default function MessageCard({
  message,
  bgColor = '#1a1a1f',
  textColor = '#ffffff',
  fontSize = 14,
  borderRadius = 12,
  padding = 20,
  style,
}: MessageCardProps) {
  return (
    <div
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontSize,
        borderRadius,
        padding,
        textAlign: 'center',
        lineHeight: 1.6,
        whiteSpace: 'pre-line',
        ...style,
      }}
    >
      {message}
    </div>
  )
}
