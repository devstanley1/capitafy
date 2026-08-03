/**
 * =============================================================
 * Desenvolvido por @kkayron.dev
 * Instagram: https://instagram.com/kkayron.dev
 * Reestruturado para React + Shadcn por Antigravity
 * =============================================================
 */
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do Licenciamento Local
const licenseFile = path.join(__dirname, '..', 'database', 'license.json');

function checkLicenseLocal() {
    if (!fs.existsSync(licenseFile)) {
        return { active: false, reason: 'Arquivo de licença não encontrado.' };
    }
    try {
        const data = JSON.parse(fs.readFileSync(licenseFile, 'utf8'));
        if (data.licenseKey === 'DEV-BYPASS-CAPITAFY') {
            return { active: true, key: data.licenseKey, bypass: true };
        }
        if (!data.active) {
            return { active: false, reason: 'Licença inativa no arquivo.' };
        }
        const expiresAt = new Date(data.expiresAt);
        if (expiresAt < new Date()) {
            return { active: false, reason: 'Licença expirada.' };
        }
        return { active: true, key: data.licenseKey, expiresAt: data.expiresAt, email: data.email };
    } catch (e) {
        return { active: false, reason: 'Erro ao ler arquivo de licença.' };
    }
}

function validateLicenseOnline(key, url) {
    return new Promise((resolve, reject) => {
        const https = require('https');
        const http = require('http');
        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;
        
        const data = JSON.stringify({ licenseKey: key });
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };
        
        const req = client.request(urlObj, options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        resolve({ active: false, message: 'Resposta inválida do servidor de licenças.' });
                    }
                } else {
                    try {
                        const errRes = JSON.parse(body);
                        resolve({ active: false, message: errRes.error || `Erro de validação (${res.statusCode})` });
                    } catch (e) {
                        resolve({ active: false, message: `Erro do servidor (${res.statusCode})` });
                    }
                }
            });
        });
        
        req.on('error', (err) => {
            reject(err);
        });
        
        req.write(data);
        req.end();
    });
}

// Endpoints de Licenciamento
app.get('/api/license/status', (req, res) => {
    res.json(checkLicenseLocal());
});

app.post('/api/license/activate', async (req, res) => {
    const { licenseKey } = req.body;
    if (!licenseKey) {
        return res.status(400).json({ error: 'Chave de licença não informada.' });
    }
    
    const trimmedKey = licenseKey.trim();
    
    // Bypass de Desenvolvimento
    if (trimmedKey === 'DEV-BYPASS-CAPITAFY') {
        const licenseData = {
            licenseKey: trimmedKey,
            active: true,
            email: 'dev@capitafy.local',
            expiresAt: '2099-12-31T23:59:59.000Z',
            activatedAt: new Date().toISOString()
        };
        try {
            const dbDir = path.dirname(licenseFile);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }
            fs.writeFileSync(licenseFile, JSON.stringify(licenseData, null, 2));
            return res.json({ success: true, message: 'Bypass de Desenvolvimento Ativado!' });
        } catch (e) {
            return res.status(500).json({ error: 'Erro ao salvar arquivo de licença local.' });
        }
    }
    
    // Validação Online Real
    const centralUrl = process.env.LICENSE_API_URL || 'https://api.capitafy.com/api/license/validate';
    try {
        const result = await validateLicenseOnline(trimmedKey, centralUrl);
        if (result.active) {
            const licenseData = {
                licenseKey: trimmedKey,
                active: true,
                email: result.email || 'cliente@capitafy.com',
                expiresAt: result.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                activatedAt: new Date().toISOString()
            };
            const dbDir = path.dirname(licenseFile);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }
            fs.writeFileSync(licenseFile, JSON.stringify(licenseData, null, 2));
            res.json({ success: true, message: 'Licença ativada com sucesso!' });
        } else {
            res.status(400).json({ error: result.message || 'Chave de licença inválida ou expirada.' });
        }
    } catch (err) {
        console.error('Erro na validação online:', err.message);
        res.status(500).json({ 
            error: `Erro de conexão com servidor de validação (${err.message}). Tente usar a chave de desenvolvimento 'DEV-BYPASS-CAPITAFY' se estiver testando localmente.` 
        });
    }
});

// Middleware de Proteção por Licença (aplica-se a todas as outras rotas /api)
app.use((req, res, next) => {
    const bypassPaths = [
        '/api/license/status', 
        '/api/license/activate'
    ];
    
    if (bypassPaths.some(p => req.path.startsWith(p)) || !req.path.startsWith('/api')) {
        return next();
    }
    
    const check = checkLicenseLocal();
    if (!check.active) {
        return res.status(402).json({ error: 'Licença necessária: Ative sua cópia do sistema.', code: 'LICENSE_REQUIRED' });
    }
    next();
});


