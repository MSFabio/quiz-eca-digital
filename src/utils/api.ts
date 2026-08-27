import { RankingEntry } from '../types';

const LOCAL_STORAGE_KEY = 'dprj_eca_quiz_rankings';

// Default initial offline rankings fallback
const DEFAULT_FALLBACK_RANKINGS: RankingEntry[] = [
  {
    id: 'demo-1',
    name: 'Mariana Costa',
    organization: 'Defensoria Itaboraí',
    avatar: '👩‍⚖️',
    score: 1000,
    correctCount: 10,
    totalQuestions: 10,
    timeSeconds: 48.5,
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: 'demo-2',
    name: 'Lucas Nogueira',
    organization: 'Colégio Estadual RJ',
    avatar: '👨‍🎓',
    score: 950,
    correctCount: 10,
    totalQuestions: 10,
    timeSeconds: 56.2,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'demo-3',
    name: 'Beatriz Almeida',
    organization: 'Universidade UERJ',
    avatar: '👩‍💻',
    score: 890,
    correctCount: 9,
    totalQuestions: 10,
    timeSeconds: 52.8,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 'demo-4',
    name: 'Pedro Henrique',
    organization: 'Conselho Tutelar Centro',
    avatar: '👨‍💼',
    score: 870,
    correctCount: 9,
    totalQuestions: 10,
    timeSeconds: 61.4,
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'demo-5',
    name: 'Camila Santos',
    organization: 'Visitante Evento',
    avatar: '🎯',
    score: 800,
    correctCount: 8,
    totalQuestions: 10,
    timeSeconds: 68.1,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

function getLocalRankings(): RankingEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read rankings from localStorage', e);
  }
  return [...DEFAULT_FALLBACK_RANKINGS];
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
  } catch {
    // ignore
  }
  saveLocalRankings([]);
  return true;
}

export async function seedDemoRankings(): Promise<RankingEntry[]> {
  try {
    const res = await fetch('/api/ranking/seed', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      if (data.rankings) {
        saveLocalRankings(data.rankings);
        return data.rankings;
      }
    }
  } catch {
    // ignore
  }
  saveLocalRankings(DEFAULT_FALLBACK_RANKINGS);
  return DEFAULT_FALLBACK_RANKINGS;
}
