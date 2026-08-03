import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  MessageSquareCode, 
  Users, 
  Skull, 
  Settings as SettingsIcon, 
  Zap, 
  PowerOff,
  Flame
} from 'lucide-react';
import { SystemStatus } from '../types';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  systemStatus: SystemStatus;
  onKillSwitch: () => void;
  leadsCount: number;
  pendingDMs: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  systemStatus,
  onKillSwitch,
  leadsCount,
  pendingDMs
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard, badge: null },
    { id: 'mining', label: 'Radar de Mineração', icon: Search, badge: systemStatus.mining ? 'ON' : null },
    { id: 'copies', label: 'Fábrica de Copys', icon: MessageSquareCode, badge: null },
    { id: 'leads', label: 'Gestão de Leads', icon: Users, badge: leadsCount > 0 ? leadsCount : null },
    { id: 'blacklist', label: 'Blacklist', icon: Skull, badge: null },
    { id: 'settings', label: 'Ajustes do Sistema', icon: SettingsIcon, badge: null },
  ];

  return (
    <aside className="w-64 shrink-0 flex flex-col border-r border-white/10 bg-[#070b19]/60 backdrop-blur-xl h-screen sticky top-0 text-gray-300 select-none">
      {/* Brand logo */}
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 relative overflow-hidden group">
          <div className="absolute inset-0 bg-purple-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <Flame className="w-6 h-6 animate-pulse relative z-10" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white m-0 font-sans">Capitafy</h1>
          <span className="text-[10px] text-purple-400 font-mono tracking-widest uppercase">Ecosystem</span>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-thin">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 border group ${
                isActive
                  ? 'bg-purple-600/15 text-purple-300 border-purple-500/30 shadow-lg shadow-purple-500/5 glow-purple'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent hover:border-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 duration-200 ${isActive ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider font-mono ${
                  item.badge === 'ON' 
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse'
                    : 'bg-white/5 text-gray-400 border border-white/10'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Live System stats card */}
      <div className="p-4 mx-4 mb-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400">Status Geral</span>
          <span className="flex items-center gap-1.5 text-[10px] font-mono font-semibold tracking-wider uppercase text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            CONECTADO
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-black/30 border border-white/5">
            <div className="text-[10px] text-gray-500">Pendentes</div>
            <div className="font-bold text-gray-200 font-mono mt-0.5">{pendingDMs}</div>
          </div>
          <div className="p-2 rounded-xl bg-black/30 border border-white/5">
            <div className="text-[10px] text-gray-500">Filtrados</div>
            <div className="font-bold text-gray-200 font-mono mt-0.5">{leadsCount}</div>
          </div>
        </div>
      </div>

      {/* KILL SWITCH Button */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={onKillSwitch}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-500/30 hover:border-red-500/50 hover:text-red-300 transition-all duration-300 group hover:shadow-lg hover:shadow-red-500/10 active:scale-95"
          id="btn-kill-switch"
        >
          <PowerOff className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
          <span className="font-semibold text-xs tracking-wider uppercase">Freio de Mão</span>
        </button>
      </div>
    </aside>
  );
};
