import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import {
  db,
  Expediente,
  Hallazgo,
  Riesgo,
  Proveedor,
  Contrato,
  Pago,
  Evidencia,
  DocumentVersion,
  FindingEvidence,
  NormativeCatalogItem,
  WorkflowItem,
  AppSettings,
  WorkflowStatus,
  CustomPlugin
} from './server/db.ts';
import {
  analyzeDocumentWithGemini,
  ocrExtractWithGemini,
  generateStructuredFinding,
  analyzeWebsiteTransparency,
  ai_extract,
  ai_findings,
  ai_risks,
  ai_compliance,
  crossAuditWithRectors,
  autoProgramFunction,
  multiTurnAuditChat
} from './server/gemini.ts';

dotenv.config();

const app = express();
const PORT = 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Body parsers with large limits for documents, OCR images, etc.
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health and System Info
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Audit Intelligence Pro - Enterprise',
    version: '2.5.0-Enterprise',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString()
  });
});

// Full Database Fetch
app.get('/api/db/all', (_req: Request, res: Response) => {
  res.json(db.getData());
});

// Reset to Sample Benchmark Data
app.post('/api/db/reset', (req: Request, res: Response) => {
  const user = req.body?.user || 'admin';
  const data = db.resetToSample();
  db.logActivity(user, 'RESTAURAR_DATOS_MUESTRA', 'Base de datos restaurada con caso modelo de auditoría');
  res.json({ success: true, data });
});

// --- EXPEDIENTES ---
app.post('/api/expedientes', (req: Request, res: Response) => {
  const { id, codigo, nombre, entidad, objetivo, responsable, periodo, fecha, estado, user } = req.body;
  if (!codigo || !nombre) {
    return res.status(400).json({ error: 'Código y nombre son obligatorios.' });
  }

  let record: Expediente = null as any;
  db.updateData(data => {
    if (id) {
      const idx = data.expedientes.findIndex(e => e.id === Number(id));
      if (idx !== -1) {
        data.expedientes[idx] = {
          ...data.expedientes[idx],
          codigo,
          nombre,
          entidad: entidad || '',
          objetivo: objetivo || '',
          responsable: responsable || '',
          periodo: periodo || '',
          fecha: fecha || data.expedientes[idx].fecha,
          estado: estado || 'Activo',
        };
        record = data.expedientes[idx];
      } else {
        throw new Error('Expediente no encontrado');
      }
    } else {
      const nextId = data.expedientes.length > 0 ? Math.max(...data.expedientes.map(e => e.id)) + 1 : 1;
      record = {
        id: nextId,
        codigo,
        nombre,
        entidad: entidad || '',
        objetivo: objetivo || '',
        responsable: responsable || '',
        periodo: periodo || '',
        fecha: fecha || new Date().toISOString().split('T')[0],
        estado: estado || 'Activo',
        createdBy: user || 'admin',
        createdAt: new Date().toISOString()
      };
      data.expedientes.unshift(record);
    }
  });

  db.logActivity(user || 'admin', id ? 'ACTUALIZAR_EXPEDIENTE' : 'CREAR_EXPEDIENTE', `${codigo} - ${nombre}`);
  res.json({ success: true, record });
});

app.delete('/api/expedientes/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = String(req.query.user || 'admin');
  db.updateData(data => {
    data.expedientes = data.expedientes.filter(e => e.id !== id);
  });
  db.logActivity(user, 'ELIMINAR_EXPEDIENTE', `Expediente ID ${id}`);
  res.json({ success: true });
});

