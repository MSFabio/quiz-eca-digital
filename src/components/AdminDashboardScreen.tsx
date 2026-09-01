import { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Trophy,
  Award,
  Clock,
  Trash2,
  Download,
  RefreshCw,
  Search,
  ArrowLeft,
  BarChart3,
} from 'lucide-react';
import { AdminDashboardData } from '../types';
import { fetchAdminDashboard, deleteRankingEntry, deleteUserAccount, resetAllRankings } from '../utils/api';
import { soundManager } from '../utils/audio';
import QuestionStatsView from './QuestionStatsView';

interface AdminDashboardScreenProps {
  onBackToApp: () => void;
}

export default function AdminDashboardScreen({ onBackToApp }: AdminDashboardScreenProps) {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ranking' | 'users' | 'questions'>('ranking');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminDashboard();
      setData(res);
    } catch (e) {
      console.warn('Erro ao carregar painel admin', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds % 1) * 10);
    return `${mins}m ${secs.toString().padStart(2, '0')}.${tenths}s`;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDeleteRankingEntry = async () => {
    if (!deleteEntryId) return;
    setActionLoading(true);
    soundManager.playClick();
    const ok = await deleteRankingEntry(deleteEntryId);
    setActionLoading(false);
    setDeleteEntryId(null);
    if (ok) {
      showToast('Registro de ranking excluído com sucesso.');
      loadDashboard();
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    setActionLoading(true);
    soundManager.playClick();
    const ok = await deleteUserAccount(deleteUserId);
    setActionLoading(false);
    setDeleteUserId(null);
    if (ok) {
      showToast('Conta de usuário removida com sucesso.');
      loadDashboard();
    }
  };

  const [clearUsersOption, setClearUsersOption] = useState(true);

  const handleResetRankings = async () => {
    setActionLoading(true);
    soundManager.playClick();
    await resetAllRankings({ clearUsers: clearUsersOption });
    setActionLoading(false);
    setShowResetModal(false);
    showToast(
      clearUsersOption
        ? 'Toda a base de dados (ranking e contas de participantes) foi zerada com sucesso!'
        : 'Tabela de ranking zerada com sucesso! Contas de participantes preservadas.'
    );
    loadDashboard();
  };

  const handleExportCSV = () => {
    soundManager.playClick();
    if (!data || data.rankings.length === 0) return;

    const headers = ['Posicao', 'Nome', 'Organizacao', 'Pontos', 'Acertos', 'TotalQuestoes', 'TempoSegundos', 'TempoFormatado', 'Data'];
    const rows = data.rankings.map((r, index) => [
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
    a.download = `relatorio_admin_quiz_dprj_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredRankings = (data?.rankings || []).filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.organization && r.organization.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredUsers = (data?.users || []).filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.organization && u.organization.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full max-w-6xl mx-auto py-6 sm:py-10 px-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="mb-4 p-4 rounded-xl bg-emerald-700 text-white font-bold text-sm shadow-xl flex items-center justify-between animate-fadeIn">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/80 hover:text-white font-bold text-xs ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          onClick={() => {
            soundManager.playClick();
            onBackToApp();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-xs sm:text-sm font-semibold transition shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#004A2F]" />
          Voltar ao Quiz
        </button>

        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={() => {
              soundManager.playClick();
              loadDashboard();
            }}
            className="p-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-xs font-semibold transition shadow-sm cursor-pointer"
            title="Atualizar Painel"
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={!data || data.rankings.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#004A2F] hover:bg-[#003823] disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          {/* Reset Global */}
          <button
            onClick={() => {
              soundManager.playClick();
              setShowResetModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition shadow-sm cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Zerar Ranking</span>
          </button>
        </div>
      </div>

      {/* Main Admin Banner */}
      <div className="bg-gradient-to-r from-[#004A2F] via-[#003823] to-[#002619] text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-xl border border-[#005B3A]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#003823]/90 border border-[#C8A355]/40 rounded-full text-xs font-semibold text-[#C8A355] mb-3">
              <ShieldAlert className="w-3.5 h-3.5 text-[#C8A355]" />
              Painel de Controle e Gestão — Defensoria Pública do RJ
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Gestão do Evento e Acompanhamento do Ranking
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-2xl">
              Monitore a participação dos usuários em tempo real, exclua registros individuais ou zere a tabela entre rodadas do evento.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-8">
        <div className="bg-white rounded-2xl p-4 border border-[#E2EAE5] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 font-bold uppercase">Usuários</span>
            <Users className="w-4 h-4 text-[#004A2F]" />
          </div>
          <span className="text-2xl font-black text-gray-900">{data?.totalUsers || 0}</span>
          <span className="text-[11px] text-gray-400 block mt-0.5">cadastrados</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E2EAE5] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 font-bold uppercase">Partidas</span>
            <Trophy className="w-4 h-4 text-[#C8A355]" />
          </div>
          <span className="text-2xl font-black text-gray-900">{data?.totalMatches || 0}</span>
          <span className="text-[11px] text-gray-400 block mt-0.5">jogadas</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E2EAE5] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 font-bold uppercase">Média Geral</span>
            <Award className="w-4 h-4 text-[#004A2F]" />
          </div>
          <span className="text-2xl font-black text-[#004A2F]">{data?.averageScore || 0}</span>
          <span className="text-[11px] text-gray-400 block mt-0.5">pontos / jogo</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E2EAE5] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 font-bold uppercase">Tempo Médio</span>
            <Clock className="w-4 h-4 text-amber-700" />
          </div>
          <span className="text-2xl font-black text-amber-950 font-mono">
            {data?.averageTimeSeconds ? formatTime(data.averageTimeSeconds) : '0m 00s'}
          </span>
          <span className="text-[11px] text-gray-400 block mt-0.5">por partida</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E2EAE5] shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 font-bold uppercase">Recorde</span>
            <Award className="w-4 h-4 text-[#C8A355]" />
          </div>
          <span className="text-2xl font-black text-[#C8A355]">{data?.topScore || 0}</span>
          <span className="text-[11px] text-gray-400 block mt-0.5">maior pontuação</span>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E2EAE5] mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Tabs Selector */}
          <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('ranking')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ranking'
                  ? 'bg-[#004A2F] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Trophy className="w-4 h-4" />
              Gestão do Ranking ({data?.rankings.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'users'
                  ? 'bg-[#004A2F] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-4 h-4" />
              Usuários Inscritos ({data?.users.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('questions')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'questions'
                  ? 'bg-[#004A2F] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Análise por Questão (10)
            </button>
          </div>

          {/* Search Field */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar por nome, email ou instituição..."
              className="text-xs sm:text-sm bg-transparent outline-none w-full text-gray-800 placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TAB 1: RANKING MANAGEMENT TABLE */}
      {activeTab === 'ranking' && (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2EAE5] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#f8faf9] text-gray-700 font-bold border-b border-gray-200 uppercase text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Posição</th>
                  <th className="py-3.5 px-4">Participante</th>
                  <th className="py-3.5 px-4">Instituição</th>
                  <th className="py-3.5 px-4">Pontuação</th>
                  <th className="py-3.5 px-4">Acertos</th>
                  <th className="py-3.5 px-4">Tempo</th>
                  <th className="py-3.5 px-4">Data / Hora</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRankings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-gray-400">
                      Nenhuma pontuação registrada no momento.
                    </td>
                  </tr>
                ) : (
                  filteredRankings.map((entry, index) => (
                    <tr key={entry.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        {index + 1}º
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{entry.avatar}</span>
                          <span className="font-bold text-gray-900">{entry.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 truncate max-w-[150px]">
                        {entry.organization || 'Geral'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#004A2F]">
                        {entry.score} pts
                      </td>
                      <td className="py-3.5 px-4 text-gray-700">
                        {entry.correctCount}/{entry.totalQuestions}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-600">
                        {formatTime(entry.timeSeconds)}
                      </td>
                      <td className="py-3.5 px-4 text-gray-400 text-xs">
                        {new Date(entry.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setDeleteEntryId(entry.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Excluir pontuação do ranking"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: REGISTERED USERS MANAGEMENT TABLE */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2EAE5] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#f8faf9] text-gray-700 font-bold border-b border-gray-200 uppercase text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Usuário</th>
                  <th className="py-3.5 px-4">E-mail</th>
                  <th className="py-3.5 px-4">Instituição</th>
                  <th className="py-3.5 px-4">Perfil</th>
                  <th className="py-3.5 px-4">Data de Inscrição</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400">
                      Nenhum usuário cadastrado.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{user.avatar}</span>
                          <span className="font-bold text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 font-mono text-xs">
                        {user.email}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {user.organization || 'Geral'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            user.role === 'admin'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {user.role === 'admin' ? 'Administrador' : 'Participante'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-400 text-xs">
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {user.email !== 'admin@defensoria.rj.def.br' && (
                          <button
                            onClick={() => setDeleteUserId(user.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Remover conta de usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. QUESTION STATS TAB */}
      {activeTab === 'questions' && (
        <QuestionStatsView questionStats={data?.questionStats || []} />
      )}

      {/* CONFIRM DELETE ENTRY MODAL */}
      {deleteEntryId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 animate-fadeIn">
            <h3 className="font-bold text-base text-gray-900 mb-2">Excluir Pontuação?</h3>
            <p className="text-xs text-gray-600 mb-5 leading-relaxed">
              Esta ação removerá permanentemente este registro da tabela de ranking oficial.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteEntryId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteRankingEntry}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {actionLoading ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE USER MODAL */}
      {deleteUserId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 animate-fadeIn">
            <h3 className="font-bold text-base text-gray-900 mb-2">Remover Usuário?</h3>
            <p className="text-xs text-gray-600 mb-5 leading-relaxed">
              Esta ação removerá permanentemente a conta de acesso deste participante.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteUserId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {actionLoading ? 'Removendo...' : 'Sim, Remover'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM RESET ALL RANKING MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 animate-fadeIn">
            <div className="flex items-center gap-2 text-red-600 font-bold mb-2">
              <Trash2 className="w-5 h-5" />
              <h3>Zerar Base de Dados do Evento</h3>
            </div>
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              Todas as pontuações e tempos do ranking oficial serão permanentemente apagados do servidor para iniciar uma nova rodada.
            </p>

            {/* Clear Users Checkbox */}
            <div className="mb-5 p-3.5 bg-red-50/80 border border-red-200 rounded-xl">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={clearUsersOption}
                  onChange={(e) => setClearUsersOption(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500 border-gray-300 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-bold text-red-900 block">
                    Excluir também todos os cadastros de participantes
                  </span>
                  <span className="text-red-700 text-[11px] block mt-0.5">
                    Apenas a conta de Administrador DPRJ será preservada. Recomendado para iniciar um evento novo.
                  </span>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetRankings}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
              >
                {actionLoading ? 'Limpando...' : 'Sim, Confirmar e Zerar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
