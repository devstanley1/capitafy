const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let expressAppProcess;

function startExpressServer() {
    console.log("Starting Express backend server...");
    // Inicializa o servidor Express em segundo plano
    expressAppProcess = spawn('node', [path.join(__dirname, 'backend', 'server.js')], {
        env: { ...process.env, PORT: 3000 }
    });

    expressAppProcess.stdout.on('data', (data) => {
        console.log(`[Backend]: ${data}`);
    });

    expressAppProcess.stderr.on('data', (data) => {
        console.error(`[Backend Erro]: ${data}`);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        title: "Capitafy CRM",
        icon: path.join(__dirname, 'frontend', 'public', 'favicon.svg'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // Aguarda um pequeno delay para garantir que o Express subiu antes de abrir a URL
    setTimeout(() => {
        mainWindow.loadURL('http://localhost:3000');
    }, 2000);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    startExpressServer();
    createWindow();
});

// Garante que o Express seja finalizado quando fechar o App
app.on('window-all-closed', () => {
    if (expressAppProcess) {
        expressAppProcess.kill();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