// --- HALLAZGOS (CON 6 COMPONENTES) ---
app.post('/api/hallazgos', (req: Request, res: Response) => {
  const {
    id,
    expedienteId,
    titulo,
    condicion,
    criterio,
    causa,
    efecto,
    montoObservado,
    nivel,
    estado,
    workflowStatus,
    recomendacion,
    conclusion,
    normativaReferencia,
    evidenciasAsociadas,
    resultado,
    fuenteExterna,
    pagina,
    articulo,
    enlace,
    fechaValidacion,
    user
  } = req.body;

  if (!titulo) {
    return res.status(400).json({ error: 'El título del hallazgo es obligatorio.' });
  }

  let record: Hallazgo = null as any;
  db.updateData(data => {
    if (id) {
      const idx = data.hallazgos.findIndex(h => h.id === Number(id));
      if (idx !== -1) {
        data.hallazgos[idx] = {
          ...data.hallazgos[idx],
          expedienteId: expedienteId !== undefined ? (expedienteId ? Number(expedienteId) : null) : data.hallazgos[idx].expedienteId,
          titulo,
          condicion: condicion ?? data.hallazgos[idx].condicion,
          criterio: criterio ?? data.hallazgos[idx].criterio,
          causa: causa ?? data.hallazgos[idx].causa,
          efecto: efecto ?? data.hallazgos[idx].efecto,
          montoObservado: montoObservado !== undefined ? Number(montoObservado) : data.hallazgos[idx].montoObservado,
          nivel: nivel || data.hallazgos[idx].nivel,
          estado: estado || data.hallazgos[idx].estado,
          workflowStatus: (workflowStatus || data.hallazgos[idx].workflowStatus || 'BORRADOR') as WorkflowStatus,
          recomendacion: recomendacion ?? data.hallazgos[idx].recomendacion,
          conclusion: conclusion ?? data.hallazgos[idx].conclusion,
          normativaReferencia: normativaReferencia ?? data.hallazgos[idx].normativaReferencia,
          evidenciasAsociadas: evidenciasAsociadas ?? data.hallazgos[idx].evidenciasAsociadas,
          resultado: resultado ?? data.hallazgos[idx].resultado,
          fuenteExterna: fuenteExterna ?? data.hallazgos[idx].fuenteExterna,
          pagina: pagina ?? data.hallazgos[idx].pagina,
          articulo: articulo ?? data.hallazgos[idx].articulo,
          enlace: enlace ?? data.hallazgos[idx].enlace,
          fechaValidacion: fechaValidacion ?? data.hallazgos[idx].fechaValidacion,
          updatedAt: new Date().toISOString()
        };
        record = data.hallazgos[idx];
      } else {
        throw new Error('Hallazgo no encontrado');
      }
    } else {
      const nextId = data.hallazgos.length > 0 ? Math.max(...data.hallazgos.map(h => h.id)) + 1 : 1;
      record = {
        id: nextId,
        expedienteId: expedienteId ? Number(expedienteId) : null,
        titulo,
        condicion: condicion || '',
        criterio: criterio || '',
        causa: causa || '',
        efecto: efecto || '',
        montoObservado: montoObservado ? Number(montoObservado) : 0,
        nivel: nivel || 'Medio',
        estado: estado || 'Abierto',
        workflowStatus: (workflowStatus || 'BORRADOR') as WorkflowStatus,
        recomendacion: recomendacion || '',
        conclusion: conclusion || '',
        normativaReferencia: normativaReferencia || '',
        evidenciasAsociadas: evidenciasAsociadas || [],
        resultado: resultado || '',
        fuenteExterna: fuenteExterna || '',
        pagina: pagina || '',
        articulo: articulo || '',
        enlace: enlace || '',
        fechaValidacion: fechaValidacion || new Date().toISOString().split('T')[0],
        createdBy: user || 'admin',
        createdAt: new Date().toISOString()
      };
      data.hallazgos.unshift(record);

      // Initialize workflow record
      data.workflows.unshift({
        id: data.workflows.length > 0 ? Math.max(...data.workflows.map(w => w.id)) + 1 : 1,
        objectType: 'Hallazgo',
        objectId: nextId,
        status: (workflowStatus || 'BORRADOR') as WorkflowStatus,
        comments: 'Hallazgo creado en borrador'
      });
    }
  });

  db.logActivity(user || 'admin', id ? 'ACTUALIZAR_HALLAZGO' : 'CREAR_HALLAZGO', `${titulo} (Nivel: ${nivel})`);
  res.json({ success: true, record });
});

app.delete('/api/hallazgos/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = String(req.query.user || 'admin');
  db.updateData(data => {
    data.hallazgos = data.hallazgos.filter(h => h.id !== id);
  });
  db.logActivity(user, 'ELIMINAR_HALLAZGO', `Hallazgo ID ${id}`);
  res.json({ success: true });
});

// --- RIESGOS ---
app.post('/api/riesgos', (req: Request, res: Response) => {
  const { id, expedienteId, categoria, descripcion, probabilidad, impacto, mitigacion, estado, user } = req.body;
  if (!descripcion) {
    return res.status(400).json({ error: 'La descripción del riesgo es obligatoria.' });
  }

  const prob = Number(probabilidad) || 3;
  const imp = Number(impacto) || 3;
  const score = prob * imp;
  const nivel = score >= 20 ? 'Crítico' : score >= 15 ? 'Alto' : score >= 8 ? 'Medio' : 'Bajo';

  let record: Riesgo = null as any;
  db.updateData(data => {
    if (id) {
      const idx = data.riesgos.findIndex(r => r.id === Number(id));
      if (idx !== -1) {
        data.riesgos[idx] = {
          ...data.riesgos[idx],
          expedienteId: expedienteId !== undefined ? (expedienteId ? Number(expedienteId) : null) : data.riesgos[idx].expedienteId,
          categoria: categoria || data.riesgos[idx].categoria,
          descripcion,
          probabilidad: prob,
          impacto: imp,
          puntuacion: score,
          nivel,
          mitigacion: mitigacion ?? data.riesgos[idx].mitigacion,
          estado: estado || data.riesgos[idx].estado
        };
        record = data.riesgos[idx];
      } else {
        throw new Error('Riesgo no encontrado');
      }
    } else {
      const nextId = data.riesgos.length > 0 ? Math.max(...data.riesgos.map(r => r.id)) + 1 : 1;
      record = {
        id: nextId,
        expedienteId: expedienteId ? Number(expedienteId) : null,
        categoria: categoria || 'Operacional',
        descripcion,
        probabilidad: prob,
        impacto: imp,
        puntuacion: score,
        nivel,
        mitigacion: mitigacion || '',
        estado: estado || 'Pendiente',
        createdAt: new Date().toISOString()
      };
      data.riesgos.unshift(record);
    }
  });

  db.logActivity(user || 'admin', id ? 'ACTUALIZAR_RIESGO' : 'CREAR_RIESGO', `${categoria} - ${score}/25 (${nivel})`);
  res.json({ success: true, record });
});

app.delete('/api/riesgos/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = String(req.query.user || 'admin');
  db.updateData(data => {
    data.riesgos = data.riesgos.filter(r => r.id !== id);
  });
  db.logActivity(user, 'ELIMINAR_RIESGO', `Riesgo ID ${id}`);
  res.json({ success: true });
});

