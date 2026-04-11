/**
 * LocalStorage 서비스 — 타입 안전한 키 관리
 *
 * 도메인별 그룹:
 *  - 환경 설정 (audio/debug/tutorial)
 *  - 진행 (best score)
 *  - 재화 (coins, gems)
 *  - 캐릭터 (selected, owned)
 */

const KEYS = {
  // 환경 설정 / 디버그
  godMode: 'godMode',
  bgmMuted: 'bgmMuted',
  sfxMuted: 'sfxMuted',
  tutorialDone: 'tutorialDone',

  // 진행 (점수)
  bestScore: 'bestScore',

  // 재화
  coins: 'coins',
  gems: 'gems',

  // 캐릭터
  selectedCharacter: 'selectedCharacter',
  ownedCharacters: 'ownedCharacters',
} as const;

const DEFAULT_CHARACTER = 'rabbit';

type BoolKey = 'godMode' | 'bgmMuted' | 'sfxMuted' | 'tutorialDone';
type NumKey = 'coins' | 'gems' | 'bestScore';

export const storage = {
  /* ──────────────  Bool  ────────────── */

  getBool(key: BoolKey): boolean {
    return localStorage.getItem(KEYS[key]) === 'true';
  },

  setBool(key: BoolKey, value: boolean): void {
    localStorage.setItem(KEYS[key], String(value));
  },

  removeBool(key: BoolKey): void {
    localStorage.removeItem(KEYS[key]);
  },

  toggleBool(key: BoolKey): boolean {
    const next = !this.getBool(key);
    this.setBool(key, next);
    return next;
  },

  /* ──────────────  Number  ────────────── */

  getNum(key: NumKey): number {
    return Number(localStorage.getItem(KEYS[key]) || '0');
  },

  setNum(key: NumKey, value: number): void {
    localStorage.setItem(KEYS[key], String(value));
  },

  addNum(key: NumKey, delta: number): number {
    const next = this.getNum(key) + delta;
    this.setNum(key, next);
    return next;
  },

  /* ──────────────  Best Score (편의 래퍼)  ────────────── */

  getBestScore(): number {
    return this.getNum('bestScore');
  },

  setBestScore(score: number): void {
    this.setNum('bestScore', score);
  },

  updateBestScore(score: number): number {
    const best = Math.max(score, this.getBestScore());
    this.setBestScore(best);
    return best;
  },

  /* ──────────────  Character  ────────────── */

  getSelectedCharacter(): string {
    return localStorage.getItem(KEYS.selectedCharacter) || DEFAULT_CHARACTER;
  },

  setSelectedCharacter(id: string): void {
    localStorage.setItem(KEYS.selectedCharacter, id);
  },

  getOwnedCharacters(): string[] {
    const raw = localStorage.getItem(KEYS.ownedCharacters);
    if (!raw) return [DEFAULT_CHARACTER];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [DEFAULT_CHARACTER];
      return parsed.includes(DEFAULT_CHARACTER) ? parsed : [DEFAULT_CHARACTER, ...parsed];
    } catch {
      return [DEFAULT_CHARACTER];
    }
  },

  isOwnedCharacter(id: string): boolean {
    return this.getOwnedCharacters().includes(id);
  },

  addOwnedCharacter(id: string): void {
    const current = this.getOwnedCharacters();
    if (current.includes(id)) return;
    localStorage.setItem(KEYS.ownedCharacters, JSON.stringify([...current, id]));
  },
};
