import React, { useRef, useEffect } from 'react';
import { Terminal, Trash2, ChevronUp, ChevronDown, CheckCircle, AlertTriangle } from 'lucide-react';
import { LogMessage, SystemStatus } from '../types';

interface TerminalLogsProps {
  logs: LogMessage[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  clearLogs: () => void;
  systemStatus: SystemStatus;
}

export const TerminalLogs: React.FC<TerminalLogsProps> = ({
  logs,
  isOpen,
  setIsOpen,
  clearLogs,
  systemStatus,
}) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  const getLogColor = (type: string) => {
    switch (type) {
      case 'miner_error':
      case 'sender_error':
        return 'text-red-400';
      case 'miner':
        return 'text-purple-300';
      case 'sender':
        return 'text-emerald-300';
      case 'system':
        return 'text-amber-300 font-semibold';
      default:
        return 'text-gray-300';
    }
  };

  const getPrefix = (type: string) => {
    switch (type) {
      case 'miner_error':
      case 'sender_error':
        return '[ERRO]';
      case 'miner':
        return '[MINER]';
      case 'sender':
        return '[DISPARO]';
      case 'system':
        return '[SISTEMA]';
      default:
        return '[LOG]';
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-64 right-0 z-40 transition-all duration-300 border-t border-white/10 bg-[#070b19]/95 backdrop-blur-xl ${
        isOpen ? 'h-80' : 'h-12'
      }`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 h-12 border-b border-white/5 cursor-pointer bg-[#0c132b]/80" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-3">
          <Terminal className={`w-4 h-4 ${systemStatus.mining || systemStatus.sending ? 'text-emerald-400 animate-pulse' : 'text-purple-400'}`} />
          <span className="font-mono text-xs font-semibold tracking-wider uppercase text-gray-300">
            Console de Logs em Tempo Real
          </span>
          <div className="flex gap-2">
            {systemStatus.mining && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                MINANDO
              </span>
            )}
            {systemStatus.sending && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                ENVIANDO DM
              </span>
            )}
            {!systemStatus.mining && !systemStatus.sending && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-gray-500/10 text-gray-400 border border-white/5">
                STANDBY
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={clearLogs}
            className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors"
            title="Limpar logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      {isOpen && (
        <div className="p-4 overflow-y-auto h-[calc(100%-3rem)] font-mono text-[11px] leading-relaxed bg-[#030712] text-gray-300 scrollbar-thin select-text selection:bg-purple-500/30">
          <div className="space-y-1">
            <div className="text-gray-500 border-b border-white/5 pb-2 mb-2">
              -- SISTEMA CAPITAFY ECOSYSTEM STARTED [{new Date().toLocaleString()}] --
            </div>
            {logs.length === 0 ? (
              <div className="text-gray-500 italic">Aguardando atividades ou saída do terminal...</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 hover:bg-white/5 py-0.5 px-1 rounded transition-colors">
                  <span className="text-gray-500 select-none">[{log.timestamp}]</span>
                  <span className={`font-semibold shrink-0 select-none ${getLogColor(log.type)}`}>
                    {getPrefix(log.type)}:
                  </span>
                  <span className={`whitespace-pre-wrap ${getLogColor(log.type)}`}>{log.text}</span>
                </div>
              ))
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>
      )}
    </div>
  );
};
