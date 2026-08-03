/**
 * =============================================================
 * Desenvolvido por @kkayron.dev
 * Instagram: https://instagram.com/kkayron.dev
 * =============================================================
 */
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Helper para obter o executável do Chrome em múltiplos ambientes
function getChromePath() {
    if (os.platform() === 'win32') {
        const winPaths = [
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            path.join(os.homedir(), 'AppData\\Local\\Google\\Chrome\\Application\\chrome.exe')
        ];
        for (const p of winPaths) {
            if (fs.existsSync(p)) return p;
        }
        return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    } else {
        const linuxPaths = [
            '/usr/bin/google-chrome',
            '/usr/bin/google-chrome-stable',
            '/usr/bin/chromium',
            '/usr/bin/chromium-browser',
            '/snap/bin/google-chrome',
            '/snap/bin/chromium',
            '/var/lib/flatpak/exports/bin/com.google.Chrome'
        ];
        for (const p of linuxPaths) {
            if (fs.existsSync(p)) return p;
        }
        return '/usr/bin/google-chrome';
    }
}

const CHROME_PATH = getChromePath();
const TOKEN_PATH = path.join(__dirname, 'token.txt');
const API_URL = 'http://localhost:3000/api';

// Helper customizado para fetch com suporte a fallback de HTTP
const fetchHelper = async (url, options = {}) => {
    if (typeof fetch !== 'undefined') {
        return fetch(url, options);
    }
    return new Promise((resolve, reject) => {
        const http = require(url.startsWith('https') ? 'https' : 'http');
        const urlObj = new URL(url);
        const reqOpts = {
            method: options.method || 'GET',
            headers: options.headers || {}
        };
        const req = http.request(urlObj, reqOpts, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    ok: res.statusCode >= 200 && res.statusCode < 300,
                    status: res.statusCode,
                    json: async () => JSON.parse(data),
                    text: async () => data
                });
            });
        });
        req.on('error', reject);
        if (options.body) {
            req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
        }
        req.end();
    });
};

async function callAPI(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    if (options.body && typeof options.body === 'object') {
        options.body = JSON.stringify(options.body);
    }
    const response = await fetchHelper(url, options);
    if (!response.ok) {
        throw new Error(`Erro na API (${response.status})`);
    }
    return response.json();
}

// Super delay para blindagem da conta
const randomDelay = (min = 3000, max = 8000) => {
    const ms = Math.floor(Math.random() * (max - min + 1) + min);
    return new Promise(res => setTimeout(res, ms));
};

// Parser universal de seguidores para PT-BR e EN
function parseFollowers(text) {
    if (!text) return 0;
    
    let clean = text.trim().toLowerCase();
    let multiplier = 1;
    
    if (clean.includes('b') && !clean.includes('mil')) {
        multiplier = 1000000000;
        clean = clean.replace('b', '');
    } else if (clean.includes('bilões') || clean.includes('bilhões') || clean.includes('bilhão') || clean.includes('bilhao') || clean.includes('bi')) {
        multiplier = 1000000000;
        clean = clean.replace(/bilões|bilhões|bilhão|bilhao|bi/g, '');
    } else if (clean.includes('k')) {
        multiplier = 1000;
        clean = clean.replace('k', '');
    } else if (clean.includes('m') && !clean.includes('mil')) {
        multiplier = 1000000;
        clean = clean.replace('m', '');
    } else if (clean.includes('milões') || clean.includes('milhões') || clean.includes('milhao') || clean.includes('milhão') || clean.includes('mi')) {
        multiplier = 1000000;
        clean = clean.replace(/milões|milhões|milhão|milhao|mi/g, '');
    } else if (clean.includes('mil')) {
        multiplier = 1000;
        clean = clean.replace('mil', '');
    }
    
    clean = clean.trim();
    
    if (multiplier > 1) {
        clean = clean.replace(/,/g, '.');
        return Math.round(parseFloat(clean) * multiplier) || 0;
    } else {
        clean = clean.replace(/[\.,\s]/g, '');
        return parseInt(clean, 10) || 0;
    }
}

