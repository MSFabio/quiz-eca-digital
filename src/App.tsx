import { useState, useEffect } from 'react';
import Header from './components/Header';
import AuthScreen from './components/AuthScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import RankingScreen from './components/RankingScreen';
import AdminDashboardScreen from './components/AdminDashboardScreen';
import QuestionReviewModal from './components/QuestionReviewModal';
import { ScreenState, User, GameResult } from './types';
import { submitGameScore, getCurrentUser, logoutUser } from './utils/api';
import { soundManager } from './utils/audio';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('auth');
  const [lastGameResult, setLastGameResult] = useState<GameResult | null>(null);
  const [highlightRankingId, setHighlightRankingId] = useState<string | undefined>(undefined);
  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Restore session on mount
  useEffect(() => {
    const savedUser = getCurrentUser();
    if (savedUser) {
      setCurrentUser(savedUser);
      if (savedUser.role === 'admin') {
        setCurrentScreen('admin');
      } else {
        setCurrentScreen('quiz');
      }
    }
  }, []);

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setCurrentScreen('admin');
    } else {
      setCurrentScreen('quiz');
    }
  };

  const handleLogout = () => {
    soundManager.playClick();
    logoutUser();
    setCurrentUser(null);
    setCurrentScreen('auth');
    setLastGameResult(null);
  };

  const handleFinishQuiz = async (result: GameResult) => {
    try {
      const resp = await submitGameScore({
        name: result.userName,
        organization: result.organization,
        avatar: result.avatar,
        score: result.score,
        correctCount: result.correctCount,
        totalQuestions: result.totalQuestions,
        timeSeconds: result.totalTimeSeconds,
        userId: currentUser?.id,
      });

      if (resp && resp.rankPosition) {
        result.rankPosition = resp.rankPosition;
        setHighlightRankingId(resp.entry.id);
      }
    } catch {
      // offline handled gracefully
    }

    setLastGameResult(result);
    setCurrentScreen('result');
  };

  const handlePlayAgain = () => {
    setCurrentScreen('quiz');
  };

  const handleViewRanking = () => {
    setCurrentScreen('ranking');
  };

  const handleNavigate = (screen: ScreenState) => {
    setCurrentScreen(screen);
  };

  const handleOpenAdmin = () => {
    soundManager.playClick();
    setCurrentScreen('admin');
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#F4F7F5] text-gray-900 flex flex-col font-sans selection:bg-[#004A2F]/20 selection:text-[#004A2F]">
      {/* DPRJ Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        currentUser={currentUser}
        onOpenReview={() => setShowReviewModal(true)}
        onOpenAdmin={handleOpenAdmin}
        onLogout={handleLogout}
      />

      {/* Main Screen Container */}
      <main className="flex-1 flex flex-col justify-start">
        {/* 1. Auth Screen (Login / Register) */}
        {currentScreen === 'auth' && (
          <AuthScreen
            onAuthSuccess={handleAuthSuccess}
            onViewRanking={handleViewRanking}
          />
        )}

        {/* 2. Admin Dashboard */}
        {currentScreen === 'admin' && currentUser?.role === 'admin' && (
          <AdminDashboardScreen
            onBackToApp={() => setCurrentScreen('quiz')}
          />
        )}

        {/* 3. Quiz Screen */}
        {currentScreen === 'quiz' && currentUser && (
          <QuizScreen
            userProfile={currentUser}
            onFinishQuiz={handleFinishQuiz}
            onQuit={() => setCurrentScreen(currentUser.role === 'admin' ? 'admin' : 'auth')}
          />
        )}

        {/* 4. Result Screen */}
        {currentScreen === 'result' && lastGameResult && (
          <ResultScreen
            result={lastGameResult}
            onPlayAgain={handlePlayAgain}
            onViewRanking={handleViewRanking}
            onOpenReview={() => setShowReviewModal(true)}
          />
        )}

        {/* 5. Live Ranking Screen */}
        {currentScreen === 'ranking' && (
          <RankingScreen
            onBackToHome={() => setCurrentScreen(currentUser ? (currentUser.role === 'admin' ? 'admin' : 'quiz') : 'auth')}
            highlightEntryId={highlightRankingId}
          />
        )}
      </main>

      {/* Question Review Modal */}
      {showReviewModal && (
        <QuestionReviewModal
          result={lastGameResult}
          onClose={() => setShowReviewModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="py-4 border-t border-[#E2EAE5] bg-white text-center text-xs text-gray-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} Defensoria Pública do Estado do Rio de Janeiro • ECA Digital
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowReviewModal(true)}
              className="text-[#004A2F] hover:underline font-semibold cursor-pointer"
            >
              Gabarito das Questões
            </button>
            <span>•</span>
            <button
              onClick={() => setCurrentScreen('ranking')}
              className="text-[#004A2F] hover:underline font-semibold cursor-pointer"
            >
              Ver Classificação
            </button>
            {currentUser?.role === 'admin' && (
              <>
                <span>•</span>
                <button
                  onClick={handleOpenAdmin}
                  className="text-amber-700 hover:underline font-bold cursor-pointer"
                >
                  Painel Admin
                </button>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
