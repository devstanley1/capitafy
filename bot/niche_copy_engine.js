/**
 * =============================================================
 * Capitafy - Motor de Inteligência de Nicho e Geração de Copys
 * Identifica o nicho exato do perfil e entrega a copy personalizada
 * =============================================================
 */

const fs = require('fs');
const path = require('path');

// Mapeamento de Categorias de Nicho e Termos Relacionados
const NICHE_TAXONOMY = {
  apostas: {
    label: "Apostas & iGaming",
    keywords: [
      'aposta', 'apostas', 'apostasesportivas', 'casadeapostas', 'bet', 'bets', 'betting', 
      'igaming', 'cassino', 'casino', 'slots', 'blazer', 'aviator', 'mines', 'roleta', 
      'rendagarantida', 'tipster', 'palpites', 'palpite', 'traderesportivo', 'green', 
      'banca', 'odd', 'odds', 'futebolapostas', 'bilhetepronto'
    ],
    prohibitedKeywords: ['grau', 'moto', 'motovlog', 'empinando', 'skincare', 'maquiagem', 'pet', 'doguinho', 'barbearia']
  },
  grau_244: {
    label: "Grau (244) & Motos",
    keywords: [
      'grau', '244', 'grau244', 'grauecorte', 'moto', 'motos', 'motovlog', 'milgrau', 
      'puxoucortouraspou', 'loucospormoto', 'piloto', 'titan', 'xre', 'yamaha', 'honda', 
      'duasrodas', 'quebrada', 'bololô', 'bololo', '160', 'start', 'grauderua', 'fan160'
    ],
    prohibitedKeywords: ['banca', 'cassino', 'igaming', 'aposta', 'maquiagem', 'receita', 'pet']
  },
  beleza_moda: {
    label: "Beleza & Moda",
    keywords: [
      'beleza', 'moda', 'modafeminina', 'fashion', 'look', 'looks', 'makeup', 'make', 
      'maquiagem', 'skincare', 'estilo', 'unhas', 'unhasdecoradas', 'cabelo', 'lojaonline', 
      'vestuario', 'bijuteria', 'prata', 'semijoias', 'cosmeticos', 'provador'
    ],
    prohibitedKeywords: ['grau', 'moto', 'motovlog', 'empinando', 'banca', 'cassino', 'slots']
  },
  saude_fitness: {
    label: "Saúde & Fitness",
    keywords: [
      'saude', 'fitness', 'fit', 'treino', 'academia', 'dieta', 'suplementos', 
      'emagrecimento', 'musculacao', 'maromba', 'crossfit', 'personal', 'vida_saudavel', 
      'nutricao', 'bodybuilding', 'hipertrofia', 'calistenia', 'whey'
    ],
    prohibitedKeywords: ['grau', 'moto', 'cassino', 'slots', 'aposta']
  },
  viagem_turismo: {
    label: "Viagem & Turismo",
    keywords: [
      'viagem', 'viagens', 'turismo', 'trip', 'travel', 'hospedagem', 'resort', 
      'mochilao', 'turista', 'destinos', 'passagens', 'viajante', 'hotel', 'pousada', 'roteiro'
    ],
    prohibitedKeywords: ['grau', 'moto', 'cassino', 'slots']
  },
  culinaria_receitas: {
    label: "Culinária & Receitas",
    keywords: [
      'culinaria', 'receita', 'receitas', 'gastronomia', 'comida', 'confeitaria', 
      'gourmet', 'chef', 'cozinha', 'doces', 'bolos', 'restaurante', 'salgados', 
      'sobremesa', 'churrasco', 'hamburguer', 'pizza', 'confeiteira'
    ],
    prohibitedKeywords: ['grau', 'moto', 'cassino', 'aposta']
  },
  pets_animais: {
    label: "Pets & Animais",
    keywords: [
      'pet', 'pets', 'cachorro', 'gato', 'dog', 'cat', 'animais', 'veterinaria', 
      'petshop', 'adestramento', 'viralata', 'filhote', 'canil', 'gatinho', 'golden'
    ],
    prohibitedKeywords: ['grau', 'moto', 'cassino', 'slots', 'aposta']
  },
  empreendedorismo_marketing: {
    label: "Empreendedorismo & Marketing",
    keywords: [
      'empreendedorismo', 'marketing', 'marketingdigital', 'negocios', 'vendas', 
      'afiliado', 'afiliados', 'dropshipping', 'trafegopago', 'infoproduto', 'mentoria', 
      'financas', 'investimentos', 'rendaextra', 'sucesso', 'mindset', 'ecommerce'
    ],
    prohibitedKeywords: ['grau', 'empinando', 'moto']
  },
  maes_lifestyle: {
    label: "Mães / Família / Lifestyle",
    keywords: [
      'mae', 'maes', 'maternidade', 'lifestyle', 'familia', 'maternidadereal', 
      'bebe', 'casa', 'diaadia', 'vlog', 'donadecasa', 'rotina', 'filhos', 'gestante'
    ],
    prohibitedKeywords: ['grau', 'moto', 'cassino', 'slots', 'aposta']
  },
  humor_comedia: {
    label: "Humor & Comédia",
    keywords: [
      'humor', 'comedia', 'meme', 'memes', 'engracado', 'piadas', 'zueira', 
      'videosengracados', 'standup', 'deboche', 'risadas', 'comediante'
    ],
    prohibitedKeywords: []
  },
  gamers_streaming: {
    label: "Gamers & Streaming",
    keywords: [
      'gamer', 'game', 'games', 'streamer', 'stream', 'twitch', 'gameplay', 
      'freefire', 'roblox', 'minecraft', 'csgo', 'valorant', 'playstation', 'xbox', 
      'pcgamer', 'esports', 'fortnite', 'clipadas'
    ],
    prohibitedKeywords: ['grau', 'moto', 'maquiagem']
  },
  barbearias: {
    label: "Barbearias",
    keywords: [
      'barbearia', 'barbeiro', 'barber', 'barbershop', 'fade', 'degrade', 
      'cabelomasculino', 'corte', 'navalha', 'barbeirosbrasil', 'pomadamodeladora'
    ],
    prohibitedKeywords: ['maquiagem', 'skincarefeminino', 'vestido']
  }
};

