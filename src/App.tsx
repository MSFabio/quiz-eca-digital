import { useState } from 'react';
import Header from './components/Header';
import RegistrationScreen from './components/RegistrationScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import RankingScreen from './components/RankingScreen';
import QuestionReviewModal from './components/QuestionReviewModal';
import { ScreenState, UserProfile, GameResult } from './types';
import { submitGameScore } from './utils/api';
import { soundManager } from './utils/audio';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('register');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [lastGameResult, setLastGameResult] = useState<GameResult | null>(null);
  const [highlightRankingId, setHighlightRankingId] = useState<string | undefined>(undefined);
  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());
  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleStartQuiz = (profile: UserProfile) => {
    setCurrentUser(profile);
    setCurrentScreen('quiz');
  };

  const handleFinishQuiz = async (result: GameResult) => {
    // Submit to real-time server ranking
    try {
      const resp = await submitGameScore({
        name: result.userName,
        organization: result.organization,
        avatar: result.avatar,
        score: result.score,
        correctCount: result.correctCount,
        totalQuestions: result.totalQuestions,
        timeSeconds: result.totalTimeSeconds,
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

  return (
    <div className="min-h-screen bg-[#F4F7F5] text-gray-900 flex flex-col font-sans selection:bg-[#004A2F]/20 selection:text-[#004A2F]">
      {/* DPRJ Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        currentUser={currentUser}
        onOpenReview={() => setShowReviewModal(true)}
      />

      {/* Main Screen Container */}
      <main className="flex-1 flex flex-col justify-start">
        {currentScreen === 'register' && (
          <RegistrationScreen
            onStartQuiz={handleStartQuiz}
            onViewRanking={handleViewRanking}
          />
        )}

        {currentScreen === 'quiz' && currentUser && (
          <QuizScreen
            userProfile={currentUser}
            onFinishQuiz={handleFinishQuiz}
            onQuit={() => setCurrentScreen('register')}
          />
        )}

        {currentScreen === 'result' && lastGameResult && (
          <ResultScreen
            result={lastGameResult}
            onPlayAgain={handlePlayAgain}
            onViewRanking={handleViewRanking}
            onOpenReview={() => setShowReviewModal(true)}
          />
        )}

        {currentScreen === 'ranking' && (
          <RankingScreen
            onBackToHome={() => setCurrentScreen('register')}
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

      {/* Subtle Footer */}
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
          </div>
        </div>
      </footer>
    </div>
  );
}
