import Phaser from 'phaser';
import { GameManager } from '../GameManager';
import { STAGES } from '../data/stages';
import { emitGameState } from '../GameBridge';

export class RankingScene extends Phaser.Scene {
  private nicknameText!: Phaser.GameObjects.Text;
  private nickname = '';
  private saved = false;

  constructor() {
    super({ key: 'RankingScene' });
  }

  create() {
    this.nickname = '';
    this.saved = false;

    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#0a0a1e');

    const grade = GameManager.getGrade();
    const totalScore = GameManager.totalScore;
    const results = GameManager.results;

    // Confetti
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(0, width);
      const colors = [0xe94560, 0x00b894, 0x3182f6, 0xffd700, 0xff6b35];
      const color = Phaser.Math.RND.pick(colors);
      const size = Phaser.Math.Between(3, 8);
      const confetti = this.add.rectangle(x, -20, size, size * 2, color);
      this.tweens.add({
        targets: confetti,
        y: height + 20,
        x: x + Phaser.Math.Between(-80, 80),
        angle: Phaser.Math.Between(0, 720),
        duration: Phaser.Math.Between(2000, 4000),
        delay: Phaser.Math.Between(0, 1500),
        repeat: -1,
      });
    }

    // Header
    this.add.text(width / 2, 30, '🎊  퇴근 완료!  🎊', {
      fontFamily: 'sans-serif', fontSize: '28px', color: '#ffd700', fontStyle: 'bold',
    }).setOrigin(0.5);

    // === Score card (upper half) ===
    const cardW = width - 40;
    const cardH = 280;
    const cardX = width / 2;
    const cardY = 200;

    this.add.rectangle(cardX, cardY, cardW, cardH, 0x16213e).setStrokeStyle(2, 0x3182f6);

    this.add.text(cardX, cardY - cardH / 2 + 22, '오늘의 리포트', {
      fontFamily: 'sans-serif', fontSize: '15px', color: '#aaaacc', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.rectangle(cardX, cardY - cardH / 2 + 40, cardW - 30, 1, 0x333355);

    // Stage scores
    let statY = cardY - cardH / 2 + 58;
    results.forEach((result) => {
      const stage = STAGES.find(s => s.id === result.stageId);
      if (!stage) return;

      this.add.text(cardX - cardW / 2 + 20, statY, `${stage.emoji} ${stage.category}`, {
        fontFamily: 'sans-serif', fontSize: '14px', color: '#888899',
      }).setOrigin(0, 0.5);
      this.add.text(cardX + cardW / 2 - 20, statY, `${result.score}점`, {
        fontFamily: 'sans-serif', fontSize: '14px', color: result.completed ? '#00b894' : '#e94560', fontStyle: 'bold',
      }).setOrigin(1, 0.5);
      statY += 24;
    });

    // Total score
    statY += 4;
    this.add.rectangle(cardX, statY, cardW - 40, 1, 0x333355);
    statY += 16;

    this.add.text(cardX - cardW / 2 + 20, statY, '총점', {
      fontFamily: 'sans-serif', fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    this.add.text(cardX + cardW / 2 - 20, statY, `${totalScore.toLocaleString()}점`, {
      fontFamily: 'sans-serif', fontSize: '16px', color: '#ffd700', fontStyle: 'bold',
    }).setOrigin(1, 0.5);

    // Grade
    statY += 26;
    const gradeText = this.add.text(cardX, statY + 4, `${grade.emoji} ${grade.key}등급 "${grade.title}"`, {
      fontFamily: 'sans-serif', fontSize: '18px', color: '#ffd700', fontStyle: 'bold',
    }).setOrigin(0.5).setScale(0);
    this.tweens.add({ targets: gradeText, scale: 1, duration: 500, delay: 500, ease: 'Back.easeOut' });

    statY += 28;
    this.add.text(cardX, statY, `"${grade.comment}"`, {
      fontFamily: 'sans-serif', fontSize: '13px', color: '#aaaaaa', fontStyle: 'italic',
    }).setOrigin(0.5);

    // === Ranking board (lower half) ===
    const rankW = cardW;
    const rankH = 300;
    const rankCenterY = cardY + cardH / 2 + 20 + rankH / 2;

    this.add.rectangle(cardX, rankCenterY, rankW, rankH, 0x16213e).setStrokeStyle(2, 0x3182f6);

    this.add.text(cardX, rankCenterY - rankH / 2 + 22, '🏆 랭킹 보드', {
      fontFamily: 'sans-serif', fontSize: '15px', color: '#aaaacc', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.rectangle(cardX, rankCenterY - rankH / 2 + 40, rankW - 30, 1, 0x333355);

    const ranking = GameManager.getRanking();
    let rankY = rankCenterY - rankH / 2 + 60;

    if (ranking.length === 0) {
      this.add.text(cardX, rankY + 30, '아직 기록이 없습니다', {
        fontFamily: 'sans-serif', fontSize: '14px', color: '#666688',
      }).setOrigin(0.5);
    } else {
      ranking.slice(0, 8).forEach((entry, idx) => {
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`;
        this.add.text(cardX - rankW / 2 + 16, rankY, `${medal}`, {
          fontFamily: 'sans-serif', fontSize: '14px', color: '#ffffff',
        }).setOrigin(0, 0.5);
        this.add.text(cardX - rankW / 2 + 50, rankY, entry.nickname || '???', {
          fontFamily: 'sans-serif', fontSize: '14px', color: '#cccccc',
        }).setOrigin(0, 0.5);
        this.add.text(cardX + rankW / 2 - 16, rankY, `${entry.totalScore}점`, {
          fontFamily: 'sans-serif', fontSize: '14px', color: '#ffd700', fontStyle: 'bold',
        }).setOrigin(1, 0.5);
        rankY += 24;
      });
    }

    // === Bottom buttons ===
    const btnAreaY = height - 80;

    // Nickname input
    this.nicknameText = this.add.text(width / 2, btnAreaY - 24, '닉네임: _', {
      fontFamily: 'sans-serif', fontSize: '16px', color: '#aaaaaa',
    }).setOrigin(0.5);

    // Save button
    const saveBtn = this.add.rectangle(width / 2 - 70, btnAreaY + 16, 120, 40, 0x3182f6)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2 - 70, btnAreaY + 16, '저장', {
      fontFamily: 'sans-serif', fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    saveBtn.on('pointerdown', () => {
      if (!this.saved) {
        const name = this.nickname.trim() || '익명';
        GameManager.saveRanking(name);
        this.saved = true;
        this.scene.restart();
      }
    });

    // Retry button
    const retryBtn = this.add.rectangle(width / 2 + 70, btnAreaY + 16, 120, 40, 0xe94560)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2 + 70, btnAreaY + 16, '🔄 다시하기', {
      fontFamily: 'sans-serif', fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    retryBtn.on('pointerdown', () => {
      GameManager.reset();
      this.scene.start('BootScene');
    });

    // Keyboard input for nickname
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (this.saved) return;
      if (event.key === 'Backspace') {
        this.nickname = this.nickname.slice(0, -1);
      } else if (event.key.length === 1 && this.nickname.length < 10) {
        this.nickname += event.key;
      }
      this.nicknameText.setText(`닉네임: ${this.nickname}_`);
    });

    emitGameState({
      scene: 'RankingScene',
      progress: GameManager.progress,
      allCleared: true,
      stress: 0,
      totalScore: GameManager.totalScore,
    });
  }
}
