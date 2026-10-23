import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  FileArchive,
  Printer,
  Download,
  CheckCircle2,
  Scale,
  Sparkles
} from 'lucide-react';
import { DatabaseState, Expediente } from '../types';
import { exportService } from '../services/exportService';

interface ReportesExportViewProps {
  data: DatabaseState;
  selectedExpediente: Expediente | null;
}

export const ReportesExportView: React.FC<ReportesExportViewProps> = ({
  data,
  selectedExpediente,
}) => {
  const [includeHallazgos, setIncludeHallazgos] = useState(true);
  const [includeRiesgos, setIncludeRiesgos] = useState(true);
  const [includeContratos, setIncludeContratos] = useState(true);
  const [includePagos, setIncludePagos] = useState(true);
  const [includeResumen, setIncludeResumen] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportWord = () => {
    exportService.exportToWord(data, selectedExpediente);
  };

  const handleExportExcel = () => {
    exportService.exportToExcel(data, selectedExpediente);
  };

  const handleExportZip = async () => {
    setIsExporting(true);
    try {
      await exportService.exportFullZip(data, selectedExpediente);
    } catch (err: any) {
      alert(`Error al generar ZIP: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const totalObs = data.hallazgos.reduce((acc, h) => acc + (h.montoObservado || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-blue-400" />
            Centro de Reportes y Exportación Masiva
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generación de entregables oficiales en Word, Excel, PDF y expediente empaquetado en archivo ZIP.
          </p>
        </div>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Option 1: Word */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-500/50 transition">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-100">Informe Oficial en Word (.doc)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Formato membretado de la Cámara de Cuentas con los 6 componentes canónicos de cada hallazgo, cuadro de riesgos y firmas de auditores.
            </p>
          </div>

          <button
            onClick={handleExportWord}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Informe Word</span>
          </button>
        </div>

        {/* Option 2: Excel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-100">Libro Contable en Excel (.xlsx)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Libro multi-hojas: Resumen Ejecutivo, Hallazgos detallados, Matriz de Riesgos, Contratos adjudicados y Conciliación de Pagos.
            </p>
          </div>

          <button
            onClick={handleExportExcel}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Libro Excel</span>
          </button>
        </div>

        {/* Option 3: Consolidated ZIP */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-purple-500/50 transition">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <FileArchive className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-100">Expediente Completo (ZIP)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empaqueta todos los archivos CSV, informe ejecutivo consolidado en texto plano y metadatos JSON para archivo oficial.
            </p>
          </div>

          <button
            onClick={handleExportZip}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-white" />
                <span>Empaquetando Archivos...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Exportar Expediente ZIP</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Printable Preview Card with Print action */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Printer className="w-5 h-5 text-indigo-400" />
              Vista Previa Imprimible (PDF Oficial)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualice la estructura del dictamen o envíelo directamente a su impresora / Guardar como PDF.
            </p>
          </div>

          <button
            onClick={handlePrintPdf}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Guardar como PDF</span>
          </button>
        </div>

        {/* Formatted Document Simulation for Print / Review */}
        <div className="bg-white text-slate-900 rounded-xl p-8 shadow-inner border border-slate-300 font-sans space-y-6 max-h-[500px] overflow-y-auto">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4">
            <div className="text-lg font-black tracking-wide text-slate-900 uppercase">
              SISTEMA NACIONAL DE CONTROL Y AUDITORÍA EXTERNA
            </div>
            <div className="text-xs font-bold text-slate-600 uppercase mt-0.5">
              CÁMARA DE CUENTAS / CONTRALORÍA GENERAL DE LA REPÚBLICA
            </div>
            <div className="text-sm font-bold text-blue-900 uppercase mt-2">
              INFORME OFICIAL DE AUDITORÍA ESPECIAL
            </div>
          </div>

          {/* Metadata Table */}
          <table className="w-full text-xs border border-slate-300">
            <tbody>
              <tr className="border-b border-slate-300">
                <td className="p-2 bg-slate-100 font-bold w-1/4">Código de Auditoría:</td>
                <td className="p-2 font-mono font-bold">{selectedExpediente ? selectedExpediente.codigo : 'AUD-2026-CONSOLIDADO'}</td>
                <td className="p-2 bg-slate-100 font-bold w-1/4">Fecha de Emisión:</td>
                <td className="p-2">{new Date().toLocaleDateString('es-DO')}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2 bg-slate-100 font-bold">Entidad Fiscalizada:</td>
                <td colSpan={3} className="p-2 font-semibold">
                  {selectedExpediente ? selectedExpediente.entidad : 'Ministerio de Obras Públicas y Comunicaciones (MOPC)'}
                </td>
              </tr>
              <tr>
                <td className="p-2 bg-slate-100 font-bold">Monto Total Observado:</td>
                <td className="p-2 font-bold text-red-700">
                  RD$ {totalObs.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-2 bg-slate-100 font-bold">Total Hallazgos:</td>
                <td className="p-2 font-bold">{data.hallazgos.length} hallazgo(s)</td>
              </tr>
            </tbody>
          </table>

          {/* Findings Summary in Printable */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-1 mb-3">
              Cuerpo de Hallazgos Dictaminados:
            </h4>
            <div className="space-y-4">
              {data.hallazgos.map((h, i) => (
                <div key={h.id} className="border border-slate-300 p-3.5 rounded text-xs space-y-1.5">
                  <div className="flex justify-between items-start font-bold">
                    <span className="text-slate-900">{i + 1}. {h.titulo}</span>
                    <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded font-mono">
                      Severidad: {h.nivel}
                    </span>
                  </div>
                  <div><strong>Condición:</strong> {h.condicion}</div>
                  <div className="text-blue-900"><strong>Criterio Legal:</strong> {h.criterio}</div>
                  <div><strong>Causa:</strong> {h.causa}</div>
                  <div className="text-red-900"><strong>Efecto:</strong> {h.efecto}</div>
                  <div className="text-emerald-900"><strong>Recomendación:</strong> {h.recomendacion}</div>
                  {h.conclusion && (
                    <div className="text-slate-700 italic"><strong>Conclusión:</strong> {h.conclusion}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="border-t border-slate-900 w-3/4 mx-auto pt-1 font-bold">
                Auditor Encargado
              </div>
              <div className="text-[10px] text-slate-500">Comisión Especial de Auditoría</div>
            </div>
            <div>
              <div className="border-t border-slate-900 w-3/4 mx-auto pt-1 font-bold">
                Supervisor de Auditoría
              </div>
              <div className="text-[10px] text-slate-500">Dirección General de Fiscalización</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
