import { useState, type CSSProperties, type ReactNode } from 'react';
import { useNativeTap } from '../hooks/useNativeTap';

interface Props {
  /** 탭 시 실행될 콜백 */
  onTap: () => void;
  /** 추가 스타일 */
  style?: CSSProperties;
  /** 자식 요소 */
  children?: ReactNode;
  /** className */
  className?: string;
  /** 누름 효과 강도 (기본 0.92) */
  pressScale?: number;
  /**
   * 스크롤 가능한 컨테이너(상점, 리스트 등) 안에 있을 때 true.
   * 스크롤 시 클릭이 실행되지 않도록 touchend + 이동거리 검사를 사용.
   * 게임 인풋(즉시 반응 필요)에는 사용하지 말 것.
   */
  scrollSafe?: boolean;
}

/**
 * 모든 버튼의 표준 컴포넌트.
 *
 * - 네이티브 touch/mouse 이벤트로 가장 안정적인 입력 처리
 * - iOS WebKit 첫 탭 누락 / 합성 이벤트 지연 등 모든 알려진 이슈 회피
 * - 자동 press 피드백 (scale)
 * - 모든 버튼이 동일한 동작 보장
 *
 * 사용:
 * ```tsx
 * <TapButton onTap={handleClick} style={{ background: 'red' }}>
 *   <img src="..." />
 * </TapButton>
 * ```
 */
export function TapButton({ onTap, style, children, className, pressScale = 0.92, scrollSafe = false }: Props) {
  const [pressed, setPressed] = useState(false);
  const tapRef = useNativeTap(
    () => {
      setPressed(true);
      setTimeout(() => setPressed(false), 100);
      onTap();
    },
    { scrollSafe },
  );

  return (
    <div
      ref={tapRef}
      className={className}
      style={{
        cursor: 'pointer',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        transform: pressed ? `scale(${pressScale})` : undefined,
        transition: 'transform 0.08s ease-out',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
