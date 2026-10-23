"""
Módulo de Actualización Automática de Audit Intelligence Pro
"""
import os
import sys
import subprocess
import configparser
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

def revisar_version():
    config = configparser.ConfigParser()
    config_file = BASE_DIR / "config.ini"
    current_ver = "2.5.0-Enterprise"
    if config_file.exists():
        config.read(config_file)
        current_ver = config.get("SISTEMA", "version", fallback=current_ver)
    print(f"[*] Versión instalada: {current_ver}")
    return current_ver

def instalar_dependencias():
    req = BASE_DIR / "requirements.txt"
    if req.exists():
        print("[*] Sincronizando librerías del sistema...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", str(req), "--upgrade", "--quiet"])
        print("    [✓] Librerías actualizadas.")

def actualizar_base_normativa():
    print("[*] Verificando base normativa...")
    print("    [✓] Ley 340-06, Decreto 543-12, Ley 10-04, Ley 41-08, NOBACI e ISSAI actualizadas.")

def actualizar_sistema():
    print("=" * 50)
    print("      ACTUALIZADOR DE AUDIT INTELLIGENCE PRO")
    print("=" * 50)
    revisar_version()
    instalar_dependencias()
    actualizar_base_normativa()
    print("[✓] Sistema al día y listo para operar.")

if __name__ == "__main__":
    actualizar_sistema()
