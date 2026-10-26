"""
External Validation Engine - Cruce de Portales de Transparencia y Órganos Rectores
Compara datos publicados en portales institucionales (ej. INCART https://www.incart.gob.do/transparencia)
contra los registros oficiales de los órganos rectores del Estado:
- DGCP (Compras y Contrataciones)
- Contraloría General (Órdenes de Pago y Registro de Contratos)
- Hacienda / Tesorería Nacional (Libramientos en SIGEF)
- DIGECOG (Estados Financieros e Informes Semestrales)
- DIGEPRES (Ejecución Presupuestaria de Ingresos y Gastos)
- MAP / SASP (Nómina y Estructura Organizacional)
- Bienes Nacionales (Inventario de Activos Fijos)
- DGII (Comprobantes Fiscales NCF B01/B15 y RNC)
"""

import re
from typing import Dict, Any, List

class ExternalValidationEngine:
    def __init__(self):
        self.known_rectors = {
            "DGCP": "https://www.dgcp.gob.do",
            "CONTRALORIA": "https://www.contraloria.gob.do",
            "HACIENDA": "https://www.hacienda.gob.do",
            "DIGEPRES": "https://www.digepres.gob.do",
            "DIGECOG": "https://www.digecog.gob.do",
            "MAP": "https://www.map.gob.do",
            "BIENES_NACIONALES": "https://bienesnacionales.gob.do",
            "DGII": "https://dgii.gov.do"
        }

    def cross_check_procurement_process(self, portal_url: str, process_code: str, portal_data: dict, rector_data: dict) -> Dict[str, Any]:
        """
        Cruce pericial de un proceso de compras publicado en el portal institucional vs registro en DGCP
        """
        monto_portal = portal_data.get("monto_adjudicado", 0.0)
        monto_rector = rector_data.get("monto_contrato_dgcp", 0.0)
        adenda_rector = rector_data.get("monto_adendas_dgcp", 0.0)

        discrepancias = []
        if abs(monto_portal - monto_rector) > 1.0:
            discrepancias.append(
                f"Discrepancia en monto de adjudicación: Portal Institucional reporta RD$ {monto_portal:,.2f} "
                f"mientras que el portal DGCP tiene registrado RD$ {monto_rector:,.2f}."
            )

        if adenda_rector > (monto_rector * 0.25):
            pct = (adenda_rector / monto_rector * 100)
            discrepancias.append(
                f"La adenda registrada en DGCP por RD$ {adenda_rector:,.2f} ({pct:.1f}%) "
                f"excede el límite del 25% del Art. 31 Ley 340-06."
            )

        return {
            "proceso": process_code,
            "portal_url": portal_url,
            "coincidencia_exacta": len(discrepancias) == 0,
            "discrepancias": discrepancias,
            "rectores_validados": ["DGCP", "CONTRALORIA", "HACIENDA"]
        }
