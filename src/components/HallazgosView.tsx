import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Edit3,
  Trash2,
  FileDown,
  Search,
  Filter,
  CheckCircle2,
  Save,
  Tag,
  Scale
} from 'lucide-react';
import { Hallazgo, DatabaseState } from '../types';
import { exportService } from '../services/exportService';

interface HallazgosViewProps {
  data: DatabaseState;
  selectedExpedienteId: number | null;
  onSaveHallazgo: (h: Partial<Hallazgo>) => Promise<void>;
  onDeleteHallazgo: (id: number) => Promise<void>;
}

export const HallazgosView: React.FC<HallazgosViewProps> = ({
  data,
  selectedExpedienteId,
  onSaveHallazgo,
  onDeleteHallazgo,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNivel, setSelectedNivel] = useState<string>('todos');
  const [selectedEstado, setSelectedEstado] = useState<string>('todos');

  // Editing drawer / modal state
  const [editingFinding, setEditingFinding] = useState<Partial<Hallazgo> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for the 6 components
  const [titulo, setTitulo] = useState('');
  const [condicion, setCondicion] = useState('');
  const [criterio, setCriterio] = useState('');
  const [causa, setCausa] = useState('');
  const [efecto, setEfecto] = useState('');
  const [recomendacion, setRecomendacion] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [montoObservado, setMontoObservado] = useState<number>(0);
  const [nivel, setNivel] = useState<'Crítico' | 'Alto' | 'Medio' | 'Bajo'>('Medio');
  const [estado, setEstado] = useState<'Abierto' | 'En proceso' | 'Subsanado' | 'Cerrado'>('Abierto');
  const [normativaReferencia, setNormativaReferencia] = useState('');

  const openNewModal = () => {
    setEditingFinding(null);
    setTitulo('');
    setCondicion('');
    setCriterio('Ley No. 340-06 sobre Compras y Contrataciones Públicas y Decreto 543-12.');
    setCausa('Falta de control interno y supervisión previa.');
    setEfecto('Riesgo de daño patrimonial y afectación a la transparencia.');
    setRecomendacion('Implementar plan de acción correctivo y subsanar las observaciones.');
    setConclusion('Inconsistencia en proceso de fiscalización.');
    setMontoObservado(0);
    setNivel('Medio');
    setEstado('Abierto');
    setNormativaReferencia('Ley 340-06');
    setIsModalOpen(true);
  };

  const openEditModal = (h: Hallazgo) => {
    setEditingFinding(h);
    setTitulo(h.titulo);
    setCondicion(h.condicion);
    setCriterio(h.criterio);
    setCausa(h.causa);
    setEfecto(h.efecto);
    setRecomendacion(h.recomendacion);
    setConclusion(h.conclusion || '');
    setMontoObservado(h.montoObservado || 0);
    setNivel(h.nivel);
    setEstado(h.estado);
    setNormativaReferencia(h.normativaReferencia || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      alert('El título del hallazgo es obligatorio.');
      return;
    }
    await onSaveHallazgo({
      id: editingFinding?.id,
      expedienteId: selectedExpedienteId,
      titulo,
      condicion,
      criterio,
      causa,
      efecto,
      recomendacion,
      conclusion,
      montoObservado: Number(montoObservado) || 0,
      nivel,
      estado,
      normativaReferencia,
    });
    setIsModalOpen(false);
  };

  // Quick inline status change directly from table
  const handleQuickStatusChange = async (h: Hallazgo, newStatus: any) => {
    await onSaveHallazgo({
      ...h,
      estado: newStatus,
    });
  };

  // Filter findings
  const filtered = data.hallazgos.filter(h => {
    const matchesExp = selectedExpedienteId ? h.expedienteId === selectedExpedienteId : true;
    const matchesSearch =
      h.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.condicion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.criterio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNivel = selectedNivel === 'todos' || h.nivel === selectedNivel;
    const matchesEstado = selectedEstado === 'todos' || h.estado === selectedEstado;
    return matchesExp && matchesSearch && matchesNivel && matchesEstado;
  });

  const totalObservado = filtered.reduce((acc, h) => acc + (h.montoObservado || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header and Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Matriz de Hallazgos y Editor en Línea
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700">
              {filtered.length} registrados
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Estructuración formal de los 6 componentes: Condición, Criterio, Causa, Efecto, Recomendación y Conclusión.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={openNewModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Hallazgo</span>
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por título, condición, ley o criterio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 w-full"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Nivel filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Severidad:</span>
            <select
              value={selectedNivel}
              onChange={(e) => setSelectedNivel(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none"
            >
              <option value="todos">Todas</option>
              <option value="Crítico">Crítico</option>
              <option value="Alto">Alto</option>
              <option value="Medio">Medio</option>
              <option value="Bajo">Bajo</option>
            </select>
          </div>

          {/* Estado filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Estado:</span>
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none"
            >
              <option value="todos">Todos</option>
              <option value="Abierto">Abierto</option>
              <option value="En proceso">En proceso</option>
              <option value="Subsanado">Subsanado</option>
              <option value="Cerrado">Cerrado</option>
            </select>
          </div>

          <div className="text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-3 py-1 rounded-lg">
            Monto: RD$ {totalObservado.toLocaleString('es-DO', { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Findings Table with Inline Quick-Editing */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5 w-12 text-center">#</th>
                <th className="p-3.5">Título del Hallazgo</th>
                <th className="p-3.5 w-32">Severidad</th>
                <th className="p-3.5 w-36">Estado (Editable)</th>
                <th className="p-3.5 w-36 text-right">Monto Observado</th>
                <th className="p-3.5 w-32">Normativa</th>
                <th className="p-3.5 w-28 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No se encontraron hallazgos con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filtered.map((h, i) => (
                  <tr key={h.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-3.5 text-center font-mono text-slate-500">{i + 1}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-100">{h.titulo}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{h.condicion}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        h.nivel === 'Crítico' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                        h.nivel === 'Alto' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                        h.nivel === 'Medio' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {h.nivel}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={h.estado}
                        onChange={(e) => handleQuickStatusChange(h, e.target.value)}
                        className={`text-[11px] font-medium rounded-lg px-2 py-1 border focus:outline-none cursor-pointer ${
                          h.estado === 'Abierto' ? 'bg-red-950/40 text-red-300 border-red-800/60' :
                          h.estado === 'En proceso' ? 'bg-amber-950/40 text-amber-300 border-amber-800/60' :
                          h.estado === 'Subsanado' ? 'bg-blue-950/40 text-blue-300 border-blue-800/60' :
                          'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                        }`}
                      >
                        <option value="Abierto">Abierto</option>
                        <option value="En proceso">En proceso</option>
                        <option value="Subsanado">Subsanado</option>
                        <option value="Cerrado">Cerrado</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                      RD$ {(h.montoObservado || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-[11px] text-slate-400 font-mono truncate max-w-[130px]" title={h.normativaReferencia}>
                      {h.normativaReferencia || 'Ley 340-06'}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(h)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 transition"
                          title="Editar los 6 componentes del hallazgo"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar hallazgo: ${h.titulo}?`)) {
                              onDeleteHallazgo(h.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 hover:text-white text-slate-300 transition"
                          title="Eliminar hallazgo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal for the 6 Canonical Audit Components */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                {editingFinding ? 'Editor Canónico de Hallazgo de Auditoría' : 'Nuevo Hallazgo de Auditoría'}
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Art. 47 Ley No. 10-04 (Cámara de Cuentas)
              </span>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Título Oficial del Hallazgo *</label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej. Fraccionamiento de compras para eludir Licitación Pública"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Nivel de Severidad</label>
                  <select
                    value={nivel}
                    onChange={(e: any) => setNivel(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Crítico">Crítico</option>
                    <option value="Alto">Alto</option>
                    <option value="Medio">Medio</option>
                    <option value="Bajo">Bajo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Estado de Seguimiento</label>
                  <select
                    value={estado}
                    onChange={(e: any) => setEstado(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Abierto">Abierto</option>
                    <option value="En proceso">En proceso</option>
                    <option value="Subsanado">Subsanado</option>
                    <option value="Cerrado">Cerrado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Monto Observado (RD$)</label>
                  <input
                    type="number"
                    value={montoObservado}
                    onChange={(e) => setMontoObservado(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* The 6 canonical parts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-blue-400 mb-1">
                    1. CONDICIÓN ("Lo que es" - Hecho u observación constatada) *
                  </label>
                  <textarea
                    rows={4}
                    value={condicion}
                    onChange={(e) => setCondicion(e.target.value)}
                    placeholder="Describa con precisión los hechos, cifras, fechas y documentos verificados..."
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-sky-400 mb-1">
                    2. CRITERIO LEGAL ("Lo que debió ser" - Artículo y ley infringida) *
                  </label>
                  <textarea
                    rows={4}
                    value={criterio}
                    onChange={(e) => setCriterio(e.target.value)}
                    placeholder="Citar Ley 340-06 Art. 14, Decreto 543-12 Art. 85, NOBACI, etc."
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-400 mb-1">
                    3. CAUSA (Origen o motivo por el que ocurrió la desviación)
                  </label>
                  <textarea
                    rows={3}
                    value={causa}
                    onChange={(e) => setCausa(e.target.value)}
                    placeholder="Falta de planificación, debilidad en control previo, omisión de peritos..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-red-400 mb-1">
                    4. EFECTO / IMPACTO PATRIMONIAL (Consecuencia o perjuicio)
                  </label>
                  <textarea
                    rows={3}
                    value={efecto}
                    onChange={(e) => setEfecto(e.target.value)}
                    placeholder="Riesgo de pago indebido, sobreprecios, desprotección jurídica del Estado..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-400 mb-1">
                    5. RECOMENDACIÓN OBLIGATORIA (Medida correctiva constructiva) *
                  </label>
                  <textarea
                    rows={4}
                    value={recomendacion}
                    onChange={(e) => setRecomendacion(e.target.value)}
                    placeholder="Instrucciones directas a la máxima autoridad para corregir y sancionar..."
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-400 mb-1">
                    6. CONCLUSIÓN / DICTAMEN DEL EQUIPO AUDITOR
                  </label>
                  <textarea
                    rows={4}
                    value={conclusion}
                    onChange={(e) => setConclusion(e.target.value)}
                    placeholder="Dictamen conclusivo sobre la procedencia de responsabilidades civiles/penales..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Cita Normativa Referencial</label>
                <input
                  type="text"
                  value={normativaReferencia}
                  onChange={(e) => setNormativaReferencia(e.target.value)}
                  placeholder="Ej. Ley 340-06 Art. 14 / Decreto 543-12 Art. 16"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Hallazgo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
