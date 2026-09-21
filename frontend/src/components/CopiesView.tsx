import React, { useState, useEffect } from 'react';
import { Play, Square, Save, FileText, Send, HelpCircle, Filter, Sparkles, Plus, Copy, Check, ShieldCheck, Zap, Layers } from 'lucide-react';
import { SystemStatus } from '../types';

interface CopiesViewProps {
  copies: string[];
  onSaveCopies: (copies: string[]) => Promise<void>;
  systemStatus: SystemStatus;
  onStartSending: (niche: string) => void;
  onStopSending: () => void;
  uniqueNiches: string[];
}

const PRESET_COPY_POOLS: Record<string, string[]> = {
  apostas: [
    "Olá {nome}, tudo bem? Seu perfil tem um engajamento excelente e curtimos muito o seu estilo. Representamos uma plataforma de apostas esportivas licenciada e temos uma proposta de banca patrocinada + comissões de até 70% por indicação. Topa?",
    "Oi {nome}, tudo ótimo? Vimos suas publicações e achamos seu público super qualificado. Temos uma casa de apostas em expansão no Brasil e gostaríamos de fechar uma campanha de stories pagos para promover nosso bônus de boas-vindas. Posso te apresentar?",
    "Olá! Vi seu lifestyle e a qualidade dos seus stories. Temos um robô de sinais / grupo VIP de apostas e queríamos te propor uma parceria para divulgar o link com comissão recorrente e banca inicial grátis de R$ 500. Bora conversar?",
    "Oi {nome}, beleza? Temos interesse em patrocinar influenciadores no nicho de entretenimento e esportes para divulgação de palpites. Oferecemos um fixo mensal + bônus de performance por cada cadastro ativo. Onde posso te enviar o PDF do projeto?",
    "Olá {nome}, tudo tranquilo? Vimos que seu público gosta de futebol/games. Queremos fechar uma parceria de publipost nos Stories para nossa plataforma de apostas online. Qual o seu valor por inserção de 3 stories com link?",
    "Oi {nome}! Temos um sistema inovador de apostas integradas e buscamos parceiros com bom engajamento para provador e recomendação nos Stories. Se tiver interesse em receber comissões automáticas no Pix, me avisa!"
  ],
  grau_244: [
    "Eae {nome}, blz? Só manobra chave no feed hein! A gente representa uma marca de peças de moto e roupas de quebrada e queríamos te mandar um kit pesado (camiseta, boné e adesivos) de presente. Qual o tamanho que você usa?",
    "Salve {nome}, de boa? Muito louco os seus motovlogs! Temos um site de acessórios de moto e estamos selecionando os pilotos mais brabos do Instagram para representar a marca e fechar parceria paga. Bora trocar uma ideia?",
    "Eae parceiro, blz? Vi seus vídeos dando grau e o engajamento tá insano! A gente faz parceria com páginas de moto e sorteios, e temos um projeto pra você ganhar uma grana divulgando rifas e marcas parceiras. Topa ver como funciona?",
    "Salve {nome}, beleza? Seu perfil tá crescendo rápido e as fotos da sua moto estão monstras! Queremos te mandar um patrocínio de peças/capacetes para você dar aquele talento no visual e postar nos Stories. Onde eu te mando os detalhes?",
    "Eae irmão! Só piloto de verdade nas suas postagens. Temos uma marca parceira de vestuário de rua e queremos fazer uma campanha de provador ou divulgação paga com você nos Stories. Quanto você cobra por story?",
    "Salve {nome}! Seus vídeos empinando a moto são muito compartilhados. Fazemos parcerias com influenciadores do mundo das duas rodas para envio de mimos e patrocínios mensais de manutenção. Quer conhecer a proposta?"
  ],
  beleza_moda: [
    "Olá {nome}! Tudo bem? Vi suas publicações de looks e amei o seu estilo! Trabalhamos com marcas de moda feminina e estamos selecionando novos perfis para campanhas de recebidos. Teria interesse em conhecer?",
    "Oi {nome}, tudo joia? Adorei suas dicas de maquiagem e autocuidado no feed. Temos uma proposta super bacana de parceria com cupom exclusivo e comissões para criadoras de conteúdo de beleza. Posso te enviar os detalhes?",
    "Olá! Vi seu perfil no nicho de moda e achei super autêntico. Nossa marca está lançando uma nova coleção e queremos enviar algumas peças de presente para você mostrar no seu perfil. Qual o melhor contato para combinarmos?",
    "Oi {nome}, tudo bom? Adorei sua energia e a qualidade das suas fotos! Fazemos assessoria para lojas de acessórios e beleza, e estamos buscando parcerias no seu nicho. Se tiver interesse em receber mimos, me avisa!",
    "Opa {nome}! Seu feed de beleza é incrível, as dicas de skincare são ótimas. Gostaria de te enviar um kit exclusivo da nossa marca parceira sem custos, para você testar e compartilhar com seus seguidores. Bora fechar?",
    "Olá {nome}! Tudo bem? Fazemos parcerias com influenciadoras de moda para provadores e divulgação de lançamentos. Achamos o seu perfil super fashion. Toparia dar uma olhada na nossa proposta?"
  ],
  saude_fitness: [
    "Fala {nome}! Tudo bem? Vi sua rotina de treinos e dieta no feed, muito foco! Representamos uma marca de suplementos e moda fitness, e gostaríamos de te convidar para o nosso time de atletas patrocinados. O que acha?",
    "Oi {nome}, tudo joia? Curti demais seu conteúdo sobre vida saudável. Estamos expandindo nossa marca de marmitas fit e produtos naturais e queremos te enviar um cupom de desconto exclusivo + kit de degustação. Topa?",
    "Olá! Seu perfil fitness transmite muita motivação. Trabalhamos com divulgação de acessórios esportivos e roupas de academia. Queremos te enviar alguns lançamentos para você testar e postar no feed. Bora fechar?",
    "Oi {nome}, tudo tranquilo? Muito bom ver a sua evolução nos treinos! Temos um programa de afiliados com comissão recorrente para influenciadores que promovem a saúde. Posso te mandar o projeto por aqui?",
    "Fala {nome}, beleza? Seu feed é pura inspiração para quem quer treinar! A nossa assessoria tem uma proposta de parceria paga para divulgar um aplicativo de treinos em casa. Teria um minuto para ver os detalhes?",
    "Olá! Tudo bom? Buscamos perfis que compartilham conteúdo de academia e alimentação saudável para campanhas pagas. Achamos sua presença muito forte. Gosta da ideia de fechar uma parceria?"
  ],
  viagem_turismo: [
    "Olá {nome}! Tudo bem? Suas fotos de viagem são sensacionais, dá uma vontade enorme de viajar! Representamos uma agência de turismo e queremos te propor uma parceria para promover nossos destinos. Posso te mandar a ideia?",
    "Oi {nome}, tudo ótimo? Adorei os roteiros e dicas que você posta. Temos um clube de benefícios e hospedagens para criadores de conteúdo de viagem. Gostaria de receber uma diária cortesia em troca de cobertura? Me avisa!",
    "Olá! Vi seu feed e amei as paisagens que você compartilha. Trabalhamos com marcas de malas de viagem e acessórios e gostaríamos de te presentear com um kit completo de malas da nova coleção. Qual o seu melhor contato?",
    "Oi {nome}, tudo bom? Seu perfil é excelente no nicho de viagens. Estamos organizando uma press trip com alguns criadores e seu nome foi indicado. Gostaria de receber o convite com as informações completas?",
    "Olá {nome}! Muito massa o seu conteúdo de dicas de viagem pelo Brasil. Nossa plataforma de passagens aéreas e hotéis está com uma campanha ativa de cupons exclusivos para seus seguidores. Topa conhecer as condições?",
    "Oi {nome}, beleza? Adoramos seus posts de turismo e viagens. Fazemos assessoria de marketing para resorts e hotéis parceiros e estamos selecionando perfis para divulgação. Posso te enviar a proposta comercial?"
  ],
  culinaria_receitas: [
    "Olá {nome}! Que pratos deliciosos você prepara, dá água na boca! Representamos uma marca de utensílios de cozinha de alta qualidade e queremos te enviar um kit de panelas e facas para suas próximas receitas. Topa?",
    "Oi {nome}, tudo joia? Adorei o seu conteúdo culinário e as receitas práticas que posta. Temos uma campanha de patrocínio com uma marca de ingredientes e condimentos selecionados. Gosta da ideia de cozinhar com nossos produtos?",
    "Olá! Suas receitas são muito criativas e explicadas de forma simples. Trabalhamos com assessoria gastronômica e gostaríamos de te convidar para um evento exclusivo de degustação e parceria paga. Qual seu e-mail de contato?",
    "Oi {nome}, tudo tranquilo? Seu feed de confeitaria/comida é lindo demais! Uma marca parceira de eletrodomésticos quer te presentear com uma batedeira/liquidificador em troca de um vídeo de receita. Toparia conversar?",
    "Olá {nome}! Muito bom o seu conteúdo de receitas saudáveis. Estamos promovendo um livro digital de receitas e queríamos fazer uma divulgação paga com você nos Stories. Qual seu valor por publipost?",
    "Oi {nome}, beleza? Curto demais seus vídeos de culinária! Fazemos parcerias com cozinheiros e confeiteiros do Instagram para envio de mimos e campanhas de marca. Posso te apresentar nosso portfólio?"
  ],
  pets_animais: [
    "Olá! Que fofura de perfil! Sou apaixonado(a) pelo conteúdo do seu pet. Representamos uma marca premium de rações e brinquedos pet e queremos enviar um box recheado de mimos para vocês. Qual o endereço de envio?",
    "Oi {nome}, tudo joia? O seu doguinho/gatinho é uma estrela! Temos uma pet shop online de produtos naturais e gostaríamos de te convidar para ser embaixador(a) da marca, com direito a cupom de comissão e mimos mensais. Topa?",
    "Olá! Tudo bom? Seu perfil pet tem um engajamento maravilhoso. Trabalhamos com acessórios personalizados (coleiras, caminhas, bandanas) e queríamos te presentear com um kit exclusivo com o nome do seu pet. Me avisa se aceita!",
    "Oi {nome}, tudo tranquilo? Muito legal ver a rotina e as travessuras do seu pet no feed! Nossa assessoria tem uma proposta de campanha paga para divulgar um plano de saúde pet. Teria interesse em conhecer?",
    "Olá {nome}! O conteúdo de vocês é super divertido. Trabalhamos com marcas de produtos de higiene e banho pet e estamos recrutando influenciadores de quatro patas para provar nossa nova linha. Posso te enviar as fotos?",
    "Oi! Tudo bem? Adoramos os seus posts com animais. Temos uma marca parceira focada em bem-estar animal e queremos fazer uma parceria para distribuição de cupons e brindes. Como podemos falar de negócios?"
  ],
  empreendedorismo_marketing: [
    "Olá {nome}! Tudo bem? Seus posts sobre marketing e negócios são muito diretos e trazem muito valor. Sou de uma assessoria de novos projetos e estamos selecionando co-produtores e afiliados autoridade no seu nicho. Bora conversar?",
    "Oi {nome}, tudo joia? Curti muito seus conteúdos de dicas de tráfego e vendas online. Estamos fechando parcerias de indicação para uma nova ferramenta SaaS de automação que ajuda o seu público. Posso te mandar os detalhes?",
    "Olá! Suas postagens sobre produtividade e mentalidade empreendedora são ótimas. Temos uma plataforma de cursos digitais e queremos te propor uma ação paga nos Stories para divulgar nossa semana de negócios. Qual seu e-mail de contato?",
    "Oi {nome}, tudo tranquilo? Seu feed sobre empreendedorismo tem uma linguagem muito forte. Temos um programa exclusivo de mentoria e queremos te convidar como influenciador parceiro para gerar comissões de até 50%. Topa?",
    "Olá {nome}! Muito massa o seu lifestyle de negócios. Nossa agência atende players do mercado digital e estamos contratando influencers para campanhas pontuais de lançamentos. Teria interesse em fazer um orçamento?",
    "Oi {nome}, beleza? Acompanho seus posts e gosto muito da sua visão profissional. Temos uma proposta de patrocínio para o seu canal/Instagram com foco em ferramentas de negócios. Toparia dar uma olhada na nossa proposta comercial?"
  ],
  maes_lifestyle: [
    "Olá {nome}! Tudo bem? Adoro acompanhar a sua rotina materna real e as dicas de família que você posta! Trabalhamos com uma marca infantil e de produtos para o lar, e gostaríamos de te enviar alguns recebidos. Qual o melhor contato?",
    "Oi {nome}, tudo joia? O seu estilo de vida e a sua maternidade são super inspiradores. Temos uma linha completa de autocuidado para mães e gostaríamos de fechar uma parceria de provador e cupons com você. Teria interesse?",
    "Olá! Vi suas publicações de lifestyle e achei super autênticas. Representamos uma marca de decoração e organização para casa e queremos te presentear com algumas peças para renovar o ambiente. Como podemos combinar?",
    "Oi {nome}, tudo bom? Seus vlogs diários e arrume-se comigo são ótimos! Temos um aplicativo de bem-estar infantil e queremos fazer uma campanha de divulgação nos seus stories. Posso te enviar as informações comerciais?",
    "Olá {nome}! Seu feed transmite muita leveza e amor de família. Nossa assessoria de marcas quer te propor uma parceria anual de publicações patrocinadas sobre moda e casa. Qual o seu e-mail comercial?",
    "Oi {nome}, tudo tranquilo? Muito legal o seu conteúdo sobre dia a dia e rotina com as crianças. Trabalhamos com marcas de produtos de higiene e cuidados familiares e queremos te mandar um box exclusivo. Topa conhecer?"
  ],
  humor_comedia: [
    "Eae {nome}, beleza? Dou muita risada com os seus vídeos, a comédia é de primeira! Representamos uma marca de bebidas/snacks e queríamos te patrocinar enviando um kit para você curtir no final de semana. Onde podemos enviar?",
    "Oi {nome}, tudo bom? O seu humor e as suas esquetes são muito criativos. Temos uma proposta de publicidade paga para você inserir nossa marca de forma orgânica e engraçada em um dos seus próximos vídeos. Topa o desafio?",
    "Olá! Seus memes e vídeos de humor têm um engajamento sensacional. Trabalhamos com campanhas de divulgação de aplicativos e jogos divertidos e queríamos fazer uma sequência de stories pagos com você. Qual seu orçamento comercial?",
    "Oi {nome}, de boa? Seus posts engraçados são os melhores do feed! Temos um programa de parceiros de comédia com envios mensais de presentes e comissão de vendas para seu público. Posso te explicar a mecânica?",
    "Eae parceiro, beleza? Seus vídeos de humor regional/cotidiano são muito compartilhados. Nossa marca de roupas descoladas quer te vestir para seus próximos vídeos. Gosta da ideia de fechar uma parceria de mimos?",
    "Olá {nome}! Seus stories são pura diversão. Fazemos assessoria de marketing digital para marcas de entretenimento e estamos selecionando criadores de comédia para novos lançamentos. Posso te mandar a proposta por aqui?"
  ],
  gamers_streaming: [
    "Fala {nome}, beleza? Vi suas clipadas de Free Fire/jogos e as jogadas são muito insanas! Representamos uma marca de acessórios gamers (headset, mouse, teclado) e queríamos te mandar um setup novo. Qual seu melhor contato?",
    "Salve {nome}, de boa? Suas streams e gameplays são muito divertidas! Estamos lançando um novo jogo de celular/PC e queremos fechar uma campanha de live ou post patrocinado com você no Instagram. Posso te passar os detalhes?",
    "Eae gamer! Seu perfil tem uma comunidade muito fiel de jogos. Trabalhamos com bebidas energéticas e marcas gamers e queríamos te patrocinar com fornecimento mensal e cupom exclusivo para seus seguidores. Topa fechar?",
    "Oi {nome}, tudo tranquilo? Muito massa as suas dicas e notícias sobre o mundo dos games! Temos uma loja de informática parceira e queremos fazer um sorteio conjunto ou publipost pago no seu feed. Teria interesse?",
    "Fala {nome}! Seu conteúdo de games é top demais. Nossa agência atende campeonatos e aplicativos de eSports e estamos contratando streamers para divulgação de novas ligas. Qual seu valor por story/post?",
    "Salve {nome}! Curti muito seu estilo de conteúdo de Roblox/Minecraft/FF. Queremos fazer uma parceria com envio de gift cards e periféricos para você presentear sua audiência em troca de visibilidade. Bora conversar?"
  ],
  barbearias: [
    "Eae {nome}, beleza? Só degradê brabo no seu feed! Representamos uma marca profissional de pomadas, óleos de barba e produtos de barbearia e queríamos te enviar um kit completo para você usar e testar nos seus clientes. Topa?",
    "Salve {nome}, tudo joia? O seu trabalho de corte freestyle e platina é arte de verdade! Temos uma loja de máquinas de corte e tesouras importadas e gostaríamos de te convidar para o nosso time de barbeiros parceiros. Bora fechar?",
    "Olá! Vi as transformações de visual que você posta e o engajamento tá sensacional. Temos um sistema de gestão para barbearias e queremos fechar uma parceria de recomendação paga com você nos Stories. Posso te mandar a proposta?",
    "Oi {nome}, tudo tranquilo? Sua barbearia tá com um visual muito moderno! Queremos te patrocinar com aventais de couro personalizados e capas de corte com o logo da sua marca em troca de algumas menções. Qual o melhor contato?",
    "Eae irmão, blz? Curti muito seus motovlogs/vídeos de barbearia do dia a dia. Temos uma marca parceira de moda masculina e queremos fazer um publipost pago com foco nos clientes da barbearia. Quanto você cobra por divulgação?",
    "Salve {nome}! Seu feed de cortes masculinos é pura inspiração. Fazemos assessoria para barbeiros profissionais e queremos te enviar nossa nova linha de cuidados pós-barba de presente. Como podemos combinar o envio?"
  ]
};

