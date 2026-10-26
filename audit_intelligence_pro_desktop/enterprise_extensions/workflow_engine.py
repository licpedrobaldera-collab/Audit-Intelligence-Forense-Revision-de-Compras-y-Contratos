"""
Workflow Engine - Motor de Flujos de Aprobación y Estados de Fiscalización
Gestiona el ciclo de vida: BORRADOR -> REVISION -> APROBADO -> ARCHIVADO
con trazabilidad, bitácora de firmas y bloqueo de modificaciones.
"""

from datetime import datetime
from typing import Optional, Dict, Any

VALID_STATUSES = ["BORRADOR", "REVISION", "APROBADO", "ARCHIVADO"]

class WorkflowEngine:
    def __init__(self, db_conn=None):
        self.conn = db_conn

    @staticmethod
    def can_transition(current_status: str, target_status: str) -> bool:
        transitions = {
            "BORRADOR": ["REVISION", "ARCHIVADO"],
            "REVISION": ["APROBADO", "BORRADOR"],
            "APROBADO": ["ARCHIVADO", "REVISION"],
            "ARCHIVADO": []
        }
        return target_status in transitions.get(current_status, [])

    @staticmethod
    def transition(object_type: str, object_id: int, current_status: str, target_status: str,
                   user: str, comments: Optional[str] = None) -> Dict[str, Any]:
        if target_status not in VALID_STATUSES:
            raise ValueError(f"Estado inválido: {target_status}. Válidos: {VALID_STATUSES}")

        if not WorkflowEngine.can_transition(current_status, target_status):
            raise ValueError(f"Transición no permitida de '{current_status}' a '{target_status}'")

        log_entry = {
            "object_type": object_type,
            "object_id": object_id,
            "status_anterior": current_status,
            "status_nuevo": target_status,
            "approved_by": user,
            "approved_at": datetime.now().isoformat(),
            "comments": comments or f"Transición a {target_status} aprobada por {user}"
        }
        return log_entry
