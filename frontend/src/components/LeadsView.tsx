import React, { useState } from 'react';
import { UserPlus, UserCheck, RefreshCw, Eye, Sparkles, Filter } from 'lucide-react';
import { Lead } from '../types';

interface LeadsViewProps {
  onAddLead: (lead: Omit<Lead, 'id'>) => Promise<void>;
  onBulkUpdateStatus: (status: Lead['status']) => Promise<void>;
  uniqueNiches: string[];
}

export const LeadsView: React.FC<LeadsViewProps> = ({
  onAddLead,
  onBulkUpdateStatus,
  uniqueNiches
}) => {
  const [username, setUsername] = useState('');
  const [followers, setFollowers] = useState('');
  const [niche, setNiche] = useState('');
  const [score, setScore] = useState('80');
  const [status, setStatus] = useState<Lead['status']>('pendente');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWiping, setIsWiping] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsSubmitting(true);
    try {
      const cleanUsername = username.trim().replace('@', '').toLowerCase();
      await onAddLead({
        username: cleanUsername,
        followers: Number(followers) || 0,
        niche: niche.trim() || 'Manual',
        status: status,
        score: Number(score) || 75,
        date: new Date().toLocaleDateString('pt-BR')
      });
      setUsername('');
      setFollowers('');
      setNiche('');
      alert(`Lead @${cleanUsername} adicionado com sucesso!`);
    } catch (err: any) {
      alert(err.message || 'Erro ao adicionar lead.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkAction = async (targetStatus: Lead['status'], label: string) => {
    if (window.confirm(`Deseja alterar em lote o status de TODOS os leads cadastrados para "${label.toUpperCase()}"?`)) {
      setIsWiping(true);
      try {
        await onBulkUpdateStatus(targetStatus);
        alert('Status dos leads atualizados com sucesso!');
      } catch (err: any) {
        alert('Erro ao atualizar status: ' + err.message);
      } finally {
        setIsWiping(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Gerenciamento Manual de Leads</h2>
        <p className="text-gray-400 text-xs mt-1">Insira perfis individuais diretamente no CRM ou aplique ações globais de lote.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#0f172a]/45 backdrop-blur-xl border border-white/8 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-purple-400" />
              Adicionar Lead Manualmente
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Nome de Usuário (Instagram)
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ex: neymarjr"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 text-white border border-white/8 focus:outline-none focus:border-purple-500/50 text-xs transition-all font-mono"
                  required
                />
              </div>

              {/* Followers */}
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Seguidores
                </label>
                <input
                  type="number"
                  value={followers}
                  onChange={(e) => setFollowers(e.target.value)}
                  placeholder="ex: 15000"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 text-white border border-white/8 focus:outline-none focus:border-purple-500/50 text-xs transition-all font-mono"
                />
              </div>

              {/* Niche */}
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Nicho / Categoria
                </label>
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="ex: Grau ou Apostas"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 text-white border border-white/8 focus:outline-none focus:border-purple-500/50 text-xs transition-all"
                  list="niches-list"
                  required
                />
                <datalist id="niches-list">
                  {uniqueNiches.map(n => (
                    <option key={n} value={n} />
                  ))}
                </datalist>
              </div>

              {/* Score */}
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Score de Conversão (Qualidade)
                </label>
                <select
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 text-white border border-white/8 focus:outline-none focus:border-purple-500/50 text-xs transition-all"
                >
                  <option value="95">Altíssima Qualidade (95%)</option>
                  <option value="80">Alta Qualidade (80%)</option>
                  <option value="60">Média Qualidade (60%)</option>
                  <option value="40">Baixa Qualidade (40%)</option>
                </select>
              </div>

              {/* Status */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Status Inicial no CRM
                </label>
                <div className="flex gap-4">
                  {['pendente', 'enviada', 'erro'].map((s) => (
                    <label key={s} className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="initial-status"
                        checked={status === s}
                        onChange={() => setStatus(s as Lead['status'])}
                        className="accent-purple-500"
                      />
                      <span className="capitalize">{s === 'erro' ? 'falha' : s}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs tracking-wider uppercase border border-purple-500/30 transition-all hover:shadow-lg hover:shadow-purple-500/20 active:scale-95 disabled:opacity-50"
                id="btn-add-manual"
              >
                <UserPlus className="w-4 h-4" />
                Cadastrar Perfil
              </button>
            </div>
          </form>
        </div>

        {/* Lote Actions Column */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0f172a]/45 backdrop-blur-xl border border-white/8 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Ações em Lote (Gerais)
            </h3>
            <p className="text-gray-400 text-xs">Execute ações massivas no banco de dados com cliques únicos.</p>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => handleBulkAction('enviada', 'enviadas')}
                disabled={isWiping}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-black/40 border border-white/5 hover:border-emerald-500/30 hover:text-white transition-all text-xs font-semibold text-gray-300 text-left active:scale-[0.98] disabled:opacity-50"
                id="btn-bulk-sent"
              >
                <UserCheck className="w-4 h-4 text-emerald-400" />
                Marcar Todos como Enviados
              </button>

              <button
                onClick={() => handleBulkAction('pendente', 'pendentes')}
                disabled={isWiping}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-black/40 border border-white/5 hover:border-amber-500/30 hover:text-white transition-all text-xs font-semibold text-gray-300 text-left active:scale-[0.98] disabled:opacity-50"
                id="btn-bulk-reset"
              >
                <RefreshCw className="w-4 h-4 text-amber-400" />
                Reiniciar Todos para Pendentes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