(async () => {
    console.log("🚀 Iniciando Motor de Mineração VISUAL (Anti-Block) via Puppeteer...");
    
    if (!fs.existsSync(TOKEN_PATH)) {
        console.log("❌ Nenhuma conta ativa configurada. Por favor, conecte uma conta usando o menu do terminal.");
        process.exit(1);
    }

    const sessionid = fs.readFileSync(TOKEN_PATH, 'utf8').trim();
    if (!sessionid) {
        console.log("❌ Token inválido ou vazio. Por favor, reconecte a conta.");
        process.exit(1);
    }

    console.log("👤 Sessão carregada do token.txt local com sucesso!");

    console.log("\n==================================================");
    console.log("⚙️  RADAR DE MINERAÇÃO VISUAL INICIADO (DASHBOARD)");
    console.log("==================================================");
    
    // Obter configurações do painel
    let config;
    try {
        config = await callAPI('/system/config');
    } catch(e) {
        console.log("⚠️ Não foi possível carregar as configurações do servidor. Usando fallback local.");
        config = { hashtags: "grau244, rendagarantida", minFollowers: 5000, maxFollowers: 50000, maxPerTag: 20, proxyEnabled: false, proxyUrl: "" };
    }

    // Sincronizar banco de dados para evitar requisições repetidas
    let blacklist = [];
    let existing = [];
    try {
        const syncData = await callAPI('/system/sync-check');
        blacklist = syncData.blacklist || [];
        existing = syncData.existing || [];
        console.log(`[✓] Banco sincronizado: ${existing.length} leads no CRM, ${blacklist.length} na blacklist.`);
    } catch(e) {
        console.log("⚠️ Falha ao sincronizar cache local com o banco de dados.");
    }

    const hashtags = config.hashtags.split(',').map(t => t.trim().replace('#', '')).filter(t => t);
    const minFollowers = parseInt(config.minFollowers) || 5000;
    const maxFollowers = parseInt(config.maxFollowers) || 50000;
    const maxPerTag = parseInt(config.maxPerTag) || 20;

    console.log(`🚀 Iniciando busca VISUAL: ${hashtags.length} nichos | ${minFollowers} a ${maxFollowers} seguidores | ${maxPerTag} por nicho.`);
    
    console.log("==================================================\n");

    const launchArgs = ['--start-maximized'];
    if (config.proxyEnabled && config.proxyUrl) {
        launchArgs.push(`--proxy-server=${config.proxyUrl}`);
        console.log(`🌐 Utilizando servidor Proxy: ${config.proxyUrl}`);
    }

    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: false,
        defaultViewport: null,
        userDataDir: path.join(__dirname, 'bot_profile'),
        ignoreDefaultArgs: ['--enable-automation'],
        args: [...launchArgs, '--disable-infobars']
    });

    const page = await browser.newPage();
    
    await page.setCookie({
        name: 'sessionid',
        value: sessionid,
        domain: '.instagram.com',
        path: '/',
        secure: true,
        httpOnly: true
    });

    console.log("🔗 Detectando conta logada...");
    let loggedInUsername = null;
    try {
        await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle2', timeout: 60000 });
        await randomDelay(3000, 5000);
        loggedInUsername = await page.evaluate(() => {
            // 1. Procurar em script elements
            for (const script of Array.from(document.querySelectorAll('script'))) {
                const text = script.textContent;
                const match = text.match(/"username":"([^"]+)"/);
                if (match && match[1]) {
                    if (text.includes('viewer') || text.includes('config') || text.includes('ViewerConfig')) {
                        return match[1];
                    }
                }
            }
            // 2. Procurar em links do menu com href "/username/"
            const navLinks = Array.from(document.querySelectorAll('a[href^="/"]'));
            const systemExclude = ['explore', 'reels', 'direct', 'stories', 'create', 'notifications', 'search', 'home', 'messages', 'play', 'emails', 'about', 'blog', 'jobs', 'help', 'api', 'privacy', 'terms', 'locations', 'directory', 'suggested_accounts', 'p', 'reel'];
            for (const link of navLinks) {
                const href = link.getAttribute('href');
                if (!href) continue;
                const username = href.split('/').filter(p => p)[0];
                if (username && !systemExclude.includes(username)) {
                    if (link.querySelector('img') || link.innerText.toLowerCase().includes('perfil') || link.innerText.toLowerCase().includes('profile')) {
                        return username;
                    }
                }
            }
            return null;
        });
    } catch (err) {
        console.log("⚠️ Erro ao detectar username logado:", err.message);
    }

    if (loggedInUsername) {
        console.log(`👤 Conta logada detectada: @${loggedInUsername}`);
    } else {
        console.log("⚠️ Não foi possível determinar o username da conta logada automaticamente.");
    }

    const excludeList = new Set([
        'instagram', 'explore', 'popular', 'reels', 'direct', 'stories', 
        'suggested_accounts', 'p', 'reel', 'developer', 'about', 'blog', 
        'jobs', 'help', 'api', 'privacy', 'terms', 'directory', 'messages', 
        'create', 'notifications', 'home', 'emails', 'locations', 'explore_tags', 
        'tags', 'hashtag', 'graphql', 'tv', 'p', 'popular'
    ]);
    if (loggedInUsername) {
        excludeList.add(loggedInUsername.toLowerCase());
    }

    for (let tag of hashtags) {
        console.log(`\nBuscando na hashtag: #${tag}`);
        try {
            let interceptedUsers = new Set();
            let interceptHandler = null;

            if (config.turboMode) {
                console.log(`⚡ [MODO TURBO]: Ativando espião de rede GraphQL para interceptação silenciosa em massa...`);
                interceptHandler = async (response) => {
                    const url = response.url();
                    // Intercepta qualquer GraphQL ou API
                    if (url.includes('graphql') || url.includes('api/v1/')) {
                        try {
                            const text = await response.text();
                            
                            // 🛑 BLOQUEIO ABSOLUTO: Ignora requests da sua timeline, direct, followers e following
                            if (text.includes('xdt_api__v1__feed__timeline__connection') || text.includes('inbox_timeline')) return;
                            if (text.includes('xdt_user_followers') || text.includes('xdt_user_following')) return;
                            if (text.includes('get_paginated_share_sheet_ranked_items')) return;
                            
                            // 🛑 SÓ AUTORIZA se for uma rota de pesquisa, hashtag, mídia ou contiver tag/fbsearch/graphql
                            const isRelevant = url.includes('tags/web_info') || 
                                               url.includes('tags/logged_out_web_info') || 
                                               url.includes('explore/tags') || 
                                               url.includes('fbsearch') ||
                                               url.includes('graphql') ||
                                               url.includes('api/v1/tags') ||
                                               url.includes('api/v1/search') ||
                                               text.includes('xdt_fbsearch__') || 
                                               text.includes('edge_hashtag_to_media') || 
                                               text.includes('xdt_api__v1__tags__web_info') ||
                                               text.includes('hashtag');
                                               
                            if (!isRelevant) return;
                            
                            const userMatches = text.match(/"username"\s*:\s*"([^"]+)"/g);
                            if (userMatches) {
                                userMatches.forEach(m => {
                                    const matchParts = m.match(/"username"\s*:\s*"([^"]+)"/);
                                    if (matchParts && matchParts[1]) {
                                        const match = matchParts[1].toLowerCase();
                                        if (match.length > 2 && !excludeList.has(match)) {
                                            interceptedUsers.add(match);
                                        }
                                    }
                                });
                            }
                        } catch(e) {}
                    }
                };
                page.on('response', interceptHandler);
            }

            await page.goto(`https://www.instagram.com/explore/tags/${tag}/`, { waitUntil: 'networkidle2', timeout: 60000 });
            await randomDelay(3000, 5000);

            // Verificar se fomos redirecionados para fora da busca/explore (como feed ou login)
            const currentUrl = page.url();
            const isSearchPage = currentUrl.includes(`/tags/`) || 
                                 currentUrl.includes(`/explore/`) || 
                                 currentUrl.includes(`search/keyword`) || 
                                 currentUrl.includes(`q=`) ||
                                 currentUrl.toLowerCase().includes(tag.toLowerCase());
            
            if (!isSearchPage) {
                console.log(`❌ Redirecionamento detectado! Fomos enviados para: ${currentUrl}`);
                console.log(`⚠️ A conta pode estar deslogada ou temporariamente bloqueada pelo Instagram.`);
                continue;
            }

            let perfisAnalisadosEstaTag = new Set();
            let contadorSalvos = 0;
            let roundsWithoutNewCandidates = 0;

            while (contadorSalvos < maxPerTag && roundsWithoutNewCandidates < 5) {
                console.log(`\n🔄 [CICLO DE BUSCA]: Coletados ${contadorSalvos}/${maxPerTag} leads na hashtag #${tag}...`);
                
                // Sempre tenta pegar usernames diretamente do HTML inicial (Scripts da página)
                try {
                    const domUsernames = await page.evaluate((systemExclude) => {
                        let usernames = [];
                        const scripts = document.querySelectorAll('script');
                        scripts.forEach(s => {
                            const text = s.innerText || s.textContent || '';
                            if (text.includes('xdt_api__v1__feed__timeline__connection')) return;
                            if (text.includes('xdt_user_followers') || text.includes('xdt_user_following')) return;
                            
                            const matches = text.match(/"username"\s*:\s*"([^"]+)"/g);
                            if (matches) {
                                matches.forEach(m => {
                                    const matchParts = m.match(/"username"\s*:\s*"([^"]+)"/);
                                    if (matchParts && matchParts[1]) {
                                        const match = matchParts[1].toLowerCase();
                                        if (match.length > 2 && !systemExclude.includes(match)) usernames.push(match);
                                    }
                                });
                            }
                        });
                        return usernames;
                    }, Array.from(excludeList));
                    domUsernames.forEach(u => interceptedUsers.add(u));
                } catch(domErr) {
                    console.log("⚠️ Erro ao extrair usernames de script tags:", domErr.message);
                }

                // Scroll agressivo para carregar mais mídias
                console.log("🖱️ Rolando a página para carregar novos posts...");
                const scrollRounds = 4;
                for (let scrollI = 0; scrollI < scrollRounds; scrollI++) {
                    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                    await randomDelay(2000, 3000);
                }

                let candidatosAtuais = Array.from(interceptedUsers);

                // DOM Fallback tradicional
                try {
                    const domLinks = await page.evaluate((systemExclude) => {
                        const links = Array.from(document.querySelectorAll('a[href*="/"]'));
                        const users = [];
                        links.forEach(l => {
                            const href = l.getAttribute('href');
                            if (!href) return;
                            const parts = href.split('/').filter(p => p);
                            if (parts.length === 1) {
                                const username = parts[0].toLowerCase();
                                if (username.length > 2 && !systemExclude.includes(username)) {
                                    users.push(parts[0]);
                                }
                            }
                        });
                        return users;
                    }, Array.from(excludeList));
                    
                    domLinks.forEach(u => {
                        if (!candidatosAtuais.includes(u)) candidatosAtuais.push(u);
                    });
                } catch (domErr) {
                    console.log("⚠️ Erro no DOM fallback tradicional:", domErr.message);
                }

                // Filtrar os que já analisamos neste ciclo ou que já existem
                let novosCandidatos = candidatosAtuais.filter(u => !perfisAnalisadosEstaTag.has(u));

                // Fallback de Slide Modal se não houver candidatos novos
                if (novosCandidatos.length === 0) {
                    console.log("⚠️ Nenhum perfil novo interceptado. Iniciando extração visual por slide modal...");
                    try {
                        let postSelector = 'a[href*="/p/"]';
                        let postExists = await page.evaluate((sel) => document.querySelector(sel) !== null, postSelector);
                        if (!postExists) {
                            console.log("ℹ️ Nenhum post padrão (/p/) encontrado na grade. Usando reels (/reel/) como fallback secundário.");
                            postSelector = 'a[href*="/reel/"]';
                            postExists = await page.evaluate((sel) => document.querySelector(sel) !== null, postSelector);
                        }
                        
                        if (postExists) {
                            console.log(`📸 Abrindo visualizador com o seletor: ${postSelector}`);
                            await page.click(postSelector);
                            await randomDelay(3000, 5000);
                            
                            const limit = Math.max(maxPerTag * 5, 50);
                            for (let step = 0; step < limit; step++) {
                                const usernameFound = await page.evaluate((systemExclude) => {
                                    const modalHeaders = document.querySelectorAll('header a[href^="/"]');
                                    for (let a of modalHeaders) {
                                        const href = a.getAttribute('href');
                                        if (!href) continue;
                                        const username = href.split('/').filter(p => p)[0];
                                        if (username && !systemExclude.includes(username.toLowerCase())) {
                                            return username.toLowerCase();
                                        }
                                    }
                                    const modalLinks = document.querySelectorAll('[role="dialog"] a[href^="/"]');
                                    for (let a of modalLinks) {
                                        const href = a.getAttribute('href');
                                        if (!href) continue;
                                        const username = href.split('/').filter(p => p)[0];
                                        if (username && !systemExclude.includes(username.toLowerCase())) {
                                            if (a.innerText && a.innerText.trim() === username) {
                                                return username.toLowerCase();
                                            }
                                        }
                                    }
                                    return null;
                                }, Array.from(excludeList));
                                
                                if (usernameFound) {
                                    if (!perfisAnalisadosEstaTag.has(usernameFound) && !candidatosAtuais.includes(usernameFound)) {
                                        candidatosAtuais.push(usernameFound);
                                        console.log(`📸 [SLIDE MODAL]: Capturado @${usernameFound}`);
                                    }
                                }
                                
                                await page.keyboard.press('ArrowRight');
                                await randomDelay(1500, 2500);
                            }
                            
                            await page.keyboard.press('Escape');
                            await randomDelay(1000, 2000);
                        } else {
                            console.log("❌ Nenhum post encontrado na grade para iniciar o slide.");
                        }
                    } catch(slideErr) {
                        console.log("⚠️ Erro na extração via slide modal:", slideErr.message);
                    }
                    
                    // Recalcular novos candidatos após slide modal
                    novosCandidatos = candidatosAtuais.filter(u => !perfisAnalisadosEstaTag.has(u));
                }

                if (novosCandidatos.length === 0) {
                    roundsWithoutNewCandidates++;
                    console.log(`⚠️ Nenhum novo candidato encontrado neste ciclo (${roundsWithoutNewCandidates}/5).`);
                    if (roundsWithoutNewCandidates >= 5) {
                        console.log(`🏁 Encerrando busca por hashtag #${tag} devido à falta de novos posts.`);
                        break;
                    }
                    continue;
                }

                roundsWithoutNewCandidates = 0;
                console.log(`🎯 Validando ${novosCandidatos.length} novos perfis nesta rodada...`);

                for (let username of novosCandidatos) {
                    if (contadorSalvos >= maxPerTag) {
                        console.log(`✅ Cota de ${maxPerTag} leads na hashtag #${tag} atingida!`);
                        break;
                    }

                    perfisAnalisadosEstaTag.add(username);

                    // Checar se já existe na Blacklist local ou no CRM local
                    if (blacklist.includes(username)) {
                        console.log(`⛔ Bloqueado pela Blacklist: @${username}`);
                        continue;
                    }

                    if (existing.includes(username)) {
                        console.log(`🔄 Já existe no CRM: @${username}`);
                        continue;
                    }

                    // Ir para o perfil
                    await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
                    await randomDelay(3000, 5000);

                    // Detectar se redirecionou para login
                    const currentProfileUrl = page.url();
                    if (currentProfileUrl.includes('accounts/login')) {
                        console.log("❌ Redirecionado para a página de login! A sessão expirou.");
                        break;
                    }

                    // Detectar se a conta está temporariamente bloqueada pela ação
                    const isBlocked = await page.evaluate(() => {
                        const text = document.body.innerText || '';
                        return text.includes('Restringimos determinadas atividades') || 
                               text.includes('Tente novamente mais tarde') ||
                               text.includes('Try again later') ||
                               text.includes('Limitamos a frequência') ||
                               text.includes('Something went wrong') ||
                               text.includes('Ocorreu um erro');
                    });
                    
                    if (isBlocked) {
                        console.log("🚨 [BLOQUEIO DETECTADO]: Instagram bloqueou a visualização de perfis temporariamente.");
                        console.log("⏳ Interrompendo a mineração para proteger a conta contra suspensões.");
                        break;
                    }

                    let followersText = null;
                    for (let attempt = 0; attempt < 3; attempt++) {
                        followersText = await page.evaluate(() => {
                            // 1. Tentar meta description primeiro
                            let metas = document.querySelectorAll('meta[name="description"]');
                            for (let meta of metas) {
                                let content = meta.getAttribute('content');
                                if (content) {
                                    let match = content.match(/([\d\.,\s]*\d(?:[kKmMbBiI]|mil milhões|milhões|milhão|mil|mi|bilhões|bilhão)?)\s*(followers|seguidores|seguidor|follower)/i);
                                    if (match) return match[1];
                                }
                            }
                            
                            // 2. Tentar os links específicos de seguidores
                            let followersLink = document.querySelector('a[href*="/followers/"]');
                            if (followersLink) {
                                let span = followersLink.querySelector('span');
                                if (span && span.getAttribute('title')) return span.getAttribute('title');
                                if (followersLink.getAttribute('title')) return followersLink.getAttribute('title');
                                let text = followersLink.innerText || followersLink.textContent || '';
                                let match = text.replace(/\r?\n/g, ' ').match(/([\d\.,\s]*\d(?:[kKmMbBiI]|mil milhões|milhões|milhão|mil|mi|bilhões|bilhão)?)\s*(followers|seguidores|seguidor|follower)/i);
                                if (match) return match[1];
                            }

                            // 3. Varrer todos os links, botões e elementos da lista de estatísticas
                            let candidates = document.querySelectorAll('a, button, li, [role="button"]');
                            for (let el of candidates) {
                                let text = el.innerText || el.textContent || '';
                                let cleanText = text.replace(/\r?\n/g, ' ').trim();
                                if (cleanText.length > 0 && cleanText.length < 100) {
                                    if (/followers|seguidores|seguidor|follower/i.test(cleanText)) {
                                        if (el.getAttribute('title')) return el.getAttribute('title');
                                        let titleSpan = el.querySelector('[title]');
                                        if (titleSpan && titleSpan.getAttribute('title')) return titleSpan.getAttribute('title');
                                        let childSpan = el.querySelector('span');
                                        if (childSpan && childSpan.getAttribute('title')) return childSpan.getAttribute('title');

                                        let match = cleanText.match(/([\d\.,\s]*\d(?:[kKmMbBiI]|mil milhões|milhões|milhão|mil|mi|bilhões|bilhão)?)\s*(followers|seguidores|seguidor|follower)/i);
                                        if (match) return match[1];
                                    }
                                }
                            }

                            // 4. Varrer spans gerais
                            let spans = document.querySelectorAll('span, div');
                            for (let el of spans) {
                                let text = el.innerText || el.textContent || '';
                                let cleanText = text.replace(/\r?\n/g, ' ').trim();
                                if (cleanText.length > 0 && cleanText.length < 50) {
                                    let match = cleanText.match(/^([\d\.,\s]*\d(?:[kKmMbBiI]|mil milhões|milhões|milhão|mil|mi|bilhões|bilhão)?)\s*(followers|seguidores|seguidor|follower)$/i);
                                    if (match) return match[1];
                                }
                            }
                            
                            return null;
                        });
                        
                        if (followersText) break;
                        // Se falhou, espera um pequeno delay e tenta novamente
                        await randomDelay(1200, 1800);
                    }

                    const profilePicUrl = await page.evaluate(() => {
                        let img = document.querySelector('header img');
                        return img ? img.src : 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
                    });

                    const followers = parseFollowers(followersText);

                    if (followers >= minFollowers && followers <= maxFollowers) {
                        
                        // Cálculo Lógico do Score
                        let finalScore = 40;
                        if (followers >= 15000 && followers <= 30000) {
                            finalScore = 85 + Math.floor(((followers - 15000) / 15000) * 14);
                        } else if (followers >= 5000 && followers < 15000) {
                            finalScore = 65 + Math.floor(((followers - 5000) / 10000) * 19);
                        } else if (followers > 30000) {
                            finalScore = 84 - Math.floor(Math.min(followers - 30000, 70000) / 70000 * 24);
                        } else {
                            finalScore = 40 + Math.floor((followers / 5000) * 20);
                        }
                        finalScore = Math.max(0, Math.min(99, finalScore));

                        const dateToday = new Date().toLocaleDateString('pt-BR');
                        const payload = { 
                            username, 
                            followers, 
                            niche: tag, 
                            status: "pendente", 
                            score: finalScore, 
                            date: dateToday, 
                            avatar: profilePicUrl 
                        };
                        
                        // Enviar para o painel via API
                        try {
                            await callAPI('/influencers', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: payload
                            });
                            console.log(`✅ Lead Qualificado e Injetado no CRM: @${username} | ${followers} seguidores.`);
                            existing.push(username);
                            contadorSalvos++;
                        } catch(err) {
                            console.log(`⚠️ Erro ao registrar lead @${username} no servidor: ${err.message}`);
                        }
                    } else {
                        console.log(`❌ Descartado: @${username} tem ${followers} seguidores (fora do alvo).`);
                    }
                    
                    await randomDelay(2000, 4000);
                }

                // Se ainda precisamos de mais leads, retornamos para a página da hashtag para continuar
                if (contadorSalvos < maxPerTag) {
                    const tagUrl = `https://www.instagram.com/explore/tags/${tag}/`;
                    console.log(`🔄 Retornando à página da hashtag #${tag} para carregar mais leads (${contadorSalvos}/${maxPerTag})...`);
                    await page.goto(tagUrl, { waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {});
                    await randomDelay(3000, 5000);
                }
            }

            if (config.turboMode && interceptHandler) {
                page.off('response', interceptHandler);
            }

            console.log(`⏳ Pausando entre nichos...`);
            await randomDelay(8000, 12000);

        } catch(e) {
            console.log(`⚠️ Erro ao explorar a tag #${tag}:`);
            console.log(e.stack);
        }
    }

    console.log("\n✅ Coleta finalizada! Todos os leads qualificados foram salvos no banco SQLite do CRM.");
    await browser.close();
})();
