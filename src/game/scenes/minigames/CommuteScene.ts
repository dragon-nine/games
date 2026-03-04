import Phaser from 'phaser';
import { GameManager } from '../../GameManager';
import { emitGameState } from '../../GameBridge';

/* ══════════════════════════════════════
   STAGE 1: 무한의 계단 (Infinite Stairs)

   조작: 왼쪽 버튼 = 방향전환, 오른쪽 버튼 = 올라가기
   계단 방향과 캐릭터 방향이 맞으면 올라감, 틀리면 추락

   ★ 이미지 교체 가이드 ★
   - 'stair'        : 계단 한 칸 (60×32)
   - 'player-idle'  : 캐릭터 서있기 (30×44)
   - 'player-step'  : 캐릭터 걷기
   - 'player-fall'  : 캐릭터 추락
   preload()에서 등록하면 플레이스홀더 대신 사용됨
   ══════════════════════════════════════ */

interface Stair {
  x: number;
  y: number;
  dir: 'left' | 'right'; // 이 계단에서 다음 계단이 있는 방향
  visual: Phaser.GameObjects.Image;
}

const STAIR_W = 60;
const STAIR_H = 20;
const STAIR_FRONT = 12;
const STEP_DX = 48;
const STEP_DY = 32;

const MIN_RUN = 2;
const MAX_RUN = 5;
const FALL_PENALTY_SEC = 3;

export class CommuteScene extends Phaser.Scene {
  private stageId!: number;
  private timeLeft = 60;
  private timerEvent?: Phaser.Time.TimerEvent;
  private timerText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private score = 0;
  private gameOver = false;
  private debugMode = false;

  // Stairs
  private stairs: Stair[] = [];
  private currentStairIdx = 0;
  private stairContainer!: Phaser.GameObjects.Container;

  // Direction
  private currentDir: 'left' | 'right' = 'right';
  private runRemaining = 0;
  private facingDir: 'left' | 'right' = 'right'; // 캐릭터가 바라보는 방향

  // Player
  private player!: Phaser.GameObjects.Container;
  private playerSprite!: Phaser.GameObjects.Image;
  private playerTargetX = 0;
  private playerTargetY = 0;

  // Direction indicator
  private dirArrow!: Phaser.GameObjects.Text;

  // State
  private isFalling = false;
  private comboCount = 0;
  private bestCombo = 0;

  constructor() {
    super({ key: 'CommuteScene' });
  }

  init(data: { stageId: number; debug?: boolean }) {
    this.stageId = data.stageId;
    this.debugMode = data.debug ?? false;
    this.timeLeft = 60;
    this.score = 0;
    this.gameOver = false;
    this.stairs = [];
    this.currentStairIdx = 0;
    this.isFalling = false;
    this.comboCount = 0;
    this.bestCombo = 0;
    this.currentDir = 'right';
    this.facingDir = 'right';
    this.runRemaining = 0;
  }

