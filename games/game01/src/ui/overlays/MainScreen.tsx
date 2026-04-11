import { useState } from 'react';
import { gameBus } from '../../game/event-bus';
import { useResponsiveScale } from '../hooks/useResponsiveScale';
import { BottomTabBar, type HomeTab as TabKey } from './home/BottomTabBar';
import { HomeTab } from './home/HomeTab';
import { ShopTab } from './home/ShopTab';
import { CharactersTab } from './home/CharactersTab';
import styles from './overlay.module.css';

export function MainScreen() {
  const scale = useResponsiveScale();
  const [tab, setTab] = useState<TabKey>('home');

  const handleTabChange = (next: TabKey) => {
    if (next === tab) return;
    gameBus.emit('play-sfx', 'sfx-click');
    setTab(next);
  };

  return (
    <div
      className={styles.overlay}
      style={{
        // 페이지 베이스 — 홈 탭은 자체 배경을 덮어씌움
        background: '#0a0a14',
      }}
    >
      {/* ── 탭 컨텐츠 (배경 + 탭별 헤더 포함) ── */}
      {tab === 'home' && <HomeTab scale={scale} />}
      {tab === 'shop' && <ShopTab scale={scale} />}
      {tab === 'characters' && <CharactersTab scale={scale} />}

      {/* ── 하단 탭바 ── */}
      <BottomTabBar active={tab} onChange={handleTabChange} scale={scale} />
    </div>
  );
}
