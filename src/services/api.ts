import { DatabaseState, Expediente, Hallazgo, Riesgo, Proveedor, Contrato, Pago, Evidencia } from '../types';

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
};
