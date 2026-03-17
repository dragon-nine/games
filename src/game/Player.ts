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

  /** 전환 실패: 부딪힘 → onDone */
  animateCrashSwitch(bumpX: number, onDone: () => void) {
    const goingRight = bumpX > this.sprite.x;
    this.sprite.setTexture('rabbit-side');
    this.sprite.setDisplaySize(this.rabbitSize, this.rabbitSize);
    this.sprite.setFlipX(!goingRight);
    this.sprite.setAngle(0);
    this.scene.tweens.add({
      targets: this.sprite, x: bumpX,
      duration: 80, ease: 'Quad.easeOut',
      onComplete: onDone,
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

  /** 전진 충돌: 위로 튕김 → onDone */
  animateForwardCrash(onDone: () => void) {
    this.sprite.setTexture('rabbit-back');
    this.sprite.setDisplaySize(this.rabbitSize, this.rabbitSize);
    const originY = this.sprite.y;
    this.scene.tweens.add({
      targets: this.sprite,
      y: originY - 25,
      duration: 100, ease: 'Quad.easeOut',
      yoyo: true,
      onComplete: onDone,
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
