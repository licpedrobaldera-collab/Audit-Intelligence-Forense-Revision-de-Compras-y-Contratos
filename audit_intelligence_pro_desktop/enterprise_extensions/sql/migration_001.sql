-- Migración 001: Módulos Base Enterprise
-- Agrega versionamiento documental, traza de evidencias, catálogo normativo, flujo de aprobación y configuración

CREATE TABLE IF NOT EXISTS document_versions(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evidence_id INTEGER,
    version INTEGER,
    sha256 TEXT,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS findings_evidence(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    finding_id INTEGER,
    evidence_id INTEGER,
    page TEXT,
    paragraph TEXT,
    article TEXT,
    verified INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS normative_catalog(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    country TEXT,
    authority TEXT,
    title TEXT,
    article TEXT,
    version TEXT,
    source_url TEXT,
    effective_date TEXT,
    status TEXT
);

CREATE TABLE IF NOT EXISTS workflow(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    object_type TEXT,
    object_id INTEGER,
    status TEXT,
    approved_by TEXT,
    approved_at TEXT,
    comments TEXT
);

CREATE TABLE IF NOT EXISTS settings(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    language TEXT,
    country TEXT,
    currency TEXT,
    date_format TEXT
);
