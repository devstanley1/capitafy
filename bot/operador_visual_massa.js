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

// Função de Delay Randômico Humano
const randomDelay = (min, max) => new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));

(async () => {
    console.log("🚀 Iniciando Operador Visual da Máquina de Vendas...");
    
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

    // Conta fixa local
    const currentAccount = {
        username: 'conta_padrao',
        session_id: sessionid,
        warmup_enabled: 1,
        story_reply_enabled: 1,
        likes_per_profile: 2,
        scroll_time_seconds: 10
    };
    
    // Obter configurações do painel
    let config;
    try {
        config = await callAPI('/system/config');
    } catch(e) {
        config = { proxyEnabled: false, proxyUrl: "" };
    }

    // Obter copys
    let COPIES = [];
    try {
        const copiesData = await callAPI('/system/copies');
        COPIES = copiesData.copies || [];
        console.log(`[✓] Carregadas ${COPIES.length} copys do servidor.`);
    } catch(e) {
        console.log("❌ Erro ao carregar copys do servidor.");
        return;
    }

    if (COPIES.length === 0) {
        console.log("❌ Nenhuma copy disponível para disparar.");
        return;
    }

    // Definição do Nicho
    let escolhaNicho = process.env.NICHO_FILTER || (process.argv.length > 2 ? process.argv[2] : 'todos');
    escolhaNicho = escolhaNicho.trim().toLowerCase();

    // Obter leads pendentes do banco via API
    let pendentes = [];
    try {
        pendentes = await callAPI(`/system/pending-leads?niche=${encodeURIComponent(escolhaNicho)}`);
        console.log(`🔎 Filtro: Nicho "${escolhaNicho}" | Encontrados ${pendentes.length} leads pendentes.`);
    } catch(e) {
        console.log(`❌ Erro ao carregar leads pendentes da API: ${e.message}`);
        return;
    }
    
    if (pendentes.length === 0) {
        console.log("🤷‍♂️ Nenhum lead pendente e seguro no CRM para atacar.");
        return;
    }

    let browser = null;
    let page = null;

    // Função interna para iniciar o navegador base (apenas UMA vez)
    async function initBaseBrowser() {
        if (browser) return;
        console.log(`\n==========================================`);
        console.log(`🚀 Inicializando Motor do Chrome (Uma vez só)`);
        console.log(`==========================================`);
        
        const launchArgs = ['--start-maximized'];
        if (config.proxyEnabled && config.proxyUrl) {
            launchArgs.push(`--proxy-server=${config.proxyUrl}`);
            console.log(`🌐 Utilizando Proxy nos disparos: ${config.proxyUrl}`);
        }

        browser = await puppeteer.launch({
            executablePath: CHROME_PATH,
            headless: false,
            defaultViewport: null,
            userDataDir: path.join(__dirname, 'bot_profile'),
            ignoreDefaultArgs: ['--enable-automation'],
            args: [...launchArgs, '--disable-infobars']
        });
    }

    // Função interna para realizar o WARMUP na aba fornecida
    async function performWarmup(activePage) {
        if (!currentAccount.warmup_enabled) return;
        
        console.log(`🔥 [WARM-UP]: Iniciando aquecimento comportamental para @${currentAccount.username}...`);
        try {
            await activePage.goto('https://www.instagram.com/', { waitUntil: 'networkidle2' });
            await randomDelay(4000, 7000);
            
            const scrollSteps = Math.ceil((currentAccount.scroll_time_seconds || 10) / 2);
            console.log(`🖱️ Rolo comportamental no feed por ${currentAccount.scroll_time_seconds || 10} segundos...`);
            for (let i = 0; i < scrollSteps; i++) {
                await activePage.evaluate(() => window.scrollBy(0, 400 + Math.random() * 200));
                await randomDelay(1500, 2500);
            }
            
            console.log(`📺 Tentando visualizar Stories na home...`);
            const storiesExist = await activePage.evaluate(() => {
                const storyButtons = Array.from(document.querySelectorAll('button[role="menuitem"], canvas, img[alt*="story"], img[alt*="Story"]'));
                if (storyButtons.length > 0) {
                    const target = storyButtons[0].closest('li') || storyButtons[0].closest('button') || storyButtons[0];
                    if (target) {
                        target.click();
                        return true;
                    }
                }
                return false;
            });
            
            if (storiesExist) {
                console.log(`🎬 Story aberto. Assistindo para marcar visualização orgânica...`);
                await randomDelay(6000, 10000);
                await activePage.keyboard.press('Escape');
                await randomDelay(2000, 3000);
            } else {
                console.log(`⚠️ Nenhum story disponível para visualização na home.`);
            }
            console.log(`✓ [WARM-UP] Concluído para @${currentAccount.username}.`);
        } catch(warmupErr) {
            console.log(`⚠️ Aviso no Warm-up: ${warmupErr.message}`);
        }
    }

    let isFirstLead = true;

    for (let alvo of pendentes) {
        const TARGET = alvo.username;

        if (!browser) {
            await initBaseBrowser();
        }

        // Criar aba 100% isolada e limpa na memória
        const context = await browser.createBrowserContext();
        page = await context.newPage();

        await page.setCookie({
            name: 'sessionid',
            value: currentAccount.session_id,
            domain: '.instagram.com',
            path: '/',
            secure: true,
            httpOnly: true
        });

        // Fazer warmup no primeiro lead ou a cada 10 leads pra manter a atividade orgânica
        if (isFirstLead) {
            await performWarmup(page);
            isFirstLead = false;
        }

        console.log(`\n==========================================`);
        console.log(`📡 Conta [@${currentAccount.username}] -> Perfil de: @${TARGET}`);
        
        try {
            await page.goto(`https://instagram.com/${TARGET}`, { waitUntil: 'networkidle2' });
            console.log("⏳ Aguardando a página carregar (Delay de Leitura)...");
            await randomDelay(3000, 6000);

            // Curtir posts no perfil do lead se configurado
            const likesCount = currentAccount.likes_per_profile || 0;
            if (likesCount > 0) {
                console.log(`🔥 [WARM-UP] Curtindo ${likesCount} post(s) no perfil de @${TARGET}...`);
                try {
                    for (let l = 0; l < likesCount; l++) {
                        const clicked = await page.evaluate((index) => {
                            const postLinks = document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]');
                            if (postLinks.length > index) {
                                postLinks[index].click();
                                return true;
                            }
                            return false;
                        }, l);

                        if (clicked) {
                            await randomDelay(3000, 5000);
                            await page.evaluate(() => {
                                const likeSvgs = Array.from(document.querySelectorAll('svg[aria-label="Curtir"]'));
                                if (likeSvgs.length > 0) {
                                    const btn = likeSvgs[0].closest('div[role="button"]') || likeSvgs[0].closest('button') || likeSvgs[0].parentElement;
                                    if (btn) btn.click();
                                }
                            });
                            console.log(`❤️ Curtida ${l + 1} enviada.`);
                            await randomDelay(2000, 3000);
                            await page.keyboard.press('Escape');
                            await randomDelay(2000, 3000);
                        } else {
                            break;
                        }
                    }
                } catch(likeErr) {
                    console.log(`⚠️ Não foi possível curtir posts no perfil: ${likeErr.message}`);
                }
            }

            // Sorteando copy
            const randomIndex = Math.floor(Math.random() * COPIES.length);
            let msg = COPIES[randomIndex];
            msg = msg.replace(/\{\{username\}\}/ig, TARGET).replace(/\{nome\}/ig, TARGET);

            let messageSent = false;

            // 1. TENTATIVA DE STORY REPLY (SE HABILITADO)
            if (currentAccount.story_reply_enabled) {
                console.log(`📡 [STORY REPLY]: Verificando se @${TARGET} possui Story ativo...`);
                try {
                    const storyActive = await page.evaluate(() => {
                        const canvas = document.querySelector('header canvas');
                        if (canvas) return true;
                        const storyTrigger = document.querySelector('header div[role="button"][cursor="pointer"] img, header div[role="button"] canvas');
                        return storyTrigger !== null;
                    });

                    if (storyActive) {
                        console.log(`⚡ Story ativo detectado! Clicando no avatar para responder...`);
                        await page.evaluate(() => {
                            const avatarButton = document.querySelector('header div[role="button"] canvas, header div[role="button"] img');
                            if (avatarButton) {
                                const clickTarget = avatarButton.closest('div[role="button"]') || avatarButton;
                                clickTarget.click();
                            }
                        });
                        
                        await randomDelay(4000, 6000);
                        
                        const storyReplied = await page.evaluate(async () => {
                            const selectors = [
                                'textarea[placeholder*="Responder"]',
                                'textarea[placeholder*="Reply"]',
                                'textarea[placeholder*="mensagem"]',
                                'textarea[placeholder*="message"]',
                                'textarea'
                            ];
                            
                            let inputEl = null;
                            for (let sel of selectors) {
                                const found = document.querySelector(sel);
                                if (found) {
                                    inputEl = found;
                                    break;
                                }
                            }

                            if (inputEl) {
                                inputEl.focus();
                                return { success: true };
                            }
                            return { success: false };
                        });

                        if (storyReplied.success) {
                            await page.type('textarea', msg, { delay: 10 });
                            await randomDelay(1000, 2000);
                            await page.keyboard.press('Enter');
                            await randomDelay(3000, 5000);
                            
                            await page.keyboard.press('Escape');
                            await randomDelay(2000, 3000);
                            
                            messageSent = true;
                            console.log(`🔥 [STORY REPLY ENVIADO]: Resposta enviada ao Story de @${TARGET}!`);
                        } else {
                            console.log(`⚠️ Falha ao encontrar o campo de input no Story. Fazendo fallback para a DM.`);
                            await page.keyboard.press('Escape');
                            await randomDelay(2000, 3000);
                        }
                    } else {
                        console.log(`🤷 Perfil não possui Story ativo no momento.`);
                    }
                } catch(storyErr) {
                    console.log(`⚠️ Erro na rotina de Story Reply: ${storyErr.message}. Fazendo fallback para DM.`);
                }
            }

            // 2. FALLBACK PARA ENVIAR DM DIRETA
            if (!messageSent) {
                console.log("🖱️ Tentando clicar no botão de Mensagem (DM Direta)...");
                const hasButton = await page.evaluate(() => {
                    const elements = Array.from(document.querySelectorAll('div[role="button"], button, a'));
                    const msgBtn = elements.find(el => {
                        const text = el.innerText ? el.innerText.trim().toLowerCase() : '';
                        return text === 'mensagem' || text === 'message' || text === 'enviar mensagem' || text.includes('mensagem');
                    });
                    if(msgBtn) {
                        msgBtn.id = 'alvo-mensagem-puppeteer';
                        return true;
                    }
                    return false;
                });

                if(!hasButton) {
                    console.log(`⚠️ Botão de mensagem não encontrado para @${TARGET}. Perfil inexistente ou privado sem DM. Pulando...`);
                    await callAPI('/system/leads/status', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: { username: TARGET, status: 'erro' }
                    });
                    await context.close();
                    await randomDelay(5000, 10000);
                    continue;
                }

                await page.click('#alvo-mensagem-puppeteer').catch(e => console.log('Aviso no clique:', e.message));
                await randomDelay(4000, 7000);

                console.log("⏳ Esperando abrir o Direct...");
                await page.waitForSelector('div[contenteditable="true"]', { timeout: 12000 });

                await page.type('div[contenteditable="true"]', msg, { delay: 10 });
                await randomDelay(1500, 2500);

                console.log("🔥 Apertando Enter (Enviando DM)!");
                await page.keyboard.press('Enter');
                await randomDelay(2000, 3000);
                messageSent = true;
            }

            if (messageSent) {
                await callAPI('/system/leads/status', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: { username: TARGET, status: 'enviada' }
                });
                console.log(`✅ Sucesso! @${TARGET} atualizado no CRM para 'enviada'.`);
            }

        } catch(e) {
            console.log(`❌ Erro visual no perfil @${TARGET}: ${e.message}`);
            try {
                await callAPI('/system/leads/status', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: { username: TARGET, status: 'erro' }
                });
            } catch(dbErr) {
                console.log(`⚠️ Falha ao salvar status de erro no servidor: ${dbErr.message}`);
            }
        }

        console.log("⏳ Fechando aba isolada do alvo e aguardando pausa humana...");
        await context.close(); // Limpa completamente a memória usada nesta aba
        
        await randomDelay(15000, 25000);
    }

    console.log("🏁 Operação visual de envio em massa concluída!");
    if (browser) {
        await browser.close();
    }
})();
