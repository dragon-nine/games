interface Props {
  onAddElement: (type: 'text' | 'image' | 'button', positioning: 'group' | 'anchor') => void
  onOpenAssetPicker: () => void
}

export default function Toolbar({ onAddElement, onOpenAssetPicker }: Props) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
      <div style={{ fontSize: 12, color: '#999', display: 'flex', alignItems: 'center', marginRight: 4 }}>그룹</div>
      <ToolBtn label="텍스트" onClick={() => onAddElement('text', 'group')} />
      <ToolBtn label="이미지" onClick={onOpenAssetPicker} />
      <ToolBtn label="버튼" onClick={() => onAddElement('button', 'group')} />
      <div style={{ width: 1, height: 24, background: '#e8e8e8', margin: '0 8px' }} />
      <div style={{ fontSize: 12, color: '#999', display: 'flex', alignItems: 'center', marginRight: 4 }}>앵커</div>
      <ToolBtn label="텍스트" onClick={() => onAddElement('text', 'anchor')} />
      <ToolBtn label="이미지" onClick={() => onAddElement('image', 'anchor')} />
    </div>
  )
}

function ToolBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 12px', borderRadius: 6,
        border: '1px solid #e8e8e8', background: '#fff',
        color: '#333', fontSize: 12, fontWeight: 500,
        cursor: 'pointer',
      }}
    >
      + {label}
    </button>
  )
}
