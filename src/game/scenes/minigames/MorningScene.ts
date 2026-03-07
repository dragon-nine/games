import Phaser from 'phaser';
import { GameManager } from '../../GameManager';
import { emitGameState } from '../../GameBridge';

/* ══════════════════════════════════════
   보고서 데이터: 원문 + 오탈자 버전
   ══════════════════════════════════════ */

interface TypoWord {
  correct: string;
  typo: string;
}

const REPORT_SETS: { lines: { text: string; typos: TypoWord[] }[] }[] = [
  {
    lines: [
      { text: '제목 2분기 마케팅 전략 보고서', typos: [{ correct: '마케팅', typo: '마게팅' }] },
      { text: '작성자 기획팀 김대리 작성일 2026년 3월', typos: [{ correct: '기획팀', typo: '기흭팀' }] },
      { text: '금번 분기 마케팅 성과를 보고드립니다', typos: [{ correct: '보고드립니다', typo: '보고드림니다' }] },
      { text: '지난 분기 대비 매출이 크게 증가했으며', typos: [{ correct: '매출이', typo: '매춸이' }] },
      { text: '고객 만족도 조사 결과도 양호합니다', typos: [{ correct: '만족도', typo: '만죡도' }] },
      { text: '온라인 광고 예산은 전월 대비 소폭 증가', typos: [{ correct: '예산은', typo: '예싼은' }] },
      { text: '소셜미디어 채널 운영 현황을 첨부합니다', typos: [{ correct: '첨부합니다', typo: '첨부힙니다' }] },
      { text: '마케팅 전략 수정이 일부 필요합니다', typos: [{ correct: '전략', typo: '전럭' }] },
      { text: '경쟁사 동향 분석도 함께 검토 바랍니다', typos: [{ correct: '검토', typo: '검트' }] },
      { text: '이상 검토 후 승인 부탁드립니다 끝', typos: [{ correct: '승인', typo: '싱인' }] },
    ],
  },
  {
    lines: [
      { text: '제목 신규 프로젝트 기획안 제출건', typos: [{ correct: '프로젝트', typo: '프로젝느' }] },
      { text: '작성자 개발팀 박과장 작성일 2026년 3월', typos: [{ correct: '개발팀', typo: '개발틤' }] },
      { text: '신규 서비스 기획안을 제출합니다', typos: [{ correct: '제출합니다', typo: '게출합니다' }] },
      { text: '예산 편성은 재무팀과 사전 협의 완료', typos: [{ correct: '편성은', typo: '편썽은' }] },
      { text: '일정은 다음 주 월요일부터 착수 예정', typos: [{ correct: '월요일부터', typo: '월료일부터' }] },
      { text: '투입 인력은 총 다섯 명으로 구성됩니다', typos: [{ correct: '구성됩니다', typo: '구썽됩니다' }] },
      { text: '담당자 배정표를 별도로 확인해 주세요', typos: [{ correct: '배정표를', typo: '배졍표를' }] },
      { text: '관련 자료는 공유 폴더에 업로드했습니다', typos: [{ correct: '공유', typo: '공류' }] },
      { text: '일정 지연 시 즉시 보고 예정이오니', typos: [{ correct: '보고', typo: '보거' }] },
      { text: '검토 및 결재 부탁드립니다 감사합니다', typos: [{ correct: '결재', typo: '결제' }] },
    ],
  },
  {
    lines: [
      { text: '제목 영업부 3월 실적 보고서', typos: [{ correct: '실적', typo: '실젹' }] },
      { text: '작성자 영업팀 이차장 작성일 2026년 3월', typos: [{ correct: '영업팀', typo: '영엄팀' }] },
      { text: '금월 영업 실적을 아래와 같이 보고합니다', typos: [{ correct: '보고합니다', typo: '보고합늬다' }] },
      { text: '이번 달 목표 달성률은 102퍼센트입니다', typos: [{ correct: '달성률은', typo: '달썽률은' }] },
      { text: '주요 거래처 계약 갱신도 순조롭습니다', typos: [{ correct: '거래처', typo: '거래쳐' }] },
      { text: '신규 고객 유치 건수는 전월 대비 상승', typos: [{ correct: '유치', typo: '류치' }] },
      { text: '다음 분기 전망은 전반적으로 긍정적', typos: [{ correct: '전망은', typo: '전망으' }] },
      { text: '다만 원자재 가격 상승이 변수입니다', typos: [{ correct: '변수입니다', typo: '변수임니다' }] },
      { text: '세부 내역은 별첨 자료를 참고 바랍니다', typos: [{ correct: '별첨', typo: '별침' }] },
      { text: '이상입니다 검토 부탁드립니다 끝', typos: [{ correct: '부탁드립니다', typo: '부탁드림니다' }] },
    ],
  },
];

