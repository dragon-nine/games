import { useState } from 'react';
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
  const [godMode, setGodMode] = useState(localStorage.getItem('godMode') === 'true');
  const [debugOpen, setDebugOpen] = useState(false);
  const tutorialDone = localStorage.getItem('tutorialDone') === 'true';

  const handleStart = () => {
    gameBus.emit('play-sfx', 'sfx-click');
    gameBus.emit('start-game', undefined);
  };

  const handleSettings = () => {
    gameBus.emit('play-sfx', 'sfx-click');
    gameBus.emit('screen-change', 'settings');
  };

  const handleToggleGodMode = () => {
    const next = !godMode;
    setGodMode(next);
    localStorage.setItem('godMode', String(next));
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

      {/* 광고제거 버튼 — 왼쪽 상단 */}
      <div
        onClick={() => gameBus.emit('show-ad-remove', undefined)}
        style={{
          position: 'absolute',
          top: 15 * scale,
          left: 15 * scale,
          width: 35 * scale,
          height: 35 * scale,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.15)',
          border: '2px solid rgba(255,255,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: 14 * scale,
          zIndex: 10,
        }}
      >
        💎
      </div>

      {/* 디버그 버튼 — 설정 버튼 왼쪽 */}
      <div
        onClick={() => setDebugOpen(true)}
        style={{
          position: 'absolute',
          top: 15 * scale,
          right: 60 * scale,
          width: 35 * scale,
          height: 35 * scale,
          borderRadius: 999,
          background: godMode ? '#4ade80' : 'rgba(255,255,255,0.15)',
          border: `2px solid ${godMode ? '#4ade80' : 'rgba(255,255,255,0.3)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: 14 * scale,
          zIndex: 10,
        }}
      >
        🛡️
      </div>

      {/* 디버그 모달 */}
      {debugOpen && (
        <div
          onClick={() => setDebugOpen(false)}
          style={{
            position: 'absolute', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#2a292e', borderRadius: 16 * scale,
              padding: `${24 * scale}px`,
              display: 'flex', flexDirection: 'column', gap: 12 * scale,
              minWidth: 240 * scale,
            }}
          >
            <div style={{
              fontFamily: 'GMarketSans, sans-serif', fontWeight: 700,
              fontSize: 20 * scale, color: '#fff', textAlign: 'center',
            }}>
              디버그
            </div>

            {/* 무적 모드 */}
            <div
              onClick={handleToggleGodMode}
              style={{
                background: godMode ? '#1a3a1a' : '#1a1a1f',
                borderRadius: 10 * scale, padding: `${14 * scale}px`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontFamily: 'GMarketSans, sans-serif', fontWeight: 700, fontSize: 16 * scale, color: '#fff' }}>
                무적 모드
              </span>
              <span style={{ fontSize: 14 * scale, color: godMode ? '#4ade80' : '#666' }}>
                {godMode ? 'ON' : 'OFF'}
              </span>
            </div>

            {/* 튜토리얼 */}
            <div
              onClick={() => {
                if (tutorialDone) {
                  localStorage.removeItem('tutorialDone');
                } else {
                  localStorage.setItem('tutorialDone', 'true');
                }
                setDebugOpen(false);
              }}
              style={{
                background: !tutorialDone ? '#1a2a3a' : '#1a1a1f',
                borderRadius: 10 * scale, padding: `${14 * scale}px`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontFamily: 'GMarketSans, sans-serif', fontWeight: 700, fontSize: 16 * scale, color: '#fff' }}>
                튜토리얼
              </span>
              <span style={{ fontSize: 14 * scale, color: !tutorialDone ? '#00e5ff' : '#666' }}>
                {!tutorialDone ? 'ON' : 'OFF'}
              </span>
            </div>

            <div style={{ fontSize: 11 * scale, color: '#555', textAlign: 'center' }}>
              튜토리얼 ON → 다음 게임에 가이드 표시
            </div>
          </div>
        </div>
      )}
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
        fontWeight: 700,
        whiteSpace: 'pre-line',
        lineHeight: 1.4,
        fontSize: `${Math.max(6, fontSizePx * scale)}px`,
        WebkitTextStroke: strokeWidth
          ? `${strokeWidth * scale}px ${strokeColor}`
          : undefined,
        paintOrder: strokeWidth ? 'stroke fill' : undefined,
        ...(gradient ? {
          background: `linear-gradient(to bottom, ${gradient[0]}, ${gradient[1]})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        } : {}),
      }}
    >
      {overrideText ?? el.label ?? el.id}
    </div>
  );
}