const PRESET_OPTIONS = [
  { value: 'apostas', label: 'Apostas & iGaming' },
  { value: 'grau_244', label: 'Grau (244) & Motos' },
  { value: 'beleza_moda', label: 'Beleza & Moda' },
  { value: 'saude_fitness', label: 'Saúde & Fitness' },
  { value: 'viagem_turismo', label: 'Viagem & Turismo' },
  { value: 'culinaria_receitas', label: 'Culinária & Receitas' },
  { value: 'pets_animais', label: 'Pets & Animais' },
  { value: 'empreendedorismo_marketing', label: 'Empreendedorismo & Marketing' },
  { value: 'maes_lifestyle', label: 'Mães / Lifestyle' },
  { value: 'humor_comedia', label: 'Humor & Comédia' },
  { value: 'gamers_streaming', label: 'Gamers & Streaming' },
  { value: 'barbearias', label: 'Barbearias' }
];

export const CopiesView: React.FC<CopiesViewProps> = ({
  copies,
  onSaveCopies,
  systemStatus,
  onStartSending,
  onStopSending,
  uniqueNiches
}) => {
  // Escopo de edição: 'global' ou 'niche'
  const [editorScope, setEditorScope] = useState<'global' | 'niche'>('global');
  const [activeNicheKey, setActiveNicheKey] = useState('apostas');

  const [editorText, setEditorText] = useState('');
  const [nicheFilter, setNicheFilter] = useState('todos');
  const [isSaving, setIsSaving] = useState(false);

  // Armazenamento de cópias customizadas por nicho
  const [nicheCopiesMap, setNicheCopiesMap] = useState<Record<string, string[]>>({});

  // States da Fábrica de Copys
  const [selectedPreset, setSelectedPreset] = useState('apostas');
  const [generatedCopies, setGeneratedCopies] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  // Carregar cópias por nicho do servidor
  useEffect(() => {
    fetch('/api/system/copies-by-niche')
      .then(res => res.json())
      .then(data => {
        if (data && data.copiesByNiche) {
          setNicheCopiesMap(data.copiesByNiche);
        }
      })
      .catch(() => {});
  }, []);

  // Sincronizar o editor conforme escopo ativo
  useEffect(() => {
    if (editorScope === 'global') {
      if (copies && copies.length > 0) {
        setEditorText(copies.join('\n---\n'));
      } else {
        setEditorText('');
      }
    } else {
      const specificCopies = nicheCopiesMap[activeNicheKey] || PRESET_COPY_POOLS[activeNicheKey] || [];
      setEditorText(specificCopies.join('\n---\n'));
    }
  }, [editorScope, activeNicheKey, copies, nicheCopiesMap]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const parsedCopies = editorText
        .split('---')
        .map(c => c.trim())
        .filter(c => c !== '');

      if (editorScope === 'global') {
        await onSaveCopies(parsedCopies);
      } else {
        // Salvar cópias do nicho específico
        const updated = {
          ...nicheCopiesMap,
          [activeNicheKey]: parsedCopies
        };
        setNicheCopiesMap(updated);

        await fetch('/api/system/copies-by-niche', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ copiesByNiche: updated })
        });

        alert(`Templates do nicho "${PRESET_OPTIONS.find(p => p.value === activeNicheKey)?.label}" salvos com sucesso!`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleStart = () => {
    onStartSending(nicheFilter);
  };

  const generateCopies = () => {
    const pool = PRESET_COPY_POOLS[selectedPreset] || [];
    if (pool.length < 3) return;

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    setGeneratedCopies(shuffled.slice(0, 3));
    setCopiedIdx(null);
    setJustAdded(false);
  };

  const handleCopySingle = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const applyGeneratedCopiesToNiche = () => {
    if (generatedCopies.length === 0) return;

    // Muda o escopo para o nicho que foi gerado
    setEditorScope('niche');
    setActiveNicheKey(selectedPreset);

    const formatted = generatedCopies.join('\n---\n');
    setEditorText(formatted);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
          <FileText className="text-purple-400 w-7 h-7" />
          Fábrica de Copys & Disparo Segmentado
        </h2>
        <p className="text-gray-400 text-xs mt-1">Crie abordagens personalizadas para cada nicho e dispare com identificação automática do perfil.</p>
      </div>

      {/* Banner de Proteção Inteligente por Nicho */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-emerald-950/30 to-purple-950/40 border border-emerald-500/30 shadow-lg relative overflow-hidden">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 mt-0.5">
            <ShieldCheck className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                IA de Identificação de Nicho Ativa
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 fill-current" /> Proteção Anti-Troca de Nicho
              </span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Ao iniciar o disparo, o robô analisa o perfil individual de cada lead. Perfis de <strong className="text-emerald-400 font-semibold">apostas esportivas / iGaming</strong> receberão copys exclusivas de apostas, enquanto perfis de <strong className="text-purple-400 font-semibold">grau / motos</strong> receberão copys de motos. Nenhuma mensagem é cruzada indevidamente.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Editor */}
          <div className="p-6 rounded-2xl bg-[#0f172a]/45 backdrop-blur-xl border border-white/8 space-y-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
            
            {/* Header com Abas de Escopo */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-white">Visualizar / Editar Templates:</span>
              </div>

              {/* Botões de alternância de escopo */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setEditorScope('global')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    editorScope === 'global'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Templates Gerais
                </button>
                <button
                  type="button"
                  onClick={() => setEditorScope('niche')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    editorScope === 'niche'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Por Nicho
                </button>
              </div>
            </div>

            {/* Seletor de Nicho quando escopo é nicho */}
            {editorScope === 'niche' && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 animate-fade-in">
                <span className="text-xs text-gray-300 font-medium whitespace-nowrap">Segmento Ativo:</span>
                <select
                  value={activeNicheKey}
                  onChange={(e) => setActiveNicheKey(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-black/50 text-white border border-white/10 focus:outline-none focus:border-purple-500 transition-all"
                >
                  {PRESET_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-[#0b0c14]">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-gray-400">
                {editorScope === 'global' 
                  ? 'Templates de fallback geral (usados caso o lead não tenha nicho específico).' 
                  : `Templates dedicados e exclusivos para perfis de ${PRESET_OPTIONS.find(p => p.value === activeNicheKey)?.label}.`}
              </span>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white border border-purple-500/30 text-xs transition-all duration-300 active:scale-95 disabled:opacity-50 font-bold shadow-md shadow-purple-500/10"
                id="btn-save-copies"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? 'Salvando...' : 'Salvar Templates'}
              </button>
            </div>
            
            <p className="text-[11px] text-gray-500 leading-normal">
              Use <code className="text-purple-400 bg-purple-500/5 px-1.5 py-0.5 rounded text-[10px] font-mono border border-purple-500/10">---</code> em uma linha isolada para separar múltiplos templates. O robô irá alternar entre eles a cada envio.
            </p>

            <textarea
              value={editorText}
              onChange={(e) => setEditorText(e.target.value)}
              placeholder={`Olá {nome}, tudo bem?\nVi seu perfil e achei seu engajamento incrível...\n---\nFala {nome}, tudo certo?\nTemos uma proposta imperdível para o seu nicho...`}
              rows={11}
              className="w-full px-4 py-3 rounded-xl bg-black/40 text-white border border-white/8 focus:outline-none focus:border-purple-500/50 text-xs transition-all font-mono leading-relaxed resize-y"
              required
            />
          </div>

          {/* Fábrica de Copys Section */}
          <div className="p-6 rounded-2xl bg-[#0f172a]/45 backdrop-blur-xl border border-white/8 space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                Fábrica de Copys (Ideias de Prospecção por Segmento)
              </h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Selecione o preset de nicho desejado para gerar 3 copies personalizadas. Se não gostar das sugestões, basta apertar para gerar novas ideias.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nicho do Preset</label>
                <select
                  value={selectedPreset}
                  onChange={(e) => setSelectedPreset(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 text-white border border-white/8 focus:outline-none focus:border-purple-500/50 transition-all font-sans"
                >
                  {PRESET_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-[#0b0c14]">{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={generateCopies}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all duration-300 active:scale-95 shadow-md shadow-purple-500/10 border border-purple-500/30"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {generatedCopies.length > 0 ? 'Regerar Ideias' : 'Gerar 3 Copys'}
                </button>
              </div>
            </div>

            {generatedCopies.length > 0 && (
              <div className="space-y-4 mt-4 border-t border-white/5 pt-4 animate-fade-in">
                <div className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Sugestões Geradas para o nicho [{PRESET_OPTIONS.find(p => p.value === selectedPreset)?.label}]:
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {generatedCopies.map((copy, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-black/35 border border-white/5 relative group hover:border-purple-500/30 transition-all duration-200">
                      <pre className="text-[11px] text-gray-300 whitespace-pre-wrap font-sans leading-relaxed pr-20">{copy}</pre>
                      <button
                        type="button"
                        onClick={() => handleCopySingle(copy, idx)}
                        className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-[9px] font-bold border transition-all flex items-center gap-1 active:scale-95 ${
                          copiedIdx === idx 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border-white/5 hover:border-white/10'
                        }`}
                      >
                        {copiedIdx === idx ? (
                          <>
                            <Check className="w-2.5 h-2.5" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-2.5 h-2.5" />
                            Copiar
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-col md:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={applyGeneratedCopiesToNiche}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 border ${
                      justAdded 
                        ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/30' 
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/30 shadow-md shadow-emerald-500/10'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    {justAdded ? 'Aplicado ao Editor de Nicho!' : `Usar no Nicho ${PRESET_OPTIONS.find(p => p.value === selectedPreset)?.label}`}
                  </button>
                  <button
                    type="button"
                    onClick={generateCopies}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-bold transition-all duration-300 active:scale-95"
                  >
                    Gerar Outras 3 Copys
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Guidelines */}
          <div className="p-5 rounded-2xl bg-[#0f172a]/20 border border-white/5 space-y-3">
            <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
              Como funciona o Disparo com Identificação de Nicho?
            </h4>
            <ul className="list-disc pl-5 text-[11px] text-gray-400 space-y-2">
              <li>O sistema lê a tag de mineração e os dados do perfil no banco de dados.</li>
              <li>A IA de Nicho classifica o lead em uma das categorias oficiais (ex: Apostas, Grau/Moto, Fitness, Beleza, etc.).</li>
              <li>Seleciona e formata exclusivamente templates compatíveis com aquele segmento, evitando gafes de prospecção.</li>
              <li>Acessa o perfil, realiza warm-up comportamental (curtidas em posts) e envia via Story Reply ou Direct Message.</li>
              <li><strong className="text-emerald-400">Segue o perfil qualificado</strong> logo após o envio da copy, aumentando a autoridade e gerando notificação no Instagram do lead.</li>
              <li>Atualiza o status para <span className="text-emerald-400 font-semibold font-mono">ENVIADA</span> com relatório completo no console.</li>
            </ul>
          </div>
        </div>

        {/* Start/Stop action column */}
        <div>
          <div className="p-6 rounded-2xl bg-[#0f172a]/45 backdrop-blur-xl border border-white/8 flex flex-col items-center text-center space-y-6 justify-center h-full min-h-[300px] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
            {systemStatus.sending ? (
              <>
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-dashed border-emerald-500 animate-spin absolute inset-0" />
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center relative z-10">
                    <Send className="w-8 h-8 text-emerald-400 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">Disparando com IA</h3>
                  <p className="text-gray-400 text-xs mt-2 max-w-[200px] mx-auto leading-relaxed">
                    O operador visual está identificando os nichos e enviando abordagens personalizadas.
                  </p>
                </div>
                <button
                  onClick={onStopSending}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-500/30 hover:border-red-500/50 hover:text-red-300 font-bold text-xs tracking-wider uppercase transition-all duration-300 active:scale-95"
                >
                  <Square className="w-4 h-4 fill-current" />
                  Parar Operação
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <Send className="w-8 h-8 text-gray-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">Disparador Inteligente</h3>
                  <p className="text-gray-400 text-xs mt-2 max-w-[200px] mx-auto leading-relaxed">
                    Envie para todos com identificação automática de nicho ou filtre um nicho específico.
                  </p>
                </div>
                
                <div className="w-full space-y-4">
                  {/* Niche selector for execution */}
                  <div className="text-left">
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Filter className="w-3 h-3 text-purple-400" />
                      Filtro de Disparo
                    </label>
                    <select
                      value={nicheFilter}
                      onChange={(e) => setNicheFilter(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl bg-black/40 text-white border border-white/8 focus:outline-none focus:border-purple-500/50 transition-all font-sans"
                      id="campaign-niche-select"
                    >
                      <option value="todos" className="bg-[#0b0c14]">Todos os leads (Auto-detecção de nicho)</option>
                      {uniqueNiches.map(niche => (
                        <option key={niche} value={niche} className="bg-[#0b0c14]">{niche}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleStart}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wider uppercase border border-emerald-500/30 shadow-lg shadow-emerald-500/15 transition-all hover:shadow-emerald-500/20 active:scale-95 duration-300"
                    id="btn-start-sending"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Iniciar Disparos
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
