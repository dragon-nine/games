import { gameBus } from '../../game/event-bus';
import { useLayout } from '../hooks/useLayout';
import type { LayoutElement } from '../../game/layout-types';
import styles from './overlay.module.css';

const BASE = import.meta.env.BASE_URL || '/';

const IMAGE_MAP: Record<string, string> = {
  'main-text': 'main-screen/main-text.png',
  'main-char': 'main-screen/main-char.png',
  'main-btn': 'main-screen/main-btn.png',
  'btn-settings': 'ui/btn-settings.png',
};

// 텍스트 요소의 실제 표시 내용 오버라이드 (동적 값)
function getTextContent(id: string): string | null {
  if (id === 'bestScore') {
    const best = localStorage.getItem('bestScore') || '0';
    return `최고기록 ${best}`;
  }
  return null;
}

export function MainScreen() {
  const { positions, elements, scale, ready } = useLayout('main-screen', IMAGE_MAP);

  const handleStart = () => {
    gameBus.emit('play-sfx', 'sfx-click');
    gameBus.emit('start-game', undefined);
  };

  const handleSettings = () => {
    gameBus.emit('play-sfx', 'sfx-click');
    gameBus.emit('screen-change', 'settings');
  };

  if (!ready) return null;

  const clickHandlers: Record<string, () => void> = {
    'main-btn': handleStart,
    'btn-settings': handleSettings,
  };

  // fadeIn 딜레이 매핑
  const fadeDelays: Record<string, string> = {
    'main-text': styles.fadeInDelayed1,
    'main-char': styles.fadeInDelayed2,
    'bestScore': styles.fadeInDelayed3,
    'btn-settings': styles.fadeInDelayed5,
  };

  return (
    <div className={styles.overlay}>
      {/* 배경 */}
      <img
        src={`${BASE}main-screen/main-bg.png`}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          pointerEvents: 'none',
        }}
      />

      {/* 레이아웃 요소들 — admin과 동일한 렌더링 구조 */}
      {elements.map((el) => {
        const pos = positions.get(el.id);
        if (!pos) return null;

        const left = pos.x - pos.displayWidth * pos.originX;
        const top = pos.y - pos.displayHeight * pos.originY;
        const onClick = clickHandlers[el.id];
        const isBtn = !!onClick;
        const fadeClass = fadeDelays[el.id];
        const isMainBtn = el.id === 'main-btn';

        return (
          <div
            key={el.id}
            className={[
              isMainBtn ? styles.fadeInThenPulse : styles.fadeInUp,
              fadeClass,
            ].filter(Boolean).join(' ')}
            style={{
              position: 'absolute',
              left, top,
              width: pos.displayWidth,
              height: pos.displayHeight,
              cursor: isBtn ? 'pointer' : undefined,
            }}
            onClick={onClick}
          >
            {el.type === 'image' ? (
              <img
                src={`${BASE}${IMAGE_MAP[el.id]}`}
                alt={el.id}
                draggable={false}
                className={isBtn ? styles.imgBtn : undefined}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <LayoutText el={el} scale={scale} overrideText={getTextContent(el.id)} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/** admin의 .le-el-text와 동일한 텍스트 렌더링 */
function LayoutText({ el, scale, overrideText }: { el: LayoutElement; scale: number; overrideText?: string | null }) {
  const fontSizePx = el.textStyle?.fontSizePx || 14;
  const color = el.textStyle?.color || '#fff';
  const strokeWidth = el.textStyle?.strokeWidth || 0;
  const strokeColor = el.textStyle?.strokeColor || '#000';
  const gradient = el.textStyle?.gradientColors;

  return (
    <div
      style={{
        color: gradient ? undefined : color,
        textAlign: 'center',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'GMarketSans, sans-serif',
        fontWeight: 'bold',
        whiteSpace: 'pre-line',
        lineHeight: 1.3,
        fontSize: `${Math.max(6, fontSizePx * scale)}px`,
        WebkitTextStroke: strokeWidth
          ? `${strokeWidth * scale}px ${strokeColor}`
          : undefined,
        ...(gradient ? {
          background: `linear-gradient(to right, ${gradient[0]}, ${gradient[1]})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        } : {}),
      }}
    >
      {overrideText ?? el.label ?? el.id}
    </div>
  );
}
