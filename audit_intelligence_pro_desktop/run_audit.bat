@echo off
TITLE Audit Intelligence Pro - Enterprise Launcher
COLOR 0B
echo =====================================================================
echo          AUDIT INTELLIGENCE PRO - ENTERPRISE EDITION
echo =====================================================================
echo [*] Verificando entorno de ejecucion...

python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [X] ERROR: Python no esta instalado o no se encuentra en el PATH.
    echo     Descargue e instale Python desde: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [*] Ejecutando verificacion y migraciones con master.py...
python master.py --migrate

echo [*] Iniciando interfaz de auditoria Streamlit...
python launcher.py

pause
