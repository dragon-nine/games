import Phaser from 'phaser';
import { GameManager } from '../GameManager';
import { STAGES } from '../data/stages';
import { emitGameState } from '../GameBridge';

interface ResultData {
  stageId: number;
  score: number;
  completed: boolean;
  timeRemaining: number;
}

export class ResultScene extends Phaser.Scene {
  private resultData!: ResultData;

  constructor() {
    super({ key: 'ResultScene' });
  }

  init(data: ResultData) {
    this.resultData = data;
  }

  create() {
    const { width, height } = this.scale;
    const { score, completed, timeRemaining } = this.resultData;

    // Record result
    GameManager.recordResult(this.resultData.stageId, score, completed, timeRemaining);

    // Background
    this.cameras.main.setBackgroundColor(completed ? '#0d2818' : '#2e0a0a');

    // Result emoji
    const emoji = this.add.text(width / 2, height * 0.2, completed ? '🎉' : '⏰', {
      fontSize: '64px',
    }).setOrigin(0.5).setScale(0);
    this.tweens.add({ targets: emoji, scale: 1, duration: 400, ease: 'Back.easeOut' });

    // Result text
    this.add.text(width / 2, height * 0.38, completed ? '미션 완료!' : '시간 초과!', {
      fontFamily: 'sans-serif', fontSize: '36px',
      color: completed ? '#00b894' : '#e94560',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Score
    const scoreText = this.add.text(width / 2, height * 0.52, `${score}점`, {
      fontFamily: 'sans-serif', fontSize: '48px', color: '#ffd700', fontStyle: 'bold',
    }).setOrigin(0.5).setScale(0);
    this.tweens.add({ targets: scoreText, scale: 1, duration: 500, delay: 300, ease: 'Back.easeOut' });

    // Running total
    this.add.text(width / 2, height * 0.64, `누적 점수: ${GameManager.totalScore.toLocaleString()}점`, {
      fontFamily: 'sans-serif', fontSize: '18px', color: '#aaaaaa',
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({
      targets: this.children.list[this.children.list.length - 1],
      alpha: 1, duration: 300, delay: 600,
    });

    // Progress indicator
    const progressY = height * 0.78;
    const dotSpacing = 60;
    const startX = width / 2 - (dotSpacing * (STAGES.length - 1)) / 2;

    STAGES.forEach((stage, i) => {
      const x = startX + i * dotSpacing;
      const isDone = i < GameManager.progress;
      const isCurrent = i === GameManager.progress - 1;

      const color = isDone ? 0x00b894 : 0x333355;
      const dot = this.add.circle(x, progressY, isCurrent ? 12 : 8, color);
      if (isCurrent) dot.setStrokeStyle(2, 0xffd700);

      this.add.text(x, progressY + 20, stage.emoji, {
        fontSize: '14px',
      }).setOrigin(0.5);
    });

    // Auto-advance
    this.time.delayedCall(2500, () => {
      GameManager.advanceStage();

      if (GameManager.allCleared) {
        this.scene.start('RankingScene');
      } else {
        const nextStage = GameManager.getCurrentStage();
        this.scene.start('MinigameIntroScene', {
          stageId: nextStage.id,
          stageName: nextStage.name,
          stageEmoji: nextStage.emoji,
          minigameName: nextStage.minigame.name,
          minigameDesc: nextStage.minigame.description,
          minigameSceneKey: nextStage.minigame.sceneKey,
        });
      }
    });

    emitGameState({
      scene: 'ResultScene',
      stageId: this.resultData.stageId,
      progress: GameManager.progress,
      allCleared: GameManager.allCleared,
      stress: 0,
      totalScore: GameManager.totalScore,
    });
  }
}
