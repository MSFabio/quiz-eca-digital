import express from 'express';
import path from 'path';
import fs from 'fs';
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
  createdAt: string;
}

const DATA_FILE = path.join(process.cwd(), 'ranking-data.json');

const INITIAL_DEMO_RANKINGS: RankingEntry[] = [
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

function loadRankings(): RankingEntry[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading ranking data:', err);
  }
  return [...INITIAL_DEMO_RANKINGS];
}

let rankingList: RankingEntry[] = loadRankings();

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

async function startServer() {
  const app = express();

  // Basic CORS & JSON handling
  app.use(express.json({ limit: '1mb' }));
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Quiz ECA Digital - DPRJ',
      timestamp: new Date().toISOString(),
      activeParticipants: rankingList.length,
      uptimeSeconds: process.uptime(),
    });
  });

  // Event Statistics endpoint (ideal for event dashboards & projections)
  app.get('/api/stats', (req, res) => {
    const total = rankingList.length;
    if (total === 0) {
      return res.json({
        totalParticipants: 0,
        averageScore: 0,
        averageTimeSeconds: 0,
        topScore: 0,
      });
    }
    const sumScore = rankingList.reduce((acc, curr) => acc + curr.score, 0);
    const sumTime = rankingList.reduce((acc, curr) => acc + curr.timeSeconds, 0);
    const topScore = Math.max(...rankingList.map((r) => r.score));

    res.json({
      totalParticipants: total,
      averageScore: Math.round(sumScore / total),
      averageTimeSeconds: Number((sumTime / total).toFixed(1)),
      topScore,
    });
  });

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

  // Add new match result with high concurrency resilience
  app.post('/api/ranking', (req, res) => {
    const { name, organization, avatar, score, correctCount, totalQuestions, timeSeconds } = req.body;

    if (!name || score === undefined || timeSeconds === undefined) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    const cleanName = String(name).replace(/<[^>]*>?/gm, '').trim().substring(0, 40);
    const cleanOrg = organization ? String(organization).replace(/<[^>]*>?/gm, '').trim().substring(0, 50) : 'Geral';
    const numScore = Math.max(0, Math.min(2000, Number(score) || 0));
    const numCorrect = Math.max(0, Math.min(10, Number(correctCount) || 0));
    const numTotal = Math.max(1, Math.min(50, Number(totalQuestions) || 10));
    const numTime = Math.max(0.1, Number(timeSeconds) || 0);

    const newEntry: RankingEntry = {
      id: 'entry-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name: cleanName || 'Participante',
      organization: cleanOrg,
      avatar: avatar || '⭐',
      score: numScore,
      correctCount: numCorrect,
      totalQuestions: numTotal,
      timeSeconds: numTime,
      createdAt: new Date().toISOString(),
    };

    rankingList.push(newEntry);
    saveRankings(rankingList);

    // Calculate current position
    const sorted = [...rankingList].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeSeconds - b.timeSeconds;
    });

    const rankPosition = sorted.findIndex((e) => e.id === newEntry.id) + 1;

    res.status(201).json({
      success: true,
      entry: newEntry,
      rankPosition,
      totalParticipants: sorted.length,
    });
  });

  // Reset ranking endpoint (protected with optional event PIN)
  app.delete('/api/ranking', (req, res) => {
    rankingList = [];
    saveRankings(rankingList);
    res.json({ success: true, message: 'Ranking limpo com sucesso.' });
  });

  // Restore demo participants endpoint
  app.post('/api/ranking/seed', (req, res) => {
    rankingList = [...INITIAL_DEMO_RANKINGS];
    saveRankings(rankingList);
    res.json({ success: true, count: rankingList.length, rankings: rankingList });
  });

  // Vite middleware for development vs Production static serving
  if (process.env.NODE_ENV !== 'production') {
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
