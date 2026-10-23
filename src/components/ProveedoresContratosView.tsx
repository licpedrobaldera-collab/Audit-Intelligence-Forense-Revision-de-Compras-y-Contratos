import React, { useState } from 'react';
import { Building2, Plus, Edit2, Trash2, FileText, CheckCircle2, Search } from 'lucide-react';
import { Proveedor, Contrato, DatabaseState } from '../types';

interface ProveedoresContratosViewProps {
  data: DatabaseState;
  onSaveProveedor: (p: Partial<Proveedor>) => Promise<void>;
  onDeleteProveedor: (id: number) => Promise<void>;
  onSaveContrato: (c: Partial<Contrato>) => Promise<void>;
  onDeleteContrato: (id: number) => Promise<void>;
}

export const ProveedoresContratosView: React.FC<ProveedoresContratosViewProps> = ({
  data,
  onSaveProveedor,
  onDeleteProveedor,
  onSaveContrato,
  onDeleteContrato,
}) => {
  const [activeTab, setActiveTab] = useState<'proveedores' | 'contratos'>('proveedores');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isProvModalOpen, setIsProvModalOpen] = useState(false);
  const [editingProv, setEditingProv] = useState<Partial<Proveedor> | null>(null);
  const [provNombre, setProvNombre] = useState('');
  const [provRnc, setProvRnc] = useState('');
  const [provContacto, setProvContacto] = useState('');
  const [provRubro, setProvRubro] = useState('');
  const [provEstado, setProvEstado] = useState<Proveedor['estado']>('Activo');

  const [isContrModalOpen, setIsContrModalOpen] = useState(false);
  const [editingContr, setEditingContr] = useState<Partial<Contrato> | null>(null);
  const [contrNumero, setContrNumero] = useState('');
  const [contrProvId, setContrProvId] = useState<number | null>(null);
  const [contrObjeto, setContrObjeto] = useState('');
  const [contrMonto, setContrMonto] = useState<number>(0);
  const [contrModalidad, setContrModalidad] = useState('Licitación Pública Nacional');
  const [contrFechaInicio, setContrFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [contrFechaFin, setContrFechaFin] = useState(new Date().toISOString().split('T')[0]);
  const [contrEstado, setContrEstado] = useState<Contrato['estado']>('Vigente');

  const openNewProv = () => {
    setEditingProv(null);
    setProvNombre('');
    setProvRnc('');
    setProvContacto('');
    setProvRubro('');
    setProvEstado('Activo');
    setIsProvModalOpen(true);
  };

  const openEditProv = (p: Proveedor) => {
    setEditingProv(p);
    setProvNombre(p.nombre);
    setProvRnc(p.rnc);
    setProvContacto(p.contacto);
    setProvRubro(p.rubro);
    setProvEstado(p.estado);
    setIsProvModalOpen(true);
  };

  const handleSaveProv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provNombre.trim()) {
      alert('El nombre del proveedor es obligatorio.');
      return;
    }
    await onSaveProveedor({
      id: editingProv?.id,
      nombre: provNombre,
      rnc: provRnc,
      contacto: provContacto,
      rubro: provRubro,
      estado: provEstado,
    });
    setIsProvModalOpen(false);
  };

  const openNewContr = () => {
    setEditingContr(null);
    setContrNumero(`CONTR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    setContrProvId(data.proveedores[0]?.id || null);
    setContrObjeto('');
    setContrMonto(0);
    setContrModalidad('Licitación Pública Nacional');
    setContrFechaInicio(new Date().toISOString().split('T')[0]);
    setContrFechaFin(new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0]);
    setContrEstado('Vigente');
    setIsContrModalOpen(true);
  };

  const openEditContr = (c: Contrato) => {
    setEditingContr(c);
    setContrNumero(c.numero);
    setContrProvId(c.proveedorId);
    setContrObjeto(c.objeto);
    setContrMonto(c.monto);
    setContrModalidad(c.modalidad);
    setContrFechaInicio(c.fechaInicio);
    setContrFechaFin(c.fechaFin);
    setContrEstado(c.estado);
    setIsContrModalOpen(true);
  };

  const handleSaveContr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contrNumero.trim()) {
      alert('El número de contrato es obligatorio.');
      return;
    }
    await onSaveContrato({
      id: editingContr?.id,
      numero: contrNumero,
      proveedorId: contrProvId,
      objeto: contrObjeto,
      monto: Number(contrMonto) || 0,
      modalidad: contrModalidad,
      fechaInicio: contrFechaInicio,
      fechaFin: contrFechaFin,
      estado: contrEstado,
    });
    setIsContrModalOpen(false);
  };

  const filteredProv = data.proveedores.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.rnc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.rubro.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContr = data.contratos.filter(c =>
    c.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.objeto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-indigo-400" />
            Proveedores del Estado y Contratos Adjudicados
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Registro de oferentes, validación de RNC y fiscalización de límites presupuestarios según Ley 340-06.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('proveedores')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'proveedores' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Proveedores ({data.proveedores.length})
          </button>
          <button
            onClick={() => setActiveTab('contratos')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'contratos' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Contratos ({data.contratos.length})
          </button>
        </div>
      </div>

      {/* Search & Action bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={activeTab === 'proveedores' ? 'Buscar proveedor o RNC...' : 'Buscar contrato u objeto...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        {activeTab === 'proveedores' ? (
          <button
            onClick={openNewProv}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Proveedor</span>
          </button>
        ) : (
          <button
            onClick={openNewContr}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Contrato</span>
          </button>
        )}
      </div>

      {/* Tab Content: Proveedores */}
      {activeTab === 'proveedores' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProv.map((p) => {
            const contractsCount = data.contratos.filter(c => c.proveedorId === p.id).length;
            return (
              <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">{p.nombre}</h3>
                    <div className="font-mono text-xs text-blue-400 mt-0.5">RNC: {p.rnc || 'No registrado'}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    p.estado === 'Activo' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    p.estado === 'En observación' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {p.estado}
                  </span>
                </div>

                <div className="text-xs text-slate-300">
                  <span className="text-slate-500 block text-[10px]">Rubro / Actividad:</span>
                  {p.rubro || 'Suministros generales'}
                </div>

                <div className="text-xs text-slate-400">
                  <span className="text-slate-500 block text-[10px]">Contacto:</span>
                  {p.contacto || 'No disponible'}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>{contractsCount} contrato(s) adjudicado(s)</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditProv(p)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar proveedor ${p.nombre}?`)) onDeleteProveedor(p.id);
                      }}
                      className="p-1 rounded hover:bg-red-950/40 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab Content: Contratos */}
      {activeTab === 'contratos' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Número de Contrato</th>
                <th className="p-3.5">Proveedor Adjudicatario</th>
                <th className="p-3.5">Objeto del Contrato</th>
                <th className="p-3.5">Modalidad de Selección</th>
                <th className="p-3.5 text-right">Monto Adjudicado</th>
                <th className="p-3.5">Vigencia</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredContr.map((c) => {
                const prov = data.proveedores.find(p => p.id === c.proveedorId);
                return (
                  <tr key={c.id} className="hover:bg-slate-800/50">
                    <td className="p-3.5 font-mono font-bold text-blue-400">{c.numero}</td>
                    <td className="p-3.5 font-semibold text-slate-200">{prov ? prov.nombre : 'Sin proveedor asignado'}</td>
                    <td className="p-3.5 max-w-xs truncate text-slate-300" title={c.objeto}>{c.objeto}</td>
                    <td className="p-3.5 text-[11px] text-slate-400">{c.modalidad}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                      RD$ {c.monto.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-[11px] text-slate-400">{c.fechaInicio} al {c.fechaFin}</td>
                    <td className="p-3.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        {c.estado}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditContr(c)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar contrato ${c.numero}?`)) onDeleteContrato(c.id);
                          }}
                          className="p-1 rounded hover:bg-red-950/40 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Proveedor */}
      {isProvModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 mb-4">
              {editingProv ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h3>
            <form onSubmit={handleSaveProv} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Nombre / Razón Social *</label>
                <input
                  type="text"
                  value={provNombre}
                  onChange={(e) => setProvNombre(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">RNC / Cédula</label>
                <input
                  type="text"
                  value={provRnc}
                  onChange={(e) => setProvRnc(e.target.value)}
                  placeholder="Ej. 131-45678-9"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Rubro / Objeto Social</label>
                <input
                  type="text"
                  value={provRubro}
                  onChange={(e) => setProvRubro(e.target.value)}
                  placeholder="Ej. Obras Civiles y Pavimentación"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Datos de Contacto</label>
                <input
                  type="text"
                  value={provContacto}
                  onChange={(e) => setProvContacto(e.target.value)}
                  placeholder="Teléfono, representante legal, correo"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProvModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Guardar Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Contrato */}
      {isContrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 mb-4">
              {editingContr ? 'Editar Contrato' : 'Nuevo Contrato Adjudicado'}
            </h3>
            <form onSubmit={handleSaveContr} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Número de Contrato *</label>
                  <input
                    type="text"
                    value={contrNumero}
                    onChange={(e) => setContrNumero(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Proveedor</label>
                  <select
                    value={contrProvId ?? ''}
                    onChange={(e) => setContrProvId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Seleccione proveedor...</option>
                    {data.proveedores.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Objeto del Contrato *</label>
                <textarea
                  rows={2}
                  value={contrObjeto}
                  onChange={(e) => setContrObjeto(e.target.value)}
                  required
                  placeholder="Detalle de la obra, bien o servicio contratado..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Monto Adjudicado (RD$) *</label>
                  <input
                    type="number"
                    value={contrMonto}
                    onChange={(e) => setContrMonto(Number(e.target.value))}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Modalidad de Selección</label>
                  <select
                    value={contrModalidad}
                    onChange={(e) => setContrModalidad(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Licitación Pública Nacional">Licitación Pública Nacional</option>
                    <option value="Licitación Restringida">Licitación Restringida</option>
                    <option value="Sorteo de Obras">Sorteo de Obras</option>
                    <option value="Comparación de Precios">Comparación de Precios</option>
                    <option value="Compras Menores">Compras Menores</option>
                    <option value="Excepción / Urgencia">Excepción / Urgencia</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsContrModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Guardar Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
