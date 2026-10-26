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
  // Campos de trazabilidad avanzada y tipificación pericial
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

export type HallazgoClasificacion = 'FINANCIERO' | 'LEGAL' | 'OBRAS' | 'ACL' | 'TECNOLOGICO' | 'CONTROL_INTERNO';
export type HallazgoTipoControl = 'DEBILIDAD_CONTROL_INTERNO' | 'HALLAZGO_ADMINISTRATIVO' | 'POSIBLE_OBSERVACION_PENAL_JUDICIAL';

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
  id: string; // ej. 'evidence/hallazgo_0001'
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
  codigoProceso: string; // ej. INCART-CCC-LPN-2025-0012
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
  language: string; // 'es' | 'en'
  country: string; // 'República Dominicana' | 'USA' | 'Internacional'
  currency: string; // 'DOP' | 'USD' | 'EUR'
  dateFormat: string; // 'DD/MM/YYYY' | 'YYYY-MM-DD'
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

export interface CrossAuditDiscrepancy {
  id: string;
  modulo: string;
  item: string;
  valorEntidad: string;
  valorOrganoRector: string;
  organoRector: string;
  discrepancia: string;
  severidad: 'Crítica' | 'Alta' | 'Media' | 'Baja';
  impactoEconomico?: number;
  normativaViolada: string;
  alerta: string;
}

export interface CrossAuditResult {
  resumenCruce: string;
  modulo: 'Compras' | 'Financiero' | 'Activos' | 'Nomina';
  entidadAuditada: string;
  organosConsultados: string[];
  puntuacionConformidad: number;
  discrepancias: CrossAuditDiscrepancy[];
  hallazgosDetectados: Array<{
    titulo: string;
    condicion: string;
    criterio: string;
    causa: string;
    efecto: string;
    montoObservado?: number;
    nivel: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
    recomendacion: string;
    conclusion: string;
    normativaReferencia: string;
  }>;
  evidenciasGeneradas: Array<{
    fuente: string;
    url?: string;
    sha256: string;
    extracto: string;
    fechaConsulta: string;
  }>;
  fuentesWebEncontradas: Array<{
    title: string;
    url: string;
  }>;
  fechaCruce: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  groundingSources?: Array<{ title: string; url: string }>;
}

export interface DatabaseState {
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
