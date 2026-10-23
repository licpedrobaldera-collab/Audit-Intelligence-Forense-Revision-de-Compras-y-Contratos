import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  Building2,
  Receipt,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { DatabaseState } from '../types';

interface MatrixEngineViewProps {
  data: DatabaseState;
  selectedExpedienteId: number | null;
}

type MatrixType = 'riesgos' | 'hallazgos' | 'evidencias' | 'contratos' | 'pagos';

export const MatrixEngineView: React.FC<MatrixEngineViewProps> = ({
  data,
  selectedExpedienteId,
}) => {
  const [activeMatrix, setActiveMatrix] = useState<MatrixType>('riesgos');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExpedienteOnly, setFilterExpedienteOnly] = useState(false);

  const activeExp = data.expedientes.find(e => e.id === selectedExpedienteId) || null;

  // 1. Matriz de Riesgos
  const rawRiesgos = (filterExpedienteOnly && selectedExpedienteId)
    ? data.riesgos.filter(r => r.expedienteId === selectedExpedienteId)
    : data.riesgos;

  const filteredRiesgos = rawRiesgos.filter(r =>
    r.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.mitigacion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. Matriz de Hallazgos
  const rawHallazgos = (filterExpedienteOnly && selectedExpedienteId)
    ? data.hallazgos.filter(h => h.expedienteId === selectedExpedienteId)
    : data.hallazgos;

  const filteredHallazgos = rawHallazgos.filter(h =>
    h.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.condicion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.criterio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (h.normativaReferencia || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3. Matriz de Evidencias
  const rawEvidencias = (filterExpedienteOnly && selectedExpedienteId)
    ? data.evidencias.filter(e => e.expedienteId === selectedExpedienteId)
    : data.evidencias;

  const filteredEvidencias = rawEvidencias.filter(e =>
    e.nombreOriginal.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.sha256.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 4. Matriz de Contratos
  const filteredContratos = data.contratos.filter(c =>
    c.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.objeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.modalidad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 5. Matriz de Pagos
  const filteredPagos = data.pagos.filter(p =>
    p.beneficiario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.referencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.ncf || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper for Exporting single sheet or entire workbook
  const exportActiveMatrixToExcel = () => {
    const wb = XLSX.utils.book_new();

    if (activeMatrix === 'riesgos') {
      const rows = filteredRiesgos.map(r => ({
        ID: r.id,
        Expediente: data.expedientes.find(e => e.id === r.expedienteId)?.codigo || 'General',
        Categoría: r.categoria,
        Descripción: r.descripcion,
        Probabilidad: r.probabilidad,
        Impacto: r.impacto,
        Puntuación: r.puntuacion,
        Nivel: r.nivel,
        Mitigación: r.mitigacion,
        Estado: r.estado,
        'Flujo Workflow': r.workflowStatus || 'BORRADOR',
        'Fecha Registro': r.createdAt,
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Matriz_Riesgos');
      XLSX.writeFile(wb, `Matriz_Riesgos_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } else if (activeMatrix === 'hallazgos') {
      const rows = filteredHallazgos.map(h => ({
        ID: h.id,
        Expediente: data.expedientes.find(e => e.id === h.expedienteId)?.codigo || 'General',
        Título: h.titulo,
        Condición: h.condicion,
        Criterio: h.criterio,
        Causa: h.causa,
        Efecto: h.efecto,
        'Monto Observado': h.montoObservado || 0,
        Nivel: h.nivel,
        Recomendación: h.recomendacion,
        'Normativa Referencia': h.normativaReferencia || '',
        'Workflow Status': h.workflowStatus || 'BORRADOR',
        'Página / Artículo': `${h.pagina || ''} - ${h.articulo || ''}`,
        'Fuente Externa': h.fuenteExterna || '',
        'Fecha Validación': h.fechaValidacion || '',
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Matriz_Hallazgos');
      XLSX.writeFile(wb, `Matriz_Hallazgos_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } else if (activeMatrix === 'evidencias') {
      const rows = filteredEvidencias.map(e => ({
        ID: e.id,
        Expediente: data.expedientes.find(exp => exp.id === e.expedienteId)?.codigo || 'General',
        'Archivo Original': e.nombreOriginal,
        'Hash SHA-256': e.sha256,
        Clasificación: e.clasificacion,
        'Versión Actual': e.versionActual,
        Tipo: e.tipo,
        'Tamaño (KB)': Math.round(e.tamano / 1024),
        'RNC Extraídos': (e.metadatos?.rnc || []).join(', '),
        'NCF Extraídos': (e.metadatos?.ncf || []).join(', '),
        'Subido Por': e.subidoPor,
        'Fecha Custodia': e.createdAt,
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Matriz_Evidencias');
      XLSX.writeFile(wb, `Matriz_Evidencias_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } else if (activeMatrix === 'contratos') {
      const rows = filteredContratos.map(c => ({
        ID: c.id,
        'Número Contrato': c.numero,
        Proveedor: data.proveedores.find(p => p.id === c.proveedorId)?.nombre || 'N/A',
        'Objeto Contractual': c.objeto,
        Modalidad: c.modalidad,
        Monto: c.monto,
        'Fecha Inicio': c.fechaInicio,
        'Fecha Fin': c.fechaFin,
        Estado: c.estado,
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Matriz_Contratos');
      XLSX.writeFile(wb, `Matriz_Contratos_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } else if (activeMatrix === 'pagos') {
      const rows = filteredPagos.map(p => ({
        ID: p.id,
        Beneficiario: p.beneficiario,
        'RNC / Cédula': p.rncBeneficiario || '',
        'NCF Comprobante': p.ncf || '',
        Referencia: p.referencia,
        Monto: p.monto,
        Fecha: p.fecha,
        Descripción: p.descripcion,
        'Alerta Duplicado': p.alertaDuplicado ? 'SÍ - RIESGO DE SOBREPAGO' : 'NO',
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Matriz_Pagos');
      XLSX.writeFile(wb, `Matriz_Pagos_${new Date().toISOString().slice(0, 10)}.xlsx`);
    }
  };

  const exportFullWorkbook = () => {
    const wb = XLSX.utils.book_new();

    // 1. Riesgos
    const rowsRiesgos = rawRiesgos.map(r => ({
      ID: r.id,
      Expediente: data.expedientes.find(e => e.id === r.expedienteId)?.codigo || 'General',
      Categoría: r.categoria,
      Descripción: r.descripcion,
      Probabilidad: r.probabilidad,
      Impacto: r.impacto,
      Puntuación: r.puntuacion,
      Nivel: r.nivel,
      Mitigación: r.mitigacion,
      Estado: r.estado,
      Workflow: r.workflowStatus || 'BORRADOR',
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rowsRiesgos), '1_Matriz_Riesgos');

    // 2. Hallazgos
    const rowsHallazgos = rawHallazgos.map(h => ({
      ID: h.id,
      Expediente: data.expedientes.find(e => e.id === h.expedienteId)?.codigo || 'General',
      Título: h.titulo,
      Condición: h.condicion,
      Criterio: h.criterio,
      Causa: h.causa,
      Efecto: h.efecto,
      'Monto Observado': h.montoObservado || 0,
      Nivel: h.nivel,
      Recomendación: h.recomendacion,
      'Normativa Aplicable': h.normativaReferencia || '',
      'Workflow Status': h.workflowStatus || 'BORRADOR',
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rowsHallazgos), '2_Matriz_Hallazgos');

    // 3. Evidencias
    const rowsEvidencias = rawEvidencias.map(e => ({
      ID: e.id,
      Archivo: e.nombreOriginal,
      SHA256: e.sha256,
      Clasificación: e.clasificacion,
      Versión: e.versionActual,
      Tipo: e.tipo,
      'Tamaño (KB)': Math.round(e.tamano / 1024),
      'Fecha Custodia': e.createdAt,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rowsEvidencias), '3_Matriz_Evidencias');

    // 4. Contratos
    const rowsContratos = data.contratos.map(c => ({
      ID: c.id,
      Número: c.numero,
      Proveedor: data.proveedores.find(p => p.id === c.proveedorId)?.nombre || 'N/A',
      Objeto: c.objeto,
      Modalidad: c.modalidad,
      Monto: c.monto,
      Vigencia: `${c.fechaInicio} a ${c.fechaFin}`,
      Estado: c.estado,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rowsContratos), '4_Matriz_Contratos');

    // 5. Pagos
    const rowsPagos = data.pagos.map(p => ({
      ID: p.id,
      Beneficiario: p.beneficiario,
      RNC: p.rncBeneficiario || '',
      NCF: p.ncf || '',
      Referencia: p.referencia,
      Monto: p.monto,
      Fecha: p.fecha,
      'Alerta Duplicado': p.alertaDuplicado ? 'DUPLICADO' : 'OK',
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rowsPagos), '5_Matriz_Pagos');

    XLSX.writeFile(wb, `Auditoria_Integral_5_Matrices_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const formatCurrency = (val: number) => {
    const curr = data.settings?.currency || 'DOP';
    return `${curr} $${val.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            Motor Pericial de Matrices de Auditoría (Matrix Engine)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generación automatizada de las 5 matrices técnicas con trazabilidad pericial y exportación multi-hoja a Microsoft Excel (.xlsx).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportActiveMatrixToExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar Matriz ({activeMatrix})</span>
          </button>

          <button
            onClick={exportFullWorkbook}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Libro 5 Matrices (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveMatrix('riesgos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition shrink-0 ${
            activeMatrix === 'riesgos'
              ? 'bg-slate-900 text-red-400 border-t-2 border-red-500 border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          <span>1. Matriz de Riesgos ({rawRiesgos.length})</span>
        </button>

        <button
          onClick={() => setActiveMatrix('hallazgos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition shrink-0 ${
            activeMatrix === 'hallazgos'
              ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-500 border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>2. Matriz de Hallazgos ({rawHallazgos.length})</span>
        </button>

        <button
          onClick={() => setActiveMatrix('evidencias')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition shrink-0 ${
            activeMatrix === 'evidencias'
              ? 'bg-slate-900 text-indigo-400 border-t-2 border-indigo-500 border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>3. Matriz de Evidencias ({rawEvidencias.length})</span>
        </button>

        <button
          onClick={() => setActiveMatrix('contratos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition shrink-0 ${
            activeMatrix === 'contratos'
              ? 'bg-slate-900 text-blue-400 border-t-2 border-blue-500 border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>4. Matriz de Contratos ({data.contratos.length})</span>
        </button>

        <button
          onClick={() => setActiveMatrix('pagos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition shrink-0 ${
            activeMatrix === 'pagos'
              ? 'bg-slate-900 text-emerald-400 border-t-2 border-emerald-500 border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>5. Matriz de Pagos ({data.pagos.length})</span>
        </button>
      </div>

      {/* Filter and search toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Buscar en Matriz de ${activeMatrix}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {selectedExpedienteId && (
          <label className="flex items-center gap-2 text-xs text-slate-300 font-medium cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={filterExpedienteOnly}
              onChange={(e) => setFilterExpedienteOnly(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
            />
            <span>Filtrar solo expediente activo ({activeExp?.codigo || `#${selectedExpedienteId}`})</span>
          </label>
        )}
      </div>

      {/* Matrix Table Display */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {activeMatrix === 'riesgos' && (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700/80">
                <tr>
                  <th className="p-3">Categoría</th>
                  <th className="p-3">Descripción de Vulnerabilidad</th>
                  <th className="p-3 text-center">Prob.</th>
                  <th className="p-3 text-center">Imp.</th>
                  <th className="p-3 text-center">Score</th>
                  <th className="p-3">Nivel Riesgo</th>
                  <th className="p-3">Estrategia Mitigación</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Workflow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {filteredRiesgos.length === 0 ? (
                  <tr><td colSpan={9} className="p-8 text-center text-slate-500 font-sans">No hay riesgos en esta vista</td></tr>
                ) : (
                  filteredRiesgos.map(r => (
                    <tr key={r.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-100 font-sans">{r.categoria}</td>
                      <td className="p-3 max-w-sm font-sans">{r.descripcion}</td>
                      <td className="p-3 text-center text-slate-400">{r.probabilidad}</td>
                      <td className="p-3 text-center text-slate-400">{r.impacto}</td>
                      <td className="p-3 text-center font-bold text-amber-400">{r.puntuacion}</td>
                      <td className="p-3 font-sans">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.nivel === 'Crítico' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                          r.nivel === 'Alto' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                          r.nivel === 'Medio' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {r.nivel}
                        </span>
                      </td>
                      <td className="p-3 font-sans text-xs text-slate-400 max-w-xs">{r.mitigacion}</td>
                      <td className="p-3 font-sans text-slate-300">{r.estado}</td>
                      <td className="p-3 font-sans text-xs text-sky-400">{r.workflowStatus || 'BORRADOR'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeMatrix === 'hallazgos' && (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700/80">
                <tr>
                  <th className="p-3">Título Hallazgo</th>
                  <th className="p-3">Condición Detectada</th>
                  <th className="p-3">Criterio / Norma</th>
                  <th className="p-3 text-right">Monto Obs.</th>
                  <th className="p-3 text-center">Nivel</th>
                  <th className="p-3">Workflow</th>
                  <th className="p-3">Recomendación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {filteredHallazgos.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-500 font-sans">No hay hallazgos en esta vista</td></tr>
                ) : (
                  filteredHallazgos.map(h => (
                    <tr key={h.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-slate-100 font-sans">{h.titulo}</td>
                      <td className="p-3 max-w-xs font-sans text-xs text-slate-400 line-clamp-2">{h.condicion}</td>
                      <td className="p-3 font-sans text-xs text-blue-400 max-w-xs">{h.normativaReferencia || h.criterio}</td>
                      <td className="p-3 text-right text-emerald-400 font-bold">{h.montoObservado ? formatCurrency(h.montoObservado) : '—'}</td>
                      <td className="p-3 text-center font-sans">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          h.nivel === 'Crítico' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                          h.nivel === 'Alto' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {h.nivel}
                        </span>
                      </td>
                      <td className="p-3 font-sans text-xs text-purple-400">{h.workflowStatus || 'BORRADOR'}</td>
                      <td className="p-3 font-sans text-xs text-slate-400 max-w-xs line-clamp-2">{h.recomendacion}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeMatrix === 'evidencias' && (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700/80">
                <tr>
                  <th className="p-3">Nombre Archivo</th>
                  <th className="p-3">Hash SHA-256</th>
                  <th className="p-3">Clasificación Pericial</th>
                  <th className="p-3 text-center">Versión</th>
                  <th className="p-3">Tipo MIME</th>
                  <th className="p-3 text-right">Tamaño</th>
                  <th className="p-3">Fecha Custodia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {filteredEvidencias.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-500 font-sans">No hay evidencias registradas</td></tr>
                ) : (
                  filteredEvidencias.map(e => (
                    <tr key={e.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-slate-100 font-sans">{e.nombreOriginal}</td>
                      <td className="p-3 text-[11px] text-slate-400 truncate max-w-[200px]" title={e.sha256}>{e.sha256}</td>
                      <td className="p-3 font-sans">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          e.clasificacion === 'Aprobado' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                          e.clasificacion === 'Verificado' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' :
                          'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}>
                          {e.clasificacion}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-slate-300">v{e.versionActual || 1}</td>
                      <td className="p-3 text-xs text-slate-400 font-sans">{e.tipo}</td>
                      <td className="p-3 text-right text-slate-400">{Math.round(e.tamano / 1024)} KB</td>
                      <td className="p-3 text-slate-400">{e.createdAt.slice(0, 10)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeMatrix === 'contratos' && (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700/80">
                <tr>
                  <th className="p-3">Número</th>
                  <th className="p-3">Proveedor Adjudicado</th>
                  <th className="p-3">Objeto de Contratación</th>
                  <th className="p-3">Modalidad</th>
                  <th className="p-3 text-right">Monto Contratado</th>
                  <th className="p-3">Vigencia</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {filteredContratos.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-500 font-sans">No hay contratos registrados</td></tr>
                ) : (
                  filteredContratos.map(c => (
                    <tr key={c.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-slate-100 font-sans">{c.numero}</td>
                      <td className="p-3 font-sans text-slate-300">
                        {data.proveedores.find(p => p.id === c.proveedorId)?.nombre || 'N/A'}
                      </td>
                      <td className="p-3 font-sans text-xs max-w-sm">{c.objeto}</td>
                      <td className="p-3 font-sans text-xs text-slate-400">{c.modalidad}</td>
                      <td className="p-3 text-right text-emerald-400 font-bold">{formatCurrency(c.monto)}</td>
                      <td className="p-3 text-slate-400 text-xs">{c.fechaInicio} a {c.fechaFin}</td>
                      <td className="p-3 font-sans">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                          {c.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeMatrix === 'pagos' && (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700/80">
                <tr>
                  <th className="p-3">Beneficiario</th>
                  <th className="p-3">RNC / Cédula</th>
                  <th className="p-3">NCF / Comprobante</th>
                  <th className="p-3">Referencia</th>
                  <th className="p-3 text-right">Monto Desembolsado</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Alerta Pericial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {filteredPagos.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-500 font-sans">No hay pagos registrados</td></tr>
                ) : (
                  filteredPagos.map(p => (
                    <tr key={p.id} className={`hover:bg-slate-800/40 ${p.alertaDuplicado ? 'bg-red-950/20' : ''}`}>
                      <td className="p-3 font-bold text-slate-100 font-sans">{p.beneficiario}</td>
                      <td className="p-3 text-slate-400">{p.rncBeneficiario || '—'}</td>
                      <td className="p-3 text-blue-400">{p.ncf || '—'}</td>
                      <td className="p-3 text-slate-400">{p.referencia}</td>
                      <td className="p-3 text-right text-emerald-400 font-bold">{formatCurrency(p.monto)}</td>
                      <td className="p-3 text-slate-400">{p.fecha}</td>
                      <td className="p-3 font-sans">
                        {p.alertaDuplicado ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" />
                            Coincidencia / Duplicado
                          </span>
                        ) : (
                          <span className="text-emerald-400 text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Conforme
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
