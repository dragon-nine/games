import { useState } from 'react';
import { ModalShell } from '../../components/ModalShell';
import { CoinIcon, GemIcon } from '../../components/CurrencyIcons';
import { TapButton } from '../../components/TapButton';
import { Text } from '../../components/Text';
import { useResponsiveScale } from '../../hooks/useResponsiveScale';
import { gameBus } from '../../../game/event-bus';

interface Props {
  onClose: () => void;
}

interface Mission {
  id: string;
  title: string;
  desc: string;
  current: number;
  target: number;
  rewardKind: 'coin' | 'gem';
  rewardAmount: number;
}

const MISSIONS: Mission[] = [
  { id: 'm1', title: '게임 3회 플레이', desc: '오늘 게임을 3번 플레이하세요', current: 2,  target: 3, rewardKind: 'coin', rewardAmount: 100 },
  { id: 'm2', title: '50점 달성',         desc: '한 게임에서 50점 이상 획득',   current: 50, target: 50, rewardKind: 'gem',  rewardAmount: 5 },
  { id: 'm3', title: '코인 10개 획득',    desc: '게임 중 코인을 10개 줍기',      current: 4,  target: 10, rewardKind: 'coin', rewardAmount: 200 },
  { id: 'm4', title: '연속 5일 출석',     desc: '5일 연속으로 게임 접속',        current: 4,  target: 5, rewardKind: 'gem',  rewardAmount: 10 },
];

export function MissionModal({ onClose }: Props) {
  const scale = useResponsiveScale();
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());

  const handleClaim = (m: Mission) => {
    if (m.current < m.target) {
      gameBus.emit('toast', '아직 완료되지 않았어요');
      return;
    }
    if (claimedIds.has(m.id)) return;
    gameBus.emit('play-sfx', 'sfx-click');
    setClaimedIds((prev) => new Set(prev).add(m.id));
    gameBus.emit('toast', `${m.rewardKind === 'coin' ? '코인' : '보석'} +${m.rewardAmount} 받음!`);
  };

  return (
    <ModalShell onClose={onClose} maxWidth={360}>
      <Text size={22 * scale} weight={900} align="center" style={{ marginBottom: 4 * scale }}>
        일일 미션
      </Text>
      <Text size={11 * scale} color="rgba(255,255,255,0.55)" align="center" style={{ marginBottom: 16 * scale }}>
        매일 자정에 초기화됩니다
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 * scale }}>
        {MISSIONS.map((m) => (
          <MissionRow
            key={m.id}
            mission={m}
            isClaimed={claimedIds.has(m.id)}
            onClaim={() => handleClaim(m)}
            scale={scale}
          />
        ))}
      </div>
    </ModalShell>
  );
}

function MissionRow({
  mission,
  isClaimed,
  onClaim,
  scale,
}: {
  mission: Mission;
  isClaimed: boolean;
  onClaim: () => void;
  scale: number;
}) {
  const isComplete = mission.current >= mission.target;
  const pct = Math.min(100, (mission.current / mission.target) * 100);

  return (
    <div
      style={{
        background: isComplete ? 'rgba(63,220,176,0.08)' : 'rgba(255,255,255,0.04)',
        border: `${1.5 * scale}px solid ${isComplete ? 'rgba(63,220,176,0.4)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 12 * scale,
        padding: `${10 * scale}px ${12 * scale}px`,
        display: 'flex',
        alignItems: 'center',
        gap: 10 * scale,
        opacity: isClaimed ? 0.5 : 1,
      }}
    >
      <div
        style={{
          width: 40 * scale,
          height: 40 * scale,
          borderRadius: 10 * scale,
          background: 'rgba(0,0,0,0.4)',
          border: `1px solid rgba(255,255,255,0.08)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        {mission.rewardKind === 'coin' ? <CoinIcon size={26 * scale} /> : <GemIcon size={24 * scale} />}
        <span
          style={{
            position: 'absolute',
            bottom: -4 * scale,
            right: -4 * scale,
            background: '#0a0a14',
            border: `${1 * scale}px solid rgba(255,255,255,0.15)`,
            borderRadius: 999,
            padding: `${1 * scale}px ${5 * scale}px`,
            fontSize: 9 * scale,
            fontWeight: 900,
            color: '#fff',
            fontFamily: 'GMarketSans, sans-serif',
            lineHeight: 1,
          }}
        >
          ×{mission.rewardAmount}
        </span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'GMarketSans, sans-serif',
            fontWeight: 900,
            fontSize: 12 * scale,
            color: '#fff',
            marginBottom: 3 * scale,
          }}
        >
          {mission.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 * scale }}>
          <div
            style={{
              flex: 1,
              height: 5 * scale,
              background: 'rgba(0,0,0,0.5)',
              borderRadius: 999,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: '100%',
                background: isComplete ? '#3fdcb0' : '#ffd24a',
                transition: 'width 0.3s ease-out',
              }}
            />
          </div>
          <span
            style={{
              fontFamily: 'GMarketSans, sans-serif',
              fontSize: 9 * scale,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.6)',
              minWidth: 32 * scale,
              textAlign: 'right',
            }}
          >
            {mission.current}/{mission.target}
          </span>
        </div>
      </div>

      <TapButton
        onTap={onClaim}
        pressScale={0.94}
        style={{
          padding: `${7 * scale}px ${11 * scale}px`,
          borderRadius: 9 * scale,
          background: isClaimed
            ? 'rgba(255,255,255,0.06)'
            : isComplete
            ? '#3fdcb0'
            : 'rgba(255,255,255,0.08)',
          color: isClaimed ? 'rgba(255,255,255,0.4)' : isComplete ? '#0a3a28' : 'rgba(255,255,255,0.5)',
          fontFamily: 'GMarketSans, sans-serif',
          fontSize: 10 * scale,
          fontWeight: 900,
          whiteSpace: 'nowrap',
          flexShrink: 0,
          boxShadow: isComplete && !isClaimed ? `0 ${2 * scale}px ${6 * scale}px rgba(63,220,176,0.35)` : 'none',
        }}
      >
        {isClaimed ? '받음' : isComplete ? '받기' : '진행중'}
      </TapButton>
    </div>
  );
}

