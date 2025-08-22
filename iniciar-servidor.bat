@echo off
echo =================================================
echo    🚀 INICIANDO SERVIDOR NOTAS DE VIDRO 🚀
echo =================================================
echo.

REM Configura o PATH para incluir o Node.js local
set PATH=%~dp0nodejs;%PATH%

REM Verifica se o Node.js está funcionando
echo ✅ Verificando Node.js...
node --version
if errorlevel 1 (
    echo ❌ Erro: Node.js não encontrado!
    echo Certifique-se de que a pasta 'nodejs' existe no diretório do projeto.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado!
echo.

REM Inicia o servidor de desenvolvimento
echo 🌟 Iniciando servidor React...
echo.
echo 📱 Acesse seu app em: http://localhost:8080
echo.
echo ☁️ APLICATIVO NA NUVEM:
echo    • Dados salvos automaticamente
echo    • Sincronização em tempo real
echo    • Acesse de qualquer lugar 
echo ⚠️  Para parar o servidor, pressione Ctrl+C
echo =================================================
echo.

npm run dev

REM Mantém o terminal aberto se houver erro
if errorlevel 1 (
    echo.
    echo ❌ Erro ao iniciar o servidor!
    pause
)