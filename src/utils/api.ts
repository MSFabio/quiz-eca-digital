import { RankingEntry, User, AuthResponse, AdminDashboardData } from '../types';

const LOCAL_STORAGE_KEY = 'dprj_eca_quiz_rankings';
const AUTH_STORAGE_KEY = 'dprj_auth_user';

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
              resetAllRankings: (options?: any) => void;
              loginUser: (payload: any) => void;
              registerUser: (payload: any) => void;
              getAdminDashboardData: () => void;
              deleteRankingEntry: (id: string) => void;
            };
            getRankings: () => void;
            submitGameScore: (payload: any) => void;
            resetAllRankings: (options?: any) => void;
            loginUser: (payload: any) => void;
            registerUser: (payload: any) => void;
            getAdminDashboardData: () => void;
            deleteRankingEntry: (id: string) => void;
          };
        };
      };
    };
  }
}

function isGasEnvironment(): boolean {
  return typeof window !== 'undefined' && !!window.google?.script?.run;
}

// ==========================================
// SESSION MANAGEMENT
// ==========================================

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read auth user from localStorage', e);
  }
  return null;
}

export function setCurrentUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (e) {
    console.warn('Could not save auth user to localStorage', e);
  }
}

export function logoutUser(): void {
  setCurrentUser(null);
}

// ==========================================
// AUTHENTICATION (LOGIN & CADASTRO)
// ==========================================

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  // 1. Google Apps Script native environment
  if (isGasEnvironment()) {
    try {
      const res = await new Promise<AuthResponse>((resolve, reject) => {
        window.google!.script!.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)
          .loginUser({ email, password });
      });
      if (res && res.success && res.user) {
        setCurrentUser(res.user);
      }
      return res;
    } catch (err: any) {
      return { success: false, error: err?.message || 'Erro ao conectar ao Google Apps Script.' };
    }
  }

  // 2. Standard Web / Node.js API environment
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok && data.success && data.user) {
      setCurrentUser(data.user);
      return data;
    }
    return { success: false, error: data.error || 'Credenciais inválidas.' };
  } catch (err: any) {
    // Offline local admin fallback for demos if completely disconnected
    if (email.toLowerCase() === 'admin@defensoria.rj.def.br' && password === 'Dprj@2026') {
      const adminFallback: User = {
        id: 'usr-admin-offline',
        name: 'Coordenação DPRJ (Admin)',
        email: 'admin@defensoria.rj.def.br',
        organization: 'Defensoria Pública do Estado do RJ',
        avatar: '🛡️',
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(adminFallback);
      return { success: true, user: adminFallback };
    }
    return { success: false, error: 'Falha na conexão com o servidor.' };
  }
}

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  organization?: string;
  avatar: string;
}): Promise<AuthResponse> {
  // 1. Google Apps Script native environment
  if (isGasEnvironment()) {
    try {
      const res = await new Promise<AuthResponse>((resolve, reject) => {
        window.google!.script!.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)
          .registerUser(payload);
      });
      if (res && res.success && res.user) {
        setCurrentUser(res.user);
      }
      return res;
    } catch (err: any) {
      return { success: false, error: err?.message || 'Erro ao cadastrar no Google Apps Script.' };
    }
  }

  // 2. Standard Web / Node.js API environment
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok && data.success && data.user) {
      setCurrentUser(data.user);
      return data;
    }
    return { success: false, error: data.error || 'Erro ao realizar cadastro.' };
  } catch (err: any) {
    return { success: false, error: 'Falha na conexão ao cadastrar participante.' };
  }
}

// ==========================================
// RANKINGS & SCORES
// ==========================================

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
  userId?: string;
}): Promise<{ success: boolean; rankPosition: number; totalParticipants: number; entry: RankingEntry }> {
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

export async function resetAllRankings(options?: { clearUsers?: boolean }): Promise<boolean> {
  const clearUsers = options?.clearUsers ?? true;

  if (isGasEnvironment()) {
    try {
      await new Promise((resolve, reject) => {
        window.google!.script!.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)
          .resetAllRankings({ clearUsers });
      });
    } catch (err) {
      console.warn('GAS resetAllRankings error', err);
    }
  } else {
    try {
      await fetch(`/api/ranking?clearUsers=${clearUsers}`, { method: 'DELETE' });
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

  // If current logged-in user is a participant and all users were cleared, logout
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.role !== 'admin' && clearUsers) {
    logoutUser();
  }

  return true;
}

// ==========================================
// ADMIN DASHBOARD
// ==========================================

export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  if (isGasEnvironment()) {
    try {
      const res = await new Promise<AdminDashboardData>((resolve, reject) => {
        window.google!.script!.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)
          .getAdminDashboardData();
      });
      if (res) return res;
    } catch (err) {
      console.warn('GAS fetchAdminDashboard error', err);
    }
  }

  try {
    const res = await fetch('/api/admin/dashboard');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Could not fetch admin dashboard from server', e);
  }

  const localRankings = getLocalRankings();
  const sumScore = localRankings.reduce((acc, curr) => acc + curr.score, 0);
  const sumTime = localRankings.reduce((acc, curr) => acc + curr.timeSeconds, 0);
  const topScore = localRankings.length > 0 ? Math.max(...localRankings.map((r) => r.score)) : 0;

  return {
    totalUsers: 1,
    totalMatches: localRankings.length,
    averageScore: localRankings.length > 0 ? Math.round(sumScore / localRankings.length) : 0,
    averageTimeSeconds: localRankings.length > 0 ? Number((sumTime / localRankings.length).toFixed(1)) : 0,
    topScore,
    rankings: localRankings,
    users: [],
  };
}

export async function deleteRankingEntry(id: string): Promise<boolean> {
  if (isGasEnvironment()) {
    try {
      await new Promise((resolve, reject) => {
        window.google!.script!.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)
          .deleteRankingEntry(id);
      });
      return true;
    } catch (err) {
      console.warn('GAS deleteRankingEntry error', err);
    }
  }

  try {
    const res = await fetch(`/api/admin/ranking/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch (e) {
    console.warn('Could not delete ranking entry on server', e);
  }

  const localList = getLocalRankings().filter((r) => r.id !== id);
  saveLocalRankings(localList);
  return true;
}

export async function deleteUserAccount(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch (e) {
    console.warn('Could not delete user account on server', e);
    return false;
  }
}

