import Phaser from 'phaser';
import { GameManager } from '../../GameManager';
import { emitGameState } from '../../GameBridge';

/* ══════════════════════════════════════
   STAGE 5: 술 버리기 (슈의 맛동산 스타일)

   부장과 마주보고 회식 중.
   부장이 딴짓할 때 화면을 꾹 눌러서 술을 버린다!
   부장이 나를 보고 있을 때 버리면 걸림 → 감점
   오래 누를수록 많이 버림
   술잔은 항상 가득 차 있는 것으로 간주 (표시 안 함)

   ★ 이미지 교체 가이드 ★
   preload()에서 아래 키로 등록하면 플레이스홀더 대신 사용됨:
   - 'boss-front'   : 부장 정면 (120×120)
   - 'boss-left'    : 부장 왼쪽 보기
   - 'boss-right'   : 부장 오른쪽 보기
   - 'boss-drink'   : 부장 술 마시는 중
   - 'boss-order'   : 부장 주문 중
   - 'boss-angry'   : 부장 화남
   - 'player-sit'   : 플레이어 앉아있기 (80×80)
   - 'player-dump'  : 플레이어 술 버리기
   ══════════════════════════════════════ */

type BossState = 'front' | 'left' | 'right' | 'drink' | 'order';

interface BossPhase {
  state: BossState;
  duration: number;
}

const DANGEROUS_STATES: BossState[] = ['front'];

// 부장 상태 → 텍스처 키 매핑
const BOSS_TEX_MAP: Record<BossState | 'angry', string> = {
  front: 'boss-front',
  left: 'boss-left',
  right: 'boss-right',
  drink: 'boss-drink',
  order: 'boss-order',
  angry: 'boss-angry',
};

// 부장 상태 → 폴백 이모지
const BOSS_EMOJI_MAP: Record<BossState | 'angry', string> = {
  front: '😐',
  left: '😏',
  right: '🤔',
  drink: '🍺',
  order: '🗣️',
  angry: '😡',
};

export class LeaveWorkScene extends Phaser.Scene {
  private stageId!: number;
  private timeLeft = 60;
  private timerEvent?: Phaser.Time.TimerEvent;
  private timerText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private score = 0;
  private gameOver = false;
  private debugMode = false;

  // Score
  private totalDumped = 0;

  // Boss
  private bossState: BossState = 'front';
  private bossImage!: Phaser.GameObjects.Image;
  private bossEmojiText!: Phaser.GameObjects.Text; // fallback
  private bossLabel!: Phaser.GameObjects.Text;
  // Player
  private playerImage!: Phaser.GameObjects.Image;
  private playerEmojiText!: Phaser.GameObjects.Text;

  // Dumping
  private isDumping = false;
  private dumpBtn!: Phaser.GameObjects.Rectangle;
  private dumpBtnLabel!: Phaser.GameObjects.Text;

