import Phaser from 'phaser';
import { GameManager } from '../../GameManager';
import { emitGameState } from '../../GameBridge';

/* ── constants ─────────────────────────────────────────── */
const COLS = 12;
const ROWS = 24;
const CELL = 28;
const GRID_W = COLS * CELL;          // 336
const MARGIN_LEFT = 15;
const MARGIN_TOP = 60;               // room for HUD

// standard tetromino shapes (row-major, [row][col])
const SHAPES: Record<string, number[][]> = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
};
const PIECE_KEYS = Object.keys(SHAPES);

const PIECE_COLORS: Record<string, number> = {
  I: 0x00bcd4, O: 0xffeb3b, T: 0x9c27b0,
  S: 0x4caf50, Z: 0xf44336, J: 0x2196f3, L: 0xff9800,
};

// 회의록 줄 점수 (글자 있는 줄)
const DOC_LINE_SCORES = [0, 200, 500, 1000, 2000];
// 일반 줄 점수 (글자 없는 줄)
const PLAIN_LINE_SCORES = [0, 50, 100, 200, 400];

// 기획서 본문 – 한 글자씩 순서대로 올라옴
const DOC_TEXT =
  '금일 회의 안건을 공유드립니다. ' +
  '1분기 매출 목표 달성률 검토 및 ' +
  '2분기 마케팅 전략 수립이 필요합니다. ' +
  '고객 피드백 분석 결과를 바탕으로 ' +
  '서비스 개선 방향을 논의하겠습니다. ' +
  '예산 조정안과 인력 충원 계획도 ' +
  '함께 검토 부탁드립니다. ' +
  '각 팀별 이슈 사항을 정리해서 ' +
  '회의 전까지 공유 부탁드립니다. ' +
  '참석 대상은 전 팀장급 이상입니다. ' +
  '회의실은 10층 대회의실이며 ' +
  '오후 2시 정각에 시작합니다. ' +
  '지각 시 커피 사기입니다. 감사합니다.';

const RISING_COLOR = 0x5a5a6e;       // grey meeting blocks
const BG_COLOR_CELL = 0x1a1a2e;      // dark meeting-room tone

/* ── helpers ────────────────────────────────────────────── */
function rotate90(mat: number[][]): number[][] {
  const rows = mat.length, cols = mat[0].length;
  const out: number[][] = [];
  for (let c = 0; c < cols; c++) {
    const row: number[] = [];
    for (let r = rows - 1; r >= 0; r--) row.push(mat[r][c]);
    out.push(row);
  }
  return out;
}

/* ── cell type stored in grid ──────────────────────────── */
interface Cell {
  filled: boolean;
  color: number;
  text?: string;          // meeting text (for rising blocks)
}

function emptyCell(): Cell { return { filled: false, color: 0 }; }

/* ── active piece ──────────────────────────────────────── */
interface Piece {
  shape: number[][];
  key: string;
  row: number;            // top-left grid row
  col: number;            // top-left grid col
}

/* ═══════════════════════════════════════════════════════ */
export class AfternoonScene extends Phaser.Scene {
  private stageId!: number;
  private debugMode = false;
  private timeLeft = 60;
  private score = 0;
  private gameOver = false;

  // timers
  private timerEvent?: Phaser.Time.TimerEvent;
  private dropTimer = 0;
  private riseTimer = 0;

  // difficulty
  private dropInterval = 600;         // ms between auto-drops
  private riseInterval = 7000;        // ms between rising lines
  private linesRisen = 0;

  // sequential document text cursor
  private docCursor = 0;

  // grid & piece
  private grid: Cell[][] = [];
  private current!: Piece;
  private gfx!: Phaser.GameObjects.Graphics;

  // HUD
  private timerText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;

  // touch helpers
  private dragStartX = 0;
  private dragStartY = 0;
  private dragColOffset = 0;   // cumulative columns moved during this drag
  private didDrag = false;     // distinguish drag from tap
  private dropped = false;     // prevent double actions after hard drop
  private dragAxis: 'none' | 'h' | 'v' = 'none';  // locked drag direction