// Servir os arquivos compilados do React
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

const dbFile = path.join(__dirname, '..', 'database', 'database.db');

// Garantir que a pasta database existe antes de abrir o SQLite
const dbDir = path.dirname(dbFile);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbFile);

// Habilitar modo WAL no SQLite para evitar travamento de concorrência
db.run('PRAGMA journal_mode = WAL;');

const configFile = path.join(__dirname, '..', 'database', 'config_scraper.json');
const copiesFile = path.join(__dirname, '..', 'database', 'copies.txt');

// Helper para obter o executável do Chrome em múltiplos ambientes
function getChromePath() {
    const os = require('os');
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

// Middleware de Segurança (Somente Localhost)
app.use((req, res, next) => {
    const ip = req.connection.remoteAddress;
    if (!ip.includes('127.0.0.1') && !ip.includes('::1')) {
        return res.status(403).json({ error: 'Acesso bloqueado: Sistema restrito para localhost.' });
    }
    next();
});

// Variáveis para controle dos processos em background
let miningProcess = null;
let sendingProcess = null;
let sseClients = [];

// Inicializar banco de dados
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            followers INTEGER,
            niche TEXT,
            status TEXT DEFAULT 'pendente',
            score INTEGER,
            date TEXT,
            avatar TEXT
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS blacklist (
            username TEXT UNIQUE
        )
    `);
    // Migrar dados do data.json antigo se houver
    const oldDataFile = path.join(__dirname, '..', 'database', 'data.json');
    if (fs.existsSync(oldDataFile)) {
        try {
            const oldLeads = JSON.parse(fs.readFileSync(oldDataFile, 'utf8'));
            if (Array.isArray(oldLeads) && oldLeads.length > 0) {
                console.log(`[SQLITE]: Migrando ${oldLeads.length} leads do data.json para o banco...`);
                const stmt = db.prepare(`INSERT OR IGNORE INTO leads (username, followers, niche, status, score, date, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)`);
                oldLeads.forEach(lead => {
                    stmt.run(
                        lead.username, 
                        lead.followers || 0, 
                        lead.niche || '', 
                        lead.status || 'pendente', 
                        lead.score || 0, 
                        lead.date || '', 
                        lead.avatar || ''
                    );
                });
                stmt.finalize();
            }
            fs.renameSync(oldDataFile, path.join(__dirname, '..', 'database', 'data.json.bak'));
            console.log(`[SQLITE]: Migração de leads concluída.`);
        } catch (e) {
            console.error(`[SQLITE ERRO]: Erro ao migrar data.json:`, e);
        }
    }

    // Migrar dados do blacklist.json antigo se houver
    const oldBlacklistFile = path.join(__dirname, '..', 'database', 'blacklist.json');
    if (fs.existsSync(oldBlacklistFile)) {
        try {
            const oldBlacklist = JSON.parse(fs.readFileSync(oldBlacklistFile, 'utf8'));
            if (Array.isArray(oldBlacklist) && oldBlacklist.length > 0) {
                console.log(`[SQLITE]: Migrando ${oldBlacklist.length} perfis da blacklist antiga...`);
                const stmt = db.prepare(`INSERT OR IGNORE INTO blacklist (username) VALUES (?)`);
                oldBlacklist.forEach(user => {
                    stmt.run(user);
                });
                stmt.finalize();
            }
            fs.renameSync(oldBlacklistFile, path.join(__dirname, '..', 'database', 'blacklist.json.bak'));
            console.log(`[SQLITE]: Migração de blacklist concluída.`);
        } catch (e) {
            console.error(`[SQLITE ERRO]: Erro ao migrar blacklist.json:`, e);
        }
    }
});

// Helper para enviar logs em tempo real para os clientes SSE
function logToClients(type, text) {
    const payload = JSON.stringify({ type, text });
    sseClients.forEach(client => {
        client.write(`data: ${payload}\n\n`);
    });
}

// ════════════════════════════════════════
// GET /api/influencers — Listar todos
// ════════════════════════════════════════
app.get('/api/influencers', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    db.all(`SELECT * FROM leads ORDER BY id DESC`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao consultar banco de dados' });
        }
        res.json(rows);
    });
});

// ════════════════════════════════════════
// GET /api/stats — Estatísticas agregadas
// ════════════════════════════════════════
app.get('/api/stats', (req, res) => {
    db.all(`SELECT status, COUNT(*) as count FROM leads GROUP BY status`, [], (err, statusRows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.all(`SELECT niche, COUNT(*) as count FROM leads GROUP BY niche`, [], (err, nicheRows) => {
            if (err) return res.status(500).json({ error: err.message });
            
            const stats = {
                total: 0,
                pendentes: 0,
                enviados: 0,
                erros: 0,
                nichos: {}
            };
            
            statusRows.forEach(row => {
                const count = row.count;
                stats.total += count;
                if (row.status === 'pendente') stats.pendentes = count;
                else if (row.status === 'enviada') stats.enviados = count;
                else if (row.status === 'erro') stats.erros = count;
            });
            
            nicheRows.forEach(row => {
                stats.nichos[row.niche || 'desconhecido'] = row.count;
            });
            
            res.json(stats);
        });
    });
});

// ════════════════════════════════════════
// POST /api/influencers — Adicionar novo
// ════════════════════════════════════════
app.post('/api/influencers', (req, res) => {
    const { username, followers, niche, status, score, date, avatar } = req.body;
    const finalStatus = status || 'pendente';
    
    db.run(
        `INSERT INTO leads (username, followers, niche, status, score, date, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [username, followers, niche, finalStatus, score, date, avatar],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ error: 'Influencer já cadastrado no CRM' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.json({ id: this.lastID, username, followers, niche, status: finalStatus, score, date, avatar });
        }
    );
});

