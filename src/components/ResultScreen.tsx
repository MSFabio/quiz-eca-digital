import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  Share2,
  Check,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { GameResult } from '../types';
import { soundManager } from '../utils/audio';

interface ResultScreenProps {
  result: GameResult;
  onPlayAgain: () => void;
  onViewRanking: () => void;
  onOpenReview: () => void;
}

export default function ResultScreen({
  result,
  onPlayAgain,
  onViewRanking,
  onOpenReview,
}: ResultScreenProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Play celebratory fanfare
    soundManager.playVictory();

    // Trigger confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#004A2F', '#C8A355', '#10B981', '#ffffff'],
      });
    } catch {
      // ignore
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds % 1) * 10);
    return `${mins}m ${secs.toString().padStart(2, '0')}.${tenths}s`;
  };

  const accuracyPercent = Math.round((result.correctCount / result.totalQuestions) * 100);

  const getRankBadgeText = (pos?: number) => {
    if (!pos) return 'Classificado!';
    if (pos === 1) return '🥇 1º Lugar Geral';
    if (pos === 2) return '🥈 2º Lugar Geral';
    if (pos === 3) return '🥉 3º Lugar Geral';
    return `🏆 ${pos}ª Posição no Ranking`;
  };

  const getPerformanceMessage = (correct: number, total: number) => {
    const ratio = correct / total;
    if (ratio === 1) return 'Desempenho Perfeito! Especialista no ECA Digital.';
    if (ratio >= 0.8) return 'Excelente resultado! Ótimo domínio das salvaguardas digitais.';
    if (ratio >= 0.6) return 'Muito bom! Você compreende os princípios essenciais da proteção digital.';
    return 'Bom esforço! O ECA Digital é fundamental para a proteção de crianças e adolescentes.';
  };

  const handleShare = () => {
    soundManager.playClick();
    const shareText = `🎯 Participei do Quiz ECA Digital da Defensoria Pública do Rio de Janeiro!\n🏆 Pontuação: ${result.score} pts\n⏱️ Tempo: ${formatTime(result.totalTimeSeconds)}\n✅ Acertos: ${result.correctCount}/${result.totalQuestions} (${accuracyPercent}%)\n🏅 Posição: ${result.rankPosition ? `${result.rankPosition}º Lugar` : 'Classificado'}\n#DefensoriaRJ #ECADigital #DireitosDigitais`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-6 sm:py-10 px-4">
      {/* Main Result Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-[#E2EAE5] overflow-hidden mb-6">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-[#004A2F] via-[#003B26] to-[#002619] text-white p-6 sm:p-8 text-center relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#003823]/90 border border-[#C8A355]/40 rounded-full text-xs font-semibold text-[#C8A355] mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Defensoria Pública do Estado do Rio de Janeiro
          </div>

          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-2xl mx-auto flex items-center justify-center text-3xl sm:text-4xl border border-white/20 mb-3 backdrop-blur-sm shadow-inner">
            {result.avatar}
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold text-white">
            Parabéns, {result.userName}!
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100 max-w-md mx-auto mt-1">
            {result.organization} • {getPerformanceMessage(result.correctCount, result.totalQuestions)}
          </p>

          {/* Ranking Badge if available */}
          {result.rankPosition && (
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 bg-[#C8A355] text-slate-950 font-extrabold text-xs sm:text-sm rounded-full shadow-md">
              <span>{getRankBadgeText(result.rankPosition)}</span>
            </div>
          )}
        </div>

        {/* Primary Metrics Highlights */}
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-8">
            {/* Score Highlight */}
            <div className="bg-gradient-to-br from-emerald-50 to-[#e0f2e8] border-2 border-emerald-300/80 rounded-2xl p-4 sm:p-6 text-center">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#004A2F] block mb-1">
                Pontuação Final
              </span>
              <div className="flex items-center justify-center gap-1 text-3xl sm:text-5xl font-black text-[#004A2F]">
                <Award className="w-7 h-7 sm:w-10 sm:h-10 text-[#C8A355] shrink-0" />
                <span>{result.score}</span>
              </div>
              <span className="text-[11px] sm:text-xs text-[#004A2F]/80 font-semibold mt-1 block">
                pontos conquistados
              </span>
            </div>

            {/* Time Highlight */}
            <div className="bg-gradient-to-br from-[#FBF7EE] to-[#F5EBCE] border-2 border-[#E5C378] rounded-2xl p-4 sm:p-6 text-center">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-950 block mb-1">
                Tempo Decorrido
              </span>
              <div className="flex items-center justify-center gap-1 text-3xl sm:text-5xl font-black text-amber-950 font-mono">
                <Clock className="w-7 h-7 sm:w-10 sm:h-10 text-[#C8A355] shrink-0" />
                <span>{formatTime(result.totalTimeSeconds)}</span>
              </div>
              <span className="text-[11px] sm:text-xs text-amber-900 font-semibold mt-1 block">
                cronômetro oficial
              </span>
            </div>
          </div>

          {/* Detailed Statistics Row */}
          <div className="grid grid-cols-3 gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center mb-8">
            <div>
              <span className="text-[11px] sm:text-xs text-gray-500 font-medium block">
                Acertos
              </span>
              <div className="flex items-center justify-center gap-1 text-base sm:text-xl font-bold text-gray-900 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-[#004A2F]" />
                <span>{result.correctCount} / {result.totalQuestions}</span>
              </div>
            </div>

            <div className="border-x border-gray-200">
              <span className="text-[11px] sm:text-xs text-gray-500 font-medium block">
                Aproveitamento
              </span>
              <span className="text-base sm:text-xl font-bold text-[#004A2F] mt-0.5 block">
                {accuracyPercent}%
              </span>
            </div>

            <div>
              <span className="text-[11px] sm:text-xs text-gray-500 font-medium block">
                Tempo Médio / Q
              </span>
              <span className="text-base sm:text-xl font-bold text-gray-900 mt-0.5 block font-mono">
                {(result.totalTimeSeconds / result.totalQuestions).toFixed(1)}s
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* View Real-Time Ranking */}
            <button
              id="btn-result-view-ranking"
              onClick={() => {
                soundManager.playClick();
                onViewRanking();
              }}
              className="w-full py-4 px-6 rounded-xl bg-[#004A2F] hover:bg-[#003823] active:bg-[#002619] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-emerald-950/20 transition cursor-pointer"
            >
              <Trophy className="w-5 h-5 text-[#C8A355]" />
              Ver Classificação no Ranking Geral
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Review Questions & Answers */}
            <button
              id="btn-result-review-answers"
              onClick={() => {
                soundManager.playClick();
                onOpenReview();
              }}
              className="w-full py-3 px-6 rounded-xl bg-emerald-50/80 hover:bg-emerald-100/90 text-[#004A2F] border border-emerald-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#004A2F]" />
              Revisar as 10 Perguntas e Respostas
            </button>

            {/* Bottom Actions Row */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                id="btn-result-share"
                onClick={handleShare}
                className="py-3 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#004A2F]" />
                    <span className="text-[#004A2F]">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-gray-500" />
                    <span>Compartilhar</span>
                  </>
                )}
              </button>

              <button
                id="btn-result-play-again"
                onClick={() => {
                  soundManager.playClick();
                  onPlayAgain();
                }}
                className="py-3 px-4 rounded-xl border border-[#004A2F] text-[#004A2F] hover:bg-emerald-50 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-[#004A2F]" />
                <span>Novo Jogo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
