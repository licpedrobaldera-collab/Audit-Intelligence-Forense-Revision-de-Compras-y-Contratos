import React, { useState } from 'react';
import { TrendingDown, Plus, Trash2, Edit2, Flame, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Riesgo, DatabaseState } from '../types';

interface RiesgosViewProps {
  data: DatabaseState;
  selectedExpedienteId: number | null;
  onSaveRiesgo: (r: Partial<Riesgo>) => Promise<void>;
  onDeleteRiesgo: (id: number) => Promise<void>;
}

export const RiesgosView: React.FC<RiesgosViewProps> = ({
  data,
  selectedExpedienteId,
  onSaveRiesgo,
  onDeleteRiesgo,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRiesgo, setEditingRiesgo] = useState<Partial<Riesgo> | null>(null);

  const [categoria, setCategoria] = useState<Riesgo['categoria']>('Contratación');
  const [descripcion, setDescripcion] = useState('');
  const [probabilidad, setProbabilidad] = useState(3);
  const [impacto, setImpacto] = useState(3);
  const [mitigacion, setMitigacion] = useState('');
  const [estado, setEstado] = useState<Riesgo['estado']>('Pendiente');

  const currentScore = probabilidad * impacto;
  const currentNivel =
    currentScore >= 20 ? 'Crítico' : currentScore >= 15 ? 'Alto' : currentScore >= 8 ? 'Medio' : 'Bajo';

  const openNewModal = () => {
    setEditingRiesgo(null);
    setCategoria('Contratación');
    setDescripcion('');
    setProbabilidad(3);
    setImpacto(3);
    setMitigacion('');
    setEstado('Pendiente');
    setIsModalOpen(true);
  };

  const openEditModal = (r: Riesgo) => {
    setEditingRiesgo(r);
    setCategoria(r.categoria);
    setDescripcion(r.descripcion);
    setProbabilidad(r.probabilidad);
    setImpacto(r.impacto);
    setMitigacion(r.mitigacion);
    setEstado(r.estado);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim()) {
      alert('La descripción del riesgo es obligatoria.');
      return;
    }
    await onSaveRiesgo({
      id: editingRiesgo?.id,
      expedienteId: selectedExpedienteId,
      categoria,
      descripcion,
      probabilidad,
      impacto,
      mitigacion,
      estado,
    });
    setIsModalOpen(false);
  };

  const filtered = selectedExpedienteId
    ? data.riesgos.filter(r => r.expedienteId === selectedExpedienteId)
    : data.riesgos;

  // 5x5 heatmap calculation
  const heatmap: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));
  filtered.forEach(r => {
    const p = Math.min(5, Math.max(1, r.probabilidad)) - 1;
    const i = Math.min(5, Math.max(1, r.impacto)) - 1;
    heatmap[p][i]++;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <TrendingDown className="w-5 h-5 text-red-400" />
            Matriz de Evaluación de Riesgos (5x5)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Metodología COSO / NOBACI: Probabilidad (1-5) x Impacto (1-5) = Severidad (1-25) y controles preventivos.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Evaluar Nuevo Riesgo</span>
        </button>
      </div>

      {/* Heatmap 5x5 and Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            Cuadrante de Probabilidad e Impacto
          </h3>
          <p className="text-xs text-slate-400">
            Distribución cuantitativa de riesgos identificados en el proceso auditado:
          </p>

          {/* 5x5 Grid */}
          <div className="space-y-1.5 pt-2">
            {[4, 3, 2, 1, 0].map((pIdx) => (
              <div key={pIdx} className="flex items-center gap-1.5 text-xs">
                <span className="w-6 text-[10px] text-slate-500 text-right font-bold">P{pIdx + 1}</span>
                <div className="grid grid-cols-5 gap-1.5 flex-1">
                  {[0, 1, 2, 3, 4].map((iIdx) => {
                    const count = heatmap[pIdx][iIdx];
                    const score = (pIdx + 1) * (iIdx + 1);
                    const color =
                      score >= 20 ? 'bg-red-500/80 text-white' :
                      score >= 15 ? 'bg-orange-500/70 text-white' :
                      score >= 8 ? 'bg-amber-500/50 text-amber-100' :
                      'bg-emerald-600/30 text-emerald-200';

                    return (
                      <div
                        key={iIdx}
                        className={`h-10 rounded-lg flex flex-col items-center justify-center font-bold text-xs border border-white/10 ${color}`}
                      >
                        <span className="text-[12px] leading-none">{count > 0 ? count : ''}</span>
                        <span className="text-[9px] opacity-70 font-normal leading-none mt-0.5">{score}</span>
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
        </div>

        {/* Risk Cards List (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-100">
              Riesgos Prioritarios Registrados ({filtered.length})
            </h3>
            <span className="text-xs text-red-400 font-bold">
              {filtered.filter(r => r.nivel === 'Crítico').length} Críticos (≥20)
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filtered.map(r => (
              <div
                key={r.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{r.categoria}</span>
                    <span className="text-[10px] text-slate-500">· Score: {r.puntuacion}/25 (P:{r.probabilidad} × I:{r.impacto})</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      r.nivel === 'Crítico' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                      r.nivel === 'Alto' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                      r.nivel === 'Medio' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {r.nivel}
                    </span>
                    <button
                      onClick={() => openEditModal(r)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('¿Eliminar riesgo?')) onDeleteRiesgo(r.id);
                      }}
                      className="p-1 rounded hover:bg-red-950/40 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed">{r.descripcion}</p>

                {r.mitigacion && (
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-emerald-300/90">
                    <strong>Plan de Mitigación / Control:</strong> {r.mitigacion}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for Risk Assessment */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 mb-4">
              {editingRiesgo ? 'Editar Evaluación de Riesgo' : 'Nueva Evaluación de Riesgo'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Categoría del Riesgo</label>
                <select
                  value={categoria}
                  onChange={(e: any) => setCategoria(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="Contratación">Contratación</option>
                  <option value="Financiero">Financiero</option>
                  <option value="Cumplimiento">Cumplimiento</option>
                  <option value="Operacional">Operacional</option>
                  <option value="Tecnológico">Tecnológico</option>
                  <option value="Documental">Documental</option>
                  <option value="Fraude potencial">Fraude potencial</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Descripción del Riesgo *</label>
                <textarea
                  rows={3}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Detalle la amenaza, evento adverso o vulnerabilidad detectada..."
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Probabilidad (1 a 5): <strong className="text-white">{probabilidad}</strong>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={probabilidad}
                    onChange={(e) => setProbabilidad(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Impacto (1 a 5): <strong className="text-white">{impacto}</strong>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={impacto}
                    onChange={(e) => setImpacto(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Score Preview Badge */}
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                <span>Puntuación Estimada (P × I):</span>
                <span className="text-sm font-bold text-white">
                  {currentScore}/25 — <span className={
                    currentNivel === 'Crítico' ? 'text-red-400' :
                    currentNivel === 'Alto' ? 'text-orange-400' : 'text-amber-400'
                  }>{currentNivel}</span>
                </span>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Plan de Mitigación / Control Propuesto</label>
                <textarea
                  rows={2}
                  value={mitigacion}
                  onChange={(e) => setMitigacion(e.target.value)}
                  placeholder="Medidas preventivas o correctivas a implementar..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md"
                >
                  Guardar Evaluación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
