export interface MinigameDef {
  id: number;
  sceneKey: string;
  name: string;
  description: string;
}

export interface StageDef {
  id: number;
  category: string;
  name: string;
  emoji: string;
  time: string;
  period: 'AM' | 'PM';
  bgColor: string;
  timeLimit: number; // seconds
  minigame: MinigameDef;
}

export interface StageResult {
  stageId: number;
  score: number; // 0~100
  completed: boolean;
  timeRemaining: number; // seconds left
}

export type GradeKey = 'S' | 'A' | 'B' | 'C' | 'D';

export interface Grade {
  key: GradeKey;
  emoji: string;
  title: string;
  comment: string;
  minScore: number;
}

export interface RankingEntry {
  nickname: string;
  totalScore: number;
  grade: GradeKey;
  date: string;
}
