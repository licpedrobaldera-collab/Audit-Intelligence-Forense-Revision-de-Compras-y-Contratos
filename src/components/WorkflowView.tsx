import React, { useState } from 'react';
import {
  GitPullRequest,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FolderCheck,
  Send,
  MessageSquare,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { DatabaseState, WorkflowStatus } from '../types';

interface WorkflowViewProps {
  data: DatabaseState;
  currentUser: string;
  onTransitionWorkflow: (objectType: 'Hallazgo' | 'Riesgo' | 'Evidencia' | 'Informe', objectId: number, newStatus: WorkflowStatus, comments?: string) => Promise<void>;
}

export const WorkflowView: React.FC<WorkflowViewProps> = ({
  data,
  currentUser,
  onTransitionWorkflow,
}) => {
  const [selectedType, setSelectedType] = useState<'todos' | 'Hallazgo' | 'Riesgo' | 'Evidencia'>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState<{
    type: 'Hallazgo' | 'Riesgo' | 'Evidencia' | 'Informe';
    id: number;
    title: string;
    targetStatus: WorkflowStatus;
  } | null>(null);
  const [comments, setComments] = useState('');

  const statuses: { id: WorkflowStatus; label: string; color: string; border: string; bg: string }[] = [
    { id: 'BORRADOR', label: 'Borrador Inicial', color: 'text-slate-300', border: 'border-slate-700', bg: 'bg-slate-800/60' },
    { id: 'PENDIENTE', label: 'Pendiente Revisión', color: 'text-amber-400', border: 'border-amber-600/50', bg: 'bg-amber-950/20' },
    { id: 'REVISION', label: 'En Supervisión Técnica', color: 'text-sky-400', border: 'border-sky-600/50', bg: 'bg-sky-950/20' },
    { id: 'APROBADO', label: 'Aprobado / Conforme', color: 'text-emerald-400', border: 'border-emerald-600/50', bg: 'bg-emerald-950/20' },
    { id: 'RECHAZADO', label: 'Rechazado / Observado', color: 'text-red-400', border: 'border-red-600/50', bg: 'bg-red-950/20' },
    { id: 'CERRADO', label: 'Cerrado Oficial', color: 'text-purple-400', border: 'border-purple-600/50', bg: 'bg-purple-950/20' },
  ];

  // Consolidate objects that have workflow status
  const workflowObjects: {
    type: 'Hallazgo' | 'Riesgo' | 'Evidencia';
    id: number;
    title: string;
    status: WorkflowStatus;
    severity?: string;
    monto?: number;
    date: string;
    details: string;
  }[] = [];

  if (selectedType === 'todos' || selectedType === 'Hallazgo') {
    data.hallazgos.forEach(h => {
      workflowObjects.push({
        type: 'Hallazgo',
        id: h.id,
        title: h.titulo,
        status: h.workflowStatus || 'BORRADOR',
        severity: h.nivel,
        monto: h.montoObservado,
        date: h.createdAt,
        details: h.condicion
      });
    });
  }

  if (selectedType === 'todos' || selectedType === 'Riesgo') {
    data.riesgos.forEach(r => {
      workflowObjects.push({
        type: 'Riesgo',
        id: r.id,
        title: `${r.categoria}: ${r.descripcion.slice(0, 50)}...`,
        status: r.workflowStatus || 'BORRADOR',
        severity: r.nivel,
        date: r.createdAt,
        details: r.mitigacion
      });
    });
  }

  if (selectedType === 'todos' || selectedType === 'Evidencia') {
    data.evidencias.forEach(ev => {
      workflowObjects.push({
        type: 'Evidencia',
        id: ev.id,
        title: ev.nombreOriginal,
        status: ev.workflowStatus || 'BORRADOR',
        date: ev.createdAt,
        details: `Versión v${ev.versionActual || 1} · SHA-256: ${ev.sha256.slice(0, 16)}...`
      });
    });
  }

  const promptTransition = (
    type: 'Hallazgo' | 'Riesgo' | 'Evidencia' | 'Informe',
    id: number,
    title: string,
    targetStatus: WorkflowStatus
  ) => {
    setTransitionTarget({ type, id, title, targetStatus });
    setComments('');
    setIsModalOpen(true);
  };

  const confirmTransition = async () => {
    if (!transitionTarget) return;
    await onTransitionWorkflow(
      transitionTarget.type,
      transitionTarget.id,
      transitionTarget.targetStatus,
      comments
    );
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
              <GitPullRequest className="w-5 h-5 text-indigo-400" />
              Workflow de Aprobación y Control de Calidad
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              6 Estados de Supervisión
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Flujo mandatorio de aprobación para Hallazgos, Riesgos, Evidencias e Informes: Borrador → Pendiente → Revisión → Aprobado / Rechazado → Cerrado.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
          {(['todos', 'Hallazgo', 'Riesgo', 'Evidencia'] as const).map(t => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                selectedType === t ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t === 'todos' ? 'Todos los Entregables' : t + 's'}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start">
        {statuses.map(st => {
          const items = workflowObjects.filter(item => item.status === st.id);
          return (
            <div
              key={st.id}
              className={`bg-slate-900/90 border ${st.border} rounded-2xl p-3.5 flex flex-col min-h-[460px] shadow-sm`}
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
                <span className={`text-xs font-bold ${st.color}`}>{st.label}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {items.length}
                </span>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto pr-0.5">
                {items.length === 0 ? (
                  <div className="p-4 text-center text-[11px] text-slate-600 border border-dashed border-slate-800 rounded-xl">
                    Sin elementos
                  </div>
                ) : (
                  items.map(item => (
                    <div
                      key={`${item.type}-${item.id}`}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition text-xs space-y-2 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-blue-400 border border-slate-800 font-mono">
                          {item.type} #{item.id}
                        </span>
                        {item.severity && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            item.severity === 'Crítico' ? 'bg-red-500/20 text-red-300' :
                            item.severity === 'Alto' ? 'bg-orange-500/20 text-orange-300' :
                            'bg-amber-500/20 text-amber-300'
                          }`}>
                            {item.severity}
                          </span>
                        )}
                      </div>

                      <div className="font-bold text-slate-200 line-clamp-2 leading-snug">
                        {item.title}
                      </div>

                      <div className="text-[10px] text-slate-400 line-clamp-2">
                        {item.details}
                      </div>

                      {item.monto !== undefined && item.monto > 0 && (
                        <div className="text-[10px] font-mono text-emerald-400 font-bold">
                          RD$ {item.monto.toLocaleString()}
                        </div>
                      )}

                      {/* Transition Action Buttons */}
                      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1">
                        {st.id === 'BORRADOR' && (
                          <button
                            onClick={() => promptTransition(item.type, item.id, item.title, 'PENDIENTE')}
                            className="w-full py-1 rounded bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-[10px] font-semibold text-center border border-amber-600/30 transition"
                          >
                            Enviar a Revisión →
                          </button>
                        )}
                        {st.id === 'PENDIENTE' && (
                          <button
                            onClick={() => promptTransition(item.type, item.id, item.title, 'REVISION')}
                            className="w-full py-1 rounded bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 text-[10px] font-semibold text-center border border-sky-600/30 transition"
                          >
                            Iniciar Supervisión →
                          </button>
                        )}
                        {st.id === 'REVISION' && (
                          <>
                            <button
                              onClick={() => promptTransition(item.type, item.id, item.title, 'APROBADO')}
                              className="flex-1 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-[10px] font-semibold text-center border border-emerald-600/30 transition"
                            >
                              ✓ Aprobar
                            </button>
                            <button
                              onClick={() => promptTransition(item.type, item.id, item.title, 'RECHAZADO')}
                              className="flex-1 py-1 rounded bg-red-600/20 hover:bg-red-600/30 text-red-300 text-[10px] font-semibold text-center border border-red-600/30 transition"
                            >
                              ✗ Observar
                            </button>
                          </>
                        )}
                        {(st.id === 'APROBADO' || st.id === 'RECHAZADO') && (
                          <button
                            onClick={() => promptTransition(item.type, item.id, item.title, 'CERRADO')}
                            className="w-full py-1 rounded bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-[10px] font-semibold text-center border border-purple-600/30 transition"
                          >
                            Cerrar Dictamen →
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Transition Modal with Comments */}
      {isModalOpen && transitionTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-400" />
              Transición de Workflow de Calidad
            </h3>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div>
                <span className="text-slate-400 font-medium">Elemento:</span>{' '}
                <strong className="text-slate-200">{transitionTarget.type} #{transitionTarget.id}</strong>
              </div>
              <div className="text-slate-300 font-semibold">{transitionTarget.title}</div>
              <div className="pt-2 text-indigo-300 font-bold">
                Nuevo Estado Destino: <span className="underline">{transitionTarget.targetStatus}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Comentarios / Observaciones del Auditor o Supervisor:
              </label>
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Indique fundamentos técnicos o descargos recibidos..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmTransition}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md"
              >
                Confirmar Transición
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