// --- PROVEEDORES ---
app.post('/api/proveedores', (req: Request, res: Response) => {
  const { id, nombre, rnc, contacto, rubro, estado, user } = req.body;
  if (!nombre) {
    return res.status(400).json({ error: 'El nombre del proveedor es obligatorio.' });
  }

  let record: Proveedor = null as any;
  db.updateData(data => {
    if (id) {
      const idx = data.proveedores.findIndex(p => p.id === Number(id));
      if (idx !== -1) {
        data.proveedores[idx] = {
          ...data.proveedores[idx],
          nombre,
          rnc: rnc ?? data.proveedores[idx].rnc,
          contacto: contacto ?? data.proveedores[idx].contacto,
          rubro: rubro ?? data.proveedores[idx].rubro,
          estado: estado || data.proveedores[idx].estado
        };
        record = data.proveedores[idx];
      } else {
        throw new Error('Proveedor no encontrado');
      }
    } else {
      const nextId = data.proveedores.length > 0 ? Math.max(...data.proveedores.map(p => p.id)) + 1 : 1;
      record = {
        id: nextId,
        nombre,
        rnc: rnc || '',
        contacto: contacto || '',
        rubro: rubro || '',
        estado: estado || 'Activo',
        createdAt: new Date().toISOString()
      };
      data.proveedores.unshift(record);
    }
  });

  db.logActivity(user || 'admin', id ? 'ACTUALIZAR_PROVEEDOR' : 'CREAR_PROVEEDOR', `${nombre} (RNC: ${rnc || 'S/N'})`);
  res.json({ success: true, record });
});

app.delete('/api/proveedores/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = String(req.query.user || 'admin');
  db.updateData(data => {
    data.proveedores = data.proveedores.filter(p => p.id !== id);
  });
  db.logActivity(user, 'ELIMINAR_PROVEEDOR', `Proveedor ID ${id}`);
  res.json({ success: true });
});

// --- CONTRATOS ---
app.post('/api/contratos', (req: Request, res: Response) => {
  const { id, numero, proveedorId, objeto, monto, fechaInicio, fechaFin, modalidad, estado, user } = req.body;
  if (!numero) {
    return res.status(400).json({ error: 'El número de contrato es obligatorio.' });
  }

  let record: Contrato = null as any;
  db.updateData(data => {
    if (id) {
      const idx = data.contratos.findIndex(c => c.id === Number(id));
      if (idx !== -1) {
        data.contratos[idx] = {
          ...data.contratos[idx],
          numero,
          proveedorId: proveedorId ? Number(proveedorId) : null,
          objeto: objeto ?? data.contratos[idx].objeto,
          monto: monto !== undefined ? Number(monto) : data.contratos[idx].monto,
          fechaInicio: fechaInicio || data.contratos[idx].fechaInicio,
          fechaFin: fechaFin || data.contratos[idx].fechaFin,
          modalidad: modalidad || data.contratos[idx].modalidad,
          estado: estado || data.contratos[idx].estado
        };
        record = data.contratos[idx];
      } else {
        throw new Error('Contrato no encontrado');
      }
    } else {
      const nextId = data.contratos.length > 0 ? Math.max(...data.contratos.map(c => c.id)) + 1 : 1;
      record = {
        id: nextId,
        numero,
        proveedorId: proveedorId ? Number(proveedorId) : null,
        objeto: objeto || '',
        monto: Number(monto) || 0,
        fechaInicio: fechaInicio || new Date().toISOString().split('T')[0],
        fechaFin: fechaFin || new Date().toISOString().split('T')[0],
        modalidad: modalidad || 'Licitación Pública',
        estado: estado || 'Vigente',
        createdAt: new Date().toISOString()
      };
      data.contratos.unshift(record);
    }
  });

  db.logActivity(user || 'admin', id ? 'ACTUALIZAR_CONTRATO' : 'CREAR_CONTRATO', `Contrato ${numero} - RD$ ${monto}`);
  res.json({ success: true, record });
});

app.delete('/api/contratos/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = String(req.query.user || 'admin');
  db.updateData(data => {
    data.contratos = data.contratos.filter(c => c.id !== id);
  });
  db.logActivity(user, 'ELIMINAR_CONTRATO', `Contrato ID ${id}`);
  res.json({ success: true });
});

