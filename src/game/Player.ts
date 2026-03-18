import Phaser from 'phaser';
import { RABBIT_SIZE_RATIO } from './constants';

export class Player {
  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Image;
  private rabbitSize: number;
  currentLane = 0;

  constructor(scene: Phaser.Scene, laneW: number, startX: number, startY: number, startLane: number) {
    this.scene = scene;
    this.currentLane = startLane;

    this.rabbitSize = laneW * RABBIT_SIZE_RATIO;
    this.sprite = scene.add.image(startX, startY, 'rabbit-front')
      .setDisplaySize(this.rabbitSize, this.rabbitSize)
      .setOrigin(0.5, 0.5)
      .setDepth(150);
  }

  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }

  setHurt(hurt: boolean) {
    this.sprite.setTint(hurt ? 0xff4444 : 0xffffff);
  }

  /** 부활 시 스프라이트 상태 복구 */
  resetSprite() {
    this.sprite.setAlpha(1);
    this.sprite.setScale(1);
    this.sprite.setAngle(0);
    this.sprite.setTexture('rabbit-front');
    this.sprite.setDisplaySize(this.rabbitSize, this.rabbitSize);
  }

  switchTo(lane: number) {
    this.currentLane = lane;
  }

  /** 전환 성공: 타겟 화면 X로 이동 */
  animateSwitch(targetScreenX: number) {
    const goingRight = targetScreenX > this.sprite.x;
    this.sprite.setTexture('rabbit-side');
    this.sprite.setDisplaySize(this.rabbitSize, this.rabbitSize);
    this.sprite.setFlipX(!goingRight);
    this.sprite.setAngle(0);
    this.scene.tweens.add({
      targets: this.sprite,
      x: targetScreenX,
      duration: 120, ease: 'Quad.easeOut',
    });
  }

  /** 전환 실패: 잘못된 레인으로 이동 → 떨어짐 */
  animateCrashSwitch(bumpX: number, onDone: () => void) {
    const goingRight = bumpX > this.sprite.x;
    this.sprite.setTexture('rabbit-side');
    this.sprite.setDisplaySize(this.rabbitSize, this.rabbitSize);
    this.sprite.setFlipX(!goingRight);
    this.sprite.setAngle(0);

    // 1단계: 잘못된 레인으로 이동
    this.scene.tweens.add({
      targets: this.sprite,
      x: bumpX,
      duration: 120, ease: 'Quad.easeOut',
      onComplete: () => {
        // 2단계: 떨어짐
        this.animateFall(onDone);
      },
    });
  }

  /** 전진 성공: 뒷면 → scrollTo */
  animateForward(onDone: () => void) {
    this.sprite.setTexture('rabbit-back');
    this.sprite.setDisplaySize(this.rabbitSize, this.rabbitSize);
    this.sprite.setFlipX(false);
    this.sprite.setAngle(0);
    onDone();
  }

  /** 전진 충돌: 한 칸 전진 → 떨어짐 */
  animateForwardCrash(onDone: () => void) {
    this.sprite.setTexture('rabbit-back');
    this.sprite.setDisplaySize(this.rabbitSize, this.rabbitSize);
    this.sprite.setAngle(0);

    // 1단계: 한 칸 위로 이동 (전진 시도)
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.sprite.y - this.rabbitSize,
      duration: 120, ease: 'Quad.easeOut',
      onComplete: () => {
        // 2단계: 떨어짐
        this.animateFall(onDone);
      },
    });
  }

  /** 공통 낙하: 정면 전환 → 잠깐 멈춤 → 제자리에서 축소 (탑다운 깊이감 낙하) */
  private animateFall(onDone: () => void) {
    this.sprite.setTexture('rabbit-front');
    this.sprite.setDisplaySize(this.rabbitSize, this.rabbitSize);
    this.sprite.setFlipX(false);

    // 잠깐 멈춤 (발 밑이 없다는 걸 깨달은 순간)
    this.scene.time.delayedCall(200, () => {
      // 제자리에서 축소 + 살짝 아래로 (깊이감) + 페이드아웃
      this.scene.tweens.add({
        targets: this.sprite,
        scaleX: 0,
        scaleY: 0,
        y: this.sprite.y + 30,
        alpha: 0.3,
        duration: 400,
        ease: 'Cubic.easeIn',
        onComplete: onDone,
      });
    });
  }

  /** 스크롤 후 위치 맞추기 */
  scrollTo(screenX: number, screenY: number) {
    this.scene.tweens.add({
      targets: this.sprite,
      x: screenX,
      y: screenY,
      duration: 100, ease: 'Quad.easeOut',
    });
  }
}