/* ══════════════════════════════════════
   텍스트 셀 (보고서 위 한 단어)
   ══════════════════════════════════════ */

interface TextCell {
  text: Phaser.GameObjects.Text;
  isTypo: boolean;
  corrected: boolean;
  typoData?: TypoWord;
  x: number;
  y: number;
  width: number;
  height: number;
}

/* ══════════════════════════════════════
   MorningScene: 퍼즐보블 스타일 지우개 발사
   ══════════════════════════════════════ */

export class MorningScene extends Phaser.Scene {
  private stageId!: number;
  private timeLeft = 60;
  private timerEvent?: Phaser.Time.TimerEvent;
  private timerText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private score = 0;
  private gameOver = false;
  private debugMode = false;

  // Report
  private textCells: TextCell[] = [];
  private totalTypos = 0;
  private correctedTypos = 0;

  // Character (fixed position)
  private character!: Phaser.GameObjects.Container;
  private charCenterX = 0;
  private charCenterY = 0;

  // Aiming
  private aimAngle = -Math.PI / 2; // straight up
  private aimLine!: Phaser.GameObjects.Graphics;
  private aimDot!: Phaser.GameObjects.Arc;
  private isAiming = false;
  private aimStartX = 0;
  private isDragging = false; // true if pointer moved enough → aim mode

  // Power charge
  private chargeStartTime = 0;
  private chargePower = 0;
  private gaugeBar!: Phaser.GameObjects.Graphics;
  private gaugeBg!: Phaser.GameObjects.Graphics;
  private eraserFlying = false;

  // Drag threshold: movement beyond this = aiming, not charging
  private readonly DRAG_THRESHOLD = 12;

  // Angle limits (radians) — roughly 20° to 160° from horizontal
  private readonly MIN_ANGLE = -Math.PI * 0.88; // ~160° (far left)
  private readonly MAX_ANGLE = -Math.PI * 0.12; // ~20° (far right)

  // Trajectory (wall bounce)
  private currentTrajectory: { x: number; y: number }[] = [];
  private currentTrajectoryLength = 0;
  private wallL = 30;
  private wallR = 0;
  private topY = 80;

  constructor() {
    super({ key: 'MorningScene' });
  }

  init(data: { stageId: number; debug?: boolean }) {
    this.stageId = data.stageId;
    this.debugMode = data.debug ?? false;
    this.timeLeft = 60;
    this.score = 0;
    this.gameOver = false;
    this.textCells = [];
    this.totalTypos = 0;
    this.correctedTypos = 0;

    this.isAiming = false;
    this.isDragging = false;
    this.chargePower = 0;
    this.eraserFlying = false;
    this.aimAngle = -Math.PI / 2;
    this.currentTrajectory = [];
    this.currentTrajectoryLength = 0;
  }

