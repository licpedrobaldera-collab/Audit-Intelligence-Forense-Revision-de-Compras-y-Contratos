import React, { useState } from 'react';
import {
  Settings,
  Globe,
  DollarSign,
  Calendar,
  Save,
  CheckCircle2,
  Database,
  Shield,
  Layers,
  FileCheck,
  RefreshCw
} from 'lucide-react';
import { AppSettings, DatabaseState } from '../types';

interface SettingsViewProps {
  data: DatabaseState;
  currentUser: string;
  onUpdateSettings: (settings: Partial<AppSettings> & { user: string }) => Promise<void>;
  onResetSample: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  data,
  currentUser,
  onUpdateSettings,
  onResetSample,
}) => {
  const currentSettings = data.settings || {
    id: 1,
    language: 'es',
    country: 'República Dominicana',
    currency: 'DOP',
    dateFormat: 'DD/MM/YYYY',
  };

  const [formData, setFormData] = useState<AppSettings>(currentSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateSettings({
        ...formData,
        user: currentUser,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(`Error al guardar configuración: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-indigo-400" />
            Configuración del Sistema & Parámetros Internacionales
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de jurisdicción normativa, moneda de cálculo pericial, formato cronológico e integridad del motor de base de datos (Diagnóstico 1).
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold animate-pulse">
            <CheckCircle2 className="w-4 h-4" />
            <span>Configuración actualizada exitosamente</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Configuration Form */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3 mb-5">
            <Globe className="w-4 h-4 text-blue-400" />
            Localización & Parámetros Contables
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Jurisdicción / País de Fiscalización
              </label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="República Dominicana">República Dominicana (Cámara de Cuentas / DIGECOG / DGCP)</option>
                <option value="USA">Estados Unidos (GAO Yellow Book / GAGAS)</option>
                <option value="Internacional">Internacional (INTOSAI / Normas ISSAI)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Determina las plantillas normativas predeterminadas y los baremos de fiscalización aplicables.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Moneda de Auditoría
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="DOP">DOP - Peso Dominicano (RD$)</option>
                  <option value="USD">USD - Dólar Estadounidense ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  Formato de Fecha
                </label>
                <select
                  value={formData.dateFormat}
                  onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (Estándar Latinoamericano / Europeo)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (Estándar ISO 8601)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Idioma de la Interfaz & Reportes
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="es">Español (Castellano Técnico Forense)</option>
                <option value="en">English (US Government Auditing Standards)</option>
              </select>
            </div>

            {/* Live Preview Card */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Vista Previa de Representación
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Ejemplo Monto Observado:</span>
                  <div className="text-emerald-400 font-bold font-mono text-sm mt-0.5">
                    {formData.currency} $4,820,500.00
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Ejemplo Fecha Acta:</span>
                  <div className="text-slate-200 font-bold font-mono text-sm mt-0.5">
                    {formData.dateFormat === 'DD/MM/YYYY' ? '23/10/2026' : '2026-10-23'}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Guardando...' : 'Guardar Cambios de Configuración'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Database & Enterprise Architecture Health */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Database className="w-4 h-4 text-emerald-400" />
              Estado de Tablas & Migraciones Activas
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200 font-mono">document_versions</div>
                  <div className="text-[11px] text-slate-400">Historial y control de versiones SHA256</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Activa ({data.documentVersions?.length || 0})
                </span>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200 font-mono">findings_evidence</div>
                  <div className="text-[11px] text-slate-400">Cita pericial página/párrafo/artículo</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Activa ({data.findingsEvidence?.length || 0})
                </span>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200 font-mono">normative_catalog</div>
                  <div className="text-[11px] text-slate-400">Catálogo pericial multijurisdicción</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Activa ({data.normativeCatalog?.length || 0})
                </span>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200 font-mono">workflow</div>
                  <div className="text-[11px] text-slate-400">6 estados de aprobación y auditoría</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Activa ({data.workflows?.length || 0})
                </span>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200 font-mono">settings</div>
                  <div className="text-[11px] text-slate-400">Configuración global persistente</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Activa (1)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action: Reset sample */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-400" />
              Restauración del Caso Modelo Pericial
            </h3>
            <p className="text-xs text-slate-400">
              ¿Desea restablecer el caso de auditoría modelo de contratación pública con expedientes, hallazgos y evidencias verificadas?
            </p>
            <button
              onClick={onResetSample}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              <RefreshCw className="w-4 h-4 text-amber-400" />
              <span>Restablecer Datos de Demostración</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
