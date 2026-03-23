import { useMemo } from 'react';
import { gameBus, type GameOverData } from '../../game/event-bus';
import { useLayout } from '../hooks/useLayout';
import { openLeaderboard } from '../../game/services/leaderboard';
import { logClick } from '../../game/services/analytics';
import { isGoogle } from '../../game/platform';
import type { LayoutElement } from '../../game/layout-types';
import styles from './overlay.module.css';

const BASE = import.meta.env.BASE_URL || '/';

const IMAGE_MAP: Record<string, string> = {
  'go-rabbit': 'game-over-screen/gameover-rabbit.png',
  'go-btn-revive': 'game-over-screen/btn-revive.png',
  'go-btn-home': 'game-over-screen/btn-home.png',
  'go-btn-challenge': 'game-over-screen/btn-challenge.png',
  'go-btn-ranking': 'game-over-screen/btn-ranking.png',
};

interface Props {
  data: GameOverData;
}

export function GameOverScreen({ data }: Props) {
  const { score, bestScore, canRevive } = data;
  const excludeIds = useMemo(() => {
    const ids: string[] = [];
    if (!canRevive) ids.push('go-btn-revive');
    if (isGoogle()) {
      ids.push('go-btn-revive', 'go-btn-challenge', 'go-btn-ranking');
    }
    return [...new Set(ids)];
  }, [canRevive]);
  const { positions, elements, scale, ready } = useLayout('game-over', IMAGE_MAP, excludeIds);

  // 텍스트 내용 오버라이드 (동적 값)
  const textOverrides: Record<string, string> = useMemo(() => ({
    'bestText': `최고기록 ${bestScore}`,
    'scoreText': `${score}`,
  }), [score, bestScore]);

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
