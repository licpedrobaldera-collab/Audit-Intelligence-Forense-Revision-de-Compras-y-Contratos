import fs from 'fs';
import path from 'path';

export type WorkflowStatus = 'BORRADOR' | 'PENDIENTE' | 'REVISION' | 'APROBADO' | 'RECHAZADO' | 'CERRADO';

export interface Expediente {
  id: number;
  codigo: string;
  nombre: string;
  entidad: string;
  objetivo: string;
  responsable: string;
  periodo: string;
  fecha: string;
  estado: 'Activo' | 'En revisión' | 'Cerrado' | 'Suspendido';
  createdBy: string;
  createdAt: string;
}

export interface Hallazgo {
  id: number;
  expedienteId: number | null;
  titulo: string;
  condicion: string;
  criterio: string;
  causa: string;
  efecto: string;
  montoObservado?: number;
  nivel: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
  estado: 'Abierto' | 'En proceso' | 'Subsanado' | 'Cerrado';
  workflowStatus: WorkflowStatus;
  recomendacion: string;
  conclusion?: string;
  normativaReferencia?: string;
  evidenciasAsociadas?: string[];
  // Trazabilidad forense y tipificación pericial
  resultado?: string;
  fuenteExterna?: string;
  pagina?: string;
  articulo?: string;
  enlace?: string;
  fechaValidacion?: string;
  clasificacion?: 'FINANCIERO' | 'LEGAL' | 'OBRAS' | 'ACL' | 'TECNOLOGICO' | 'CONTROL_INTERNO';
  tipoControl?: 'DEBILIDAD_CONTROL_INTERNO' | 'HALLAZGO_ADMINISTRATIVO' | 'POSIBLE_OBSERVACION_PENAL_JUDICIAL';
  accionesRecomendadasAuditor?: string[];
  evidenciaCarpetaId?: string;
  analisisPliegoContratoAdenda?: {
    tieneAdenda: boolean;
    montoOriginal: number;
    montoAdenda: number;
    porcentajeVariacion: number;
    excedeLimiteLegal: boolean;
    discrepanciaTdrPliego?: string;
  };
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BudgetExecutionItem {
  id: number;
  expedienteId?: number | null;
  pais: string;
  entePresupuestario: string; // ej. DIGEPRES / DIGECOG / SIGEF
  codigoObjetoGasto: string; // 2.1, 2.2, 2.3, 2.4, 2.6, 2.7
  denominacion: string;
  tipo: 'Ingreso' | 'Gasto';
  presupuestoAprobado: number;
  presupuestoModificado: number;
  preventivo: number;
  comprometido: number;
  devengado: number;
  pagado: number;
  saldoPorComprometer: number;
  saldoPorDevengar: number;
  saldoPorPagar: number;
  porcentajeEjecucion: number;
  estadoEjecucion: 'Normal' | 'Subejecución' | 'Sobreejecución' | 'Compromiso sin Asignación' | 'Alerta Desvío';
  observaciones: string;
  fuenteRectorUrl?: string;
  fechaCorte: string;
}

export interface EvidenceFolderItem {
  id: string;
  nombre: string;
  tipo: 'captura' | 'pdf' | 'ocr' | 'link' | 'reporte';
  url?: string;
  tamano?: string;
  sha256: string;
  texto?: string;
  fecha: string;
}

export interface EvidenceFolder {
  id: string;
  hallazgoId: number;
  hallazgoTitulo: string;
  codigoExpediente?: string;
  fuente: string;
  fecha: string;
  url?: string;
  sha256: string;
  subcarpetas: {
    capturas: EvidenceFolderItem[];
    pdf: EvidenceFolderItem[];
    ocr: EvidenceFolderItem[];
    links: Array<{ id: string; titulo: string; url: string; descripcion: string; fecha: string }>;
    reportes: EvidenceFolderItem[];
  };
  metadata: {
    hallazgo: string;
    entidad: string;
    fuente: string;
    fecha: string;
    url: string;
    responsable: string;
    clasificacion: string;
    tipoControl: string;
    dictamenPericial: string;
  };
}

export interface ProcurementAuditItem {
  id: string;
  codigoProceso: string;
  entidad: string;
  objeto: string;
  portalTransparenciaUrl: string;
  portalDgcpUrl?: string;
  pliegoTdr: {
    especificacionesClave: string;
    montoEstimadoPliego: number;
    plazoMeses: number;
    requerimientoGarantia: string;
  };
  contratoAdjudicado: {
    proveedorAdjudicado: string;
    rnc: string;
    montoAdjudicado: number;
    fechaContrato: string;
    plazoContratoMeses: number;
  };
  adendas: Array<{
    numeroAdenda: string;
    fecha: string;
    montoAdicional: number;
    porcentajeSobreOriginal: number;
    justificacion: string;
    aprobadaPorOrganoRector: boolean;
  }>;
  montoFinalAcumulado: number;
  porcentajeTotalAdendas: number;
  excedeLimiteLegal25Pct: boolean;
  discrepanciaPliegoVsContrato: string;
  alertaFraccionamiento: boolean;
  clasificacionAspecto: 'FINANCIERO' | 'LEGAL' | 'OBRAS' | 'ACL' | 'TECNOLOGICO';
  tipoControl: 'DEBILIDAD_CONTROL_INTERNO' | 'HALLAZGO_ADMINISTRATIVO' | 'POSIBLE_OBSERVACION_PENAL_JUDICIAL';
  estadoAuditoria: 'Revisado' | 'En Observación' | 'Con Hallazgo Formal';
  carpetaEvidenciaId?: string;
}

export interface AutonomousCheckpoint {
  lastUpdated: string;
  totalObservacionesAlDia: number;
  pendientesDeProcesar: number;
  tareasPendientes: Array<{
    id: string;
    tarea: string;
    modulo: string;
    estado: 'Pendiente' | 'En Proceso' | 'Completado';
    prioridad: 'Crítica' | 'Alta' | 'Media';
    fechaProgramada: string;
  }>;
  autoResumeEnabled: boolean;
  lastSyncStatus: string;
  versionSistema: string;
}

export interface Riesgo {
  id: number;
  expedienteId: number | null;
  categoria: 'Financiero' | 'Cumplimiento' | 'Operacional' | 'Tecnológico' | 'Contratación' | 'Documental' | 'Fraude potencial' | 'Otro';
  descripcion: string;
  probabilidad: number;
  impacto: number;
  puntuacion: number;
  nivel: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
  mitigacion: string;
  estado: 'Pendiente' | 'En mitigación' | 'Controlado';
  workflowStatus?: WorkflowStatus;
  createdAt: string;
}

export interface Proveedor {
  id: number;
  nombre: string;
  rnc: string;
  contacto: string;
  rubro: string;
  estado: 'Activo' | 'Inactivo' | 'En observación';
  createdAt: string;
}

export interface Contrato {
  id: number;
  numero: string;
  proveedorId: number | null;
  objeto: string;
  monto: number;
  fechaInicio: string;
  fechaFin: string;
  modalidad: string;
  estado: 'Vigente' | 'Vencido' | 'Liquidado' | 'Rescindido';
  createdAt: string;
}

export interface Pago {
  id: number;
  contratoId: number | null;
  beneficiario: string;
  rncBeneficiario?: string;
  referencia: string;
  ncf?: string;
  monto: number;
  fecha: string;
  descripcion: string;
  alertaDuplicado?: boolean;
  createdAt: string;
}

export interface Evidencia {
  id: number;
  expedienteId: number | null;
  nombreOriginal: string;
  nombreGuardado: string;
  ruta: string;
  sha256: string;
  tipo: string;
  tamano: number;
  textoExtraido: string;
  clasificacion: 'Extraído' | 'Verificado' | 'Propuesto' | 'Aprobado';
  versionActual: number;
  workflowStatus?: WorkflowStatus;
  metadatos?: {
    rnc?: string[];
    montos?: string[];
    fechas?: string[];
    ncf?: string[];
    firmasDetectadas?: boolean;
    ocrReal?: boolean;
  };
  subidoPor: string;
  createdAt: string;
}

export interface DocumentVersion {
  id: number;
  evidenceId: number;
  version: number;
  sha256: string;
  fileName: string;
  fileSize: number;
  changeNote?: string;
  createdAt: string;
  createdBy: string;
}

export interface FindingEvidence {
  id: number;
  findingId: number;
  evidenceId: number;
  page: string;
  paragraph: string;
  article: string;
  verified: boolean;
  notes?: string;
  createdAt: string;
}

export interface NormativeCatalogItem {
  id: number;
  country: string;
  authority: string;
  title: string;
  article: string;
  version: string;
  sourceUrl: string;
  effectiveDate: string;
  status: 'Vigente' | 'Derogada' | 'En Modificación';
  resumen?: string;
}

export interface WorkflowItem {
  id: number;
  objectType: 'Hallazgo' | 'Riesgo' | 'Evidencia' | 'Informe';
  objectId: number;
  status: WorkflowStatus;
  approvedBy?: string;
  approvedAt?: string;
  comments?: string;
}

export interface AppSettings {
  id: number;
  language: string;
  country: string;
  currency: string;
  dateFormat: string;
}

export interface Actividad {
  id: number;
  usuario: string;
  accion: string;
  detalle: string;
  fecha: string;
}

export interface Normativa {
  id: string;
  nombre: string;
  tipo: 'Ley' | 'Decreto' | 'Norma Interna' | 'Estándar Internacional';
  organismo: string;
  resumen: string;
  articulosClave: {
    articulo: string;
    tema: string;
    texto: string;
  }[];
}

export interface CustomPlugin {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  categoria: 'Compras' | 'Financiero' | 'Activos' | 'Nomina' | 'Especial' | 'Tributario';
  organosRectores: string[];
  dependencias: string[];
  scriptSource: string;
  parametrosEntrada: Array<{ nombre: string; tipo: string; descripcion: string }>;
  reglasValidacion: string[];
  activo: boolean;
  createdBy: string;
  createdAt: string;
}

export interface DatabaseSchema {
  expedientes: Expediente[];
  hallazgos: Hallazgo[];
  riesgos: Riesgo[];
  proveedores: Proveedor[];
  contratos: Contrato[];
  pagos: Pago[];
  evidencias: Evidencia[];
  documentVersions: DocumentVersion[];
  findingsEvidence: FindingEvidence[];
  normativeCatalog: NormativeCatalogItem[];
  workflows: WorkflowItem[];
  settings: AppSettings;
  actividad: Actividad[];
  normativas: Normativa[];
  customPlugins: CustomPlugin[];
  budgetExecution: BudgetExecutionItem[];
  evidenceFolders: EvidenceFolder[];
  procurementAudits: ProcurementAuditItem[];
  checkpoint: AutonomousCheckpoint;
}

const DB_DIR = path.resolve(process.cwd(), 'database');
const DB_FILE = path.join(DB_DIR, 'audit_intelligence.json');

const INITIAL_NORMATIVE_CATALOG: NormativeCatalogItem[] = [
  {
    id: 1,
    country: 'República Dominicana',
    authority: 'Congreso Nacional / DGCP',
    title: 'Ley No. 340-06 sobre Compras y Contrataciones Públicas de Bienes, Obras, Servicios y Concesiones',
    article: 'Art. 14 (Prohibición de Fraccionamiento)',
    version: 'Modificada por Ley 449-06',
    sourceUrl: 'https://comprasdominicana.gov.do/normativa',
    effectiveDate: '2006-08-18',
    status: 'Vigente',
    resumen: 'Prohíbe terminantemente fraccionar las compras para eludir los procedimientos de licitación pública o restringida fijados anualmente por la DGCP.'
  },
  {
    id: 2,
    country: 'República Dominicana',
    authority: 'Poder Ejecutivo',
    title: 'Decreto No. 543-12 (Reglamento de Aplicación de la Ley 340-06)',
    article: 'Art. 85 (Actas de Recepción Conforme)',
    version: 'Decreto Oficial 543-12',
    sourceUrl: 'https://dgcp.gob.do/decretos',
    effectiveDate: '2012-09-06',
    status: 'Vigente',
    resumen: 'Establece la obligatoriedad del Acta de Recepción Conforme emitida por peritos técnicos designados antes de autorizar cualquier pago o desembolso.'
  },
  {
    id: 3,
    country: 'República Dominicana',
    authority: 'Cámara de Cuentas de la República Dominicana',
    title: 'Ley No. 10-04 del Sistema Nacional de Control y Auditoría Externa',
    article: 'Art. 47 (Partes Constitutivas del Hallazgo de Auditoría)',
    version: 'Gaceta Oficial 10255',
    sourceUrl: 'https://camaradecuentas.gob.do',
    effectiveDate: '2004-01-20',
    status: 'Vigente',
    resumen: 'Fija los 6 elementos obligatorios: Condición, Criterio, Causa, Efecto, Riesgo y Recomendación constructiva para dictámenes periciales.'
  },
  {
    id: 4,
    country: 'República Dominicana',
    authority: 'Contraloría General de la República',
    title: 'Normas Básicas de Control Interno (NOBACI)',
    article: 'Norma 2.3 (Segregación de Funciones Contables y Control Previo)',
    version: 'Resolución No. 001-2014',
    sourceUrl: 'https://contraloria.gob.do/nobaci',
    effectiveDate: '2014-06-15',
    status: 'Vigente',
    resumen: 'Obliga a mantener separadas las funciones de autorización, recepción, custodia, contabilidad y pago para prevenir pagos duplicados y fraude.'
  },
  {
    id: 5,
    country: 'USA / Federal',
    authority: 'Government Accountability Office (GAO)',
    title: 'Generally Accepted Government Auditing Standards (GAGAS - Yellow Book)',
    article: 'Section 6.17 (Developing Elements of a Finding)',
    version: '2024 Technical Revision',
    sourceUrl: 'https://www.gao.gov/yellowbook',
    effectiveDate: '2024-01-01',
    status: 'Vigente',
    resumen: 'Estándar federal para auditorías gubernamentales en EE.UU.: Condition, Criteria, Cause, Effect, and Recommendation.'
  },
  {
    id: 6,
    country: 'Internacional',
    authority: 'INTOSAI',
    title: 'ISSAI 100 - Principios Fundamentales de Auditoría del Sector Público',
    article: 'ISSAI 100 § 42 (Juicio Profesional y Escepticismo)',
    version: 'INTOSAI Framework 2019',
    sourceUrl: 'https://www.issai.org',
    effectiveDate: '2019-10-01',
    status: 'Vigente',
    resumen: 'Marco global para entidades fiscalizadoras superiores sobre evidencia suficiente, competente y documentación de soporte.'
  }
];

function getInitialData(): DatabaseSchema {
  return {
    expedientes: [
      {
        id: 1,
        codigo: 'AUD-2026-001',
        nombre: 'Auditoría Integral a Procesos de Compras, Infraestructura y Gestión Financiera',
        entidad: 'Ministerio de Obras Públicas y Comunicaciones (MOPC)',
        objetivo: 'Verificar la legalidad, transparencia, razonabilidad del gasto y cumplimiento de la Ley 340-06 y Decreto 543-12 en contrataciones ejecutadas.',
        responsable: 'Lic. Pedro Baldera / Equipo de Auditoría Especial',
        periodo: 'Ejercicio Fiscal 2025 - 2026',
        fecha: '2026-01-15',
        estado: 'Activo',
        createdBy: 'admin',
        createdAt: '2026-01-15T09:00:00Z'
      },
      {
        id: 2,
        codigo: 'AUD-2026-002',
        nombre: 'Examen Especial de Pagos a Proveedores y Bienes Muebles',
        entidad: 'Dirección General de Abastecimiento Institucional',
        objetivo: 'Evaluar la consistencia entre facturas recibidas, actas de recepción de almacén y pagos desembolsados.',
        responsable: 'Dra. Carmen Mendoza',
        periodo: 'Segundo Semestre 2025',
        fecha: '2026-02-01',
        estado: 'En revisión',
        createdBy: 'admin',
        createdAt: '2026-02-01T10:30:00Z'
      },
      {
        id: 3,
        codigo: 'AUD-2026-INCART',
        nombre: 'Fiscalización Pericial en Línea: Compras, TDR vs Contratos, Adendas >25%, Fármacos Oncológicos y Presupuesto',
        entidad: 'Instituto Nacional del Cáncer Rosa Emilia Sánchez Pérez de Tavares (INCART)',
        objetivo: 'Auditar la transparencia en compras (https://www.incart.gob.do/transparencia), contraste de pliegos vs contratos, adendas que sobrepasan el límite legal del 25% (Ley 340-06), fármacos oncológicos, mantenimiento de LINAC y ciclo presupuestario DIGEPRES/DIGECOG.',
        responsable: 'Lic. Pedro Baldera / Auditor Forense Principal',
        periodo: 'Ejercicio Fiscal 2025 - 2026',
        fecha: '2026-02-10',
        estado: 'Activo',
        createdBy: 'admin',
        createdAt: '2026-02-10T08:00:00Z'
      }
    ],
    hallazgos: [
      {
        id: 1,
        expedienteId: 1,
        titulo: 'Fraccionamiento de compras para eludir proceso de Licitación Pública',
        condicion: 'Durante el período auditado se evidenció la emisión sucesiva de 8 órdenes de compra por valor de RD$ 2,450,000.00 cada una (Total RD$ 19,600,000.00) al mismo proveedor en un lapso de 45 días para el mismo objeto contractual (adquisición de asfalto y agregados).',
        criterio: 'Ley No. 340-06, Art. 14: Queda terminantemente prohibido fraccionar las compras para eludir los procesos licitatorios de mayor cuantía. Decreto 543-12, Art. 16 sobre umbrales anuales fijados por la DGCP.',
        causa: 'Falta de planificación oportuna en el Plan Anual de Compras y Contrataciones (PACC) y discrecionalidad de la gerencia de compras.',
        efecto: 'Restricción de la libre concurrencia de oferentes, posible sobreprecio estimado en un 18% y riesgo de colusión.',
        montoObservado: 19600000.00,
        nivel: 'Crítico',
        estado: 'Abierto',
        workflowStatus: 'REVISION',
        clasificacion: 'FINANCIERO',
        tipoControl: 'HALLAZGO_ADMINISTRATIVO',
        accionesRecomendadasAuditor: [
          'Remitir informe pericial circunstanciado a la Dirección General de Contrataciones Públicas (DGCP).',
          'Instruir apertura de proceso disciplinario sancionatorio bajo Ley 41-08 de Función Pública.',
          'Consolidar requerimientos futuros en una sola Licitación Pública Nacional con pliegos estandarizados.'
        ],
        evidenciaCarpetaId: 'evidence/hallazgo_0001',
        analisisPliegoContratoAdenda: {
          tieneAdenda: false,
          montoOriginal: 19600000,
          montoAdenda: 0,
          porcentajeVariacion: 0,
          excedeLimiteLegal: false,
          discrepanciaTdrPliego: 'Fraccionamiento de 8 compras menores sucesivas eludiendo el umbral de Licitación Pública.'
        },
        recomendacion: '1. Iniciar investigación administrativa y remitir informe a la Dirección General de Contrataciones Públicas (DGCP). 2. Consolidar los requerimientos de insumos en una Licitación Pública Nacional con pliegos estandarizados. 3. Sancionar a los responsables del fraccionamiento conforme al Art. 30 de la Ley 10-04.',
        conclusion: 'Se determina incumplimiento severo y sistemático de la Ley 340-06 por fraccionamiento deliberado.',
        normativaReferencia: 'Ley 340-06 Art. 14 / Dec. 543-12 Art. 16',
        evidenciasAsociadas: ['OC-2025-081.pdf', 'OC-2025-082.pdf', 'Factura-B01004921.pdf'],
        resultado: 'Sobreprecio presunto estimado en RD$ 3,528,000.00 por elusión de competencia pública.',
        fuenteExterna: 'Portal Transaccional DGCP - Consulta de Procesos Menores MOPC-DAF-CM-2025-019',
        pagina: 'Págs. 14-22 del expediente de compras',
        articulo: 'Art. 14 Ley 340-06',
        enlace: 'https://comprasdominicana.gob.do/procesos/MOPC-2025-081',
        fechaValidacion: '2026-01-22',
        createdBy: 'admin',
        createdAt: '2026-01-20T11:00:00Z'
      },
      {
        id: 2,
        expedienteId: 1,
        titulo: 'Desembolsos efectuados sin Acta de Recepción Conforme ni Póliza de Fiel Cumplimiento',
        condicion: 'Se verificó la tramitación y pago de tres libramientos por un monto total de RD$ 6,850,000.00 correspondientes al Contrato CONTR-2025-044 sin que conste en el expediente la póliza de fianza de fiel cumplimiento ni el acta de entrega formal emitida por peritos técnicos.',
        criterio: 'Decreto No. 543-12, Art. 85 y Ley No. 340-06, Art. 31. Normas Básicas de Control Interno (NOBACI) Norma 4.1 de documentación de respaldo.',
        causa: 'Debilidades en el control previo de la Unidad de Auditoría Interna y falta de coordinación con el área de almacén/supervisión técnica.',
        efecto: 'Exposición patrimonial del Estado ante eventuales vicios ocultos o incumplimiento de especificaciones sin garantía ejecutable.',
        montoObservado: 6850000.00,
        nivel: 'Alto',
        estado: 'En proceso',
        workflowStatus: 'PENDIENTE',
        clasificacion: 'LEGAL',
        tipoControl: 'DEBILIDAD_CONTROL_INTERNO',
        accionesRecomendadasAuditor: [
          'Exigir inmediatamente a la aseguradora la emisión retroactiva de la fianza bancaria o de seguros.',
          'Suspender todo libramiento pendiente hasta contar con Acta de Recepción Conforme suscrita por peritos colegiados.',
          'Reestructurar la mesa de control previo en la Dirección Administrativa y Financiera.'
        ],
        evidenciaCarpetaId: 'evidence/hallazgo_0002',
        analisisPliegoContratoAdenda: {
          tieneAdenda: false,
          montoOriginal: 6850000,
          montoAdenda: 0,
          porcentajeVariacion: 0,
          excedeLimiteLegal: false,
          discrepanciaTdrPliego: 'Contrato firmado omitió requerir la constitución de fianza de fiel cumplimiento antes de ejecutar libramientos.'
        },
        recomendacion: 'Requerir inmediatamente a la empresa contratista la fianza bancaria o de seguros con carácter retroactivo y suspender cualquier desembolso pendiente hasta contar con informe técnico pericial.',
        conclusion: 'Inobservancia de requisitos sustanciales para el pago a proveedores.',
        normativaReferencia: 'Dec. 543-12 Art. 85 / NOBACI 4.1',
        evidenciasAsociadas: ['Libramiento-6029.pdf', 'Contrato-CONTR-2025-044.docx'],
        resultado: 'RD$ 6.85M en riesgo de garantía no ejecutable por vicios de construcción.',
        fuenteExterna: 'Superintendencia de Seguros - Consulta de Pólizas de Fianza Activas',
        pagina: 'Pág. 8 Cláusula 7ma del contrato',
        articulo: 'Art. 85 Dec. 543-12',
        enlace: 'https://superseguros.gob.do/fianzas',
        fechaValidacion: '2026-01-25',
        createdBy: 'admin',
        createdAt: '2026-01-22T14:30:00Z'
      },
      {
        id: 3,
        expedienteId: 2,
        titulo: 'Inconsistencias en comprobantes fiscales (NCF) y pagos con riesgo de duplicidad',
        condicion: 'En la muestra aleatoria de pagos se identificaron dos desembolsos con igual beneficiario, idéntico monto de RD$ 425,000.00 y la misma descripción en un lapso de 4 días, sustentados con fotocopias del mismo comprobante fiscal B010009827.',
        criterio: 'Código Tributario Ley 11-92, Decreto 254-06 de Comprobantes Fiscales y NOBACI Norma 2.3 de Actividades de Control Contable.',
        causa: 'Falta de validación automatizada contra facturas procesadas previamente y deficiencias en el archivo contable.',
        efecto: 'Doble pago por un valor de RD$ 425,000.00 en perjuicio de los fondos institucionales.',
        montoObservado: 425000.00,
        nivel: 'Alto',
        estado: 'Abierto',
        workflowStatus: 'BORRADOR',
        clasificacion: 'FINANCIERO',
        tipoControl: 'DEBILIDAD_CONTROL_INTERNO',
        accionesRecomendadasAuditor: [
          'Gestionar la nota de crédito o el reintegro inmediato mediante transferencia bancaria de la suma duplicada.',
          'Activar el bloqueo de NCF duplicados en el software institucional de pagos.',
          'Notificar a la DGII para verificación del estatus tributario de la factura.'
        ],
        evidenciaCarpetaId: 'evidence/hallazgo_0003',
        recomendacion: '1. Solicitar el reintegro inmediato de los RD$ 425,000.00 pagados de más. 2. Implementar alerta automática de control previo en el software financiero para bloquear NCF repetidos.',
        conclusion: 'Doble afectación de fondos por deficiencias de control interno.',
        normativaReferencia: 'NOBACI 2.3 / Dec. 254-06',
        evidenciasAsociadas: ['Cheque-9921.jpg', 'Cheque-9945.jpg'],
        resultado: 'Duplicidad monetaria confirmada en libro mayor de egresos.',
        fuenteExterna: 'DGII - Consulta de Validez de Comprobantes Fiscales NCF',
        pagina: 'Pág. 3 extracto bancario Banco de Reservas',
        articulo: 'Norma General 06-2018 DGII',
        enlace: 'https://dgii.gov.do/consultas/ncf',
        fechaValidacion: '2026-02-06',
        createdBy: 'admin',
        createdAt: '2026-02-05T16:00:00Z'
      },
      {
        id: 4,
        expedienteId: 3,
        titulo: 'INCART: Adenda al Contrato de Mantenimiento Integral de Aceleradores Lineales (LINAC) excede el 25% del límite legal de la Ley 340-06',
        condicion: 'En la fiscalización de las compras y contrataciones publicadas en el Portal de Transparencia del INCART (https://www.incart.gob.do/transparencia) se constató la formalización de la Adenda No. 1 al Contrato CONTR-INCART-2025-018 para mantenimiento preventivo y correctivo de aceleradores lineales. La adenda incrementó el monto en RD$ 11,500,000.00 sobre un monto original contratado de RD$ 28,000,000.00 (+41.07% de aumento), sobrepasando ampliamente el límite legal máximo del 25% establecido por el Artículo 31 de la Ley No. 340-06 (cuyo tope permitido era RD$ 7,000,000.00). La adenda además incluyó repuestos mayores no contemplados en el pliego de condiciones sin contar con no-objeción de la DGCP.',
        criterio: 'Ley No. 340-06 Art. 31: "La entidad contratante podrá modificar, disminuir o aumentar hasta un veinticinco por ciento (25%) el monto del contrato original". Decreto No. 543-12 Art. 110 y Ley No. 10-04 Art. 30 y 47.',
        causa: 'Falta de previsión técnica en el pliego de condiciones original y elusión de un nuevo procedimiento de licitación para la adquisición de repuestos de alta tecnología médica.',
        efecto: 'Violación flagrante del régimen legal de contrataciones públicas, erogación de RD$ 4,500,000.00 por encima del umbral legal permitido y vulneración del principio de igualdad de oferentes.',
        montoObservado: 11500000.00,
        nivel: 'Crítico',
        estado: 'Abierto',
        workflowStatus: 'REVISION',
        clasificacion: 'LEGAL',
        tipoControl: 'HALLAZGO_ADMINISTRATIVO',
        accionesRecomendadasAuditor: [
          'Declarar la nulidad de pleno derecho de la porción excesiva de la adenda (RD$ 4,500,000.00) por violación del Art. 31 de la Ley 340-06.',
          'Notificar de oficio a la Dirección General de Contrataciones Públicas (DGCP) para la apertura de expediente de investigación sancionadora.',
          'Instruir al Director Administrativo y a la Unidad de Auditoría Interna a suspender cualquier libramiento en Tesorería amparado en dicha adenda irregular.',
          'Convocar a Licitación Pública Nacional separada para el suministro de tubos y repuestos de aceleradores lineales.'
        ],
        evidenciaCarpetaId: 'evidence/hallazgo_0004',
        analisisPliegoContratoAdenda: {
          tieneAdenda: true,
          montoOriginal: 28000000,
          montoAdenda: 11500000,
          porcentajeVariacion: 41.07,
          excedeLimiteLegal: true,
          discrepanciaTdrPliego: 'Pliego INCART-CCC-LPN-2025-0004 contemplaba exclusivamente mano de obra de mantenimiento preventivo. La Adenda No. 1 introdujo repuestos de alto costo alterando el objeto y superando el 25% legal permitido (alcanzó 41.07%).'
        },
        recomendacion: '1. Dejar sin efecto la porción en exceso de la adenda no amparada en la Ley 340-06. 2. Someter informe de responsabilidad administrativa ante el órgano rector DGCP y Contraloría General. 3. Adoptar matriz de control para bloquear adendas superiores al 25% en el sistema financiero.',
        conclusion: 'Incumplimiento grave del límite legal de adendas establecido en el Art. 31 de la Ley 340-06 con riesgo de nulidad contractual.',
        normativaReferencia: 'Ley 340-06 Art. 31 / Dec. 543-12 Art. 110',
        evidenciasAsociadas: ['Pliego-INCART-LINAC-2025.pdf', 'Contrato-INCART-CONTR-018.pdf', 'Adenda-01-INCART-LINAC.pdf'],
        resultado: 'Sobrepaso de RD$ 4,500,000.00 del tope legal del 25% en adenda contractual no licitada.',
        fuenteExterna: 'Portal de Transparencia INCART (https://www.incart.gob.do/transparencia) y Portal Transaccional DGCP',
        pagina: 'Pág. 12 Contrato CONTR-INCART-2025-018 y Cláusula 2da de la Adenda No. 1',
        articulo: 'Art. 31 Ley No. 340-06',
        enlace: 'https://www.incart.gob.do/transparencia/compras-y-contrataciones/procesos-de-compras',
        fechaValidacion: '2026-02-12',
        createdBy: 'admin',
        createdAt: '2026-02-12T10:00:00Z'
      },
      {
        id: 5,
        expedienteId: 3,
        titulo: 'INCART: Discrepancia sustancial entre Pliego de Condiciones / TDR y Contrato Adjudicado en Licitación de Fármacos Oncológicos y Citostáticos',
        condicion: 'En la licitación pública INCART-CCC-LPN-2025-0012 para el suministro de fármacos oncológicos de alto costo (Trastuzumab, Paclitaxel, Cisplatino y Pembrolizumab) por valor de RD$ 45,800,000.00, el Pliego de Condiciones Definitivo publicado en https://www.incart.gob.do/transparencia y en el Portal Transaccional de la DGCP exigía de forma imperativa: a) Garantía de Cadena de Frío certificada de 2°C a 8°C mediante sensores termosensibles en cada entrega; b) Constitución previa de Póliza de Fiel Cumplimiento equivalente al 10% del contrato; c) Penalidad del 1% por cada día de mora en entrega para evitar el desabastecimiento hospitalario de pacientes con cáncer; d) Prohibición expresa de pagos por anticipo. No obstante, al cotejar el Contrato adjudicado CONTR-INCART-2025-032 se constató que se eliminó la cláusula de penalidad por mora, no se exigió el reporte de cadena de frío y se otorgó de forma ilícita un anticipo financiero del 20% (RD$ 9,160,000.00) sin fianza de buen uso de anticipo.',
        criterio: 'Ley No. 340-06 Art. 26 (Principio de Transparencia y Rigor del Pliego), Art. 30 y 31; Decreto No. 543-12 Art. 85 (Recepción de peritos técnicos farmacéuticos); Ley No. 10-04 Art. 47; Código Procesal Penal (indicios de prevaricación y favoritismo administrativo).',
        causa: 'Alteración posterior a la adjudicación de las condiciones sustanciales del pliego en beneficio de la empresa adjudicataria.',
        efecto: 'Exposición patrimonial crítica por RD$ 45,800,000.00, riesgo severo de medicamentos degradados térmicamente suministrados a pacientes oncológicos y daño al erario por anticipos sin garantía.',
        montoObservado: 45800000.00,
        nivel: 'Crítico',
        estado: 'Abierto',
        workflowStatus: 'PENDIENTE',
        clasificacion: 'LEGAL',
        tipoControl: 'POSIBLE_OBSERVACION_PENAL_JUDICIAL',
        accionesRecomendadasAuditor: [
          'Exigir de manera inmediata y perentoria la constitución de la fianza bancaria de buen uso de anticipo y fiel cumplimiento por el 30% total.',
          'Ordenar peritaje químico y físico por el Instituto Nacional de Ciencias Forenses (INACIF) y DIGEMAPS de los lotes farmacéuticos entregados.',
          'Remitir el informe especial de auditoría con sustento de indicios penales a la Procuraduría Especializada de Persecución de la Corrupción Administrativa (PEPCA).',
          'Abrir sumario administrativo al Comité de Compras y Contrataciones del INCART por modificación ilícita del pliego de condiciones.'
        ],
        evidenciaCarpetaId: 'evidence/hallazgo_0005',
        analisisPliegoContratoAdenda: {
          tieneAdenda: false,
          montoOriginal: 45800000,
          montoAdenda: 0,
          porcentajeVariacion: 0,
          excedeLimiteLegal: false,
          discrepanciaTdrPliego: 'Pliego exigía garantía del 10%, monitoreo térmico 2-8°C y penalidad del 1% diario por mora sin anticipos. Contrato formalizado concedió anticipo de 20% sin fianza y suprimió penalidades por desabastecimiento.'
        },
        recomendacion: '1. Someter el caso a la DGCP y a la PEPCA por indicios de responsabilidad penal y vulneración de la igualdad de proponentes. 2. Aplicar auditoría forense a las actas de recepción de farmacia del INCART.',
        conclusion: 'Modificación ilícita de los pliegos de condiciones en el contrato definitivo con grave riesgo a la salud pública y patrimonial.',
        normativaReferencia: 'Ley 340-06 Art. 26 / Dec. 543-12 Art. 85',
        evidenciasAsociadas: ['Pliego-INCART-LPN-2025-0012.pdf', 'Contrato-CONTR-INCART-2025-032.pdf', 'Acta-Adjudicacion-INCART-Farmacos.pdf'],
        resultado: 'RD$ 45.8M contratados con supresión irregular de garantías sanitarias y financieras obligadas por el Pliego.',
        fuenteExterna: 'Portal Transaccional DGCP y Portal de Transparencia INCART (https://www.incart.gob.do/transparencia)',
        pagina: 'Pág. 19 Pliego LPN-2025-0012 vs Cláusula 5ta y 9na del Contrato CONTR-032',
        articulo: 'Art. 26 Ley No. 340-06',
        enlace: 'https://www.incart.gob.do/transparencia/compras-y-contrataciones',
        fechaValidacion: '2026-02-14',
        createdBy: 'admin',
        createdAt: '2026-02-14T11:30:00Z'
      }
    ],
    riesgos: [
      {
        id: 1,
        expedienteId: 1,
        categoria: 'Contratación',
        descripcion: 'Fraccionamiento reiterado de contratos para evadir licitaciones públicas transparentes.',
        probabilidad: 5,
        impacto: 5,
        puntuacion: 25,
        nivel: 'Crítico',
        mitigacion: 'Publicación mandatoria del PACC en portal transaccional de DGCP y auditorías semestrales de compras menores.',
        estado: 'En mitigación',
        workflowStatus: 'APROBADO',
        createdAt: '2026-01-18T10:00:00Z'
      },
      {
        id: 2,
        expedienteId: 1,
        categoria: 'Financiero',
        descripcion: 'Pagos sin acta de recepción de peritos ni comprobación de obras físicas ejecutadas.',
        probabilidad: 4,
        impacto: 5,
        puntuacion: 20,
        nivel: 'Crítico',
        mitigacion: 'Control previo con checklist mandatorio firmado por perito colegiado (CODIA/CPA) antes de enviar al área de pago.',
        estado: 'Pendiente',
        workflowStatus: 'REVISION',
        createdAt: '2026-01-18T10:15:00Z'
      },
      {
        id: 3,
        expedienteId: 2,
        categoria: 'Fraude potencial',
        descripcion: 'Emisión de facturas duplicadas o proveedores de carpeta sin capacidad operativa comprobable.',
        probabilidad: 3,
        impacto: 4,
        puntuacion: 12,
        nivel: 'Medio',
        mitigacion: 'Validación en línea contra bases de datos de la DGII (RNC activo y al día) y verificación presencial de almacenes.',
        estado: 'En mitigación',
        workflowStatus: 'APROBADO',
        createdAt: '2026-02-02T08:45:00Z'
      },
      {
        id: 4,
        expedienteId: 1,
        categoria: 'Cumplimiento',
        descripcion: 'Adendas contractuales que superan el 25% del límite legal establecido en la Ley 340-06.',
        probabilidad: 4,
        impacto: 4,
        puntuacion: 16,
        nivel: 'Alto',
        mitigacion: 'Revisión jurídica obligatoria previa a toda modificación de plazo y monto.',
        estado: 'Pendiente',
        workflowStatus: 'BORRADOR',
        createdAt: '2026-01-20T12:00:00Z'
      }
    ],
    proveedores: [
      {
        id: 1,
        nombre: 'Constructora Caribe & Asociados, SRL',
        rnc: '131-45678-9',
        contacto: 'Ing. Ramón Pérez (809-555-0123)',
        rubro: 'Obras Civiles, Asfalto y Edificaciones',
        estado: 'Activo',
        createdAt: '2025-06-10T10:00:00Z'
      },
      {
        id: 2,
        nombre: 'Suministros Globales del Este, EIRL',
        rnc: '130-98765-4',
        contacto: 'Lic. Laura Fernández (829-555-0456)',
        rubro: 'Materiales de Oficina, Papelería y Tecnología',
        estado: 'En observación',
        createdAt: '2025-08-14T11:30:00Z'
      },
      {
        id: 3,
        nombre: 'Soluciones Viales e Ingeniería Dominicana, SA',
        rnc: '101-23456-7',
        contacto: 'Ing. Carlos Mejía (809-555-0899)',
        rubro: 'Mantenimiento Vial y Pavimentación',
        estado: 'Activo',
        createdAt: '2025-09-01T15:20:00Z'
      }
    ],
    contratos: [
      {
        id: 1,
        numero: 'CONTR-2025-044',
        proveedorId: 1,
        objeto: 'Reconstrucción de drenaje pluvial y aceras en avenida perimetral norte',
        monto: 34500000.00,
        fechaInicio: '2025-07-01',
        fechaFin: '2025-12-31',
        modalidad: 'Licitación Pública Nacional LPN-2025-012',
        estado: 'Vigente',
        createdAt: '2025-07-01T10:00:00Z'
      },
      {
        id: 2,
        numero: 'CONTR-2025-088',
        proveedorId: 2,
        objeto: 'Suministro e instalación de equipos de cómputo para auditoría y archivo digital',
        monto: 8900000.00,
        fechaInicio: '2025-09-15',
        fechaFin: '2026-03-15',
        modalidad: 'Comparación de Precios CP-2025-034',
        estado: 'Vigente',
        createdAt: '2025-09-15T12:00:00Z'
      }
    ],
    pagos: [
      {
        id: 1,
        contratoId: 1,
        beneficiario: 'Constructora Caribe & Asociados, SRL',
        rncBeneficiario: '131-45678-9',
        referencia: 'LIB-6029',
        ncf: 'B0100492101',
        monto: 6850000.00,
        fecha: '2025-11-20',
        descripcion: 'Cubicación No. 2 avance de obra drenaje sin fianza definitiva',
        alertaDuplicado: false,
        createdAt: '2025-11-20T14:00:00Z'
      },
      {
        id: 2,
        contratoId: 2,
        beneficiario: 'Suministros Globales del Este, EIRL',
        rncBeneficiario: '130-98765-4',
        referencia: 'FAC-8812',
        ncf: 'B0100098270',
        monto: 425000.00,
        fecha: '2025-12-05',
        descripcion: 'Pago por licencias y consumibles informáticos lote 1',
        alertaDuplicado: true,
        createdAt: '2025-12-05T09:30:00Z'
      },
      {
        id: 3,
        contratoId: 2,
        beneficiario: 'Suministros Globales del Este, EIRL',
        rncBeneficiario: '130-98765-4',
        referencia: 'FAC-8812-DUP',
        ncf: 'B0100098270',
        monto: 425000.00,
        fecha: '2025-12-09',
        descripcion: 'Pago por licencias y consumibles informáticos lote 1 (SEGUNDO DESEMBOLSO DETECTADO)',
        alertaDuplicado: true,
        createdAt: '2025-12-09T16:15:00Z'
      }
    ],
    evidencias: [
      {
        id: 1,
        expedienteId: 1,
        nombreOriginal: 'Contrato_Reconstruccion_Avenida_Norte.pdf',
        nombreGuardado: '20260115_evid_contrato_044.pdf',
        ruta: 'uploads/20260115_evid_contrato_044.pdf',
        sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        tipo: 'application/pdf',
        tamano: 1845200,
        textoExtraido: 'CONTRATO DE OBRA PÚBLICA NO. CONTR-2025-044. En Santo Domingo, D.N. Entre el Ministerio y Constructora Caribe SRL, RNC 131-45678-9. Monto adjudicado: RD$ 34,500,000.00. Cláusula Séptima: El contratista depositará póliza de fianza del 10%...',
        clasificacion: 'Aprobado',
        versionActual: 2,
        workflowStatus: 'APROBADO',
        metadatos: {
          rnc: ['131-45678-9'],
          montos: ['34,500,000.00', '3,450,000.00'],
          fechas: ['2025-07-01', '2025-12-31'],
          firmasDetectadas: true,
          ocrReal: true
        },
        subidoPor: 'admin',
        createdAt: '2026-01-16T10:00:00Z'
      }
    ],
    documentVersions: [
      {
        id: 1,
        evidenceId: 1,
        version: 1,
        sha256: '8e27c081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00111',
        fileName: 'Contrato_Borrador_Inicial.pdf',
        fileSize: 1720000,
        changeNote: 'Carga inicial del borrador sin firmas periciales',
        createdAt: '2026-01-15T10:00:00Z',
        createdBy: 'admin'
      },
      {
        id: 2,
        evidenceId: 1,
        version: 2,
        sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        fileName: 'Contrato_Reconstruccion_Avenida_Norte.pdf',
        fileSize: 1845200,
        changeNote: 'Versión formal firmada y foliada con sellos institucionales',
        createdAt: '2026-01-16T10:00:00Z',
        createdBy: 'admin'
      }
    ],
    findingsEvidence: [
      {
        id: 1,
        findingId: 1,
        evidenceId: 1,
        page: 'Página 12',
        paragraph: 'Párrafo 3 (Cláusula de entregas)',
        article: 'Art. 14 Ley 340-06',
        verified: true,
        notes: 'Verificado cotejo de fecha y montos de las 8 órdenes consecutivas',
        createdAt: '2026-01-20T12:00:00Z'
      },
      {
        id: 2,
        findingId: 2,
        evidenceId: 1,
        page: 'Página 8',
        paragraph: 'Cláusula Séptima (Garantías)',
        article: 'Art. 31 Ley 340-06 y Art. 85 Dec. 543-12',
        verified: true,
        notes: 'Constatada omisión del depósito de fianza bancaria previa a desembolso',
        createdAt: '2026-01-22T15:00:00Z'
      }
    ],
    normativeCatalog: INITIAL_NORMATIVE_CATALOG,
    workflows: [
      {
        id: 1,
        objectType: 'Hallazgo',
        objectId: 1,
        status: 'REVISION',
        approvedBy: 'Dra. Carmen Mendoza (Supervisora)',
        approvedAt: '2026-01-21T16:00:00Z',
        comments: 'Pendiente respuesta de descargos de la Unidad de Compras'
      },
      {
        id: 2,
        objectType: 'Hallazgo',
        objectId: 2,
        status: 'PENDIENTE',
        comments: 'Remitido a la Dirección Jurídica para cálculo de fianza faltante'
      },
      {
        id: 3,
        objectType: 'Riesgo',
        objectId: 1,
        status: 'APROBADO',
        approvedBy: 'admin',
        approvedAt: '2026-01-19T09:30:00Z',
        comments: 'Riesgo crítico validado en comité de auditoría'
      }
    ],
    settings: {
      id: 1,
      language: 'es',
      country: 'República Dominicana',
      currency: 'DOP',
      dateFormat: 'DD/MM/YYYY'
    },
    actividad: [
      {
        id: 1,
        usuario: 'admin',
        accion: 'MIGRACION_SCHEMA_ENTERPRISE',
        detalle: 'Migración exitosa: document_versions, findings_evidence, normative_catalog, workflow y settings',
        fecha: '2026-01-15T08:00:00Z'
      },
      {
        id: 2,
        usuario: 'admin',
        accion: 'CREAR_HALLAZGO',
        detalle: 'Registrado hallazgo con trazabilidad forense: Fraccionamiento de compras (RD$ 19,600,000.00)',
        fecha: '2026-01-20T11:00:00Z'
      },
      {
        id: 3,
        usuario: 'admin',
        accion: 'WORKFLOW_STATUS_CHANGE',
        detalle: 'Hallazgo 1 cambiado a estado de workflow: REVISION por Supervisión',
        fecha: '2026-01-21T16:00:00Z'
      }
    ],
    normativas: [
      {
        id: 'LEY-340-06',
        nombre: 'Ley No. 340-06 sobre Compras y Contrataciones Públicas',
        tipo: 'Ley',
        organismo: 'Congreso Nacional / DGCP',
        resumen: 'Regula las compras y contrataciones de bienes, servicios, obras y concesiones del Estado Dominicano.',
        articulosClave: [
          {
            articulo: 'Art. 3',
            tema: 'Principios de Contratación Pública',
            texto: 'La contratación pública se rige por los principios de eficiencia, igualdad, libre competencia, transparencia, publicidad, economía, responsabilidad y debido proceso.'
          },
          {
            articulo: 'Art. 14',
            tema: 'Prohibición de Fraccionamiento',
            texto: 'Queda prohibido fraccionar la cuantía de los contratos para eludir los procedimientos de selección que correspondan por los montos fijados anualmente.'
          },
          {
            articulo: 'Art. 16',
            tema: 'Modalidades de Selección',
            texto: 'Las compras y contrataciones se realizarán mediante Licitación Pública, Licitación Restringida, Sorteo de Obras, Comparación de Precios y Compras Menores.'
          },
          {
            articulo: 'Art. 31',
            tema: 'Garantías y Fianzas Obligatorias',
            texto: 'Los oferentes y adjudicatarios deben constituir garantías de seriedad de oferta y de fiel cumplimiento del contrato en los plazos legales previstos.'
          }
        ]
      },
      {
        id: 'DEC-543-12',
        nombre: 'Decreto No. 543-12 (Reglamento de la Ley 340-06)',
        tipo: 'Decreto',
        organismo: 'Poder Ejecutivo',
        resumen: 'Establece los procedimientos operativos, comités de compras, pliegos de condiciones y recepción de bienes/obras.',
        articulosClave: [
          {
            articulo: 'Art. 36',
            tema: 'Comité de Compras y Contrataciones',
            texto: 'Toda institución pública contará con un Comité de Compras integrado por 5 miembros para dirigir los procesos de contratación.'
          },
          {
            articulo: 'Art. 85',
            tema: 'Actas de Recepción y Conformidad Técnica',
            texto: 'Ningún pago podrá efectuarse sin el Acta de Recepción Conforme emitida por los peritos técnicos designados.'
          },
          {
            articulo: 'Art. 112',
            tema: 'Modificaciones Contractuales y Adendas',
            texto: 'Las adendas o modificaciones no podrán superar el 25% del monto original del contrato ni alterar su objeto principal.'
          }
        ]
      },
      {
        id: 'LEY-10-04',
        nombre: 'Ley No. 10-04 de la Cámara de Cuentas',
        tipo: 'Ley',
        organismo: 'Cámara de Cuentas de la República Dominicana',
        resumen: 'Regula el Sistema Nacional de Control y Auditoría Externa de los recursos públicos.',
        articulosClave: [
          {
            articulo: 'Art. 30',
            tema: 'Responsabilidad Civil y Penal de Funcionarios',
            texto: 'Los servidores públicos y contratistas responderán civil y penalmente por daños patrimoniales causados por dolo, negligencia o violación legal.'
          },
          {
            articulo: 'Art. 47',
            tema: 'Elementos Constitutivos del Hallazgo',
            texto: 'Los hallazgos de auditoría contendrán obligatoriamente: Condición, Criterio, Causa, Efecto, Riesgo y Recomendación constructiva.'
          }
        ]
      },
      {
        id: 'NOBACI',
        nombre: 'Normas Básicas de Control Interno (NOBACI)',
        tipo: 'Norma Interna',
        organismo: 'Contraloría General de la República',
        resumen: 'Marco de control interno para la administración pública.',
        articulosClave: [
          {
            articulo: 'Norma 2.3',
            tema: 'Segregación Adecuada de Funciones',
            texto: 'Las funciones de autorización, registro, custodia y verificación deben estar asignadas a personas independientes.'
          },
          {
            articulo: 'Norma 4.1',
            tema: 'Documentación y Archivo de Respaldo',
            texto: 'Toda transacción financiera debe estar sustentada en documentación auténtica, verificable y con trazabilidad completa.'
          }
        ]
      }
    ],
    customPlugins: [
      {
        id: 1,
        nombre: 'Cruce de Subvenciones a ONGs vs CASFL y SIGEF',
        codigo: 'PLUG-CASFL-01',
        descripcion: 'Verificación de transferencias del Estado a asociaciones sin fines de lucro con habilitación en el Centro Nacional de Fomento (CASFL) y libramientos en Hacienda.',
        categoria: 'Especial',
        organosRectores: ['CASFL / MEPyD', 'Ministerio de Hacienda / SIGEF', 'Cámara de Cuentas'],
        dependencias: ['xlsx', 'axios'],
        scriptSource: '// Módulo pericial de verificación de habilitación sectorial y rendición de cuentas de ASFL',
        parametrosEntrada: [
          { nombre: 'rncOng', tipo: 'string', descripcion: 'RNC de la organización sin fines de lucro' },
          { nombre: 'montoSubvencion', tipo: 'number', descripcion: 'Monto transferido en el ejercicio' }
        ],
        reglasValidacion: [
          'Verificar estatus de Habilitación Sectorial vigente en CASFL',
          'Validar rendición de cuentas semestral ante la Cámara de Cuentas',
          'Comprobar cuenta bancaria exclusiva para fondos públicos'
        ],
        activo: true,
        createdBy: 'admin',
        createdAt: '2026-01-15T08:00:00Z'
      },
      {
        id: 2,
        nombre: 'Auditoría de Combustible vs SIGEF y Matrícula Vehicular',
        codigo: 'PLUG-FUEL-02',
        descripcion: 'Cotejo de tickets y tarjetas de combustible institucional contra el parque vehicular oficial registrado en Bienes Nacionales y la DGII.',
        categoria: 'Activos',
        organosRectores: ['Dirección General de Bienes Nacionales', 'DGII', 'Contraloría'],
        dependencias: ['xlsx'],
        scriptSource: '// Módulo de cruce de consumo kilométrico vs asignación de cupones de combustible',
        parametrosEntrada: [
          { nombre: 'placaVehiculo', tipo: 'string', descripcion: 'Número de placa oficial' },
          { nombre: 'litrosDespachados', tipo: 'number', descripcion: 'Cantidad de galones / litros registrados' }
        ],
        reglasValidacion: [
          'Vehículo debe estar matriculado a nombre de la institución en DGII',
          'Bitácora de ruta firmada por chofer y supervisor',
          'Rendimiento no menor al umbral de 18 km/galón según modelo'
        ],
        activo: true,
        createdBy: 'admin',
        createdAt: '2026-01-15T08:00:00Z'
      }
    ],
    budgetExecution: [
      {
        id: 1,
        expedienteId: 3,
        pais: 'República Dominicana',
        entePresupuestario: 'DIGEPRES / DIGECOG / SIGEF',
        codigoObjetoGasto: '2.3',
        denominacion: 'Materiales y Suministros Médicos (Fármacos Oncológicos y Citostáticos)',
        tipo: 'Gasto',
        presupuestoAprobado: 120000000.00,
        presupuestoModificado: 145000000.00,
        preventivo: 142000000.00,
        comprometido: 138500000.00,
        devengado: 110200000.00,
        pagado: 89400000.00,
        saldoPorComprometer: 6500000.00,
        saldoPorDevengar: 28300000.00,
        saldoPorPagar: 20800000.00,
        porcentajeEjecucion: 76.0,
        estadoEjecucion: 'Alerta Desvío',
        observaciones: 'Retraso de RD$ 20.8M en libramientos devengados por falta de cuota trimestral en Tesorería. Riesgo de suspensión de entregas por distribuidores.',
        fuenteRectorUrl: 'https://digepres.gob.do/informes-ejecucion-gasto',
        fechaCorte: '2026-02-15'
      },
      {
        id: 2,
        expedienteId: 3,
        pais: 'República Dominicana',
        entePresupuestario: 'DIGEPRES / DIGECOG / SIGEF',
        codigoObjetoGasto: '2.2',
        denominacion: 'Servicios No Personales (Mantenimiento Aceleradores Lineales y Tomógrafos)',
        tipo: 'Gasto',
        presupuestoAprobado: 45000000.00,
        presupuestoModificado: 58500000.00,
        preventivo: 58500000.00,
        comprometido: 58500000.00,
        devengado: 49500000.00,
        pagado: 38000000.00,
        saldoPorComprometer: 0.00,
        saldoPorDevengar: 9000000.00,
        saldoPorPagar: 11500000.00,
        porcentajeEjecucion: 84.62,
        estadoEjecucion: 'Sobreejecución',
        observaciones: 'Sobreejecución por adenda contractual de RD$ 11.5M (+41.07%) que sobrepasa el 25% legal permitido por la Ley 340-06.',
        fuenteRectorUrl: 'https://digepres.gob.do/ejecucion-presupuestaria',
        fechaCorte: '2026-02-15'
      },
      {
        id: 3,
        expedienteId: 3,
        pais: 'República Dominicana',
        entePresupuestario: 'DIGEPRES / DIGECOG / SIGEF',
        codigoObjetoGasto: '2.1',
        denominacion: 'Servicios Personales (Sueldos Personal Médico y Oncológico)',
        tipo: 'Gasto',
        presupuestoAprobado: 210000000.00,
        presupuestoModificado: 210000000.00,
        preventivo: 210000000.00,
        comprometido: 198000000.00,
        devengado: 198000000.00,
        pagado: 198000000.00,
        saldoPorComprometer: 12000000.00,
        saldoPorDevengar: 0.00,
        saldoPorPagar: 0.00,
        porcentajeEjecucion: 94.29,
        estadoEjecucion: 'Normal',
        observaciones: 'Ejecución acorde a la programación trimestral y validada en SASP/MAP.',
        fuenteRectorUrl: 'https://map.gob.do/sasp',
        fechaCorte: '2026-02-15'
      },
      {
        id: 4,
        expedienteId: 3,
        pais: 'República Dominicana',
        entePresupuestario: 'DIGEPRES / DIGECOG / SIGEF',
        codigoObjetoGasto: '2.6',
        denominacion: 'Bienes Muebles e Inmuebles (Equipamiento de Imagenología y Radioterapia)',
        tipo: 'Gasto',
        presupuestoAprobado: 85000000.00,
        presupuestoModificado: 85000000.00,
        preventivo: 40000000.00,
        comprometido: 25000000.00,
        devengado: 18000000.00,
        pagado: 18000000.00,
        saldoPorComprometer: 60000000.00,
        saldoPorDevengar: 7000000.00,
        saldoPorPagar: 0.00,
        porcentajeEjecucion: 21.18,
        estadoEjecucion: 'Subejecución',
        observaciones: 'Subejecución crítica del 21.18%. Licitaciones de renovación tecnológica demoradas en comité de compras.',
        fuenteRectorUrl: 'https://digecog.gob.do/activos',
        fechaCorte: '2026-02-15'
      },
      {
        id: 5,
        expedienteId: 3,
        pais: 'República Dominicana',
        entePresupuestario: 'DIGEPRES / DIGECOG / SIGEF',
        codigoObjetoGasto: '2.7',
        denominacion: 'Obras en Infraestructura (Adecuación Búnker de Radiación y Blindaje)',
        tipo: 'Gasto',
        presupuestoAprobado: 35000000.00,
        presupuestoModificado: 42000000.00,
        preventivo: 42000000.00,
        comprometido: 42000000.00,
        devengado: 36000000.00,
        pagado: 28500000.00,
        saldoPorComprometer: 0.00,
        saldoPorDevengar: 6000000.00,
        saldoPorPagar: 7500000.00,
        porcentajeEjecucion: 85.71,
        estadoEjecucion: 'Normal',
        observaciones: 'Obras con informe técnico preliminar de la Comisión Nacional de Energía (CNE).',
        fuenteRectorUrl: 'https://hacienda.gob.do/sigef',
        fechaCorte: '2026-02-15'
      },
      {
        id: 6,
        expedienteId: 3,
        pais: 'República Dominicana',
        entePresupuestario: 'DIGEPRES / DIGECOG / SIGEF',
        codigoObjetoGasto: '1.4',
        denominacion: 'Ingresos por Transferencias del Gobierno Central (Presupuesto General del Estado)',
        tipo: 'Ingreso',
        presupuestoAprobado: 460000000.00,
        presupuestoModificado: 505000000.00,
        preventivo: 505000000.00,
        comprometido: 505000000.00,
        devengado: 480000000.00,
        pagado: 480000000.00,
        saldoPorComprometer: 0.00,
        saldoPorDevengar: 25000000.00,
        saldoPorPagar: 0.00,
        porcentajeEjecucion: 95.05,
        estadoEjecucion: 'Normal',
        observaciones: 'Transferencias recibidas conforme al cronograma de la Tesorería Nacional.',
        fuenteRectorUrl: 'https://digepres.gob.do',
        fechaCorte: '2026-02-15'
      }
    ],
    evidenceFolders: [
      {
        id: 'evidence/hallazgo_0001',
        hallazgoId: 1,
        hallazgoTitulo: 'Fraccionamiento de compras para eludir proceso de Licitación Pública',
        codigoExpediente: 'AUD-2026-001',
        fuente: 'Portal Transaccional DGCP y DAF MOPC',
        fecha: '2026-01-22',
        url: 'https://comprasdominicana.gob.do/procesos/MOPC-2025-081',
        sha256: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
        subcarpetas: {
          capturas: [
            { id: 'cap-01', nombre: 'captura_portal_dgcp_fraccionamiento.png', tipo: 'captura', url: 'https://comprasdominicana.gob.do/procesos/MOPC-2025-081', sha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0', fecha: '2026-01-22' }
          ],
          pdf: [
            { id: 'pdf-01', nombre: 'ordenes_compra_fraccionadas_1_a_8.pdf', tipo: 'pdf', tamano: '4.8 MB', sha256: 'b2c3d4e5f6a10718293a4b5c6d7e8f90123456789abcdef0123456789abcdef1', fecha: '2026-01-22' }
          ],
          ocr: [
            { id: 'ocr-01', nombre: 'extraccion_ocr_ordenes_compra.txt', tipo: 'ocr', texto: 'Orden de Compra No. 81 a 88... Monto RD$ 2,450,000.00 cada una... Proveedor Consorcio Asfáltico... Objeto Idéntico: Suministro de mezcla asfáltica caliente.', sha256: 'c3d4e5f6a1b20718293a4b5c6d7e8f90123456789abcdef0123456789abcdef2', fecha: '2026-01-22' }
          ],
          links: [
            { id: 'lnk-01', titulo: 'Portal Transaccional DGCP - Consulta MOPC-DAF-CM-2025-019', url: 'https://comprasdominicana.gob.do/procesos/MOPC-2025-081', descripcion: 'Enlace directo al expediente digital de compras menores en DGCP', fecha: '2026-01-22' }
          ],
          reportes: [
            { id: 'rep-01', nombre: 'ficha_pericial_hallazgo_0001.docx', tipo: 'reporte', tamano: '320 KB', sha256: 'd4e5f6a1b2c30718293a4b5c6d7e8f90123456789abcdef0123456789abcdef3', fecha: '2026-01-23' }
          ]
        },
        metadata: {
          hallazgo: '0001',
          entidad: 'Ministerio de Obras Públicas y Comunicaciones (MOPC)',
          fuente: 'DGCP / DAF',
          fecha: '2026-01-22',
          url: 'https://comprasdominicana.gob.do/procesos/MOPC-2025-081',
          responsable: 'Lic. Pedro Baldera',
          clasificacion: 'FINANCIERO',
          tipoControl: 'HALLAZGO_ADMINISTRATIVO',
          dictamenPericial: 'Fraccionamiento sistemático comprobado con elusión de licitación pública nacional.'
        }
      },
      {
        id: 'evidence/hallazgo_0004',
        hallazgoId: 4,
        hallazgoTitulo: 'INCART: Adenda al Contrato de Mantenimiento Integral de Aceleradores Lineales (LINAC) excede el 25% del límite legal',
        codigoExpediente: 'AUD-2026-INCART',
        fuente: 'Portal Transparencia INCART (https://www.incart.gob.do/transparencia) y DGCP',
        fecha: '2026-02-12',
        url: 'https://www.incart.gob.do/transparencia/compras-y-contrataciones/procesos-de-compras',
        sha256: 'e5f6a1b2c3d40718293a4b5c6d7e8f90123456789abcdef0123456789abcdef4',
        subcarpetas: {
          capturas: [
            { id: 'cap-incart-01', nombre: 'portal_transparencia_incart_contrato_linac.png', tipo: 'captura', url: 'https://www.incart.gob.do/transparencia', sha256: 'f6a1b2c3d4e50718293a4b5c6d7e8f90123456789abcdef0123456789abcdef5', fecha: '2026-02-12' },
            { id: 'cap-incart-02', nombre: 'adenda_no1_incart_contr018.png', tipo: 'captura', url: 'https://comprasdominicana.gob.do', sha256: '0718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0123456789ab6', fecha: '2026-02-12' }
          ],
          pdf: [
            { id: 'pdf-incart-01', nombre: 'Pliego_Condiciones_INCART_LINAC_2025.pdf', tipo: 'pdf', tamano: '3.2 MB', sha256: '18293a4b5c6d7e8f90123456789abcdef0123456789abcdef0123456789ab607', fecha: '2026-02-12' },
            { id: 'pdf-incart-02', nombre: 'Contrato_CONTR_INCART_2025_018_y_Adenda01.pdf', tipo: 'pdf', tamano: '5.1 MB', sha256: '293a4b5c6d7e8f90123456789abcdef0123456789abcdef0123456789ab60718', fecha: '2026-02-12' }
          ],
          ocr: [
            { id: 'ocr-incart-01', nombre: 'analisis_ocr_adenda_porcentaje.txt', tipo: 'ocr', texto: 'Monto Original Contrato: RD$ 28,000,000.00... Monto Adenda No. 1: RD$ 11,500,000.00... Variación Porcentual: +41.07%... Límite Máximo Ley 340-06 Art. 31: 25.00%... Exceso Ilegal: RD$ 4,500,000.00.', sha256: '3a4b5c6d7e8f90123456789abcdef0123456789abcdef0123456789ab6071829', fecha: '2026-02-12' }
          ],
          links: [
            { id: 'lnk-incart-01', titulo: 'Portal de Transparencia INCART - Compras', url: 'https://www.incart.gob.do/transparencia/compras-y-contrataciones/procesos-de-compras', descripcion: 'Página oficial de contrataciones del Instituto Nacional del Cáncer', fecha: '2026-02-12' },
            { id: 'lnk-incart-02', titulo: 'DGCP Portal Transaccional - Proceso INCART-CCC-LPN-2025-0004', url: 'https://comprasdominicana.gob.do', descripcion: 'Ficha del proceso oficial en la Dirección General de Contrataciones Públicas', fecha: '2026-02-12' }
          ],
          reportes: [
            { id: 'rep-incart-01', nombre: 'dictamen_pericial_adenda_incart_0004.docx', tipo: 'reporte', tamano: '410 KB', sha256: '4b5c6d7e8f90123456789abcdef0123456789abcdef0123456789ab60718293a', fecha: '2026-02-13' }
          ]
        },
        metadata: {
          hallazgo: '0004',
          entidad: 'Instituto Nacional del Cáncer Rosa Emilia Sánchez Pérez de Tavares (INCART)',
          fuente: 'Portal Transparencia INCART / DGCP',
          fecha: '2026-02-12',
          url: 'https://www.incart.gob.do/transparencia',
          responsable: 'Lic. Pedro Baldera',
          clasificacion: 'LEGAL',
          tipoControl: 'HALLAZGO_ADMINISTRATIVO',
          dictamenPericial: 'Infracción expresa del límite legal del 25% estipulado en el Art. 31 de la Ley 340-06, configurando nulidad de pleno derecho del incremento excesivo.'
        }
      },
      {
        id: 'evidence/hallazgo_0005',
        hallazgoId: 5,
        hallazgoTitulo: 'INCART: Discrepancia sustancial entre Pliego de Condiciones / TDR y Contrato Adjudicado en Licitación de Fármacos Oncológicos',
        codigoExpediente: 'AUD-2026-INCART',
        fuente: 'Portal Transparencia INCART (https://www.incart.gob.do/transparencia) y Portal Transaccional DGCP',
        fecha: '2026-02-14',
        url: 'https://www.incart.gob.do/transparencia/compras-y-contrataciones',
        sha256: '5c6d7e8f90123456789abcdef0123456789abcdef0123456789ab60718293a4b',
        subcarpetas: {
          capturas: [
            { id: 'cap-incart-03', nombre: 'tdr_pliego_farmacos_cadena_frio.png', tipo: 'captura', url: 'https://www.incart.gob.do/transparencia', sha256: '6d7e8f90123456789abcdef0123456789abcdef0123456789ab60718293a4b5c', fecha: '2026-02-14' },
            { id: 'cap-incart-04', nombre: 'contrato_firmado_omision_garantias.png', tipo: 'captura', url: 'https://comprasdominicana.gob.do', sha256: '7e8f90123456789abcdef0123456789abcdef0123456789ab60718293a4b5c6d', fecha: '2026-02-14' }
          ],
          pdf: [
            { id: 'pdf-incart-03', nombre: 'Pliego_Definitivo_INCART_CCC_LPN_2025_0012.pdf', tipo: 'pdf', tamano: '6.4 MB', sha256: '8f90123456789abcdef0123456789abcdef0123456789ab60718293a4b5c6d7e', fecha: '2026-02-14' },
            { id: 'pdf-incart-04', nombre: 'Contrato_CONTR_INCART_2025_032_Farmacos.pdf', tipo: 'pdf', tamano: '4.9 MB', sha256: '90123456789abcdef0123456789abcdef0123456789ab60718293a4b5c6d7e8f', fecha: '2026-02-14' }
          ],
          ocr: [
            { id: 'ocr-incart-02', nombre: 'cotejo_pericial_tdr_vs_contrato.txt', tipo: 'ocr', texto: 'Cláusula Térmica Pliego: Exigencia mandatoria de registro térmico 2°C a 8°C con data-loggers calibrados... Contrato firmado: Se omite cláusula y se adiciona anticipo del 20% sin póliza de garantía... Inobservancia sustancial del pliego.', sha256: '0123456789abcdef0123456789abcdef0123456789ab60718293a4b5c6d7e8f90', fecha: '2026-02-14' }
          ],
          links: [
            { id: 'lnk-incart-03', titulo: 'Portal de Transparencia INCART - Licitación LPN-2025-0012', url: 'https://www.incart.gob.do/transparencia/compras-y-contrataciones', descripcion: 'Expediente de fármacos oncológicos y citostáticos de alto costo', fecha: '2026-02-14' }
          ],
          reportes: [
            { id: 'rep-incart-02', nombre: 'informe_indicios_penales_pepca_incart.docx', tipo: 'reporte', tamano: '530 KB', sha256: '123456789abcdef0123456789abcdef0123456789ab60718293a4b5c6d7e8f901', fecha: '2026-02-15' }
          ]
        },
        metadata: {
          hallazgo: '0005',
          entidad: 'Instituto Nacional del Cáncer Rosa Emilia Sánchez Pérez de Tavares (INCART)',
          fuente: 'Portal Transparencia INCART / DGCP',
          fecha: '2026-02-14',
          url: 'https://www.incart.gob.do/transparencia',
          responsable: 'Lic. Pedro Baldera',
          clasificacion: 'LEGAL',
          tipoControl: 'POSIBLE_OBSERVACION_PENAL_JUDICIAL',
          dictamenPericial: 'Grave alteración de las cláusulas esenciales de los pliegos de condiciones en el contrato de adjudicación con indicios de favorecimiento ilícito y riesgo sanitario severo.'
        }
      }
    ],
    procurementAudits: [
      {
        id: 'PROC-INCART-01',
        codigoProceso: 'INCART-CCC-LPN-2025-0004',
        entidad: 'Instituto Nacional del Cáncer Rosa Emilia Sánchez Pérez de Tavares (INCART)',
        objeto: 'Mantenimiento Preventivo y Correctivo Integral de Aceleradores Lineales (LINAC)',
        portalTransparenciaUrl: 'https://www.incart.gob.do/transparencia/compras-y-contrataciones',
        portalDgcpUrl: 'https://comprasdominicana.gob.do/portal/consulta?id=INCART-2025-0004',
        pliegoTdr: {
          especificacionesClave: 'Mantenimiento trimestral con calibración dosimétrica y certificación de seguridad radiológica por perito físico-médico.',
          montoEstimadoPliego: 28000000.00,
          plazoMeses: 12,
          requerimientoGarantia: 'Póliza de Fiel Cumplimiento del 10% y Responsabilidad Civil Radiológica por US$ 500,000.'
        },
        contratoAdjudicado: {
          proveedorAdjudicado: 'Tecnología Médica Especializada del Caribe, SRL',
          rnc: '131-88992-1',
          montoAdjudicado: 28000000.00,
          fechaContrato: '2025-05-10',
          plazoContratoMeses: 12
        },
        adendas: [
          {
            numeroAdenda: 'Adenda No. 1',
            fecha: '2025-11-18',
            montoAdicional: 11500000.00,
            porcentajeSobreOriginal: 41.07,
            justificacion: 'Inclusión sobrevenida de repuestos mayores (magnetrón, cañón de electrones y sistema de refrigeración de helio líquido).',
            aprobadaPorOrganoRector: false
          }
        ],
        montoFinalAcumulado: 39500000.00,
        porcentajeTotalAdendas: 41.07,
        excedeLimiteLegal25Pct: true,
        discrepanciaPliegoVsContrato: 'El pliego solo cubría horas técnicas de mantenimiento preventivo. La adenda introdujo repuestos de alto costo superando el 25% legal permitido (41.07%), lo que exigía un nuevo proceso licitatorio.',
        alertaFraccionamiento: false,
        clasificacionAspecto: 'LEGAL',
        tipoControl: 'HALLAZGO_ADMINISTRATIVO',
        estadoAuditoria: 'Con Hallazgo Formal',
        carpetaEvidenciaId: 'evidence/hallazgo_0004'
      },
      {
        id: 'PROC-INCART-02',
        codigoProceso: 'INCART-CCC-LPN-2025-0012',
        entidad: 'Instituto Nacional del Cáncer Rosa Emilia Sánchez Pérez de Tavares (INCART)',
        objeto: 'Suministro de Fármacos Oncológicos de Alto Costo y Citostáticos',
        portalTransparenciaUrl: 'https://www.incart.gob.do/transparencia/compras-y-contrataciones',
        portalDgcpUrl: 'https://comprasdominicana.gob.do/portal/consulta?id=INCART-2025-0012',
        pliegoTdr: {
          especificacionesClave: 'Trastuzumab 440mg, Paclitaxel 300mg, Pembrolizumab 100mg con cadena de frío certificada de 2°C a 8°C.',
          montoEstimadoPliego: 45800000.00,
          plazoMeses: 12,
          requerimientoGarantia: 'Póliza del 10% y penalidad del 1% por día de retraso. Prohibición expresa de pagos por anticipo.'
        },
        contratoAdjudicado: {
          proveedorAdjudicado: 'Pharma Onco Dominicana, SA',
          rnc: '101-77665-4',
          montoAdjudicado: 45800000.00,
          fechaContrato: '2025-06-20',
          plazoContratoMeses: 12
        },
        adendas: [],
        montoFinalAcumulado: 45800000.00,
        porcentajeTotalAdendas: 0,
        excedeLimiteLegal25Pct: false,
        discrepanciaPliegoVsContrato: 'El contrato firmado eliminó la penalidad por desabastecimiento hospitalario de pacientes con cáncer, suprimió la obligatoriedad de entrega con data-logger térmico y concedió un anticipo ilícito del 20% sin garantía bancaria.',
        alertaFraccionamiento: false,
        clasificacionAspecto: 'LEGAL',
        tipoControl: 'POSIBLE_OBSERVACION_PENAL_JUDICIAL',
        estadoAuditoria: 'Con Hallazgo Formal',
        carpetaEvidenciaId: 'evidence/hallazgo_0005'
      },
      {
        id: 'PROC-MOPC-01',
        codigoProceso: 'MOPC-CCC-CP-2025-004',
        entidad: 'Ministerio de Obras Públicas y Comunicaciones (MOPC)',
        objeto: 'Reconstrucción de Drenaje Pluvial y Aceras Avenida Perimetral Norte',
        portalTransparenciaUrl: 'https://mopc.gob.do/transparencia/compras-y-licitaciones',
        portalDgcpUrl: 'https://comprasdominicana.gob.do',
        pliegoTdr: {
          especificacionesClave: 'Tuberías de hormigón armado de 48 pulgadas, pozos filtrantes y reposición de pavimento.',
          montoEstimadoPliego: 34500000.00,
          plazoMeses: 6,
          requerimientoGarantia: 'Fianza de Fiel Cumplimiento 10% y Garantía de Vicios Ocultos 2 años.'
        },
        contratoAdjudicado: {
          proveedorAdjudicado: 'Constructora Caribe & Asociados, SRL',
          rnc: '131-45678-9',
          montoAdjudicado: 34500000.00,
          fechaContrato: '2025-07-01',
          plazoContratoMeses: 6
        },
        adendas: [
          {
            numeroAdenda: 'Adenda de Tiempo No. 1',
            fecha: '2025-12-15',
            montoAdicional: 0,
            porcentajeSobreOriginal: 0,
            justificacion: 'Extensión de plazo por lluvias torrenciales y afectación freática.',
            aprobadaPorOrganoRector: true
          }
        ],
        montoFinalAcumulado: 34500000.00,
        porcentajeTotalAdendas: 0,
        excedeLimiteLegal25Pct: false,
        discrepanciaPliegoVsContrato: 'Se tramitaron libramientos de pago sin verificar la consignación de la fianza bancaria definitiva requerida por el pliego.',
        alertaFraccionamiento: false,
        clasificacionAspecto: 'OBRAS',
        tipoControl: 'DEBILIDAD_CONTROL_INTERNO',
        estadoAuditoria: 'Con Hallazgo Formal',
        carpetaEvidenciaId: 'evidence/hallazgo_0002'
      }
    ],
    checkpoint: {
      lastUpdated: new Date().toISOString(),
      totalObservacionesAlDia: 5,
      pendientesDeProcesar: 2,
      tareasPendientes: [
        {
          id: 'TASK-INCART-01',
          tarea: 'Cotejo pericial de libramientos en Hacienda vs Adenda No. 1 de Aceleradores Lineales en INCART',
          modulo: 'Compras / Tesorería',
          estado: 'Pendiente',
          prioridad: 'Crítica',
          fechaProgramada: new Date().toISOString().split('T')[0]
        },
        {
          id: 'TASK-INCART-02',
          tarea: 'Inspección de almacenamiento y verificación de cadena de frío en farmacia oncológica del INCART',
          modulo: 'Compras / Sanitario',
          estado: 'En Proceso',
          prioridad: 'Alta',
          fechaProgramada: new Date().toISOString().split('T')[0]
        }
      ],
      autoResumeEnabled: true,
      lastSyncStatus: 'Checkpoint activo: sincronizado con base pericial y órganos rectores.',
      versionSistema: '2.8.0-Enterprise-Pericial'
    }
  };
}

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    this.data = this.loadAndMigrate();
  }