  // Status
  private statusIcon!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'LeaveWorkScene' });
  }

  init(data: { stageId: number; debug?: boolean }) {
    this.stageId = data.stageId;
    this.debugMode = data.debug ?? false;
    this.timeLeft = 60;
    this.score = 0;
    this.gameOver = false;
    this.totalDumped = 0;
    this.isDumping = false;
    this.bossState = 'front';
  }

  create() {
    const { width, height } = this.scale;
    const stage = GameManager.getCurrentStage();
    this.cameras.main.setBackgroundColor(stage.bgColor);

    this.generateFallbackTextures();
    // texture existence checked at runtime via this.textures.exists()

    // ── Background: 회식 테이블 ──
    const tableBg = this.add.graphics();
    tableBg.fillStyle(0x8b4513, 0.6);
    tableBg.fillRoundedRect(20, height * 0.42, width - 40, height * 0.22, 12);

    // 테이블 위 음식/안주 장식
    this.add.text(width * 0.25, height * 0.48, '🍖', { fontSize: '28px' }).setOrigin(0.5);
    this.add.text(width * 0.5, height * 0.48, '🍺🍺', { fontSize: '24px' }).setOrigin(0.5);
    this.add.text(width * 0.75, height * 0.48, '🥘', { fontSize: '28px' }).setOrigin(0.5);

    // ── HUD ──
    this.scoreText = this.add.text(20, 20, '버린 술: 0', {
      fontFamily: 'sans-serif', fontSize: '24px', color: '#ffd700', fontStyle: 'bold',
    }).setDepth(200);

    this.timerText = this.add.text(width - 20, 20, '60', {
      fontFamily: 'sans-serif', fontSize: '28px', color: '#e94560', fontStyle: 'bold',
    }).setOrigin(1, 0).setDepth(200);

    this.timerEvent = this.time.addEvent({
      delay: 1000, repeat: 59,
      callback: () => {
        this.timeLeft--;
        this.timerText.setText(`${this.timeLeft}`);
        if (this.timeLeft <= 10) this.timerText.setColor('#ff0000');
        if (this.timeLeft <= 0) this.endGame();
      },
    });

    // ── Boss (상단, 테이블 건너편) ──
    this.createBoss(width, height);

    // ── Status indicator ──
    this.statusIcon = this.add.text(width / 2, height * 0.37, '🚨 쳐다보는 중!', {
      fontFamily: 'sans-serif', fontSize: '16px', color: '#ff6b6b', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(200);

    // ── Player (하단, 테이블 이쪽) ──
    this.createPlayer(width, height);

    // ── Dump button ──
    this.createDumpButton(width, height);

    // ── Boss AI ──
    this.scheduleBossPhase();

    this.emitState();
  }

  update(_time: number, delta: number) {
    if (this.gameOver) return;

    if (this.isDumping) {
      const isSafe = !DANGEROUS_STATES.includes(this.bossState);
      if (isSafe) {
        const dumpAmount = (delta / 1000) * 40;
        this.totalDumped += dumpAmount;
        this.score = Math.floor(this.totalDumped);
        this.scoreText.setText(`버린 술: ${this.score}`);
      }
    }
  }

  /* ══════════════════════════════════════
     Fallback textures
     ══════════════════════════════════════ */

  private generateFallbackTextures() {
    // Boss placeholders
    const bossStates: (BossState | 'angry')[] = ['front', 'left', 'right', 'drink', 'order', 'angry'];
    const bossColors: Record<string, number> = {
      front: 0x888888, left: 0x6688aa, right: 0x6688aa,
      drink: 0x88aa66, order: 0xaa8866, angry: 0xcc4444,
    };

    for (const state of bossStates) {
      const key = BOSS_TEX_MAP[state];
      if (!this.textures.exists(key)) {
        const g = this.add.graphics().setVisible(false);
        g.fillStyle(bossColors[state], 1);
        g.fillRoundedRect(0, 0, 100, 100, 16);
        // 얼굴 자리
        g.fillStyle(0xffeaa7);
        g.fillCircle(50, 40, 25);
        g.generateTexture(key, 100, 100);
        g.destroy();
      }
    }

    // Player placeholders
    if (!this.textures.exists('player-sit')) {
      const g = this.add.graphics().setVisible(false);
      g.fillStyle(0x3182f6);
      g.fillRoundedRect(0, 10, 60, 50, 8);
      g.fillStyle(0xffeaa7);
      g.fillCircle(30, 12, 16);
      g.generateTexture('player-sit', 60, 62);
      g.destroy();
    }
    if (!this.textures.exists('player-dump')) {
      const g = this.add.graphics().setVisible(false);
      g.fillStyle(0x2570de);
      g.fillRoundedRect(0, 10, 60, 50, 8);
      g.fillStyle(0xffeaa7);
      g.fillCircle(30, 12, 16);
      // 팔 뻗은 느낌
      g.fillStyle(0x2570de);
      g.fillRect(50, 20, 20, 8);
      g.generateTexture('player-dump', 72, 62);
      g.destroy();
    }
  }

  /* ══════════════════════════════════════
     Boss
     ══════════════════════════════════════ */

  private createBoss(width: number, height: number) {
    const bossX = width / 2;
    const bossY = height * 0.2;

    this.bossImage = this.add.image(bossX, bossY, 'boss-front')
      .setOrigin(0.5).setDepth(50);

    // 폴백 이모지 (텍스처 위에 겹침)
    this.bossEmojiText = this.add.text(bossX, bossY - 5, '😐', {
      fontSize: '48px',
    }).setOrigin(0.5).setDepth(51);

    this.bossLabel = this.add.text(bossX, bossY + 60, '부장님', {
      fontFamily: 'sans-serif', fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(51);
  }

  private setBossVisual(state: BossState | 'angry') {
    const texKey = BOSS_TEX_MAP[state];
    this.bossImage.setTexture(texKey);
    this.bossEmojiText.setText(BOSS_EMOJI_MAP[state]);
  }

  private setBossState(state: BossState) {
    this.bossState = state;
    this.setBossVisual(state);

    const labelMap: Record<BossState, string> = {
      front: '쳐다보는 중...',
      left: '옆 사람과 대화 중',
      right: '다른 곳 보는 중',
      drink: '술 마시는 중',
      order: '주문 중...',
    };
    this.bossLabel.setText(labelMap[state]);

    const isDangerous = DANGEROUS_STATES.includes(state);
    this.statusIcon.setText(isDangerous ? '🚨 쳐다보는 중!' : '✅ 지금이야! 버려!');
    this.statusIcon.setColor(isDangerous ? '#ff6b6b' : '#55efc4');

    // 부장이 돌아봤는데 버리고 있으면 걸림
    if (isDangerous && this.isDumping) {
      this.onCaught();
    }
  }

  private scheduleBossPhase() {
    if (this.gameOver) return;

    const phases = this.generateBossPattern();
    let delay = 0;

    for (const phase of phases) {
      this.time.delayedCall(delay, () => {
        if (this.gameOver) return;
        this.setBossState(phase.state);
      });
      delay += phase.duration;
    }

    this.time.delayedCall(delay, () => {
      if (!this.gameOver) this.scheduleBossPhase();
    });
  }

  private generateBossPattern(): BossPhase[] {
    const phases: BossPhase[] = [];
    const elapsed = 60 - this.timeLeft;
    const diff = Math.min(elapsed / 60, 1);

    const safeDur = () => Phaser.Math.Between(
      Math.max(800, 2000 - diff * 800),
      Math.max(1500, 3500 - diff * 1500),
    );
    const dangerDur = () => Phaser.Math.Between(
      1000 + Math.floor(diff * 500),
      2000 + Math.floor(diff * 1000),
    );

    const safeCount = Phaser.Math.Between(1, 3);
    const safeStates: BossState[] = ['left', 'right', 'drink', 'order'];

    for (let i = 0; i < safeCount; i++) {
      const s = safeStates[Phaser.Math.Between(0, safeStates.length - 1)];
      phases.push({ state: s, duration: safeDur() });
    }

    phases.push({ state: 'front', duration: dangerDur() });
    return phases;
  }

  /* ══════════════════════════════════════
     Player
     ══════════════════════════════════════ */

  private createPlayer(width: number, height: number) {
    const px = width / 2;
    const py = height * 0.68;

    this.playerImage = this.add.image(px, py, 'player-sit')
      .setOrigin(0.5).setDepth(50);

    this.playerEmojiText = this.add.text(px, py - 5, '😊', {
      fontSize: '32px',
    }).setOrigin(0.5).setDepth(51);
  }

  private setPlayerDumping(dumping: boolean) {
    if (dumping) {
      this.playerImage.setTexture('player-dump');
      this.playerEmojiText.setText('🫗');
    } else {
      this.playerImage.setTexture('player-sit');
      this.playerEmojiText.setText('😊');
    }
  }

  /* ══════════════════════════════════════
     Dump button
     ══════════════════════════════════════ */

  private createDumpButton(width: number, height: number) {
    const btnY = height - 80;
    const btnW = width * 0.7;
    const btnH = 80;

    this.dumpBtn = this.add.rectangle(width / 2, btnY, btnW, btnH, 0xe74c3c, 0.9)
      .setInteractive({ useHandCursor: true }).setDepth(200);

    this.dumpBtnLabel = this.add.text(width / 2, btnY, '🍺 꾹 눌러서 술 버리기!', {
      fontFamily: 'sans-serif', fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(201);

    this.dumpBtn.on('pointerdown', () => {
      if (this.gameOver) return;

      if (DANGEROUS_STATES.includes(this.bossState)) {
        this.onCaught();
        return;
      }

      this.isDumping = true;
      this.dumpBtn.setFillStyle(0xc0392b);
      this.dumpBtnLabel.setText('🫗 버리는 중...');
      this.setPlayerDumping(true);
    });

    this.input.on('pointerup', () => {
      if (this.isDumping) {
        this.isDumping = false;
        this.dumpBtn.setFillStyle(0xe74c3c);
        this.dumpBtnLabel.setText('🍺 꾹 눌러서 술 버리기!');
        this.setPlayerDumping(false);
      }
    });
  }

  /* ══════════════════════════════════════
     Caught
     ══════════════════════════════════════ */

  private onCaught() {
    this.isDumping = false;
    this.dumpBtn.setFillStyle(0xe74c3c);
    this.dumpBtnLabel.setText('🍺 꾹 눌러서 술 버리기!');
    this.setPlayerDumping(false);

    const penalty = 30;
    this.totalDumped = Math.max(0, this.totalDumped - penalty);
    this.score = Math.floor(this.totalDumped);
    this.scoreText.setText(`버린 술: ${this.score}`);

    this.cameras.main.shake(200, 0.015);
    this.showPopup('들켰다!! -30', '#ff6b6b');

    this.setBossVisual('angry');
    this.bossLabel.setText('뭐하는 거야!!');
    this.time.delayedCall(800, () => {
      if (!this.gameOver) this.setBossState('front');
    });
  }

  /* ══════════════════════════════════════
     Popup
     ══════════════════════════════════════ */

  private showPopup(message: string, color: string) {
    const { width, height } = this.scale;
    const popup = this.add.text(width / 2, height * 0.42, message, {
      fontFamily: 'sans-serif', fontSize: '24px', color, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(300);

    this.tweens.add({
      targets: popup, y: popup.y - 50, alpha: 0, scale: 1.3,
      duration: 700, onComplete: () => popup.destroy(),
    });
  }

  /* ══════════════════════════════════════
     Game end
     ══════════════════════════════════════ */

  private endGame() {
    this.gameOver = true;
    this.isDumping = false;
    this.timerEvent?.remove();

    this.time.delayedCall(500, () => {
      if (this.debugMode) {
        this.scene.start('BootScene');
      } else {
        this.scene.start('ResultScene', {
          stageId: this.stageId,
          score: this.score,
          completed: true,
          timeRemaining: this.timeLeft,
        });
      }
    });
  }

  private emitState() {
    const stage = GameManager.getCurrentStage();
    emitGameState({
      scene: 'LeaveWorkScene', stageId: this.stageId,
      progress: GameManager.progress, allCleared: false, stress: 0,
      time: stage.time, period: stage.period,
    });
  }
}