// Acervo oficial de copys de alta conversão por nicho
const NICHE_COPY_POOLS = {
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
  ],
  geral: [
    "Olá @{{username}}! Analisei seu perfil e vejo que você tem um engajamento excelente. Temos uma proposta de parceria comercial muito vantajosa. Teria interesse em conhecer os detalhes?",
    "Fala {nome}! Tudo bem? Acompanho suas publicações e gosto muito do seu conteúdo. Estamos selecionando perfis qualificados para uma campanha de parcerias com ótima remuneração. Topa conversar a respeito?",
    "Oi @{{username}}, tudo joia? Temos um projeto em andamento e seu perfil se encaixa perfeitamente como parceiro oficial. Excelente oportunidade de monetização com seu público. Posso te enviar a proposta?",
    "Olá {nome}! Tudo bom? Gostamos muito da autenticidade das suas postagens. Nossa empresa está expandindo parcerias com influenciadores e gostaríamos de te apresentar uma oportunidade. Qual o melhor contato?"
  ]
};

/**
 * Normaliza uma string removendo acentos e caracteres especiais
 */
function normalizeString(str) {
  if (!str) return '';
  return str
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_]/g, '')
    .trim();
}

/**
 * Detecta a categoria canônica de nicho a partir do nicho/tag/username do lead
 */
function detectLeadNiche(nicheRaw, username = '', extraText = '') {
  const cleanNiche = normalizeString(nicheRaw);
  const cleanUser = normalizeString(username);
  const cleanExtra = normalizeString(extraText);
  const combined = `${cleanNiche} ${cleanUser} ${cleanExtra}`.trim();

  // 1. Verificação direta de igualdade exata de nicho com chave de categoria
  for (const [categoryKey] of Object.entries(NICHE_TAXONOMY)) {
    if (cleanNiche === normalizeString(categoryKey)) {
      return categoryKey;
    }
  }

  // 2. Verificação de correspondência com as palavras-chave de cada nicho
  // Prioridade alta para apostas e grau_244 para evitar cruzamentos graves
  const categoryOrder = [
    'apostas',
    'grau_244',
    'beleza_moda',
    'saude_fitness',
    'barbearias',
    'gamers_streaming',
    'pets_animais',
    'culinaria_receitas',
    'viagem_turismo',
    'empreendedorismo_marketing',
    'maes_lifestyle',
    'humor_comedia'
  ];

  for (const cat of categoryOrder) {
    const data = NICHE_TAXONOMY[cat];
    for (const kw of data.keywords) {
      const cleanKw = normalizeString(kw);
      if (cleanNiche.includes(cleanKw) || cleanUser.includes(cleanKw) || combined.includes(cleanKw)) {
        return cat;
      }
    }
  }

  return 'geral';
}

