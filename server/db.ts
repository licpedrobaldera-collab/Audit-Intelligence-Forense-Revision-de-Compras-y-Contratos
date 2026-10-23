import fs from 'fs';
import path from 'path';

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
  recomendacion: string;
  conclusion?: string;
  normativaReferencia?: string;
  evidenciasAsociadas?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Riesgo {
  id: number;
  expedienteId: number | null;
  categoria: 'Financiero' | 'Cumplimiento' | 'Operacional' | 'Tecnológico' | 'Contratación' | 'Documental' | 'Fraude potencial' | 'Otro';
  descripcion: string;
  probabilidad: number; // 1-5
  impacto: number; // 1-5
  puntuacion: number; // prob * imp
  nivel: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
  mitigacion: string;
  estado: 'Pendiente' | 'En mitigación' | 'Controlado';
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
  modalidad: string; // e.g. Licitación Pública Nacional, Comparación de Precios, etc.
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
  metadatos?: {
    rnc?: string[];
    montos?: string[];
    fechas?: string[];
    ncf?: string[];
    firmasDetectadas?: boolean;
  };
  subidoPor: string;
  createdAt: string;
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

export interface DatabaseSchema {
  expedientes: Expediente[];
  hallazgos: Hallazgo[];
  riesgos: Riesgo[];
  proveedores: Proveedor[];
  contratos: Contrato[];
  pagos: Pago[];
  evidencias: Evidencia[];
  actividad: Actividad[];
  normativas: Normativa[];
}

const DB_DIR = path.resolve(process.cwd(), 'database');
const DB_FILE = path.join(DB_DIR, 'audit_intelligence.json');

const INITIAL_NORMATIVAS: Normativa[] = [
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
    id: 'LEY-41-08',
    nombre: 'Ley No. 41-08 de Función Pública',
    tipo: 'Ley',
    organismo: 'Ministerio de Administración Pública (MAP)',
    resumen: 'Régimen de deberes, prohibiciones y régimen disciplinario de los servidores del Estado.',
    articulosClave: [
      {
        articulo: 'Art. 80',
        tema: 'Prohibición de Conflictos de Interés',
        texto: 'Se prohíbe intervenir en gestiones, licitaciones o contratos donde el funcionario o sus parientes hasta el cuarto grado tengan interés personal.'
      }
    ]
  },
  {
    id: 'NOBACI',
    nombre: 'Normas Básicas de Control Interno (NOBACI)',
    tipo: 'Norma Interna',
    organismo: 'Contraloría General de la República',
    resumen: 'Marco de control interno para la administración pública (Ambiente de Control, Evaluación de Riesgos, Actividades de Control, Información/Comunicación y Monitoreo).',
    articulosClave: [
      {
        articulo: 'Norma 2.3',
        tema: 'Segregación Adecuada de Funciones',
        texto: 'Las funciones de autorización, registro, custodia y verificación deben estar asignadas a personas o unidades independientes para mitigar riesgos de fraude.'
      },
      {
        articulo: 'Norma 4.1',
        tema: 'Documentación y Archivo de Respaldo',
        texto: 'Toda transacción financiera debe estar sustentada en documentación auténtica, verificable y con trazabilidad completa.'
      }
    ]
  },
  {
    id: 'ISSAI-100',
    nombre: 'Normas Internacionales de Entidades Fiscalizadoras (ISSAI / INTOSAI)',
    tipo: 'Estándar Internacional',
    organismo: 'INTOSAI (International Organization of Supreme Audit Institutions)',
    resumen: 'Principios fundamentales de auditoría gubernamental, auditoría de cumplimiento y auditoría de desempeño.',
    articulosClave: [
      {
        articulo: 'ISSAI 100 § 42',
        tema: 'Escepticismo y Juicio Profesional',
        texto: 'El auditor debe mantener una actitud de alerta crítica e imparcialidad respecto a indicios de irregularidad o fraude.'
      },
      {
        articulo: 'ISSAI 400 § 38',
        tema: 'Suficiencia y Pertinencia de la Evidencia',
        texto: 'Las conclusiones deben sustentarse en evidencia suficiente, confiable y legalmente obtenida.'
      }
    ]
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
        recomendacion: '1. Iniciar investigación administrativa y remitir informe a la Dirección General de Contrataciones Públicas (DGCP). 2. Consolidar los requerimientos de insumos en una Licitación Pública Nacional con pliegos estandarizados. 3. Sancionar a los responsables del fraccionamiento conforme al Art. 30 de la Ley 10-04.',
        conclusion: 'Se determina incumplimiento severo y sistemático de la Ley 340-06 por fraccionamiento deliberado.',
        normativaReferencia: 'Ley 340-06 Art. 14 / Dec. 543-12 Art. 16',
        evidenciasAsociadas: ['OC-2025-081.pdf', 'OC-2025-082.pdf', 'Factura-B01004921.pdf'],
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
        recomendacion: 'Requerir inmediatamente a la empresa contratista la fianza bancaria o de seguros con carácter retroactivo y suspender cualquier desembolso pendiente hasta contar con informe técnico pericial.',
        conclusion: 'Inobservancia de requisitos sustanciales para el pago a proveedores.',
        normativaReferencia: 'Dec. 543-12 Art. 85 / NOBACI 4.1',
        evidenciasAsociadas: ['Libramiento-6029.pdf', 'Contrato-CONTR-2025-044.docx'],
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
        recomendacion: '1. Solicitar el reintegro inmediato de los RD$ 425,000.00 pagados de más. 2. Implementar alerta automática de control previo en el software financiero para bloquear NCF repetidos.',
        conclusion: 'Doble afectación de fondos por deficiencias de control interno.',
        normativaReferencia: 'NOBACI 2.3 / Dec. 254-06',
        evidenciasAsociadas: ['Cheque-9921.jpg', 'Cheque-9945.jpg'],
        createdBy: 'admin',
        createdAt: '2026-02-05T16:00:00Z'
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
        metadatos: {
          rnc: ['131-45678-9'],
          montos: ['34,500,000.00', '3,450,000.00'],
          fechas: ['2025-07-01', '2025-12-31'],
          firmasDetectadas: true
        },
        subidoPor: 'admin',
        createdAt: '2026-01-16T10:00:00Z'
      }
    ],
    actividad: [
      {
        id: 1,
        usuario: 'admin',
        accion: 'INICIALIZACION_SISTEMA',
        detalle: 'Carga de arquitectura base y normativas (Ley 340-06, Dec. 543-12, Ley 10-04, NOBACI)',
        fecha: '2026-01-15T08:00:00Z'
      },
      {
        id: 2,
        usuario: 'admin',
        accion: 'CREAR_HALLAZGO',
        detalle: 'Registrado hallazgo: Fraccionamiento de compras para eludir proceso de Licitación Pública (RD$ 19,600,000.00)',
        fecha: '2026-01-20T11:00:00Z'
      },
      {
        id: 3,
        usuario: 'admin',
        accion: 'DETECCION_PAGO_DUPLICADO',
        detalle: 'Alerta automática activada para factura FAC-8812 / NCF B0100098270 (Monto RD$ 425,000.00)',
        fecha: '2026-02-05T16:05:00Z'
      }
    ],
    normativas: INITIAL_NORMATIVAS
  };
}

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.expedientes && parsed.hallazgos) {
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

  private save(data: DatabaseSchema): void {
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
    // Keep max 500 records
    if (this.data.actividad.length > 500) {
      this.data.actividad = this.data.actividad.slice(0, 500);
    }
    this.save(this.data);
  }
}

export const db = new DatabaseManager();
