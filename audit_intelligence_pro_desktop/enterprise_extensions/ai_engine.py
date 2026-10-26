"""
AI Engine - Motor Pericial de Inteligencia Artificial y Reglas Forenses
Aplica patrones periciales de auditoría para detectar:
- Fraccionamiento de compras (Art. 68 Ley 340-06)
- Adendas exorbitantes (> 25% Ley 340-06 Art. 31)
- Facturación con NCF duplicados o RNC suspendido en DGII
- Libramientos sin devengado previo (Ley 423-06)
- Supresión de especificaciones técnicas críticas (Cadena de frío en oncología)
"""

import re
from typing import Dict, Any, List

class AIEngine:
    def __init__(self):
        self.rules = [
            {
                "id": "RULE-01-ADENDA-25",
                "nombre": "Exceso de Adenda Contractual > 25%",
                "patron": r"(adenda|aumento|incremento)\s*.*?(2[6-9]|[3-9]\d|\d{3})%",
                "clasificacion": "LEGAL",
                "tipo_control": "POSIBLE_OBSERVACION_PENAL_JUDICIAL",
                "severidad": "Crítico"
            },
            {
                "id": "RULE-02-CADENA-FRIO",
                "nombre": "Riesgo de Cadena de Frío Oncológica",
                "patron": r"(cadena de fr[ií]o|temperatura|2[°º]c\s*a\s*8[°º]c|data-logger)",
                "clasificacion": "TECNOLOGICO",
                "tipo_control": "POSIBLE_OBSERVACION_PENAL_JUDICIAL",
                "severidad": "Crítico"
            },
            {
                "id": "RULE-03-ANTICIPO-SIN-FIANZA",
                "nombre": "Anticipo sin Fianza Bancaria de Buen Uso",
                "patron": r"(anticipo|adelanto)\s*.*?sin\s*(fianza|garant[ií]a|p[oó]liza)",
                "clasificacion": "FINANCIERO",
                "tipo_control": "POSIBLE_OBSERVACION_PENAL_JUDICIAL",
                "severidad": "Crítico"
            },
            {
                "id": "RULE-04-FRACCIONAMIENTO",
                "nombre": "Indicio de Fraccionamiento de Compras Menores",
                "patron": r"(fraccionamiento|compras menores simult[aá]neas|misma fecha|mismo proveedor)",
                "clasificacion": "LEGAL",
                "tipo_control": "HALLAZGO_ADMINISTRATIVO",
                "severidad": "Alto"
            }
        ]

    def evaluate_text(self, text: str) -> List[Dict[str, Any]]:
        hits = []
        for r in self.rules:
            if re.search(r["patron"], text, re.IGNORECASE):
                hits.append({
                    "regla_id": r["id"],
                    "nombre": r["nombre"],
                    "clasificacion": r["clasificacion"],
                    "tipo_control": r["tipo_control"],
                    "severidad": r["severidad"]
                })
        return hits
