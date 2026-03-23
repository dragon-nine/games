import { useState } from 'react';
import { gameBus } from '../../game/event-bus';
import styles from './overlay.module.css';

const btnStyle: React.CSSProperties = {
  width: 240,
  height: 52,
  background: '#222228',
  border: '2px solid #333338',
  borderRadius: 12,
  color: '#ffffff',
  fontSize: 18,
  fontWeight: 'bold',
  fontFamily: 'GMarketSans, sans-serif',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
};

export function PauseOverlay() {
  const [bgmMuted, setBgmMuted] = useState(localStorage.getItem('bgmMuted') === 'true');
  const [sfxMuted, setSfxMuted] = useState(localStorage.getItem('sfxMuted') === 'true');

  const handleResume = () => {
    gameBus.emit('play-sfx', 'sfx-click');
    gameBus.emit('resume-game', undefined);
  };

  const handleBgmToggle = () => {
    const next = !bgmMuted;
    setBgmMuted(next);
    localStorage.setItem('bgmMuted', String(next));
    gameBus.emit('toggle-bgm', undefined);
  };

  const handleSfxToggle = () => {
    const next = !sfxMuted;
    setSfxMuted(next);
    localStorage.setItem('sfxMuted', String(next));
    gameBus.emit('toggle-sfx', undefined);
  };

  return (
    <div className={`${styles.overlay} ${styles.fadeIn}`} onClick={handleResume}>
      <div className={styles.dim} />

      <div className={styles.content} style={{ justifyContent: 'center', gap: 20, zIndex: 1 }}>
        <h1
          style={{
            fontSize: 36,
            color: '#ffffff',
            fontWeight: 'bold',
            fontFamily: 'GMarketSans, sans-serif',
            margin: 0,
            marginBottom: 12,
          }}
        >
          일시정지
        </h1>

        <button
          onClick={(e) => { e.stopPropagation(); handleBgmToggle(); }}
          style={btnStyle}
        >
          <span style={{ color: '#999' }}>배경음악</span>
          <span style={{ color: bgmMuted ? '#cc3333' : '#ffffff' }}>
            {bgmMuted ? 'OFF' : 'ON'}
          </span>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); handleSfxToggle(); }}
          style={btnStyle}
        >
          <span style={{ color: '#999' }}>효과음</span>
          <span style={{ color: sfxMuted ? '#cc3333' : '#ffffff' }}>
            {sfxMuted ? 'OFF' : 'ON'}
          </span>
        </button>

        <p
          style={{
            fontSize: 13,
            color: '#555',
            fontFamily: 'GMarketSans, sans-serif',
            marginTop: 24,
          }}
        >
          화면을 터치하면 계속합니다
        </p>
      </div>
    </div>
  );
}
