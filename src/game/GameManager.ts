import { STAGES } from './data/stages';
import type { StageResult, Grade, GradeKey, RankingEntry } from '../types/game';

const GRADES: Grade[] = [
  { key: 'S', emoji: '🏆', title: '퇴근의 달인', comment: '이 정도면 CEO감이시네요', minScore: 5000 },
  { key: 'A', emoji: '😊', title: '프로 직장인', comment: '칼퇴의 품격이 느껴집니다', minScore: 3000 },
  { key: 'B', emoji: '😐', title: '평범한 회사원', comment: '무난하게 하루를 보냈습니다', minScore: 1500 },
  { key: 'C', emoji: '😤', title: '고군분투 사원', comment: '내일은 좀 나아지겠죠...?', minScore: 500 },
  { key: 'D', emoji: '💀', title: '사회초년생', comment: '첫 출근인가요...?', minScore: 0 },
];

const RANKING_STORAGE_KEY = 'worker-nightmare-ranking';
const MAX_RANKING_ENTRIES = 10;

class GameManagerClass {
  private _currentStageIndex = 0;
  private _results: StageResult[] = [];

  get currentStageIndex() { return this._currentStageIndex; }
  get results() { return [...this._results]; }
  get totalStages() { return STAGES.length; }

  get totalScore(): number {
    return this._results.reduce((sum, r) => sum + r.score, 0);
  }

  get progress(): number {
    return this._results.length;
  }

  get allCleared(): boolean {
    return this._results.length >= STAGES.length;
  }

  get isLastStage(): boolean {
    return this._currentStageIndex >= STAGES.length - 1;
  }

  getCurrentStage() {
    return STAGES[this._currentStageIndex] ?? STAGES[STAGES.length - 1];
  }

  recordResult(stageId: number, score: number, completed: boolean, timeRemaining: number) {
    this._results.push({ stageId, score, completed, timeRemaining });
  }

  advanceStage() {
    this._currentStageIndex++;
  }

  getGrade(): Grade {
    const total = this.totalScore;
    for (const grade of GRADES) {
      if (total >= grade.minScore) return grade;
    }
    return GRADES[GRADES.length - 1];
  }

  getRanking(): RankingEntry[] {
    try {
      const data = localStorage.getItem(RANKING_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveRanking(nickname: string): RankingEntry {
    const entry: RankingEntry = {
      nickname,
      totalScore: this.totalScore,
      grade: this.getGrade().key as GradeKey,
      date: new Date().toISOString().slice(0, 10),
    };

    const ranking = this.getRanking();
    ranking.push(entry);
    ranking.sort((a, b) => b.totalScore - a.totalScore);
    const trimmed = ranking.slice(0, MAX_RANKING_ENTRIES);

    try {
      localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // storage full
    }

    return entry;
  }

  getAllStages() {
    return STAGES;
  }

  debugJumpTo(stageIndex: number) {
    this._currentStageIndex = stageIndex;
    this._results = [];
  }

  reset() {
    this._currentStageIndex = 0;
    this._results = [];
  }
}

export const GameManager = new GameManagerClass();
