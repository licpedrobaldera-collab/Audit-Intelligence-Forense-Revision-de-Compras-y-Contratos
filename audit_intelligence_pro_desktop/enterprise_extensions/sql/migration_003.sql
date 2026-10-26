-- Migración 003: Auditoría Presupuestaria de Ciclo Completo y Cotejo Pliegos / Contratos / Adendas (Ley 340-06)

CREATE TABLE IF NOT EXISTS budget_execution(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expediente_id INTEGER,
    anio INTEGER,
    codigo_objeto TEXT,
    denominacion TEXT,
    tipo TEXT, -- 'Ingreso' o 'Gasto'
    presupuesto_aprobado REAL DEFAULT 0,
    modificaciones REAL DEFAULT 0,
    presupuesto_vigente REAL DEFAULT 0,
    preventivo REAL DEFAULT 0,
    comprometido REAL DEFAULT 0,
    devengado REAL DEFAULT 0,
    pagado REAL DEFAULT 0,
    deuda_flotante REAL DEFAULT 0,
    saldo_por_comprometer REAL DEFAULT 0,
    alerta_sobreejecucion INTEGER DEFAULT 0,
    alerta_subejecucion INTEGER DEFAULT 0,
    fuente_cruce TEXT,
    notas TEXT
);

CREATE TABLE IF NOT EXISTS procurement_audits(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expediente_id INTEGER,
    codigo_proceso TEXT,
    entidad TEXT,
    objeto_contratacion TEXT,
    monto_tdr_estimado REAL DEFAULT 0,
    monto_contrato_original REAL DEFAULT 0,
    monto_adendas_total REAL DEFAULT 0,
    monto_final_acumulado REAL DEFAULT 0,
    porcentaje_variacion_adenda REAL DEFAULT 0,
    excede_limite_legal_25pct INTEGER DEFAULT 0,
    condiciones_tdr_clave TEXT,
    condiciones_contrato TEXT,
    condiciones_adenda TEXT,
    desviaciones_sustanciales TEXT,
    clasificacion TEXT, -- 'FINANCIERO', 'LEGAL', 'OBRAS', 'ACL', 'TECNOLOGICO'
    tipo_control TEXT,  -- 'DEBILIDAD_CONTROL_INTERNO', 'HALLAZGO_ADMINISTRATIVO', 'POSIBLE_OBSERVACION_PENAL_JUDICIAL'
    acciones_recomendadas TEXT,
    evidencia_carpeta_id TEXT,
    link_portal_transparencia TEXT,
    link_dgcp TEXT,
    link_contraloria TEXT,
    link_hacienda_sigef TEXT,
    estado_verificacion TEXT
);

CREATE TABLE IF NOT EXISTS checkpoints(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha_checkpoint TEXT,
    ultima_sincronizacion TEXT,
    usuario TEXT,
    tareas_pendientes_json TEXT,
    resumen_estado TEXT
);