// --- PAGOS & DETECCION AUTOMATICA DE DUPLICADOS ---
app.post('/api/pagos', (req: Request, res: Response) => {
  const { id, contratoId, beneficiario, rncBeneficiario, referencia, ncf, monto, fecha, descripcion, user } = req.body;
  if (!beneficiario || !monto || Number(monto) <= 0) {
    return res.status(400).json({ error: 'Beneficiario y monto mayor a cero son obligatorios.' });
  }

  const numMonto = Number(monto);
  let record: Pago = null as any;
  let duplicadoDetectado = false;

  db.updateData(data => {
    // Check duplicate payments: same reference, or same amount + same beneficiary
    const isDup = data.pagos.some(p => {
      if (id && p.id === Number(id)) return false;
      const sameRef = referencia && p.referencia && p.referencia.trim().toLowerCase() === referencia.trim().toLowerCase();
      const sameNcf = ncf && p.ncf && p.ncf.trim().toUpperCase() === ncf.trim().toUpperCase();
      const sameMontoAndBeneficiary = p.monto === numMonto && p.beneficiario.trim().toLowerCase() === beneficiario.trim().toLowerCase();
      return sameRef || sameNcf || sameMontoAndBeneficiary;
    });

    duplicadoDetectado = isDup;

    if (id) {
      const idx = data.pagos.findIndex(p => p.id === Number(id));
      if (idx !== -1) {
        data.pagos[idx] = {
          ...data.pagos[idx],
          contratoId: contratoId ? Number(contratoId) : null,
          beneficiario,
          rncBeneficiario: rncBeneficiario || '',
          referencia: referencia || '',
          ncf: ncf || '',
          monto: numMonto,
          fecha: fecha || data.pagos[idx].fecha,
          descripcion: descripcion || '',
          alertaDuplicado: isDup
        };
        record = data.pagos[idx];
      } else {
        throw new Error('Pago no encontrado');
      }
    } else {
      const nextId = data.pagos.length > 0 ? Math.max(...data.pagos.map(p => p.id)) + 1 : 1;
      record = {
        id: nextId,
        contratoId: contratoId ? Number(contratoId) : null,
        beneficiario,
        rncBeneficiario: rncBeneficiario || '',
        referencia: referencia || '',
        ncf: ncf || '',
        monto: numMonto,
        fecha: fecha || new Date().toISOString().split('T')[0],
        descripcion: descripcion || '',
        alertaDuplicado: isDup,
        createdAt: new Date().toISOString()
      };
      data.pagos.unshift(record);
    }
  });

  if (duplicadoDetectado) {
    db.logActivity(user || 'admin', 'ALERTA_DUPLICADO_DETECTADO', `Pago a ${beneficiario} por RD$ ${numMonto} - Posible duplicidad`);
  } else {
    db.logActivity(user || 'admin', id ? 'ACTUALIZAR_PAGO' : 'REGISTRAR_PAGO', `${beneficiario} - RD$ ${numMonto}`);
  }

  res.json({ success: true, record, alertaDuplicado: duplicadoDetectado });
});

app.delete('/api/pagos/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = String(req.query.user || 'admin');
  db.updateData(data => {
    data.pagos = data.pagos.filter(p => p.id !== id);
  });
  db.logActivity(user, 'ELIMINAR_PAGO', `Pago ID ${id}`);
  res.json({ success: true });
});

