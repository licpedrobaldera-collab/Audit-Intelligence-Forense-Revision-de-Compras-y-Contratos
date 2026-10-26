"""
Enterprise Extension - Módulo Principal de Integración Desktop
Punto de entrada unificado que expone todas las capacidades Enterprise:
1. Soporte Universal de Archivos (PDF, Word, Excel, CSV, TXT, Imágenes OCR)
2. Gestor de Evidencias Digitales con Carpetas y Hashes SHA-256
3. Motor de Auditoría de Compras (Pliegos vs Contratos vs Adendas con tope 25% Ley 340-06)
4. Motor de Ejecución Presupuestaria de Ciclo Completo (Aprobado -> Devengado -> Pagado)
5. Generador de las 8 Matrices Especializadas en Excel
6. Persistencia y Checkpoint para Reanudación al Día Siguiente
"""

import os
import json
from datetime import datetime

from .evidence_manager import EvidenceManager
from .procurement_audit import ProcurementAuditEngine
from .budget_audit import BudgetAuditEngine
from .matrix_engine import MatrixEngine
from .auto_updater import AutoUpdater
from .migration_manager import MigrationManager
from .workflow_engine import WorkflowEngine
from .compliance_engine import ComplianceEngine
from .ai_engine import AIEngine
from .template_builder import TemplateBuilder
from .external_validation import ExternalValidationEngine

class EnterpriseExtension:
    def __init__(self, workspace_dir="."):
        self.workspace_dir = workspace_dir
        self.evidence_mgr = EvidenceManager(base_dir=os.path.join(workspace_dir, "evidence"))
        self.procurement = ProcurementAuditEngine()
        self.budget = BudgetAuditEngine()
        self.matrix = MatrixEngine(output_dir=os.path.join(workspace_dir, "matrices"))
        self.updater = AutoUpdater(checkpoint_path=os.path.join(workspace_dir, "audit_checkpoint.json"))
        self.migrations = MigrationManager(
            db_path=os.path.join(workspace_dir, "database", "audit_intelligence.sqlite"),
            sql_dir=os.path.join(os.path.dirname(__file__), "sql")
        )
        self.ai = AIEngine()
        self.template = TemplateBuilder(output_dir=os.path.join(workspace_dir, "reports"))
        self.external = ExternalValidationEngine()

    def bootstrap(self):
        """Aplica migraciones e inicializa carpetas y checkpoint de sesión"""
        applied_mig = self.migrations.apply_all_migrations()
        chk = self.updater.load_checkpoint()
        return {
            "status": "Enterprise Extension Inicializada",
            "migraciones_aplicadas": applied_mig,
            "checkpoint_activo": chk["fecha_checkpoint"],
            "version": "2026.4.2 Enterprise"
        }

    def audit_procurement_item(self, monto_tdr, monto_contrato, monto_adenda, clausula_tdr="", clausula_contrato="", clausula_adenda=""):
        return self.procurement.evaluate_tdr_vs_contract_and_addenda(
            monto_tdr, monto_contrato, monto_adenda, clausula_tdr, clausula_contrato, clausula_adenda
        )

    def analyze_budget_cycle(self, items):
        return self.budget.analyze_portfolio(items)

    def export_all_matrices(self, full_data):
        return self.matrix.generate_all_matrices(full_data)

    def save_day_checkpoint(self, user="admin", tareas=None, resumen=None):
        return self.updater.save_checkpoint(user=user, tareas_pendientes=tareas, resumen=resumen)
