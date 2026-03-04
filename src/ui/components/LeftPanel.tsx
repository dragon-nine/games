import { STAGES } from '../../game/data/stages';
import type { GameState } from '../../game/GameBridge';
import styles from './LeftPanel.module.css';

interface Props {
  gameState: GameState;
}

export function LeftPanel({ gameState }: Props) {
  const currentStage = STAGES.find(s => s.id === gameState.stageId) ?? null;
  const timeDisplay = gameState.time
    ? `${gameState.time} ${gameState.period ?? ''}`
    : null;

  return (
    <aside className={styles.panel}>
      {/* 게임 소개 */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>직장인 잔혹사</div>
        <p className={styles.description}>
          직장인의 하루를 5개 미니게임으로 체험하세요.
        </p>
        <p className={styles.descriptionSub}>
          각 게임은 60초 제한! 높은 점수로 퇴근의 달인에 도전하세요.
        </p>
      </div>

      {/* 게임 규칙 */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>규칙</div>
        <ul className={styles.controlList}>
          <li className={styles.controlItem}>
            <span className={styles.controlKey}>⏱ 60초</span>
            스테이지당 제한시간
          </li>
          <li className={styles.controlItem}>
            <span className={styles.controlKey}>⚡ 빠를수록</span>
            높은 점수 획득
          </li>
          <li className={styles.controlItem}>
            <span className={styles.controlKey}>🏆 상한 없음</span>
            총점 무제한
          </li>
        </ul>
      </div>

      {/* 현재 스테이지 */}
      {currentStage && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>현재 스테이지</div>
          {timeDisplay && (
            <div className={styles.timeDisplay}>{timeDisplay}</div>
          )}
          <div className={styles.currentStage}>
            <span className={styles.stageEmoji}>{currentStage.emoji}</span>
            <div className={styles.stageInfo}>
              <span className={styles.stageLabel}>STAGE {currentStage.id} — {currentStage.category}</span>
              <span className={styles.stageName}>{currentStage.name}</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
