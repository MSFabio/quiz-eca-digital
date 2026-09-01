import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

interface RankingEntry {
  id: string;
  name: string;
  organization?: string;
  avatar: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeSeconds: number;
  userId?: string;
  createdAt: string;
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  organization: string;
  avatar: string;
  role: 'admin' | 'participant';
  createdAt: string;
}

const DATA_DIRECTORY = process.env.DATA_DIR || process.cwd();
if (!fs.existsSync(DATA_DIRECTORY)) {
  try {
    fs.mkdirSync(DATA_DIRECTORY, { recursive: true });
  } catch (err) {
    console.error('Could not create DATA_DIRECTORY:', err);
  }
}
const DATA_FILE = path.join(DATA_DIRECTORY, 'ranking-data.json');
const USERS_FILE = path.join(DATA_DIRECTORY, 'users-data.json');

function hashPassword(password: string, salt: string): string {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

function loadRankings(): RankingEntry[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading ranking data:', err);
  }
  return [];
}

function loadUsers(): StoredUser[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading users data:', err);
  }
  return [];
}

let rankingList: RankingEntry[] = loadRankings();
let usersList: StoredUser[] = loadUsers();

// Ensure Default Administrator exists
function ensureDefaultAdmin() {
  const adminEmail = 'admin@defensoria.rj.def.br';
  const existing = usersList.find((u) => u.email.toLowerCase() === adminEmail.toLowerCase());
  if (!existing) {
    const salt = crypto.randomBytes(16).toString('hex');
    const adminUser: StoredUser = {
      id: 'usr-admin-01',
      name: 'Coordenação DPRJ (Admin)',
      email: adminEmail,
      passwordHash: hashPassword('Dprj@2026', salt),
      salt,
      organization: 'Defensoria Pública do Estado do RJ',
      avatar: '🛡️',
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    usersList.push(adminUser);
    saveUsers(usersList);
    console.log(`[AUTH] Administrador padrão inicializado: ${adminEmail}`);
  }
}

ensureDefaultAdmin();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

let isSaving = false;
let pendingSave = false;

async function persistRankingsAsync() {
  if (isSaving) {
    pendingSave = true;
    return;
  }
  isSaving = true;
  try {
    const dataString = JSON.stringify(rankingList, null, 2);
    await fs.promises.writeFile(DATA_FILE, dataString, 'utf-8');
  } catch (err) {
    console.error('Error saving ranking data:', err);
  } finally {
    isSaving = false;
    if (pendingSave) {
      pendingSave = false;
      persistRankingsAsync();
    }
  }
}

function saveRankings(data: RankingEntry[]) {
  rankingList = data;
  persistRankingsAsync();
}

function saveUsers(data: StoredUser[]) {
  usersList = data;
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users data:', err);
  }
}

function sanitizeSafeUser(user: StoredUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    organization: user.organization,
    avatar: user.avatar,
    role: user.role,
    createdAt: user.createdAt,
  };
}

