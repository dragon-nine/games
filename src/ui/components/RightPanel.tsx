import { STAGES } from '../../game/data/stages';
import type { GameState } from '../../game/GameBridge';
import styles from './RightPanel.module.css';

interface Props {
  gameState: GameState;
}

export function RightPanel({ gameState }: Props) {
  const { progress, totalScore } = gameState;

  return (
    <aside className={styles.panel}>
      {/* 점수 */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>총점</div>
        <div className={styles.stressInfo}>
          <span className={styles.stressValue}>{(totalScore ?? 0).toLocaleString()}점</span>
        </div>
      </div>

      {/* 오늘의 하루 타임라인 */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>오늘의 하루</div>
        <div className={styles.progressList}>
          {STAGES.map((stage, i) => {
            const isDone = i < progress;
            const isCurrent = i === progress;

            let dotClass = styles.dotLocked;
            let nameClass = styles.stageName;
            let statusText = '';

            if (isDone) {
              dotClass = styles.dotCleared;
              statusText = '✓';
            } else if (isCurrent) {
              dotClass = styles.dotCurrent;
              nameClass = `${styles.stageName} ${styles.stageNameActive}`;
              statusText = '▶';
            }

            return (
              <div key={stage.id} className={styles.progressItem}>
                <span className={styles.timeLabel}>{stage.time}</span>
                <div className={`${styles.progressDot} ${dotClass}`} />
                <span className={nameClass}>
                  {stage.emoji} {stage.category}
                </span>
                <span className={`${styles.stageStatus} ${isDone ? styles.statusCleared : isCurrent ? styles.statusCurrent : styles.statusLocked}`}>
                  {statusText}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 통계 */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>진행도</div>
        <div className={styles.statsGrid}>
          <div className={styles.statBox}>
            <div className={styles.statValue}>{progress}</div>
            <div className={styles.statLabel}>완료</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statValue}>{STAGES.length - progress}</div>
            <div className={styles.statLabel}>남음</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
