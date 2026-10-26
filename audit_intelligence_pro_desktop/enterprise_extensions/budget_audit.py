"""
Budget Audit Engine - Auditoría de Ejecución Presupuestaria de Ciclo Completo
Analiza el ciclo presupuestario integral de ingresos y gastos:
Aprobado -> Modificado (Vigente) -> Preventivo -> Comprometido -> Devengado -> Pagado
Calcula saldo por comprometer, deuda flotante (Devengado - Pagado), sobreejecución y subejecución.
Compatible con República Dominicana (DIGEPRES/DIGECOG), USA (OMB/GAO), México (SHCP),
Colombia (MHCP), España (IGAE) y estándares internacionales IPSAS/NICSP.
"""

from dataclasses import dataclass
from typing import List, Dict, Any

@dataclass
class BudgetLineItem:
    id: int
    codigo_objeto: str
    denominacion: str
    tipo: str # "Gasto" | "Ingreso"
    aprobado: float
    modificaciones: float
    preventivo: float
    comprometido: float
    devengado: float
    pagado: float
    fuente_cruce: str

class BudgetAuditEngine:
    def __init__(self, country="República Dominicana"):
        self.country = country

    @staticmethod
    def calculate_cycle_metrics(aprobado: float, modificaciones: float, preventivo: float,
                                comprometido: float, devengado: float, pagado: float) -> Dict[str, Any]:
        vigente = aprobado + modificaciones
        saldo_por_comprometer = vigente - comprometido
        deuda_flotante = devengado - pagado # Cuentas por pagar pendientes de desembolso
        pct_ejecucion_devengado = (devengado / vigente * 100) if vigente > 0 else 0.0
        pct_ejecucion_pagado = (pagado / vigente * 100) if vigente > 0 else 0.0

        alerta_sobreejecucion = (comprometido > vigente) or (devengado > vigente)
        alerta_subejecucion = (pct_ejecucion_devengado < 50.0) # Subejecución al cierre fiscal o período avanzado
        alerta_deuda_flotante_alta = (deuda_flotante > (devengado * 0.35)) if devengado > 0 else False

        return {
            "vigente": vigente,
            "saldo_por_comprometer": saldo_por_comprometer,
            "deuda_flotante": deuda_flotante,
            "pct_ejecucion_devengado": round(pct_ejecucion_devengado, 2),
            "pct_ejecucion_pagado": round(pct_ejecucion_pagado, 2),
            "alerta_sobreejecucion": alerta_sobreejecucion,
            "alerta_subejecucion": alerta_subejecucion,
            "alerta_deuda_flotante_alta": alerta_deuda_flotante_alta
        }

    def analyze_portfolio(self, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        total_aprobado = sum(i.get("presupuestoAprobado", 0) for i in items)
        total_vigente = sum(i.get("presupuestoVigente", 0) for i in items)
        total_comprometido = sum(i.get("comprometido", 0) for i in items)
        total_devengado = sum(i.get("devengado", 0) for i in items)
        total_pagado = sum(i.get("pagado", 0) for i in items)
        total_deuda_flotante = sum(i.get("deudaFlotante", 0) for i in items)

        hallazgos_detectados = []
        for item in items:
            denom = item.get("denominacion", "")
            cod = item.get("codigoObjeto", "")
            dev = item.get("devengado", 0)
            vig = item.get("presupuestoVigente", 0)
            df = item.get("deudaFlotante", 0)

            if dev > vig:
                exceso = dev - vig
                hallazgos_detectados.append({
                    "codigo": cod,
                    "denominacion": denom,
                    "tipo": "SOBREEJECUCION_PRESUPUESTARIA",
                    "descripcion": f"La partida {cod} ({denom}) superó el presupuesto vigente por RD$ {exceso:,.2f} sin contar con modificación presupuestaria aprobada por DIGEPRES.",
                    "clasificacion": "FINANCIERO",
                    "tipo_control": "HALLAZGO_ADMINISTRATIVO"
                })

            if df > 1000000:
                hallazgos_detectados.append({
                    "codigo": cod,
                    "denominacion": denom,
                    "tipo": "DEUDA_FLOTANTE_CRITICA",
                    "descripcion": f"Partida {cod} presenta una deuda flotante acumulada de RD$ {df:,.2f} con libramientos pendientes de pago en Tesorería Nacional / SIGEF.",
                    "clasificacion": "FINANCIERO",
                    "tipo_control": "DEBILIDAD_CONTROL_INTERNO"
                })

        return {
            "pais": self.country,
            "totales": {
                "aprobado": total_aprobado,
                "vigente": total_vigente,
                "comprometido": total_comprometido,
                "devengado": total_devengado,
                "pagado": total_pagado,
                "deuda_flotante": total_deuda_flotante,
                "pct_devengado_global": round((total_devengado / total_vigente * 100), 2) if total_vigente > 0 else 0
            },
            "hallazgos": hallazgos_detectados
        }
