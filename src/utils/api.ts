import { RankingEntry } from '../types';

const LOCAL_STORAGE_KEY = 'dprj_eca_quiz_rankings';

// Support Google Apps Script native RPCs
declare global {
  interface Window {
    google?: {
      script?: {
        run: {
          withSuccessHandler: (fn: (res: any) => void) => {
            withFailureHandler: (fn: (err: any) => void) => {
              getRankings: () => void;
              submitGameScore: (payload: any) => void;
              resetAllRankings: () => void;
            };
            getRankings: () => void;
            submitGameScore: (payload: any) => void;
            resetAllRankings: () => void;
          };
        };
      };
    };
  }
}

function isGasEnvironment(): boolean {
  return typeof window !== 'undefined' && !!window.google?.script?.run;
}

function getLocalRankings(): RankingEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read rankings from localStorage', e);
  }
  return [];
}

function saveLocalRankings(data: RankingEntry[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save rankings to localStorage', e);
  }
}

export async function fetchRankings(): Promise<RankingEntry[]> {
  // 1. Google Apps Script native environment
  if (isGasEnvironment()) {
    try {
      const data = await new Promise<{ success: boolean; total: number; rankings: RankingEntry[] }>((resolve, reject) => {
        window.google!.script!.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)
          .getRankings();
      });
      if (data && Array.isArray(data.rankings)) {
        saveLocalRankings(data.rankings);
        return data.rankings;
      }
    } catch (err) {
      console.warn('GAS fetchRankings error fallback', err);
    }
  }

  // 2. Standard Web / Node.js API environment
  try {
    const res = await fetch('/api/ranking', {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.rankings)) {
        saveLocalRankings(data.rankings);
        return data.rankings;
      }
    }
  } catch {
    // network or dev fallback
  }
  return getLocalRankings();
}

export async function submitGameScore(payload: {
  name: string;
  organization?: string;
  avatar: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeSeconds: number;
}): Promise<{ success: boolean; rankPosition: number; totalParticipants: number; entry: RankingEntry }> {
  // 1. Google Apps Script native environment
  if (isGasEnvironment()) {
    try {
      const res = await new Promise<{ success: boolean; rankPosition: number; totalParticipants: number; entry: RankingEntry }>((resolve, reject) => {
        window.google!.script!.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)
          .submitGameScore(payload);
      });
      if (res && res.success) {
        return res;
      }
    } catch (err) {
      console.warn('GAS submitGameScore error fallback', err);
    }
  }

  // 2. Standard Web / Node.js API environment
  const localList = getLocalRankings();
  const entry: RankingEntry = {
    id: 'entry-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    name: payload.name.trim(),
    organization: payload.organization?.trim() || 'Geral',
    avatar: payload.avatar,
    score: payload.score,
    correctCount: payload.correctCount,
    totalQuestions: payload.totalQuestions,
    timeSeconds: payload.timeSeconds,
    createdAt: new Date().toISOString(),
  };

  try {
    const res = await fetch('/api/ranking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.rankPosition) {
        return {
          success: true,
          rankPosition: data.rankPosition,
          totalParticipants: data.totalParticipants,
          entry: data.entry,
        };
      }
    }
  } catch {
    // offline fallback
  }

  // Local fallback calculation
  localList.push(entry);
  localList.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.timeSeconds - b.timeSeconds;
  });
  saveLocalRankings(localList);

  const rankPosition = localList.findIndex((item) => item.id === entry.id) + 1;
  return {
    success: true,
    rankPosition: rankPosition > 0 ? rankPosition : 1,
    totalParticipants: localList.length,
    entry,
  };
}

export async function resetAllRankings(): Promise<boolean> {
  // 1. Google Apps Script native environment
  if (isGasEnvironment()) {
    try {
      await new Promise((resolve, reject) => {
        window.google!.script!.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)
          .resetAllRankings();
      });
    } catch (err) {
      console.warn('GAS resetAllRankings error', err);
    }
  } else {
    try {
      await fetch('/api/ranking', { method: 'DELETE' });
    } catch (e) {
      console.warn('Could not reset on server', e);
    }
  }

  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (e) {
    console.warn('Could not remove localStorage key', e);
  }
  saveLocalRankings([]);
  return true;
}
