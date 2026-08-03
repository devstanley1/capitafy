import React, { useState } from 'react';
import { Skull, UserX, Trash2, ShieldAlert } from 'lucide-react';

interface BlacklistViewProps {
  blacklist: string[];
  onAddBlacklist: (username: string) => Promise<void>;
  onRemoveBlacklist: (username: string) => Promise<void>;
}

export const BlacklistView: React.FC<BlacklistViewProps> = ({
  blacklist,
  onAddBlacklist,
  onRemoveBlacklist
}) => {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsSubmitting(true);
    try {
      const cleanUsername = username.trim().replace('@', '').toLowerCase();
      await onAddBlacklist(cleanUsername);
      setUsername('');
      alert(`@${cleanUsername} adicionado à lista negra!`);
    } catch (err: any) {
      alert(err.message || 'Erro ao banir usuário.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (user: string) => {
    if (window.confirm(`Deseja remover @${user} da lista negra?`)) {
      try {
        await onRemoveBlacklist(user);
      } catch (err: any) {
        alert('Erro ao remover: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Lista Negra de Contatos (Blacklist)</h2>
        <p className="text-gray-400 text-xs mt-1">Impeça abordagens futuras a perfis específicos (concorrentes, clientes ativos, etc.).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ban form */}
        <div className="p-6 rounded-2xl bg-[#0f172a]/45 backdrop-blur-xl border border-white/8 space-y-4 h-fit">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <UserX className="w-4 h-4 text-red-400" />
            Banir Perfil Manualmente
          </h3>
          <p className="text-[11px] text-gray-550 leading-relaxed">
            Insira o nome de usuário do Instagram para bloqueá-lo permanentemente de todas as buscas automáticas de mineração.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ex: concorrente_oficial"
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 text-white border border-white/8 focus:outline-none focus:border-red-500/50 text-xs transition-all font-mono"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-650 hover:bg-red-600 text-white font-bold text-xs tracking-wider uppercase border border-red-500/30 transition-all hover:shadow-lg hover:shadow-red-500/10 active:scale-95"
              id="btn-add-blacklist"
            >
              <Skull className="w-4 h-4" />
              Banir Perfil
            </button>
          </form>
        </div>

        {/* List column */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0f172a]/45 backdrop-blur-xl border border-white/8 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Perfis Banidos
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-white/5 text-red-400 border border-white/10">
              {blacklist.length} bloqueados
            </span>
          </div>

          <div className="max-h-[300px] overflow-y-auto scrollbar-thin divide-y divide-white/5 pr-1">
            {blacklist.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs italic">
                Nenhum perfil banido na lista negra.
              </div>
            ) : (
              blacklist.map((user) => (
                <div key={user} className="flex items-center justify-between py-2.5 hover:bg-white/2 px-2 rounded-lg transition-colors">
                  <span className="font-mono text-xs text-gray-300">@{user}</span>
                  <button
                    onClick={() => handleRemove(user)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Remover da Blacklist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