// --- EVIDENCIAS Y DOCUMENTOS ---
app.post('/api/evidencias', (req: Request, res: Response) => {
  const { expedienteId, nombreOriginal, sha256, tipo, tamano, textoExtraido, clasificacion, metadatos, user } = req.body;
  if (!nombreOriginal || !sha256) {
    return res.status(400).json({ error: 'Nombre original y hash SHA-256 son requeridos.' });
  }

  let record: Evidencia = null as any;
  db.updateData(data => {
    const nextId = data.evidencias.length > 0 ? Math.max(...data.evidencias.map(e => e.id)) + 1 : 1;
    const safeName = `${Date.now()}_${nombreOriginal.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    record = {
      id: nextId,
      expedienteId: expedienteId ? Number(expedienteId) : null,
      nombreOriginal,
      nombreGuardado: safeName,
      ruta: `uploads/${safeName}`,
      sha256,
      tipo: tipo || 'application/octet-stream',
      tamano: Number(tamano) || 0,
      textoExtraido: textoExtraido || '',
      clasificacion: clasificacion || 'Extraído',
      versionActual: 1,
      workflowStatus: 'BORRADOR',
      metadatos: metadatos || {},
      subidoPor: user || 'admin',
      createdAt: new Date().toISOString()
    };
    data.evidencias.unshift(record);

    // Initial version 1 in document_versions
    data.documentVersions.unshift({
      id: data.documentVersions.length > 0 ? Math.max(...data.documentVersions.map(v => v.id)) + 1 : 1,
      evidenceId: nextId,
      version: 1,
      sha256,
      fileName: nombreOriginal,
      fileSize: Number(tamano) || 0,
      changeNote: 'Carga inicial del documento',
      createdAt: new Date().toISOString(),
      createdBy: user || 'admin'
    });
  });

  db.logActivity(user || 'admin', 'CARGAR_EVIDENCIA', `${nombreOriginal} (SHA256: ${sha256.slice(0, 12)}...)`);
  res.json({ success: true, record });
});

app.delete('/api/evidencias/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = String(req.query.user || 'admin');
  db.updateData(data => {
    data.evidencias = data.evidencias.filter(e => e.id !== id);
    data.documentVersions = data.documentVersions.filter(dv => dv.evidenceId !== id);
    data.findingsEvidence = data.findingsEvidence.filter(fe => fe.evidenceId !== id);
  });
  db.logActivity(user, 'ELIMINAR_EVIDENCIA', `Evidencia ID ${id}`);
  res.json({ success: true });
});

// --- WORKFLOW TRANSITIONS (DIAGNOSIS 8) ---
app.post('/api/workflow/transition', (req: Request, res: Response) => {
  const { objectType, objectId, newStatus, user, comments } = req.body;
  if (!objectType || !objectId || !newStatus) {
    return res.status(400).json({ error: 'objectType, objectId y newStatus son obligatorios.' });
  }

  let wfItem: WorkflowItem = null as any;
  db.updateData(data => {
    const numId = Number(objectId);
    if (objectType === 'Hallazgo') {
      const h = data.hallazgos.find(item => item.id === numId);
      if (h) {
        h.workflowStatus = newStatus as WorkflowStatus;
        if (newStatus === 'APROBADO') h.estado = 'Cerrado';
        else if (newStatus === 'REVISION') h.estado = 'En proceso';
      }
    } else if (objectType === 'Riesgo') {
      const r = data.riesgos.find(item => item.id === numId);
      if (r) {
        r.workflowStatus = newStatus as WorkflowStatus;
      }
    } else if (objectType === 'Evidencia') {
      const ev = data.evidencias.find(item => item.id === numId);
      if (ev) {
        ev.workflowStatus = newStatus as WorkflowStatus;
        if (newStatus === 'APROBADO') ev.clasificacion = 'Aprobado';
      }
    }

    const existingIdx = data.workflows.findIndex(w => w.objectType === objectType && w.objectId === numId);
    if (existingIdx !== -1) {
      data.workflows[existingIdx] = {
        ...data.workflows[existingIdx],
        status: newStatus as WorkflowStatus,
        approvedBy: newStatus === 'APROBADO' ? (user || 'admin') : data.workflows[existingIdx].approvedBy,
        approvedAt: newStatus === 'APROBADO' ? new Date().toISOString() : data.workflows[existingIdx].approvedAt,
        comments: comments || data.workflows[existingIdx].comments
      };
      wfItem = data.workflows[existingIdx];
    } else {
      const nextId = data.workflows.length > 0 ? Math.max(...data.workflows.map(w => w.id)) + 1 : 1;
      wfItem = {
        id: nextId,
        objectType,
        objectId: numId,
        status: newStatus as WorkflowStatus,
        approvedBy: newStatus === 'APROBADO' ? (user || 'admin') : undefined,
        approvedAt: newStatus === 'APROBADO' ? new Date().toISOString() : undefined,
        comments: comments || ''
      };
      data.workflows.unshift(wfItem);
    }
  });

  db.logActivity(user || 'admin', 'TRANSICION_WORKFLOW', `${objectType} #${objectId} pasó a estado ${newStatus}`);
  res.json({ success: true, workflow: wfItem });
});

// --- FINDINGS EVIDENCE TRACEABILITY (DIAGNOSIS 1 & 5) ---
app.post('/api/findings-evidence', (req: Request, res: Response) => {
  const { id, findingId, evidenceId, page, paragraph, article, verified, notes, user } = req.body;
  if (!findingId || !evidenceId) {
    return res.status(400).json({ error: 'findingId y evidenceId son requeridos.' });
  }

  let record: FindingEvidence = null as any;
  db.updateData(data => {
    if (id) {
      const idx = data.findingsEvidence.findIndex(fe => fe.id === Number(id));
      if (idx !== -1) {
        data.findingsEvidence[idx] = {
          ...data.findingsEvidence[idx],
          page: page ?? data.findingsEvidence[idx].page,
          paragraph: paragraph ?? data.findingsEvidence[idx].paragraph,
          article: article ?? data.findingsEvidence[idx].article,
          verified: verified !== undefined ? Boolean(verified) : data.findingsEvidence[idx].verified,
          notes: notes ?? data.findingsEvidence[idx].notes,
        };
        record = data.findingsEvidence[idx];
      } else {
        throw new Error('Registro de trazabilidad no encontrado');
      }
    } else {
      const nextId = data.findingsEvidence.length > 0 ? Math.max(...data.findingsEvidence.map(fe => fe.id)) + 1 : 1;
      record = {
        id: nextId,
        findingId: Number(findingId),
        evidenceId: Number(evidenceId),
        page: page || 'Pág. 1',
        paragraph: paragraph || '',
        article: article || '',
        verified: Boolean(verified),
        notes: notes || '',
        createdAt: new Date().toISOString()
      };
      data.findingsEvidence.unshift(record);
    }
  });

  db.logActivity(user || 'admin', 'VINCULAR_EVIDENCIA_HALLAZGO', `Hallazgo #${findingId} vinculado con Evidencia #${evidenceId} (${page || 'pág'})`);
  res.json({ success: true, record });
});

app.delete('/api/findings-evidence/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = String(req.query.user || 'admin');
  db.updateData(data => {
    data.findingsEvidence = data.findingsEvidence.filter(fe => fe.id !== id);
  });
  db.logActivity(user, 'DESVINCULAR_EVIDENCIA', `Vínculo de evidencia #${id} eliminado`);
  res.json({ success: true });
});

// --- DOCUMENT VERSIONS (DIAGNOSIS 1) ---
app.post('/api/document-versions', (req: Request, res: Response) => {
  const { evidenceId, fileName, sha256, fileSize, changeNote, user } = req.body;
  if (!evidenceId || !sha256) {
    return res.status(400).json({ error: 'evidenceId y sha256 requeridos.' });
  }

  let newVer: DocumentVersion = null as any;
  db.updateData(data => {
    const existingVersions = data.documentVersions.filter(dv => dv.evidenceId === Number(evidenceId));
    const nextVerNumber = existingVersions.length > 0 ? Math.max(...existingVersions.map(v => v.version)) + 1 : 1;
    const nextId = data.documentVersions.length > 0 ? Math.max(...data.documentVersions.map(v => v.id)) + 1 : 1;
    newVer = {
      id: nextId,
      evidenceId: Number(evidenceId),
      version: nextVerNumber,
      sha256,
      fileName: fileName || 'archivo_actualizado',
      fileSize: Number(fileSize) || 0,
      changeNote: changeNote || `Versión ${nextVerNumber}`,
      createdAt: new Date().toISOString(),
      createdBy: user || 'admin'
    };
    data.documentVersions.unshift(newVer);

    const ev = data.evidencias.find(e => e.id === Number(evidenceId));
    if (ev) {
      ev.versionActual = nextVerNumber;
      ev.sha256 = sha256;
      if (fileName) ev.nombreOriginal = fileName;
    }
  });

  db.logActivity(user || 'admin', 'CREAR_VERSION_DOCUMENTO', `Nueva versión v${newVer.version} para Evidencia #${evidenceId}`);
  res.json({ success: true, version: newVer });
});

// --- NORMATIVE CATALOG CRUD (DIAGNOSIS 1 & 7) ---
app.post('/api/normative-catalog', (req: Request, res: Response) => {
  const { id, country, authority, title, article, version, sourceUrl, effectiveDate, status, resumen, user } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'El título de la norma es obligatorio.' });
  }

  let item: NormativeCatalogItem = null as any;
  db.updateData(data => {
    if (id) {
      const idx = data.normativeCatalog.findIndex(nc => nc.id === Number(id));
      if (idx !== -1) {
        data.normativeCatalog[idx] = {
          ...data.normativeCatalog[idx],
          country: country || data.normativeCatalog[idx].country,
          authority: authority || data.normativeCatalog[idx].authority,
          title,
          article: article || data.normativeCatalog[idx].article,
          version: version || data.normativeCatalog[idx].version,
          sourceUrl: sourceUrl || data.normativeCatalog[idx].sourceUrl,
          effectiveDate: effectiveDate || data.normativeCatalog[idx].effectiveDate,
          status: status || data.normativeCatalog[idx].status,
          resumen: resumen ?? data.normativeCatalog[idx].resumen,
        };
        item = data.normativeCatalog[idx];
      } else {
        throw new Error('Norma no encontrada');
      }
    } else {
      const nextId = data.normativeCatalog.length > 0 ? Math.max(...data.normativeCatalog.map(nc => nc.id)) + 1 : 1;
      item = {
        id: nextId,
        country: country || 'República Dominicana',
        authority: authority || 'DGCP',
        title,
        article: article || '',
        version: version || '1.0',
        sourceUrl: sourceUrl || '',
        effectiveDate: effectiveDate || new Date().toISOString().split('T')[0],
        status: status || 'Vigente',
        resumen: resumen || ''
      };
      data.normativeCatalog.unshift(item);
    }
  });

  db.logActivity(user || 'admin', id ? 'ACTUALIZAR_CATALOGO_NORMATIVO' : 'CREAR_CATALOGO_NORMATIVO', `${title} (${country})`);
  res.json({ success: true, item });
});

