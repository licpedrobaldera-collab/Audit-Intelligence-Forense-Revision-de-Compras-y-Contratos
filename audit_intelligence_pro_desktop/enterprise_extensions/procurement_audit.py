"""
Procurement Audit Engine - Auditoría de Procesos de Compras, Pliegos y Adendas
Compara Pliegos / TDR vs Contrato vs Adendas conforme a la Ley 340-06 Dominicana y su Reglamento 543-12.
Detecta si las adendas sobrepasan el límite legal del 25% (Art. 31) o desvirtúan el objeto contratado.
"""

from dataclasses import dataclass
from typing import List, Optional, Dict, Any

LIMITE_LEGAL_ADENDA_PCT = 25.0

@dataclass
class ProcurementAuditRecord:
    codigo_proceso: str
    entidad: str
    objeto_contratacion: str
    monto_tdr_estimado: float
    monto_contrato_original: float
    monto_adendas_total: float
    monto_final_acumulado: float
    porcentaje_variacion_adenda: float
    excede_limite_legal_25pct: bool
    clasificacion: str # FINANCIERO, LEGAL, OBRAS, ACL, TECNOLOGICO
    tipo_control: str  # DEBILIDAD_CONTROL_INTERNO, HALLAZGO_ADMINISTRATIVO, POSIBLE_OBSERVACION_PENAL_JUDICIAL
    condiciones_tdr_clave: str
    condiciones_contrato: str
    condiciones_adenda: str
    desviaciones_sustanciales: str
    acciones_recomendadas: str
    link_portal_transparencia: str
    link_dgcp: str
    link_contraloria: str
    link_hacienda_sigef: str

class ProcurementAuditEngine:
    def __init__(self, db_conn=None):
        self.conn = db_conn

    @staticmethod
    def calculate_procurement_metrics(monto_original: float, monto_adendas: float) -> Dict[str, Any]:
        monto_final = monto_original + monto_adendas
        pct_variacion = (monto_adendas / monto_original * 100) if monto_original > 0 else 0.0
        excede = pct_variacion > LIMITE_LEGAL_ADENDA_PCT
        return {
            "monto_final": monto_final,
            "porcentaje_variacion": round(pct_variacion, 2),
            "excede_limite_legal": excede,
            "monto_en_exceso": max(0.0, monto_adendas - (monto_original * 0.25)) if excede else 0.0
        }

    @staticmethod
    def evaluate_tdr_vs_contract_and_addenda(
        monto_tdr: float,
        monto_contrato: float,
        monto_adenda: float,
        clausula_tdr: str,
        clausula_contrato: str,
        clausula_adenda: str
    ) -> Dict[str, Any]:
        metrics = ProcurementAuditEngine.calculate_procurement_metrics(monto_contrato, monto_adenda)
        
        hallazgos = []
        clasificacion = "LEGAL"
        tipo_control = "DEBILIDAD_CONTROL_INTERNO"
        acciones = []

        if metrics["excede_limite_legal"]:
            clasificacion = "LEGAL"
            tipo_control = "POSIBLE_OBSERVACION_PENAL_JUDICIAL"
            hallazgos.append(
                f"La adenda incrementa el valor en {metrics['porcentaje_variacion']:.2f}%, "
                f"violando el límite legal del 25% estipulado en el Artículo 31 de la Ley 340-06. "
                f"Monto en exceso no amparado por ley: RD$ {metrics['monto_en_exceso']:,.2f}."
            )
            acciones.append("Notificar inmediatamente a la Dirección General de Contrataciones Públicas (DGCP).")
            acciones.append("Emitir solicitud de nulidad de la porción contractual en exceso del 25%.")
            acciones.append("Remitir expediente para análisis pericial penal ante la PEPCA y Contraloría General.")

        # Chequeo de inconsistencias de condiciones
        tdr_lower = clausula_tdr.lower()
        contrato_lower = clausula_contrato.lower()
        if "cadena de frío" in tdr_lower and "cadena de frío" not in contrato_lower:
            tipo_control = "POSIBLE_OBSERVACION_PENAL_JUDICIAL"
            hallazgos.append(
                "Supresión en el contrato de la exigencia estricta de Cadena de Frío (2°C a 8°C) "
                "prevista en el pliego de condiciones, poniendo en grave riesgo insumos oncológicos críticos."
            )
            acciones.append("Verificar estado físico y calidad de los lotes de fármacos recibidos en almacén INCART.")

        if "fianza" in tdr_lower and "anticipo" in contrato_lower and "garantía de buen uso" not in contrato_lower:
            tipo_control = "POSIBLE_OBSERVACION_PENAL_JUDICIAL"
            hallazgos.append(
                "Desembolso de anticipo contractual sin constitución previa de la Póliza de Fianza Bancaria de Buen Uso de Anticipo."
            )
            acciones.append("Exigir retención de pagos futuros o ejecución de pólizas solidarias a favor del Estado.")

        return {
            "metrics": metrics,
            "hallazgos": hallazgos,
            "clasificacion": clasificacion,
            "tipo_control": tipo_control,
            "acciones_recomendadas": "\n".join(acciones) if acciones else "Mantener monitoreo continuo en el portal transaccional de compras."
        }
