import { Trophy, Volume2, VolumeX, Home, ShieldAlert, LogOut, User as UserIcon } from 'lucide-react';
import DprjLogo from './DprjLogo';
import { ScreenState, User } from '../types';

interface HeaderProps {
  currentScreen: ScreenState;
  onNavigate: (screen: ScreenState) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  currentUser?: User | null;
  onOpenReview?: () => void;
  onOpenAdmin?: () => void;
  onLogout?: () => void;
}

export default function Header({
  currentScreen,
  onNavigate,
  isMuted,
  onToggleMute,
  currentUser,
  onOpenAdmin,
  onLogout,
}: HeaderProps) {
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-[#004A2F] text-white shadow-md border-b border-[#003823]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <button
          id="btn-header-home"
          onClick={() => onNavigate(currentUser ? 'auth' : 'auth')}
          className="flex items-center gap-3 text-left focus:outline-none focus:ring-2 focus:ring-[#C8A355] rounded-lg p-1 -ml-1 hover:opacity-95 transition cursor-pointer"
        >
          <DprjLogo variant="white" className="h-9 sm:h-11" />
          <div className="hidden min-[420px]:flex flex-col border-l border-emerald-500/40 pl-3">
            <span className="font-bold text-xs sm:text-sm tracking-wide text-[#C8A355]">
              ECA DIGITAL
            </span>
            <span className="text-[10px] sm:text-xs text-emerald-100 font-medium">
              Quiz Interativo
            </span>
          </div>
        </button>

        {/* User Badge & Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* User Badge */}
          {currentUser && (
            <div className="hidden md:flex items-center gap-2 bg-[#003823] px-3 py-1 rounded-full border border-emerald-600/40 text-xs text-emerald-100">
              <span className="text-base">{currentUser.avatar}</span>
              <div className="flex flex-col text-left">
                <span className="font-bold text-white leading-tight truncate max-w-[120px]">
                  {currentUser.name}
                </span>
                {isAdmin && (
                  <span className="text-[9px] text-[#C8A355] font-extrabold uppercase tracking-wider">
                    Admin
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Admin Panel Button (if Admin) */}
          {isAdmin && onOpenAdmin && (
            <button
              id="btn-header-admin"
              onClick={onOpenAdmin}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer ${
                currentScreen === 'admin'
                  ? 'bg-[#C8A355] text-slate-950 border-[#C8A355] shadow-sm'
                  : 'bg-emerald-950/80 hover:bg-emerald-900 text-[#C8A355] border-[#C8A355]/40'
              }`}
              title="Painel de Gestão do Administrador"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#C8A355]" />
              <span className="hidden sm:inline">Painel Admin</span>
            </button>
          )}

          {/* Ranking Button */}
          <button
            id="btn-header-ranking"
            onClick={() => onNavigate(currentScreen === 'ranking' ? 'auth' : 'ranking')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition border cursor-pointer ${
              currentScreen === 'ranking'
                ? 'bg-[#C8A355] text-slate-950 border-[#C8A355] shadow-sm font-bold'
                : 'bg-[#003823] hover:bg-[#002b1b] text-white border-emerald-700/50'
            }`}
            title="Ver Ranking em Tempo Real"
          >
            <Trophy className="w-4 h-4 text-[#C8A355]" />
            <span className="hidden sm:inline">Ranking</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="btn-header-audio-toggle"
            onClick={onToggleMute}
            className="p-2 rounded-lg bg-[#003823] hover:bg-[#002b1b] text-white border border-emerald-700/50 transition cursor-pointer"
            title={isMuted ? 'Ativar Efeitos Sonoros' : 'Desativar Som'}
            aria-label={isMuted ? 'Ativar Efeitos Sonoros' : 'Desativar Som'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-emerald-300" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#C8A355]" />
            )}
          </button>

          {/* Logout Button */}
          {currentUser && onLogout && (
            <button
              id="btn-header-logout"
              onClick={onLogout}
              className="p-2 rounded-lg bg-[#003823] hover:bg-red-900/60 text-white/80 hover:text-white border border-emerald-700/50 transition cursor-pointer"
              title="Sair da Conta"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
