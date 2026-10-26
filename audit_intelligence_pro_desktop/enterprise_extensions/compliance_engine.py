"""
Compliance Engine - Catálogo Normativo y Motor de Cumplimiento Legal
Contiene el repositorio de leyes, reglamentos y resoluciones de los órganos rectores:
DGCP (Ley 340-06, Dec. 543-12), Contraloría (Ley 10-07), DIGEPRES (Ley 423-06),
DIGECOG (Ley 126-01), MAP (Ley 41-08) y estándares internacionales INTOSAI / ISSAI.
"""

from typing import List, Dict, Any

DEFAULT_NORMATIVES = [
    {
        "pais": "República Dominicana",
        "autoridad": "DGCP",
        "titulo": "Ley 340-06 de Compras y Contrataciones Públicas",
        "articulo": "Art. 31 (Tope máximo de modificaciones y adendas hasta un 25%)",
        "version": "Modificada por Ley 449-06",
        "source_url": "https://www.dgcp.gob.do",
        "status": "VIGENTE"
    },
    {
        "pais": "República Dominicana",
        "autoridad": "Poder Ejecutivo",
        "titulo": "Decreto 543-12 Reglamento de Aplicación Ley 340-06",
        "articulo": "Art. 74 a 85 (Requisitos indispensables de pliegos y TDR)",
        "version": "2012",
        "source_url": "https://www.dgcp.gob.do",
        "status": "VIGENTE"
    },
    {
        "pais": "República Dominicana",
        "autoridad": "Contraloría General",
        "titulo": "Ley 10-07 del Sistema Nacional de Control Interno",
        "articulo": "Art. 14 a 22 (Control previo, ordenaciones de pago y libramientos)",
        "version": "2007",
        "source_url": "https://www.contraloria.gob.do",
        "status": "VIGENTE"
    },
    {
        "pais": "República Dominicana",
        "autoridad": "DIGEPRES",
        "titulo": "Ley Orgánica de Presupuesto para el Sector Público No. 423-06",
        "articulo": "Art. 45 a 52 (Compromiso, devengado y prohibición de gastar sin crédito)",
        "version": "2006",
        "source_url": "https://www.digepres.gob.do",
        "status": "VIGENTE"
    },
    {
        "pais": "República Dominicana",
        "autoridad": "DIGECOG",
        "titulo": "Ley 126-01 de Contabilidad Gubernamental",
        "articulo": "Art. 8 a 15 (Registro de pasivos y estados financieros)",
        "version": "2001",
        "source_url": "https://www.digecog.gob.do",
        "status": "VIGENTE"
    }
]

class ComplianceEngine:
    def __init__(self, catalog=None):
        self.catalog = catalog or DEFAULT_NORMATIVES

    def check_compliance_citation(self, text: str) -> List[Dict[str, Any]]:
        text_lower = text.lower()
        matches = []
        for norm in self.catalog:
            key_title = norm["titulo"].lower()
            key_auth = norm["autoridad"].lower()
            if key_auth in text_lower or ("340-06" in text_lower and "340-06" in key_title):
                matches.append(norm)
        return matches
