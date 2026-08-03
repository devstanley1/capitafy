#!/bin/bash
# =============================================================
# Desenvolvido por @kkayron.dev
# Reestruturado para React + Shadcn por Antigravity
# =============================================================

# Colors for layout
PURPLE='\033[0;35m'
NC='\033[0m' # No Color
GREEN='\033[0;32m'
RED='\033[0;31m'

# Check dependencies
if [ ! -d "node_modules" ]; then
    echo -e "${PURPLE}🔴 Primeira execução detectada! Instalando dependências...${NC}"
    npm run install-all
fi

show_menu() {
    clear
    echo -e "${PURPLE}=============================================================${NC}"
    echo -e "                      CAPITAFY (REACT)                     "
    echo -e "${PURPLE}=============================================================${NC}"
    echo -e "  [0] Abrir Dashboard no Navegador (http://localhost:5173)"
    echo -e "  [1] Conectar Conta Instagram (Autenticar Novo Perfil)"
    echo -e "  [2] FREIO DE MÃO (Parar todos os robôs e processos Chrome)"
    echo -e "  [3] Iniciar Servidor (Ecosystem Completo)"
    echo -e "  [4] Sair"
    echo -e "${PURPLE}=============================================================${NC}"
    read -p "Escolha uma opção: " opcao
}

while true; do
    show_menu
    case $opcao in
        0)
            echo "Iniciando ecossistema Capitafy em segundo plano..."
            npm run dev > server.log 2>&1 &
            echo "Aguardando 5 segundos para inicialização do servidor..."
            sleep 5
            if command -v xdg-open > /dev/null; then
                xdg-open http://localhost:5173
            elif command -v open > /dev/null; then
                open http://localhost:5173
            else
                echo "Por favor, abra http://localhost:5173 em seu navegador."
            fi
            ;;
        1)
            echo "Iniciando autenticador Instagram..."
            node bot/gerador_token.js
            echo ""
            read -n 1 -s -r -p "Processo finalizado. Pressione qualquer tecla para voltar ao menu."
            ;;
        2)
            echo "Ativando Freio de Mão..."
            killall -9 node 2>/dev/null
            killall -9 chrome google-chrome chromium-browser chromium 2>/dev/null
            echo "Todos os processos Node e Chrome foram parados!"
            sleep 2
            ;;
        3)
            echo "Iniciando ecossistema Capitafy em segundo plano..."
            npm run dev > server.log 2>&1 &
            echo "Aguardando 5 segundos para inicialização do servidor..."
            sleep 5
            if command -v xdg-open > /dev/null; then
                xdg-open http://localhost:5173
            elif command -v open > /dev/null; then
                open http://localhost:5173
            else
                echo "Por favor, abra http://localhost:5173 em seu navegador."
            fi
            ;;
        4)
            echo "Saindo..."
            exit 0
            ;;
        *)
            echo -e "${RED}Opção inválida!${NC}"
            sleep 2
            ;;
    esac
done
