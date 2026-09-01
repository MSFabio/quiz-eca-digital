import React from 'react';
import { BarChart3, CheckCircle2, HelpCircle } from 'lucide-react';
import { QuestionStat } from '../types';

interface QuestionStatsViewProps {
  questionStats: QuestionStat[];
}

export default function QuestionStatsView({ questionStats }: QuestionStatsViewProps) {
  const totalAnswersRecorded = questionStats.reduce((acc, curr) => acc + curr.totalResponses, 0);
  const avgAccuracy = questionStats.length > 0
    ? Math.round(questionStats.reduce((acc, curr) => acc + curr.accuracyPercentage, 0) / questionStats.length)
    : 0;
  const bestQuestion = [...questionStats].sort((a, b) => b.accuracyPercentage - a.accuracyPercentage)[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Overview KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#E2EAE5] shadow-xs text-center">
          <span className="text-xs text-gray-500 font-semibold block mb-1">Questões no Quiz</span>
          <span className="text-2xl font-black text-[#004A2F]">10</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2EAE5] shadow-xs text-center">
          <span className="text-xs text-gray-500 font-semibold block mb-1">Respostas Computadas</span>
          <span className="text-2xl font-black text-gray-900">{totalAnswersRecorded}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2EAE5] shadow-xs text-center">
          <span className="text-xs text-gray-500 font-semibold block mb-1">Taxa Média de Acerto</span>
          <span className="text-2xl font-black text-[#C8A355]">{avgAccuracy}%</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2EAE5] shadow-xs text-center">
          <span className="text-xs text-gray-500 font-semibold block mb-1">Maior Taxa de Acerto</span>
          <span className="text-2xl font-black text-emerald-700">
            {bestQuestion ? `Q${bestQuestion.number} (${bestQuestion.accuracyPercentage}%)` : '—'}
          </span>
        </div>
      </div>

      {/* Helper Notice */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center gap-3">
        <BarChart3 className="w-5 h-5 text-[#004A2F] shrink-0" />
        <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
          <strong>Métricas Pedagógicas Ao Vivo:</strong> Veja abaixo a porcentagem e o quantitativo de participantes que responderam a cada alternativa (A, B, C, D) nas 10 perguntas do ECA Digital.
        </p>
      </div>

      {/* List of 10 Questions and Distribution */}
      {questionStats.map((q) => (
        <div
          key={q.questionId}
          className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-[#E2EAE5]"
        >
          {/* Question Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="bg-emerald-50 border border-emerald-200 text-[#004A2F] font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              Questão {q.number} • {q.topic}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">
                {q.totalResponses} {q.totalResponses === 1 ? 'resposta registrada' : 'respostas registradas'}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                  q.accuracyPercentage >= 70
                    ? 'bg-emerald-100 text-emerald-800'
                    : q.accuracyPercentage >= 40
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {q.accuracyPercentage}% de acertos
              </span>
            </div>
          </div>

          {/* Title & Scenario */}
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 leading-snug">
            {q.title}
          </h3>
          <div className="bg-[#f8faf9] border-l-4 border-[#004A2F] p-3.5 sm:p-4 rounded-r-xl mb-5 text-gray-700 text-xs sm:text-sm leading-relaxed">
            {q.scenario}
          </div>

          {/* Alternatives Distribution (A, B, C, D) */}
          <div className="space-y-3 mb-5">
            {q.options.map((opt) => {
              const isGabarito = opt.isCorrect;
              return (
                <div
                  key={opt.optionId}
                  className={`p-3.5 sm:p-4 rounded-xl border transition ${
                    isGabarito
                      ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/30'
                      : 'bg-gray-50/60 border-gray-200'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div className="flex items-start gap-2.5 flex-1 min-w-[200px]">
                      <span
                        translate="no"
                        className={`notranslate shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs border ${
                          isGabarito
                            ? 'bg-[#004A2F] text-white border-[#004A2F]'
                            : 'bg-white text-gray-700 border-gray-300'
                        }`}
                      >
                        {opt.optionId}
                      </span>
                      <p className="text-xs sm:text-sm text-gray-800 leading-snug pt-0.5">
                        {opt.text}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isGabarito && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-[#004A2F] px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-[#004A2F]" />
                          Gabarito Oficial
                        </span>
                      )}
                      <div className="text-right">
                        <span className="font-extrabold text-sm sm:text-base text-gray-900">
                          {opt.percentage}%
                        </span>
                        <span className="text-[11px] text-gray-500 ml-1">
                          ({opt.count} {opt.count === 1 ? 'voto' : 'votos'})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Percentage Bar */}
                  <div className="w-full bg-gray-200/80 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isGabarito
                          ? 'bg-gradient-to-r from-[#004A2F] to-[#007A4D]'
                          : 'bg-gradient-to-r from-gray-400 to-gray-500'
                      }`}
                      style={{ width: `${opt.percentage}%` }}
                    />
                  </div>

                  {/* Exibição textual direta solicitada */}
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-gray-600">
                    <span>
                      Alternativa <strong translate="no" className="notranslate">{opt.optionId}</strong> — {opt.percentage}% dos participantes responderam a essa pergunta ({opt.count} {opt.count === 1 ? 'participante' : 'participantes'})
                    </span>
                    {isGabarito && (
                      <span className="sm:hidden text-emerald-800 font-bold">
                        ★ Resposta Correta
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fundamentação Pedagógica ECA Digital */}
          <div className="p-3.5 bg-[#FBF7EE] border border-[#E9DCB8] rounded-xl text-xs sm:text-sm text-amber-950 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold mb-1 text-amber-900">
              <HelpCircle className="w-4 h-4 text-[#C8A355]" />
              <span>Fundamentação Institucional DPRJ:</span>
            </div>
            <p className="text-gray-700 pl-5">
              {q.explanation}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
