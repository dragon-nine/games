import type { CSSProperties } from 'react'
import { colors, radius, font } from './design-tokens'

interface RedButtonProps {
  children: string
  fontSize?: number
  width?: 'full' | 'half' | 'auto'
  onClick?: () => void
  style?: CSSProperties
}

/** 광고보고 부활 스타일 — 빨간 그라데이션, 빨간 테두리 */
export default function RedButton({
  children,
  fontSize = 28,
  width = 'auto',
  onClick,
  style,
}: RedButtonProps) {
  const w = width === 'full' ? '100%' : width === 'half' ? '48%' : 'auto';
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: w,
        background: `linear-gradient(135deg, ${'#e53935'} 0%, ${'#c41e1e'} 40%, ${'#8b1a1a'} 100%)`,
        color: colors.white,
        fontSize,
        fontWeight: font.weight.black,
        fontFamily: font.primary,
        border: `3px solid ${'#8b1a1a'}`,
        borderRadius: radius.lg,
        padding: '14px 24px',
        cursor: 'pointer',
        WebkitTextStroke: `3px ${'#000000'}`,
        paintOrder: 'stroke fill',
        letterSpacing: '0.02em',
        ...style,
      }}
    >
      {children}
    </button>
  )
}
