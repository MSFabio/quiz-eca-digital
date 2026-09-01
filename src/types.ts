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

export type UserRole = 'admin' | 'participant';

export interface User {
  id: string;
  name: string;
  email: string;
  organization: string;
  avatar: string;
  role: UserRole;
  createdAt: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  organization: string;
  avatar: string;
  email?: string;
  role?: UserRole;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export interface OptionStat {
  optionId: 'A' | 'B' | 'C' | 'D';
  text: string;
  count: number;
  percentage: number;
  isCorrect: boolean;
}

export interface QuestionStat {
  questionId: number;
  number: number;
  title: string;
  topic: string;
  scenario: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  totalResponses: number;
  accuracyPercentage: number;
  options: OptionStat[];
}

export interface AdminDashboardData {
  totalUsers: number;
  totalMatches: number;
  averageScore: number;
  averageTimeSeconds: number;
  topScore: number;
  rankings: RankingEntry[];
  users: User[];
  questionStats?: QuestionStat[];
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
  userId?: string;
  answers?: UserAnswer[];
  createdAt: string;
}

export type ScreenState = 'auth' | 'quiz' | 'result' | 'ranking' | 'admin';

