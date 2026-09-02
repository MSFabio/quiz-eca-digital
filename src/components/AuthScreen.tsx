import { useState, FormEvent } from 'react';
import { ShieldCheck, Lock, Mail, User as UserIcon, Building, Eye, EyeOff, LogIn, UserPlus, Sparkles, HelpCircle, Clock, Trophy } from 'lucide-react';
import { User } from '../types';
import { loginUser, registerUser } from '../utils/api';
import { soundManager } from '../utils/audio';
import pomarLogo from '../assets/logo-pomar.png';

const AVATAR_OPTIONS = [
  '👩‍⚖️', '👨‍⚖️', '👩‍💻', '👨‍💻', '👩‍🎓', '👨‍🎓',
  '🕵️‍♀️', '🕵️‍♂️', '🛡️', '⚖️', '🎯', '🚀',
];

interface AuthScreenProps {
  onAuthSuccess: (user: User) => void;
  onViewRanking: () => void;
}

export default function AuthScreen({ onAuthSuccess, onViewRanking }: AuthScreenProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regOrg, setRegOrg] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Por favor, preencha o e-mail e a senha.');
      soundManager.playWrong();
      return;
    }

    setLoading(true);
    setError('');
    soundManager.playClick();

    const res = await loginUser(loginEmail.trim(), loginPassword.trim());
    setLoading(false);

    if (res.success && res.user) {
      onAuthSuccess(res.user);
    } else {
      setError(res.error || 'Credenciais inválidas. Verifique seu e-mail e senha.');
      soundManager.playWrong();
    }
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setError('Por favor, informe seu nome ou apelido.');
      soundManager.playWrong();
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setError('Por favor, informe um e-mail válido.');
      soundManager.playWrong();
      return;
    }
    if (!regPassword.trim() || regPassword.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres.');
      soundManager.playWrong();
      return;
    }

    setLoading(true);
    setError('');
    soundManager.playClick();

    const res = await registerUser({
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword.trim(),
      organization: regOrg.trim() || 'Participante do Evento',
      avatar: selectedAvatar,
    });
    setLoading(false);

    if (res.success && res.user) {
      onAuthSuccess(res.user);
    } else {
      setError(res.error || 'Erro ao realizar cadastro.');
      soundManager.playWrong();
    }
  };

  const handleFillAdminDemo = () => {
    setTab('login');
    setLoginEmail('admin@defensoria.rj.def.br');
    setLoginPassword('Dprj@2026');
    setError('');
    soundManager.playClick();
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-10 px-4">
      {/* Banner Card */}
      <div className="bg-gradient-to-br from-[#004A2F] via-[#003B26] to-[#002619] rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden border border-[#005B3A]">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-[#004A2F]/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-24 -top-12 w-40 h-40 bg-[#C8A355]/15 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#003823]/90 border border-[#C8A355]/40 rounded-full text-xs font-semibold text-[#C8A355] mb-4">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C8A355]" />
                Defensoria Pública do Estado do Rio de Janeiro
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 text-white">
                Quiz <span className="text-[#C8A355]">ECA Digital</span>
              </h1>

              <p className="text-sm sm:text-base text-emerald-100 max-w-xl leading-relaxed">
                Descubra e aprofunde seus conhecimentos sobre os direitos de crianças e adolescentes no ambiente digital!
                Faça login ou crie sua conta para participar do ranking oficial.
              </p>
            </div>

            {/* Pomar Logo Container */}
            <div className="shrink-0 flex items-center justify-center sm:justify-end">
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 shadow-xl border-2 border-[#C8A355]/40 max-w-[190px] sm:max-w-[220px] transition transform hover:scale-105 duration-200">
                <img
                  src={pomarLogo}
                  alt="Pomar - Polo de Mediação e Ações Restaurativas"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>

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
                <span className="text-[11px] text-emerald-200">Bônus por velocidade</span>
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

      {/* Auth Box Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Form Container */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#E2EAE5]">
          {/* Tabs Selector */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              id="tab-login"
              type="button"
              onClick={() => {
                setTab('login');
                setError('');
                soundManager.playClick();
              }}
              className={`flex-1 pb-3 text-sm sm:text-base font-bold text-center border-b-2 transition cursor-pointer flex items-center justify-center gap-2 ${
                tab === 'login'
                  ? 'border-[#004A2F] text-[#004A2F]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Entrar
            </button>

            <button
              id="tab-register"
              type="button"
              onClick={() => {
                setTab('register');
                setError('');
                soundManager.playClick();
              }}
              className={`flex-1 pb-3 text-sm sm:text-base font-bold text-center border-b-2 transition cursor-pointer flex items-center justify-center gap-2 ${
                tab === 'register'
                  ? 'border-[#004A2F] text-[#004A2F]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Criar Conta
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl font-medium flex items-center gap-2 animate-fadeIn">
              <span className="font-bold">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  E-mail de Acesso
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    id="input-login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#004A2F] focus:ring-2 focus:ring-[#004A2F]/20 text-gray-900 text-base sm:text-sm outline-none transition touch-manipulation"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    id="input-login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 focus:border-[#004A2F] focus:ring-2 focus:ring-[#004A2F]/20 text-gray-900 text-base sm:text-sm outline-none transition touch-manipulation"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="btn-submit-login"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#004A2F] hover:bg-[#003823] disabled:opacity-50 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 transition cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-[#C8A355]" />
                  {loading ? 'Entrando...' : 'Entrar e Jogar'}
                </button>
              </div>

              {/* Admin shortcut button */}
              <div className="pt-3 text-center border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleFillAdminDemo}
                  className="text-xs text-[#004A2F] hover:underline font-semibold cursor-pointer inline-flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C8A355]" />
                  Preencher dados de Administrador (DPRJ)
                </button>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Nome ou Apelido <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    id="input-register-name"
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ex: Ana Silva ou Lucas"
                    maxLength={40}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#004A2F] focus:ring-2 focus:ring-[#004A2F]/20 text-gray-900 text-base sm:text-sm outline-none transition touch-manipulation"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  E-mail (Login de Acesso) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    id="input-register-email"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#004A2F] focus:ring-2 focus:ring-[#004A2F]/20 text-gray-900 text-base sm:text-sm outline-none transition touch-manipulation"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Senha <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    id="input-register-password"
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Crie uma senha (mínimo 4 caracteres)"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 focus:border-[#004A2F] focus:ring-2 focus:ring-[#004A2F]/20 text-gray-900 text-base sm:text-sm outline-none transition touch-manipulation"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Instituição / Escola / Área (Opcional)
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    id="input-register-org"
                    type="text"
                    value={regOrg}
                    onChange={(e) => setRegOrg(e.target.value)}
                    placeholder="Ex: Colégio Estadual, Defensoria, UERJ..."
                    maxLength={50}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#004A2F] focus:ring-2 focus:ring-[#004A2F]/20 text-gray-900 text-base sm:text-sm outline-none transition touch-manipulation"
                  />
                </div>
              </div>

              {/* Avatar Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Escolha seu Avatar
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(av);
                        soundManager.playClick();
                      }}
                      className={`h-11 flex items-center justify-center text-xl rounded-xl border-2 transition transform active:scale-95 cursor-pointer ${
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

              <div className="pt-2">
                <button
                  id="btn-submit-register"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#004A2F] hover:bg-[#003823] disabled:opacity-50 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 transition cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-[#C8A355]" />
                  {loading ? 'Cadastrando...' : 'Cadastrar e Iniciar Quiz'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Info Box */}
        <div className="lg:col-span-5 space-y-6">
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
                <span>O <strong>tempo total decorrido</strong> é o critério oficial de desempate.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#004A2F]">•</span>
                <span>Ao final, consulte o gabarito comentado com fundamentação legal da Defensoria Pública.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border border-[#E2EAE5] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                  Classificação Geral
                </h4>
                <Trophy className="w-5 h-5 text-[#C8A355]" />
              </div>
              <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                Você pode conferir o ranking dos participantes do evento mesmo antes de iniciar seu jogo.
              </p>
            </div>
            <button
              id="btn-auth-view-ranking"
              type="button"
              onClick={() => {
                soundManager.playClick();
                onViewRanking();
              }}
              className="w-full py-2.5 px-4 rounded-xl border-2 border-[#004A2F] text-[#004A2F] hover:bg-emerald-50 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-[#C8A355]" />
              Abrir Ranking em Tempo Real
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
