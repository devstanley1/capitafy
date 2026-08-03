@echo off
:: =============================================================
:: Desenvolvido por @kkayron.dev
:: Reestruturado para React + Shadcn por Antigravity
:: =============================================================
title Capitafy CRM
chcp 65001 > nul
color 05

:check_install
if not exist "node_modules" (
    echo -------------------------------------------------------------
    echo 🔴 Primeira execucao detectada! Instalando dependencias...
    echo -------------------------------------------------------------
    call npm run install-all
)
:menu
cls
echo =============================================================
echo                      CAPITAFY (DESKTOP)                     
echo =============================================================
echo  [0] Iniciar Aplicativo Desktop (SaaS Local)
echo  [1] Conectar Conta Instagram (Autenticar Novo Perfil)
echo  [2] FREIO DE MÃO (Parar todos os robos e processos Chrome)
echo  [3] Iniciar Servidor de Desenvolvimento (React + Express)
echo  [4] Compilar Frontend (Gerar dist atualizada)
echo  [5] Sair
echo =============================================================
set /p opcao="Escolha uma opcao: "

if "%opcao%"=="0" goto iniciar_desktop
if "%opcao%"=="1" goto conectar_conta
if "%opcao%"=="2" goto freio_de_mao
if "%opcao%"=="3" goto iniciar_servidor
if "%opcao%"=="4" goto compilar_frontend
if "%opcao%"=="5" goto sair

echo Opção Inválida! Escolha de 0 a 5.
timeout /t 2 > nul
goto menu

:iniciar_desktop
echo Iniciando Capitafy SaaS Local...
call npm run desktop
goto menu

:conectar_conta
echo Iniciar autenticador Instagram...
node bot/gerador_token.js
echo.
echo Processo finalizado. Pressione qualquer tecla para voltar ao menu.
pause > nul
goto menu

:freio_de_mao
echo Ativando Freio de Mao...
taskkill /f /im node.exe /t > nul 2>&1
taskkill /f /im chrome.exe /t > nul 2>&1
echo Todos os processos Node e Chrome foram parados!
timeout /t 3 > nul
goto menu

:iniciar_servidor
echo Iniciando ecossistema de desenvolvimento Capitafy em nova janela...
start cmd /k "npm run dev"
echo Aguardando 5 segundos para inicializacao do servidor...
timeout /t 5 > nul
start http://localhost:5173
goto menu

:compilar_frontend
echo Compilando Frontend React...
call npm run build
echo Compilação finalizada!
timeout /t 3 > nul
goto menu

:sair
exit
