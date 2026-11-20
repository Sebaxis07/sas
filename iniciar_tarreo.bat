@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================
echo   TARREO INACAP 2026: Sistema de Puntajes
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] No se encontro Node.js instalado en este equipo.
    echo Descargalo desde https://nodejs.org/ y vuelve a intentar.
    pause
    exit /b 1
)

echo [1/2] Instalando dependencias...
call npm.cmd install
if errorlevel 1 (
    echo.
    echo [ERROR] Fallo la instalacion de dependencias.
    pause
    exit /b 1
)

echo.
echo [2/2] Iniciando servidor local en http://localhost:5173/ ...
echo (Deja esta ventana abierta mientras uses el sistema)
echo.
call npm.cmd run dev -- --open

pause
