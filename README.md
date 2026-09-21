# 🚀 Capitafy CRM - Sistema de Mineração e Prospecção Visual no Instagram

> **Plataforma All-in-One de Prospecção Automatizada e Humanizada para o Instagram.**  
> Minere leads altamente qualificados por hashtags/nichos, filtre por contagem real de seguidores, envie abordagens sob medida por nicho (com curtidas prévias, visualização de Stories e resposta) e siga os perfis prospectados automaticamente.

---

## 📋 Sumário
1. [Visão Geral e Proposta](#-visão-geral-e-proposta)
2. [Arquitetura do Sistema](#-arquitetura-do-sistema)
3. [Estrutura de Pastas e Arquivos](#-estrutura-de-pastas-e-arquivos)
4. [Módulos e Funcionalidades Detalhadas](#-módulos-e-funcionalidades-detalhadas)
   - [4.1 Dashboard Executivo](#41-dashboard-executivo)
   - [4.2 Radar de Mineração Visual (Scraper)](#42-radar-de-mineração-visual-scraper)
   - [4.3 Fábrica de Copys & Inteligência de Nicho](#43-fábrica-de-copys--inteligência-de-nicho)
   - [4.4 Operador Visual de Disparos em Massa](#44-operador-visual-de-disparos-em-massa)
   - [4.5 Gestão de Leads (CRM)](#45-gestão-de-leads-crm)
   - [4.6 Blacklist & Proteção](#46-blacklist--proteção)
   - [4.7 Configurações Globais & Proxy](#47-configurações-globais--proxy)
   - [4.8 Console Terminal em Tempo Real (SSE)](#48-console-terminal-em-tempo-real-sse)
5. [Lógica de Blindagem e Anti-Bloqueio](#-lógica-de-blindagem-e-anti-bloqueio)
6. [Como Iniciar e Operar o Sistema](#-como-iniciar-e-operar-o-sistema)
7. [Resolução de Problemas Comuns](#-resolução-de-problemas-comuns)

---

## 🎯 Visão Geral e Proposta

O **Capitafy** foi desenvolvido para resolver o maior gargalo de quem vende e faz parcerias no Instagram: **encontrar leads qualificados em grande escala e abordá-los sem tomar bloqueio da plataforma**.

Diferente de disparadores comuns que usam requisições HTTP secas (APIs privadas que o Instagram detecta e bane em minutos), o Capitafy utiliza um **Motor Visual com Puppeteer-Core** que controla o navegador Google Chrome real instalado na máquina do usuário, simulando comportamento humano autêntico:
- Navega visualmente pelas hashtags do seu nicho.
- Lê o número exato de seguidores e descarta perfis fora da sua meta.
- Aquece o perfil do lead antes de mandar mensagem (curte posts recentes e assiste stories).
- Envia mensagens dinâmicas personalizadas de acordo com o nicho do lead.
- Segue o perfil qualificado logo após o envio da copy para gerar autoridade e dupla notificação.

---

## 🏗️ Arquitetura do Sistema

O ecossistema é dividido em três camadas integradas:

```
┌─────────────────────────────────────────────────────────────┐
│                 FRONTEND (React + Vite + TS)                │
│  - Interface Dashboard Dark Mode moderna (Porta 5173)       │
│  - Fábrica de Copys, Tabela de Leads, Métricas e Configs    │
│  - Receptor SSE de Logs do Terminal em tempo real          │
└──────────────────────────────┬──────────────────────────────┘
                               │ Chamadas REST / SSE Stream
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js + Express)               │
│  - Servidor API REST (Porta 3000)                           │
│  - Gerenciador de Processos (Spawns de Mineração e Disparo) │
│  - Banco de Dados SQLite3 em Modo WAL (`database.db`)       │
│  - Motor SSE para transmissão de logs aos clientes          │
└──────────────────────────────┬──────────────────────────────┘
                               │ Execução de Processos Puppeteer
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  MOTORES VISUAIS (Puppeteer)                │
│  - Google Chrome Nativo + Perfil Isolado (`bot_profile`)    │
│  - `scraper_visual.js`: Radar de Mineração e Qualificação    │
│  - `operador_visual_massa.js`: Disparador e Interações      │
│  - `niche_copy_engine.js`: IA de Classificação de Nichos    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Estrutura de Pastas e Arquivos

```text
capitafy/
├── backend/                      # Servidor REST e lógica do CRM
│   ├── server.js                 # API principal, rotas, SQLite e spawn de bots
│   └── package.json              # Dependências do backend (express, sqlite3, cors, etc.)
│
├── bot/                          # Motores de automação via Puppeteer
│   ├── scraper_visual.js         # Robô minerador de hashtags e perfis
│   ├── operador_visual_massa.js  # Robô de interações, disparo de copys e follow
│   ├── niche_copy_engine.js      # IA de taxonomia de nichos e gerador de copys
│   ├── gerador_token.js          # Navegador auxiliar para login manual e captura de sessão
│   ├── token.txt                 # Session ID do Instagram logado
│   └── bot_profile/              # Perfil de usuário persistente do Chrome
│
├── database/                     # Persistência de dados
│   ├── database.db               # Banco de dados SQLite principal
│   ├── copies.txt                # Templates gerais de abordagem
│   ├── copies_by_niche.json      # Acervo de copys organizadas por nicho
│   ├── config_scraper.json       # Configurações salvas do scraper
│   └── license.json              # Chave de licença e status de ativação
│
├── frontend/                     # Interface do usuário (Single Page Application)
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardView.tsx # Visão geral de métricas e status
│   │   │   ├── MiningView.tsx    # Controle do radar de mineração
│   │   │   ├── CopiesView.tsx    # Fábrica de copys e disparador segmentado
│   │   │   ├── LeadsView.tsx     # Tabela de CRM e gerenciamento de leads
│   │   │   ├── BlacklistView.tsx # Gerenciamento de perfis bloqueados
│   │   │   ├── SettingsView.tsx  # Configurações de tags, limites e proxies
│   │   │   ├── Sidebar.tsx       # Navegação lateral e freio de mão
│   │   │   └── TerminalLogs.tsx  # Rodapé com terminal de logs em tempo real
│   │   ├── types.ts              # Interfaces e tipos TypeScript
│   │   ├── App.tsx               # Componente raiz e sincronização de dados
│   │   └── main.tsx              # Ponto de entrada React
│   └── package.json              # Dependências do frontend
│
├── INICIAR_WINDOWS.bat           # Launcher oficial interativo para Windows
├── INICIAR_LINUX.sh              # Launcher oficial para Linux/macOS
├── main.js                       # Launcher alternativo em Node.js
└── package.json                  # Scripts raiz do ecossistema
```

---

## ⚙️ Módulos e Funcionalidades Detalhadas

### 4.1 Dashboard Executivo
- **Visão em Tempo Real**: Contadores de total de leads minerados, mensagens enviadas com sucesso, abordagens pendentes e taxa de conversão.
- **Status dos Motores**: Indicadores luminosos mostrando se o Radar de Mineração ou o Disparador em Massa estão ativos ou em repouso.
- **Gráficos e Indicadores**: Visualização da distribuição dos perfis por faixa de relevância e nichos cadastrados.

---

### 4.2 Radar de Mineração Visual (`bot/scraper_visual.js`)
O minerador varre o Instagram em busca de novos influenciadores ou clientes em potencial com os seguintes passos lógicos:

1. **Leitura da Sessão**: Carrega a sessão salva em `bot/token.txt` e injeta o cookie `sessionid` no Chrome.
2. **Navegação por Hashtags**: Acessa sequencialmente as hashtags configuradas pelo usuário (ex: `grau244`, `apostasesportivas`, `modafeminina`).
3. **Varredura Híbrida da Grade**: Coleta links de publicações recentes priorizando posts da grade (`/p/`) e reels (`/reel/`).
4. **Desduplicação Inteligente**:
   - Não visita perfis que já estão no banco de dados SQLite (`leads`).
   - Não visita perfis presentes na `blacklist`.
5. **Inspeção do Perfil**:
   - Acessa a página do perfil `https://instagram.com/username/`.
   - **Parser Universal de Seguidores**: Extrai e normaliza números em múltiplos idiomas e formatos (ex: `12,5 mil`, `10.5k`, `1.2M`, `500.000`).
6. **Filtro de Qualificação**:
   - Verifica se os seguidores estão estritamente entre `minFollowers` e `maxFollowers`.
   - Se qualificado, calcula o **Score do Lead (0 a 100)** com base na densidade de seguidores ideal para conversão.
   - Envia o lead via API para ser registrado no SQLite com status `pendente` e a tag correspondente.
7. **Pausa de Segurança**: Aplica atrasos randômicos humanos entre 8 a 12 segundos entre cada perfil inspecionado para blindar a conta.

---

### 4.3 Fábrica de Copys & Inteligência de Nicho (`bot/niche_copy_engine.js`)
O sistema conta com um **Motor de Classificação de Nichos** que elimina o risco de gafes comerciais (como mandar mensagem de moto para perfil de apostas):

- **12 Nichos Nativos Mapeados**:
  1. `apostas` (Apostas Esportivas, iGaming, Cassino, Tipsters, Palpites)
  2. `grau_244` (Motos, Grau, Motovlog, Peças, Roupas de Quebrada)
  3. `beleza_moda` (Looks, Maquiagem, Skincare, Joias, Moda Feminina)
  4. `saude_fitness` (Academias, Suplementos, Marmitas Fit, Atletas)
  5. `viagem_turismo` (Agências, Resorts, Mochilão, Roteiros)
  6. `culinaria_receitas` (Gastronomia, Docerias, Chefs, Restaurantes)
  7. `pets_animais` (Pet Shops, Veterinárias, Adestradores, Acessórios)
  8. `empreendedorismo_marketing` (Afiliados, Tráfego Pago, SaaS, Mentorias)
  9. `maes_lifestyle` (Maternidade, Cuidados com Bebê, Família)
  10. `humor_comedia` (Memes, Stand-up, Entretenimento)
  11. `gamers_streaming` (Twitch, Free Fire, eSports, Periféricos)
  12. `barbearias` (Cortes Masculinos, Pomadas, Cursos de Barbeiro)
  13. `geral` (Fallback neutro e comercial para perfis sem nicho evidente)

- **Fábrica de Copys no Painel**:
  - Selecione o nicho desejado e clique em **Gerar 3 Copys**.
  - O sistema escolhe 3 variações de alta conversão do acervo. Se não gostar, basta clicar em **Regerar Ideias**.
  - Botão de um clique para **Aplicar ao Editor de Nicho**.
- **Editor de Templates Segmentado**:
  - Alternância entre **Templates Gerais** (fallback) e **Por Nicho** (dedicados).
  - Suporte a tags dinâmicas: `{nome}`, `{{username}}`, `@{{username}}`.
  - Suporte a separador `---` para split-testing randômico entre abordagens.
- **Trava de Segurança Anti-Incompatibilidade**:
  - O motor analisa a mensagem e barra termos de motos para nichos que não sejam de duas rodas, e barra termos de cassino/aposta para outros nichos.

---

### 4.4 Operador Visual de Disparos em Massa (`bot/operador_visual_massa.js`)
O disparador em massa realiza a abordagem mais humanizada e completa do mercado:

```
[ Carregar Leads Pendentes ]
           │
           ▼
[ Warm-up Inicial no Feed ] ──► Rola o feed por 10s e assiste a stories orgânicos
           │
           ▼
[ Acesso ao Perfil do Lead ]
           │
           ▼
[ Curtidas Estratégicas ] ────► Curte de 1 a 2 posts recentes para gerar notificação
           │
           ▼
[ Identificação de Nicho ] ───► Mapeia a tag do lead e seleciona a copy sob medida
           │
           ▼
     Tem Story Ativo?
      ├─────► SIM: Clica no avatar e envia [Story Reply] com a copy
      │
      └─────► NÃO: Abre o botão de [Mensagem Direta] e envia a DM
           │
           ▼
[ Follow Automático do Lead ] ─► Segue o perfil qualificado no Instagram
           │
           ▼
[ Atualiza CRM ] ─────────────► Salva lead como 'enviada' no SQLite
           │
           ▼
[ Pausa Humana Randômica ] ────► Aguarda de 15 a 25 segundos antes do próximo
```

---

### 4.5 Gestão de Leads (CRM)
- **Filtros Avançados**: Filtre por status (`pendente`, `enviada`, `erro`), por nicho específico ou por busca textual de username.
- **Score Visual**: Badges coloridas indicando o nível de qualificação de cada perfil.
- **Ações em Lote e Individuais**:
  - Excluir lead.
  - Banir lead (adicionar à blacklist).
  - Alterar status manualmente.
  - Resetar status em lote (ex: transformar todos de 'erro' para 'pendente' para nova tentativa).
  - Adicionar leads manualmente via modal.

---

### 4.6 Blacklist & Proteção
- Tabela dedicada no banco de dados SQLite (`blacklist`).
- Qualquer perfil adicionado à blacklist é:
  - Ignorado pelo minerador (nunca é coletado).
  - Ignorado pelo disparador (nunca recebe mensagem).
  - Removível a qualquer momento com um clique.

---

### 4.7 Configurações Globais & Proxy
- **Hashtags Alvo**: Lista de tags separadas por vírgula para pesquisa (ex: `grau244, apostasesportivas, modafeminina`).
- **Faixas de Seguidores**: Definição de piso (`minFollowers`) e teto (`maxFollowers`).
- **Limite por Tag**: Quantidade máxima de leads minerados por nicho antes de avançar para a próxima tag.
- **Suporte a Proxy**: Opção de habilitar servidor Proxy (HTTP/HTTPS) com URL personalizada para mascarar o IP de disparo.

---

### 4.8 Console Terminal em Tempo Real (SSE)
- Barra fixa de logs no rodapé da aplicação.
- Transmissão instantânea via **Server-Sent Events (SSE)** direto dos processos em execução no terminal para a tela do navegador.
- Logs coloridos com distinção visual entre mensagens de sistema, mineração, disparos e erros.
- Botão de maximizar/minimizar e limpar console.

---

## 🛡️ Lógica de Blindagem e Anti-Bloqueio

O Capitafy foi desenhado com base em regras de segurança para proteger a integridade das contas do Instagram:

1. **Uso de Chrome Nativo**: O robô utiliza o Chrome real da máquina (não Chromium headless padrão que é facilmente identificado pelos firewalls da Meta).
2. **Contextos Isolados de Navegação**: Cada perfil de lead é aberto em uma aba com contexto de memória isolado (`browser.createBrowserContext()`), prevenindo vazamento de cache e consumo excessivo de memória.
3. **Warm-up Comportamental**: O robô rola o feed inicial da conta e assiste a Stories na home antes de começar a disparar, sinalizando atividade orgânica para o algoritmo.
4. **Interação Precoce com Posts**: Curtir fotos do lead antes de mandar mensagem gera notificações reais e aumenta drasticamente a taxa de aceitação da DM.
5. **Story Reply como Primeira Opção**: Responder a um Story existente do lead possui taxa de entrega quase 10x superior à de uma DM direta em caixa fria.
6. **Delays Humanos Flutuantes**: Todos os cliques, digitações e esperas utilizam tempos variáveis com números pseudo-randômicos.
7. **Detecção Ativa de Bloqueio**: Se o Instagram exibir alerta de atividade incomum, o robô interrompe imediatamente a operação e salva o status para proteger a conta contra suspensões.
8. **Freio de Mão Emergencial**: Botão de parada forçada que executa `SIGKILL` e encerra processos órfãos do Chrome via `taskkill` (Windows) ou `killall` (Linux).

---

## 🚦 Como Iniciar e Operar o Sistema

### No Windows:
1. Abra a pasta do projeto e dê dois cliques no arquivo:
   ```cmd
   INICIAR_WINDOWS.bat
   ```
2. O menu interativo exibirá as opções:
   - `[0] Iniciar Capitafy Completo`: Inicia o backend, o frontend e abre o navegador automaticamente em `http://localhost:5173`.
   - `[1] Conectar / Trocar Conta do Instagram`: Abre o Chrome para login manual e salva a sessão no `token.txt`.
   - `[2] Iniciar Somente Radar de Mineração`: Executa o robô de mineração via terminal.
   - `[3] Iniciar Somente Operador em Massa`: Executa o disparador de mensagens via terminal.
   - `[4] Abrir Painel Dashboard Web`: Abre o frontend no navegador.

### No Linux / macOS:
1. Dê permissão de execução e inicie o script:
   ```bash
   chmod +x INICIAR_LINUX.sh
   ./INICIAR_LINUX.sh
   ```

### Modo Manual via Terminal:
Se preferir rodar os comandos separadamente:

```bash
# Terminal 1: Iniciar Backend
cd backend
npm install
node server.js

# Terminal 2: Iniciar Frontend
cd frontend
npm install
npm run dev
```

Acesse a interface no navegador: **`http://localhost:5173`**

---

## 🔧 Resolução de Problemas Comuns

### 1. O robô diz "Nenhuma conta ativa configurada"
- Use a **Opção 1** do `INICIAR_WINDOWS.bat` para fazer login no Instagram e gerar o arquivo `bot/token.txt`.
- Certifique-se de que o login foi completado no Chrome que se abriu e a janela foi fechada pelo próprio script.

### 2. O painel web não carrega ou diz "Página vazia"
- Certifique-se de que o Vite está rodando na porta `5173` e o backend na porta `3000`.
- Utilize a **Opção 0** do script de inicialização para abrir ambos os serviços de forma sincronizada.

### 3. O Chrome não abre durante a mineração ou disparo
- O sistema localiza o executável do Chrome automaticamente nos caminhos padrões do Windows (`C:\Program Files\Google\Chrome\Application\chrome.exe`).
- Verifique se o Google Chrome está instalado na máquina. Se estiver em um caminho customizado, verifique a função `getChromePath()` nos arquivos `bot/scraper_visual.js` e `bot/operador_visual_massa.js`.

### 4. Processos do Chrome ficaram travados em segundo plano
- Clique no botão **Freio de Mão** na barra lateral do painel ou feche todas as janelas do terminal. O sistema aciona o `taskkill /F /IM chrome.exe` para limpar qualquer processo pendente.

---

## 📄 Licença e Uso

Este software é de uso exclusivo para prospecção comercial ética e qualificada. Respeite os limites diários de interação recomendados pelo Instagram para manter sua conta saudável e perene.