async function startServer() {
  const app = express();

  // Basic CORS & JSON handling
  app.use(express.json({ limit: '2mb' }));
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Quiz ECA Digital - DPRJ',
      timestamp: new Date().toISOString(),
      activeParticipants: rankingList.length,
      totalRegisteredUsers: usersList.length,
      uptimeSeconds: process.uptime(),
    });
  });

  // ==========================================
  // AUTHENTICATION ROUTES
  // ==========================================

  // Register new participant
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password, organization, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Nome, e-mail e senha são obrigatórios.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (!cleanEmail.includes('@') || cleanEmail.length < 5) {
      return res.status(400).json({ success: false, error: 'Por favor, informe um e-mail válido.' });
    }

    if (String(password).length < 4) {
      return res.status(400).json({ success: false, error: 'A senha deve conter no mínimo 4 caracteres.' });
    }

    const existing = usersList.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Este e-mail já está cadastrado. Faça login para continuar.' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const cleanName = String(name).replace(/<[^>]*>?/gm, '').trim().substring(0, 50);
    const cleanOrg = organization ? String(organization).replace(/<[^>]*>?/gm, '').trim().substring(0, 50) : 'Geral';

    const newUser: StoredUser = {
      id: 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name: cleanName,
      email: cleanEmail,
      passwordHash: hashPassword(String(password), salt),
      salt,
      organization: cleanOrg,
      avatar: avatar || '👩‍⚖️',
      role: cleanEmail.includes('admin') ? 'admin' : 'participant',
      createdAt: new Date().toISOString(),
    };

    usersList.push(newUser);
    saveUsers(usersList);

    // Initialize participant in ranking table immediately upon registration
    if (newUser.role === 'participant') {
      const initialRanking: RankingEntry = {
        id: 'entry-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        name: cleanName,
        organization: cleanOrg,
        avatar: avatar || '👩‍⚖️',
        score: 0,
        correctCount: 0,
        totalQuestions: 10,
        timeSeconds: 0,
        userId: newUser.id,
        createdAt: new Date().toISOString(),
      };
      rankingList.push(initialRanking);
      saveRankings(rankingList);
    }

    const safeUser = sanitizeSafeUser(newUser);
    res.status(201).json({
      success: true,
      user: safeUser,
      message: 'Cadastro realizado com sucesso!',
    });
  });

  // Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'E-mail e senha são obrigatórios.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = usersList.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return res.status(401).json({ success: false, error: 'E-mail ou senha incorretos.' });
    }

    const candidateHash = hashPassword(String(password), user.salt);
    if (candidateHash !== user.passwordHash) {
      return res.status(401).json({ success: false, error: 'E-mail ou senha incorretos.' });
    }

    // Ensure participant is present in ranking
    if (user.role === 'participant') {
      const hasRanking = rankingList.some((r) => r.userId === user.id);
      if (!hasRanking) {
        rankingList.push({
          id: 'entry-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          name: user.name,
          organization: user.organization || 'Geral',
          avatar: user.avatar || '👩‍⚖️',
          score: 0,
          correctCount: 0,
          totalQuestions: 10,
          timeSeconds: 0,
          userId: user.id,
          createdAt: new Date().toISOString(),
        });
        saveRankings(rankingList);
      }
    }

    const safeUser = sanitizeSafeUser(user);
    res.json({
      success: true,
      user: safeUser,
      message: `Bem-vindo(a), ${user.name}!`,
    });
  });

  // Check current session
  app.get('/api/auth/me', (req, res) => {
    const emailHeader = req.headers['authorization'] || req.query.email;
    if (!emailHeader) {
      return res.status(401).json({ success: false, error: 'Não autenticado.' });
    }
    const cleanEmail = String(emailHeader).replace('Bearer ', '').trim().toLowerCase();
    const user = usersList.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Sessão inválida.' });
    }
    res.json({ success: true, user: sanitizeSafeUser(user) });
  });

  // ==========================================
  // RANKING & GAME ROUTES
  // ==========================================

  // Get current ranking sorted by Score DESC then Time ASC
  app.get('/api/ranking', (req, res) => {
    const sorted = [...rankingList].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.timeSeconds - b.timeSeconds;
    });
    res.json({
      success: true,
      total: sorted.length,
      rankings: sorted,
    });
  });

  // Add new match result
  app.post('/api/ranking', (req, res) => {
    const { name, organization, avatar, score, correctCount, totalQuestions, timeSeconds, userId } = req.body;

    if (!name || score === undefined || timeSeconds === undefined) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    const cleanName = String(name).replace(/<[^>]*>?/gm, '').trim().substring(0, 50);
    const cleanOrg = organization ? String(organization).replace(/<[^>]*>?/gm, '').trim().substring(0, 50) : 'Geral';
    const numScore = Math.max(0, Math.min(2000, Number(score) || 0));
    const numCorrect = Math.max(0, Math.min(10, Number(correctCount) || 0));
    const numTotal = Math.max(1, Math.min(50, Number(totalQuestions) || 10));
    const numTime = Math.max(0.1, Number(timeSeconds) || 0);

    let targetEntry: RankingEntry;
    const existingIndex = userId ? rankingList.findIndex((r) => r.userId === String(userId)) : -1;

    if (existingIndex !== -1) {
      targetEntry = rankingList[existingIndex];
      targetEntry.name = cleanName || targetEntry.name;
      targetEntry.organization = cleanOrg || targetEntry.organization;
      targetEntry.avatar = avatar || targetEntry.avatar;
      targetEntry.score = numScore;
      targetEntry.correctCount = numCorrect;
      targetEntry.totalQuestions = numTotal;
      targetEntry.timeSeconds = numTime;
    } else {
      targetEntry = {
        id: 'entry-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        name: cleanName || 'Participante',
        organization: cleanOrg,
        avatar: avatar || '⭐',
        score: numScore,
        correctCount: numCorrect,
        totalQuestions: numTotal,
        timeSeconds: numTime,
        userId: userId ? String(userId) : undefined,
        createdAt: new Date().toISOString(),
      };
      rankingList.push(targetEntry);
    }

    saveRankings(rankingList);

    // Calculate current position
    const sorted = [...rankingList].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeSeconds - b.timeSeconds;
    });

    const rankPosition = sorted.findIndex((e) => e.id === targetEntry.id) + 1;

    res.status(201).json({
      success: true,
      entry: targetEntry,
      rankPosition,
      totalParticipants: sorted.length,
    });
  });

  // Reset ranking and participants endpoint
  app.delete('/api/ranking', (req, res) => {
    const clearUsers = req.query.clearUsers !== 'false';
    rankingList = [];
    saveRankings(rankingList);

    if (clearUsers) {
      // Retain only the default administrator account
      usersList = usersList.filter((u) => u.role === 'admin' || u.email === 'admin@defensoria.rj.def.br');
      saveUsers(usersList);
    }

    res.json({
      success: true,
      message: clearUsers
        ? 'Toda a base de dados (ranking e contas de participantes) foi resetada com sucesso.'
        : 'Tabela de ranking limpa com sucesso.',
      usersCount: usersList.length,
      rankingsCount: rankingList.length,
    });
  });

  // ==========================================
  // ADMIN DASHBOARD & MANAGEMENT ROUTES
  // ==========================================

  // Admin Dashboard Overview
  app.get('/api/admin/dashboard', (req, res) => {
    const totalRankings = rankingList.length;
    const totalUsers = usersList.length;
    const sumScore = rankingList.reduce((acc, curr) => acc + curr.score, 0);
    const sumTime = rankingList.reduce((acc, curr) => acc + curr.timeSeconds, 0);
    const topScore = totalRankings > 0 ? Math.max(...rankingList.map((r) => r.score)) : 0;

    const sortedRankings = [...rankingList].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeSeconds - b.timeSeconds;
    });

    const safeUsers = usersList.map(sanitizeSafeUser);

    res.json({
      success: true,
      totalUsers,
      totalMatches: totalRankings,
      averageScore: totalRankings > 0 ? Math.round(sumScore / totalRankings) : 0,
      averageTimeSeconds: totalRankings > 0 ? Number((sumTime / totalRankings).toFixed(1)) : 0,
      topScore,
      rankings: sortedRankings,
      users: safeUsers,
    });
  });

  // Delete single ranking entry (Admin action)
  app.delete('/api/admin/ranking/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = rankingList.length;
    rankingList = rankingList.filter((r) => r.id !== id);
    if (rankingList.length === initialLength) {
      return res.status(404).json({ success: false, error: 'Registro não encontrado.' });
    }
    saveRankings(rankingList);
    res.json({ success: true, message: 'Registro de ranking removido com sucesso.' });
  });

  // Delete single user account (Admin action)
  app.delete('/api/admin/users/:id', (req, res) => {
    const { id } = req.params;
    const targetUser = usersList.find((u) => u.id === id);
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado.' });
    }
    if (targetUser.email === 'admin@defensoria.rj.def.br') {
      return res.status(403).json({ success: false, error: 'O Administrador principal não pode ser excluído.' });
    }
    usersList = usersList.filter((u) => u.id !== id);
    saveUsers(usersList);
    res.json({ success: true, message: 'Usuário removido com sucesso.' });
  });

  // Delete all non-admin participant users
  app.delete('/api/admin/users', (req, res) => {
    usersList = usersList.filter((u) => u.role === 'admin' || u.email === 'admin@defensoria.rj.def.br');
    saveUsers(usersList);
    res.json({ success: true, message: 'Todos os usuários participantes foram removidos com sucesso.' });
  });

  // Vite middleware for development vs Production static serving
  const isProduction = process.env.NODE_ENV === 'production' || !process.argv[1]?.endsWith('server.ts');
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Quiz ECA Digital - DPRJ Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