/**
 * Verifica se um texto possui termos proibidos para um dado nicho
 */
function isCopyCompatibleWithNiche(copyText, targetCategory) {
  if (!copyText || targetCategory === 'geral') return true;
  
  const targetData = NICHE_TAXONOMY[targetCategory];
  if (!targetData) return true;

  const normalizedCopy = normalizeString(copyText);

  // Se a copy tiver termos proibidos desse nicho, é incompatível
  if (targetData.prohibitedKeywords) {
    for (const badWord of targetData.prohibitedKeywords) {
      if (normalizedCopy.includes(normalizeString(badWord))) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Identifica para qual nicho um texto de copy foi escrito
 */
function identifyCopyCategory(copyText) {
  if (!copyText) return 'geral';
  const norm = normalizeString(copyText);

  for (const [cat, data] of Object.entries(NICHE_TAXONOMY)) {
    for (const kw of data.keywords) {
      if (norm.includes(normalizeString(kw))) {
        return cat;
      }
    }
  }

  return 'geral';
}

/**
 * Seleciona a copy perfeita para um lead específico, garantindo total compatibilidade
 * @param {Object} lead - Objeto com username e niche
 * @param {Array<string>} userCopiesList - Lista de copys personalizadas do editor (copies.txt)
 * @param {Object} userCopiesByNiche - Mapa de copys segmentadas por nicho se existir
 * @returns {string} Copy formatada com o nome do perfil
 */
function getCopyForLead(lead, userCopiesList = [], userCopiesByNiche = {}) {
  const username = (lead && lead.username) ? lead.username : 'amigo';
  const nicheRaw = (lead && lead.niche) ? lead.niche : '';
  
  const detectedCategory = detectLeadNiche(nicheRaw, username);

  // 1. Tentar pegar das copys específicas salvas pelo usuário para esse nicho
  let candidateCopies = [];
  if (userCopiesByNiche && Array.isArray(userCopiesByNiche[detectedCategory]) && userCopiesByNiche[detectedCategory].length > 0) {
    candidateCopies = userCopiesByNiche[detectedCategory].filter(c => isCopyCompatibleWithNiche(c, detectedCategory));
  }

  // 2. Se não houver cópias por nicho cadastradas, verificar a lista geral (copies.txt)
  if (candidateCopies.length === 0 && Array.isArray(userCopiesList) && userCopiesList.length > 0) {
    // Filtrar apenas cópias que pertençam a esse nicho OU que sejam compatíveis (não citem nichos rivais)
    const matchingNicheCopies = userCopiesList.filter(c => {
      const copyCat = identifyCopyCategory(c);
      return copyCat === detectedCategory && isCopyCompatibleWithNiche(c, detectedCategory);
    });

    if (matchingNicheCopies.length > 0) {
      candidateCopies = matchingNicheCopies;
    } else if (detectedCategory === 'geral') {
      // Se o nicho for geral, aceita qualquer copy neutra (que não cite moto, nem cassino, nem maquiagem)
      const neutralCopies = userCopiesList.filter(c => identifyCopyCategory(c) === 'geral');
      if (neutralCopies.length > 0) {
        candidateCopies = neutralCopies;
      }
    }
  }

  // 3. Fallback inteligente: usar o acervo oficial de excelência do nicho detectado
  if (candidateCopies.length === 0) {
    candidateCopies = NICHE_COPY_POOLS[detectedCategory] || NICHE_COPY_POOLS['geral'];
  }

  // Sorteia uma copy dentre as candidatas seguras e compatíveis
  const randomIndex = Math.floor(Math.random() * candidateCopies.length);
  let selectedCopy = candidateCopies[randomIndex];

  // Formatação das variáveis do lead
  selectedCopy = selectedCopy
    .replace(/\{\{username\}\}/ig, username)
    .replace(/\{nome\}/ig, username);

  return {
    category: detectedCategory,
    label: NICHE_TAXONOMY[detectedCategory] ? NICHE_TAXONOMY[detectedCategory].label : 'Geral',
    copy: selectedCopy
  };
}

module.exports = {
  NICHE_TAXONOMY,
  NICHE_COPY_POOLS,
  detectLeadNiche,
  isCopyCompatibleWithNiche,
  identifyCopyCategory,
  getCopyForLead
};
