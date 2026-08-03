import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Send, 
  AlertCircle, 
  Clock, 
  Search, 
  Trash2, 
  Ban, 
  Download, 
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Filter,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Lead } from '../types';

interface DashboardViewProps {
  leads: Lead[];
  onDeleteLead: (id: number) => void;
  onBanLead: (username: string) => void;
  onChangeLeadStatus: (id: number, status: Lead['status']) => void;
  onRefreshData: () => void;
  onClearDatabase: () => void;
  isLoading: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  leads,
  onDeleteLead,
  onBanLead,
  onChangeLeadStatus,
  onRefreshData,
  onClearDatabase,
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [nicheFilter, setNicheFilter] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<'followers' | 'score' | 'date' | 'id'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Compute stat totals
  const stats = useMemo(() => {
    const total = leads.length;
    const sent = leads.filter(l => l.status === 'enviada').length;
    const pending = leads.filter(l => l.status === 'pendente').length;
    const error = leads.filter(l => l.status === 'erro').length;
    return { total, sent, pending, error };
  }, [leads]);

  // Unique niches list
  const uniqueNiches = useMemo(() => {
    const niches = new Set<string>();
    leads.forEach(l => {
      if (l.niche) niches.add(l.niche.trim());
    });
    return Array.from(niches);
  }, [leads]);

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    let result = [...leads];