// ════════════════════════════════════════
// PUT /api/influencers/:id/status — Alterar status por ID
// ════════════════════════════════════════
app.put('/api/influencers/:id/status', (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    
    db.run(`UPDATE leads SET status = ? WHERE id = ?`, [status, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Lead não encontrado' });
        res.json({ id, status });
    });
});

// Alterar status de todos os leads em lote
app.put('/api/system/leads/bulk-status', (req, res) => {
    const { status } = req.body;
    db.run(`UPDATE leads SET status = ?`, [status], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, changes: this.changes });
    });
});

// ════════════════════════════════════════
// DELETE /api/influencers/:id — Remover um lead
// ════════════════════════════════════════
app.delete('/api/influencers/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM leads WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Lead não encontrado' });
        res.json({ success: true });
    });
});

// ════════════════════════════════════════
// DELETE /api/influencers — Limpar TUDO
// ════════════════════════════════════════
app.delete('/api/influencers', (req, res) => {
    db.run(`DELETE FROM leads`, [], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'CRM limpo com sucesso' });
    });
});

// ════════════════════════════════════════
// GET /api/export/csv — Exportar CSV
// ════════════════════════════════════════
app.get('/api/export/csv', (req, res) => {
    db.all(`SELECT * FROM leads ORDER BY id DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        let csv = 'Username,Seguidores,Nicho,Status,Link Instagram\n';
        rows.forEach(lead => {
            csv += `${lead.username},${lead.followers},${lead.niche},${lead.status},https://instagram.com/${lead.username}\n`;
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=leads_igaming.csv');
        res.send(csv);
    });
});

// ════════════════════════════════════════
// ROTAS DE COMUNICAÇÃO DE DADOS PARA MOTOR (SCRAPER/SENDER)
// ════════════════════════════════════════

// Obter blacklist e leads cadastrados em uma única chamada para sincronizar o minerador
app.get('/api/system/sync-check', (req, res) => {
    db.all(`SELECT username FROM blacklist`, [], (err, blacklistRows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.all(`SELECT username FROM leads`, [], (err, leadRows) => {
            if (err) return res.status(500).json({ error: err.message });
            
            res.json({
                blacklist: blacklistRows.map(r => r.username),
                existing: leadRows.map(r => r.username)
            });
        });
    });
});

// Obter leads pendentes filtrados por nicho
app.get('/api/system/pending-leads', (req, res) => {
    const nicheFilter = req.query.niche || 'todos';
    
    let query = `
        SELECT * FROM leads 
        WHERE status = 'pendente' 
        AND username NOT IN (SELECT username FROM blacklist)
    `;
    let params = [];
    
    if (nicheFilter !== 'todos' && nicheFilter !== '') {
        query += ` AND LOWER(niche) LIKE ?`;
        params.push(`%${nicheFilter.toLowerCase()}%`);
    }
    
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Atualizar o status de um lead pelo username
app.put('/api/system/leads/status', (req, res) => {
    const { username, status } = req.body;
    db.run(`UPDATE leads SET status = ? WHERE username = ?`, [status, username], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, changes: this.changes });
    });
});

