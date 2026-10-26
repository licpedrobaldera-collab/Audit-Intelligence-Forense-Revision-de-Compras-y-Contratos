# Plantillas Oficiales de Auditoría Enterprise

Este directorio contiene las plantillas preconfiguradas para la generación de reportes y matrices:

1. `audit_report.docx`: Plantilla institucional en Microsoft Word con estilos corporativos, cabeceras oficiales, marcas de agua de confidencialidad y secciones periciales para hallazgos, criterios normativos y recomendaciones al auditor.
2. `findings_matrix.xlsx`: Plantilla en Microsoft Excel para la matriz de hallazgos periciales con validación de datos para clasificaciones (`FINANCIERO`, `LEGAL`, `OBRAS`, `ACL`, `TECNOLOGICO`) y tipos de control (`DEBILIDAD_CONTROL_INTERNO`, `HALLAZGO_ADMINISTRATIVO`, `POSIBLE_OBSERVACION_PENAL_JUDICIAL`).
3. `risk_matrix.xlsx`: Plantilla en Microsoft Excel con mapa de calor 5x5 de probabilidad e impacto y fórmulas de severidad de riesgo institucional.

Nota: Al utilizar `template_builder.py` o `matrix_engine.py`, el sistema inyecta directamente los datos en estas plantillas o genera libros limpios certificados.
