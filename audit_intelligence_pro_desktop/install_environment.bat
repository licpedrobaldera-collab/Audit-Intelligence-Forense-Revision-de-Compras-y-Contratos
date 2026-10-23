@echo off
TITLE Audit Intelligence Pro - Instalador de Dependencias
COLOR 0A
echo =====================================================================
echo      INSTALACION DE DEPENDENCIAS Y MOTOR OCR EMPRESARIAL
echo =====================================================================
echo [*] Actualizando pip e instalando requirements.txt...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

echo [*] Ejecutando migracion de base de datos...
python master.py --all

echo.
echo [✓] Instalacion completada con exito.
echo     Haga doble clic en run_audit.bat para iniciar el sistema.
pause
