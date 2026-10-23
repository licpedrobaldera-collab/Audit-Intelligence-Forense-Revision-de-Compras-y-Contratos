import * as XLSX from 'xlsx';
import { CrossAuditResult } from '../types';

export const crossExportService = {
  exportToExcel(result: CrossAuditResult) {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Discrepancias
    const rowsDiscrepancias = (result.discrepancias || []).map(d => ({
      ID: d.id,
      Módulo: d.modulo,
      'Item / Proceso Auditado': d.item,
      'Valor Según Entidad': d.valorEntidad,
      'Valor Según Órgano Rector': d.valorOrganoRector,
      'Órgano Rector': d.organoRector,
      'Discrepancia Pericial': d.discrepancia,
      Severidad: d.severidad,
      'Impacto Económico (RD$)': d.impactoEconomico || 0,
      'Normativa Vulnerada': d.normativaViolada,
      'Alerta Pericial': d.alerta,
    }));
    const ws1 = XLSX.utils.json_to_sheet(rowsDiscrepancias);
    XLSX.utils.book_append_sheet(wb, ws1, '1_Discrepancias_Cruce');

    // Sheet 2: Hallazgos
    const rowsHallazgos = (result.hallazgosDetectados || []).map(h => ({
      Título: h.titulo,
      'Condición (Hecho)': h.condicion,
      'Criterio (Norma)': h.criterio,
      Causa: h.causa,
      Efecto: h.efecto,
      'Monto Observado (RD$)': h.montoObservado || 0,
      Nivel: h.nivel,
      'Recomendación Correctiva': h.recomendacion,
      'Conclusión Pericial': h.conclusion,
      'Normativa Referencia': h.normativaReferencia,
    }));
    const ws2 = XLSX.utils.json_to_sheet(rowsHallazgos);
    XLSX.utils.book_append_sheet(wb, ws2, '2_Hallazgos_Detectados');

    // Sheet 3: Evidencias y Custodia
    const rowsEvidencias = (result.evidenciasGeneradas || []).map(e => ({
      'Fuente / Portal Consultado': e.fuente,
      'Enlace Oficial': e.url || 'Consulta en Archivo',
      'Hash SHA-256 Custodia': e.sha256,
      'Extracto / Registro': e.extracto,
      'Fecha y Hora Consulta': e.fechaConsulta,
    }));
    const ws3 = XLSX.utils.json_to_sheet(rowsEvidencias);
    XLSX.utils.book_append_sheet(wb, ws3, '3_Evidencias_Custodia');

    const cleanName = (result.entidadAuditada || 'Entidad').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Matriz_Cruce_${result.modulo}_${cleanName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);
  },

  exportToWord(result: CrossAuditResult) {
    const cleanName = (result.entidadAuditada || 'Entidad').replace(/[^a-zA-Z0-9]/g, '_');
    const nowFormatted = new Date().toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const rowsDiscrepanciasHtml = (result.discrepancias || []).map((d, i) => `
      <tr style="background-color: ${i % 2 === 0 ? '#f8fafc' : '#ffffff'};">
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #1e293b;">${d.id}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">${d.item}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; color: #0369a1;">${d.valorEntidad}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; color: #b91c1c; font-weight: bold;">${d.valorOrganoRector}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>${d.organoRector}</strong></td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; color: ${d.severidad === 'Crítica' ? '#dc2626' : '#d97706'};">${d.severidad}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: #166534;">
          RD$ ${(d.impactoEconomico || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
        </td>
      </tr>
    `).join('');

    const hallazgosHtml = (result.hallazgosDetectados || []).map((h, i) => `
      <div style="border: 2px solid #cbd5e1; border-radius: 6px; padding: 16px; margin-bottom: 20px; page-break-inside: avoid; background-color: #f8fafc;">
        <h3 style="margin-top: 0; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
          HALLAZGO #${i + 1}: ${h.titulo}
        </h3>
        <p><strong>Nivel de Severidad:</strong> <span style="color: ${h.nivel === 'Crítico' ? '#dc2626' : '#d97706'}; font-weight: bold;">${h.nivel}</span> | <strong>Monto Observado:</strong> RD$ ${(h.montoObservado || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</p>
        <p><strong>Condición (Hecho Verificado):</strong> ${h.condicion}</p>
        <p><strong>Criterio Normativo Vulnerado:</strong> <em>${h.criterio}</em></p>
        <p><strong>Causa:</strong> ${h.causa}</p>
        <p><strong>Efecto y Daño Patrimonial:</strong> ${h.efecto}</p>
        <p style="background-color: #e0f2fe; padding: 10px; border-left: 4px solid #0284c7; border-radius: 4px;">
          <strong>Recomendación Pericial de Auditoría:</strong> ${h.recomendacion}
        </p>
        <p><strong>Conclusión del Dictamen:</strong> ${h.conclusion}</p>
      </div>
    `).join('');

    const evidenciasHtml = (result.evidenciasGeneradas || []).map(e => `
      <tr style="background-color: #f8fafc;">
        <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold;">${e.fuente}</td>
        <td style="padding: 6px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 10px; word-break: break-all;">${e.sha256}</td>
        <td style="padding: 6px; border: 1px solid #cbd5e1;">${e.extracto}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Informe Pericial de Cruce con Órganos Rectores</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; color: #1e293b; line-height: 1.5; margin: 40px; }
          h1 { color: #0f172a; text-transform: uppercase; font-size: 20pt; border-bottom: 2px solid #0284c7; padding-bottom: 6px; }
          h2 { color: #0369a1; font-size: 14pt; margin-top: 24px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 16px; font-size: 10pt; }
          th { background-color: #0f172a; color: #ffffff; padding: 10px; text-align: left; border: 1px solid #0f172a; }
          .header-box { background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 16px; border-radius: 6px; margin-bottom: 24px; }
          .sign-box { margin-top: 60px; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div style="text-align: center; margin-bottom: 25px;">
          <h3 style="margin: 0; color: #64748b; font-size: 12pt;">REPÚBLICA DOMINICANA</h3>
          <h2 style="margin: 4px 0; color: #0f172a; font-size: 16pt;">SISTEMA NACIONAL DE CONTROL Y AUDITORÍA GUBERNAMENTAL</h2>
          <div style="font-size: 10pt; color: #64748b;">DICTAMEN PERICIAL FORENSE DE CRUCE INTERINSTITUCIONAL</div>
        </div>

        <div class="header-box">
          <p style="margin: 4px 0;"><strong>Entidad Auditada:</strong> ${result.entidadAuditada}</p>
          <p style="margin: 4px 0;"><strong>Módulo de Fiscalización:</strong> ${result.modulo}</p>
          <p style="margin: 4px 0;"><strong>Órganos Rectores Contrastados:</strong> ${result.organosConsultados.join(' · ')}</p>
          <p style="margin: 4px 0;"><strong>Índice de Conformidad Legal Estimado:</strong> ${result.puntuacionConformidad} / 100</p>
          <p style="margin: 4px 0;"><strong>Fecha del Examen Pericial:</strong> ${nowFormatted}</p>
        </div>

        <h1>1. Resumen Ejecutivo del Cruce Pericial</h1>
        <p style="text-align: justify; font-size: 11pt;">${result.resumenCruce}</p>

        <h1>2. Matriz de Inconsistencias y Discrepancias Detectadas</h1>
        <p style="font-size: 10pt; color: #64748b;">
          Cotejo pericial de registros publicados por la entidad frente a las bases de datos de los órganos rectores del Estado.
        </p>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Proceso / Item</th>
              <th>Entidad Auditada</th>
              <th>Órgano Rector</th>
              <th>Rector</th>
              <th>Severidad</th>
              <th>Impacto Económico</th>
            </tr>
          </thead>
          <tbody>
            ${rowsDiscrepanciasHtml}
          </tbody>
        </table>

        <h1>3. Hallazgos Periciales Estructurados (Norma Ley 10-04)</h1>
        ${hallazgosHtml}

        <h1>4. Cadena de Custodia de Evidencias Digitales</h1>
        <p style="font-size: 10pt; color: #64748b;">
          Registros capturados con sellado de tiempo y cálculo criptográfico SHA-256 para validez probatoria.
        </p>
        <table>
          <thead>
            <tr>
              <th style="width: 25%;">Fuente Consultada</th>
              <th style="width: 35%;">Hash Criptográfico SHA-256</th>
              <th style="width: 40%;">Registro Verificado</th>
            </tr>
          </thead>
          <tbody>
            ${evidenciasHtml}
          </tbody>
        </table>

        <div style="margin-top: 80px; page-break-inside: avoid;">
          <table style="border: none;">
            <tr style="border: none;">
              <td style="border: none; text-align: center; width: 50%;">
                __________________________________________<br/>
                <strong>Auditor Pericial Forense</strong><br/>
                Equipo de Auditoría e Integridad Pública
              </td>
              <td style="border: none; text-align: center; width: 50%;">
                __________________________________________<br/>
                <strong>Supervisor Técnico de Fiscalización</strong><br/>
                Cámara de Cuentas / Contraloría
              </td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Informe_Cruce_${result.modulo}_${cleanName}_${new Date().toISOString().slice(0, 10)}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
