import React, { useState } from 'react';
import {
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Calendar,
  CheckSquare,
  Square,
  Sparkles
} from 'lucide-react';
import { DatabaseState, AutonomousCheckpoint } from '../types';
import { api } from '../services/api';

interface AutonomousCheckpointBannerProps {
  data: DatabaseState;
  currentUser: string;
  onRefreshData: () => Promise<void>;
}

export const AutonomousCheckpointBanner: React.FC<AutonomousCheckpointBannerProps> = ({
  data,
  currentUser,
  onRefreshData,
}) => {
  const checkpoint = data.checkpoint;
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleSyncCheckpoint = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await api.syncCheckpoint(currentUser);
      if (res.success) {
        setSyncMessage('Estado y tareas pendientes persistidos con éxito. Puede continuar mañana exactamente en este punto.');
        await onRefreshData();
      }
    } catch (err: any) {
      alert(`Error en sincronización: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      await api.toggleCheckpointTask(taskId, currentUser);
      await onRefreshData();
    } catch (err: any) {
      alert(`Error al actualizar tarea: ${err.message}`);
    }
  };

  if (!checkpoint) return null;

  const todayStr = new Date().toLocaleDateString('es-DO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950/40 border border-slate-700/80 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-100">
                Sesión de Auditoría &amp; Persistencia Autónoma
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Autónomo al Día
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Fecha de trabajo: <span className="text-slate-300 font-medium capitalize">{todayStr}</span> &bull; {checkpoint.totalObservacionesAlDia} observaciones registradas &bull; {checkpoint.pendientesDeProcesar} pendientes
            </p>
          </div>
        </div>

        <button
          onClick={handleSyncCheckpoint}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Guardando...' : 'Sincronizar y Guardar Estado'}
        </button>
      </div>

      {syncMessage && (
        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
          <span>{syncMessage}</span>
          <button onClick={() => setSyncMessage(null)} className="text-[11px] hover:underline ml-2">Descartar</button>
        </div>
      )}

      {/* Pending Tasks Queue to continue tomorrow */}
      {checkpoint.tareasPendientes && checkpoint.tareasPendientes.length > 0 && (
        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Cola de Verificación Pericial Pendiente para Continuar:</span>
            <span className="text-slate-500 lowercase">marcar al completar</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {checkpoint.tareasPendientes.map((task) => {
              const isDone = task.estado === 'Completado';
              return (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer text-xs transition ${
                    isDone
                      ? 'bg-slate-900/60 border-slate-800 text-slate-500 line-through'
                      : 'bg-slate-800/50 border-slate-700/80 text-slate-200 hover:border-indigo-500/40'
                  }`}
                >
                  <button className="mt-0.5 text-indigo-400 shrink-0">
                    {isDone ? (
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{task.tarea}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                      <span className="text-indigo-400">{task.modulo}</span>
                      <span>&bull;</span>
                      <span className={task.prioridad === 'Crítica' ? 'text-rose-400 font-semibold' : 'text-amber-400'}>
                        {task.prioridad}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
