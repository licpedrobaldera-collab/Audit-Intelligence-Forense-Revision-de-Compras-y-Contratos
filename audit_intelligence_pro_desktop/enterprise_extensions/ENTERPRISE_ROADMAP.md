# Enterprise Extensions - Audit Intelligence Pro
## Arquitectura de Módulos Periciales y Auditoría Continua

Esta extensión eleva el sistema MVP a una plataforma **Enterprise de Fiscalización y Auditoría Forense** con soporte pleno para la legislación Dominicana (Ley 340-06, Decreto 543-12, Ley 10-07, Ley 423-06) e internacionalización presupuestaria.

---

### Estructura de Módulos

```
enterprise_extensions/
│
├── enterprise_extension.py      # Orquestador unificado de la suite Enterprise
├── matrix_engine.py             # Generador de las 8 Matrices Especializadas en Excel
├── compliance_engine.py         # Catálogo normativo y reglas legales de órganos rectores
├── workflow_engine.py           # Ciclo de aprobación (Borrador -> Revisión -> Aprobado -> Archivado)
├── ai_engine.py                 # Motor de reglas periciales e IA para detección de indicios de dolo
├── external_validation.py       # Contrastación portal institucional vs rectores (DGCP, SIGEF, DIGECOG)
├── procurement_audit.py         # Cotejo Pliegos / TDR vs Contratos vs Adendas (Límite 25% Ley 340-06)
├── budget_audit.py              # Ejecución presupuestaria de ciclo completo (Aprobado -> Devengado -> Pagado)
├── template_builder.py          # Constructor de informes periciales Word y matrices personalizadas
├── migration_manager.py         # Gestor de migraciones SQLite automatizado
├── auto_updater.py              # Gestor de continuidad ("Continuar al día siguiente") y dependencias
├── evidence_manager.py          # Gestor de evidencias digitales ('evidence/hallazgo_XXXX/') con SHA-256
│
├── sql/
│   ├── migration_001.sql        # Versionamiento, traza de evidencias y catálogo normativo
│   ├── migration_002.sql        # Tipificación técnica y clasificaciones periciales de hallazgos
│   ├── migration_003.sql        # Tablas de presupuesto, auditoría de compras y checkpoints
│
├── templates/
│   ├── audit_report.docx        # Plantilla modelo de informe pericial forense
│   ├── findings_matrix.xlsx     # Plantilla matriz de hallazgos con clasificación técnica
│   └── risk_matrix.xlsx         # Plantilla matriz de riesgos de control interno
│
└── requirements_enterprise.txt  # Dependencias Python (pytesseract, pdf2image, docx, openpyxl, etc.)
```

---

### Funcionalidades Clave

1. **Auditoría de Compras (Pliegos vs Contratos vs Adendas):**
   - Evalúa desviaciones entre las especificaciones iniciales y el contrato firmado.
   - Detecta automáticamente si las adendas sobrepasan el **25% máximo permitido por el Art. 31 de la Ley 340-06**.
   - Clasifica hallazgos en: `FINANCIERO`, `LEGAL`, `OBRAS`, `ACL` (Laboral/Cumplimiento) y `TECNOLOGICO`.
   - Tipifica la severidad institucional: `DEBILIDAD_CONTROL_INTERNO`, `HALLAZGO_ADMINISTRATIVO`, `POSIBLE_OBSERVACION_PENAL_JUDICIAL`.

2. **Gestor de Evidencias Digitales con Cadena de Custodia:**
   - Todo hallazgo genera de forma automática una carpeta estructurada: `evidence/hallazgo_XXXX/`.
   - Subcarpetas: `capturas/`, `pdf/`, `ocr/`, `links/`, `reportes/`.
   - Archivo `metadata.json` con hash **SHA-256** de cada elemento para garantizar validez legal probatoria ante tribunales.

3. **Ejecución Presupuestaria de Ciclo Completo:**
   - Aprobado -> Modificaciones (Vigente) -> Preventivo -> Comprometido -> Devengado -> Pagado.
   - Cálculo automático de **Saldo por Comprometer** y **Deuda Flotante (Cuentas por pagar)**.
   - Cruce directo con clasificadores por objeto del gasto (2.1 Nómina, 2.2 Servicios, 2.3 Materiales/Fármacos, 2.6 Maquinaria, 2.7 Obras).

4. **8 Matrices Especializadas en Excel:**
   - 1. Matriz de Riesgos
   - 2. Matriz de Hallazgos
   - 3. Matriz de Evidencias
   - 4. Matriz de Contratos & Adendas
   - 5. Matriz de Pagos y Conciliación
   - 6. Matriz de Presupuesto (DIGEPRES)
   - 7. Matriz de Nómina (Cruce MAP)
   - 8. Matriz de Activos Fijos (Bienes Nacionales / DIGECOG)

5. **Continuidad Autónoma ("Continuar al día siguiente"):**
   - El sistema almacena checkpoints persistentes en `audit_checkpoint.json`.
   - Cola interactiva de tareas pendientes con trazabilidad de estado.
