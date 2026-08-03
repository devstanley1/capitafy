import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Square, 
  Settings, 
  Compass, 
  Search, 
  Tag, 
  Eye, 
  Sparkles, 
  Dumbbell, 
  Plane, 
  ChefHat, 
  PawPrint, 
  Briefcase, 
  Bike, 
  Smile, 
  Laugh, 
  Gamepad2, 
  Scissors, 
  Coins, 
  Plus, 
  Trash2,
  X 
} from 'lucide-react';
import { ScraperConfig, SystemStatus } from '../types';

interface MiningViewProps {
  config: ScraperConfig;
  onSaveConfig: (config: ScraperConfig) => Promise<void>;
  systemStatus: SystemStatus;
  onStartMining: () => void;
  onStopMining: () => void;
}

export const MiningView: React.FC<MiningViewProps> = ({
  config,
  onSaveConfig,
  systemStatus,
  onStartMining,
  onStopMining
}) => {
  const [hashtags, setHashtags] = useState(config.hashtags || '');
  const [minFollowers, setMinFollowers] = useState(config.minFollowers || 5000);
  const [maxFollowers, setMaxFollowers] = useState(config.maxFollowers || 50000);
  const [maxPerTag, setMaxPerTag] = useState(config.maxPerTag || 20);
  const [turboMode, setTurboMode] = useState(config.turboMode || false);
  const [isSaving, setIsSaving] = useState(false);

  // Custom presets states
  const [customPresets, setCustomPresets] = useState<{ label: string; tags: string; iconName?: string }[]>(() => {
    try {
      const saved = localStorage.getItem('capitafy_custom_presets');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPresetLabel, setNewPresetLabel] = useState('');
  const [newPresetTags, setNewPresetTags] = useState('');
  const [newPresetIconName, setNewPresetIconName] = useState('Tag');

  useEffect(() => {
    localStorage.setItem('capitafy_custom_presets', JSON.stringify(customPresets));
  }, [customPresets]);

  // Keep internal state updated when parent config changes
  useEffect(() => {
    setHashtags(config.hashtags || '');
    setMinFollowers(config.minFollowers || 5000);
    setMaxFollowers(config.maxFollowers || 50000);
    setMaxPerTag(config.maxPerTag || 20);
    setTurboMode(config.turboMode || false);
  }, [config]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveConfig({
        ...config,
        hashtags,
        minFollowers: Number(minFollowers),
        maxFollowers: Number(maxFollowers),
        maxPerTag: Number(maxPerTag),
        turboMode
      });
    } finally {
      setIsSaving(false);
    }
  };

  const applyPreset = async (presetHashtags: string) => {
    const currentText = hashtags.trim();
    const newHashtags = currentText === '' ? presetHashtags : currentText + ', ' + presetHashtags;
    setHashtags(newHashtags);
    setIsSaving(true);
    try {
      await onSaveConfig({
        ...config,
        hashtags: newHashtags,
        minFollowers: Number(minFollowers),
        maxFollowers: Number(maxFollowers),
        maxPerTag: Number(maxPerTag),
        turboMode
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearHashtags = async () => {
    setHashtags('');
    setIsSaving(true);
    try {
      await onSaveConfig({
        ...config,
        hashtags: '',
        minFollowers: Number(minFollowers),
        maxFollowers: Number(maxFollowers),
        maxPerTag: Number(maxPerTag),
        turboMode
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetLabel.trim() || !newPresetTags.trim()) {
      alert("Por favor, preencha o nome e as hashtags.");
      return;
    }
    // Prevent duplicate labels
    if (defaultPresets.some(p => p.label.toLowerCase() === newPresetLabel.trim().toLowerCase()) || 
        customPresets.some(p => p.label.toLowerCase() === newPresetLabel.trim().toLowerCase())) {
      alert("Já existe um preset com este nome.");
      return;
    }
    const newPreset = {
      label: newPresetLabel.trim(),
      tags: newPresetTags.split(',').map(t => t.trim()).filter(t => t).join(', '),
      iconName: newPresetIconName
    };
    setCustomPresets(prev => [...prev, newPreset]);
    setNewPresetLabel('');
    setNewPresetTags('');
    setNewPresetIconName('Tag');
    setShowAddForm(false);
  };

  const handleDeletePreset = (e: React.MouseEvent, label: string) => {
    e.stopPropagation();
    if (confirm(`Deseja realmente excluir o preset "${label}"?`)) {
      setCustomPresets(prev => prev.filter(p => p.label !== label));
    }
  };

  const defaultPresets = [
    { label: 'Beleza & Moda', tags: 'maquiagem, skincare, moda, lookdodia, unhasdecoradas, blogueiradebeleza, rotinadeskincare, dicasdemoda, penteados, lookinspiração, estilofeminino, cosmeticosecia', iconName: 'Beleza' },
    { label: 'Saúde & Fitness', tags: 'academia, fitnessbrasil, vidasaudavel, dietasemsofrer, tremoemcasa, emagrecimento, nutricionista, maromba, focofitness, marmitafit, crossfitbrasil, suplementação', iconName: 'Fitness' },
    { label: 'Viagem & Turismo', tags: 'viagem, mochileiros, dicasdeviagem, turismobrasil, viajando, destinosimperdiveis, pelomundo, hotelfazenda, viajarfazbem, roteirosdeviagem, ecoturismo', iconName: 'Viagem' },
    { label: 'Culinária & Receitas', tags: 'receitas, culinaria, confeitaria, comidadeverdade, docesgourmet, receitasfaceis, gastronomia, cozinhandocomamor, bolocaseiro, almocodedomingo, salgados', iconName: 'Culinária' },
    { label: 'Pets & Animais', tags: 'petsofinstagram, amopets, gateiros, cachorrinhos, doguinhos, rotinapet, banhoetosa, adestramento, gatinhos, petfriendly, veterinario', iconName: 'Pets' },
    { label: 'Empreendedorismo & Marketing', tags: 'marketingdigital, empreendedorismo, marketingdeinfluencia, trafegopago, criadoresdeconteudo, copymarketing, socialmedia, rendaextraonline, produtividade, mentalidade', iconName: 'Marketing' },
    { label: 'Grau (244)', tags: 'graudebike, 244naoecrime, graudemoto, imperadordograu, puxoucortouraspou, xre300, motovlogbrasil, grauecorte, milgrau, osascorte, hondatitan, motosdograu, grauderua, cortedegiro, arteproibida, foguete, mototerapia, grausp, grauearte, graunaveia, familia244', iconName: 'Grau' },
    { label: 'Mães/Lifestyle', tags: 'maesolteira, arrumesecomigo, maternidadereal, rotinademae, lookdebalada, resenha, curtição, maesolo, fds, solteira, lookdodia, vlogdiario, vidademae, lookdodiabrasil', iconName: 'Mães' },
    { label: 'Humor & Comédia', tags: 'humornordestino, comediaregional, esquetes, memesbrasil, humordebairro, humorbrasil, comediante, engracado, piadas, memesbr, videosengracados, rir, zueira, humordiario, comediabrasileira, memes, humornegro, videospararir, trollagem, pegadinha, whindersson', iconName: 'Humor' },
    { label: 'Gamers & Streaming', tags: 'freefirebrasil, ffbrasil, nobrutv, cerol, loudgg, freefirehighlights, garenafreefire, jogadormobile, capa, xtreino, clipadasff, freefirememes, pubgmobilebrasil, esportsbrasil, robloxbrasil, stumbleguysbrasil, mobilegamer, proplayer, brawlstarsbrasil, jogosdecelular, loud', iconName: 'Gamers' },
    { label: 'Barbearias', tags: 'barbearia, corteblindado, barbeirosbrasil, cortedecabelo, degrade, midfade, freestylehair, barbeiroraiz, barbershop, batalhadebarbeiros, barbeariamoderna, cabeloplatinado, nevou, cortesmasculinos, barbaterapia, estilomasculino, quebrada, mandrakedo, estilomandrake, modamasculina, barbeariasp', iconName: 'Barbearias' },
    { label: 'Apostas', tags: 'casadeapostas, apostasesportivas, jogosdeazar, palpitesdefutebol, aposta, green, futebolbrasileiro, traderesportivo, apostas, bilhetepronto, bet, cassinoonline, bancaalta, apostasfutebol, apostador, tips, lucro, dinheiro, jogosonline, mercadogol', iconName: 'Apostas' }
  ];

  const getPresetIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Beleza':
        return <Sparkles className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />;
      case 'Fitness':
        return <Dumbbell className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />;
      case 'Viagem':
        return <Plane className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />;
      case 'Culinária':
        return <ChefHat className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />;
      case 'Pets':
        return <PawPrint className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />;
      case 'Marketing':
        return <Briefcase className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />;
      case 'Grau':
        return <Bike className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />;
      case 'Mães':
        return <Smile className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />;
      case 'Humor':
        return <Laugh className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />;
      case 'Gamers':
        return <Gamepad2 className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />;
      case 'Barbearias':
        return <Scissors className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />;
      case 'Apostas':
        return <Coins className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />;
      default:
        return <Tag className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />;
    }
  };

  const handleConnectAccount = () => {
    fetch('/api/system/connect-bot', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        alert("Instância do navegador lançada para login. Siga as instruções no console de logs abaixo!");
      })
      .catch(err => {
        console.error("Erro ao conectar conta:", err);
        alert("Erro ao conectar conta. Certifique-se de que o servidor está rodando.");
      });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Mineração de Leads</h2>
        <p className="text-gray-400 text-xs mt-1">Busque novos perfis qualificados no Instagram com base em hashtags e filtros.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings column */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="p-6 rounded-2xl bg-[#0f172a]/45 backdrop-blur-xl border border-white/8 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-purple-400" />
              Parâmetros de Filtro do Crawler
            </h3>

            {/* Hashtags Input */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Hashtags Alvo (separadas por vírgula)
              </label>
              <textarea
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="ex: grau244, rendabrasil, apostas"
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-black/40 text-white border border-white/8 focus:outline-none focus:border-purple-500/50 text-xs transition-all font-mono"
                required
              />
            </div>

            {/* Config Numbers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Seguidores Mínimos
                </label>
                <input
                  type="number"
                  value={minFollowers}
                  onChange={(e) => setMinFollowers(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 text-white border border-white/8 focus:outline-none focus:border-purple-500/50 text-xs transition-all font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Seguidores Máximos
                </label>
                <input
                  type="number"
                  value={maxFollowers}
                  onChange={(e) => setMaxFollowers(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 text-white border border-white/8 focus:outline-none focus:border-purple-500/50 text-xs transition-all font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Limite por Hashtag
                </label>
                <input
                  type="number"
                  value={maxPerTag}
                  onChange={(e) => setMaxPerTag(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 text-white border border-white/8 focus:outline-none focus:border-purple-500/50 text-xs transition-all font-mono"
                  required
                />
              </div>
            </div>

            {/* Turbo Mode Switch */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
              <div>
                <div className="text-xs font-semibold text-white">Modo Turbo de Rede</div>
                <div className="text-[10px] text-gray-500 mt-0.5">Bloqueia imagens e CSS para acelerar o crawler em 300%.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={turboMode}
                  onChange={(e) => setTurboMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600 peer-checked:after:bg-white" />
              </label>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 font-semibold text-xs tracking-wider uppercase border border-purple-500/20 hover:border-purple-500/40 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSaving ? 'Salvando...' : 'Salvar Configuração'}
              </button>
            </div>
          </form>

          {/* Quick presets card */}
          <div className="p-6 rounded-2xl bg-[#0f172a]/45 backdrop-blur-xl border border-white/8 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-purple-400" />
                Presets de Busca (Nichos de Prospecção)
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 hover:border-purple-500/30 text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Preset
                </button>
                <button
                  type="button"
                  onClick={handleClearHashtags}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30 text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5"
                  title="Limpar todas as hashtags"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Limpar
                </button>
              </div>
            </div>

            <p className="text-gray-400 text-xs">Selecione uma categoria para adicionar a lista de hashtags instantaneamente ou crie as suas próprias.</p>

            {/* Expandable Add Preset Form */}
            {showAddForm && (
              <form onSubmit={handleAddPreset} className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex justify-between items-center pb-1 border-b border-white/5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Criar Novo Preset de Busca</h4>
                  <button type="button" onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Nome do Preset</label>
                    <input
                      type="text"
                      value={newPresetLabel}
                      onChange={(e) => setNewPresetLabel(e.target.value)}
                      placeholder="Ex: Moda Infantil"
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 text-white border border-white/8 focus:outline-none focus:border-purple-500/50 text-xs font-sans transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Ícone</label>
                    <select
                      value={newPresetIconName}
                      onChange={(e) => setNewPresetIconName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 text-white border border-white/8 focus:outline-none focus:border-purple-500/50 text-xs font-sans transition-all"
                    >
                      <option value="Tag">Padrão (Tag)</option>
                      <option value="Beleza">Brilho (Beleza)</option>
                      <option value="Fitness">Halter (Saúde)</option>
                      <option value="Viagem">Avião (Viagem)</option>
                      <option value="Culinária">Chapéu de Chef (Comida)</option>
                      <option value="Pets">Pegada (Pets)</option>
                      <option value="Marketing">Maleta (Negócios)</option>
                      <option value="Grau">Moto/Bike (Grau)</option>
                      <option value="Mães">Sorriso (Mães)</option>
                      <option value="Humor">Riso (Comédia)</option>
                      <option value="Gamers">Controle (Jogos)</option>
                      <option value="Barbearias">Tesoura (Barbearia)</option>
                      <option value="Apostas">Moedas (Apostas)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Hashtags (separadas por vírgula)</label>
                  <textarea
                    value={newPresetTags}
                    onChange={(e) => setNewPresetTags(e.target.value)}
                    placeholder="Ex: modainfantil, roupadecrianca, maedemenina"
                    rows={2}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/40 text-white border border-white/8 focus:outline-none focus:border-purple-500/50 text-xs font-mono transition-all"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-semibold transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold transition-all shadow-md shadow-purple-500/10"
                  >
                    Salvar Preset
                  </button>
                </div>
              </form>
            )}

            {/* Presets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[...defaultPresets, ...customPresets].map((preset) => {
                const isCustom = !defaultPresets.some(p => p.label === preset.label);
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset.tags)}
                    className="flex flex-col items-start p-4 rounded-xl bg-black/30 border border-white/5 hover:border-purple-500/30 text-left transition-all duration-200 group active:scale-[0.98] relative overflow-hidden"
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-semibold text-xs text-white group-hover:text-purple-400 flex items-center gap-1.5 transition-colors pr-6">
                        {getPresetIcon(preset.iconName)}
                        {preset.label}
                      </span>
                      {isCustom && (
                        <button
                          type="button"
                          onClick={(e) => handleDeletePreset(e, preset.label)}
                          className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all absolute top-2.5 right-2.5"
                          title="Excluir preset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 font-mono line-clamp-1 pr-6 w-full">
                      {preset.tags}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Panel Column */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0f172a]/45 backdrop-blur-xl border border-white/8 flex flex-col items-center text-center space-y-6 justify-center h-full min-h-[350px]">
            {systemStatus.mining ? (
              <>
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-purple-500/10 border-2 border-dashed border-purple-500 animate-spin absolute inset-0" />
                  <div className="w-20 h-20 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center relative z-10">
                    <Search className="w-8 h-8 text-purple-400 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">Minerando Leads</h3>
                  <p className="text-gray-400 text-xs mt-2 max-w-[200px] mx-auto">
                    O bot está navegando pelo Instagram buscando perfis qualificados nas tags fornecidas.
                  </p>
                </div>
                <button
                  onClick={onStopMining}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-500/30 hover:border-red-500/50 hover:text-red-300 font-bold text-xs tracking-wider uppercase transition-all duration-300 active:scale-95"
                >
                  <Square className="w-4 h-4 fill-current" />
                  Parar Mineração
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">Ecosistema Parado</h3>
                  <p className="text-gray-400 text-xs mt-2 max-w-[200px] mx-auto">
                    Configure as hashtags e inicie o motor para popular o CRM automaticamente.
                  </p>
                </div>
                <div className="w-full space-y-3">
                  <button
                    onClick={onStartMining}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs tracking-wider uppercase border border-purple-500/30 shadow-lg shadow-purple-500/15 transition-all hover:shadow-purple-500/20 active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Iniciar Mineração
                  </button>

                  <button
                    onClick={handleConnectAccount}
                    type="button"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-semibold text-xs tracking-wider uppercase border border-white/10 transition-all active:scale-95"
                  >
                    <Eye className="w-4 h-4" />
                    Autenticar / Conectar Conta
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
