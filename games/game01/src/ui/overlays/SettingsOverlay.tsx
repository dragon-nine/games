import { useState } from 'react';
import { gameBus } from '../../game/event-bus';
import { DESIGN_W } from '../../game/layout-types';
import { LayoutRenderer } from '../components/LayoutRenderer';
import settingsLayout from '../../../public/layout/settings.json';
import styles from './overlay.module.css';

const MAX_W = 500;
const scale = Math.min(window.innerWidth, MAX_W) / DESIGN_W;

export function SettingsOverlay() {
  const [bgmMuted, setBgmMuted] = useState(localStorage.getItem('bgmMuted') === 'true');
  const [sfxMuted, setSfxMuted] = useState(localStorage.getItem('sfxMuted') === 'true');

  const handleClose = () => {
    gameBus.emit('play-sfx', 'sfx-click');
    gameBus.emit('screen-change', 'main');
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
    <div className={`${styles.overlay} ${styles.fadeIn}`} onClick={handleClose}>
      <div className={styles.dim} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
        <LayoutRenderer
          elements={settingsLayout.elements as any}
          scale={scale}
          screenW={Math.min(window.innerWidth, MAX_W)}
          screenH={window.innerHeight}
          screenPadding={settingsLayout.padding as any}
          groupVAlign={(settingsLayout as any).groupVAlign || 'center'}
          textOverrides={{
            'el-mn75ws33-5bwz': `음악 ${bgmMuted ? 'OFF' : 'ON'}`,
            'el-mn75xgke-bj91': `효과음 ${sfxMuted ? 'OFF' : 'ON'}`,
          }}
          clickHandlers={{
            'el-mn75wlue-m5il': handleBgmToggle,
            'el-mn75ws33-5bwz': handleBgmToggle,
            'el-mn75xebg-5f1p': handleSfxToggle,
            'el-mn75xgke-bj91': handleSfxToggle,
          }}
          toggleStates={{
            'el-mn75wlue-m5il': !bgmMuted,
            'el-mn75xebg-5f1p': !sfxMuted,
          }}
        />
      </div>
    </div>
  );
}
