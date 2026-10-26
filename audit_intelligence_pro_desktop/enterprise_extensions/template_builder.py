"""
Template Builder - Generador de Informes Word (.docx) y Matrices Excel (.xlsx)
Permite anexar o compilar informes finales de auditoría y matrices técnicas personalizadas.
"""

import os
from datetime import datetime

try:
    from docx import Document
    from docx.shared import Inches, Pt, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False

class TemplateBuilder:
    def __init__(self, output_dir="generated_reports"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def generate_audit_report_docx(self, expediente_data: dict, hallazgos: list, filename="Informe_Auditoria_Pericial.docx"):
        filepath = os.path.join(self.output_dir, filename)
        
        if not DOCX_AVAILABLE:
            # Fallback en texto
            with open(filepath.replace(".docx", ".txt"), "w", encoding="utf-8") as f:
                f.write(f"INFORME PERICIAL DE AUDITORÍA: {expediente_data.get('titulo', '')}\n")
                f.write(f"Fecha: {datetime.now().strftime('%Y-%m-%d')}\n")
                f.write("=" * 60 + "\n\n")
                for h in hallazgos:
                    f.write(f"[{h.get('codigo')}] {h.get('titulo')}\n")
                    f.write(f"Condición: {h.get('condicion')}\n")
                    f.write(f"Criterio: {h.get('criterio')}\n\n")
            return filepath.replace(".docx", ".txt")

        doc = Document()

        # Portada / Título
        title_p = doc.add_paragraph()
        title_run = title_p.add_run("INFORME FORENSE Y PERICIAL DE AUDITORÍA INTEGRAL")
        title_run.font.name = "Calibri"
        title_run.font.size = Pt(20)
        title_run.font.bold = True
        title_run.font.color.rgb = RGBColor(15, 23, 42)
        title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER

        subtitle_p = doc.add_paragraph()
        sub_run = subtitle_p.add_run(f"Expediente: {expediente_data.get('codigo', 'INCART-2025-01')} | {expediente_data.get('entidad', 'INCART')}")
        sub_run.font.size = Pt(13)
        sub_run.font.italic = True
        subtitle_p.alignment = WD_ALIGN_PARAGRAPH.CENTER

        doc.add_paragraph(f"Fecha de Emisión: {datetime.now().strftime('%d de %B de %Y')}")
        doc.add_paragraph("Órganos Rectores Contrastados: DGCP, Contraloría General, DIGEPRES, DIGECOG, Tesorería Nacional, MAP.")
        doc.add_heading("1. RESUMEN EJECUTIVO", level=1)
        doc.add_paragraph(
            "El presente informe documenta las pruebas y verificaciones documentales realizadas sobre los procesos "
            "de compras, contratos, adendas y ejecución presupuestaria de la entidad auditada, "
            "contrastando los portales de transparencia institucional contra los registros de los órganos rectores del Estado Dominicano."
        )

        doc.add_heading("2. HALLAZGOS PERICIALES DETECTADOS", level=1)
        for h in hallazgos:
            h_p = doc.add_paragraph()
            h_run = h_p.add_run(f"[{h.get('codigo', 'H-01')}] {h.get('titulo', '')}")
            h_run.font.bold = True
            h_run.font.size = Pt(12)
            
            p_det = doc.add_paragraph()
            p_det.add_run("• Clasificación Técnica: ").bold = True
            p_det.add_run(f"{h.get('clasificacion', 'LEGAL')}\n")
            p_det.add_run("• Tipo de Control: ").bold = True
            p_det.add_run(f"{h.get('tipoControl', 'DEBILIDAD_CONTROL_INTERNO')}\n")
            p_det.add_run("• Condición (Hecho observado): ").bold = True
            p_det.add_run(f"{h.get('condicion', '')}\n")
            p_det.add_run("• Criterio Normativo: ").bold = True
            p_det.add_run(f"{h.get('criterio', '')}\n")
            p_det.add_run("• Causa Raíz: ").bold = True
            p_det.add_run(f"{h.get('causa', '')}\n")
            p_det.add_run("• Efecto / Daño Estimado: ").bold = True
            p_det.add_run(f"{h.get('efecto', '')}\n")
            p_det.add_run("• Recomendación Pericial al Auditor: ").bold = True
            p_det.add_run(f"{h.get('accionesRecomendadasAuditor', 'Iniciar acciones correctivas inmediatas.')}\n")
            p_det.add_run("• Carpeta de Evidencia Digital: ").bold = True
            p_det.add_run(f"{h.get('evidenciaCarpetaId', 'evidence/hallazgo_0001')}")

        doc.add_heading("3. DICTAMEN Y CONCLUSIONES", level=1)
        doc.add_paragraph(
            "Se concluye que existen desviaciones sustanciales que ameritan la intervención de los órganos de control externo "
            "y la retención preventiva de desembolsos en los contratos que superen el límite legal del 25%."
        )

        doc.save(filepath)
        return filepath
