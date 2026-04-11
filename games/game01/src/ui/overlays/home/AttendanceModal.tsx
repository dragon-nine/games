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

interface DayReward {
  day: number;
  kind: 'coin' | 'gem';
  amount: number;
}

const REWARDS: DayReward[] = [
  { day: 1, kind: 'coin', amount: 100 },
  { day: 2, kind: 'coin', amount: 200 },
  { day: 3, kind: 'gem',  amount: 5 },
  { day: 4, kind: 'coin', amount: 500 },
  { day: 5, kind: 'gem',  amount: 10 },
  { day: 6, kind: 'coin', amount: 800 },
  { day: 7, kind: 'gem',  amount: 30 },
];

export function AttendanceModal({ onClose }: Props) {
  const scale = useResponsiveScale();
  // 더미: 오늘 4일차, 1~3일은 받음
  const [currentDay] = useState(4);
  const [claimedDays, setClaimedDays] = useState<Set<number>>(new Set([1, 2, 3]));
  const todayClaimed = claimedDays.has(currentDay);

  const handleClaim = () => {
    if (todayClaimed) {
      gameBus.emit('toast', '오늘 보상은 이미 받았어요');
      return;
    }
    gameBus.emit('play-sfx', 'sfx-click');
    setClaimedDays((prev) => new Set(prev).add(currentDay));
    const reward = REWARDS[currentDay - 1];
    gameBus.emit('toast', `${reward.kind === 'coin' ? '코인' : '보석'} +${reward.amount} 받음!`);
  };

  return (
    <ModalShell onClose={onClose} maxWidth={360}>
      <Text size={22 * scale} weight={900} align="center" style={{ marginBottom: 4 * scale }}>
        일일 출석 보상
      </Text>
      <Text size={11 * scale} color="rgba(255,255,255,0.55)" align="center" style={{ marginBottom: 16 * scale }}>
        매일 접속하고 보상을 받으세요
      </Text>

      {/* 7일 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 * scale, marginBottom: 14 * scale }}>
        {REWARDS.slice(0, 6).map((r) => (
          <DayCard
            key={r.day}
            reward={r}
            isClaimed={claimedDays.has(r.day)}
            isToday={r.day === currentDay}
            scale={scale}
          />
        ))}
        <div style={{ gridColumn: 'span 4' }}>
          <DayCard
            reward={REWARDS[6]}
            isClaimed={claimedDays.has(7)}
            isToday={currentDay === 7}
            scale={scale}
            wide
          />
        </div>
      </div>

      <TapButton
        onTap={handleClaim}
        pressScale={0.96}
        style={{
          width: '100%',
          padding: `${12 * scale}px`,
          background: todayClaimed
            ? 'rgba(255,255,255,0.08)'
            : 'linear-gradient(180deg, #ffd24a, #f0a030)',
          border: `${2 * scale}px solid ${todayClaimed ? 'rgba(255,255,255,0.1)' : '#7a4500'}`,
          borderRadius: 12 * scale,
          textAlign: 'center',
          boxShadow: todayClaimed ? 'none' : `0 ${3 * scale}px ${10 * scale}px rgba(240,160,48,0.35)`,
        }}
      >
        <span
          style={{
            fontFamily: 'GMarketSans, sans-serif',
            fontWeight: 900,
            fontSize: 15 * scale,
            color: todayClaimed ? 'rgba(255,255,255,0.5)' : '#3a2400',
            letterSpacing: 0.5,
          }}
        >
          {todayClaimed ? '오늘 받음 ✓' : `${currentDay}일차 보상 받기`}
        </span>
      </TapButton>
    </ModalShell>
  );
}

function DayCard({
  reward,
  isClaimed,
  isToday,
  scale,
  wide,
}: {
  reward: DayReward;
  isClaimed: boolean;
  isToday: boolean;
  scale: number;
  wide?: boolean;
}) {
  let bg = 'rgba(255,255,255,0.04)';
  let border = `${1.5 * scale}px solid rgba(255,255,255,0.08)`;
  if (isToday) {
    bg = 'rgba(255,210,74,0.12)';
    border = `${2 * scale}px solid rgba(255,210,74,0.85)`;
  }
  if (isClaimed) {
    bg = 'rgba(0,0,0,0.4)';
  }

  const iconSize = wide ? 44 * scale : 28 * scale;

  return (
    <div
      style={{
        background: bg,
        border,
        borderRadius: 10 * scale,
        padding: `${(wide ? 10 : 6) * scale}px`,
        display: 'flex',
        flexDirection: wide ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: wide ? 12 * scale : 3 * scale,
        boxShadow: isToday ? `0 0 ${10 * scale}px rgba(255,210,74,0.35)` : 'none',
        opacity: isClaimed ? 0.5 : 1,
        position: 'relative',
        minHeight: wide ? 64 * scale : 72 * scale,
      }}
    >
      <span
        style={{
          fontFamily: 'GMarketSans, sans-serif',
          fontSize: 9 * scale,
          fontWeight: 900,
          color: isToday ? '#ffd24a' : 'rgba(255,255,255,0.55)',
          letterSpacing: 0.3,
        }}
      >
        DAY {reward.day}
      </span>

      {reward.kind === 'coin' ? <CoinIcon size={iconSize} /> : <GemIcon size={iconSize} />}

      <span
        style={{
          fontFamily: 'GMarketSans, sans-serif',
          fontWeight: 900,
          fontSize: wide ? 17 * scale : 11 * scale,
          color: '#fff',
        }}
      >
        +{reward.amount}
      </span>

      {isClaimed && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.45)',
            borderRadius: 10 * scale,
          }}
        >
          <span style={{ fontSize: 22 * scale, color: '#3fdcb0' }}>✓</span>
        </div>
      )}
    </div>
  );
}

