import { RankingEntry } from '../types';

const LOCAL_STORAGE_KEY = 'dprj_eca_quiz_rankings';

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
  try {
    await fetch('/api/ranking', { method: 'DELETE' });
  } catch (e) {
    console.warn('Could not reset on server', e);
  }
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (e) {
    console.warn('Could not remove localStorage key', e);
  }
  saveLocalRankings([]);
  return true;
}
