import os
import sys
import subprocess
import shutil
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

REQUIRED_DIRS = [
    BASE_DIR / "database",
    BASE_DIR / "uploads",
    BASE_DIR / "exports",
    BASE_DIR / "reports",
    BASE_DIR / "backups",
    BASE_DIR / "logs",
    BASE_DIR / "temp",
    BASE_DIR / "cache",
]

def check_and_create_dirs():
    print("[*] Creando y verificando directorios del sistema...")
    for directory in REQUIRED_DIRS:
        directory.mkdir(parents=True, exist_ok=True)
    print("    [✓] Directorios listos.")

def check_and_install_dependencies():
    req_file = BASE_DIR / "requirements.txt"
    if req_file.exists():
        print("[*] Verificando e instalando dependencias desde requirements.txt...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", str(req_file)])
            print("    [✓] Dependencias verificadas con éxito.")
        except Exception as e:
            print(f"    [!] Advertencia instalando requisitos: {e}")

def run_app():
    app_path = BASE_DIR / "app.py"
    if not app_path.exists():
        print(f"[X] No se encontró {app_path}")
        return
    print("[*] Iniciando Audit Intelligence Pro...")
    cmd = [sys.executable, "-m", "streamlit", "run", str(app_path), "--server.port=8501", "--server.headless=true"]
    try:
        subprocess.run(cmd)
    except KeyboardInterrupt:
        print("\n[*] Aplicación finalizada por el usuario.")

if __name__ == "__main__":
    print("=" * 60)
    print("      AUDIT INTELLIGENCE PRO - LOADER AUTOMÁTICO")
    print("=" * 60)
    check_and_create_dirs()
    check_and_install_dependencies()
    run_app()
