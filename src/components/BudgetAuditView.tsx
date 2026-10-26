import React, { useState } from 'react';
import {
  DollarSign,
  PieChart,
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Globe2,
  ExternalLink,
  Building2,
  Trash2,
  Edit2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { DatabaseState, BudgetExecutionItem } from '../types';
import { api } from '../services/api';

interface BudgetAuditViewProps {
  data: DatabaseState;
  selectedExpedienteId: number | null;
  currentUser: string;
  onRefreshData: () => Promise<void>;
}

export const BudgetAuditView: React.FC<BudgetAuditViewProps> = ({
  data,
  selectedExpedienteId,
  currentUser,
  onRefreshData,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('República Dominicana');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'Todos' | 'Gasto' | 'Ingreso'>('Todos');
  const [filterAlertOnly, setFilterAlertOnly] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formCodigo, setFormCodigo] = useState('');
  const [formDenominacion, setFormDenominacion] = useState('');
  const [formTipo, setFormTipo] = useState<'Gasto' | 'Ingreso'>('Gasto');
  const [formAprobado, setFormAprobado] = useState<number>(0);
  const [formModificado, setFormModificado] = useState<number>(0);
  const [formPreventivo, setFormPreventivo] = useState<number>(0);
  const [formComprometido, setFormComprometido] = useState<number>(0);
  const [formDevengado, setFormDevengado] = useState<number>(0);
  const [formPagado, setFormPagado] = useState<number>(0);
  const [formObservaciones, setFormObservaciones] = useState('');

  const items = data.budgetExecution || [];

  const formatCurrency = (val: number) => {
    const curr = data.settings?.currency || 'DOP';
    return `${curr} $${val.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
  };

  const filteredItems = items.filter(item => {
    const matchSearch =
      item.codigoObjetoGasto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.denominacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.entePresupuestario.toLowerCase().includes(searchTerm.toLowerCase());

    const matchType = filterType === 'Todos' || item.tipo === filterType;
    const matchAlert = !filterAlertOnly || (item.estadoEjecucion !== 'Normal');

    return matchSearch && matchType && matchAlert;
  });

  // Calculate totals
  const totalAprobado = filteredItems.reduce((acc, it) => acc + it.presupuestoAprobado, 0);
  const totalModificado = filteredItems.reduce((acc, it) => acc + it.presupuestoModificado, 0);
  const totalComprometido = filteredItems.reduce((acc, it) => acc + it.comprometido, 0);
  const totalDevengado = filteredItems.reduce((acc, it) => acc + it.devengado, 0);
  const totalPagado = filteredItems.reduce((acc, it) => acc + it.pagado, 0);
  const totalDeudaFlotante = totalDevengado - totalPagado;
  const pctGlobalEjec = totalModificado > 0 ? Number(((totalDevengado / totalModificado) * 100).toFixed(1)) : 0;

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormCodigo('');
    setFormDenominacion('');
    setFormTipo('Gasto');
    setFormAprobado(0);
    setFormModificado(0);
    setFormPreventivo(0);
    setFormComprometido(0);
    setFormDevengado(0);
    setFormPagado(0);
    setFormObservaciones('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: BudgetExecutionItem) => {
    setEditingId(item.id);
    setFormCodigo(item.codigoObjetoGasto);
    setFormDenominacion(item.denominacion);
    setFormTipo(item.tipo);
    setFormAprobado(item.presupuestoAprobado);
    setFormModificado(item.presupuestoModificado);
    setFormPreventivo(item.preventivo);
    setFormComprometido(item.comprometido);
    setFormDevengado(item.devengado);
    setFormPagado(item.pagado);
    setFormObservaciones(item.observaciones);
    setIsModalOpen(true);
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCodigo.trim() || !formDenominacion.trim()) {
      alert('Código y denominación son obligatorios.');
      return;
    }

    try {
      const res = await api.saveBudgetExecution({
        id: editingId || undefined,
        expedienteId: selectedExpedienteId,
        pais: selectedCountry,
        entePresupuestario: selectedCountry === 'República Dominicana' ? 'DIGEPRES / DIGECOG / SIGEF' : 'Órgano Rector Presupuestario',
        codigoObjetoGasto: formCodigo,
        denominacion: formDenominacion,
        tipo: formTipo,
        presupuestoAprobado: Number(formAprobado),
        presupuestoModificado: Number(formModificado) || Number(formAprobado),
        preventivo: Number(formPreventivo),
        comprometido: Number(formComprometido),
        devengado: Number(formDevengado),
        pagado: Number(formPagado),
        observaciones: formObservaciones,
        fuenteRectorUrl: selectedCountry === 'República Dominicana' ? 'https://digepres.gob.do' : 'https://treasury.gov',
        fechaCorte: new Date().toISOString().split('T')[0],
        user: currentUser
      });

      if (res.success) {
        setIsModalOpen(false);
        await onRefreshData();
      }
    } catch (err: any) {
      alert(`Error al guardar partida presupuestaria: ${err.message}`);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('¿Desea eliminar esta partida presupuestaria?')) return;
    try {
      await api.deleteBudgetExecution(id, currentUser);
      await onRefreshData();
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  const exportToExcel = () => {
    const rows = filteredItems.map(it => ({
      'Código Objeto': it.codigoObjetoGasto,
      'Denominación de la Partida': it.denominacion,
      'Tipo': it.tipo,
      'Presupuesto Aprobado': it.presupuestoAprobado,
      'Presupuesto Modificado': it.presupuestoModificado,
      'Preventivo': it.preventivo,
      'Comprometido': it.comprometido,
      'Devengado': it.devengado,
      'Pagado': it.pagado,
      'Saldo por Comprometer': it.saldoPorComprometer,
      'Saldo por Devengar': it.saldoPorDevengar,
      'Saldo por Pagar (Flotante)': it.saldoPorPagar,
      '% Ejecución': `${it.porcentajeEjecucion}%`,
      'Estado': it.estadoEjecucion,
      'Observaciones Periciales': it.observaciones,
      'Órgano Rector': it.entePresupuestario,
      'Fecha Corte': it.fechaCorte
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ejecucion_Presupuestaria');
    XLSX.writeFile(wb, `Ejecucion_Presupuestaria_${selectedCountry.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Auditoría y Análisis de Ejecución Presupuestaria (Ciclo Completo)
            </h2>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Aprobado vs Modificado vs Devengado vs Pagado
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Trazabilidad integral del ciclo presupuestario por Objeto del Gasto. Cruces automáticos con la Dirección General de Presupuesto (DIGEPRES), DIGECOG, SIGEF y Estados Financieros institucionales. Configurable para cualquier país del mundo.
          </p>
        </div>

        {/* Global Country Selector & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300">
            <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="República Dominicana">Rep. Dominicana (DIGEPRES/DIGECOG)</option>
              <option value="Estados Unidos">Estados Unidos (OMB / Yellow Book / Treasury)</option>
              <option value="México">México (SHCP / PEF / ASF)</option>
              <option value="Colombia">Colombia (MinHacienda / SIIF / CGR)</option>
              <option value="España">España (IGAE / Presupuestos Generales)</option>
              <option value="Estándar Internacional">Estándar Global (IPSAS / NICSP)</option>
            </select>
          </div>

          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Exportar Excel
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Nueva Partida
          </button>
        </div>
      </div>

      {/* KPI Cards: Complete Budget Execution Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400">Presupuesto Aprobado</span>
          <p className="text-base font-bold text-slate-100 mt-1">{formatCurrency(totalAprobado)}</p>
          <span className="text-[10px] text-slate-500">Ley de Presupuesto Inicial</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400">Presupuesto Modificado</span>
          <p className="text-base font-bold text-indigo-300 mt-1">{formatCurrency(totalModificado)}</p>
          <span className="text-[10px] text-indigo-400 font-medium">Vigente con traslados</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400">Comprometido (Órdenes)</span>
          <p className="text-base font-bold text-sky-300 mt-1">{formatCurrency(totalComprometido)}</p>
          <span className="text-[10px] text-slate-500">Contratos formalizados</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400">Devengado (Recepción)</span>
          <p className="text-base font-bold text-amber-300 mt-1">{formatCurrency(totalDevengado)}</p>
          <span className="text-[10px] text-amber-400 font-semibold">{pctGlobalEjec}% Ejecución</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400">Deuda Flotante (Por Pagar)</span>
          <p className="text-base font-bold text-rose-400 mt-1">{formatCurrency(totalDeudaFlotante)}</p>
          <span className="text-[10px] text-rose-400">Devengado - Pagado</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por código (2.1, 2.2, 2.3...), partida o entidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end text-xs">
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
            {(['Todos', 'Gasto', 'Ingreso'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded text-xs transition ${
                  filterType === t
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-200">
            <input
              type="checkbox"
              checked={filterAlertOnly}
              onChange={(e) => setFilterAlertOnly(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0"
            />
            <span className="text-amber-400 font-medium">Solo Alertas y Desviaciones</span>
          </label>
        </div>
      </div>

      {/* Budget Execution Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3 px-3">Objeto</th>
                <th className="py-3 px-3">Denominación</th>
                <th className="py-3 px-3">Tipo</th>
                <th className="py-3 px-3 text-right">Aprobado</th>
                <th className="py-3 px-3 text-right">Modificado</th>
                <th className="py-3 px-3 text-right">Comprometido</th>
                <th className="py-3 px-3 text-right">Devengado</th>
                <th className="py-3 px-3 text-right">Pagado</th>
                <th className="py-3 px-3 text-right">% Ejec</th>
                <th className="py-3 px-3 text-center">Estado</th>
                <th className="py-3 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500">
                    No se encontraron partidas presupuestarias con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-400">
                      {item.codigoObjetoGasto}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-100 max-w-xs">
                      <div>{item.denominacion}</div>
                      {item.observaciones && (
                        <div className="text-[10px] text-slate-400 truncate mt-0.5 italic">
                          {item.observaciones}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.tipo === 'Ingreso' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {item.tipo}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-400">
                      {formatCurrency(item.presupuestoAprobado)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-200">
                      {formatCurrency(item.presupuestoModificado)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-sky-400">
                      {formatCurrency(item.comprometido)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-amber-300">
                      {formatCurrency(item.devengado)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-400">
                      {formatCurrency(item.pagado)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span className={
                        item.porcentajeEjecucion > 100
                          ? 'text-rose-400'
                          : item.porcentajeEjecucion < 30
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }>
                        {item.porcentajeEjecucion}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block ${
                        item.estadoEjecucion === 'Sobreejecución' || item.estadoEjecucion === 'Compromiso sin Asignación'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : item.estadoEjecucion === 'Subejecución' || item.estadoEjecucion === 'Alerta Desvío'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {item.estadoEjecucion}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1 text-slate-400 hover:text-blue-400 rounded transition"
                          title="Editar partida"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded transition"
                          title="Eliminar partida"
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

      {/* Modal: Create / Edit Budget Item */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                {editingId ? 'Editar Partida Presupuestaria' : 'Nueva Partida Presupuestaria'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Código Objeto (ej. 2.1, 2.3):</label>
                  <input
                    type="text"
                    required
                    value={formCodigo}
                    onChange={(e) => setFormCodigo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1 font-medium">Denominación del Objeto:</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Materiales y Suministros Médicos..."
                    value={formDenominacion}
                    onChange={(e) => setFormDenominacion(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Tipo:</label>
                  <select
                    value={formTipo}
                    onChange={(e) => setFormTipo(e.target.value as 'Gasto' | 'Ingreso')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="Gasto">Gasto</option>
                    <option value="Ingreso">Ingreso</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Presupuesto Aprobado:</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formAprobado}
                    onChange={(e) => setFormAprobado(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Presupuesto Modificado:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formModificado}
                    onChange={(e) => setFormModificado(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Preventivo:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formPreventivo}
                    onChange={(e) => setFormPreventivo(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Comprometido:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formComprometido}
                    onChange={(e) => setFormComprometido(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Devengado:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formDevengado}
                    onChange={(e) => setFormDevengado(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Pagado:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formPagado}
                    onChange={(e) => setFormPagado(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Observaciones de Auditoría:</label>
                <textarea
                  rows={2}
                  value={formObservaciones}
                  onChange={(e) => setFormObservaciones(e.target.value)}
                  placeholder="Detallar causas de subejecución o atraso en libramientos..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow"
                >
                  Guardar Partida
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
