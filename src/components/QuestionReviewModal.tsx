import { CheckCircle2, XCircle, X, BookOpen, AlertCircle } from 'lucide-react';
import { GameResult } from '../types';
import { QUIZ_QUESTIONS } from '../data/questions';

interface QuestionReviewModalProps {
  result?: GameResult | null;
  onClose: () => void;
}

export default function QuestionReviewModal({
  result,
  onClose,
}: QuestionReviewModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] shadow-2xl border border-gray-200 flex flex-col my-auto overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-[#004A2F] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-[#C8A355]" />
            <div>
              <h2 className="font-extrabold text-sm sm:text-lg">
                Gabarito Comentado — ECA Digital
              </h2>
              <p className="text-[11px] sm:text-xs text-emerald-100">
                10 Questões Oficiais com Fundamentação da Defensoria Pública do RJ
              </p>
            </div>
          </div>
          <button
            id="btn-close-review-modal"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {QUIZ_QUESTIONS.map((q) => {
            const userAnswer = result?.answers.find((a) => a.questionId === q.id);
            const isAnswered = !!userAnswer;
            const isCorrect = userAnswer?.isCorrect;

            return (
              <div
                key={q.id}
                className="bg-gray-50/70 border border-[#E2EAE5] rounded-2xl p-4 sm:p-5"
              >
                {/* Topic & Status Tag */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] bg-emerald-100/80 text-[#004A2F] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {q.topic}
                  </span>

                  {isAnswered && (
                    <div className="flex items-center gap-1 text-xs font-bold">
                      {isCorrect ? (
                        <span className="text-[#004A2F] flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-[#004A2F]" />
                          Você acertou (+{userAnswer.pointsEarned} pts)
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-1">
                          <XCircle className="w-4 h-4" />
                          Sua resposta: {userAnswer.selectedOption}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Title & Scenario */}
                <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-2">
                  {q.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 mb-4 bg-white p-3 rounded-xl border border-gray-200 leading-relaxed">
                  {q.scenario}
                </p>

                {/* Options List */}
                <div className="space-y-2 mb-4">
                  {q.options.map((opt) => {
                    const isRightAnswer = opt.id === q.correctAnswer;
                    const isUserChoice = userAnswer?.selectedOption === opt.id;

                    let optClass = 'bg-white border-gray-200 text-gray-700';
                    if (isRightAnswer) {
                      optClass = 'bg-emerald-50 border-emerald-600 text-emerald-950 font-semibold ring-1 ring-emerald-500/30';
                    } else if (isUserChoice && !isRightAnswer) {
                      optClass = 'bg-red-50 border-red-300 text-red-900 line-through';
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`p-2.5 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 ${optClass}`}
                      >
                        <span
                          className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] shrink-0 ${
                            isRightAnswer
                              ? 'bg-[#004A2F] text-white'
                              : isUserChoice
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {opt.id}
                        </span>
                        <span className="leading-snug">{opt.text}</span>
                        {isRightAnswer && (
                          <span className="ml-auto text-[11px] font-bold text-[#004A2F] shrink-0">
                            Gabarito Oficial
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="bg-emerald-50/70 border-l-3 border-[#004A2F] p-3 rounded-r-xl text-xs text-gray-800 leading-relaxed">
                  <span className="font-bold text-[#004A2F] block mb-0.5">
                    Fundamentação Legal / Pedagógica:
                  </span>
                  {q.explanation}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-100 border-t border-gray-200 text-right shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#004A2F] hover:bg-[#003823] text-white rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer"
          >
            Fechar Gabarito
          </button>
        </div>
      </div>
    </div>
  );
}