  private loadAndMigrate(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.expedientes && parsed.hallazgos) {
          // Automatic migration of missing collections while keeping existing records
          const initial = getInitialData();
          if (!parsed.documentVersions) parsed.documentVersions = initial.documentVersions;
          if (!parsed.findingsEvidence) parsed.findingsEvidence = initial.findingsEvidence;
          if (!parsed.normativeCatalog) parsed.normativeCatalog = initial.normativeCatalog;
          if (!parsed.workflows) parsed.workflows = initial.workflows;
          if (!parsed.settings) parsed.settings = initial.settings;
          if (!parsed.customPlugins) parsed.customPlugins = initial.customPlugins;
          if (!parsed.budgetExecution) parsed.budgetExecution = initial.budgetExecution;
          if (!parsed.evidenceFolders) parsed.evidenceFolders = initial.evidenceFolders;
          if (!parsed.procurementAudits) parsed.procurementAudits = initial.procurementAudits;
          if (!parsed.checkpoint) parsed.checkpoint = initial.checkpoint;

          // Merge initial INCART expediente if not present
          const hasIncartExp = parsed.expedientes.some((e: any) => e.codigo === 'AUD-2026-INCART');
          if (!hasIncartExp) {
            const incartExp = initial.expedientes.find(e => e.codigo === 'AUD-2026-INCART');
            if (incartExp) parsed.expedientes.push(incartExp);
          }

          // Merge initial INCART hallazgos if not present
          const hasIncartHallazgo4 = parsed.hallazgos.some((h: any) => h.id === 4);
          if (!hasIncartHallazgo4) {
            const h4 = initial.hallazgos.find(h => h.id === 4);
            if (h4) parsed.hallazgos.push(h4);
          }
          const hasIncartHallazgo5 = parsed.hallazgos.some((h: any) => h.id === 5);
          if (!hasIncartHallazgo5) {
            const h5 = initial.hallazgos.find(h => h.id === 5);
            if (h5) parsed.hallazgos.push(h5);
          }

          // Ensure hallazgos have workflowStatus and classifications
          parsed.hallazgos.forEach((h: any) => {
            if (!h.workflowStatus) h.workflowStatus = 'BORRADOR';
            if (!h.clasificacion) h.clasificacion = 'FINANCIERO';
            if (!h.tipoControl) h.tipoControl = 'HALLAZGO_ADMINISTRATIVO';
          });
          // Ensure evidencias have clasificacion and versionActual
          parsed.evidencias.forEach((ev: any) => {
            if (!ev.clasificacion) ev.clasificacion = 'Extraído';
            if (!ev.versionActual) ev.versionActual = 1;
          });

          this.save(parsed);
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading database file, initializing default:', e);
    }
    const initial = getInitialData();
    this.save(initial);
    return initial;
  }

  public save(data: DatabaseSchema): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving database:', e);
    }
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  public updateData(mutator: (data: DatabaseSchema) => void): DatabaseSchema {
    mutator(this.data);
    this.save(this.data);
    return this.data;
  }

  public resetToSample(): DatabaseSchema {
    this.data = getInitialData();
    this.save(this.data);
    return this.data;
  }

  public logActivity(usuario: string, accion: string, detalle: string) {
    const nextId = this.data.actividad.length > 0
      ? Math.max(...this.data.actividad.map(a => a.id)) + 1
      : 1;
    this.data.actividad.unshift({
      id: nextId,
      usuario: usuario || 'sistema',
      accion,
      detalle: detalle.slice(0, 1000),
      fecha: new Date().toISOString()
    });
    if (this.data.actividad.length > 500) {
      this.data.actividad = this.data.actividad.slice(0, 500);
    }
    this.save(this.data);
  }
}

export const db = new DatabaseManager();
