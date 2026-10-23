import React, { useState } from 'react';
import { FolderKanban, Plus, Edit2, Trash2, CheckCircle2, Clock, Search } from 'lucide-react';
import { Expediente, DatabaseState } from '../types';

interface ExpedientesViewProps {
  data: DatabaseState;
  selectedExpedienteId: number | null;
  onSelectExpediente: (id: number | null) => void;
  onSaveExpediente: (exp: Partial<Expediente>) => Promise<void>;
  onDeleteExpediente: (id: number) => Promise<void>;
}

export const ExpedientesView: React.FC<ExpedientesViewProps> = ({
  data,
  selectedExpedienteId,
  onSelectExpediente,
  onSaveExpediente,
  onDeleteExpediente,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<Partial<Expediente> | null>(null);

  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [entidad, setEntidad] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [responsable, setResponsable] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [estado, setEstado] = useState<'Activo' | 'En revisión' | 'Cerrado' | 'Suspendido'>('Activo');

  const openNewModal = () => {
    setEditingExp(null);
    setCodigo(`AUD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`);
    setNombre('');
    setEntidad('');
    setObjetivo('');
    setResponsable('Auditor Principal');
    setPeriodo('Ejercicio Fiscal 2025-2026');
    setEstado('Activo');
    setIsModalOpen(true);
  };

  const openEditModal = (exp: Expediente) => {
    setEditingExp(exp);
    setCodigo(exp.codigo);
    setNombre(exp.nombre);
    setEntidad(exp.entidad);
    setObjetivo(exp.objetivo);
    setResponsable(exp.responsable);
    setPeriodo(exp.periodo);
    setEstado(exp.estado);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim() || !nombre.trim()) {
      alert('Código y Nombre son obligatorios.');
      return;
    }
    await onSaveExpediente({
      id: editingExp?.id,
      codigo,
      nombre,
      entidad,
      objetivo,
      responsable,
      periodo,
      estado,
    });
    setIsModalOpen(false);
  };

  const filtered = data.expedientes.filter(e =>
    e.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.entidad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <FolderKanban className="w-5 h-5 text-blue-400" />
            Expedientes de Auditoría y Fiscalización
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestión y control de carpetas de auditoría gubernamental, alcance y asignación de auditores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar expediente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 w-48 sm:w-64"
            />
          </div>
          <button
            onClick={openNewModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Expediente</span>
          </button>
        </div>
      </div>

      {/* Expedientes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((exp) => {
          const isSelected = exp.id === selectedExpedienteId;
          const linkedHallazgos = data.hallazgos.filter(h => h.expedienteId === exp.id);
          const linkedRiesgos = data.riesgos.filter(r => r.expedienteId === exp.id);
          const linkedEvidencias = data.evidencias.filter(e => e.expedienteId === exp.id);
          const totalMonto = linkedHallazgos.reduce((acc, h) => acc + (h.montoObservado || 0), 0);

          return (
            <div
              key={exp.id}
              className={`bg-slate-900 rounded-2xl p-5 border transition shadow-sm flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {exp.codigo}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    exp.estado === 'Activo' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    exp.estado === 'En revisión' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {exp.estado}
                  </span>
                </div>

                <h3 className="font-bold text-slate-100 text-sm mt-3 line-clamp-2">{exp.nombre}</h3>
                <p className="text-xs text-blue-400 font-medium mt-1">{exp.entidad || 'Entidad no especificada'}</p>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{exp.objetivo}</p>

                {/* Counters */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-center">
                  <div className="bg-slate-800/50 p-2 rounded-lg">
                    <div className="text-xs text-slate-400">Hallazgos</div>
                    <div className="text-sm font-bold text-amber-400">{linkedHallazgos.length}</div>
                  </div>
                  <div className="bg-slate-800/50 p-2 rounded-lg">
                    <div className="text-xs text-slate-400">Riesgos</div>
                    <div className="text-sm font-bold text-red-400">{linkedRiesgos.length}</div>
                  </div>
                  <div className="bg-slate-800/50 p-2 rounded-lg">
                    <div className="text-xs text-slate-400">Evidencias</div>
                    <div className="text-sm font-bold text-blue-400">{linkedEvidencias.length}</div>
                  </div>
                </div>

                {totalMonto > 0 && (
                  <div className="mt-3 p-2 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-[11px] text-emerald-400 flex justify-between items-center">
                    <span>Monto Observado:</span>
                    <span className="font-bold">RD$ {totalMonto.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-slate-800">
                <button
                  onClick={() => onSelectExpediente(isSelected ? null : exp.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {isSelected ? '✓ Seleccionado' : 'Fijar como Activo'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(exp)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                    title="Editar expediente"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar el expediente ${exp.codigo}?`)) {
                        onDeleteExpediente(exp.id);
                      }
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-950/40 text-slate-400 hover:text-red-400 transition"
                    title="Eliminar expediente"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 mb-4">
              {editingExp ? 'Editar Expediente de Auditoría' : 'Crear Nuevo Expediente de Auditoría'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Código Único *</label>
                  <input
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Estado</label>
                  <select
                    value={estado}
                    onChange={(e: any) => setEstado(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Activo">Activo</option>
                    <option value="En revisión">En revisión</option>
                    <option value="Cerrado">Cerrado</option>
                    <option value="Suspendido">Suspendido</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nombre de la Auditoría *</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Auditoría de Adquisiciones de Insumos Médicos"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Entidad Fiscalizada</label>
                  <input
                    type="text"
                    value={entidad}
                    onChange={(e) => setEntidad(e.target.value)}
                    placeholder="Ej. Ministerio de Salud Pública"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Período Auditado</label>
                  <input
                    type="text"
                    value={periodo}
                    onChange={(e) => setPeriodo(e.target.value)}
                    placeholder="Ej. Enero - Diciembre 2025"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Auditor Responsable</label>
                <input
                  type="text"
                  value={responsable}
                  onChange={(e) => setResponsable(e.target.value)}
                  placeholder="Nombre del auditor o comisionado"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Objetivo y Alcance</label>
                <textarea
                  rows={3}
                  value={objetivo}
                  onChange={(e) => setObjetivo(e.target.value)}
                  placeholder="Detalle el alcance legal, presupuestario y técnico del examen..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md"
                >
                  Guardar Expediente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
