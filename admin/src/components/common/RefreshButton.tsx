import type { CSSProperties } from 'react'

interface RefreshButtonProps {
  children: string
  bgColor?: string
  textColor?: string
  fontSize?: number
  borderRadius?: number
  onClick?: () => void
  style?: CSSProperties
}

export default function RefreshButton({
  children,
  bgColor = '#3c3c44',
  textColor = '#969696',
  fontSize = 13,
  borderRadius = 20,
  onClick,
  style,
}: RefreshButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        backgroundColor: bgColor,
        color: textColor,
        fontSize,
        fontWeight: 400,
        border: 'none',
        borderRadius,
        padding: '8px 16px',
        cursor: 'pointer',
        ...style,
      }}
    >
      <span style={{ fontSize: fontSize + 1 }}>↻</span>
      {children}
    </button>
  )
}
