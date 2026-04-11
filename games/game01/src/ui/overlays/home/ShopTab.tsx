import { gameBus } from '../../../game/event-bus';
import { storage } from '../../../game/services/storage';
import { CoinIcon, GemIcon } from '../../components/CurrencyIcons';
import { TapButton } from '../../components/TapButton';
import styles from '../overlay.module.css';

interface Props {
  scale: number;
}

/* ── 데이터 ── */

interface FreeReward {
  id: string;
  kind: 'coin' | 'gem';
  amount: number;
  badge: string;
}

const FREE_REWARDS: FreeReward[] = [
  { id: 'free-coin', kind: 'coin', amount: 50, badge: '일 5회' },
  { id: 'free-gem',  kind: 'gem',  amount: 2,  badge: '일 3회' },
];

interface PkgItem {
  id: string;
  amount: number;
  amountLabel: string;
  bonusPct?: number;
  extra: string;
  extraNeutral?: boolean;
  price: string;
  highlight?: 'best' | 'hot';
}

const GEM_PACKAGES: PkgItem[] = [
  { id: 'g1', amount: 30,   amountLabel: '보석 30개',    extra: '기본 상품',          extraNeutral: true, price: '₩1,100' },
  { id: 'g2', amount: 165,  amountLabel: '보석 165개',   bonusPct: 10, extra: '150 + 보너스 15',  price: '₩5,500',  highlight: 'hot' },
  { id: 'g3', amount: 500,  amountLabel: '보석 500개',   bonusPct: 25, extra: '400 + 보너스 100', price: '₩11,000', highlight: 'best' },
  { id: 'g4', amount: 1400, amountLabel: '보석 1,400개', bonusPct: 40, extra: '1000 + 보너스 400', price: '₩22,000' },
];

const COIN_PACKAGES: PkgItem[] = [
  { id: 'c1', amount: 1000,  amountLabel: '코인 1,000개', extra: '소량 충전',         extraNeutral: true, price: '보석 10개' },
  { id: 'c2', amount: 6000,  amountLabel: '코인 6,000개', bonusPct: 20, extra: '5000 + 보너스 1000',  price: '보석 50개' },
  { id: 'c3', amount: 14000, amountLabel: '코인 14,000개', bonusPct: 40, extra: '10000 + 보너스 4000', price: '보석 100개' },
];

/* ── 컴포넌트 ── */

