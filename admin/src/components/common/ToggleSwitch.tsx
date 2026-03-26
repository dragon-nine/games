import { colors } from './design-tokens'

const SIZE = 44
const WIDTH = Math.round(SIZE * 1.75)
const KNOB = SIZE - 4

interface Props {
  on?: boolean
  style?: React.CSSProperties
}

export default function ToggleSwitch({ on = false, style }: Props) {
  return (
    <div style={{
      width: WIDTH,
      height: SIZE,
      borderRadius: SIZE / 2,
      background: colors.steel,
      position: 'relative',
      cursor: 'pointer',
      ...style,
    }}>
      <div style={{
        width: KNOB,
        height: KNOB,
        borderRadius: KNOB / 2,
        background: colors.black,
        position: 'absolute',
        top: 2,
        left: on ? WIDTH - KNOB - 2 : 2,
        transition: 'left 0.2s',
      }} />
    </div>
  )
}
