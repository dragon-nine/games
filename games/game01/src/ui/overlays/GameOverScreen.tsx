import { useMemo } from 'react';
import { gameBus, type GameOverData } from '../../game/event-bus';
import { useLayout } from '../hooks/useLayout';
import { openLeaderboard } from '../../game/services/leaderboard';
import { logClick } from '../../game/services/analytics';
import { getRandomQuote } from '../../game/game-over-quotes';
import type { LayoutElement } from '../../game/layout-types';
import styles from './overlay.module.css';

const BASE = import.meta.env.BASE_URL || '/';

const IMAGE_MAP: Record<string, string> = {
  'go-rabbit': 'game-over-screen/gameover-rabbit.png',
};

interface Props {
  data: GameOverData;
}

export function GameOverScreen({ data }: Props) {
  const { score, bestScore, canRevive } = data;
  const excludeIds = useMemo(() => {
    const ids: string[] = [];
    if (!canRevive) ids.push('go-btn-revive');
    return ids;
  }, [canRevive]);
  const { positions, elements, scale, ready } = useLayout('game-over', IMAGE_MAP, excludeIds);

  // 텍스트 내용 오버라이드 (동적 값)
  const quote = useMemo(() => getRandomQuote(), []);
  const textOverrides: Record<string, string> = useMemo(() => ({
    'bestText': `최고기록 ${bestScore}`,
    'scoreText': `${score}`,
    'quoteText': quote,
  }), [score, bestScore, quote]);

  const clickHandlers: Record<string, () => void> = useMemo(() => ({
    'go-btn-revive': () => {
      gameBus.emit('play-sfx', 'sfx-click');
      gameBus.emit('revive', undefined);
    },
    'go-btn-home': () => {
      gameBus.emit('play-sfx', 'sfx-click');
      gameBus.emit('go-home', undefined);
    },
    'go-btn-challenge': () => {
      gameBus.emit('play-sfx', 'sfx-click');
      logClick('challenge_send');
      gameBus.emit('show-challenge', score);
    },
    'go-btn-ranking': () => {
      gameBus.emit('play-sfx', 'sfx-click');
      logClick('leaderboard_open');
      openLeaderboard();
    },
  }), []);

  if (!ready) return null;

  // 버튼 vs 텍스트/이미지 분류 → 딜레이 다르게
  const btnIds = new Set(['go-btn-revive', 'go-btn-home', 'go-btn-challenge', 'go-btn-ranking']);

  return (
    <div className={`${styles.overlay} ${styles.fadeIn}`}>
      {/* 그라데이션 배경 */}
      <div
        className={styles.gradient}
        style={{ background: 'linear-gradient(to bottom, #2a0c10, #000000)' }}
      />

      {/* 레이아웃 요소들 — admin과 동일한 렌더링 */}
      {elements.map((el) => {
        const pos = positions.get(el.id);
        if (!pos) return null;

        const left = pos.x - pos.displayWidth * pos.originX;
        const top = pos.y - pos.displayHeight * pos.originY;
        const onClick = clickHandlers[el.id];
        const isBtn = btnIds.has(el.id);

        // 애니메이션 딜레이: 텍스트/이미지 0.5s, 버튼은 0.8s~
        const delay = isBtn ? (el.id === 'go-btn-revive' ? '0.8s' : canRevive ? '0.95s' : '0.8s') : '0.5s';
        // 도전/랭킹 같은 order의 버튼은 약간 더 늦게
        const finalDelay = (el.id === 'go-btn-challenge' || el.id === 'go-btn-ranking')
          ? (canRevive ? '1.1s' : '0.95s') : delay;

        return (
          <div
            key={el.id}
            className={styles.fadeInUp}
            style={{
              position: 'absolute',
              left, top,
              width: pos.displayWidth,
              height: pos.displayHeight,
              cursor: isBtn ? 'pointer' : undefined,
              animationDelay: finalDelay,
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
            ) : el.type === 'button' ? (
              <LayoutButton el={el} scale={scale} />
            ) : (
              <LayoutText el={el} scale={scale} overrideText={textOverrides[el.id]} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function LayoutText({ el, scale, overrideText }: { el: LayoutElement; scale: number; overrideText?: string }) {
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

/** 타입 스케일 (에디터 design-tokens와 동일) */
const _typeScale: Record<string, { fontSize: number; fontWeight: number; stroke: number }> = {
  '3xl': { fontSize: 76, fontWeight: 900, stroke: 6 },
  '2xl': { fontSize: 56, fontWeight: 900, stroke: 6 },
  xl: { fontSize: 44, fontWeight: 900, stroke: 4 },
  lg: { fontSize: 32, fontWeight: 900, stroke: 3 },
  md: { fontSize: 28, fontWeight: 900, stroke: 3 },
  sm: { fontSize: 20, fontWeight: 700, stroke: 2 },
  xs: { fontSize: 16, fontWeight: 700, stroke: 0 },
  '2xs': { fontSize: 13, fontWeight: 400, stroke: 0 },
};

const _buttonStyleDefaults: Record<string, { borderWidth: number; borderColor: string; innerLineWidth: number; innerLineColor: string; borderRadius: number }> = {
  flat: { borderWidth: 0, borderColor: 'transparent', innerLineWidth: 0, innerLineColor: 'transparent', borderRadius: 12 },
  outline: { borderWidth: 3, borderColor: '#000000', innerLineWidth: 0, innerLineColor: 'transparent', borderRadius: 12 },
  doubleLine: { borderWidth: 3, borderColor: '#000000', innerLineWidth: 2, innerLineColor: '#4d4340', borderRadius: 12 },
  pill: { borderWidth: 0, borderColor: 'transparent', innerLineWidth: 0, innerLineColor: 'transparent', borderRadius: 9999 },
};

const _gradients: Record<string, { from: string; to: string; direction: string }> = {
  'White → Ice Blue': { from: '#ffffff', to: '#c1e5ff', direction: 'to bottom' },
  'Crimson → Maroon': { from: '#e5332f', to: '#771615', direction: '135deg' },
  'Wine → Black': { from: '#2a0c10', to: '#000000', direction: 'to bottom' },
};

function LayoutButton({ el, scale }: { el: LayoutElement; scale: number }) {
  const bs = el.buttonStyle;
  const scaleKey = bs?.scaleKey || 'lg';
  const ts = _typeScale[scaleKey] || _typeScale.lg;
  const bsd = _buttonStyleDefaults[bs?.styleType || 'outline'];
  const bgGrad = bs?.bgGradient ? _gradients[bs.bgGradient] : null;
  const bgStyle = bgGrad
    ? `linear-gradient(${bgGrad.direction}, ${bgGrad.from}, ${bgGrad.to})`
    : bs?.bgColor || '#24282c';

  return (
    <div style={{
      width: '100%', height: '100%',
      background: bgStyle,
      borderRadius: bsd.borderRadius * scale,
      border: bsd.borderWidth > 0 ? `${bsd.borderWidth * scale}px solid ${bsd.borderColor}` : 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: bs?.styleType === 'doubleLine' ? `${3 * scale}px` : undefined,
    }}>
      {bs?.styleType === 'doubleLine' ? (
        <div style={{
          width: '100%', height: '100%',
          border: `${bsd.innerLineWidth * scale}px solid ${bsd.innerLineColor}`,
          borderRadius: (bsd.borderRadius - 4) * scale,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'GMarketSans, sans-serif', fontSize: ts.fontSize * scale, fontWeight: ts.fontWeight,
            color: '#fff', WebkitTextStroke: ts.stroke ? `${ts.stroke * scale}px #000` : undefined,
            paintOrder: 'stroke fill',
          }}>{el.label || '버튼'}</span>
        </div>
      ) : (
        <span style={{
          fontFamily: 'GMarketSans, sans-serif', fontSize: ts.fontSize * scale, fontWeight: ts.fontWeight,
          color: '#fff', WebkitTextStroke: ts.stroke ? `${ts.stroke * scale}px #000` : undefined,
          paintOrder: 'stroke fill',
        }}>{el.label || '버튼'}</span>
      )}
    </div>
  );
}
