import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { db, Expediente, Hallazgo, Riesgo, Proveedor, Contrato, Pago, Evidencia } from './server/db.ts';
import {
  analyzeDocumentWithGemini,
  ocrExtractWithGemini,
  generateStructuredFinding,
  analyzeWebsiteTransparency,
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
    recomendacion,
    conclusion,
    normativaReferencia,
    evidenciasAsociadas,
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
          recomendacion: recomendacion ?? data.hallazgos[idx].recomendacion,
          conclusion: conclusion ?? data.hallazgos[idx].conclusion,
          normativaReferencia: normativaReferencia ?? data.hallazgos[idx].normativaReferencia,
          evidenciasAsociadas: evidenciasAsociadas ?? data.hallazgos[idx].evidenciasAsociadas,
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
        recomendacion: recomendacion || '',
        conclusion: conclusion || '',
        normativaReferencia: normativaReferencia || '',
        evidenciasAsociadas: evidenciasAsociadas || [],
        createdBy: user || 'admin',
        createdAt: new Date().toISOString()
      };
      data.hallazgos.unshift(record);
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
  const { expedienteId, nombreOriginal, sha256, tipo, tamano, textoExtraido, metadatos, user } = req.body;
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
      metadatos: metadatos || {},
      subidoPor: user || 'admin',
      createdAt: new Date().toISOString()
    };
    data.evidencias.unshift(record);
  });

  db.logActivity(user || 'admin', 'CARGAR_EVIDENCIA', `${nombreOriginal} (SHA256: ${sha256.slice(0, 12)}...)`);
  res.json({ success: true, record });
});

app.delete('/api/evidencias/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = String(req.query.user || 'admin');
  db.updateData(data => {
    data.evidencias = data.evidencias.filter(e => e.id !== id);
  });
  db.logActivity(user, 'ELIMINAR_EVIDENCIA', `Evidencia ID ${id}`);
  res.json({ success: true });
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