app.delete('/api/normative-catalog/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = String(req.query.user || 'admin');
  db.updateData(data => {
    data.normativeCatalog = data.normativeCatalog.filter(nc => nc.id !== id);
  });
  db.logActivity(user, 'ELIMINAR_NORMA_CATALOGO', `Norma ID ${id}`);
  res.json({ success: true });
});

// --- SETTINGS INTERNATIONALIZATION (DIAGNOSIS 1) ---
app.post('/api/settings', (req: Request, res: Response) => {
  const { language, country, currency, dateFormat, user } = req.body;
  let currentSettings: AppSettings = null as any;
  db.updateData(data => {
    data.settings = {
      ...data.settings,
      language: language || data.settings.language,
      country: country || data.settings.country,
      currency: currency || data.settings.currency,
      dateFormat: dateFormat || data.settings.dateFormat,
    };
    currentSettings = data.settings;
  });

  db.logActivity(user || 'admin', 'ACTUALIZAR_CONFIGURACION', `País: ${country}, Moneda: ${currency}`);
  res.json({ success: true, settings: currentSettings });
});

// --- ENTERPRISE AI ENDPOINTS (DIAGNOSIS 9) ---
app.post('/api/ai/extract', async (req: Request, res: Response) => {
  const { text, fileName } = req.body;
  try {
    const out = await ai_extract(text || '', fileName);
    res.json({ success: true, result: out });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/findings', async (req: Request, res: Response) => {
  const { observation, monto, context } = req.body;
  try {
    const out = await ai_findings(observation || '', monto, context);
    res.json({ success: true, result: out });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/risks', async (req: Request, res: Response) => {
  const { contextText } = req.body;
  try {
    const out = await ai_risks(contextText || '');
    res.json({ success: true, result: out });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/compliance', async (req: Request, res: Response) => {
  const { criterioText, authority } = req.body;
  try {
    const out = await ai_compliance(criterioText || '', authority);
    res.json({ success: true, result: out });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- GEMINI AI AUDITOR ENDPOINTS ---
app.post('/api/audit/analyze-text', async (req: Request, res: Response) => {
  const { text, fileName, user } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'El texto del documento a analizar es requerido.' });
  }

  try {
    const analysis = await analyzeDocumentWithGemini(text, fileName);
    db.logActivity(user || 'admin', 'ANALISIS_IA_DOCUMENTO', `Análisis de ${fileName || 'documento'}: ${analysis.hallazgosPropuestos.length} hallazgos detectados`);
    res.json({ success: true, analysis });
  } catch (err: any) {
    console.error('Error in analyze-text:', err);
    res.status(500).json({ error: 'Error analizando documento', details: err.message });
  }
});

app.post('/api/audit/ocr-extract', async (req: Request, res: Response) => {
  const { base64Data, mimeType, fileName, user } = req.body;
  if (!base64Data) {
    return res.status(400).json({ error: 'Datos base64 del documento requeridos.' });
  }

  try {
    const result = await ocrExtractWithGemini(base64Data, mimeType || 'image/png');
    db.logActivity(user || 'admin', 'OCR_MULTIMODAL', `OCR procesado para ${fileName || 'archivo'}`);
    res.json({ success: true, result });
  } catch (err: any) {
    console.error('Error in OCR extraction:', err);
    res.status(500).json({ error: 'Error en procesamiento OCR', details: err.message });
  }
});

app.post('/api/audit/generate-finding', async (req: Request, res: Response) => {
  const { observacion, monto, user } = req.body;
  if (!observacion) {
    return res.status(400).json({ error: 'La observación preliminar es obligatoria.' });
  }

  try {
    const finding = await generateStructuredFinding(observacion, monto);
    db.logActivity(user || 'admin', 'GENERAR_HALLAZGO_IA', `Hallazgo estructurado generado para: "${observacion.slice(0, 50)}..."`);
    res.json({ success: true, finding });
  } catch (err: any) {
    console.error('Error generating structured finding:', err);
    res.status(500).json({ error: 'Error generando hallazgo', details: err.message });
  }
});

app.post('/api/audit/analyze-website', async (req: Request, res: Response) => {
  const { url, contexto, user } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'La URL a auditar es obligatoria.' });
  }

  try {
    const report = await analyzeWebsiteTransparency(url, contexto);
    db.logActivity(user || 'admin', 'AUDITORIA_PORTAL_WEB', `Auditoría web de ${url} - Puntaje: ${report.puntuacionTransparencia}/100`);
    res.json({ success: true, report });
  } catch (err: any) {
    console.error('Error in website analysis:', err);
    res.status(500).json({ error: 'Error auditando portal web', details: err.message });
  }
});

