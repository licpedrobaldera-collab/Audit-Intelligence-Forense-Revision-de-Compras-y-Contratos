import React, { useState } from 'react';
import {
  GitCompare,
  Upload,
  Globe,
  Search,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Download,
  Building2,
  FileSpreadsheet,
  FileText,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Save,
  Check,
  RefreshCw,
  FolderPlus
} from 'lucide-react';
import { DatabaseState, CrossAuditResult, CrossAuditDiscrepancy } from '../types';
import { api } from '../services/api';
import { crossExportService } from '../services/crossExportService';

interface CrossRectorAuditViewProps {
  data: DatabaseState;
  selectedExpedienteId: number | null;
  currentUser: string;
  onRefreshData: () => Promise<void>;
}

type AuditModuleType = 'Compras' | 'Financiero' | 'Activos' | 'Nomina';

export const CrossRectorAuditView: React.FC<CrossRectorAuditViewProps> = ({
  data,
  selectedExpedienteId,
  currentUser,
  onRefreshData,
}) => {
  const [activeModule, setActiveModule] = useState<AuditModuleType>('Compras');
  const [inputMode, setInputMode] = useState<'upload' | 'link' | 'google_search'>('link');

  // Input states
  const [entityName, setEntityName] = useState('Ministerio de Obras Públicas y Comunicaciones (MOPC)');
  const [entityUrl, setEntityUrl] = useState('https://mopc.gob.do/transparencia/compras-y-licitaciones');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedContent, setUploadedContent] = useState<string>('');
  const [searchTopic, setSearchTopic] = useState('Procesos de compras, licitaciones de asfalto y contratos de infraestructura 2025-2026');
  const [useGoogleSearch, setUseGoogleSearch] = useState(true);

  // Status
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [result, setResult] = useState<CrossAuditResult | null>(null);
  const [isSavingFindings, setIsSavingFindings] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Default Rector inputs according to active module
  const getRectorDefaults = (mod: AuditModuleType): Record<string, string> => {
    switch (mod) {
      case 'Compras':
        return {
          'DGCP (Portal Transaccional)': 'https://comprasdominicana.gob.do',
          'Contraloría General de la República': 'https://contraloria.gob.do/registro-contratos',
          'Ministerio de Hacienda / SIGEF (Libramientos)': 'https://sigef.hacienda.gob.do/libramientos'
        };
      case 'Financiero':
        return {
          'DIGECOG (Contabilidad Gubernamental)': 'https://digecog.gob.do/estados-financieros-consolidados',
          'Ministerio de Hacienda (SIGEF)': 'https://hacienda.gob.do/ejecucion-presupuestaria',
          'Cámara de Cuentas': 'https://camaradecuentas.gob.do'
        };
      case 'Activos':
        return {
          'Dirección General de Bienes Nacionales': 'https://bienesnacionales.gob.do/catastro-bienes',
          'DIGECOG (Normas de Activos Fijos)': 'https://digecog.gob.do/normas-activos',
          'DGII (Registro de Vehículos y Títulos)': 'https://dgii.gov.do/vehiculos',
          'SIGEF (Módulo de Bienes)': 'https://sigef.hacienda.gob.do'
        };
      case 'Nomina':
        return {
          'MAP (Ministerio de Administración Pública)': 'https://map.gob.do/sasp',
          'SASP (Registro de Servidores)': 'https://sasp.map.gob.do/consulta',
          'Estructura Organizacional Aprobada': 'Resolución MAP No. 042-2024 de Estructura Institucional'
        };
    }
  };

  const [rectorInputs, setRectorInputs] = useState<Record<string, string>>(getRectorDefaults('Compras'));

  // Switch module handler
  const handleModuleChange = (mod: AuditModuleType) => {
    setActiveModule(mod);
    setRectorInputs(getRectorDefaults(mod));
    setResult(null);
    setSavedSuccess(false);

    // Update entity URL hint
    if (mod === 'Compras') {
      setEntityUrl('https://mopc.gob.do/transparencia/compras-y-licitaciones');
      setSearchTopic('Licitaciones públicas, contrataciones menores y pagos de obras');
    } else if (mod === 'Financiero') {
      setEntityUrl('https://mopc.gob.do/transparencia/estados-financieros');
      setSearchTopic('Informes semestrales, balances de comprobación y rendición de cuentas');
    } else if (mod === 'Activos') {
      setEntityUrl('https://mopc.gob.do/transparencia/inventario-de-activos');
      setSearchTopic('Inventario de vehículos, maquinaria pesada e inmuebles institucionales');
    } else if (mod === 'Nomina') {
      setEntityUrl('https://mopc.gob.do/transparencia/recursos-humanos/nomina');
      setSearchTopic('Nómina de empleados fijos y contratados, compensaciones y cargos');
    }
  };

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setStatusMessage(`Leyendo archivo local: ${file.name}...`);

    try {
      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
        const text = await file.text();
        setUploadedContent(text);
      } else {
        // Read as string / placeholder text
        setUploadedContent(`[Archivo binario cargado: ${file.name} - Tamaño: ${Math.round(file.size / 1024)} KB]`);
      }
    } catch (err: any) {
      alert(`Error leyendo archivo: ${err.message}`);
    }
  };

  // Run Cross-Audit
  const handleExecuteCrossAudit = async () => {
    if (!entityName.trim()) {
      alert('Por favor ingrese el nombre de la entidad a fiscalizar.');
      return;
    }

    let payloadData = '';
    if (inputMode === 'upload') {
      if (!uploadedContent) {
        alert('Por favor seleccione un archivo digital desde su laptop.');
        return;
      }
      payloadData = `[Archivo digital analizado: ${uploadedFileName}]\n${uploadedContent}`;
    } else if (inputMode === 'link') {
      if (!entityUrl.trim()) {
        alert('Por favor ingrese la URL o enlace web institucional.');
        return;
      }
      payloadData = `[Portal Web Institucional: ${entityUrl}]\nObjetivo: Análisis de transparencia y registros del módulo ${activeModule}`;
    } else {
      if (!searchTopic.trim()) {
        alert('Por favor ingrese el tema de búsqueda automatizada en Google.');
        return;
      }
      payloadData = `[Búsqueda Automatizada de Transparencia: ${searchTopic}]\nEntidad: ${entityName}`;
    }

    setIsProcessing(true);
    setStatusMessage('Iniciando contraste pericial en vivo contra órganos rectores...');
    setResult(null);
    setSavedSuccess(false);

    try {
      const res = await api.crossAudit({
        auditType: activeModule,
        entityName,
        entityDataOrUrl: payloadData,
        rectorDataOrUrls: rectorInputs,
        useGoogleSearch,
        user: currentUser,
      });

      if (res && res.result) {
        setResult(res.result);
      }
    } catch (err: any) {
      alert(`Error en el examen de cruce pericial: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setStatusMessage(null);
    }
  };

  // Save Findings to active Dossier
  const handleSaveToDossier = async () => {
    if (!result) return;
    setIsSavingFindings(true);

    try {
      const res = await api.saveCrossFindings({
        expedienteId: selectedExpedienteId,
        hallazgos: result.hallazgosDetectados || [],
        evidencias: result.evidenciasGeneradas || [],
        user: currentUser,
      });

      if (res && res.success) {
        setSavedSuccess(true);
        await onRefreshData();
      }
    } catch (err: any) {
      alert(`Error al guardar hallazgos: ${err.message}`);
    } finally {
      setIsSavingFindings(false);
    }
  };

  const formatCurrency = (val: number) => {
    const curr = data.settings?.currency || 'DOP';
    return `${curr} $${val.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
  };

  const activeExp = data.expedientes.find(e => e.id === selectedExpedienteId) || null;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
              <GitCompare className="w-5 h-5 text-indigo-400" />
              Fiscalización y Cruce Institucional vs Órganos Rectores
            </h2>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              Peritaje Automático
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cotejo pericial de portales de transparencia y archivos de la entidad frente a los registros oficiales de DGCP, Contraloría, MAP, DIGECOG, Hacienda y Bienes Nacionales.
          </p>
        </div>

        {activeExp && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <span className="text-slate-400">Expediente Destino:</span>
            <span className="font-bold text-blue-400">{activeExp.codigo}</span>
          </div>
        )}
      </div>

      {/* 4 Specialized Audit Modules Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => handleModuleChange('Compras')}
          className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
            activeModule === 'Compras'
              ? 'bg-blue-600/15 border-blue-500/50 shadow-md text-white'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">1. Compras & Contratos</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-sm font-bold text-slate-100 mt-2">Portal vs DGCP vs Contraloría vs SIGEF</div>
          <div className="text-[11px] text-slate-400 mt-1">Ley 340-06 · Dec. 543-12 · Pagos en Hacienda</div>
        </button>

        <button
          onClick={() => handleModuleChange('Financiero')}
          className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
            activeModule === 'Financiero'
              ? 'bg-emerald-600/15 border-emerald-500/50 shadow-md text-white'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">2. Estados Financieros</span>
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-slate-100 mt-2">Semestrales vs DIGECOG y Balances</div>
          <div className="text-[11px] text-slate-400 mt-1">Ley 126-01 · NICSP · Pasivos y Caja Única</div>
        </button>

        <button
          onClick={() => handleModuleChange('Activos')}
          className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
            activeModule === 'Activos'
              ? 'bg-amber-600/15 border-amber-500/50 shadow-md text-white'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">3. Activos Fijos</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-sm font-bold text-slate-100 mt-2">Inventario vs Bienes Nal. vs DGII</div>
          <div className="text-[11px] text-slate-400 mt-1">Titulación · Matrículas · Pólizas de Seguro</div>
        </button>

        <button
          onClick={() => handleModuleChange('Nomina')}
          className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
            activeModule === 'Nomina'
              ? 'bg-purple-600/15 border-purple-500/50 shadow-md text-white'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">4. Nómina & Personal</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-bold text-slate-100 mt-2">Nómina vs MAP / SASP y Estructura</div>
          <div className="text-[11px] text-slate-400 mt-1">Ley 41-08 · Ley 105-13 · Doble Nómina</div>
        </button>
      </div>

      {/* Main Configuration Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nombre de la Entidad Pública Auditada *
            </label>
            <input
              type="text"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              placeholder="Ej. Instituto Nacional del Cáncer Rosa Emilia Sánchez Pérez de Tavares (INCART)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
            />
            <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
              <span className="text-slate-500 text-[10px] font-semibold">Cargar Perfil Oficial:</span>
              <button
                type="button"
                onClick={() => {
                  setEntityName('Instituto Nacional del Cáncer Rosa Emilia Sánchez Pérez de Tavares (INCART)');
                  setEntityUrl('https://www.incart.gob.do/transparencia');
                  setSearchTopic('Procesos de compras, fármacos oncológicos, aceleradores lineales LINAC y adendas INCART');
                  setInputMode('link');
                }}
                className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/25 transition font-medium"
              >
                INCART (https://www.incart.gob.do/transparencia)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEntityName('Ministerio de Obras Públicas y Comunicaciones (MOPC)');
                  setEntityUrl('https://mopc.gob.do/transparencia/compras-y-licitaciones');
                  setSearchTopic('Licitaciones de asfalto, contratos viales y pagos 2025-2026');
                  setInputMode('link');
                }}
                className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition"
              >
                MOPC
              </button>
            </div>
          </div>

          <div className="md:col-span-6">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Modo de Entrada de Información a Contrastar
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setInputMode('link')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                  inputMode === 'link'
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Pegar Link URL</span>
              </button>

              <button
                type="button"
                onClick={() => setInputMode('upload')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                  inputMode === 'upload'
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Subir Archivo</span>
              </button>

              <button
                type="button"
                onClick={() => setInputMode('google_search')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                  inputMode === 'google_search'
                    ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Google Grounding</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Input based on Mode */}
        {inputMode === 'link' && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              URL del Portal Institucional o Sección de Transparencia de la Entidad
            </label>
            <input
              type="url"
              value={entityUrl}
              onChange={(e) => setEntityUrl(e.target.value)}
              placeholder="https://entidad.gob.do/transparencia/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              El motor extraerá los datos publicados y los cotejará automáticamente contra las fuentes de los órganos rectores.
            </p>
          </div>
        )}

        {inputMode === 'upload' && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-400" />
              Cargar Archivo Digital desde la Laptop (PDF, Excel, Word, CSV, TXT)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer transition">
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Examinar Laptop</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.xlsx,.xls,.csv,.docx,.doc,.txt"
                />
              </label>
              {uploadedFileName ? (
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {uploadedFileName}
                </span>
              ) : (
                <span className="text-xs text-slate-500">Ningún archivo seleccionado aún</span>
              )}
            </div>
            {uploadedContent && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 max-h-24 overflow-y-auto text-[11px] font-mono text-slate-400">
                {uploadedContent.slice(0, 400)}...
              </div>
            )}
          </div>
        )}

        {inputMode === 'google_search' && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-400" />
              Parámetro de Búsqueda Automatizada con Google Search Grounding
            </label>
            <input
              type="text"
              value={searchTopic}
              onChange={(e) => setSearchTopic(e.target.value)}
              placeholder="Ej. Procesos de compras adjudicados a consorcios en 2025"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Gemini 3.8 Flash rastreará en tiempo real publicaciones públicas en la web sobre la entidad auditada y los órganos de control.
            </p>
          </div>
        )}

        {/* Rector Organs References Card */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              Órganos Rectores y Fuentes Oficiales a Contrastar
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={useGoogleSearch}
                onChange={(e) => setUseGoogleSearch(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
              />
              <span>Habilitar Google Search Grounding en Vivo</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {Object.entries(rectorInputs).map(([rectorName, rectorUrl]) => (
              <div key={rectorName} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <span className="font-semibold text-slate-200">{rectorName}</span>
                <span className="text-[10px] text-blue-400 truncate mt-1 font-mono">{rectorUrl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleExecuteCrossAudit}
            disabled={isProcessing}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-white" />
                <span>{statusMessage || 'Procesando cruce forense con órganos rectores...'}</span>
              </>
            ) : (
              <>
                <GitCompare className="w-4 h-4" />
                <span>Ejecutar Cruce Pericial Automatizado vs Órganos Rectores</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          {/* Executive Overview Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  Dictamen Pericial de Cruce: {result.modulo}
                </span>
                <h3 className="text-lg font-bold text-slate-100 mt-1">
                  {result.entidadAuditada}
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  Órganos Contrastados: {result.organosConsultados?.join(' · ')}
                </div>
              </div>

              {/* Compliance gauge */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-medium">Conformidad Legal</div>
                  <div className={`text-2xl font-black ${
                    result.puntuacionConformidad >= 80 ? 'text-emerald-400' :
                    result.puntuacionConformidad >= 60 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {result.puntuacionConformidad} / 100
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => crossExportService.exportToExcel(result)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                    title="Exportar matriz completa a Excel"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Matriz (.xlsx)</span>
                  </button>

                  <button
                    onClick={() => crossExportService.exportToWord(result)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
                    title="Exportar informe pericial a Word"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Informe (.doc)</span>
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              {result.resumenCruce}
            </p>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="text-xs text-slate-400">
                Se identificaron <strong className="text-slate-100">{result.discrepancias?.length || 0}</strong> discrepancias técnicas y <strong className="text-amber-400">{result.hallazgosDetectados?.length || 0}</strong> posibles hallazgos normativos.
              </div>

              <div className="flex items-center gap-2">
                {savedSuccess ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <Check className="w-4 h-4" />
                    <span>Guardado en Expediente Activo</span>
                  </div>
                ) : (
                  <button
                    onClick={handleSaveToDossier}
                    disabled={isSavingFindings}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>{isSavingFindings ? 'Guardando...' : 'Guardar Hallazgos y Evidencias en Expediente'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Discrepancies Matrix Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Matriz Pericial de Inconsistencias y Discrepancias vs Órganos Rectores
              </h4>
              <span className="text-xs text-slate-400">Total: {result.discrepancias?.length || 0} filas</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700/80">
                  <tr>
                    <th className="p-3">Código</th>
                    <th className="p-3">Proceso / Item Auditado</th>
                    <th className="p-3">Dato en Entidad</th>
                    <th className="p-3">Dato en Órgano Rector</th>
                    <th className="p-3">Órgano</th>
                    <th className="p-3 text-center">Severidad</th>
                    <th className="p-3 text-right">Impacto Económico</th>
                    <th className="p-3">Alerta Pericial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  {(result.discrepancias || []).map((d: CrossAuditDiscrepancy) => (
                    <tr key={d.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-slate-200">{d.id}</td>
                      <td className="p-3 font-sans font-semibold text-slate-100 max-w-xs">{d.item}</td>
                      <td className="p-3 font-sans text-xs text-sky-400 max-w-xs">{d.valorEntidad}</td>
                      <td className="p-3 font-sans text-xs text-red-400 max-w-xs font-semibold">{d.valorOrganoRector}</td>
                      <td className="p-3 font-sans text-slate-300 font-semibold">{d.organoRector}</td>
                      <td className="p-3 text-center font-sans">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          d.severidad === 'Crítica' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                          d.severidad === 'Alta' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {d.severidad}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-400">
                        {d.impactoEconomico ? formatCurrency(d.impactoEconomico) : '—'}
                      </td>
                      <td className="p-3 font-sans text-xs text-slate-400 max-w-xs">{d.alerta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Structured Findings Detected */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Hallazgos Periciales Detectados y Listos para Apertura (Ley 10-04)
            </h4>

            <div className="grid grid-cols-1 gap-4">
              {(result.hallazgosDetectados || []).map((h, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs">
                        #{idx + 1}
                      </span>
                      <h5 className="text-sm font-bold text-slate-100">{h.titulo}</h5>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                        Nivel {h.nivel}
                      </span>
                      {h.montoObservado && h.montoObservado > 0 && (
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          {formatCurrency(h.montoObservado)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Condición (Hecho Verificado)</div>
                      <div className="text-slate-200 mt-1">{h.condicion}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                      <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Criterio (Norma Violada)</div>
                      <div className="text-slate-200 mt-1">{h.criterio}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                      <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Causa & Efecto</div>
                      <div className="text-slate-300 mt-1">
                        <strong>Causa:</strong> {h.causa}<br />
                        <strong>Efecto:</strong> {h.efecto}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-900/50">
                      <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Recomendación Pericial</div>
                      <div className="text-indigo-200 mt-1">{h.recomendacion}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chain of Custody & Evidence */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Evidencias Generadas Automáticamente & Custodia Criptográfica SHA-256
            </h4>

            <div className="space-y-2 text-xs">
              {(result.evidenciasGeneradas || []).map((ev, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-200 flex items-center gap-2">
                      <span>{ev.fuente}</span>
                      {ev.url && (
                        <a href={ev.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">{ev.extracto}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-slate-400">Hash SHA-256:</div>
                    <div className="text-[11px] font-mono text-emerald-400 truncate max-w-[240px]" title={ev.sha256}>
                      {ev.sha256}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Web grounding citations */}
            {result.fuentesWebEncontradas && result.fuentesWebEncontradas.length > 0 && (
              <div className="pt-2 border-t border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 mb-2">Fuentes Web Consultadas vía Google Search:</div>
                <div className="flex flex-wrap gap-2">
                  {result.fuentesWebEncontradas.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 text-[11px] transition truncate max-w-xs"
                    >
                      <Globe className="w-3 h-3 shrink-0" />
                      <span className="truncate">{src.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
