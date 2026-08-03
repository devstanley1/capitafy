import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { TerminalLogs } from './components/TerminalLogs';
import { DashboardView } from './components/DashboardView';
import { MiningView } from './components/MiningView';
import { CopiesView } from './components/CopiesView';
import { LeadsView } from './components/LeadsView';
import { BlacklistView } from './components/BlacklistView';
import { SettingsView } from './components/SettingsView';
import { Lead, ScraperConfig, SystemStatus, LogMessage } from './types';

function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isLicenseActive, setIsLicenseActive] = useState<boolean | null>(null);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [licenseError, setLicenseError] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [blacklist, setBlacklist] = useState<string[]>([]);
  const [config, setConfig] = useState<ScraperConfig>({
    hashtags: '',
    minFollowers: 5000,
    maxFollowers: 50000,
    maxPerTag: 20,
    proxyEnabled: false,
    proxyUrl: '',
    turboMode: false
  });
  const [copies, setCopies] = useState<string[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    mining: false,
    sending: false
  });
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [isLogsOpen, setIsLogsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Unique Niches computed from leads
  const uniqueNiches = useMemo(() => {
    const niches = new Set<string>();
    leads.forEach(l => {
      if (l.niche) niches.add(l.niche.trim());
    });
    return Array.from(niches);
  }, [leads]);

  // Fetch all leads
  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/influencers');
      const data = await res.json();
      if (Array.isArray(data)) {
        setLeads(data);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    }
  }, []);

  // Fetch blacklist
  const fetchBlacklist = useCallback(async () => {
    try {
      const res = await fetch('/api/system/blacklist');
      const data = await res.json();
      if (Array.isArray(data)) {
        setBlacklist(data);
      }
    } catch (err) {
      console.error('Error fetching blacklist:', err);
    }
  }, []);

  // Fetch configuration
  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/system/config');
      const data = await res.json();
      if (data) {
        setConfig(data);
      }
    } catch (err) {
      console.error('Error fetching config:', err);
    }
  }, []);

  // Fetch copies
  const fetchCopies = useCallback(async () => {
    try {
      const res = await fetch('/api/system/copies');
      const data = await res.json();
      if (data && Array.isArray(data.copies)) {
        setCopies(data.copies);
      }
    } catch (err) {
      console.error('Error fetching copies:', err);
    }
  }, []);

  // Fetch system status (whether bot is running)
  const fetchSystemStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/system/status');
      const data = await res.json();
      if (data) {
        setSystemStatus({
          mining: !!data.mining,
          sending: !!data.sending
        });
      }
    } catch (err) {
      console.error('Error fetching system status:', err);
    }
  }, []);

  // Refresh all dashboard metrics
  const refreshAllData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      fetchLeads(),
      fetchBlacklist(),
      fetchConfig(),
      fetchCopies(),
      fetchSystemStatus()
    ]);
    setIsLoading(false);
  }, [fetchLeads, fetchBlacklist, fetchConfig, fetchCopies, fetchSystemStatus]);

  // Verificação de status de licença local
  const checkLicenseStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/license/status');
      const data = await res.json();
      if (data.active) {
        setIsLicenseActive(true);
      } else {
        setIsLicenseActive(false);
      }
    } catch (err) {
      console.error('Error checking license:', err);
      setIsLicenseActive(false);
    }
  }, []);

  const handleActivateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKeyInput.trim()) {
      setLicenseError('Por favor, digite sua chave de licença.');
      return;
    }
    
    setIsActivating(true);
    setLicenseError('');
    
    try {
      const res = await fetch('/api/license/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: licenseKeyInput })
      });
      
      const data = await res.json();
      if (res.ok) {
        setIsLicenseActive(true);
      } else {
        setLicenseError(data.error || 'Erro ao ativar licença.');
      }
    } catch (err) {
      setLicenseError('Erro de rede ao conectar com o servidor.');
    } finally {
      setIsActivating(false);
    }
  };

  // Checa status de licença ao inicializar
  useEffect(() => {
    checkLicenseStatus();
  }, [checkLicenseStatus]);

  // Inicializa Ecossistema se a licença estiver ativa
  useEffect(() => {
    if (isLicenseActive !== true) return;

    refreshAllData();

    const eventSource = new EventSource('/api/system/logs/stream');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.text) {
          // Append log
          const newLog: LogMessage = {
            id: Math.random().toString(36).substring(2, 9),
            type: data.type || 'system',
            text: data.text,
            timestamp: new Date().toLocaleTimeString('pt-BR')
          };
          setLogs(prev => [...prev.slice(-300), newLog]);

          // If a message signals engine stops, refresh status
          if (data.type === 'miner_status' && data.text === 'stopped') {
            setSystemStatus(prev => ({ ...prev, mining: false }));
          }
          if (data.type === 'sender_status' && data.text === 'stopped') {
            setSystemStatus(prev => ({ ...prev, sending: false }));
          }

          // Trigger lead refresh when new lead matches or changes status
          if (data.text.includes('[SQLITE]') || data.text.includes('adicionado') || data.text.includes('status')) {
            fetchLeads();
          }
        }
      } catch (err) {
        console.error('Error parsing SSE message:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE connection error, retrying...', err);
    };

    // Periodically sync system status to be safe
    const intervalId = setInterval(fetchSystemStatus, 5000);

    return () => {
      eventSource.close();
      clearInterval(intervalId);
    };
  }, [isLicenseActive, fetchLeads, fetchSystemStatus, refreshAllData]);

  // Operations: Leads Action Callbacks
  const handleDeleteLead = async (id: number) => {
    try {
      const res = await fetch(`/api/influencers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLeads(prev => prev.filter(l => l.id !== id));
      }
    } catch (err) {
      console.error('Error deleting lead:', err);
    }
  };

  const handleBanLead = async (username: string) => {
    try {
      const res = await fetch('/api/system/blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      if (res.ok) {
        fetchBlacklist();
        fetchLeads();
      }
    } catch (err) {
      console.error('Error banning user:', err);
    }
  };

  const handleRemoveBlacklist = async (username: string) => {
    try {
      const res = await fetch(`/api/system/blacklist/${username}`, { method: 'DELETE' });
      if (res.ok) {
        fetchBlacklist();
        fetchLeads();
      }
    } catch (err) {
      console.error('Error removing blacklist user:', err);
    }
  };

  const handleChangeLeadStatus = async (id: number, status: Lead['status']) => {
    try {
      const res = await fetch(`/api/influencers/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setLeads(prev =>
          prev.map(l => (l.id === id ? { ...l, status } : l))
        );
      }
    } catch (err) {
      console.error('Error changing lead status:', err);
    }
  };

  const handleAddLeadManual = async (leadData: Omit<Lead, 'id'>) => {
    const res = await fetch('/api/influencers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Erro ao cadastrar lead.');
    }
    fetchLeads();
  };

  const handleBulkUpdateStatus = async (status: Lead['status']) => {
    const res = await fetch('/api/system/leads/bulk-status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Erro ao atualizar status em lote.');
    }
    fetchLeads();
  };

  const handleClearDatabase = async () => {
    try {
      const res = await fetch('/api/influencers', { method: 'DELETE' });
      if (res.ok) {
        setLeads([]);
      }
    } catch (err) {
      console.error('Error clearing database:', err);
    }
  };

  // Save config details
  const handleSaveConfig = async (newConfig: ScraperConfig) => {
    const res = await fetch('/api/system/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig)
    });
    if (!res.ok) {
      throw new Error('Erro ao salvar configurações no servidor.');
    }
    setConfig(newConfig);
  };

  // Save copies
  const handleSaveCopies = async (newCopies: string[]) => {
    const res = await fetch('/api/system/copies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ copies: newCopies })
    });
    if (!res.ok) {
      throw new Error('Erro ao salvar templates no servidor.');
    }
    setCopies(newCopies);
    alert('Templates salvos com sucesso!');
  };

  // Scraper controls
  const handleStartMining = async () => {
    try {
      const res = await fetch('/api/system/start-mining', { method: 'POST' });
      if (res.ok) {
        setSystemStatus(prev => ({ ...prev, mining: true }));
        setIsLogsOpen(true);
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao iniciar mineração.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStopMining = async () => {
    try {
      const res = await fetch('/api/system/stop-mining', { method: 'POST' });
      if (res.ok) {
        setSystemStatus(prev => ({ ...prev, mining: false }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Sender controls
  const handleStartSending = async (niche: string) => {
    try {
      const res = await fetch('/api/system/start-sending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche })
      });
      if (res.ok) {
        setSystemStatus(prev => ({ ...prev, sending: true }));
        setIsLogsOpen(true);
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao iniciar disparos.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStopSending = async () => {
    try {
      const res = await fetch('/api/system/stop-sending', { method: 'POST' });
      if (res.ok) {
        setSystemStatus(prev => ({ ...prev, sending: false }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Kill Switch
  const handleKillSwitch = async () => {
    if (window.confirm("FREIO DE MÃO DE EMERGÊNCIA: Isso irá parar todos os robôs e fechar instâncias do Chrome. Confirmar?")) {
      try {
        const res = await fetch('/api/system/kill', { method: 'POST' });
        if (res.ok) {
          setSystemStatus({ mining: false, sending: false });
          alert("Todos os processos foram forçados a parar!");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Render view
  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            leads={leads}
            onDeleteLead={handleDeleteLead}
            onBanLead={handleBanLead}
            onChangeLeadStatus={handleChangeLeadStatus}
            onRefreshData={refreshAllData}
            onClearDatabase={handleClearDatabase}
            isLoading={isLoading}
          />
        );
      case 'mining':
        return (
          <MiningView
            config={config}
            onSaveConfig={handleSaveConfig}
            systemStatus={systemStatus}
            onStartMining={handleStartMining}
            onStopMining={handleStopMining}
          />
        );
      case 'copies':
        return (
          <CopiesView
            copies={copies}
            onSaveCopies={handleSaveCopies}
            systemStatus={systemStatus}
            onStartSending={handleStartSending}
            onStopSending={handleStopSending}
            uniqueNiches={uniqueNiches}
          />
        );
      case 'leads':
        return (
          <LeadsView
            onAddLead={handleAddLeadManual}
            onBulkUpdateStatus={handleBulkUpdateStatus}
            uniqueNiches={uniqueNiches}
          />
        );
      case 'blacklist':
        return (
          <BlacklistView
            blacklist={blacklist}
            onAddBlacklist={handleBanLead}
            onRemoveBlacklist={handleRemoveBlacklist}
          />
        );
      case 'settings':
        return (
          <SettingsView
            config={config}
            onSaveConfig={handleSaveConfig}
          />
        );
      default:
        return <div className="text-gray-400">Página não encontrada</div>;
    }
  };

  const pendingDMs = leads.filter(l => l.status === 'pendente').length;

  if (isLicenseActive === null) {
    return (
      <div className="min-h-screen bg-[#0a0c14] text-[#f3f4f6] flex items-center justify-center scanline relative">
        <div className="background-effects">
          <div className="blob blob-1"></div>
        </div>
        <div className="z-10 flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm font-medium tracking-wider uppercase animate-pulse">Verificando Licença...</p>
        </div>
      </div>
    );
  }

  if (isLicenseActive === false) {
    return (
      <div className="min-h-screen bg-[#0a0c14] text-[#f3f4f6] flex items-center justify-center p-4 scanline relative selection:bg-purple-500/20 overflow-hidden">
        <div className="background-effects">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
        </div>
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />
        
        {/* Premium Lock Card */}
        <div className="relative z-10 w-full max-w-md p-8 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl glow-purple transition-all duration-300">
          <div className="flex flex-col items-center space-y-6">
            
            {/* System Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            {/* Titles */}
            <div className="text-center space-y-1">
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-purple-400 bg-clip-text text-transparent">
                Capitafy CRM
              </h1>
              <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">
                Ativação do Software
              </p>
            </div>
            
            <p className="text-sm text-gray-300 text-center leading-relaxed">
              Insira sua chave de ativação para acessar o CRM e os motores de busca e disparos do Instagram.
            </p>
            
            {/* Form */}
            <form onSubmit={handleActivateLicense} className="w-full space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider pl-1">
                  Chave de Licença
                </label>
                <input
                  type="text"
                  placeholder="EX: XXXX-XXXX-XXXX-XXXX"
                  value={licenseKeyInput}
                  onChange={(e) => setLicenseKeyInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-center font-mono tracking-widest text-sm"
                />
              </div>
              
              {licenseError && (
                <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs text-center font-medium leading-relaxed">
                  {licenseError}
                </div>
              )}
              
              <button
                type="submit"
                disabled={isActivating}
                className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-purple-500 active:scale-[0.98] transition-all duration-150 flex items-center justify-center space-x-2 disabled:opacity-50 shadow-[0_4px_20px_rgba(139,92,246,0.25)]"
              >
                {isActivating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <span>Ativar Sistema</span>
                )}
              </button>
            </form>
            
            {/* Help / Footer */}
            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">
                Não tem uma licença?{' '}
                <a
                  href="https://capitafy.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  Adquirir agora
                </a>
              </p>
            </div>
            
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c14] text-[#f3f4f6] flex scanline relative selection:bg-purple-500/20">
      <div className="background-effects">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
      {/* Sidebar fixed */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        systemStatus={systemStatus}
        onKillSwitch={handleKillSwitch}
        leadsCount={leads.length}
        pendingDMs={pendingDMs}
      />

      {/* Main Interactive Screen */}
      <main className="flex-1 p-8 pb-32 overflow-y-auto h-screen scrollbar-thin">
        {/* Decorative Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />
        
        {/* Glow effect on top accent */}
        <div className="absolute top-0 left-1/4 right-1/4 h-64 bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-6">
          {renderActiveView()}
        </div>
      </main>

      {/* SSE logs stream console fixed at footer */}
      <TerminalLogs
        logs={logs}
        isOpen={isLogsOpen}
        setIsOpen={setIsLogsOpen}
        clearLogs={() => setLogs([])}
        systemStatus={systemStatus}
      />
    </div>
  );
}

export default App;
