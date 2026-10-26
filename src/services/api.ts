import {
  DatabaseState,
  Expediente,
  Hallazgo,
  Riesgo,
  Proveedor,
  Contrato,
  Pago,
  Evidencia,
  FindingEvidence,
  DocumentVersion,
  NormativeCatalogItem,
  AppSettings,
  WorkflowStatus,
  CustomPlugin,
  CrossAuditResult
} from '../types';

export const api = {
  async getAll(): Promise<DatabaseState> {
    const res = await fetch('/api/db/all');
    if (!res.ok) throw new Error('Error al cargar datos del sistema');
    return res.json();
  },

  async resetToSample(user: string): Promise<{ success: boolean; data: DatabaseState }> {
    const res = await fetch('/api/db/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user }),
    });
    return res.json();
  },

  // Expedientes
  async saveExpediente(data: Partial<Expediente> & { user: string }): Promise<{ success: boolean; record: Expediente }> {
    const res = await fetch('/api/expedientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al guardar expediente');
    }
    return res.json();
  },

  async deleteExpediente(id: number, user: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/expedientes/${id}?user=${encodeURIComponent(user)}`, { method: 'DELETE' });
    return res.json();
  },

  // Hallazgos
  async saveHallazgo(data: Partial<Hallazgo> & { user: string }): Promise<{ success: boolean; record: Hallazgo }> {
    const res = await fetch('/api/hallazgos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al guardar hallazgo');
    }
    return res.json();
  },

  async deleteHallazgo(id: number, user: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/hallazgos/${id}?user=${encodeURIComponent(user)}`, { method: 'DELETE' });
    return res.json();
  },

  // Riesgos
  async saveRiesgo(data: Partial<Riesgo> & { user: string }): Promise<{ success: boolean; record: Riesgo }> {
    const res = await fetch('/api/riesgos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al guardar riesgo');
    }
    return res.json();
  },

  async deleteRiesgo(id: number, user: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/riesgos/${id}?user=${encodeURIComponent(user)}`, { method: 'DELETE' });
    return res.json();
  },

  // Proveedores
  async saveProveedor(data: Partial<Proveedor> & { user: string }): Promise<{ success: boolean; record: Proveedor }> {
    const res = await fetch('/api/proveedores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al guardar proveedor');
    }
    return res.json();
  },

  async deleteProveedor(id: number, user: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/proveedores/${id}?user=${encodeURIComponent(user)}`, { method: 'DELETE' });
    return res.json();
  },

  // Contratos
  async saveContrato(data: Partial<Contrato> & { user: string }): Promise<{ success: boolean; record: Contrato }> {
    const res = await fetch('/api/contratos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al guardar contrato');
    }
    return res.json();
  },

  async deleteContrato(id: number, user: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/contratos/${id}?user=${encodeURIComponent(user)}`, { method: 'DELETE' });
    return res.json();
  },

  // Pagos
  async savePago(data: Partial<Pago> & { user: string }): Promise<{ success: boolean; record: Pago; alertaDuplicado: boolean }> {
    const res = await fetch('/api/pagos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al registrar pago');
    }
    return res.json();
  },

  async deletePago(id: number, user: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/pagos/${id}?user=${encodeURIComponent(user)}`, { method: 'DELETE' });
    return res.json();
  },

  // Evidencias
  async saveEvidencia(data: Partial<Evidencia> & { user: string }): Promise<{ success: boolean; record: Evidencia }> {
    const res = await fetch('/api/evidencias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al registrar evidencia');
    }
    return res.json();
  },

  async deleteEvidencia(id: number, user: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/evidencias/${id}?user=${encodeURIComponent(user)}`, { method: 'DELETE' });
    return res.json();
  },

  // Document Versions (Diagnosis 1)
  async saveDocumentVersion(data: {
    evidenceId: number;
    fileName: string;
    sha256: string;
    fileSize: number;
    changeNote?: string;
    user: string;
  }): Promise<{ success: boolean; version: DocumentVersion }> {
    const res = await fetch('/api/document-versions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Findings Evidence Traceability (Diagnosis 1 & 5)
  async saveFindingEvidence(data: {
    id?: number;
    findingId: number;
    evidenceId: number;
    page: string;
    paragraph?: string;
    article?: string;
    verified?: boolean;
    notes?: string;
    user: string;
  }): Promise<{ success: boolean; record: FindingEvidence }> {
    const res = await fetch('/api/findings-evidence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteFindingEvidence(id: number, user: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/findings-evidence/${id}?user=${encodeURIComponent(user)}`, { method: 'DELETE' });
    return res.json();
  },

  // Workflow (Diagnosis 8)
  async transitionWorkflow(data: {
    objectType: 'Hallazgo' | 'Riesgo' | 'Evidencia' | 'Informe';
    objectId: number;
    newStatus: WorkflowStatus;
    user: string;
    comments?: string;
  }): Promise<{ success: boolean; workflow: any }> {
    const res = await fetch('/api/workflow/transition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Normative Catalog (Diagnosis 1 & 7)
  async saveNormativeCatalog(data: Partial<NormativeCatalogItem> & { user: string }): Promise<{ success: boolean; item: NormativeCatalogItem }> {
    const res = await fetch('/api/normative-catalog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteNormativeCatalog(id: number, user: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/normative-catalog/${id}?user=${encodeURIComponent(user)}`, { method: 'DELETE' });
    return res.json();
  },

  // Settings (Diagnosis 1)
  async updateSettings(data: Partial<AppSettings> & { user: string }): Promise<{ success: boolean; settings: AppSettings }> {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Enterprise AI Methods (Diagnosis 9)
  async aiExtract(text: string, fileName?: string): Promise<any> {
    const res = await fetch('/api/ai/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, fileName }),
    });
    return res.json();
  },

  async aiFindings(observation: string, monto?: number, context?: string): Promise<any> {
    const res = await fetch('/api/ai/findings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ observation, monto, context }),
    });
    return res.json();
  },

  async aiRisks(contextText: string): Promise<any> {
    const res = await fetch('/api/ai/risks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextText }),
    });
    return res.json();
  },

  async aiCompliance(criterioText: string, authority?: string): Promise<any> {
    const res = await fetch('/api/ai/compliance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ criterioText, authority }),
    });
    return res.json();
  },

  // General AI calls
  async analyzeText(text: string, fileName?: string, user = 'admin'): Promise<any> {
    const res = await fetch('/api/audit/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, fileName, user }),
    });
    if (!res.ok) throw new Error('Error al ejecutar análisis de IA');
    return res.json();
  },

  async ocrExtract(base64Data: string, mimeType: string, fileName?: string, user = 'admin'): Promise<any> {
    const res = await fetch('/api/audit/ocr-extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Data, mimeType, fileName, user }),
    });
    if (!res.ok) throw new Error('Error al procesar OCR con IA');
    return res.json();
  },

  async generateStructuredFinding(observacion: string, monto?: number, user = 'admin'): Promise<any> {
    const res = await fetch('/api/audit/generate-finding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ observacion, monto, user }),
    });
    if (!res.ok) throw new Error('Error al generar hallazgo');
    return res.json();
  },

  async analyzeWebsite(url: string, contexto?: string, user = 'admin'): Promise<any> {
    const res = await fetch('/api/audit/analyze-website', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, contexto, user }),
    });
    if (!res.ok) throw new Error('Error al auditar portal web');
    return res.json();
  },

  // Cross-Audit with Rector Organs & Google Search Grounding
  async crossAudit(params: {
    auditType: 'Compras' | 'Financiero' | 'Activos' | 'Nomina';
    entityName: string;
    entityDataOrUrl: string;
    rectorDataOrUrls?: Record<string, string>;
    useGoogleSearch?: boolean;
    user?: string;
  }): Promise<{ success: boolean; result: CrossAuditResult }> {
    const res = await fetch('/api/ai/cross-audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error en el cruce con órganos rectores');
    }
    return res.json();
  },

  async saveCrossFindings(params: {
    expedienteId: number | null;
    hallazgos: any[];
    evidencias: any[];
    user?: string;
  }): Promise<{ success: boolean; savedHallazgosCount: number; savedEvidenciasCount: number }> {
    const res = await fetch('/api/ai/cross-audit/save-findings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Error al guardar hallazgos y evidencias del cruce');
    return res.json();
  },

  // AutoProgrammer & Extension Engine
  async autoProgram(templateOrPrompt: string, user = 'admin'): Promise<{ success: boolean; pluginDraft: any }> {
    const res = await fetch('/api/ai/auto-program', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateOrPrompt, user }),
    });
    if (!res.ok) throw new Error('Error al autoprogramar función');
    return res.json();
  },

  async saveCustomPlugin(data: Partial<CustomPlugin> & { user: string }): Promise<{ success: boolean; record: CustomPlugin }> {
    const res = await fetch('/api/custom-plugins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al guardar plugin autónomo');
    return res.json();
  },

  async deleteCustomPlugin(id: number, user: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/custom-plugins/${id}?user=${encodeURIComponent(user)}`, { method: 'DELETE' });
    return res.json();
  },

  // Multi-Turn Chat with Gemini
  async sendChatMessage(
    messages: Array<{ role: 'user' | 'model'; content: string }>,
    auditorRole: string,
    useGoogleSearch = true,
    user = 'admin'
  ): Promise<{ success: boolean; reply: string; groundingSources?: Array<{ title: string; url: string }> }> {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, auditorRole, useGoogleSearch, user }),
    });
    if (!res.ok) throw new Error('Error en consulta de chat pericial');
    return res.json();
  },

  // Budget Execution (Ciclo Completo)
  async getBudgetExecution(): Promise<{ success: boolean; items: any[] }> {
    const res = await fetch('/api/budget-execution');
    return res.json();
  },

  async saveBudgetExecution(data: any): Promise<{ success: boolean; record: any }> {
    const res = await fetch('/api/budget-execution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al guardar ejecución presupuestaria');
    }
    return res.json();
  },

  async deleteBudgetExecution(id: number, user: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/budget-execution/${id}?user=${encodeURIComponent(user)}`, { method: 'DELETE' });
    return res.json();
  },

  // Evidence Folders
  async getEvidenceFolders(): Promise<{ success: boolean; folders: any[] }> {
    const res = await fetch('/api/evidence-folders');
    return res.json();
  },

  async addEvidenceFolderItem(data: { folderId: string; tipo: string; nombre: string; url?: string; tamano?: string; texto?: string; user: string }): Promise<{ success: boolean; folder: any }> {
    const res = await fetch('/api/evidence-folders/add-item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al agregar elemento a carpeta de evidencia');
    }
    return res.json();
  },

  // Procurement Audits (Pliegos vs Contratos vs Adendas >25%)
  async getProcurementAudits(): Promise<{ success: boolean; items: any[] }> {
    const res = await fetch('/api/procurement-audits');
    return res.json();
  },

  async saveProcurementAudit(data: any): Promise<{ success: boolean; record: any }> {
    const res = await fetch('/api/procurement-audits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al guardar auditoría de contratación');
    }
    return res.json();
  },

  // Autonomous Checkpoint
  async getCheckpoint(): Promise<{ success: boolean; checkpoint: any }> {
    const res = await fetch('/api/checkpoint');
    return res.json();
  },

  async syncCheckpoint(user: string): Promise<{ success: boolean; checkpoint: any }> {
    const res = await fetch('/api/checkpoint/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user }),
    });
    return res.json();
  },

  async toggleCheckpointTask(taskId: string, user: string): Promise<{ success: boolean; task: any }> {
    const res = await fetch('/api/checkpoint/toggle-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, user }),
    });
    return res.json();
  },

  // Specialized INCART Online Audit
  async auditIncartOnline(user: string): Promise<{ success: boolean; result: any; savedCount: number }> {
    const res = await fetch('/api/audit/incart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error en auditoría en línea del INCART');
    }
    return res.json();
  },
};
