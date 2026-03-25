import type { CSSProperties } from 'react'

interface CloseButtonProps {
  size?: number
  color?: string
  onClick?: () => void
  style?: CSSProperties
}

export default function CloseButton({
  size = 32,
  color = '#ffffff',
  onClick,
  style,
}: CloseButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        color,
        fontSize: size * 0.7,
        fontWeight: 300,
        lineHeight: 1,
        ...style,
      }}
    >
      ✕
    </button>
  )
}