  create() {
    const { width, height } = this.scale;
    const stage = GameManager.getCurrentStage();
    this.cameras.main.setBackgroundColor(stage.bgColor);

    this.charCenterX = width / 2;
    this.charCenterY = height - 120;
    this.wallL = 30;
    this.wallR = width - 30;
    this.topY = 80;

    // ── HUD ──
    this.scoreText = this.add.text(20, 20, '점수: 0', {
      fontFamily: 'sans-serif', fontSize: '24px', color: '#ffd700', fontStyle: 'bold',
    }).setDepth(100);

    this.timerText = this.add.text(width - 20, 20, '60', {
      fontFamily: 'sans-serif', fontSize: '28px', color: '#e94560', fontStyle: 'bold',
    }).setOrigin(1, 0).setDepth(100);

    this.timerEvent = this.time.addEvent({
      delay: 1000, repeat: 59,
      callback: () => {
        this.timeLeft--;
        this.timerText.setText(`${this.timeLeft}`);
        if (this.timeLeft <= 10) this.timerText.setColor('#ff0000');
        if (this.timeLeft <= 0) this.endGame();
      },
    });

    // ── Report panel ──
    this.createReport(width);

    // ── Aim line (drawn every frame) ──
    this.aimLine = this.add.graphics().setDepth(80);
    this.aimDot = this.add.circle(this.charCenterX, this.charCenterY - 120, 6, 0xff6b6b)
      .setDepth(81).setAlpha(0.8);

    // ── Character (fixed at bottom center) ──
    this.createCharacter();

    // ── Power gauge ──
    this.createGauge();

    // ── Input: drag to aim + hold to charge ──
    this.setupInput();

    // ── Info text ──
    this.add.text(width / 2, 58, `오탈자 ${this.totalTypos}개를 찾아 수정하세요!`, {
      fontFamily: 'sans-serif', fontSize: '14px', color: '#666666',
    }).setOrigin(0.5).setDepth(100);

    this.add.text(width / 2, height - 35, '드래그: 조준  →  꾹 누르기: 충전+발사', {
      fontFamily: 'sans-serif', fontSize: '11px', color: '#999999',
    }).setOrigin(0.5).setDepth(100);

    this.drawAimLine();
    this.emitState();
  }

  update() {
    if (this.gameOver) return;

    // Show charge gauge only when holding still (not dragging to aim)
    if (this.isAiming && !this.isDragging && !this.eraserFlying) {
      const elapsed = (this.time.now - this.chargeStartTime) / 1000;
      this.chargePower = Math.min(elapsed / 2, 1);
      this.drawGauge();
      this.drawAimLine();
    }
  }

  /* ══════════════════════════════════════
     Input: Puzzle Bobble style aiming
     ══════════════════════════════════════ */

