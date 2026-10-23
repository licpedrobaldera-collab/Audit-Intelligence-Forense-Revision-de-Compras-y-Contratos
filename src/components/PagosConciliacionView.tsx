import React, { useState } from 'react';
import { Receipt, Plus, Trash2, ShieldAlert, CheckCircle2, Search, AlertOctagon } from 'lucide-react';
import { Pago, DatabaseState } from '../types';

interface PagosConciliacionViewProps {
  data: DatabaseState;
  onSavePago: (p: Partial<Pago>) => Promise<void>;
  onDeletePago: (id: number) => Promise<void>;
}

export const PagosConciliacionView: React.FC<PagosConciliacionViewProps> = ({
  data,
  onSavePago,
  onDeletePago,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [contratoId, setContratoId] = useState<number | null>(null);
  const [beneficiario, setBeneficiario] = useState('');
  const [rncBeneficiario, setRncBeneficiario] = useState('');
  const [referencia, setReferencia] = useState('');
  const [ncf, setNcf] = useState('');
  const [monto, setMonto] = useState<number>(0);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [descripcion, setDescripcion] = useState('');

  const openNewModal = () => {
    setContratoId(data.contratos[0]?.id || null);
    setBeneficiario('');
    setRncBeneficiario('');
    setReferencia(`LIB-${Math.floor(1000 + Math.random() * 9000)}`);
    setNcf('B0100' + Math.floor(100000 + Math.random() * 900000));
    setMonto(0);
    setFecha(new Date().toISOString().split('T')[0]);
    setDescripcion('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!beneficiario.trim() || monto <= 0) {
      alert('Beneficiario y monto mayor a cero son obligatorios.');
      return;
    }
    await onSavePago({
      contratoId,
      beneficiario,
      rncBeneficiario,
      referencia,
      ncf,
      monto: Number(monto),
      fecha,
      descripcion,
    });
    setIsModalOpen(false);
  };

  const filtered = data.pagos.filter(p =>
    p.beneficiario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.referencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.ncf && p.ncf.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalDesembolsado = filtered.reduce((acc, p) => acc + p.monto, 0);
  const duplicados = data.pagos.filter(p => p.alertaDuplicado);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <Receipt className="w-5 h-5 text-emerald-400" />
            Registro de Pagos y Conciliación Forense
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Auditoría de libramientos, cheques, transferencias bancarias y detección automática de pagos duplicados o sin NCF válido.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Desembolso</span>
        </button>
      </div>

      {/* Duplicate Alert Banner if duplicates exist */}
      {duplicados.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/80 text-red-200 shadow-md">
          <div className="flex items-center gap-2 text-sm font-bold text-red-300">
            <AlertOctagon className="w-5 h-5 text-red-400 animate-pulse" />
            <span>ALERTA DE CONTROL PREVIO: Se detectaron {duplicados.length} desembolsos con indicios de duplicación</span>
          </div>
          <p className="text-xs text-red-200/80 mt-1">
            Los siguientes pagos coinciden en beneficiario, monto y comprobante fiscal en fechas cercanas. Verifique las órdenes de pago originales y extractos bancarios.
          </p>
        </div>
      )}

      {/* Search and Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por beneficiario, factura o NCF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs text-slate-400">
            Total Pagos Auditados: <strong className="text-slate-200">{filtered.length}</strong>
          </div>
          <div className="text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-3 py-1 rounded-lg">
            Total Pagado: RD$ {totalDesembolsado.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-800">
            <tr>
              <th className="p-3.5">Referencia / Libramiento</th>
              <th className="p-3.5">Beneficiario / Proveedor</th>
              <th className="p-3.5">NCF Fiscal</th>
              <th className="p-3.5">Contrato Asociado</th>
              <th className="p-3.5 text-right">Monto Desembolsado</th>
              <th className="p-3.5">Fecha</th>
              <th className="p-3.5">Alerta Forense</th>
              <th className="p-3.5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {filtered.map((p) => {
              const contr = data.contratos.find(c => c.id === p.contratoId);
              return (
                <tr key={p.id} className={p.alertaDuplicado ? 'bg-red-950/20 hover:bg-red-950/30' : 'hover:bg-slate-800/50'}>
                  <td className="p-3.5 font-mono font-bold text-slate-200">{p.referencia}</td>
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-100">{p.beneficiario}</div>
                    <div className="text-[10px] text-slate-400 font-mono">RNC: {p.rncBeneficiario || 'S/R'}</div>
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-blue-400">{p.ncf || 'Sin NCF'}</td>
                  <td className="p-3.5 text-[11px] text-slate-400">
                    {contr ? contr.numero : <span className="text-amber-400 font-bold">Sin Contrato (Compra Menor)</span>}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                    RD$ {p.monto.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3.5 text-[11px] text-slate-400">{p.fecha}</td>
                  <td className="p-3.5">
                    {p.alertaDuplicado ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1 w-fit">
                        <ShieldAlert className="w-3 h-3 text-red-400" />
                        Posible Duplicado
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Regular
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar pago ref ${p.referencia}?`)) onDeletePago(p.id);
                      }}
                      className="p-1 rounded hover:bg-red-950/40 text-slate-400 hover:text-red-400 transition"
                      title="Eliminar pago"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal New Payment */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 mb-4">Registrar Pago para Fiscalización</h3>
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Referencia / No. Libramiento *</label>
                  <input
                    type="text"
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">NCF Comprobante Fiscal</label>
                  <input
                    type="text"
                    value={ncf}
                    onChange={(e) => setNcf(e.target.value)}
                    placeholder="Ej. B0100492101"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Beneficiario / Razón Social *</label>
                <input
                  type="text"
                  value={beneficiario}
                  onChange={(e) => setBeneficiario(e.target.value)}
                  required
                  placeholder="Nombre de la empresa o contratista"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Monto a Pagar (RD$) *</label>
                  <input
                    type="number"
                    value={monto}
                    onChange={(e) => setMonto(Number(e.target.value))}
                    required
                    min={0.01}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Fecha de Emisión</label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Contrato Vinculado (Opcional)</label>
                <select
                  value={contratoId ?? ''}
                  onChange={(e) => setContratoId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Sin contrato (Adquisición directa / compra menor)</option>
                  {data.contratos.map(c => (
                    <option key={c.id} value={c.id}>{c.numero} - {c.objeto.slice(0, 40)}...</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Concepto / Detalle del Desembolso</label>
                <textarea
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Detalle de cubicación, entrega de bienes o servicio..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Registrar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