  create() {
    const { width, height } = this.scale;
    const stage = GameManager.getCurrentStage();
    this.cameras.main.setBackgroundColor(stage.bgColor);

    this.generateFallbackTextures();

    // ── Stair container ──
    this.stairContainer = this.add.container(0, 0);
    this.generateInitialStairs(width, height);

    // ── Player ──
    this.createPlayer();

    // ── HUD ──
    this.scoreText = this.add.text(20, 20, '0 계단', {
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

    // ── Direction indicator (big arrow above player) ──
    this.dirArrow = this.add.text(0, 0, '▶', {
      fontSize: '36px', color: '#ffd700',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(160);
    this.updateDirArrow();

    // ── Two buttons at bottom ──
    this.createButtons(width, height);

    this.emitState();
  }

  /* ══════════════════════════════════════
     Buttons: 왼쪽=방향전환, 오른쪽=올라가기
     ══════════════════════════════════════ */

  private createButtons(width: number, height: number) {
    const btnY = height - 65;
    const btnW = width * 0.42;
    const btnH = 70;
    const gap = width * 0.04;

    // ── 왼쪽: 방향전환 ──
    const leftBtnX = gap + btnW / 2;
    const leftBg = this.add.rectangle(leftBtnX, btnY, btnW, btnH, 0x555555, 0.85)
      .setInteractive({ useHandCursor: true }).setDepth(200);

    const leftLabel = this.add.text(leftBtnX, btnY - 8, '🔄', { fontSize: '28px' })
      .setOrigin(0.5).setDepth(201);
    this.add.text(leftBtnX, btnY + 20, '방향전환', {
      fontFamily: 'sans-serif', fontSize: '14px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(201);

    leftBg.on('pointerdown', () => {
      if (this.gameOver || this.isFalling) return;
      this.facingDir = this.facingDir === 'left' ? 'right' : 'left';
      this.playerSprite.setFlipX(this.facingDir === 'left');
      this.updateDirArrow();

      // 버튼에도 현재 방향 표시
      leftLabel.setText(this.facingDir === 'right' ? '➡' : '⬅');

      this.tweens.add({
        targets: leftBg, scaleX: 0.95, scaleY: 0.95,
        duration: 50, yoyo: true,
      });
    });

    // ── 오른쪽: 올라가기 ──
    const rightBtnX = width - gap - btnW / 2;
    const rightBg = this.add.rectangle(rightBtnX, btnY, btnW, btnH, 0x3182f6, 0.9)
      .setInteractive({ useHandCursor: true }).setDepth(200);
    this.add.text(rightBtnX, btnY - 8, '⬆', { fontSize: '28px' })
      .setOrigin(0.5).setDepth(201);
    this.add.text(rightBtnX, btnY + 20, '올라가기', {
      fontFamily: 'sans-serif', fontSize: '14px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(201);

    rightBg.on('pointerdown', () => {
      if (this.gameOver || this.isFalling) return;
      this.tryStep();

      this.tweens.add({
        targets: rightBg, scaleX: 0.95, scaleY: 0.95,
        duration: 50, yoyo: true,
      });
    });
  }

  private updateDirArrow() {
    const arrow = this.facingDir === 'right' ? '➡' : '⬅';
    this.dirArrow.setText(arrow);
    this.dirArrow.setPosition(this.player.x, this.player.y - 50);

    // 방향 전환 시 펄스 애니메이션
    this.tweens.add({
      targets: this.dirArrow,
      scale: 1.5, duration: 100,
      yoyo: true, ease: 'Quad.easeOut',
    });
  }

  /* ══════════════════════════════════════
     Fallback textures
     ══════════════════════════════════════ */

  private generateFallbackTextures() {
    if (!this.textures.exists('stair')) {
      const g = this.add.graphics().setVisible(false);
      // Top face (lighter)
      g.fillStyle(0x8899bb);
      g.fillRect(0, 0, STAIR_W, STAIR_H);
      // Front face (darker)
      g.fillStyle(0x5a6a8a);
      g.fillRect(0, STAIR_H, STAIR_W, STAIR_FRONT);
      // Highlight top edge
      g.lineStyle(1, 0xaabbdd, 0.6);
      g.lineBetween(0, 0, STAIR_W, 0);
      g.generateTexture('stair', STAIR_W, STAIR_H + STAIR_FRONT);
      g.destroy();
    }

    if (!this.textures.exists('player-idle')) {
      const g = this.add.graphics().setVisible(false);
      g.fillStyle(0x3182f6);
      g.fillRect(5, 14, 20, 28);
      g.fillStyle(0xffeaa7);
      g.fillCircle(15, 10, 10);
      g.generateTexture('player-idle', 30, 44);
      g.destroy();
    }
    if (!this.textures.exists('player-step')) {
      const g = this.add.graphics().setVisible(false);
      g.fillStyle(0x3182f6);
      g.fillRect(5, 14, 20, 28);
      g.fillStyle(0x2570de);
      g.fillRect(8, 36, 8, 6);
      g.fillStyle(0xffeaa7);
      g.fillCircle(15, 10, 10);
      g.generateTexture('player-step', 30, 44);
      g.destroy();
    }
    if (!this.textures.exists('player-fall')) {
      const g = this.add.graphics().setVisible(false);
      g.fillStyle(0xe74c3c);
      g.fillRect(5, 14, 20, 28);
      g.fillStyle(0xffeaa7);
      g.fillCircle(15, 10, 10);
      g.generateTexture('player-fall', 30, 44);
      g.destroy();
    }
  }

  /* ══════════════════════════════════════
     Stair generation
     ══════════════════════════════════════ */

  private generateInitialStairs(width: number, height: number) {
    const startX = width / 2;
    const startY = height - 220;

    this.addStair(startX, startY);
    for (let i = 0; i < 20; i++) {
      this.addNextStair();
    }

    this.playerTargetX = startX;
    this.playerTargetY = startY;
  }

  private addStair(x: number, y: number) {
    const img = this.add.image(x, y, 'stair').setOrigin(0.5, 0).setDepth(10);
    this.stairContainer.add(img);

    const dir = this.getNextDirection();
    this.stairs.push({ x, y, dir, visual: img });
  }

  private addNextStair() {
    const last = this.stairs[this.stairs.length - 1];
    const dx = last.dir === 'left' ? -STEP_DX : STEP_DX;
    this.addStair(last.x + dx, last.y - STEP_DY);
  }

  private getNextDirection(): 'left' | 'right' {
    if (this.runRemaining <= 0) {
      this.currentDir = this.currentDir === 'left' ? 'right' : 'left';
      this.runRemaining = Phaser.Math.Between(MIN_RUN, MAX_RUN);
    }
    this.runRemaining--;
    return this.currentDir;
  }

  /* ══════════════════════════════════════
     Player
     ══════════════════════════════════════ */

  private createPlayer() {
    this.playerSprite = this.add.image(0, -2, 'player-idle').setOrigin(0.5, 1);
    this.player = this.add.container(this.playerTargetX, this.playerTargetY, [this.playerSprite]);
    this.player.setDepth(150);
  }

  private setPlayerTexture(key: string) {
    this.playerSprite.setTexture(key);
  }

  /* ══════════════════════════════════════
     Step logic
     ══════════════════════════════════════ */

  private tryStep() {
    const current = this.stairs[this.currentStairIdx];
    if (!current) return;

    // 캐릭터가 바라보는 방향 === 다음 계단 방향?
    if (this.facingDir === current.dir) {
      // 성공!
      this.currentStairIdx++;
      this.score++;
      this.comboCount++;
      if (this.comboCount > this.bestCombo) this.bestCombo = this.comboCount;
      this.scoreText.setText(`${this.score} 계단`);

      // Step animation
      this.setPlayerTexture('player-step');
      this.time.delayedCall(100, () => {
        if (!this.isFalling) this.setPlayerTexture('player-idle');
      });

      // Ensure stairs ahead
      while (this.stairs.length - this.currentStairIdx < 15) {
        this.addNextStair();
      }

      const nextStair = this.stairs[this.currentStairIdx];
      this.playerTargetX = nextStair.x;
      this.playerTargetY = nextStair.y;
      this.scrollToPlayer();

      if (this.comboCount > 0 && this.comboCount % 10 === 0) {
        this.showPopup(`${this.comboCount} 콤보!`, '#ffd700');
      }

      this.cleanupOldStairs();
    } else {
      this.onFall();
    }
  }

  private scrollToPlayer() {
    const { width, height } = this.scale;
    const screenX = width / 2;
    const screenY = height * 0.45;

    // 컨테이너를 이동해서 현재 계단이 화면 중앙에 오도록
    const targetContainerX = -(this.playerTargetX - screenX);
    const targetContainerY = -(this.playerTargetY - screenY);

    this.tweens.add({
      targets: this.stairContainer,
      x: targetContainerX,
      y: targetContainerY,
      duration: 120, ease: 'Quad.easeOut',
    });

    // 플레이어는 항상 화면 중앙에 고정
    this.tweens.add({
      targets: this.player,
      x: screenX,
      y: screenY,
      duration: 120, ease: 'Quad.easeOut',
      onComplete: () => this.updateDirArrow(),
    });
  }

  private cleanupOldStairs() {
    while (this.currentStairIdx > 10) {
      const old = this.stairs.shift()!;
      old.visual.destroy();
      this.currentStairIdx--;
    }
  }

  /* ══════════════════════════════════════
     Fall
     ══════════════════════════════════════ */

  private onFall() {
    this.isFalling = true;
    this.comboCount = 0;
    this.setPlayerTexture('player-fall');
    this.cameras.main.shake(200, 0.01);

    this.tweens.add({
      targets: this.player,
      y: this.player.y + 80, alpha: 0.3,
      duration: 300, ease: 'Quad.easeIn',
      onComplete: () => {
        this.timeLeft = Math.max(0, this.timeLeft - FALL_PENALTY_SEC);
        this.timerText.setText(`${this.timeLeft}`);
        this.showPopup(`추락! -${FALL_PENALTY_SEC}초`, '#ff6b6b');

        if (this.timeLeft <= 0) { this.endGame(); return; }

        this.time.delayedCall(300, () => {
          this.setPlayerTexture('player-idle');
          this.player.setAlpha(1);

          // 현재 계단 위치로 타겟 갱신 후 스크롤
          const stair = this.stairs[this.currentStairIdx];
          this.playerTargetX = stair.x;
          this.playerTargetY = stair.y;
          this.scrollToPlayer();

          const { width, height } = this.scale;
          this.player.x = width / 2;
          this.player.y = height * 0.45;
          this.updateDirArrow();
          this.isFalling = false;
        });
      },
    });
  }

  /* ══════════════════════════════════════
     Popup
     ══════════════════════════════════════ */

  private showPopup(message: string, color: string) {
    const { width } = this.scale;
    const popup = this.add.text(width / 2, 80, message, {
      fontFamily: 'sans-serif', fontSize: '22px', color, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(300);

    this.tweens.add({
      targets: popup, y: 50, alpha: 0, scale: 1.3,
      duration: 700, onComplete: () => popup.destroy(),
    });
  }

  /* ══════════════════════════════════════
     Game end
     ══════════════════════════════════════ */

  private endGame() {
    this.gameOver = true;
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
      scene: 'CommuteScene',
      stageId: this.stageId,
      progress: GameManager.progress,
      allCleared: false,
      stress: 0,
      time: stage.time,
      period: stage.period,
    });
  }
}