export function ShopTab({ scale }: Props) {
  const coins = storage.getNum('coins');
  const gems = storage.getNum('gems');

  const handleAdRemove = () => {
    gameBus.emit('play-sfx', 'sfx-click');
    gameBus.emit('show-ad-remove', undefined);
  };

  const handleFreeReward = (r: FreeReward) => {
    gameBus.emit('play-sfx', 'sfx-click');
    gameBus.emit('toast', `광고 시청 (${r.kind === 'coin' ? '코인' : '보석'} +${r.amount})`);
  };

  const handlePackage = (p: PkgItem, kind: 'gem' | 'coin') => {
    gameBus.emit('play-sfx', 'sfx-click');
    gameBus.emit('toast', `${kind === 'gem' ? '보석' : '코인'} ${p.amount}개 구매 (준비 중)`);
  };

  return (
    <div
      className={styles.fadeIn}
      style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(ellipse at 20% 80%, rgba(60,50,40,0.2) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, rgba(40,35,30,0.2) 0%, transparent 50%),
          #1a1a1f
        `,
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'auto',
      }}
    >
      {/* ── 상단 헤더 ── */}
      <div
        style={{
          padding: `calc(var(--sat, 0px) + ${10 * scale}px) ${14 * scale}px ${10 * scale}px`,
          display: 'flex',
          alignItems: 'center',
          gap: 8 * scale,
          background: 'rgba(12,12,16,0.8)',
          borderBottom: `1px solid rgba(255,255,255,0.04)`,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: 'GMarketSans, sans-serif',
            fontWeight: 900,
            fontSize: 20 * scale,
            color: '#fff',
            marginRight: 'auto',
            letterSpacing: 0.3,
          }}
        >
          상점
        </span>
        <CurrencyPill kind="coin" amount={coins} scale={scale} />
        <CurrencyPill kind="gem" amount={gems} scale={scale} />
      </div>

      {/* ── 스크롤 영역 ── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          padding: `${16 * scale}px ${14 * scale}px calc(var(--sab, 0px) + ${88 * scale}px)`,
        }}
      >
        {/* 광고 제거 배너 */}
        <TapButton
          onTap={handleAdRemove}
          pressScale={0.97}
          scrollSafe
          style={{
            background: 'linear-gradient(135deg, #2a1a1e, #3a1f1a)',
            border: `${1.5 * scale}px solid rgba(232,89,60,0.35)`,
            borderRadius: 18 * scale,
            padding: 16 * scale,
            marginBottom: 18 * scale,
            display: 'flex',
            alignItems: 'center',
            gap: 12 * scale,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* 원형 데코 */}
          <div
            style={{
              position: 'absolute',
              top: -20 * scale,
              right: -20 * scale,
              width: 100 * scale,
              height: 100 * scale,
              borderRadius: '50%',
              background: 'rgba(232,89,60,0.08)',
              pointerEvents: 'none',
            }}
          />
          {/* 아이콘 */}
          <div
            style={{
              width: 52 * scale,
              height: 52 * scale,
              borderRadius: 13 * scale,
              background: 'rgba(232,89,60,0.18)',
              border: `1px solid rgba(232,89,60,0.3)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              position: 'relative',
              zIndex: 2,
            }}
          >
            <svg width={26 * scale} height={26 * scale} viewBox="0 0 24 24" fill="none" stroke="#e8593c" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M4.93 4.93l14.14 14.14" />
            </svg>
          </div>
          {/* 텍스트 */}
          <div style={{ flex: 1, position: 'relative', zIndex: 2, textAlign: 'left' }}>
            <div
              style={{
                display: 'inline-block',
                background: '#e8593c',
                color: '#fff',
                fontSize: 9 * scale,
                fontWeight: 700,
                padding: `${2 * scale}px ${7 * scale}px`,
                borderRadius: 10 * scale,
                letterSpacing: 0.5,
                marginBottom: 3 * scale,
                fontFamily: 'GMarketSans, sans-serif',
              }}
            >
              BEST
            </div>
            <div
              style={{
                fontFamily: 'GMarketSans, sans-serif',
                fontSize: 17 * scale,
                fontWeight: 900,
                color: '#fff',
                marginBottom: 2 * scale,
              }}
            >
              광고 제거
            </div>
            <div
              style={{
                fontFamily: 'GMarketSans, sans-serif',
                fontSize: 11 * scale,
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              광고 없이 바로 부활하기
            </div>
          </div>
          {/* 가격 */}
          <div
            style={{
              fontFamily: 'GMarketSans, sans-serif',
              fontSize: 17 * scale,
              fontWeight: 900,
              color: '#e8593c',
              flexShrink: 0,
              position: 'relative',
              zIndex: 2,
            }}
          >
            ₩1,900
          </div>
        </TapButton>

        {/* 무료 보상 섹션 */}
        <Section title="무료 보상" hint="광고 시청 후 지급" scale={scale} icon={<GiftIcon size={20 * scale} />}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10 * scale,
            }}
          >
            {FREE_REWARDS.map((r) => (
              <FreeRewardCard key={r.id} reward={r} scale={scale} onClick={() => handleFreeReward(r)} />
            ))}
          </div>
        </Section>

        {/* 보석 충전 섹션 */}
        <Section title="보석 충전" scale={scale} icon={<GemIcon size={20 * scale} />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 * scale }}>
            {GEM_PACKAGES.map((p) => (
              <PackageCard key={p.id} item={p} kind="gem" scale={scale} onClick={() => handlePackage(p, 'gem')} />
            ))}
          </div>
        </Section>

        {/* 코인 충전 섹션 */}
        <Section title="코인 충전" scale={scale} icon={<CoinIcon size={18 * scale} />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 * scale }}>
            {COIN_PACKAGES.map((p) => (
              <PackageCard key={p.id} item={p} kind="coin" scale={scale} onClick={() => handlePackage(p, 'coin')} />
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

/* ── Section ── */

function Section({
  title,
  hint,
  icon,
  scale,
  children,
}: {
  title: string;
  hint?: string;
  icon: React.ReactNode;
  scale: number;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 22 * scale }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 * scale, marginBottom: 11 * scale }}>
        <div style={{ width: 22 * scale, height: 22 * scale, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <span
          style={{
            fontFamily: 'GMarketSans, sans-serif',
            fontWeight: 900,
            fontSize: 16 * scale,
            color: '#fff',
          }}
        >
          {title}
        </span>
        {hint && (
          <span
            style={{
              marginLeft: 'auto',
              fontFamily: 'GMarketSans, sans-serif',
              fontSize: 11 * scale,
              color: 'rgba(255,255,255,0.35)',
            }}
          >
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

/* ── Free reward card ── */

function FreeRewardCard({
  reward,
  scale,
  onClick,
}: {
  reward: FreeReward;
  scale: number;
  onClick: () => void;
}) {
  return (
    <TapButton
      onTap={onClick}
      pressScale={0.95}
      scrollSafe
      style={{
        background: 'linear-gradient(145deg, rgba(63,220,176,0.14), rgba(63,220,176,0.04))',
        border: `1px solid rgba(63,220,176,0.28)`,
        borderRadius: 14 * scale,
        padding: `${14 * scale}px ${10 * scale}px`,
        textAlign: 'center',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 6 * scale,
          right: 6 * scale,
          background: 'rgba(0,0,0,0.4)',
          color: 'rgba(255,255,255,0.55)',
          fontSize: 9 * scale,
          fontWeight: 700,
          padding: `${2 * scale}px ${5 * scale}px`,
          borderRadius: 4 * scale,
          letterSpacing: 0.3,
          fontFamily: 'GMarketSans, sans-serif',
        }}
      >
        {reward.badge}
      </span>

      <div
        style={{
          width: 48 * scale,
          height: 48 * scale,
          margin: `${4 * scale}px auto ${8 * scale}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {reward.kind === 'coin' ? <CoinIcon size={44 * scale} /> : <GemIcon size={44 * scale} />}
      </div>

      <div
        style={{
          fontFamily: 'GMarketSans, sans-serif',
          fontWeight: 900,
          fontSize: 18 * scale,
          color: '#fff',
          marginBottom: 8 * scale,
        }}
      >
        +{reward.amount}
      </div>

      <div
        style={{
          width: '100%',
          padding: 8 * scale,
          background: '#1d9e75',
          borderRadius: 10 * scale,
          fontSize: 12 * scale,
          fontWeight: 700,
          color: '#fff',
          boxShadow: `0 ${2 * scale}px ${8 * scale}px rgba(29,158,117,0.3)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4 * scale,
          fontFamily: 'GMarketSans, sans-serif',
        }}
      >
        <svg width={11 * scale} height={11 * scale} viewBox="0 0 24 24" fill="#fff">
          <polygon points="6 3 20 12 6 21 6 3" />
        </svg>
        광고 보기
      </div>
    </TapButton>
  );
}

/* ── Package card (vertical list item) ── */

function PackageCard({
  item,
  kind,
  scale,
  onClick,
}: {
  item: PkgItem;
  kind: 'gem' | 'coin';
  scale: number;
  onClick: () => void;
}) {
  const isBest = item.highlight === 'best';
  const isHot = item.highlight === 'hot';

  let bg = 'rgba(255,255,255,0.03)';
  let border = `1px solid rgba(255,255,255,0.06)`;
  if (isBest) {
    bg = 'linear-gradient(135deg, rgba(232,89,60,0.10), rgba(232,89,60,0.02))';
    border = `${1.5 * scale}px solid rgba(232,89,60,0.4)`;
  } else if (isHot) {
    bg = 'linear-gradient(135deg, rgba(250,199,117,0.08), rgba(250,199,117,0.02))';
    border = `${1.5 * scale}px solid rgba(250,199,117,0.32)`;
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* BEST/HOT 라벨 */}
      {(isBest || isHot) && (
        <div
          style={{
            position: 'absolute',
            top: -8 * scale,
            right: 16 * scale,
            background: isBest ? '#e8593c' : '#BA7517',
            color: '#fff',
            fontSize: 9 * scale,
            fontWeight: 700,
            padding: `${3 * scale}px ${8 * scale}px`,
            borderRadius: 10 * scale,
            letterSpacing: 0.5,
            zIndex: 2,
            fontFamily: 'GMarketSans, sans-serif',
          }}
        >
          {isBest ? 'BEST' : 'HOT'}
        </div>
      )}

      <TapButton
        onTap={onClick}
        pressScale={0.97}
        scrollSafe
        style={{
          background: bg,
          border,
          borderRadius: 14 * scale,
          padding: `${13 * scale}px ${15 * scale}px`,
          display: 'flex',
          alignItems: 'center',
          gap: 12 * scale,
        }}
      >
        {/* 아이콘 */}
        <div
          style={{
            width: 54 * scale,
            height: 54 * scale,
            borderRadius: 12 * scale,
            background: 'rgba(255,255,255,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          {kind === 'gem' ? <GemIcon size={36 * scale} /> : <CoinIcon size={40 * scale} />}
          {item.bonusPct !== undefined && (
            <div
              style={{
                position: 'absolute',
                top: -6 * scale,
                right: -6 * scale,
                background: '#e8593c',
                color: '#fff',
                fontSize: 9 * scale,
                fontWeight: 700,
                padding: `${2 * scale}px ${6 * scale}px`,
                borderRadius: 8 * scale,
                whiteSpace: 'nowrap',
                fontFamily: 'GMarketSans, sans-serif',
              }}
            >
              +{item.bonusPct}%
            </div>
          )}
        </div>
        {/* 텍스트 */}
        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
          <div
            style={{
              fontFamily: 'GMarketSans, sans-serif',
              fontWeight: 900,
              fontSize: 17 * scale,
              color: '#fff',
              marginBottom: 2 * scale,
            }}
          >
            {item.amountLabel}
          </div>
          <div
            style={{
              fontFamily: 'GMarketSans, sans-serif',
              fontSize: 11 * scale,
              fontWeight: item.extraNeutral ? 500 : 700,
              color: item.extraNeutral ? 'rgba(255,255,255,0.4)' : '#e8593c',
            }}
          >
            {item.extra}
          </div>
        </div>
        {/* 가격 버튼 */}
        <div
          style={{
            padding: `${10 * scale}px ${13 * scale}px`,
            borderRadius: 10 * scale,
            background: kind === 'gem' ? '#e8593c' : 'rgba(255,255,255,0.08)',
            color: kind === 'gem' ? '#fff' : 'rgba(255,255,255,0.78)',
            fontFamily: 'GMarketSans, sans-serif',
            fontSize: 12 * scale,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            boxShadow: kind === 'gem' ? `0 ${2 * scale}px ${8 * scale}px rgba(232,89,60,0.25)` : 'none',
            flexShrink: 0,
          }}
        >
          {item.price}
        </div>
      </TapButton>
    </div>
  );
}

/* ── Icons ── */

function CurrencyPill({ kind, amount, scale }: { kind: 'coin' | 'gem'; amount: number; scale: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4 * scale,
        padding: `${5 * scale}px ${10 * scale}px ${5 * scale}px ${5 * scale}px`,
        borderRadius: 20 * scale,
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid rgba(255,255,255,0.08)`,
        fontFamily: 'GMarketSans, sans-serif',
        fontWeight: 700,
        fontSize: 13 * scale,
        color: '#fff',
      }}
    >
      {kind === 'coin' ? <CoinIcon size={20 * scale} /> : <GemIcon size={20 * scale} />}
      <span>{amount.toLocaleString()}</span>
    </div>
  );
}

function GiftIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#3fdcb0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 010-5c2.5 0 4.5 5 4.5 5S9.5 8 7.5 8zM16.5 8a2.5 2.5 0 000-5c-2.5 0-4.5 5-4.5 5s2.5 0 4.5 0z" />
    </svg>
  );
}
