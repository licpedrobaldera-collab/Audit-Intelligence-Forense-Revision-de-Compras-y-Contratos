"""
Evidence Manager - Gestor de Evidencias Digitales con Cadena de Custodia
Crea y administra carpetas estructuradas 'evidence/hallazgo_XXXX/' con subdirectorios
para capturas, pdf, ocr, links y reportes, calculando hashes SHA-256 de integridad probatoria.
"""

import os
import json
import hashlib
from datetime import datetime

SUBDIRECTORIES = ["capturas", "pdf", "ocr", "links", "reportes"]

class EvidenceManager:
    def __init__(self, base_dir="evidence"):
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)

    @staticmethod
    def calculate_sha256(filepath):
        if not os.path.exists(filepath):
            return ""
        hasher = hashlib.sha256()
        with open(filepath, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                hasher.update(chunk)
        return hasher.hexdigest()

    def create_finding_folder(self, hallazgo_id, titulo, expediente="INCART-2025-01"):
        folder_name = f"hallazgo_{int(hallazgo_id):04d}"
        folder_path = os.path.join(self.base_dir, folder_name)
        
        # Crear subdirectorios de custodia
        for subdir in SUBDIRECTORIES:
            os.makedirs(os.path.join(folder_path, subdir), exist_ok=True)
            
        metadata = {
            "hallazgo_id": hallazgo_id,
            "folder_name": folder_name,
            "titulo": titulo,
            "expediente": expediente,
            "created_at": datetime.now().isoformat(),
            "last_updated": datetime.now().isoformat(),
            "items_count": 0,
            "items": []
        }
        
        meta_file = os.path.join(folder_path, "metadata.json")
        if not os.path.exists(meta_file):
            with open(meta_file, "w", encoding="utf-8") as f:
                json.dump(metadata, f, indent=2, ensure_ascii=False)
                
        return folder_path

    def add_evidence_item(self, hallazgo_id, tipo, nombre_archivo, fuente, content_bytes=None, text_content=None):
        """
        tipo: 'captura' | 'pdf' | 'ocr' | 'link' | 'reporte'
        """
        folder_name = f"hallazgo_{int(hallazgo_id):04d}"
        folder_path = os.path.join(self.base_dir, folder_name)
        if not os.path.exists(folder_path):
            self.create_finding_folder(hallazgo_id, f"Hallazgo #{hallazgo_id}")

        subdir_map = {
            "captura": "capturas",
            "pdf": "pdf",
            "ocr": "ocr",
            "link": "links",
            "reporte": "reportes"
        }
        target_sub = subdir_map.get(tipo, "capturas")
        target_file = os.path.join(folder_path, target_sub, nombre_archivo)
        
        sha256_hash = ""
        if content_bytes:
            with open(target_file, "wb") as f:
                f.write(content_bytes)
            sha256_hash = self.calculate_sha256(target_file)
        elif text_content:
            with open(target_file, "w", encoding="utf-8") as f:
                f.write(text_content)
            sha256_hash = hashlib.sha256(text_content.encode("utf-8")).hexdigest()
        else:
            # Entrada de enlace lógico
            sha256_hash = hashlib.sha256(f"{nombre_archivo}-{fuente}".encode("utf-8")).hexdigest()

        # Actualizar metadata
        meta_file = os.path.join(folder_path, "metadata.json")
        metadata = {}
        if os.path.exists(meta_file):
            with open(meta_file, "r", encoding="utf-8") as f:
                metadata = json.load(f)

        item = {
            "id": f"EV-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "tipo": tipo,
            "nombre_archivo": nombre_archivo,
            "ruta_relativa": os.path.join(target_sub, nombre_archivo),
            "fuente": fuente,
            "sha256": sha256_hash,
            "created_at": datetime.now().isoformat()
        }
        
        metadata.setdefault("items", []).append(item)
        metadata["items_count"] = len(metadata["items"])
        metadata["last_updated"] = datetime.now().isoformat()

        with open(meta_file, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)

        return item

    def verify_custody(self, hallazgo_id):
        """Verifica que todos los archivos físicos coincidan con el SHA-256 registrado en metadata"""
        folder_name = f"hallazgo_{int(hallazgo_id):04d}"
        folder_path = os.path.join(self.base_dir, folder_name)
        meta_file = os.path.join(folder_path, "metadata.json")
        if not os.path.exists(meta_file):
            return False, "No existe metadata.json para esta carpeta"

        with open(meta_file, "r", encoding="utf-8") as f:
            meta = json.load(f)

        results = []
        for it in meta.get("items", []):
            rel = it.get("ruta_relativa")
            if not rel:
                continue
            full_p = os.path.join(folder_path, rel)
            if os.path.exists(full_p):
                curr_hash = self.calculate_sha256(full_p)
                match = (curr_hash == it.get("sha256"))
                results.append({"archivo": rel, "coincide": match, "hash": curr_hash})
            else:
                results.append({"archivo": rel, "coincide": False, "error": "Archivo no encontrado"})

        all_ok = all(r.get("coincide") for r in results)
        return all_ok, results
