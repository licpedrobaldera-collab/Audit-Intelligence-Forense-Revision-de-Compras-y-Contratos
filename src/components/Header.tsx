import React from 'react';
import { ShieldCheck, Sparkles, FolderKanban, RotateCcw, FileArchive } from 'lucide-react';
import { Expediente } from '../types';

interface HeaderProps {
  expedientes: Expediente[];
  selectedExpedienteId: number | null;
  onSelectExpediente: (id: number | null) => void;
  onResetSample: () => void;
  onExportZip: () => void;
  currentUser: string;
}

export const Header: React.FC<HeaderProps> = ({
  expedientes,
  selectedExpedienteId,
  onSelectExpediente,
  onResetSample,
  onExportZip,
  currentUser,
}) => {
  const activeExpediente = expedientes.find(e => e.id === selectedExpedienteId);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-xl tracking-wider">
          AI
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg text-slate-100 tracking-tight">Audit Intelligence Pro</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Enterprise 2.5
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Auditoría Forense · Ley 340-06 · Dec. 543-12 · Ley 10-04 · NOBACI · ISSAI
          </p>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2.5">
        {/* Active Dossier Selector */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1 text-xs">
          <FolderKanban className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="text-slate-400 font-medium">Expediente:</span>
          <select
            value={selectedExpedienteId ?? ''}
            onChange={(e) => onSelectExpediente(e.target.value ? Number(e.target.value) : null)}
            className="bg-transparent text-slate-100 text-xs font-medium focus:outline-none cursor-pointer max-w-[210px] truncate"
          >
            <option value="" className="bg-slate-800 text-slate-200">Todos los expedientes</option>
            {expedientes.map(exp => (
              <option key={exp.id} value={exp.id} className="bg-slate-800 text-slate-200">
                {exp.codigo} - {exp.nombre.slice(0, 32)}...
              </option>
            ))}
          </select>
        </div>

        {/* AI Engine Status indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Gemini 3.8 Flash Auditor</span>
        </div>

        {/* Quick Action: Export Full ZIP */}
        <button
          onClick={onExportZip}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition shadow-sm"
          title="Descargar paquete consolidado ZIP con todos los informes"
        >
          <FileArchive className="w-3.5 h-3.5" />
          <span>Expediente ZIP</span>
        </button>

        {/* Reset Sample Benchmark */}
        <button
          onClick={onResetSample}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition border border-slate-700"
          title="Restaurar caso modelo de auditoría con datos de prueba reales"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Caso Modelo</span>
        </button>

        {/* User profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
            {currentUser[0]?.toUpperCase() || 'A'}
          </div>
          <div className="text-left hidden md:block">
            <div className="text-xs font-medium text-slate-200 leading-none">{currentUser}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Auditor Principal</div>
          </div>
        </div>
      </div>
    </header>
  );
};
