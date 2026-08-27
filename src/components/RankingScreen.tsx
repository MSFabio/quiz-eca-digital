import { useState, useEffect } from 'react';
import {
  Trophy,
  Medal,
  Clock,
  Search,
  RefreshCw,
  Download,
  Trash2,
  PlusCircle,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
  Users,
} from 'lucide-react';
import { RankingEntry } from '../types';
import { fetchRankings, resetAllRankings, seedDemoRankings } from '../utils/api';
import { soundManager } from '../utils/audio';

interface RankingScreenProps {
  onBackToHome: () => void;
  highlightEntryId?: string;
}

export default function RankingScreen({
  onBackToHome,
  highlightEntryId,
}: RankingScreenProps) {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [adminError, setAdminError] = useState('');

  const loadData = async () => {
    try {
      const data = await fetchRankings();
      setRankings(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadData();
      }, 4000); // 4-second live refresh
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const handleManualRefresh = () => {
    soundManager.playClick();
    setLoading(true);
    loadData();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds % 1) * 10);
    return `${mins}m ${secs.toString().padStart(2, '0')}.${tenths}s`;
  };

  const filteredRankings = rankings.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.organization && item.organization.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const top1 = filteredRankings[0];
  const top2 = filteredRankings[1];
  const top3 = filteredRankings[2];

  const handleExportCSV = () => {
    soundManager.playClick();
    if (rankings.length === 0) return;

    const headers = ['Posicao', 'Nome', 'Organizacao', 'Pontos', 'Acertos', 'TotalQuestoes', 'TempoSegundos', 'TempoFormatado', 'Data'];
    const rows = rankings.map((r, index) => [
      index + 1,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${(r.organization || 'Geral').replace(/"/g, '""')}"`,
      r.score,
      r.correctCount,
      r.totalQuestions,
      r.timeSeconds,
      formatTime(r.timeSeconds),
      new Date(r.createdAt).toLocaleString('pt-BR'),
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ranking_quiz_eca_digital_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAdminReset = async () => {
    soundManager.playClick();
    if (adminPin !== '1234' && adminPin !== 'dprj' && adminPin !== 'admin') {
      setAdminError('PIN incorreto (padrão do evento: 1234 ou dprj).');
      soundManager.playWrong();
      return;
    }

    await resetAllRankings();
    setRankings([]);
    setShowAdminModal(false);
    setAdminPin('');
    setAdminError('');
    loadData();
  };

  const handleAdminSeed = async () => {
    soundManager.playClick();
    const data = await seedDemoRankings();
    setRankings(data);
    setShowAdminModal(false);
    setAdminPin('');
    setAdminError('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-6 sm:py-10 px-4">
      {/* Top Bar Navigation & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          id="btn-ranking-back-home"
          onClick={() => {
            soundManager.playClick();
            onBackToHome();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-xs sm:text-sm font-semibold transition shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#004A2F]" />
          Voltar ao Início
        </button>

        <div className="flex items-center gap-2">
          {/* Live Sync Status Indicator */}
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#004A2F]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Tempo Real</span>
          </div>

          {/* Refresh button */}
          <button
            id="btn-ranking-refresh"
            onClick={handleManualRefresh}
            className="p-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-xs font-semibold transition shadow-sm cursor-pointer"
            title="Atualizar ranking agora"
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Export CSV for organizers */}
          <button
            id="btn-ranking-export-csv"
            onClick={handleExportCSV}
            disabled={rankings.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#004A2F] hover:bg-[#003823] disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition shadow-sm cursor-pointer"
            title="Exportar Classificação para Excel / CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          {/* Event Admin Toggle */}
          <button
            id="btn-ranking-admin-modal"
            onClick={() => {
              soundManager.playClick();
              setShowAdminModal(true);
            }}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition cursor-pointer"
            title="Opções do Organizador do Evento"
          >
            <ShieldAlert className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Main Banner */}
      <div className="bg-gradient-to-r from-[#004A2F] via-[#003B26] to-[#002619] text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-lg border border-[#005B3A] text-center relative overflow-hidden">
        <div className="relative z-10 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#003823]/90 border border-[#C8A355]/40 rounded-full text-xs font-semibold text-[#C8A355] mb-2">
            <Trophy className="w-3.5 h-3.5 text-[#C8A355]" />
            Tabela de Classificação do Evento
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            Ranking <span className="text-[#C8A355]">Ao Vivo</span>
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            Pontuação total e tempo decorrido no Quiz ECA Digital da Defensoria Pública do RJ.
          </p>
        </div>
      </div>

      {/* Top 3 Podium (if at least 1 participant exists) */}
      {filteredRankings.length > 0 && searchQuery === '' && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto items-end mb-10 pt-4">
          {/* 2nd Place (Silver) */}
          <div className="flex flex-col items-center">
            {top2 ? (
              <div className="w-full flex flex-col items-center">
                <div className="text-2xl sm:text-3xl mb-1">{top2.avatar}</div>
                <span className="font-bold text-gray-900 text-xs sm:text-sm truncate max-w-full text-center px-1">
                  {top2.name}
                </span>
                <span className="text-[10px] text-gray-500 truncate max-w-full mb-2">
                  {top2.organization}
                </span>
                <div className="w-full bg-gradient-to-b from-slate-200 to-slate-300 rounded-t-2xl p-3 text-center border-t-4 border-slate-400 shadow-sm h-32 sm:h-36 flex flex-col justify-between">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 text-slate-700 font-extrabold text-xs sm:text-sm flex items-center justify-center mx-auto shadow-sm">
                    2º
                  </div>
                  <div>
                    <span className="block font-black text-slate-900 text-sm sm:text-base">
                      {top2.score} pts
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-600 font-mono">
                      {formatTime(top2.timeSeconds)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-32 bg-gray-100 rounded-t-2xl border-dashed border-2 border-gray-200 flex items-center justify-center text-xs text-gray-400">
                2º Lugar
              </div>
            )}
          </div>

          {/* 1st Place (Gold) */}
          <div className="flex flex-col items-center">
            {top1 ? (
              <div className="w-full flex flex-col items-center">
                <div className="relative">
                  <span className="text-3xl sm:text-4xl mb-1 block">{top1.avatar}</span>
                  <Sparkles className="w-4 h-4 text-[#C8A355] absolute -top-1 -right-1 animate-bounce" />
                </div>
                <span className="font-bold text-gray-900 text-xs sm:text-sm truncate max-w-full text-center px-1">
                  {top1.name}
                </span>
                <span className="text-[10px] text-[#004A2F] font-semibold truncate max-w-full mb-2">
                  {top1.organization}
                </span>
                <div className="w-full bg-gradient-to-b from-[#E5C378] via-[#C8A355] to-[#B38C3B] rounded-t-2xl p-3 text-center border-t-4 border-[#FDF6E2] shadow-md h-40 sm:h-48 flex flex-col justify-between">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-amber-900 font-black text-sm sm:text-base flex items-center justify-center mx-auto shadow-md">
                    👑 1º
                  </div>
                  <div>
                    <span className="block font-black text-white text-base sm:text-lg drop-shadow-sm">
                      {top1.score} pts
                    </span>
                    <span className="text-[10px] sm:text-xs text-amber-100 font-mono font-semibold">
                      {formatTime(top1.timeSeconds)}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* 3rd Place (Bronze) */}
          <div className="flex flex-col items-center">
            {top3 ? (
              <div className="w-full flex flex-col items-center">
                <div className="text-2xl sm:text-3xl mb-1">{top3.avatar}</div>
                <span className="font-bold text-gray-900 text-xs sm:text-sm truncate max-w-full text-center px-1">
                  {top3.name}
                </span>
                <span className="text-[10px] text-gray-500 truncate max-w-full mb-2">
                  {top3.organization}
                </span>
                <div className="w-full bg-gradient-to-b from-[#d9aa7d] to-[#b37a4c] rounded-t-2xl p-3 text-center border-t-4 border-[#e8cbb0] shadow-sm h-28 sm:h-32 flex flex-col justify-between text-white">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#faede1] text-[#78431e] font-extrabold text-xs sm:text-sm flex items-center justify-center mx-auto shadow-sm">
                    3º
                  </div>
                  <div>
                    <span className="block font-black text-white text-sm sm:text-base drop-shadow-xs">
                      {top3.score} pts
                    </span>
                    <span className="text-[10px] sm:text-xs text-[#faede1] font-mono">
                      {formatTime(top3.timeSeconds)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-28 bg-gray-100 rounded-t-2xl border-dashed border-2 border-gray-200 flex items-center justify-center text-xs text-gray-400">
                3º Lugar
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E2EAE5] mb-6">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            id="input-search-ranking"
            type="text"
            placeholder="Buscar participante ou escola/instituição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 cursor-pointer"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Full Leaderboard Table / Cards */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2EAE5] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#004A2F]" />
            <h2 className="font-bold text-gray-900 text-sm sm:text-base">
              Todos os Participantes ({filteredRankings.length})
            </h2>
          </div>
          <span className="text-xs text-gray-500">
            Critério: Maior Pontuação &gt; Menor Tempo
          </span>
        </div>

        {filteredRankings.length === 0 ? (
          <div className="py-12 text-center text-gray-500 px-4">
            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-700 text-sm sm:text-base">
              Nenhum participante encontrado.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Seja o primeiro a jogar e garantir seu lugar no pódio!
            </p>
            <button
              onClick={onBackToHome}
              className="mt-4 px-4 py-2 bg-[#004A2F] text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
            >
              Jogar Agora
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredRankings.map((entry, index) => {
              const pos = index + 1;
              const isHighlighted = entry.id === highlightEntryId;

              return (
                <div
                  key={entry.id}
                  id={`ranking-row-${entry.id}`}
                  className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition ${
                    isHighlighted
                      ? 'bg-emerald-50/90 border-l-4 border-[#004A2F]'
                      : 'hover:bg-gray-50/80'
                  }`}
                >
                  {/* Left: Position + Avatar + Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Position Badge */}
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 ${
                        pos === 1
                          ? 'bg-[#C8A355] text-slate-950 shadow-sm'
                          : pos === 2
                          ? 'bg-slate-300 text-slate-800'
                          : pos === 3
                          ? 'bg-[#d9aa7d] text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {pos}º
                    </div>

                    {/* Avatar */}
                    <div className="text-xl sm:text-2xl shrink-0">{entry.avatar}</div>

                    {/* Name & Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                          {entry.name}
                        </span>
                        {isHighlighted && (
                          <span className="text-[10px] bg-[#004A2F] text-white px-2 py-0.5 rounded-full font-bold">
                            Você
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-500 truncate block">
                        {entry.organization || 'Geral'} • {entry.correctCount}/{entry.totalQuestions} acertos
                      </span>
                    </div>
                  </div>

                  {/* Right: Score & Time */}
                  <div className="text-right shrink-0">
                    <span className="block font-black text-sm sm:text-base text-[#004A2F]">
                      {entry.score} pts
                    </span>
                    <div className="flex items-center justify-end gap-1 text-[11px] text-gray-500 font-mono">
                      <Clock className="w-3 h-3 text-[#C8A355]" />
                      <span>{formatTime(entry.timeSeconds)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Admin Panel Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#E2EAE5] animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-gray-900 font-bold">
                <ShieldAlert className="w-5 h-5 text-[#C8A355]" />
                <h3>Gestão do Evento (Admin)</h3>
              </div>
              <button
                onClick={() => setShowAdminModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              Área restrita à coordenação do evento para reiniciar o ranking entre rodadas ou restaurar dados de teste.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                PIN do Organizador (Padrão: 1234)
              </label>
              <input
                type="password"
                value={adminPin}
                onChange={(e) => {
                  setAdminPin(e.target.value);
                  setAdminError('');
                }}
                placeholder="Digite o PIN"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-[#004A2F]"
              />
              {adminError && (
                <p className="text-xs text-red-600 font-semibold mt-1">{adminError}</p>
              )}
            </div>

            <div className="space-y-2.5">
              <button
                onClick={handleAdminReset}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Limpar Todo o Ranking Atual
              </button>

              <button
                onClick={handleAdminSeed}
                className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#004A2F]" />
                Restaurar Participantes de Exemplo
              </button>

              <button
                onClick={() => setShowAdminModal(false)}
                className="w-full py-2 px-4 text-gray-500 hover:text-gray-700 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
