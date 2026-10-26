"""
Auto Updater & Continuity Checkpoint Manager
Gestiona la persistencia del estado para 'continuar al día siguiente', la cola de tareas
pendientes, la actualización automática de scripts y complementos del sistema.
"""

import os
import json
import subprocess
import sys
from datetime import datetime

CHECKPOINT_FILE = "audit_checkpoint.json"

class AutoUpdater:
    def __init__(self, checkpoint_path=CHECKPOINT_FILE):
        self.checkpoint_path = checkpoint_path

    def save_checkpoint(self, user="admin", tareas_pendientes=None, resumen=None):
        data = {
            "fecha_checkpoint": datetime.now().strftime("%Y-%m-%d"),
            "ultima_sincronizacion": datetime.now().isoformat(),
            "usuario": user,
            "tareas_pendientes": tareas_pendientes or [
                {"id": 1, "tarea": "Verificar ejecución física del búnker de radioterapia INCART", "completado": False},
                {"id": 2, "tarea": "Cruzar pagos en Hacienda con libramientos de farmacia oncológica", "completado": False},
                {"id": 3, "tarea": "Requerir a la DGCP dictamen pericial sobre adenda superior al 25%", "completado": False}
            ],
            "resumen_estado": resumen or "Sesión guardada para reanudación autónoma al siguiente inicio de jornada laboral.",
            "version_sistema": "Enterprise 2026.4.2"
        }
        with open(self.checkpoint_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return data

    def load_checkpoint(self):
        if not os.path.exists(self.checkpoint_path):
            return self.save_checkpoint()
        try:
            with open(self.checkpoint_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return self.save_checkpoint()

    def update_task_status(self, task_id: int, completado: bool):
        chk = self.load_checkpoint()
        for t in chk.get("tareas_pendientes", []):
            if t.get("id") == task_id:
                t["completado"] = completado
                break
        chk["ultima_sincronizacion"] = datetime.now().isoformat()
        with open(self.checkpoint_path, "w", encoding="utf-8") as f:
            json.dump(chk, f, indent=2, ensure_ascii=False)
        return chk

    @staticmethod
    def install_missing_dependencies(requirements_file="requirements_enterprise.txt"):
        """Instala autónomamente las librerías faltantes según sea requerido por nuevas plantillas"""
        if not os.path.exists(requirements_file):
            return False, f"Archivo {requirements_file} no encontrado"
        try:
            cmd = [sys.executable, "-m", "pip", "install", "-r", requirements_file]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return True, result.stdout
        except Exception as e:
            return False, str(e)