  private setupInput() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.gameOver || this.eraserFlying) return;
      this.isAiming = true;
      this.isDragging = false;
      this.aimStartX = pointer.x;

      // Don't charge yet — wait to see if it's a drag or a hold
  
      this.chargePower = 0;
      this.chargeStartTime = this.time.now;
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.isAiming || this.gameOver) return;

      const dx = pointer.x - this.aimStartX;

      if (!this.isDragging && Math.abs(dx) > this.DRAG_THRESHOLD) {
        // Crossed threshold → this is a drag (aim mode)
        this.isDragging = true;
    
        this.chargePower = 0;
        this.gaugeBar.clear();
      }

      if (this.isDragging) {
        // Adjust angle based on drag
        const sensitivity = Math.PI * 0.76 / 200;
        const newAngle = -Math.PI / 2 + dx * sensitivity;
        this.aimAngle = Phaser.Math.Clamp(newAngle, this.MIN_ANGLE, this.MAX_ANGLE);
        this.drawAimLine();
      }
    });

    this.input.on('pointerup', () => {
      if (!this.isAiming || this.gameOver) return;

      if (this.isDragging) {
        // Was aiming → just set the angle, don't fire
        this.isAiming = false;
        this.isDragging = false;
    
        this.gaugeBar.clear();
        return;
      }

      // Was holding still → fire!
      this.isAiming = false;
  
      this.gaugeBar.clear();

      // Calculate power from hold duration
      const holdTime = (this.time.now - this.chargeStartTime) / 1000;
      const power = Math.min(holdTime / 2, 1);

      if (power < 0.03) return;
      this.launchEraser(this.aimAngle, power);
    });
  }

  /* ══════════════════════════════════════
     Aim line rendering (wall-bounce trajectory)
     ══════════════════════════════════════ */

  private drawAimLine() {
    this.aimLine.clear();

    const trajPoints = this.computeTrajectoryPoints(this.aimAngle);
    const totalLen = this.computePathLength(trajPoints);
    this.currentTrajectory = trajPoints;
    this.currentTrajectoryLength = totalLen;

    // Full trajectory (faint)
    for (let i = 1; i < trajPoints.length; i++) {
      this.drawDottedSegment(
        trajPoints[i - 1].x, trajPoints[i - 1].y,
        trajPoints[i].x, trajPoints[i].y,
        0xff6b6b, 0.15,
      );
    }

    // Charged portion (bright)
    const chargedDist = this.chargePower * totalLen;
    let remaining = chargedDist;
    for (let i = 1; i < trajPoints.length; i++) {
      if (remaining <= 0) break;
      const p0 = trajPoints[i - 1];
      const p1 = trajPoints[i];
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const segLen = Math.sqrt(dx * dx + dy * dy);
      if (remaining >= segLen) {
        this.drawDottedSegment(p0.x, p0.y, p1.x, p1.y, 0xff6b6b, 0.7);
        remaining -= segLen;
      } else {
        const t = remaining / segLen;
        this.drawDottedSegment(p0.x, p0.y, p0.x + dx * t, p0.y + dy * t, 0xff6b6b, 0.7);
        remaining = 0;
      }
    }

    // Bounce point markers
    for (let i = 1; i < trajPoints.length - 1; i++) {
      this.aimLine.fillStyle(0xffffff, 0.3);
      this.aimLine.fillCircle(trajPoints[i].x, trajPoints[i].y, 4);
    }

    // Landing dot
    if (chargedDist > 0) {
      const landingPos = this.findPositionOnPath(trajPoints, chargedDist);
      this.aimDot.setPosition(landingPos.x, landingPos.y);
      this.aimDot.setAlpha(0.9);
    } else {
      this.aimDot.setPosition(trajPoints[0].x, trajPoints[0].y - 30);
      this.aimDot.setAlpha(0.3);
    }
  }

  private drawDottedSegment(x0: number, y0: number, x1: number, y1: number, color: number, alpha: number) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.sqrt(dx * dx + dy * dy);
    const segments = Math.max(1, Math.floor(len / 12));
    for (let i = 0; i < segments; i++) {
      const t0 = i / segments;
      const t1 = (i + 0.5) / segments;
      this.aimLine.lineStyle(3, color, alpha);
      this.aimLine.lineBetween(
        x0 + dx * t0, y0 + dy * t0,
        x0 + dx * t1, y0 + dy * t1,
      );
    }
  }

  /* ══════════════════════════════════════
     Trajectory computation (wall bounce)
     ══════════════════════════════════════ */

  private computeTrajectoryPoints(angle: number): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];
    const startX = this.charCenterX;
    const startY = this.charCenterY - 60;

    let x = startX;
    let y = startY;
    let dx = Math.cos(angle);
    let dy = Math.sin(angle);

    points.push({ x, y });

    for (let i = 0; i < 10; i++) {
      let tMin = Infinity;
      let hitType: 'left' | 'right' | 'top' = 'top';

      if (dx < 0) {
        const t = (this.wallL - x) / dx;
        if (t > 0.001 && t < tMin) { tMin = t; hitType = 'left'; }
      }
      if (dx > 0) {
        const t = (this.wallR - x) / dx;
        if (t > 0.001 && t < tMin) { tMin = t; hitType = 'right'; }
      }
      if (dy < 0) {
        const t = (this.topY - y) / dy;
        if (t > 0.001 && t < tMin) { tMin = t; hitType = 'top'; }
      }

      if (tMin === Infinity || tMin <= 0) break;

      x += dx * tMin;
      y += dy * tMin;
      points.push({ x, y });

      if (hitType === 'top') break;
      dx = -dx; // reflect off side wall
    }

    return points;
  }

  private computePathLength(points: { x: number; y: number }[]): number {
    let len = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      len += Math.sqrt(dx * dx + dy * dy);
    }
    return len;
  }

  private findPositionOnPath(points: { x: number; y: number }[], distance: number): { x: number; y: number } {
    let remaining = distance;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      const segLen = Math.sqrt(dx * dx + dy * dy);
      if (remaining <= segLen) {
        const t = remaining / segLen;
        return {
          x: points[i - 1].x + dx * t,
          y: points[i - 1].y + dy * t,
        };
      }
      remaining -= segLen;
    }
    return points[points.length - 1];
  }

  /* ══════════════════════════════════════
     Report creation
     ══════════════════════════════════════ */

  private createReport(width: number) {
    const reportSet = REPORT_SETS[Phaser.Math.Between(0, REPORT_SETS.length - 1)];

    const panelX = 30;
    const panelY = 80;
    const panelW = width - 60;
    const panelH = 470;

    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 1);
    bg.fillRoundedRect(panelX, panelY, panelW, panelH, 8);
    bg.lineStyle(2, 0xcccccc);
    bg.strokeRoundedRect(panelX, panelY, panelW, panelH, 8);

    this.add.text(width / 2, panelY + 20, '📄 보고서', {
      fontFamily: 'sans-serif', fontSize: '18px', color: '#333333', fontStyle: 'bold',
    }).setOrigin(0.5);

    let lineY = panelY + 50;
    const lineHeight = 40;
    const startX = panelX + 15;
    const maxLineWidth = panelW - 30;

    for (const lineData of reportSet.lines) {
      const words = this.buildLineWords(lineData.text, lineData.typos);
      let curX = startX;

      for (const word of words) {
        // All text looks identical — player must READ to find typos
        const displayText = word.isTypo ? word.typoData!.typo : word.text;

        const textObj = this.add.text(curX, lineY, displayText, {
          fontFamily: 'sans-serif', fontSize: '14px', color: '#333333',
        });

        const cell: TextCell = {
          text: textObj,
          isTypo: word.isTypo,
          corrected: false,
          typoData: word.typoData,
          x: curX,
          y: lineY,
          width: textObj.width,
          height: 20,
        };
        this.textCells.push(cell);
        if (word.isTypo) this.totalTypos++;

        curX += textObj.width + 5;
        if (curX > startX + maxLineWidth - 20) {
          curX = startX;
          lineY += 22;
        }
      }
      lineY += lineHeight;
    }
  }

  private buildLineWords(
    text: string,
    typos: TypoWord[],
  ): { text: string; isTypo: boolean; typoData?: TypoWord }[] {
    const rawWords = text.split(' ');
    const typoMap = new Map(typos.map(t => [t.correct, t]));
    const result: { text: string; isTypo: boolean; typoData?: TypoWord }[] = [];

    for (const w of rawWords) {
      const typo = typoMap.get(w);
      if (typo) {
        result.push({ text: w, isTypo: true, typoData: typo });
        typoMap.delete(w);
      } else {
        result.push({ text: w, isTypo: false });
      }
    }
    return result;
  }

  /* ══════════════════════════════════════
     Character (fixed, Puzzle Bobble style)
     ══════════════════════════════════════ */

  private createCharacter() {
    const body = this.add.rectangle(0, 0, 50, 60, 0x3182f6, 1);
    const head = this.add.circle(0, -42, 18, 0xffeaa7);
    const face = this.add.text(0, -42, '😊', { fontSize: '20px' }).setOrigin(0.5);

    this.character = this.add.container(this.charCenterX, this.charCenterY, [body, head, face]);
    this.character.setDepth(70);
  }

  /* ══════════════════════════════════════
     Power gauge
     ══════════════════════════════════════ */

  private createGauge() {
    const gaugeY = this.charCenterY - 80;
    this.gaugeBg = this.add.graphics().setDepth(90);
    this.gaugeBg.fillStyle(0x333333, 0.5);
    this.gaugeBg.fillRoundedRect(this.charCenterX - 40, gaugeY, 80, 10, 4);

    this.gaugeBar = this.add.graphics().setDepth(91);
  }

  private drawGauge() {
    const gaugeY = this.charCenterY - 80;
    const maxW = 76;

    this.gaugeBar.clear();

    const r = Math.floor(255 * this.chargePower);
    const g = Math.floor(255 * (1 - this.chargePower));
    const color = (r << 16) | (g << 8) | 0;

    this.gaugeBar.fillStyle(color, 1);
    this.gaugeBar.fillRoundedRect(
      this.charCenterX - 38, gaugeY + 2,
      maxW * this.chargePower, 6, 3,
    );
  }

  /* ══════════════════════════════════════
     Eraser launch (angled, like Puzzle Bobble)
     ══════════════════════════════════════ */

  private launchEraser(angle: number, power: number) {
    if (this.eraserFlying) return;
    this.eraserFlying = true;

    const trajPoints = this.computeTrajectoryPoints(angle);
    const totalLen = this.computePathLength(trajPoints);
    const travelDist = power * totalLen;
    const endPos = this.findPositionOnPath(trajPoints, travelDist);

    const startX = trajPoints[0].x;
    const startY = trajPoints[0].y;

    const eraser = this.add.rectangle(startX, startY, 28, 16, 0xf8a5c2).setDepth(85);
    const eraserEmoji = this.add.text(startX, startY, '🧽', { fontSize: '16px' })
      .setOrigin(0.5).setDepth(86);

    const duration = 300 + (1 - power) * 500;
    const tracker = { t: 0 };

    this.tweens.add({
      targets: tracker,
      t: 1,
      duration,
      ease: 'Cubic.easeOut',
      onUpdate: () => {
        const dist = tracker.t * travelDist;
        const pos = this.findPositionOnPath(trajPoints, dist);
        eraser.setPosition(pos.x, pos.y);
        eraserEmoji.setPosition(pos.x, pos.y);
      },
      onComplete: () => {
        this.resolveHit(endPos.x, endPos.y, eraser, eraserEmoji);
      },
    });
  }

  /* ══════════════════════════════════════
     Hit resolution
     ══════════════════════════════════════ */

  private resolveHit(
    x: number, y: number,
    eraser: Phaser.GameObjects.Rectangle,
    eraserEmoji: Phaser.GameObjects.Text,
  ) {
    let closestCell: TextCell | null = null;
    let closestDist = Infinity;

    for (const cell of this.textCells) {
      if (cell.corrected) continue;
      const cx = cell.x + cell.width / 2;
      const cy = cell.y + cell.height / 2;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist < closestDist) {
        closestDist = dist;
        closestCell = cell;
      }
    }

    const HIT_THRESHOLD = 50;

    if (closestCell && closestDist < HIT_THRESHOLD) {
      if (closestCell.isTypo && !closestCell.corrected) {
        this.onTypoCorrected(closestCell, eraser, eraserEmoji);
      } else {
        this.onNormalHit(closestCell, eraser, eraserEmoji);
      }
    } else {
      this.showPopup(x, y, '빗나감!', '#aaaaaa', 0);
      this.destroyEraser(eraser, eraserEmoji);
    }
  }

  private onTypoCorrected(
    cell: TextCell,
    eraser: Phaser.GameObjects.Rectangle,
    eraserEmoji: Phaser.GameObjects.Text,
  ) {
    cell.corrected = true;
    this.correctedTypos++;

    cell.text.setText(cell.typoData!.correct);
    cell.text.setColor('#27ae60');
    cell.text.setFontStyle('bold');

    this.score += 100;
    this.scoreText.setText(`점수: ${this.score}`);

    this.showPopup(cell.x + cell.width / 2, cell.y - 10, '수정 완료! +100', '#55efc4', 100);
    this.destroyEraser(eraser, eraserEmoji);

    if (this.correctedTypos >= this.totalTypos) {
      this.allClear();
    }
  }

  private onNormalHit(
    cell: TextCell,
    eraser: Phaser.GameObjects.Rectangle,
    eraserEmoji: Phaser.GameObjects.Text,
  ) {
    this.score -= 50;
    this.scoreText.setText(`점수: ${this.score}`);

    cell.text.setColor('#cccccc');
    cell.corrected = true;

    this.showPopup(cell.x + cell.width / 2, cell.y - 10, '앗! 멀쩡한 글씨가... -50', '#ff6b6b', -50);
    this.destroyEraser(eraser, eraserEmoji);
  }

  private destroyEraser(
    eraser: Phaser.GameObjects.Rectangle,
    eraserEmoji: Phaser.GameObjects.Text,
  ) {
    this.tweens.add({
      targets: [eraser, eraserEmoji],
      alpha: 0, scale: 0.3, duration: 200,
      onComplete: () => {
        eraser.destroy();
        eraserEmoji.destroy();
        this.eraserFlying = false;
      },
    });
  }

  /* ══════════════════════════════════════
     Popup feedback
     ══════════════════════════════════════ */

  private showPopup(x: number, y: number, message: string, color: string, points: number) {
    const popup = this.add.text(x, y, message, {
      fontFamily: 'sans-serif', fontSize: '18px', color, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(200);

    if (points >= 0) {
      this.tweens.add({
        targets: popup, y: y - 50, alpha: 0, scale: 1.4,
        duration: 600, onComplete: () => popup.destroy(),
      });
    } else {
      this.tweens.add({
        targets: popup, x: x + 5, duration: 50,
        yoyo: true, repeat: 3,
      });
      this.tweens.add({
        targets: popup, y: y - 40, alpha: 0,
        duration: 700, onComplete: () => popup.destroy(),
      });
    }
  }

  /* ══════════════════════════════════════
     Game end
     ══════════════════════════════════════ */

  private allClear() {
    const bonus = 500 + this.timeLeft * 10;
    this.score += bonus;
    this.scoreText.setText(`점수: ${this.score}`);

    const { width, height } = this.scale;

    const clearText = this.add.text(width / 2, height * 0.35, '전체 수정 완료!', {
      fontFamily: 'sans-serif', fontSize: '32px', color: '#ffd700', fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0).setScale(0.5).setDepth(200);

    const bonusText = this.add.text(width / 2, height * 0.45,
      `+${bonus} 보너스! (클리어 +500, 시간 +${this.timeLeft * 10})`, {
        fontFamily: 'sans-serif', fontSize: '16px', color: '#55efc4', fontStyle: 'bold',
      }).setOrigin(0.5).setAlpha(0).setDepth(200);

    this.tweens.add({
      targets: clearText, alpha: 1, scale: 1.1, duration: 400, ease: 'Back.easeOut',
    });
    this.tweens.add({
      targets: bonusText, alpha: 1, delay: 300, duration: 300,
    });

    this.time.delayedCall(2000, () => {
      clearText.destroy();
      bonusText.destroy();
      if (!this.gameOver) this.endGame();
    });
  }

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
          completed: this.correctedTypos >= this.totalTypos,
          timeRemaining: this.timeLeft,
        });
      }
    });
  }

  private emitState() {
    const stage = GameManager.getCurrentStage();
    emitGameState({
      scene: 'MorningScene', stageId: this.stageId,
      progress: GameManager.progress, allCleared: false, stress: 0,
      time: stage.time, period: stage.period,
    });
  }
}
