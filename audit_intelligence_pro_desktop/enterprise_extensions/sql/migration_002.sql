-- Migración 002: Ampliación Pericial de Hallazgos
-- Agrega clasificaciones técnicas: FINANCIERO, LEGAL, OBRAS, ACL, TECNOLOGICO
-- y tipo de control: DEBILIDAD_CONTROL_INTERNO, HALLAZGO_ADMINISTRATIVO, POSIBLE_OBSERVACION_PENAL_JUDICIAL

ALTER TABLE hallazgos ADD COLUMN resultado TEXT;
ALTER TABLE hallazgos ADD COLUMN fuente_externa TEXT;
ALTER TABLE hallazgos ADD COLUMN pagina TEXT;
ALTER TABLE hallazgos ADD COLUMN articulo TEXT;
ALTER TABLE hallazgos ADD COLUMN enlace TEXT;
ALTER TABLE hallazgos ADD COLUMN fecha_validacion TEXT;
ALTER TABLE hallazgos ADD COLUMN clasificacion TEXT DEFAULT 'CONTROL_INTERNO';
ALTER TABLE hallazgos ADD COLUMN tipo_control TEXT DEFAULT 'DEBILIDAD_CONTROL_INTERNO';
ALTER TABLE hallazgos ADD COLUMN acciones_recomendadas TEXT;
ALTER TABLE hallazgos ADD COLUMN evidencia_carpeta_id TEXT;
