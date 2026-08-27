export interface Option {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Question {
  id: number;
  topic: string;
  number: number;
  title: string;
  scenario: string;
  options: Option[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface UserProfile {
  name: string;
  organization: string;
  avatar: string;
}

export interface UserAnswer {
  questionId: number;
  selectedOption: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  timeSpentSeconds: number;
  pointsEarned: number;
}

export interface GameResult {
  id: string;
  userName: string;
  organization: string;
  avatar: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  totalTimeSeconds: number;
  answers: UserAnswer[];
  rankPosition?: number;
  createdAt: string;
}

export interface RankingEntry {
  id: string;
  name: string;
  organization?: string;
  avatar: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeSeconds: number;
  createdAt: string;
}

export type ScreenState = 'register' | 'quiz' | 'result' | 'ranking';
