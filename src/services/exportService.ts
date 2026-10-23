import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { DatabaseState, Expediente } from '../types';

export const exportService = {
  exportToExcel(data: DatabaseState, expediente?: Expediente | null) {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Resumen
    const resumenData = [
      ['AUDIT INTELLIGENCE PRO - INFORME EJECUTIVO DE FISCALIZACIÓN'],
      ['Fecha de Generación', new Date().toLocaleString()],
      ['Expediente Activo', expediente ? `${expediente.codigo} - ${expediente.nombre}` : 'Todos los expedientes'],
      ['Entidad Auditada', expediente ? expediente.entidad : 'Múltiples entidades'],
      ['Responsable', expediente ? expediente.responsable : 'Equipo de Auditoría'],
      ['Período Auditado', expediente ? expediente.periodo : 'General'],
      [],
      ['MÉTRICAS CLAVE'],
      ['Total Hallazgos', data.hallazgos.length],
      ['Total Riesgos Evaluados', data.riesgos.length],
      ['Total Proveedores Registrados', data.proveedores.length],
      ['Total Contratos Fiscalizados', data.contratos.length],
      ['Total Pagos Auditados', data.pagos.length],
      ['Monto Total Observado en Hallazgos', data.hallazgos.reduce((acc, h) => acc + (h.montoObservado || 0), 0)],
    ];
    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen Ejecutivo');

    // Sheet 2: Hallazgos
    const hallazgosRows = data.hallazgos.map(h => ({
      ID: h.id,
      Título: h.titulo,
      Nivel: h.nivel,
      Estado: h.estado,
      'Monto Observado (RD$)': h.montoObservado || 0,
      'Condición (Lo que es)': h.condicion,
      'Criterio (Norma/Ley)': h.criterio,
      Causa: h.causa,
      'Efecto / Daño': h.efecto,
      Recomendación: h.recomendacion,
      Conclusión: h.conclusion || '',
      'Normativa Referencia': h.normativaReferencia || '',
      'Fecha Registro': h.createdAt,
    }));
    const wsHallazgos = XLSX.utils.json_to_sheet(hallazgosRows);
    XLSX.utils.book_append_sheet(wb, wsHallazgos, 'Hallazgos');

    // Sheet 3: Riesgos
    const riesgosRows = data.riesgos.map(r => ({
      ID: r.id,
      Categoría: r.categoria,
      Descripción: r.descripcion,
      'Probabilidad (1-5)': r.probabilidad,
      'Impacto (1-5)': r.impacto,
      'Puntuación (1-25)': r.puntuacion,
      Nivel: r.nivel,
      'Plan Mitigación': r.mitigacion,
      Estado: r.estado,
      Fecha: r.createdAt,
    }));
    const wsRiesgos = XLSX.utils.json_to_sheet(riesgosRows);
    XLSX.utils.book_append_sheet(wb, wsRiesgos, 'Matriz de Riesgos');

    // Sheet 4: Contratos
    const contratosRows = data.contratos.map(c => {
      const prov = data.proveedores.find(p => p.id === c.proveedorId);
      return {
        'Número Contrato': c.numero,
        Proveedor: prov ? prov.nombre : 'S/P',
        'RNC Proveedor': prov ? prov.rnc : '',
        Objeto: c.objeto,
        'Monto Adjudicado (RD$)': c.monto,
        Modalidad: c.modalidad,
        'Fecha Inicio': c.fechaInicio,
        'Fecha Fin': c.fechaFin,
        Estado: c.estado,
      };
    });
    const wsContratos = XLSX.utils.json_to_sheet(contratosRows);
    XLSX.utils.book_append_sheet(wb, wsContratos, 'Contratos');

    // Sheet 5: Pagos
    const pagosRows = data.pagos.map(p => ({
      ID: p.id,
      Beneficiario: p.beneficiario,
      RNC: p.rncBeneficiario || '',
      'Referencia / Cheque': p.referencia,
      NCF: p.ncf || '',
      'Monto (RD$)': p.monto,
      Fecha: p.fecha,
      Descripción: p.descripcion,
      'Alerta Duplicado': p.alertaDuplicado ? 'SÍ (REVISAR)' : 'NO',
    }));
    const wsPagos = XLSX.utils.json_to_sheet(pagosRows);
    XLSX.utils.book_append_sheet(wb, wsPagos, 'Pagos Auditados');

    const fileName = `Auditoria_${expediente ? expediente.codigo : 'Consolidado'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  },

  exportToWord(data: DatabaseState, expediente?: Expediente | null) {
    const totalObs = data.hallazgos.reduce((acc, h) => acc + (h.montoObservado || 0), 0);
    const htmlContent = `
      <!DOCTYPE html>
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Informe Oficial de Auditoría</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; line-height: 1.5; color: #1e293b; padding: 40px; }
          .header { text-align: center; border-bottom: 3px double #0f172a; padding-bottom: 20px; margin-bottom: 30px; }
          .logo-text { font-size: 20pt; font-weight: bold; color: #0f172a; letter-spacing: 1px; }
          .sub-logo { font-size: 11pt; color: #475569; text-transform: uppercase; margin-top: 5px; }
          .report-title { font-size: 16pt; font-weight: bold; color: #1e3a8a; margin-top: 25px; text-align: center; text-transform: uppercase; }
          .dossier-box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .dossier-box table { width: 100%; border-collapse: collapse; }
          .dossier-box td { padding: 6px; font-size: 10.5pt; }
          .label { font-weight: bold; color: #334155; width: 25%; }
          h2 { font-size: 13pt; color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 4px; margin-top: 30px; }
          .finding-card { border: 1px solid #94a3b8; margin-bottom: 25px; page-break-inside: avoid; }
          .finding-header { background: #0f172a; color: #ffffff; padding: 10px 15px; font-weight: bold; font-size: 11pt; }
          .finding-body { padding: 15px; }
          .finding-section { margin-bottom: 12px; }
          .sec-title { font-weight: bold; color: #1e3a8a; font-size: 10pt; text-transform: uppercase; }
          .sec-content { margin-top: 3px; font-size: 10pt; text-align: justify; }
          .badge-critical { background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 3px; font-weight: bold; font-size: 9pt; }
          .badge-high { background: #ffedd5; color: #9a3412; padding: 2px 8px; border-radius: 3px; font-weight: bold; font-size: 9pt; }
          .badge-med { background: #fef9c3; color: #854d0e; padding: 2px 8px; border-radius: 3px; font-weight: bold; font-size: 9pt; }
          .badge-low { background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 3px; font-weight: bold; font-size: 9pt; }
          table.data-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          table.data-table th, table.data-table td { border: 1px solid #cbd5e1; padding: 8px; font-size: 9.5pt; text-align: left; }
          table.data-table th { background: #f1f5f9; font-weight: bold; }
          .signatures { margin-top: 60px; display: table; width: 100%; }
          .sig-block { display: table-cell; width: 50%; text-align: center; padding: 20px; }
          .sig-line { border-top: 1px solid #000; width: 80%; margin: 0 auto 5px auto; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-text">SISTEMA INTEGRAL DE AUDITORÍA Y CONTROL FORENSE</div>
          <div class="sub-logo">CÁMARA DE CUENTAS / CONTRALORÍA GENERAL · AUDIT INTELLIGENCE PRO</div>
          <div class="report-title">INFORME DEFINITIVO DE AUDITORÍA ESPECIAL</div>
        </div>

        <div class="dossier-box">
          <table>
            <tr>
              <td class="label">Código de Auditoría:</td>
              <td>${expediente ? expediente.codigo : 'AUD-CONSOLIDADO'}</td>
              <td class="label">Fecha de Emisión:</td>
              <td>${new Date().toLocaleDateString()}</td>
            </tr>
            <tr>
              <td class="label">Entidad Fiscalizada:</td>
              <td colspan="3">${expediente ? expediente.entidad : 'Multi-institucional'}</td>
            </tr>
            <tr>
              <td class="label">Objeto del Examen:</td>
              <td colspan="3">${expediente ? expediente.objetivo : 'Auditoría integral a contrataciones, ejecución presupuestaria y legalidad'}</td>
            </tr>
            <tr>
              <td class="label">Auditor Responsable:</td>
              <td>${expediente ? expediente.responsable : 'Comisión de Auditoría'}</td>
              <td class="label">Monto Observado:</td>
              <td><strong>RD$ ${totalObs.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</strong></td>
            </tr>
          </table>
        </div>

        <h2>I. RESUMEN EJECUTIVO Y ANTECEDENTES</h2>
        <p style="text-align: justify; font-size: 10pt;">
          El presente informe expone los resultados de la auditoría gubernamental practicada en observancia de las Normas Internacionales de Entidades Fiscalizadoras Superiores (ISSAI/INTOSAI), la Ley No. 10-04, la Ley No. 340-06 de Compras y Contrataciones Públicas, el Decreto Reglamentario No. 543-12 y las Normas Básicas de Control Interno (NOBACI).
        </p>

        <h2>II. HALLAZGOS DE AUDITORÍA CONSTITUIDOS</h2>
        ${data.hallazgos.map((h, i) => `
          <div class="finding-card">
            <div class="finding-header">
              HALLAZGO NO. ${i + 1}: ${h.titulo.toUpperCase()}
            </div>
            <div class="finding-body">
              <div style="margin-bottom: 10px;">
                <strong>Nivel de Severidad:</strong> <span class="${h.nivel === 'Crítico' ? 'badge-critical' : h.nivel === 'Alto' ? 'badge-high' : 'badge-med'}">${h.nivel}</span>
                &nbsp;|&nbsp; <strong>Monto Observado:</strong> RD$ ${(h.montoObservado || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                &nbsp;|&nbsp; <strong>Estado:</strong> ${h.estado}
              </div>

              <div class="finding-section">
                <div class="sec-title">1. CONDICIÓN (Lo que es - Situación constatada):</div>
                <div class="sec-content">${h.condicion}</div>
              </div>

              <div class="finding-section">
                <div class="sec-title">2. CRITERIO LEGAL (Lo que debió ser - Normativa infringida):</div>
                <div class="sec-content">${h.criterio}</div>
              </div>

              <div class="finding-section">
                <div class="sec-title">3. CAUSA (Origen o motivo de la desviación):</div>
                <div class="sec-content">${h.causa}</div>
              </div>

              <div class="finding-section">
                <div class="sec-title">4. EFECTO / DAÑO PATRIMONIAL:</div>
                <div class="sec-content">${h.efecto}</div>
              </div>

              <div class="finding-section">
                <div class="sec-title">5. RECOMENDACIÓN OBLIGATORIA:</div>
                <div class="sec-content">${h.recomendacion}</div>
              </div>

              ${h.conclusion ? `
              <div class="finding-section">
                <div class="sec-title">6. CONCLUSIÓN DEL EQUIPO AUDITOR:</div>
                <div class="sec-content">${h.conclusion}</div>
              </div>` : ''}
            </div>
          </div>
        `).join('')}

        <h2>III. MATRIZ DE RIESGOS ASOCIADOS</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Categoría</th>
              <th>Descripción del Riesgo</th>
              <th>Puntuación</th>
              <th>Nivel</th>
              <th>Plan de Mitigación</th>
            </tr>
          </thead>
          <tbody>
            ${data.riesgos.map(r => `
              <tr>
                <td>${r.id}</td>
                <td>${r.categoria}</td>
                <td>${r.descripcion}</td>
                <td>${r.puntuacion}/25</td>
                <td><strong>${r.nivel}</strong></td>
                <td>${r.mitigacion}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="signatures">
          <div class="sig-block">
            <div class="sig-line"></div>
            <strong>Auditor Encargado</strong><br>
            Firma y Sello Oficial
          </div>
          <div class="sig-block">
            <div class="sig-line"></div>
            <strong>Supervisor de Auditoría</strong><br>
            Dirección de Fiscalización
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Informe_Auditoria_${expediente ? expediente.codigo : 'General'}_${new Date().toISOString().slice(0, 10)}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  async exportFullZip(data: DatabaseState, expediente?: Expediente | null) {
    const zip = new JSZip();
    const folderName = `Expediente_${expediente ? expediente.codigo : 'Auditoria_General'}`;
    const root = zip.folder(folderName) || zip;

    // 1. Hallazgos CSV
    const hallazgosCsv = [
      ['ID', 'Titulo', 'Nivel', 'Estado', 'MontoObservado', 'Condicion', 'Criterio', 'Causa', 'Efecto', 'Recomendacion', 'Conclusion'],
      ...data.hallazgos.map(h => [
        h.id,
        `"${h.titulo.replace(/"/g, '""')}"`,
        h.nivel,
        h.estado,
        h.montoObservado || 0,
        `"${h.condicion.replace(/"/g, '""')}"`,
        `"${h.criterio.replace(/"/g, '""')}"`,
        `"${h.causa.replace(/"/g, '""')}"`,
        `"${h.efecto.replace(/"/g, '""')}"`,
        `"${h.recomendacion.replace(/"/g, '""')}"`,
        `"${(h.conclusion || '').replace(/"/g, '""')}"`,
      ])
    ].map(row => row.join(',')).join('\n');
    root.file('01_Hallazgos_Oficiales.csv', '\ufeff' + hallazgosCsv);

    // 2. Riesgos CSV
    const riesgosCsv = [
      ['ID', 'Categoria', 'Descripcion', 'Probabilidad', 'Impacto', 'Puntuacion', 'Nivel', 'Mitigacion'],
      ...data.riesgos.map(r => [
        r.id,
        r.categoria,
        `"${r.descripcion.replace(/"/g, '""')}"`,
        r.probabilidad,
        r.impacto,
        r.puntuacion,
        r.nivel,
        `"${r.mitigacion.replace(/"/g, '""')}"`,
      ])
    ].map(row => row.join(',')).join('\n');
    root.file('02_Matriz_Riesgos.csv', '\ufeff' + riesgosCsv);

    // 3. Proveedores y Contratos CSV
    const provCsv = [
      ['ID', 'Nombre', 'RNC', 'Contacto', 'Rubro', 'Estado'],
      ...data.proveedores.map(p => [
        p.id,
        `"${p.nombre.replace(/"/g, '""')}"`,
        p.rnc,
        `"${p.contacto.replace(/"/g, '""')}"`,
        `"${p.rubro.replace(/"/g, '""')}"`,
        p.estado,
      ])
    ].map(row => row.join(',')).join('\n');
    root.file('03_Proveedores_Fiscalizados.csv', '\ufeff' + provCsv);

    // 4. Pagos CSV
    const pagosCsv = [
      ['ID', 'Beneficiario', 'RNC', 'Referencia', 'NCF', 'Monto', 'Fecha', 'Descripcion', 'AlertaDuplicado'],
      ...data.pagos.map(p => [
        p.id,
        `"${p.beneficiario.replace(/"/g, '""')}"`,
        p.rncBeneficiario || '',
        `"${p.referencia.replace(/"/g, '""')}"`,
        p.ncf || '',
        p.monto,
        p.fecha,
        `"${p.descripcion.replace(/"/g, '""')}"`,
        p.alertaDuplicado ? 'SÍ' : 'NO',
      ])
    ].map(row => row.join(',')).join('\n');
    root.file('04_Registro_Pagos_Conciliados.csv', '\ufeff' + pagosCsv);

    // 5. Informe Ejecutivo en Texto Plano estructurado
    const totalObs = data.hallazgos.reduce((acc, h) => acc + (h.montoObservado || 0), 0);
    const summaryText = `======================================================================
AUDIT INTELLIGENCE PRO - EXPEDIENTE CONSOLIDADO DE AUDITORÍA
======================================================================
Fecha de Emisión: ${new Date().toISOString()}
Expediente: ${expediente ? `${expediente.codigo} - ${expediente.nombre}` : 'Consolidado General'}
Entidad: ${expediente ? expediente.entidad : 'Multi-entidad'}
Responsable: ${expediente ? expediente.responsable : 'Comisión Auditora'}
Total Hallazgos: ${data.hallazgos.length}
Monto Total Observado: RD$ ${totalObs.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
Total Riesgos: ${data.riesgos.length} (Críticos: ${data.riesgos.filter(r => r.nivel === 'Crítico').length})
Total Pagos Auditados: ${data.pagos.length}

BASE NORMATIVA APLICADA:
- Ley No. 340-06 sobre Compras y Contrataciones Públicas
- Decreto No. 543-12 (Reglamento de aplicación)
- Ley No. 10-04 de la Cámara de Cuentas
- Ley No. 41-08 de Función Pública
- Normas Básicas de Control Interno (NOBACI)
- Normas Internacionales ISSAI / INTOSAI

======================================================================
RESUMEN DE HALLAZGOS PRINCIPALES:
======================================================================
${data.hallazgos.map((h, i) => `
[${i + 1}] ${h.titulo}
Severidad: ${h.nivel} | Estado: ${h.estado} | Monto: RD$ ${(h.montoObservado || 0).toLocaleString()}
Condición: ${h.condicion}
Criterio: ${h.criterio}
Causa: ${h.causa}
Efecto: ${h.efecto}
Recomendación: ${h.recomendacion}
Normativa Ref: ${h.normativaReferencia || 'Ley 340-06 / Dec. 543-12'}
----------------------------------------------------------------------
`).join('\n')}
`;
    root.file('00_Informe_Ejecutivo_Auditoria.txt', summaryText);

    // 6. Metadata JSON
    root.file('metadatos_expediente.json', JSON.stringify({
      version: '2.5.0-Enterprise',
      generadoEl: new Date().toISOString(),
      expediente,
      metricas: {
        totalHallazgos: data.hallazgos.length,
        montoTotalObservado: totalObs,
        totalRiesgos: data.riesgos.length,
        totalContratos: data.contratos.length,
        totalPagos: data.pagos.length,
      }
    }, null, 2));

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Expediente_Completo_${expediente ? expediente.codigo : 'Consolidado'}_${new Date().toISOString().slice(0, 10)}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
