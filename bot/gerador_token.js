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

(async () => {
    console.log("🚀 Abrindo navegador para conectar ao Instagram...");
    console.log("💡 DICA: Se você já estiver logado, será instantâneo. Senão, basta fazer o login na tela que abrirá.");

    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: false,
        userDataDir: path.join(__dirname, 'bot_profile'),
        ignoreDefaultArgs: ['--enable-automation'],
        args: ['--start-maximized', '--disable-infobars']
    });

    const page = await browser.newPage();
    await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle2' });

    let sessionid = null;
    
    while (!sessionid) {
        try {
            const cookies = await page.cookies();
            const sessionCookie = cookies.find(c => c.name === 'sessionid');
            
            if (sessionCookie) {
                sessionid = sessionCookie.value;
                console.log("\n✅ Login detectado com sucesso!");
                console.log("🔐 Capturando Session ID...");
                
                fs.writeFileSync(TOKEN_PATH, sessionid);
                console.log("💾 Sessão salva no arquivo token.txt!");
                break;
            }
        } catch (e) {
            // Se o navegador for fechado manualmente durante o loop, encerra silenciosamente
            console.log("⚠️ Conexão interrompida.");
            break;
        }
        
        await new Promise(r => setTimeout(r, 2000));
    }

    console.log("👋 Fechando o navegador em 3 segundos...");
    await new Promise(r => setTimeout(r, 3000));
    await browser.close().catch(() => {});
    process.exit(0);
})();