  // text pool for meeting labels
  private cellTexts: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: 'AfternoonScene' });
  }

  /* ── lifecycle ───────────────────────────────────────── */

  init(data: { stageId: number; debug?: boolean }) {
    this.stageId = data.stageId;
    this.debugMode = data.debug ?? false;
    this.timeLeft = 60;
    this.score = 0;
    this.gameOver = false;
    this.dropTimer = 0;
    this.riseTimer = 0;
    this.dropInterval = 600;
    this.riseInterval = 6000;
    this.linesRisen = 0;
    this.docCursor = 0;
    this.grid = [];
    this.cellTexts = [];
  }

  create() {
    const { width } = this.scale;
    const stage = GameManager.getCurrentStage();
    this.cameras.main.setBackgroundColor(stage.bgColor);

    // graphics for grid rendering
    this.gfx = this.add.graphics();

    // ── HUD ──
    this.scoreText = this.add.text(20, 20, '점수: 0', {
      fontFamily: 'sans-serif', fontSize: '24px', color: '#ffd700', fontStyle: 'bold',
    }).setDepth(100);

    this.timerText = this.add.text(width - 20, 20, '60', {
      fontFamily: 'sans-serif', fontSize: '28px', color: '#e94560', fontStyle: 'bold',
    }).setOrigin(1, 0).setDepth(100);

    // ── 60-second countdown ──
    this.timerEvent = this.time.addEvent({
      delay: 1000, repeat: 59,
      callback: () => {
        this.timeLeft--;
        this.timerText.setText(`${this.timeLeft}`);
        if (this.timeLeft <= 10) this.timerText.setColor('#ff0000');
        if (this.timeLeft <= 0) this.endGame();
      },
    });

    // ── initialise empty grid ──
    for (let r = 0; r < ROWS; r++) {
      this.grid[r] = [];
      for (let c = 0; c < COLS; c++) this.grid[r][c] = emptyCell();
    }

    // push 1 initial rising line
    this.pushRisingLine();

    // spawn first piece
    this.spawnPiece();

    // ── touch input (drag-based) ──
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (this.gameOver) return;
      this.dragStartX = p.x;
      this.dragStartY = p.y;
      this.dragColOffset = 0;
      this.didDrag = false;
      this.dropped = false;
      this.dragAxis = 'none';
    });

    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (this.gameOver || !p.isDown || this.dropped) return;

      const dx = p.x - this.dragStartX;
      const dy = p.y - this.dragStartY;

      // 방향 미결정 시 — 일정 거리 이상 움직이면 축 고정
      if (this.dragAxis === 'none') {
        const ax = Math.abs(dx);
        const ay = Math.abs(dy);
        const threshold = 12;
        if (ax < threshold && ay < threshold) return;   // 아직 판별 불가
        this.dragAxis = ay > ax ? 'v' : 'h';
      }

      // 세로 축 → 하드 드롭만
      if (this.dragAxis === 'v') {
        if (dy > 50) {
          this.hardDrop();
          this.dropped = true;
          this.didDrag = true;
        }
        return;
      }

      // 가로 축 → 좌우 이동만
      const colsMoved = Math.round(dx / CELL);
      const delta = colsMoved - this.dragColOffset;
      if (delta !== 0) {
        const dir = delta > 0 ? 1 : -1;
        for (let i = 0; i < Math.abs(delta); i++) this.movePiece(0, dir);
        this.dragColOffset = colsMoved;
        this.didDrag = true;
      }
    });

    this.input.on('pointerup', () => {
      if (this.gameOver || this.dropped) return;
      // tap (no drag) → rotate
      if (!this.didDrag) this.rotatePiece();
    });

    this.emitState();
  }

  /* ── main loop ───────────────────────────────────────── */

  update(_time: number, delta: number) {
    if (this.gameOver) return;

    // auto-drop piece
    this.dropTimer += delta;
    if (this.dropTimer >= this.dropInterval) {
      this.dropTimer = 0;
      if (!this.movePiece(1, 0)) this.lockPiece();
    }

    // rising lines (1줄씩, 10초마다 간격 단축)
    this.riseTimer += delta;
    if (this.riseTimer >= this.riseInterval) {
      this.riseTimer = 0;
      this.pushRisingLine();
      this.linesRisen++;
    }

    // 10초 간격으로 난이도 상승
    const elapsed = 60 - this.timeLeft;
    const tier = Math.floor(elapsed / 10);          // 0,1,2,3,4,5
    this.riseInterval = Math.max(3000, 7000 - tier * 400);
    this.dropInterval = Math.max(250, 600 - tier * 40);

    this.renderGrid();
  }

  /* ── piece logic ─────────────────────────────────────── */

  private spawnPiece() {
    const key = PIECE_KEYS[Phaser.Math.Between(0, PIECE_KEYS.length - 1)];
    const shape = SHAPES[key].map(r => [...r]);
    this.current = {
      shape,
      key,
      row: 0,
      col: Math.floor((COLS - shape[0].length) / 2),
    };

    // if spawn position collides → game over
    if (this.collides(this.current.shape, this.current.row, this.current.col)) {
      this.endGame();
    }
  }

  private collides(shape: number[][], row: number, col: number): boolean {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const gr = row + r;
        const gc = col + c;
        if (gc < 0 || gc >= COLS || gr >= ROWS) return true;
        if (gr < 0) continue;   // allow above top
        if (this.grid[gr][gc].filled) return true;
      }
    }
    return false;
  }

  /** Move piece by dr rows, dc cols. Returns true if successful. */
  private movePiece(dr: number, dc: number): boolean {
    const nr = this.current.row + dr;
    const nc = this.current.col + dc;
    if (!this.collides(this.current.shape, nr, nc)) {
      this.current.row = nr;
      this.current.col = nc;
      return true;
    }
    return false;
  }

  private rotatePiece() {
    if (this.current.key === 'O') return; // O doesn't rotate
    const rotated = rotate90(this.current.shape);
    // wall-kick: try 0, -1, +1, -2, +2
    for (const kick of [0, -1, 1, -2, 2]) {
      if (!this.collides(rotated, this.current.row, this.current.col + kick)) {
        this.current.shape = rotated;
        this.current.col += kick;
        return;
      }
    }
  }

  private hardDrop() {
    while (this.movePiece(1, 0)) { /* keep dropping */ }
    this.lockPiece();
  }

  private lockPiece() {
    const { shape, row, col, key } = this.current;
    const color = PIECE_COLORS[key];
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const gr = row + r;
        const gc = col + c;
        if (gr < 0) { this.endGame(); return; }
        this.grid[gr][gc] = { filled: true, color };
      }
    }
    this.clearLines();
    this.spawnPiece();
  }

  /* ── line clear ──────────────────────────────────────── */

  private clearLines() {
    let docCleared = 0;
    let plainCleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (this.grid[r].every(c => c.filled)) {
        if (this.grid[r].some(c => c.text)) docCleared++;
        else plainCleared++;
        this.grid.splice(r, 1);
        const newRow: Cell[] = [];
        for (let c = 0; c < COLS; c++) newRow.push(emptyCell());
        this.grid.unshift(newRow);
        r++; // re-check same index
      }
    }
    const totalCleared = docCleared + plainCleared;
    if (totalCleared > 0) {
      const docPts = DOC_LINE_SCORES[Math.min(docCleared, 4)];
      const plainPts = PLAIN_LINE_SCORES[Math.min(plainCleared, 4)];
      const pts = docPts + plainPts;
      this.score += pts;
      this.scoreText.setText(`점수: ${this.score}`);
      this.showClearPopup(totalCleared, docCleared, pts);
    }
  }

  private showClearPopup(lines: number, docLines: number, pts: number) {
    const { width } = this.scale;
    let msg: string;
    if (lines >= 2) {
      msg = `${lines}줄 클리어! +${pts}`;
    } else if (docLines > 0) {
      msg = `회의록 작성 완료! +${pts}`;
    } else {
      msg = `줄 클리어! +${pts}`;
    }
    const popup = this.add.text(width / 2, MARGIN_TOP + (ROWS * CELL) / 2, msg, {
      fontFamily: 'sans-serif', fontSize: '26px', color: '#ffd700', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(200);

    this.tweens.add({
      targets: popup,
      y: popup.y - 60,
      alpha: 0,
      scale: 1.5,
      duration: 800,
      onComplete: () => popup.destroy(),
    });
  }

  /* ── rising lines ────────────────────────────────────── */

  private pushRisingLine() {
    // check if top row has any filled cell → game over
    if (this.grid[0].some(c => c.filled)) {
      this.endGame();
      return;
    }

    // remove top row, add new row at bottom
    this.grid.shift();

    const newRow: Cell[] = [];
    const gaps = Phaser.Math.Between(1, 2);
    const gapIndices = new Set<number>();
    while (gapIndices.size < gaps) gapIndices.add(Phaser.Math.Between(0, COLS - 1));

    for (let c = 0; c < COLS; c++) {
      if (gapIndices.has(c)) {
        newRow.push(emptyCell());
      } else {
        // 기획서 본문에서 한 글자씩 순서대로
        const ch = DOC_TEXT[this.docCursor % DOC_TEXT.length];
        this.docCursor++;
        newRow.push({ filled: true, color: RISING_COLOR, text: ch });
      }
    }
    this.grid.push(newRow);

    // push current piece up so it stays in place relative to grid
    if (this.current) this.current.row--;
  }

  /* ── rendering ───────────────────────────────────────── */

  private renderGrid() {
    this.gfx.clear();

    // destroy old text labels
    for (const t of this.cellTexts) t.destroy();
    this.cellTexts = [];

    // grid background
    this.gfx.fillStyle(BG_COLOR_CELL, 1);
    this.gfx.fillRect(MARGIN_LEFT, MARGIN_TOP, GRID_W, ROWS * CELL);

    // grid lines (subtle)
    this.gfx.lineStyle(1, 0x2a2a3e, 0.5);
    for (let r = 0; r <= ROWS; r++) {
      const y = MARGIN_TOP + r * CELL;
      this.gfx.lineBetween(MARGIN_LEFT, y, MARGIN_LEFT + GRID_W, y);
    }
    for (let c = 0; c <= COLS; c++) {
      const x = MARGIN_LEFT + c * CELL;
      this.gfx.lineBetween(x, MARGIN_TOP, x, MARGIN_TOP + ROWS * CELL);
    }

    // locked cells
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = this.grid[r][c];
        if (!cell.filled) continue;
        this.drawCell(r, c, cell.color);
        if (cell.text) this.drawCellText(r, c, cell.text);
      }
    }

    // ghost piece
    if (this.current) {
      let ghostRow = this.current.row;
      while (!this.collides(this.current.shape, ghostRow + 1, this.current.col)) ghostRow++;
      if (ghostRow !== this.current.row) {
        this.drawPiece(this.current.shape, ghostRow, this.current.col, PIECE_COLORS[this.current.key], 0.25);
      }
      // current piece
      this.drawPiece(this.current.shape, this.current.row, this.current.col, PIECE_COLORS[this.current.key], 1);
    }
  }

  private drawCell(row: number, col: number, color: number, alpha = 1) {
    const x = MARGIN_LEFT + col * CELL;
    const y = MARGIN_TOP + row * CELL;
    this.gfx.fillStyle(color, alpha);
    this.gfx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
  }

  private drawPiece(shape: number[][], row: number, col: number, color: number, alpha: number) {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const gr = row + r;
        if (gr < 0) continue;
        this.drawCell(gr, col + c, color, alpha);
      }
    }
  }

  private drawCellText(row: number, col: number, str: string) {
    const x = MARGIN_LEFT + col * CELL + CELL / 2;
    const y = MARGIN_TOP + row * CELL + CELL / 2;
    const t = this.add.text(x, y, str, {
      fontFamily: 'sans-serif', fontSize: '11px', color: '#cccccc',
    }).setOrigin(0.5).setDepth(50);
    this.cellTexts.push(t);
  }

  /* ── game end ────────────────────────────────────────── */

  private endGame() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.timerEvent?.remove();

    // time bonus
    this.score += this.timeLeft * 10;

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

  /* ── bridge ──────────────────────────────────────────── */

  private emitState() {
    const stage = GameManager.getCurrentStage();
    emitGameState({
      scene: 'AfternoonScene',
      stageId: this.stageId,
      progress: GameManager.progress,
      allCleared: false,
      stress: 0,
      time: stage.time,
      period: stage.period,
    });
  }
}