// --- CROSS-AUDIT VS RECTOR ORGANS & GOOGLE SEARCH GROUNDING ---
app.post('/api/ai/cross-audit', async (req: Request, res: Response) => {
  const { auditType, entityName, entityDataOrUrl, rectorDataOrUrls, useGoogleSearch, user } = req.body;
  if (!entityName || !entityDataOrUrl) {
    return res.status(400).json({ error: 'El nombre de la entidad y los datos o enlace a contrastar son obligatorios.' });
  }

  try {
    const result = await crossAuditWithRectors({
      auditType: auditType || 'Compras',
      entityName,
      entityDataOrUrl,
      rectorDataOrUrls: rectorDataOrUrls || {},
      useGoogleSearch: useGoogleSearch !== false
    });

    db.logActivity(
      user || 'admin',
      'CRUCE_ORGANOS_RECTORES',
      `Cruce pericial de ${auditType} para ${entityName}: ${result.discrepancias?.length || 0} discrepancias, ${result.hallazgosDetectados?.length || 0} hallazgos`
    );

    res.json({ success: true, result });
  } catch (err: any) {
    console.error('Error in cross-audit:', err);
    res.status(500).json({ error: 'Error en cruce pericial con órganos rectores', details: err.message });
  }
});

// Save Cross-Audit Findings & Evidence automatically into active dossier
app.post('/api/ai/cross-audit/save-findings', (req: Request, res: Response) => {
  const { expedienteId, hallazgos, evidencias, user } = req.body;
  if (!Array.isArray(hallazgos)) {
    return res.status(400).json({ error: 'Lista de hallazgos requerida.' });
  }

  const expId = expedienteId ? Number(expedienteId) : null;
  const createdHallazgos: Hallazgo[] = [];
  const createdEvidencias: Evidencia[] = [];

  db.updateData(data => {
    // Save hallazgos
    hallazgos.forEach(h => {
      const nextHId = data.hallazgos.length > 0 ? Math.max(...data.hallazgos.map(x => x.id)) + 1 : 1;
      const newHallazgo: Hallazgo = {
        id: nextHId,
        expedienteId: expId,
        titulo: h.titulo || 'Hallazgo de cruce con órgano rector',
        condicion: h.condicion || '',
        criterio: h.criterio || '',
        causa: h.causa || '',
        efecto: h.efecto || '',
        montoObservado: h.montoObservado ? Number(h.montoObservado) : 0,
        nivel: h.nivel || 'Medio',
        estado: 'Abierto',
        workflowStatus: 'BORRADOR',
        recomendacion: h.recomendacion || '',
        conclusion: h.conclusion || '',
        normativaReferencia: h.normativaReferencia || '',
        resultado: `Observación derivada de cruce con órganos rectores. Monto: RD$ ${(h.montoObservado || 0).toLocaleString()}`,
        fuenteExterna: 'Portal Transparencia / Órgano Rector',
        pagina: 'Consulta Oficial en Línea',
        articulo: h.normativaReferencia || 'Ley 340-06 / Ley 10-04',
        enlace: 'https://comprasdominicana.gob.do',
        fechaValidacion: new Date().toISOString().split('T')[0],
        createdBy: user || 'admin',
        createdAt: new Date().toISOString()
      };
      data.hallazgos.unshift(newHallazgo);
      createdHallazgos.push(newHallazgo);
    });

    // Save evidences
    if (Array.isArray(evidencias)) {
      evidencias.forEach(ev => {
        const nextEId = data.evidencias.length > 0 ? Math.max(...data.evidencias.map(x => x.id)) + 1 : 1;
        const newEvidencia: Evidencia = {
          id: nextEId,
          expedienteId: expId,
          nombreOriginal: `${ev.fuente || 'Evidencia_Cruce'}.txt`,
          nombreGuardado: `cross_evidence_${nextEId}.txt`,
          ruta: `/uploads/cross_evidence_${nextEId}.txt`,
          sha256: ev.sha256 || '0000000000000000000000000000000000000000000000000000000000000000',
          tipo: 'text/plain',
          tamano: (ev.extracto || '').length,
          textoExtraido: ev.extracto || '',
          clasificacion: 'Verificado',
          versionActual: 1,
          workflowStatus: 'BORRADOR',
          metadatos: {
            fechas: [ev.fechaConsulta || new Date().toISOString()],
            firmasDetectadas: false
          },
          subidoPor: user || 'admin',
          createdAt: new Date().toISOString()
        };
        data.evidencias.unshift(newEvidencia);
        createdEvidencias.push(newEvidencia);
      });
    }
  });

  db.logActivity(
    user || 'admin',
    'GUARDAR_HALLAZGOS_CRUCE',
    `Guardados ${createdHallazgos.length} hallazgos y ${createdEvidencias.length} evidencias en expediente #${expId || 'General'}`
  );

  res.json({
    success: true,
    savedHallazgosCount: createdHallazgos.length,
    savedEvidenciasCount: createdEvidencias.length,
    createdHallazgos
  });
});