    // Search filter
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        l => l.username.toLowerCase().includes(searchLower) || (l.niche && l.niche.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (statusFilter !== 'todos') {
      result = result.filter(l => l.status === statusFilter);
    }

    // Niche filter
    if (nicheFilter !== 'todos') {
      result = result.filter(l => l.niche && l.niche.trim() === nicheFilter);
    }

    // Sorting
    result.sort((a, b) => {
      let valA: any = a[sortBy];
      let valB: any = b[sortBy];

      if (sortBy === 'date') {
        valA = new Date(a.date).getTime() || 0;
        valB = new Date(b.date).getTime() || 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [leads, searchTerm, statusFilter, nicheFilter, sortBy, sortOrder]);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const exportCSV = () => {
    window.open('/api/export/csv', '_blank');
  };

  const getStatusBadge = (status: Lead['status']) => {
    switch (status) {
      case 'pendente':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
            PENDENTE
          </span>
        );
      case 'enviada':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ENVIADA
          </span>
        );
      case 'erro':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider font-mono bg-red-500/10 text-red-400 border border-red-500/20">
            FALHA
          </span>
        );
      case 'blacklist':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider font-mono bg-gray-500/20 text-gray-400 border border-white/5">
            BANNED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Estatísticas Operacionais</h2>
          <p className="text-gray-400 text-xs mt-1">Visão analítica de leads minerados e disparos de Direct Message.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshData}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
            title="Atualizar dados"
            id="btn-refresh"
          >
            <RefreshCw className={`w-4.5 h-4.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs tracking-wider uppercase border border-purple-500/30 transition-all hover:shadow-lg hover:shadow-purple-500/20 active:scale-95"
            id="btn-export-csv"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-5 rounded-2xl bg-[#0f172a]/45 backdrop-blur-xl border border-white/8 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-purple-400 group-hover:scale-110 transition-transform duration-300">
            <Users className="w-16 h-16" />
          </div>
          <div className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">Leads Minerados</div>
          <div className="text-3xl font-extrabold text-white mt-2 font-mono tracking-tight">
            {stats.total}
          </div>
          <div className="text-[10px] text-gray-500 mt-1">Total de contas salvas no CRM</div>
        </div>

        {/* Card 2 */}
        <div className="p-5 rounded-2xl bg-[#0f172a]/45 backdrop-blur-xl border border-white/8 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-400 group-hover:scale-110 transition-transform duration-300">
            <Send className="w-16 h-16" />
          </div>
          <div className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">Mensagens Enviadas</div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono tracking-tight">
            {stats.sent}
          </div>
          <div className="text-[10px] text-gray-500 mt-1">Contatos estabelecidos com sucesso</div>
        </div>

        {/* Card 3 */}
        <div className="p-5 rounded-2xl bg-[#0f172a]/45 backdrop-blur-xl border border-white/8 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-amber-400 group-hover:scale-110 transition-transform duration-300">
            <Clock className="w-16 h-16" />
          </div>
          <div className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">Mensagens Pendentes</div>
          <div className="text-3xl font-extrabold text-amber-400 mt-2 font-mono tracking-tight">
            {stats.pending}
          </div>
          <div className="text-[10px] text-gray-500 mt-1">Contas qualificadas na fila de disparo</div>
        </div>

        {/* Card 4 */}
        <div className="p-5 rounded-2xl bg-[#0f172a]/45 backdrop-blur-xl border border-white/8 relative overflow-hidden group hover:border-red-500/30 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-red-400 group-hover:scale-110 transition-transform duration-300">
            <AlertCircle className="w-16 h-16" />
          </div>
          <div className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">Fails de Envio</div>
          <div className="text-3xl font-extrabold text-red-400 mt-2 font-mono tracking-tight">
            {stats.error}
          </div>
          <div className="text-[10px] text-gray-500 mt-1">Erros de DM fechada, bloqueada, etc.</div>
        </div>
      </div>

      {/* Interactive table panel */}
      <div className="rounded-2xl bg-[#0f172a]/45 backdrop-blur-xl border border-white/8 overflow-hidden">
        {/* Table header & controls */}
        <div className="p-5 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white text-sm">Base de Qualificação</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-white/5 text-purple-400 border border-white/10">
              {filteredLeads.length} filtrados
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar por username/nicho..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs rounded-xl bg-black/40 text-white border border-white/8 focus:outline-none focus:border-purple-500/50 w-52 transition-all"
                id="search-input"
              />
            </div>

            {/* Status Selector */}
            <div className="flex items-center gap-1 bg-black/40 border border-white/8 rounded-xl px-2.5 py-1">
              <Filter className="w-3 h-3 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-gray-300 text-xs border-none focus:outline-none cursor-pointer pr-1"
                id="filter-status"
              >
                <option value="todos" className="bg-[#0b0c10] text-gray-300">Todos Status</option>
                <option value="pendente" className="bg-[#0b0c10] text-gray-300">Pendentes</option>
                <option value="enviada" className="bg-[#0b0c10] text-gray-300">Enviados</option>
                <option value="erro" className="bg-[#0b0c10] text-gray-300">Falhas</option>
                <option value="blacklist" className="bg-[#0b0c10] text-gray-300">Blacklist</option>
              </select>
            </div>

            {/* Niche Selector */}
            <div className="flex items-center gap-1 bg-black/40 border border-white/8 rounded-xl px-2.5 py-1">
              <Filter className="w-3 h-3 text-gray-500" />
              <select
                value={nicheFilter}
                onChange={(e) => setNicheFilter(e.target.value)}
                className="bg-transparent text-gray-300 text-xs border-none focus:outline-none cursor-pointer pr-1"
                id="filter-niche"
              >
                <option value="todos" className="bg-[#0b0c10] text-gray-300">Todos Nichos</option>
                {uniqueNiches.map(niche => (
                  <option key={niche} value={niche} className="bg-[#0b0c10] text-gray-300">{niche}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Leads Grid/Table */}
        <div className="overflow-x-auto">
          {filteredLeads.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-sm">
              Nenhum lead encontrado com os filtros selecionados.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/2 text-gray-400 font-semibold tracking-wider font-mono">
                  <th className="p-4 select-none cursor-pointer hover:text-white" onClick={() => handleSort('id')}>
                    ID {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="p-4">Username</th>
                  <th className="p-4 select-none cursor-pointer hover:text-white" onClick={() => handleSort('followers')}>
                    Seguidores {sortBy === 'followers' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="p-4">Nicho</th>
                  <th className="p-4 select-none cursor-pointer hover:text-white" onClick={() => handleSort('score')}>
                    Score {sortBy === 'score' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="p-4 select-none cursor-pointer hover:text-white" onClick={() => handleSort('date')}>
                    Extraído {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300 font-sans">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/2 transition-colors">
                    <td className="p-4 text-gray-500 font-mono">#{lead.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-bold text-purple-400 select-none overflow-hidden shrink-0">
                          {lead.avatar ? (
                            <img src={lead.avatar} alt={lead.username} className="w-full h-full object-cover" />
                          ) : (
                            lead.username.charAt(0).toUpperCase()
                          )}
                        </div>
                        <a
                          href={`https://instagram.com/${lead.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-white hover:text-purple-400 flex items-center gap-1 transition-colors"
                        >
                          {lead.username}
                          <ExternalLink className="w-3 h-3 text-gray-500 shrink-0" />
                        </a>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-medium text-gray-200">
                      {lead.followers ? lead.followers.toLocaleString() : '0'}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/8 text-[11px]">
                        {lead.niche}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-20 bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                          <div
                            className={`h-full rounded-full ${
                              lead.score >= 80 
                                ? 'bg-emerald-500' 
                                : lead.score >= 50 
                                  ? 'bg-purple-500' 
                                  : 'bg-amber-500'
                            }`}
                            style={{ width: `${lead.score}%` }}
                          />
                        </div>
                        <span className="font-mono font-semibold text-gray-400 text-[10px]">{lead.score}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 font-mono">{lead.date}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(lead.status)}
                        {lead.status === 'pendente' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onChangeLeadStatus(lead.id, 'enviada')}
                              className="p-1 rounded hover:bg-emerald-500/10 text-emerald-500/70 hover:text-emerald-400"
                              title="Marcar como Enviado"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onChangeLeadStatus(lead.id, 'erro')}
                              className="p-1 rounded hover:bg-red-500/10 text-red-500/70 hover:text-red-400"
                              title="Marcar como Falha"
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        {lead.status !== 'pendente' && (
                          <button
                            onClick={() => onChangeLeadStatus(lead.id, 'pendente')}
                            className="p-1 rounded hover:bg-white/5 text-gray-500 hover:text-gray-300 text-[10px]"
                            title="Resetar para Pendente"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onBanLead(lead.username)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Banir de futuras buscas (Blacklist)"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteLead(lead.id)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Excluir lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Wipe CRM option */}
      {leads.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => {
              if (window.confirm("ATENÇÃO: Isso irá deletar TODOS os leads do banco de dados definitivamente. Confirmar limpeza?")) {
                onClearDatabase();
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 hover:border-red-500 text-red-400 hover:bg-red-500/10 transition-all font-medium text-xs tracking-wider uppercase active:scale-95"
            id="btn-wipe-crm"
          >
            Limpar CRM Definitivamente
          </button>
        </div>
      )}
    </div>
  );
};