// ════════════════════════════════════════
// CONFIGURAÇÕES
// ════════════════════════════════════════
app.get('/api/system/config', (req, res) => {
    if (fs.existsSync(configFile)) {
        res.json(JSON.parse(fs.readFileSync(configFile, 'utf8')));
    } else {
        res.json({ hashtags: "grau244, rendagarantida", minFollowers: 5000, maxFollowers: 50000, maxPerTag: 20, proxyEnabled: false, proxyUrl: "", turboMode: false });
    }
});

app.post('/api/system/config', (req, res) => {
    const dir = path.dirname(configFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(configFile, JSON.stringify(req.body, null, 2));
    res.json({ success: true, message: 'Configurações salvas' });
});

app.get('/api/system/copies', (req, res) => {
    if (fs.existsSync(copiesFile)) {
        res.json({ copies: fs.readFileSync(copiesFile, 'utf8').split('---').map(c => c.trim()).filter(c => c) });
    } else {
        res.json({ copies: ["Olá! Tenho uma proposta imperdível para seu perfil no iGaming."] });
    }
});

app.post('/api/system/copies', (req, res) => {
    const { copies } = req.body;
    const dir = path.dirname(copiesFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(copiesFile, copies.join('\n---\n'));
    res.json({ success: true, message: 'Copys salvas' });
});

// ════════════════════════════════════════
// TOKEN DE SESSÃO MANUAL
// ════════════════════════════════════════
app.get('/api/system/token', (req, res) => {
    const tokenPath = path.join(__dirname, '..', 'bot', 'token.txt');
    if (fs.existsSync(tokenPath)) {
        try {
            const token = fs.readFileSync(tokenPath, 'utf8').trim();
            res.json({ token, path: tokenPath });
        } catch (e) {
            res.status(500).json({ error: 'Erro ao ler arquivo de token' });
        }
    } else {
        res.json({ token: '', path: tokenPath });
    }
});

app.post('/api/system/token', (req, res) => {
    const { token } = req.body;
    const tokenPath = path.join(__dirname, '..', 'bot', 'token.txt');
    try {
        const botDir = path.dirname(tokenPath);
        if (!fs.existsSync(botDir)) fs.mkdirSync(botDir, { recursive: true });
        
        fs.writeFileSync(tokenPath, (token || '').trim());
        logToClients('system', 'Sessão do Instagram atualizada via token manual.');
        res.json({ success: true, message: 'Token de sessão salvo com sucesso' });
    } catch (e) {
        res.status(500).json({ error: 'Erro ao gravar arquivo de token: ' + e.message });
    }
});

// Status dos Motores
app.get('/api/system/status', (req, res) => {
    res.json({
        mining: miningProcess !== null,
        sending: sendingProcess !== null
    });
});

// SSE Stream de Logs
app.get('/api/system/logs/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Status de conexão
    res.write(`data: ${JSON.stringify({ type: 'system', text: 'Conexão de logs em tempo real estabelecida.' })}\n\n`);
    
    sseClients.push(res);
    
    req.on('close', () => {
        sseClients = sseClients.filter(c => c !== res);
    });
});

// Iniciar/Parar Mineração
app.post('/api/system/start-mining', (req, res) => {
    if (miningProcess) return res.status(400).json({ error: 'Mineração já está rodando' });
    
    const scriptPath = path.join(__dirname, '..', 'bot', 'scraper_visual.js');
    miningProcess = spawn('node', [scriptPath]);
    
    logToClients('system', 'Iniciando motor de mineração visual...');
    
    miningProcess.stdout.on('data', (data) => {
        const text = data.toString().trim();
        console.log(`[MINER]: ${text}`);
        logToClients('miner', text);
    });
    
    miningProcess.stderr.on('data', (data) => {
        const text = data.toString().trim();
        console.error(`[MINER ERRO]: ${text}`);
        logToClients('miner_error', text);
    });
    
    miningProcess.on('close', (code) => {
        miningProcess = null;
        logToClients('system', `Motor de mineração finalizado com código ${code}.`);
        logToClients('miner_status', 'stopped');
    });
    
    res.json({ success: true, message: 'Mineração iniciada' });
});

app.post('/api/system/stop-mining', (req, res) => {
    if (miningProcess) {
        miningProcess.kill();
        miningProcess = null;
        logToClients('system', 'Mineração interrompida pelo usuário.');
        res.json({ success: true, message: 'Mineração interrompida' });
    } else {
        res.status(400).json({ error: 'Nenhuma mineração rodando' });
    }
});

// Autenticar / Conectar Conta no Instagram
app.post('/api/system/connect-bot', (req, res) => {
    const scriptPath = path.join(__dirname, '..', 'bot', 'gerador_token.js');
    const connectProcess = spawn('node', [scriptPath]);
    
    logToClients('system', 'Iniciando navegador Chrome para autenticação do Instagram...');
    
    connectProcess.stdout.on('data', (data) => {
        const text = data.toString().trim();
        console.log(`[CONNECT]: ${text}`);
        logToClients('system', `[CONEXÃO] ${text}`);
    });
    
    connectProcess.stderr.on('data', (data) => {
        const text = data.toString().trim();
        console.error(`[CONNECT ERRO]: ${text}`);
        logToClients('system', `[CONEXÃO ERRO] ${text}`);
    });
    
    connectProcess.on('close', (code) => {
        logToClients('system', `Processo de login finalizado (Código ${code}).`);
    });
    
    res.json({ success: true, message: 'Navegador de conexão iniciado' });
});

// Iniciar/Parar Operador em Massa
app.post('/api/system/start-sending', (req, res) => {
    if (sendingProcess) return res.status(400).json({ error: 'Disparo em massa já está rodando' });
    
    const nicheFilter = req.body.niche || 'todos';
    const scriptPath = path.join(__dirname, '..', 'bot', 'operador_visual_massa.js');
    
    sendingProcess = spawn('node', [scriptPath], {
        env: { ...process.env, NICHO_FILTER: nicheFilter }
    });
    
    logToClients('system', `Iniciando motor de disparos (Filtro: ${nicheFilter})...`);
    
    sendingProcess.stdout.on('data', (data) => {
        const text = data.toString().trim();
        console.log(`[SENDER]: ${text}`);
        logToClients('sender', text);
    });
    
    sendingProcess.stderr.on('data', (data) => {
        const text = data.toString().trim();
        console.error(`[SENDER ERRO]: ${text}`);
        logToClients('sender_error', text);
    });
    
    sendingProcess.on('close', (code) => {
        sendingProcess = null;
        logToClients('system', `Motor de disparos finalizado com código ${code}.`);
        logToClients('sender_status', 'stopped');
    });
    
    res.json({ success: true, message: 'Disparos iniciados' });
});

app.post('/api/system/stop-sending', (req, res) => {
    if (sendingProcess) {
        sendingProcess.kill();
        sendingProcess = null;
        logToClients('system', 'Disparos interrompidos pelo usuário.');
        res.json({ success: true, message: 'Disparos interrompidos' });
    } else {
        res.status(400).json({ error: 'Nenhum disparo rodando' });
    }
});

// FREIO DE MÃO - PARAR TUDO FORÇADAMENTE
app.post('/api/system/kill', (req, res) => {
    let killed = false;
    if (miningProcess) {
        miningProcess.kill('SIGKILL');
        miningProcess = null;
        killed = true;
    }
    if (sendingProcess) {
        sendingProcess.kill('SIGKILL');
        sendingProcess = null;
        killed = true;
    }
    
    // Matar instâncias órfãs do Chrome
    const os = require('os');
    try {
        if (os.platform() === 'win32') {
            spawn('taskkill', ['/F', '/IM', 'chrome.exe']);
        } else {
            spawn('killall', ['-9', 'chrome', 'google-chrome', 'chromium-browser', 'chromium']);
        }
    } catch (e) {
        console.error("Erro ao forçar kill do Chrome:", e);
    }
    
    logToClients('system', '🔴 [FREIO DE MÃO ATIVADO] Todos os motores e navegadores ativos foram interrompidos forçadamente.');
    res.json({ success: true, message: 'Freio de mão ativado. Todos os motores finalizados.' });
});

// Blacklist
app.get('/api/system/blacklist', (req, res) => {
    db.all(`SELECT username FROM blacklist`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows.map(r => r.username));
    });
});

app.post('/api/system/blacklist', (req, res) => {
    const { username } = req.body;
    db.run(`INSERT OR IGNORE INTO blacklist (username) VALUES (?)`, [username], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        db.run(`UPDATE leads SET status = 'blacklist' WHERE username = ?`, [username]);
        res.json({ success: true, message: 'Usuário banido para sempre' });
    });
});

app.delete('/api/system/blacklist/:username', (req, res) => {
    const { username } = req.params;
    db.run(`DELETE FROM blacklist WHERE username = ?`, [username], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        db.run(`UPDATE leads SET status = 'pendente' WHERE username = ? AND status = 'blacklist'`, [username]);
        res.json({ success: true, message: 'Usuário removido da blacklist' });
    });
});

// Fallback para SPA React Router (caso alguma rota não mapeada seja requisitada)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

app.listen(3000, () => {
    console.log('🟢 CRM Dashboard rodando em http://localhost:3000');
});
