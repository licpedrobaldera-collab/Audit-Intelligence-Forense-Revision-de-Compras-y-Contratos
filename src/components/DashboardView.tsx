import React from 'react';
import {
  FolderKanban,
  AlertTriangle,
  TrendingDown,
  DollarSign,
  Building2,
  FileText,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Flame
} from 'lucide-react';
import { DatabaseState, Expediente } from '../types';
import { ActiveTab } from './Sidebar';

interface DashboardViewProps {
  data: DatabaseState;
  selectedExpediente: Expediente | null;
  onNavigate: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  selectedExpediente,
  onNavigate,
}) => {
  // Filter by selected dossier if active
  const filteredHallazgos = selectedExpediente
    ? data.hallazgos.filter(h => h.expedienteId === selectedExpediente.id)
    : data.hallazgos;

  const filteredRiesgos = selectedExpediente
    ? data.riesgos.filter(r => r.expedienteId === selectedExpediente.id)
    : data.riesgos;

  const filteredContratos = data.contratos;
  const filteredPagos = data.pagos;

  const totalMontoObservado = filteredHallazgos.reduce((acc, h) => acc + (h.montoObservado || 0), 0);
  const hallazgosCriticos = filteredHallazgos.filter(h => h.nivel === 'Crítico');
  const hallazgosAltos = filteredHallazgos.filter(h => h.nivel === 'Alto');
  const riesgosCriticos = filteredRiesgos.filter(r => r.nivel === 'Crítico');
  const pagosDuplicados = filteredPagos.filter(p => p.alertaDuplicado);

  // Compute 5x5 Heatmap matrix (probabilidad 1-5, impacto 1-5)
  const heatmap: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));
  filteredRiesgos.forEach(r => {
    const p = Math.min(5, Math.max(1, r.probabilidad)) - 1;
    const i = Math.min(5, Math.max(1, r.impacto)) - 1;
    heatmap[p][i]++;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Dossier Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-2xl border border-slate-700/80 shadow-lg text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Tablero de Control Forense
              </span>
              <span className="text-xs text-slate-400">
                {selectedExpediente ? `Expediente: ${selectedExpediente.codigo}` : 'Vista Global Consolidada'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1.5">
              {selectedExpediente ? selectedExpediente.nombre : 'Auditoría Integral de Compras, Finanzas y Cumplimiento Legal'}
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              {selectedExpediente
                ? `${selectedExpediente.entidad} · Período: ${selectedExpediente.periodo} · Responsable: ${selectedExpediente.responsable}`
                : 'Fiscalización en tiempo real sobre la base de la Ley No. 340-06, Decreto 543-12, Ley No. 10-04, NOBACI e ISSAI/INTOSAI.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('documentos')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition shadow-md shadow-blue-600/20"
            >
              <FileText className="w-4 h-4" />
              <span>Cargar Evidencias / OCR</span>
            </button>
            <button
              onClick={() => onNavigate('ia-auditor')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium text-xs transition border border-slate-600"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>IA Auditor</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Expedientes</span>
            <FolderKanban className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">{data.expedientes.length}</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{data.expedientes.filter(e => e.estado === 'Activo').length} activos en curso</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Hallazgos Totales</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">{filteredHallazgos.length}</div>
          <div className="text-[11px] text-amber-400 mt-1">
            {hallazgosCriticos.length} críticos · {hallazgosAltos.length} altos
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Monto Observado</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-2 truncate">
            RD$ {totalMontoObservado.toLocaleString('es-DO', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Sujeto a reparo financiero</div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Riesgos Evaluados</span>
            <TrendingDown className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">{filteredRiesgos.length}</div>
          <div className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
            <Flame className="w-3 h-3" />
            <span>{riesgosCriticos.length} en umbral crítico (≥20)</span>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Contratos & Pagos</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">{filteredContratos.length} / {filteredPagos.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Contratos / Desembolsos</div>
        </div>

        {/* Metric 6 - Alert */}
        <div className={`p-4 rounded-xl border shadow-sm ${
          pagosDuplicados.length > 0
            ? 'bg-red-950/40 border-red-800/80 text-red-200'
            : 'bg-slate-900/90 border-slate-800 text-slate-400'
        }`}>
          <div className="flex items-center justify-between text-xs font-medium">
            <span>Pagos Duplicados</span>
            <ShieldAlert className={`w-4 h-4 ${pagosDuplicados.length > 0 ? 'text-red-400 animate-bounce' : 'text-slate-500'}`} />
          </div>
          <div className={`text-2xl font-bold mt-2 ${pagosDuplicados.length > 0 ? 'text-red-400' : 'text-slate-100'}`}>
            {pagosDuplicados.length}
          </div>
          <div className="text-[11px] mt-1">
            {pagosDuplicados.length > 0 ? '🚨 Alerta activa de repetición' : 'Conciliación bancaria al día'}
          </div>
        </div>
      </div>

      {/* Middle Row: Risk Heatmap 5x5 & Findings Severity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Heatmap (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                Matriz de Calor de Riesgos (5x5)
              </h3>
              <p className="text-xs text-slate-400">Probabilidad (Y) vs Impacto (X)</p>
            </div>
            <button
              onClick={() => onNavigate('riesgos')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
            >
              <span>Ver Matriz</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          {/* 5x5 Grid representation */}
          <div className="space-y-1.5">
            {[4, 3, 2, 1, 0].map((pIdx) => (
              <div key={pIdx} className="flex items-center gap-1.5 text-xs">
                <span className="w-6 text-[10px] text-slate-500 text-right font-bold">P{pIdx + 1}</span>
                <div className="grid grid-cols-5 gap-1.5 flex-1">
                  {[0, 1, 2, 3, 4].map((iIdx) => {
                    const count = heatmap[pIdx][iIdx];
                    const score = (pIdx + 1) * (iIdx + 1);
                    // Color based on score
                    const color =
                      score >= 20 ? 'bg-red-500/80 text-white' :
                      score >= 15 ? 'bg-orange-500/70 text-white' :
                      score >= 8 ? 'bg-amber-500/50 text-amber-100' :
                      'bg-emerald-600/30 text-emerald-200';

                    return (
                      <div
                        key={iIdx}
                        className={`h-9 rounded-lg flex flex-col items-center justify-center font-bold text-xs transition cursor-pointer hover:scale-105 border border-white/10 ${color}`}
                        title={`Probabilidad: ${pIdx + 1}, Impacto: ${iIdx + 1} (Score: ${score}) -> ${count} riesgos`}
                        onClick={() => onNavigate('riesgos')}
                      >
                        <span className="text-[11px] leading-none">{count > 0 ? count : ''}</span>
                        <span className="text-[8px] opacity-70 font-normal leading-none">{score}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pl-8 pt-1">
              <span className="flex-1 text-center font-bold">I1</span>
              <span className="flex-1 text-center font-bold">I2</span>
              <span className="flex-1 text-center font-bold">I3</span>
              <span className="flex-1 text-center font-bold">I4</span>
              <span className="flex-1 text-center font-bold">I5</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-3 pt-3 border-t border-slate-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-600/40"></span> Bajo (1-7)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500/60"></span> Medio (8-14)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-orange-500/80"></span> Alto (15-19)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-red-600"></span> Crítico (20-25)
            </span>
          </div>
        </div>

        {/* Findings by Status & Severities (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Estado de Hallazgos y Severidad Normativa
                </h3>
                <p className="text-xs text-slate-400">Distribución de observaciones según su impacto jurídico y fiscal</p>
              </div>
              <button
                onClick={() => onNavigate('hallazgos')}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
              >
                <span>Abrir Editor en Línea</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {/* Severity Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="bg-red-950/30 border border-red-900/50 p-3 rounded-lg text-center">
                <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider">Crítico</span>
                <div className="text-2xl font-black text-red-300 mt-1">{hallazgosCriticos.length}</div>
                <div className="text-[10px] text-red-400/80">Fraccionamiento / Falta fianza</div>
              </div>
              <div className="bg-orange-950/30 border border-orange-900/50 p-3 rounded-lg text-center">
                <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">Alto</span>
                <div className="text-2xl font-black text-orange-300 mt-1">{hallazgosAltos.length}</div>
                <div className="text-[10px] text-orange-400/80">Sin acta / Duplicados</div>
              </div>
              <div className="bg-amber-950/30 border border-amber-900/50 p-3 rounded-lg text-center">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Medio</span>
                <div className="text-2xl font-black text-amber-300 mt-1">
                  {filteredHallazgos.filter(h => h.nivel === 'Medio').length}
                </div>
                <div className="text-[10px] text-amber-400/80">Inconsistencia menor</div>
              </div>
              <div className="bg-emerald-950/30 border border-emerald-900/50 p-3 rounded-lg text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Bajo</span>
                <div className="text-2xl font-black text-emerald-300 mt-1">
                  {filteredHallazgos.filter(h => h.nivel === 'Bajo').length}
                </div>
                <div className="text-[10px] text-emerald-400/80">Revisión preventiva</div>
              </div>
            </div>

            {/* Status Breakdown Progress Bars */}
            <div className="space-y-3">
              {[
                { label: 'Abierto (Pendiente de descargo)', status: 'Abierto', color: 'bg-red-500' },
                { label: 'En Proceso de investigación', status: 'En proceso', color: 'bg-amber-500' },
                { label: 'Subsanado por la entidad', status: 'Subsanado', color: 'bg-blue-500' },
                { label: 'Cerrado / Dictaminado', status: 'Cerrado', color: 'bg-emerald-500' },
              ].map(item => {
                const count = filteredHallazgos.filter(h => h.estado === item.status).length;
                const pct = filteredHallazgos.length > 0 ? (count / filteredHallazgos.length) * 100 : 0;
                return (
                  <div key={item.status} className="text-xs">
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>{item.label}</span>
                      <span className="font-bold">{count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Elementos estructurados: Condición · Criterio · Causa · Efecto · Recomendación</span>
            <button
              onClick={() => onNavigate('ia-auditor')}
              className="text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Generar con IA →
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Findings Feed & Duplicates/Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hallazgos Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Últimos Hallazgos de Auditoría Constituidos
            </h3>
            <button
              onClick={() => onNavigate('hallazgos')}
              className="text-xs text-blue-400 hover:underline"
            >
              Ver todos ({filteredHallazgos.length})
            </button>
          </div>

          <div className="space-y-3">
            {filteredHallazgos.slice(0, 3).map(h => (
              <div
                key={h.id}
                onClick={() => onNavigate('hallazgos')}
                className="p-3.5 rounded-lg bg-slate-800/70 border border-slate-700/80 hover:border-blue-500/50 transition cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{h.titulo}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    h.nivel === 'Crítico' ? 'bg-red-500/20 text-red-300' :
                    h.nivel === 'Alto' ? 'bg-orange-500/20 text-orange-300' :
                    'bg-amber-500/20 text-amber-300'
                  }`}>
                    {h.nivel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1.5">{h.condicion}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-700/50">
                  <span className="text-slate-400 font-medium">Ref: {h.normativaReferencia || 'Ley 340-06'}</span>
                  <span className="text-emerald-400 font-bold">
                    RD$ {(h.montoObservado || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Alerts & Duplicate Payment Watchdog */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Alertas de Control Previo & Duplicidad Forense
            </h3>
            <button
              onClick={() => onNavigate('pagos')}
              className="text-xs text-blue-400 hover:underline"
            >
              Auditar Pagos
            </button>
          </div>

          <div className="space-y-3">
            {pagosDuplicados.length > 0 ? (
              pagosDuplicados.map(p => (
                <div key={p.id} className="p-3.5 rounded-lg bg-red-950/30 border border-red-800/60 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
                      Desembolso Duplicado Detectado
                    </span>
                    <span className="text-red-400 font-mono font-bold">
                      RD$ {p.monto.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="text-slate-300 mt-1">
                    <strong>Beneficiario:</strong> {p.beneficiario} · <strong>Ref:</strong> {p.referencia}
                  </div>
                  <div className="text-[11px] text-red-300/80 mt-1">
                    {p.descripcion}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-800 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                No se detectaron duplicaciones en la muestra actual de pagos.
              </div>
            )}

            {/* Normative Warning Card */}
            <div className="p-3.5 rounded-lg bg-blue-950/20 border border-blue-900/50 text-xs text-slate-300">
              <div className="font-bold text-blue-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Alerta Normativa: Comprobación de Pólizas y Retenciones
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Conforme al Art. 31 de la Ley 340-06 y Art. 85 del Dec. 543-12, verificar que los pagos de cubicación cuenten con fianza vigente del 10% y retención técnica del 5%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
