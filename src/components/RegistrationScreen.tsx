import { useState, FormEvent } from 'react';
import { Play, Sparkles, Trophy, Clock, ShieldCheck, HelpCircle, Users } from 'lucide-react';
import { UserProfile } from '../types';
import { soundManager } from '../utils/audio';

const AVATAR_OPTIONS = [
  '👩‍⚖️', '👨‍⚖️', '👩‍💻', '👨‍💻', '👩‍🎓', '👨‍🎓',
  '🕵️‍♀️', '🕵️‍♂️', '🛡️', '⚖️', '🎯', '🚀',
];

interface RegistrationScreenProps {
  onStartQuiz: (profile: UserProfile) => void;
  onViewRanking: () => void;
}

export default function RegistrationScreen({
  onStartQuiz,
  onViewRanking,
}: RegistrationScreenProps) {
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe seu nome ou apelido para participar.');
      soundManager.playWrong();
      return;
    }

    soundManager.playClick();
    onStartQuiz({
      name: name.trim(),
      organization: organization.trim() || 'Participante do Evento',
      avatar: selectedAvatar,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-10 px-4">
      {/* Banner Card */}
      <div className="bg-gradient-to-br from-[#004A2F] via-[#003B26] to-[#002619] rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden border border-[#005B3A]">
        {/* Subtle decorative glow */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-[#004A2F]/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-24 -top-12 w-40 h-40 bg-[#C8A355]/15 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#003823]/90 border border-[#C8A355]/40 rounded-full text-xs font-semibold text-[#C8A355] mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C8A355]" />
            Defensoria Pública do Estado do Rio de Janeiro
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 text-white">
            Quiz <span className="text-[#C8A355]">ECA Digital</span>
          </h1>

          <p className="text-sm sm:text-base text-emerald-100 max-w-2xl leading-relaxed">
            Descubra e aprofunde seus conhecimentos sobre os direitos de crianças e adolescentes no ambiente digital!
            Privacidade, inteligência artificial, publicidade velada, sharenting e trabalho infantil na internet.
          </p>

          {/* Key Feature Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-emerald-800/60">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-emerald-100">
              <div className="p-2 bg-[#003823] border border-[#C8A355]/30 rounded-lg text-[#C8A355]">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white block">10 Perguntas</span>
                <span className="text-[11px] text-emerald-200">Casos práticos reais</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-emerald-100">
              <div className="p-2 bg-[#003823] border border-[#C8A355]/30 rounded-lg text-[#C8A355]">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white block">Tempo Real</span>
                <span className="text-[11px] text-emerald-200">Bônus por agilidade</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-emerald-100 col-span-2 sm:col-span-1">
              <div className="p-2 bg-[#003823] border border-[#C8A355]/30 rounded-lg text-[#C8A355]">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white block">Ranking Geral</span>
                <span className="text-[11px] text-emerald-200">Pódio do Evento</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form & Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Registration Form Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#E2EAE5]">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#E2EAE5]">
            <Users className="w-5 h-5 text-[#004A2F]" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Cadastro de Participante
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div>
              <label
                htmlFor="input-player-name"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"
              >
                Nome ou Apelido <span className="text-red-500">*</span>
              </label>
              <input
                id="input-player-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Ex: Ana Silva ou Lucas"
                maxLength={40}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#004A2F] focus:ring-2 focus:ring-[#004A2F]/20 text-gray-900 placeholder-gray-400 text-sm sm:text-base outline-none transition"
              />
              {error && (
                <p className="text-xs text-red-600 font-medium mt-1.5">{error}</p>
              )}
            </div>

            {/* Organization / School / Role */}
            <div>
              <label
                htmlFor="input-player-org"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"
              >
                Instituição / Escola / Área (Opcional)
              </label>
              <input
                id="input-player-org"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Ex: Colégio Estadual, Defensoria, UERJ..."
                maxLength={50}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#004A2F] focus:ring-2 focus:ring-[#004A2F]/20 text-gray-900 placeholder-gray-400 text-sm sm:text-base outline-none transition"
              />
            </div>

            {/* Avatar Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Escolha seu Avatar
              </label>
              <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av}
                    id={`btn-avatar-${av}`}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(av);
                      soundManager.playClick();
                    }}
                    className={`h-12 flex items-center justify-center text-2xl rounded-xl border-2 transition transform active:scale-95 cursor-pointer ${
                      selectedAvatar === av
                        ? 'border-[#004A2F] bg-emerald-50 shadow-sm scale-105 ring-2 ring-[#004A2F]/30'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <div className="pt-3">
              <button
                id="btn-start-quiz"
                type="submit"
                className="w-full py-4 px-6 rounded-xl bg-[#004A2F] hover:bg-[#003823] active:bg-[#002619] text-white font-bold text-base sm:text-lg flex items-center justify-center gap-3 shadow-lg shadow-emerald-950/20 hover:shadow-emerald-950/30 transition transform active:scale-[0.99] cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current text-[#C8A355]" />
                Iniciar Quiz do Evento
              </button>
            </div>
          </form>
        </div>

        {/* Info & Live Ranking Teaser */}
        <div className="lg:col-span-5 space-y-6">
          {/* Rules Summary */}
          <div className="bg-[#FBF7EE] border border-[#E9DCB8] rounded-2xl p-6 text-gray-800">
            <h3 className="font-bold text-[#004A2F] text-sm uppercase tracking-wider flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#C8A355]" />
              Como Funciona a Pontuação
            </h3>
            <ul className="text-xs sm:text-sm space-y-2.5 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#004A2F]">•</span>
                <span><strong>100 pontos</strong> por resposta correta.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#004A2F]">•</span>
                <span><strong>Bônus de velocidade:</strong> até <strong>50 pontos extras</strong> respondendo com rapidez.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#004A2F]">•</span>
                <span>O <strong>tempo total decorrido</strong> é o critério de desempate no ranking.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#004A2F]">•</span>
                <span>Ao final, receba o resultado com justificativas jurídicas e pedagógicas.</span>
              </li>
            </ul>
          </div>

          {/* Ranking Quick Link */}
          <div className="bg-white border border-[#E2EAE5] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                  Classificação em Tempo Real
                </h4>
                <Trophy className="w-5 h-5 text-[#C8A355]" />
              </div>
              <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                Veja as melhores pontuações registradas durante o evento e acompanhe quem está no topo da tabela.
              </p>
            </div>
            <button
              id="btn-view-leaderboard"
              type="button"
              onClick={() => {
                soundManager.playClick();
                onViewRanking();
              }}
              className="w-full py-2.5 px-4 rounded-xl border-2 border-[#004A2F] text-[#004A2F] hover:bg-emerald-50 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-[#C8A355]" />
              Abrir Ranking Geral
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
