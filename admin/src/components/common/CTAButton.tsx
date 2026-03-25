import type { CSSProperties } from 'react'

interface CTAButtonProps {
  children: string
  bgColor?: string
  textColor?: string
  fontSize?: number
  fontWeight?: number
  borderRadius?: number
  onClick?: () => void
  style?: CSSProperties
}

export default function CTAButton({
  children,
  bgColor = '#000000',
  textColor = '#ffffff',
  fontSize = 16,
  fontWeight = 700,
  borderRadius = 12,
  onClick,
  style,
}: CTAButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        backgroundColor: bgColor,
        color: textColor,
        fontSize,
        fontWeight,
        border: 'none',
        borderRadius,
        padding: '16px 24px',
        cursor: 'pointer',
        ...style,
      }}
    >
      {children}
    </button>
  )
}
