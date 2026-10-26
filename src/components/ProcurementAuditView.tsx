import React, { useState } from 'react';
import {
  FileCheck,
  AlertTriangle,
  Scale,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Building2,
  FileSpreadsheet,
  FileText,
  DollarSign,
  Layers,
  FolderOpen,
  Sparkles,
  RefreshCw,
  FolderArchive
} from 'lucide-react';
import { DatabaseState, ProcurementAuditItem, HallazgoClasificacion, HallazgoTipoControl } from '../types';
import { api } from '../services/api';

interface ProcurementAuditViewProps {
  data: DatabaseState;
  selectedExpedienteId: number | null;
  currentUser: string;
  onRefreshData: () => Promise<void>;
  onNavigateToTab?: (tab: string) => void;
}

export const ProcurementAuditView: React.FC<ProcurementAuditViewProps> = ({
  data,
  selectedExpedienteId,
  currentUser,
  onRefreshData,
  onNavigateToTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAdendaExcessOnly, setFilterAdendaExcessOnly] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<ProcurementAuditItem | null>(
    data.procurementAudits?.[0] || null
  );

  // Online INCART Audit Execution state
  const [isIncartAuditing, setIsIncartAuditing] = useState(false);
  const [incartAuditSuccess, setIncartAuditSuccess] = useState<string | null>(null);

  // New process modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formCodigo, setFormCodigo] = useState('');
  const [formEntidad, setFormEntidad] = useState('Instituto Nacional del Cáncer Rosa Emilia Sánchez Pérez de Tavares (INCART)');
  const [formObjeto, setFormObjeto] = useState('');
  const [formTransparenciaUrl, setFormTransparenciaUrl] = useState('https://www.incart.gob.do/transparencia/compras-y-contrataciones');
  const [formPliegoMonto, setFormPliegoMonto] = useState<number>(0);
  const [formPliegoGarantia, setFormPliegoGarantia] = useState('Póliza de Fiel Cumplimiento 10%');
  const [formPliegoTdr, setFormPliegoTdr] = useState('');
  const [formProveedor, setFormProveedor] = useState('');
  const [formMontoAdjudicado, setFormMontoAdjudicado] = useState<number>(0);
  const [formAdendaMonto, setFormAdendaMonto] = useState<number>(0);
  const [formAdendaJustificacion, setFormAdendaJustificacion] = useState('');
  const [formAspecto, setFormAspecto] = useState<HallazgoClasificacion>('LEGAL');
  const [formTipoControl, setFormTipoControl] = useState<HallazgoTipoControl>('HALLAZGO_ADMINISTRATIVO');

  const audits = data.procurementAudits || [];

  const filteredAudits = audits.filter(item => {
    const matchSearch =
      item.codigoProceso.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.objeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.entidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.contratoAdjudicado?.proveedorAdjudicado || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterAdendaExcessOnly) {
      return matchSearch && item.excedeLimiteLegal25Pct;
    }
    return matchSearch;
  });

  const formatCurrency = (val: number) => {
    const curr = data.settings?.currency || 'DOP';
    return `${curr} $${val.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
  };

  const handleRunIncartAudit = async () => {
    setIsIncartAuditing(true);
    setIncartAuditSuccess(null);
    try {
      const res = await api.auditIncartOnline(currentUser);
      if (res.success) {
        setIncartAuditSuccess(`Auditoría en línea a https://www.incart.gob.do/transparencia completada. Se generaron e incorporaron ${res.savedCount} hallazgos periciales con carpeta de evidencias.`);
        await onRefreshData();
      }
    } catch (err: any) {
      alert(`Error en auditoría en línea: ${err.message}`);
    } finally {
      setIsIncartAuditing(false);
    }
  };

  const handleSaveProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCodigo.trim() || !formObjeto.trim()) {
      alert('Código de proceso y objeto son obligatorios.');
      return;
    }

    try {
      const newAdendas = formAdendaMonto > 0 ? [
        {
          numeroAdenda: 'Adenda No. 1',
          fecha: new Date().toISOString().split('T')[0],
          montoAdicional: Number(formAdendaMonto),
          porcentajeSobreOriginal: formMontoAdjudicado > 0 ? Number(((formAdendaMonto / formMontoAdjudicado) * 100).toFixed(2)) : 0,
          justificacion: formAdendaJustificacion || 'Modificación contractual',
          aprobadaPorOrganoRector: false
        }
      ] : [];

      const res = await api.saveProcurementAudit({
        codigoProceso: formCodigo,
        entidad: formEntidad,
        objeto: formObjeto,
        portalTransparenciaUrl: formTransparenciaUrl,
        portalDgcpUrl: 'https://comprasdominicana.gob.do',
        pliegoTdr: {
          especificacionesClave: formPliegoTdr || 'Especificaciones técnicas del pliego',
          montoEstimadoPliego: Number(formPliegoMonto) || 0,
          plazoMeses: 12,
          requerimientoGarantia: formPliegoGarantia || 'Póliza del 10%'
        },
        contratoAdjudicado: {
          proveedorAdjudicado: formProveedor || 'Proveedor Adjudicado',
          rnc: '101-00000-0',
          montoAdjudicado: Number(formMontoAdjudicado) || 0,
          fechaContrato: new Date().toISOString().split('T')[0],
          plazoContratoMeses: 12
        },
        adendas: newAdendas,
        discrepanciaPliegoVsContrato: formAdendaMonto > (formMontoAdjudicado * 0.25)
          ? `Adenda por ${formatCurrency(formAdendaMonto)} sobrepasa el límite legal del 25% (Ley 340-06 Art. 31).`
          : 'En evaluación de compatibilidad',
        alertaFraccionamiento: false,
        clasificacionAspecto: formAspecto,
        tipoControl: formTipoControl,
        user: currentUser
      });

      if (res.success) {
        setIsModalOpen(false);
        await onRefreshData();
        setSelectedAudit(res.record);
      }
    } catch (err: any) {
      alert(`Error al guardar proceso: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: INCART Portal Auditor Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 p-5 rounded-2xl shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
              <Scale className="w-5 h-5 text-indigo-400" />
              Auditoría de Compras Públicas: Pliegos / TDR vs Contratos & Adendas (&gt;25%)
            </h2>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              Art. 31 Ley 340-06
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Cotejo pericial de pliegos de condiciones frente al contrato definitivo y fiscalización de adendas. Alerta automática ante superación del límite legal del 25% o supresión de cláusulas esenciales (garantías, cadena de frío, plazos y penalidades).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRunIncartAudit}
            disabled={isIncartAuditing}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50"
          >
            {isIncartAuditing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Auditando Portal INCART en línea...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Auditar Portal INCART Online
              </>
            )}
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            Nuevo Cotejo Pliego / Contrato
          </button>
        </div>
      </div>

      {incartAuditSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{incartAuditSuccess}</span>
          </div>
          <button
            onClick={() => setIncartAuditSuccess(null)}
            className="text-xs text-emerald-400 hover:underline ml-4"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Main Grid: List of Audited Procurement Processes & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Process List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por proceso, INCART, fármacos, aceleradores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={filterAdendaExcessOnly}
                  onChange={(e) => setFilterAdendaExcessOnly(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-rose-500 focus:ring-0"
                />
                <span className="text-rose-400 font-medium">Solo Adendas &gt; 25% Ilegales</span>
              </label>

              <span className="text-slate-500">{filteredAudits.length} procesos</span>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredAudits.map((item) => {
              const isSelected = selectedAudit?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedAudit(item)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500/50 shadow-md'
                      : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-indigo-400">
                        {item.codigoProceso}
                      </span>
                      <h4 className="text-xs font-semibold text-slate-200 line-clamp-1 mt-0.5">
                        {item.objeto}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{item.entidad}</p>
                    </div>

                    {item.excedeLimiteLegal25Pct && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 shrink-0 animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        &gt; 25% ILEGAL
                      </span>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/70 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">
                      Contrato: <span className="font-medium text-slate-200">{formatCurrency(item.contratoAdjudicado?.montoAdjudicado || 0)}</span>
                    </span>
                    <span className={`font-semibold ${item.porcentajeTotalAdendas > 25 ? 'text-rose-400' : 'text-slate-400'}`}>
                      Adendas: +{item.porcentajeTotalAdendas}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Comparative Inspector (Pliego vs Contrato vs Adendas) */}
        <div className="lg:col-span-7">
          {selectedAudit ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
              {/* Header Inspector */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-400 px-2 py-0.5 bg-indigo-500/10 rounded border border-indigo-500/30">
                      {selectedAudit.codigoProceso}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      Aspecto: {selectedAudit.clasificacionAspecto}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      selectedAudit.tipoControl === 'POSIBLE_OBSERVACION_PENAL_JUDICIAL'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : selectedAudit.tipoControl === 'HALLAZGO_ADMINISTRATIVO'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {selectedAudit.tipoControl.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 mt-2">
                    {selectedAudit.objeto}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedAudit.entidad}</p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {selectedAudit.portalTransparenciaUrl && (
                    <a
                      href={selectedAudit.portalTransparenciaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Ver en Transparencia
                    </a>
                  )}
                  {selectedAudit.portalDgcpUrl && (
                    <a
                      href={selectedAudit.portalDgcpUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Portal Transaccional DGCP
                    </a>
                  )}
                </div>
              </div>

              {/* 3-Column Comparative Board: Pliego vs Contrato vs Adendas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1. Pliego / TDR */}
                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/80 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                    <FileText className="w-3.5 h-3.5" />
                    Pliego de Condiciones / TDR
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-1">
                    <p><span className="text-slate-400">Monto Estimado:</span> <span className="font-semibold">{formatCurrency(selectedAudit.pliegoTdr.montoEstimadoPliego)}</span></p>
                    <p><span className="text-slate-400">Garantía Exigida:</span> {selectedAudit.pliegoTdr.requerimientoGarantia}</p>
                    <p><span className="text-slate-400">Plazo Previsto:</span> {selectedAudit.pliegoTdr.plazoMeses} meses</p>
                    <div className="pt-1.5 text-[10px] text-slate-400 italic line-clamp-3">
                      "{selectedAudit.pliegoTdr.especificacionesClave}"
                    </div>
                  </div>
                </div>

                {/* 2. Contrato Adjudicado */}
                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/80 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <Building2 className="w-3.5 h-3.5" />
                    Contrato Definitivo
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-1">
                    <p><span className="text-slate-400">Proveedor:</span> <span className="font-medium text-white">{selectedAudit.contratoAdjudicado.proveedorAdjudicado}</span></p>
                    <p><span className="text-slate-400">RNC:</span> {selectedAudit.contratoAdjudicado.rnc}</p>
                    <p><span className="text-slate-400">Monto Original:</span> <span className="font-bold text-emerald-300">{formatCurrency(selectedAudit.contratoAdjudicado.montoAdjudicado)}</span></p>
                    <p><span className="text-slate-400">Fecha Firma:</span> {selectedAudit.contratoAdjudicado.fechaContrato}</p>
                  </div>
                </div>

                {/* 3. Adendas & Variación Legal */}
                <div className={`p-3.5 rounded-xl border space-y-2 ${
                  selectedAudit.excedeLimiteLegal25Pct
                    ? 'bg-rose-950/20 border-rose-500/50 text-rose-200'
                    : 'bg-slate-800/50 border-slate-700/80 text-slate-300'
                }`}>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-indigo-400">
                      <Layers className="w-3.5 h-3.5" />
                      Adendas &amp; Límite 25%
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      selectedAudit.excedeLimiteLegal25Pct ? 'bg-rose-500/30 text-rose-200' : 'bg-slate-700 text-slate-300'
                    }`}>
                      +{selectedAudit.porcentajeTotalAdendas}%
                    </span>
                  </div>

                  <div className="text-[11px] space-y-1">
                    <p><span className="text-slate-400">Monto Acumulado:</span> <span className="font-bold">{formatCurrency(selectedAudit.montoFinalAcumulado)}</span></p>
                    <p><span className="text-slate-400">Tope Legal 25%:</span> {formatCurrency(selectedAudit.contratoAdjudicado.montoAdjudicado * 1.25)}</p>
                    <p className="text-[10px] pt-1">
                      {selectedAudit.excedeLimiteLegal25Pct ? (
                        <span className="text-rose-400 font-bold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" />
                          Exceso ilegal de {formatCurrency(selectedAudit.montoFinalAcumulado - (selectedAudit.contratoAdjudicado.montoAdjudicado * 1.25))}
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Dentro del margen del 25%
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Legal Analysis of Discrepancies */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 space-y-2">
                <h4 className="text-xs font-bold text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Dictamen Pericial de Incompatibilidad y Modificaciones Sustanciales:
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedAudit.discrepanciaPliegoVsContrato}
                </p>
              </div>

              {/* Action Recommendations to Auditor */}
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-2.5">
                <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-indigo-400" />
                  Acciones Forenses Recomendadas al Auditor:
                </h4>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>
                    Verificar en el portal transaccional de la DGCP si la institución solicitó no-objeción previa para la Adenda.
                  </li>
                  <li>
                    Comprobar en el SIGEF si existen libramientos devengados o pagados que correspondan al monto en exceso del 25%.
                  </li>
                  <li>
                    Confirmar si la adenda alteró el objeto sustancial o si se debió convocar a una nueva licitación pública nacional.
                  </li>
                  {selectedAudit.tipoControl === 'POSIBLE_OBSERVACION_PENAL_JUDICIAL' && (
                    <li className="text-rose-300 font-semibold">
                      Indicios de responsabilidad penal: preparar informe con sustento probatorio y remitir a la PEPCA / Procuraduría General de la República.
                    </li>
                  )}
                </ul>
              </div>

              {/* Evidence Folder Link */}
              <div className="pt-2 flex items-center justify-between">
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <FolderArchive className="w-4 h-4 text-purple-400" />
                  Carpeta de custodia: <span className="font-mono text-purple-300 font-medium">{selectedAudit.carpetaEvidenciaId || 'evidence/hallazgo_0004'}</span>
                </div>

                {onNavigateToTab && (
                  <button
                    onClick={() => onNavigateToTab('evidencias-folder')}
                    className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    Abrir Gestor de Evidencias Digitales
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
              Seleccione un proceso de compra para inspeccionar el contraste pliego vs contrato.
            </div>
          )}
        </div>
      </div>

      {/* Modal: New Process Evaluation */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-400" />
                Registrar Evaluación de Pliego vs Contrato y Adendas
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleSaveProcess} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Código de Proceso (ej. INCART-CCC-LPN-2025-0015):</label>
                  <input
                    type="text"
                    required
                    value={formCodigo}
                    onChange={(e) => setFormCodigo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Entidad Auditada:</label>
                  <input
                    type="text"
                    required
                    value={formEntidad}
                    onChange={(e) => setFormEntidad(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Objeto de la Contratación:</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Suministro de Radiofármacos y Trazabilidad Térmica..."
                  value={formObjeto}
                  onChange={(e) => setFormObjeto(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Monto Pliego (Estimado):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formPliegoMonto}
                    onChange={(e) => setFormPliegoMonto(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Monto Contrato Adjudicado:</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formMontoAdjudicado}
                    onChange={(e) => setFormMontoAdjudicado(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Proveedor Adjudicado:</label>
                  <input
                    type="text"
                    value={formProveedor}
                    onChange={(e) => setFormProveedor(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Monto de la Adenda (si existe):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formAdendaMonto}
                    onChange={(e) => setFormAdendaMonto(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Justificación de la Adenda o Discrepancia del Pliego:</label>
                <textarea
                  rows={2}
                  value={formAdendaJustificacion}
                  onChange={(e) => setFormAdendaJustificacion(e.target.value)}
                  placeholder="Detallar si sobrepasa el 25% o si se relajaron condiciones de garantía o plazos..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Aspecto del Incumplimiento:</label>
                  <select
                    value={formAspecto}
                    onChange={(e) => setFormAspecto(e.target.value as HallazgoClasificacion)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="FINANCIERO">FINANCIERO</option>
                    <option value="LEGAL">LEGAL</option>
                    <option value="OBRAS">OBRAS</option>
                    <option value="ACL">ACL (Laboral / Cumplimiento)</option>
                    <option value="TECNOLOGICO">TECNOLÓGICO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Tipificación de Control / Responsabilidad:</label>
                  <select
                    value={formTipoControl}
                    onChange={(e) => setFormTipoControl(e.target.value as HallazgoTipoControl)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="DEBILIDAD_CONTROL_INTERNO">DEBILIDAD DE CONTROL INTERNO</option>
                    <option value="HALLAZGO_ADMINISTRATIVO">HALLAZGO ADMINISTRATIVO</option>
                    <option value="POSIBLE_OBSERVACION_PENAL_JUDICIAL">POSIBLE OBSERVACIÓN PENAL / JUDICIAL</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow"
                >
                  Guardar y Analizar Variación Legal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
