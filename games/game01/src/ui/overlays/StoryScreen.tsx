import { gameBus } from '../../game/event-bus';
import { usePress } from '../hooks/usePress';
import styles from './overlay.module.css';

const BASE = import.meta.env.BASE_URL || '/';

export function StoryScreen() {
  const { handlers, pressStyle } = usePress();

  const handleTap = () => {
    gameBus.emit('play-sfx', 'sfx-click');
    gameBus.emit('start-game', undefined);
  };

  return (
    <div className={styles.overlay} style={{ background: '#000' }}>
      <div
        className={styles.fadeIn}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={`${BASE}story/story.png`}
          alt="story"
          draggable={false}
          style={{
            width: '100%',
            maxHeight: '80%',
            objectFit: 'contain',
          }}
        />
        <div
          onClick={handleTap}
          {...handlers('story-start')}
          className={styles.fadeInThenPulse}
          style={{
            marginTop: 24,
            padding: '14px 48px',
            background: 'rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: 999,
            color: '#fff',
            fontFamily: 'GMarketSans, sans-serif',
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
            ...pressStyle('story-start'),
          }}
        >
          출발!
        </div>
      </div>
    </div>
  );
}
