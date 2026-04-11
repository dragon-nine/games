import { useId } from 'react';

/**
 * 코인/보석 아이콘 — 단일 진실 원천(SSOT)
 *
 * 모든 화면(홈, 상점, 캐릭터, 디버그 등)에서 동일한 아이콘을 사용하기 위한 공용 컴포넌트.
 * 사이즈만 받아서 자동으로 비율 계산.
 */

interface IconProps {
  size: number;
}

/**
 * 골드 코인 — SVG 원 + 라디얼 그라데이션 + ₩ 글자
 * (홈 알약 스타일을 표준으로 채택)
 */
export function CoinIcon({ size }: IconProps) {
  const gradId = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ flexShrink: 0, display: 'block' }}
    >
      <defs>
        <radialGradient id={gradId} cx="40%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#fff5b0" />
          <stop offset="50%" stopColor="#ffd24a" />
          <stop offset="100%" stopColor="#a06800" />
        </radialGradient>
      </defs>
      <circle
        cx="12"
        cy="12"
        r="10"
        fill={`url(#${gradId})`}
        stroke="#5a3000"
        strokeWidth="1.5"
      />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontFamily="Arial Black, sans-serif"
        fontSize="11"
        fontWeight="900"
        fill="#5a3000"
      >
        ₩
      </text>
    </svg>
  );
}

/**
 * 민트 보석 — SVG 다이아 형상 + 드롭 섀도우
 * (상점/캐릭터 스타일을 표준으로 채택)
 */
export function GemIcon({ size }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{
        filter: `drop-shadow(0 ${size * 0.05}px ${size * 0.15}px rgba(63,220,176,0.4))`,
        flexShrink: 0,
        display: 'block',
      }}
    >
      <path
        d="M6 3h12l4 6-10 12L2 9z"
        fill="#3fdcb0"
        stroke="#0a8a60"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M6 3l4 6h4l4-6"
        stroke="#a8ffe5"
        strokeWidth="1"
        fill="none"
        strokeLinejoin="round"
      />
      <path d="M2 9h20" stroke="#0a8a60" strokeWidth="0.8" fill="none" />
    </svg>
  );
}
