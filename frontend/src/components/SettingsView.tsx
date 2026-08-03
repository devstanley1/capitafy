import React, { useState, useEffect } from 'react';
import { Settings, Shield, RefreshCw, Cpu, Check, AlertCircle, Key, Globe, Lock, Eye, EyeOff } from 'lucide-react';
import { ScraperConfig } from '../types';

interface SettingsViewProps {
  config: ScraperConfig;
  onSaveConfig: (config: ScraperConfig) => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  config,
  onSaveConfig
}) => {
  const [proxyEnabled, setProxyEnabled] = useState(config.proxyEnabled || false);
  const [proxyUrl, setProxyUrl] = useState(config.proxyUrl || '');
  const [hashtags, setHashtags] = useState(config.hashtags || '');
  const [minFollowers, setMinFollowers] = useState(config.minFollowers || 5000);
  const [maxFollowers, setMaxFollowers] = useState(config.maxFollowers || 50000);
  const [maxPerTag, setMaxPerTag] = useState(config.maxPerTag || 20);
  const [turboMode, setTurboMode] = useState(config.turboMode || false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Instagram Session Token states
  const [token, setToken] = useState('');
  const [tokenPath, setTokenPath] = useState('bot/token.txt');
  const [showToken, setShowToken] = useState(false);
  const [isSavingToken, setIsSavingToken] = useState(false);
  const [tokenMsg, setTokenMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    setProxyEnabled(config.proxyEnabled || false);
    setProxyUrl(config.proxyUrl || '');
    setHashtags(config.hashtags || '');
    setMinFollowers(config.minFollowers || 5000);
    setMaxFollowers(config.maxFollowers || 50000);
    setMaxPerTag(config.maxPerTag || 20);
    setTurboMode(config.turboMode || false);

    // Carregar token de sessao do Instagram
    fetch('/api/system/token')
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.token) setToken(data.token);
          if (data.path) setTokenPath(data.path);
        }
      })
      .catch(err => console.error('Error fetching token:', err));
  }, [config]);

  const handleSaveToken = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSavingToken(true);
    setTokenMsg(null);
    try {
      const res = await fetch('/api/system/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      if (res.ok) {
        setTokenMsg({ type: 'success', text: 'Token de sessão do Instagram salvo!' });
        setTimeout(() => setTokenMsg(null), 3000);
      } else {
        throw new Error('Falha ao salvar token');
      }
    } catch (err: any) {
      setTokenMsg({ type: 'error', text: 'Erro ao salvar token: ' + err.message });
    } finally {
      setIsSavingToken(false);
    }
  };

  const handleConnectBot = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/system/connect-bot', { method: 'POST' });
      if (res.ok) {
        alert('Navegador Chrome iniciado para autenticação. Siga os passos no terminal de logs.');
      } else {
        alert('Erro ao iniciar conexão automática.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg(null);
    try {
      await onSaveConfig({
        hashtags,
        minFollowers: Number(minFollowers),
        maxFollowers: Number(maxFollowers),
        maxPerTag: Number(maxPerTag),
        proxyEnabled,
        proxyUrl: proxyUrl.trim(),
        turboMode
      });
      setStatusMsg({ type: 'success', text: 'Configurações de sistema salvas com sucesso!' });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Erro ao salvar configurações: ' + err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Configurações Gerais do Sistema</h2>
        <p className="text-gray-400 text-xs mt-1">Configure parâmetros de rede, proxies de navegação e limites operacionais.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main settings container */}
          <div className="lg:col-span-2 space-y-6">
            {/* Instagram Token Configuration */}
            <div className="p-6 rounded-2xl bg-[#0f172a]/45 backdrop-blur-xl border border-white/8 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-400" />
                Token de Sessão (Instagram)
              </h3>
              <p className="text-gray-400 text-xs leading-normal">
                Cole o token de sessão (<code className="text-purple-400 font-mono">sessionid</code>) extraído manualmente do seu navegador Chrome ou utilize o assistente para conectar automaticamente.
              </p>
              
              <div className="text-[10px] text-gray-500 font-mono bg-black/30 p-2 rounded-lg border border-white/5">
                Caminho do arquivo local: {tokenPath}
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  SessionID Cookie do Instagram
                </label>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Cole seu sessionid aqui... (Ex: 63849182%3ABxKjS...)"
                    className="w-full pl-4 pr-12 py-2.5 rounded-xl bg-black/40 text-white border border-white/8 focus:outline-none focus:border-purple-500/50 text-xs transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {tokenMsg && (
                <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs ${
                  tokenMsg.type === 'success' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  <Check className="w-4 h-4" />
                  <span>{tokenMsg.text}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveToken}
                  disabled={isSavingToken}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs tracking-wider uppercase border border-purple-500/30 shadow transition-all hover:shadow-purple-500/10 active:scale-95 disabled:opacity-50"
                >
                  <Key className="w-4 h-4" />
                  {isSavingToken ? 'Salvando...' : 'Salvar Token Manual'}
                </button>
                <button
                  type="button"
                  onClick={handleConnectBot}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-semibold text-xs tracking-wider uppercase border border-white/10 transition-all active:scale-95"
                >
                  <Globe className="w-4 h-4" />
                  Conectar via Chrome
                </button>
              </div>
            </div>

            {/* Proxy Box */}
            <div className="p-6 rounded-2xl bg-[#0f172a]/45 backdrop-blur-xl border border-white/8 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                Segurança & Proxy de Navegação
              </h3>
              <p className="text-gray-400 text-xs leading-normal">
                Adicione conexões proxy para evitar limites de taxa de IP do Instagram durante a raspagem.
              </p>

              {/* Toggle Switch proxy */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
                <div>
                  <div className="text-xs font-semibold text-white">Habilitar Servidor Proxy</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Direciona todas as instâncias do Puppeteer através do IP informado.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={proxyEnabled}
                    onChange={(e) => setProxyEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600 peer-checked:after:bg-white" />
                </label>
              </div>

              {/* Proxy URL input */}
              {proxyEnabled && (
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Endereço Proxy (IP:Porta ou User:Pass@IP:Porta)
                  </label>
                  <input
                    type="text"
                    value={proxyUrl}
                    onChange={(e) => setProxyUrl(e.target.value)}
                    placeholder="ex: http://username:password@185.244.12.3:8000"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 text-white border border-white/8 focus:outline-none focus:border-purple-500/50 text-xs transition-all font-mono"
                    required={proxyEnabled}
                  />
                </div>
              )}
            </div>

            {/* Performance configuration */}
            <div className="p-6 rounded-2xl bg-[#0f172a]/45 backdrop-blur-xl border border-white/8 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                Hardware e Instâncias de Navegação
              </h3>

              <div className="text-xs text-gray-400 space-y-2">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span>Plataforma do Sistema</span>
                  <span className="font-mono text-gray-200">NodeJS v18+ & Puppeteer Engine</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span>Banco de Dados</span>
                  <span className="font-mono text-gray-200">SQLite3 (Modo WAL)</span>
                </div>
                <div className="flex items-center justify-between pb-1">
                  <span>Limite Concorrente de Bots</span>
                  <span className="font-mono text-gray-200">1 Instância Ativa (Proteção contra Anti-spam)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action column */}
          <div className="p-6 rounded-2xl bg-[#0f172a]/45 backdrop-blur-xl border border-white/8 flex flex-col justify-between h-fit space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-purple-400" />
                Ações de Configuração
              </h3>
              <p className="text-gray-400 text-xs">
                Salve as modificações efetuadas para que passem a valer nas próximas inicializações dos motores.
              </p>
            </div>

            {statusMsg && (
              <div className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs ${
                statusMsg.type === 'success' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {statusMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{statusMsg.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs tracking-wider uppercase border border-purple-500/30 transition-all hover:shadow-lg hover:shadow-purple-500/10 active:scale-95"
              id="btn-save-settings"
            >
              <RefreshCw className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              Salvar Alterações
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
