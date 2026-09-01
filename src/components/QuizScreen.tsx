import { useState, useEffect, useRef } from 'react';
import { Clock, Award, CheckCircle2, XCircle, ArrowRight, AlertCircle, RotateCcw } from 'lucide-react';
import { Question, UserAnswer, UserProfile, GameResult } from '../types';
import { QUIZ_QUESTIONS } from '../data/questions';
import { soundManager } from '../utils/audio';
import { safeStorage } from '../utils/storage';
import { submitGameScore } from '../utils/api';

interface QuizScreenProps {
  userProfile: UserProfile;
  onFinishQuiz: (result: GameResult) => void;
  onQuit: () => void;
}

export default function QuizScreen({
  userProfile,
  onFinishQuiz,
  onQuit,
}: QuizScreenProps) {
  const sessionKey = `dprj_quiz_session_${userProfile.id || userProfile.name}`;

  // Restore existing in-progress session if user previously answered questions
  const savedState = (() => {
    try {
      const raw = safeStorage.getItem(sessionKey);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return null;
  })();

  const [currentIndex, setCurrentIndex] = useState<number>(savedState?.currentIndex ?? 0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(savedState?.selectedOption ?? null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(savedState?.isAnswerSubmitted ?? false);
  const [totalScore, setTotalScore] = useState<number>(savedState?.totalScore ?? 0);
  const [lastEarnedPoints, setLastEarnedPoints] = useState<number>(savedState?.lastEarnedPoints ?? 0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>(savedState?.userAnswers ?? []);

  // Timers
  const [gameStartTime] = useState<number>(savedState?.gameStartTime ?? Date.now());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [totalElapsed, setTotalElapsed] = useState<number>(0);

  const totalQuestions = QUIZ_QUESTIONS.length;
  const currentQuestion: Question = QUIZ_QUESTIONS[currentIndex] || QUIZ_QUESTIONS[0];

  // Stopwatch interval
  useEffect(() => {
    const timer = setInterval(() => {
      setTotalElapsed((Date.now() - gameStartTime) / 1000);
    }, 200);
    return () => clearInterval(timer);
  }, [gameStartTime]);

  // Persist session state whenever question or score changes
  useEffect(() => {
    try {
      safeStorage.setItem(
        sessionKey,
        JSON.stringify({
          currentIndex,
          selectedOption,
          isAnswerSubmitted,
          totalScore,
          lastEarnedPoints,
          userAnswers,
          gameStartTime,
        })
      );
    } catch (err) {
      console.warn('Could not save quiz session:', err);
    }
  }, [currentIndex, selectedOption, isAnswerSubmitted, totalScore, lastEarnedPoints, userAnswers, gameStartTime, sessionKey]);

  // Reset per-question state when moving forward
  const handleResetForNextQuestion = (nextIndex: number) => {
    setCurrentIndex(nextIndex);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setLastEarnedPoints(0);
    setQuestionStartTime(Date.now());
  };

  const handleSelectOption = (optionKey: 'A' | 'B' | 'C' | 'D') => {
    if (isAnswerSubmitted) return;

    soundManager.playClick();
    setSelectedOption(optionKey);
    setIsAnswerSubmitted(true);

    const isCorrect = optionKey === currentQuestion.correctAnswer;
    const timeSpent = Math.max(0.5, (Date.now() - questionStartTime) / 1000);

    // Score calculation:
    // Base 100 pts if correct
    // Speed bonus: up to 50 pts if answered under 15 seconds
    let points = 0;
    if (isCorrect) {
      soundManager.playCorrect();
      const speedBonus = Math.max(0, Math.round(50 * (1 - Math.min(1, timeSpent / 15))));
      points = 100 + speedBonus;
    } else {
      soundManager.playWrong();
    }

    setLastEarnedPoints(points);
    const newTotalScore = totalScore + points;
    setTotalScore(newTotalScore);

    const answerRecord: UserAnswer = {
      questionId: currentQuestion.id,
      selectedOption: optionKey,
      isCorrect,
      timeSpentSeconds: Number(timeSpent.toFixed(1)),
      pointsEarned: points,
    };

    const updatedAnswers = [...userAnswers, answerRecord];
    setUserAnswers(updatedAnswers);

    // Live update to server ranking in background (so participant immediately appears with live points)
    const correctCount = updatedAnswers.filter((a) => a.isCorrect).length;
    const currentTotalTime = (Date.now() - gameStartTime) / 1000;
    submitGameScore({
      name: userProfile.name,
      organization: userProfile.organization,
      avatar: userProfile.avatar,
      score: newTotalScore,
      correctCount,
      totalQuestions,
      timeSeconds: Number(currentTotalTime.toFixed(1)),
      userId: userProfile.id,
    }).catch(() => {});
  };

  const handleNextQuestion = () => {
    soundManager.playClick();
    if (currentIndex + 1 < totalQuestions) {
      handleResetForNextQuestion(currentIndex + 1);
    } else {
      // Quiz Completed: Clean up session and trigger finish
      safeStorage.removeItem(sessionKey);
      const finalTotalTime = (Date.now() - gameStartTime) / 1000;
      const correctAnswersCount = userAnswers.filter((a) => a.isCorrect).length;

      const finalResult: GameResult = {
        id: 'res-' + Date.now(),
        userName: userProfile.name,
        organization: userProfile.organization,
        avatar: userProfile.avatar,
        score: totalScore,
        correctCount: correctAnswersCount,
        totalQuestions: totalQuestions,
        totalTimeSeconds: Number(finalTotalTime.toFixed(1)),
        answers: userAnswers,
        createdAt: new Date().toISOString(),
      };

      onFinishQuiz(finalResult);
    }
  };

  const handleQuitQuiz = () => {
    soundManager.playClick();
    safeStorage.removeItem(sessionKey);
    onQuit();
  };

  // Format time helper (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((currentIndex + (isAnswerSubmitted ? 1 : 0)) / totalQuestions) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto py-4 sm:py-8 px-3 sm:px-4">
      {/* Top Status & Controls Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#E2EAE5] mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          {/* Player & Progress */}
          <div className="flex items-center gap-3">
            <div className="text-2xl sm:text-3xl bg-emerald-50 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border border-[#E2EAE5]">
              {userProfile.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 text-sm sm:text-base">
                  {userProfile.name}
                </span>
                <span className="text-[11px] bg-emerald-100/70 text-[#004A2F] px-2.5 py-0.5 rounded-full font-bold">
                  Questão {currentIndex + 1} de {totalQuestions}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {userProfile.organization || 'Defensoria Pública do RJ'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Live Stopwatch */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-mono font-bold text-gray-700">
              <Clock className="w-4 h-4 text-[#004A2F]" />
              <span>{formatTime(totalElapsed)}</span>
            </div>

            {/* Score */}
            <div className="flex items-center gap-1.5 bg-[#004A2F] text-white px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm">
              <Award className="w-4 h-4 text-[#C8A355]" />
              <span>{totalScore} pts</span>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#004A2F] via-[#006E45] to-[#C8A355] h-full transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-md border border-[#E2EAE5] mb-6">
        {/* Topic Tag */}
        <div className="mb-3">
          <span className="inline-block bg-emerald-50 border border-emerald-200 text-[#004A2F] font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
            {currentQuestion.topic}
          </span>
        </div>

        {/* Question Title & Scenario */}
        <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900 mb-4 leading-snug">
          {currentQuestion.title}
        </h2>

        <div className="bg-[#f8faf9] border-l-4 border-[#004A2F] p-4 sm:p-5 rounded-r-xl mb-6 text-gray-800 text-sm sm:text-base leading-relaxed">
          {currentQuestion.scenario}
        </div>

        {/* Options List */}
        <div className="space-y-3 sm:space-y-3.5">
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedOption === opt.id;
            const isCorrectAnswer = opt.id === currentQuestion.correctAnswer;

            let btnStyle = 'border-gray-200 hover:border-[#004A2F]/40 hover:bg-emerald-50/40 bg-white text-gray-800';
            let badgeStyle = 'bg-gray-100 text-gray-700 border-gray-300';

            if (isAnswerSubmitted) {
              if (isCorrectAnswer) {
                btnStyle = 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/40 font-semibold';
                badgeStyle = 'bg-[#004A2F] text-white border-[#004A2F]';
              } else if (isSelected && !isCorrectAnswer) {
                btnStyle = 'border-red-400 bg-red-50 text-red-950 ring-2 ring-red-400/40';
                badgeStyle = 'bg-red-600 text-white border-red-600';
              } else {
                btnStyle = 'border-gray-200 bg-gray-50/60 text-gray-400 opacity-60';
                badgeStyle = 'bg-gray-200 text-gray-400 border-gray-200';
              }
            }

            return (
              <button
                key={opt.id}
                type="button"
                id={`btn-option-${opt.id}`}
                disabled={isAnswerSubmitted}
                onClick={() => handleSelectOption(opt.id)}
                className={`w-full p-4 rounded-xl border-2 text-left flex items-start gap-3.5 sm:gap-4 transition duration-150 transform active:scale-[0.99] cursor-pointer touch-manipulation ${btnStyle}`}
              >
                {/* Option Letter Badge */}
                <span
                  className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border transition ${badgeStyle}`}
                >
                  {opt.id}
                </span>

                {/* Option Text */}
                <span className="text-sm sm:text-base leading-relaxed pt-0.5 flex-1">
                  {opt.text}
                </span>

                {/* Status Indicator Icon when answered */}
                {isAnswerSubmitted && isCorrectAnswer && (
                  <CheckCircle2 className="w-5 h-5 text-[#004A2F] shrink-0 mt-0.5" />
                )}
                {isAnswerSubmitted && isSelected && !isCorrectAnswer && (
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Pedagogical Feedback Card (shown after answer) */}
        {isAnswerSubmitted && (
          <div className="mt-6 pt-6 border-t border-gray-200 animate-fadeIn">
            <div
              className={`p-4 sm:p-5 rounded-xl border ${
                selectedOption === currentQuestion.correctAnswer
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                  : 'bg-[#FBF7EE] border-[#E9DCB8] text-amber-950'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm sm:text-base mb-1.5">
                {selectedOption === currentQuestion.correctAnswer ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-[#004A2F]" />
                    <span>Resposta Correta! (+{lastEarnedPoints} pts)</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-[#C8A355]" />
                    <span>A resposta correta era a Letra {currentQuestion.correctAnswer}</span>
                  </>
                )}
              </div>

              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed pl-7">
                <strong>Fundamento DPRJ / ECA Digital:</strong> {currentQuestion.explanation}
              </p>
            </div>

            {/* Next Button */}
            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={handleQuitQuiz}
                className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 font-medium px-3 py-2 cursor-pointer"
              >
                Encerrar Quiz
              </button>

              <button
                id="btn-next-question"
                type="button"
                onClick={handleNextQuestion}
                className="py-3 px-6 rounded-xl bg-[#004A2F] hover:bg-[#003823] active:bg-[#002619] text-white font-bold text-sm sm:text-base flex items-center gap-2 shadow-md shadow-emerald-950/20 transition cursor-pointer touch-manipulation"
              >
                <span>
                  {currentIndex + 1 === totalQuestions ? 'Ver Resultado Final' : 'Próxima Questão'}
                </span>
                <ArrowRight className="w-4 h-4 text-[#C8A355]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
