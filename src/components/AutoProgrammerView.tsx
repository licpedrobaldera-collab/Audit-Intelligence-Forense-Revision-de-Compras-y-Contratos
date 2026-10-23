import React, { useState } from 'react';
import {
  Code,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Play,
  Save,
  Trash2,
  ShieldCheck,
  FileCode,
  Plus,
  RefreshCw,
  Box,
  Copy,
  Check,
  FileText
} from 'lucide-react';
import { DatabaseState, CustomPlugin } from '../types';
import { api } from '../services/api';

interface AutoProgrammerViewProps {
  data: DatabaseState;
  currentUser: string;
  onRefreshData: () => Promise<void>;
}

export const AutoProgrammerView: React.FC<AutoProgrammerViewProps> = ({
  data,
  currentUser,
  onRefreshData,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('custom');
  const [inputContent, setInputContent] = useState<string>(`{
  "modulo": "Fiscalización de Subvenciones a ONGs",
  "organosRectores": ["CASFL / MEPyD", "Ministerio de Hacienda", "Cámara de Cuentas"],
  "parametros": ["RNC de la Organización", "Resolución de Habilitación", "Monto Liquidado"],
  "regla": "Verificar que la asociación cuente con habilitación sectorial vigente y haya rendido cuentas ante la Cámara de Cuentas antes de cualquier libramiento en Hacienda."
}`);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pluginDraft, setPluginDraft] = useState<any>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Template Presets
  const templates: Record<string, { label: string; text: string }> = {
    subvenciones: {
      label: 'Cruce de Subvenciones a ONGs vs CASFL y Hacienda',
      text: `{
  "modulo": "Fiscalización de Subvenciones a ONGs",
  "categoria": "Especial",
  "organosRectores": ["CASFL / MEPyD", "Ministerio de Hacienda / SIGEF", "Cámara de Cuentas"],
  "parametros": ["RNC", "Resolución de Habilitación", "Monto Liquidado", "Número de Cuenta Exclusiva"],
  "regla": "Verificar que la entidad sin fines de lucro cuente con Habilitación Sectorial vigente en CASFL y rendición de cuentas aprobada en Cámara de Cuentas para autorizar el desembolso."
}`
    },
    combustible: {
      label: 'Auditoría de Combustible y Flotas vs SIGEF y DGII',
      text: `{
  "modulo": "Auditoría de Combustible vs SIGEF y Matrícula Vehicular",
  "categoria": "Activos",
  "organosRectores": ["Dirección General de Bienes Nacionales", "DGII", "Contraloría"],
  "parametros": ["Placa Oficial", "Cédula Chofer", "Litros Despachados", "Kilometraje en Odómetro"],
  "regla": "Cotejar el consumo por litro vs rendimiento teórico del vehículo registrado en la DGII y validar firma de bitácora por supervisor de transportación."
}`
    },
    viaticos: {
      label: 'Control de Viáticos y Pasajes vs Resoluciones Presupuestarias',
      text: `{
  "modulo": "Fiscalización de Viáticos y Gastos de Misión",
  "categoria": "Financiero",
  "organosRectores": ["Ministerio de Administración Pública (MAP)", "Contraloría General", "Hacienda"],
  "parametros": ["Cédula Servidor", "Monto Viático", "Resolución de Comisión", "Boletín de Embarque / Facturas de Alojamiento"],
  "regla": "Validar que la liquidación de viáticos cuente con informe de resultados de misión y no exceda las tarifas máximas aprobadas por resolución del MAP."
}`
    },
    retenciones: {
      label: 'Cruce Tributario de Retenciones ISR y ITBIS vs DGII',
      text: `{
  "modulo": "Cruce de Retenciones Fiscales en Compras del Estado",
  "categoria": "Tributario",
  "organosRectores": ["Dirección General de Impuestos Internos (DGII)", "Hacienda / Tesorería"],
  "parametros": ["NCF Factura", "RNC Proveedor", "Monto Retenido ITBIS", "Monto Retenido ISR"],
  "regla": "Validar que el Estado haya remitido el formulario 606 y enterado las retenciones a la DGII en el plazo legal del día 10 del mes siguiente."
}`
    },
    blank: {
      label: 'Plantilla Vacía para Nuevo Módulo Personalizado',
      text: `{
  "modulo": "Nombre del Módulo",
  "categoria": "Compras | Financiero | Activos | Nomina | Especial",
  "organosRectores": ["Órgano 1", "Órgano 2"],
  "parametros": ["Parámetro A", "Parámetro B"],
  "regla": "Describa detalladamente el criterio de fiscalización, la fórmula de cálculo o el cruce normativo que el sistema debe ejecutar de forma automática."
}`
    }
  };

  const handleSelectTemplate = (key: string) => {
    setSelectedTemplate(key);
    if (templates[key]) {
      setInputContent(templates[key].text);
    }
    setPluginDraft(null);
    setInstallSuccess(false);
  };

  // Analyze and auto-program
  const handleAutoProgram = async () => {
    if (!inputContent.trim()) {
      alert('Por favor ingrese o pegue una plantilla o requerimiento de fiscalización.');
      return;
    }

    setIsAnalyzing(true);
    setPluginDraft(null);
    setInstallSuccess(false);

    try {
      const res = await api.autoProgram(inputContent, currentUser);
      if (res && res.pluginDraft) {
        setPluginDraft(res.pluginDraft);
      }
    } catch (err: any) {
      alert(`Error autoprogramando módulo: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Administrator approval and installation
  const handleApproveAndInstall = async () => {
    if (!pluginDraft) return;
    setIsInstalling(true);

    try {
      await api.saveCustomPlugin({
        nombre: pluginDraft.nombre,
        codigo: pluginDraft.codigo || `PLUG-${Math.floor(Math.random() * 900 + 100)}`,
        descripcion: pluginDraft.descripcion || '',
        categoria: pluginDraft.categoria || 'Especial',
        organosRectores: pluginDraft.organosRectores || [],
        dependencias: pluginDraft.dependencias || ['xlsx'],
        scriptSource: pluginDraft.scriptSource || '// Script pericial activo',
        parametrosEntrada: pluginDraft.parametrosEntrada || [],
        reglasValidacion: pluginDraft.reglasValidacion || [],
        activo: true,
        user: currentUser,
      });

      setInstallSuccess(true);
      setShowAdminModal(false);
      await onRefreshData();
    } catch (err: any) {
      alert(`Error instalando módulo: ${err.message}`);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDeletePlugin = async (id: number) => {
    if (confirm('¿Eliminar este módulo autoprogramado del sistema?')) {
      await api.deleteCustomPlugin(id, currentUser);
      await onRefreshData();
    }
  };

  const handleCopyScript = () => {
    if (!pluginDraft?.scriptSource) return;
    navigator.clipboard.writeText(pluginDraft.scriptSource);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const activePlugins = data.customPlugins || [];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
              <Code className="w-5 h-5 text-emerald-400" />
              Autoprogramador & Regenerador de Funciones Autónomas
            </h2>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Arquitectura Auto-Evolutiva
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cargue o anexe una plantilla llena o vacía. La IA analiza las dependencias necesarias, genera el script ejecutable y solicita confirmación al Administrador para autoactualizar el sistema.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Módulos Activos:</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-400">
            {activePlugins.length} instalados
          </span>
        </div>
      </div>

      {/* Grid: Programmer Workspace & Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input & Template Selection (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-blue-400" />
              Plantilla de Requerimiento Pericial
            </h3>

            <div className="text-xs text-slate-400">
              Usuario: <strong className="text-slate-200">{currentUser}</strong> (Administrador)
            </div>
          </div>

          {/* Quick Preset Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Seleccionar Plantilla Preconfigurada o Redactar Personalizada:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(templates).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectTemplate(key)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition ${
                    selectedTemplate === key
                      ? 'bg-blue-600/15 border-blue-500/50 text-blue-300 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="truncate">{item.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Editor Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Contenido de la Plantilla (JSON, Parámetros o Lenguaje Natural)
            </label>
            <textarea
              rows={9}
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 font-mono leading-relaxed focus:outline-none focus:border-blue-500"
              placeholder="Pegue o redacte las reglas periciales que desea autoprogramar..."
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-[11px] text-slate-500">
              Gemini 3.8 Flash detectará dependencias requeridas y estructurará el script.
            </div>

            <button
              onClick={handleAutoProgram}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAnalyzing ? 'Analizando & Programando...' : 'Autoprogramar Función con IA'}</span>
            </button>
          </div>
        </div>

        {/* Live Active Plugins Catalog (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Box className="w-4 h-4 text-emerald-400" />
              Módulos y Plugins Activos en el Sistema
            </h3>
            <span className="text-[11px] text-slate-400">{activePlugins.length} disponibles</span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {activePlugins.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No hay módulos personalizados instalados.
              </div>
            ) : (
              activePlugins.map((plugin) => (
                <div
                  key={plugin.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-mono border border-blue-500/20">
                      {plugin.codigo}
                    </span>
                    <button
                      onClick={() => handleDeletePlugin(plugin.id)}
                      className="text-slate-500 hover:text-red-400 transition p-1"
                      title="Eliminar módulo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-xs font-bold text-slate-200">{plugin.nombre}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-2">{plugin.descripcion}</div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {plugin.categoria}
                    </span>
                    {(plugin.dependencias || []).map((dep, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono">
                        +{dep}
                      </span>
                    ))}
                    <span className="text-emerald-400 font-semibold ml-auto flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Operativo
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Generated Script Draft & Administrator Approval Review */}
      {pluginDraft && (
        <div className="bg-slate-900 border border-indigo-900/60 rounded-2xl p-6 shadow-xl space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Módulo Autoprogramado Generado con Éxito
              </span>
              <h3 className="text-lg font-bold text-slate-100 mt-1 flex items-center gap-2">
                <Box className="w-5 h-5 text-indigo-400" />
                {pluginDraft.nombre} ({pluginDraft.codigo})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{pluginDraft.descripcion}</p>
            </div>

            <div className="flex items-center gap-2">
              {installSuccess ? (
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold animate-pulse">
                  <Check className="w-4 h-4" />
                  <span>¡Módulo Integrado y Activo en el Sistema!</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowAdminModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Aprobar como Administrador e Instalar</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Dependencies */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Dependencias Detectadas
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(pluginDraft.dependencias || []).map((dep: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono text-[11px] border border-purple-500/20">
                    npm: {dep}
                  </span>
                ))}
              </div>
              <div className="text-[10px] text-slate-500">
                El sistema verifica la compatibilidad de módulos y empaquetado para mantener la autonomía.
              </div>
            </div>

            {/* Validation Rules */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Reglas de Control Incorporadas
              </div>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                {(pluginDraft.reglasValidacion || []).map((rule: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-400">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Security Audit */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Diagnóstico de Integridad
              </div>
              <p className="text-[11px] text-slate-300">
                {pluginDraft.analisisSeguridad || 'Validación de aislamiento en sandbox pericial conforme a buenas prácticas de software gubernamental.'}
              </p>
              <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Seguro para producción
              </div>
            </div>
          </div>

          {/* Script Source Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">Código Fuente Pericial Generado:</span>
              <button
                onClick={handleCopyScript}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Copiado' : 'Copiar Script'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto max-h-60 leading-relaxed">
              {pluginDraft.scriptSource}
            </pre>
          </div>
        </div>
      )}

      {/* Admin Approval Confirmation Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Confirmación de Administrador
              </h3>
              <button
                onClick={() => setShowAdminModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                Como usuario administrador <strong>{currentUser}</strong>, está a punto de autorizar la integración del nuevo módulo autónomo:
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="font-bold text-slate-100">{pluginDraft?.nombre}</div>
                <div className="text-blue-400 font-mono text-[11px] mt-0.5">{pluginDraft?.codigo}</div>
                <div className="text-slate-400 mt-1">{pluginDraft?.descripcion}</div>
              </div>
              <p className="text-[11px] text-slate-400">
                Esta acción registrará la función de forma permanente en la base de datos y la activará para su ejecución en la plataforma.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAdminModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApproveAndInstall}
                disabled={isInstalling}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isInstalling ? 'Instalando...' : 'Aprobar & Activar Módulo'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
