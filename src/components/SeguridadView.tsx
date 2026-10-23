import React from 'react';
import { ShieldCheck, History, UserCheck, RotateCcw, Database } from 'lucide-react';
import { DatabaseState } from '../types';

interface SeguridadViewProps {
  data: DatabaseState;
  currentUser: string;
  onResetSample: () => void;
}

export const SeguridadView: React.FC<SeguridadViewProps> = ({
  data,
  currentUser,
  onResetSample,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Seguridad, Roles y Registro de Actividad (Audit Trail)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Trazabilidad inmutable de cada acción ejecutada en el sistema para control de calidad de la auditoría.
          </p>
        </div>

        <button
          onClick={onResetSample}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition"
        >
          <RotateCcw className="w-4 h-4 text-slate-400" />
          <span>Restaurar Base de Prueba</span>
        </button>
      </div>

      {/* Roles & Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold mb-1">
            <UserCheck className="w-4 h-4 text-blue-400" />
            Usuario Activo
          </div>
          <div className="text-lg font-bold text-slate-100">{currentUser}</div>
          <div className="text-xs text-emerald-400 mt-1">Rol: Administrador / Auditor Principal</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold mb-1">
            <Database className="w-4 h-4 text-purple-400" />
            Almacenamiento Persistente
          </div>
          <div className="text-lg font-bold text-slate-100">Base Local Verificada</div>
          <div className="text-xs text-slate-400 mt-1">Transacciones atómicas y respaldos</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Integridad Documental
          </div>
          <div className="text-lg font-bold text-slate-100">SHA-256 Hashing</div>
          <div className="text-xs text-slate-400 mt-1">Garantía forense de no alteración</div>
        </div>
      </div>

      {/* Activity Log (Audit Trail) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            Bitácora Inmutable de Actividad (Últimas 100 Acciones)
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Total Registros: {data.actividad.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3 w-16">ID</th>
                <th className="p-3 w-40">Fecha y Hora</th>
                <th className="p-3 w-28">Usuario</th>
                <th className="p-3 w-48">Acción Realizada</th>
                <th className="p-3">Detalle Técnico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {data.actividad.map((act) => (
                <tr key={act.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono text-slate-500">{act.id}</td>
                  <td className="p-3 text-slate-400 font-mono text-[11px]">
                    {new Date(act.fecha).toLocaleString('es-DO')}
                  </td>
                  <td className="p-3 font-bold text-blue-400">{act.usuario}</td>
                  <td className="p-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                      {act.accion}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{act.detalle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
