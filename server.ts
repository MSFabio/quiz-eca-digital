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

function saveRankings(data: RankingEntry[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving ranking data:', err);
  }
}

let rankingList: RankingEntry[] = loadRankings();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
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

  // Add new match result
  app.post('/api/ranking', (req, res) => {
    const { name, organization, avatar, score, correctCount, totalQuestions, timeSeconds } = req.body;

    if (!name || score === undefined || timeSeconds === undefined) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    const newEntry: RankingEntry = {
      id: 'entry-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name: String(name).trim().substring(0, 40),
      organization: organization ? String(organization).trim().substring(0, 50) : 'Geral',
      avatar: avatar || '⭐',
      score: Number(score),
      correctCount: Number(correctCount || 0),
      totalQuestions: Number(totalQuestions || 10),
      timeSeconds: Number(timeSeconds),
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