// --- AUTOPROGRAMMER & EXTENSION ENGINE ---
app.post('/api/ai/auto-program', async (req: Request, res: Response) => {
  const { templateOrPrompt, user } = req.body;
  if (!templateOrPrompt) {
    return res.status(400).json({ error: 'La plantilla o requerimiento de autoprogramación es requerido.' });
  }

  try {
    const pluginDraft = await autoProgramFunction({
      templateOrPrompt,
      userRole: user || 'admin'
    });

    res.json({ success: true, pluginDraft });
  } catch (err: any) {
    console.error('Error in auto-program:', err);
    res.status(500).json({ error: 'Error autoprogramando función', details: err.message });
  }
});

// Custom Plugins CRUD
app.post('/api/custom-plugins', (req: Request, res: Response) => {
  const { id, nombre, codigo, descripcion, categoria, organosRectores, dependencias, scriptSource, parametrosEntrada, reglasValidacion, activo, user } = req.body;
  if (!nombre || !codigo) {
    return res.status(400).json({ error: 'Nombre y código son obligatorios.' });
  }

  let record: CustomPlugin = null as any;
  db.updateData(data => {
    if (!data.customPlugins) data.customPlugins = [];

    if (id) {
      const idx = data.customPlugins.findIndex(p => p.id === Number(id));
      if (idx !== -1) {
        data.customPlugins[idx] = {
          ...data.customPlugins[idx],
          nombre,
          codigo,
          descripcion: descripcion || '',
          categoria: categoria || 'Especial',
          organosRectores: organosRectores || [],
          dependencias: dependencias || [],
          scriptSource: scriptSource || '',
          parametrosEntrada: parametrosEntrada || [],
          reglasValidacion: reglasValidacion || [],
          activo: activo !== undefined ? Boolean(activo) : true
        };
        record = data.customPlugins[idx];
      } else {
        throw new Error('Módulo no encontrado');
      }
    } else {
      const nextId = data.customPlugins.length > 0 ? Math.max(...data.customPlugins.map(p => p.id)) + 1 : 1;
      record = {
        id: nextId,
        nombre,
        codigo,
        descripcion: descripcion || '',
        categoria: categoria || 'Especial',
        organosRectores: organosRectores || [],
        dependencias: dependencias || [],
        scriptSource: scriptSource || '',
        parametrosEntrada: parametrosEntrada || [],
        reglasValidacion: reglasValidacion || [],
        activo: activo !== undefined ? Boolean(activo) : true,
        createdBy: user || 'admin',
        createdAt: new Date().toISOString()
      };
      data.customPlugins.unshift(record);
    }
  });

  db.logActivity(user || 'admin', id ? 'ACTUALIZAR_PLUGIN_AUTONOMO' : 'REGISTRAR_PLUGIN_AUTONOMO', `${nombre} (${codigo})`);
  res.json({ success: true, record });
});

app.delete('/api/custom-plugins/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = String(req.query.user || 'admin');
  db.updateData(data => {
    if (data.customPlugins) {
      data.customPlugins = data.customPlugins.filter(p => p.id !== id);
    }
  });
  db.logActivity(user, 'ELIMINAR_PLUGIN_AUTONOMO', `Módulo ID ${id}`);
  res.json({ success: true });
});

// --- MULTI-TURN AUDIT CHATBOT (FEATURE BLOCK) ---
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { messages, auditorRole, useGoogleSearch, user } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Historial de mensajes requerido.' });
  }

  try {
    const result = await multiTurnAuditChat({
      messages,
      auditorRole: auditorRole || 'forense',
      useGoogleSearch: useGoogleSearch !== false
    });

    db.logActivity(user || 'admin', 'CONSULTA_CHATBOT_PERICIAL', `Consulta sobre rol ${auditorRole}`);
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('Error in audit chat:', err);
    res.status(500).json({ error: 'Error en chat pericial', details: err.message });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Audit Intelligence Pro] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
