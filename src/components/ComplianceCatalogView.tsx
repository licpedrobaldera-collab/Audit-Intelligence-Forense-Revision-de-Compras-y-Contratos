import React, { useState } from 'react';
import {
  Scale,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Filter,
  Copy,
  Check,
  Globe2
} from 'lucide-react';
import { NormativeCatalogItem, DatabaseState } from '../types';

interface ComplianceCatalogViewProps {
  data: DatabaseState;
  currentUser: string;
  onSaveNormative: (item: Partial<NormativeCatalogItem> & { user: string }) => Promise<void>;
  onDeleteNormative: (id: number, user: string) => Promise<void>;
}

export const ComplianceCatalogView: React.FC<ComplianceCatalogViewProps> = ({
  data,
  currentUser,
  onSaveNormative,
  onDeleteNormative,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<NormativeCatalogItem>>({
    country: 'República Dominicana',
    authority: 'Congreso Nacional / DIGECOG',
    title: '',
    article: '',
    version: '2024.1',
    sourceUrl: 'https://www.comprasdominicana.gov.do',
    effectiveDate: new Date().toISOString().split('T')[0],
    status: 'Vigente',
    resumen: '',
  });

  const catalog = data.normativeCatalog || [];

  const filteredCatalog = catalog.filter(item => {
    const matchesSearch =
      (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.authority || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.article || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.resumen || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCountry = selectedCountry === 'todos' || item.country === selectedCountry;
    const matchesStatus = selectedStatus === 'todos' || item.status === selectedStatus;

    return matchesSearch && matchesCountry && matchesStatus;
  });

  const handleOpenCreate = () => {
    setEditingItem({
      country: 'República Dominicana',
      authority: '',
      title: '',
      article: '',
      version: '1.0',
      sourceUrl: '',
      effectiveDate: new Date().toISOString().split('T')[0],
      status: 'Vigente',
      resumen: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: NormativeCatalogItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem.title || !editingItem.article) {
      alert('Por favor complete el título de la norma y el artículo específico.');
      return;
    }
    await onSaveNormative({ ...editingItem, user: currentUser });
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar esta disposición del catálogo normativo?')) {
      await onDeleteNormative(id, currentUser);
    }
  };

  const handleCopyCitation = (item: NormativeCatalogItem) => {
    const citation = `${item.title}, ${item.article} (${item.authority}, Vigencia: ${item.effectiveDate}) - Ref: ${item.sourceUrl}`;
    navigator.clipboard.writeText(citation);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Stats
  const totalVigentes = catalog.filter(c => c.status === 'Vigente').length;
  const totalModificadas = catalog.filter(c => c.status === 'En Modificación').length;
  const totalDerogadas = catalog.filter(c => c.status === 'Derogada').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-sky-400" />
            Catálogo Normativo Pericial & Cumplimiento Legal
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Repositorio estructurado de leyes, decretos, artículos y resoluciones para trazabilidad jurídica en hallazgos (Diagnóstico 7).
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Norma / Artículo</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Disposiciones</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">{catalog.length}</div>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Normas Vigentes</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{totalVigentes}</div>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">En Modificación</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">{totalModificadas}</div>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Derogadas / Históricas</div>
            <div className="text-2xl font-bold text-red-400 mt-1">{totalDerogadas}</div>
          </div>
          <div className="p-3 bg-red-500/10 rounded-xl text-red-400">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por ley, decreto, artículo, organismo o palabra clave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="todos">Todos los Países</option>
            <option value="República Dominicana">República Dominicana</option>
            <option value="USA">USA (Yellow Book / GAO)</option>
            <option value="Internacional">Internacional (INTOSAI)</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="todos">Todos los Estados</option>
            <option value="Vigente">Vigente</option>
            <option value="En Modificación">En Modificación</option>
            <option value="Derogada">Derogada</option>
          </select>
        </div>
      </div>

      {/* Normative Catalog Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700/80">
              <tr>
                <th className="p-3.5">Jurisdicción / Autoridad</th>
                <th className="p-3.5">Norma & Artículo</th>
                <th className="p-3.5">Versión</th>
                <th className="p-3.5">Estado Vigencia</th>
                <th className="p-3.5">Vigente Desde</th>
                <th className="p-3.5">Fuente Oficial</th>
                <th className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {filteredCatalog.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-sans text-xs">
                    No se encontraron normas con los criterios de búsqueda seleccionados.
                  </td>
                </tr>
              ) : (
                filteredCatalog.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-sans">
                      <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                        <Globe2 className="w-3.5 h-3.5 text-slate-400" />
                        {item.country}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.authority}</div>
                    </td>
                    <td className="p-3.5 font-sans">
                      <div className="font-bold text-slate-100">{item.title}</div>
                      <div className="text-xs text-blue-400 font-medium mt-0.5">{item.article}</div>
                      {item.resumen && (
                        <div className="text-[11px] text-slate-400 mt-1 max-w-md line-clamp-2">
                          {item.resumen}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-400">{item.version || '1.0'}</td>
                    <td className="p-3.5 font-sans">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.status === 'Vigente'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : item.status === 'En Modificación'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {item.status === 'Vigente' && <CheckCircle2 className="w-3 h-3" />}
                        {item.status === 'En Modificación' && <AlertTriangle className="w-3 h-3" />}
                        {item.status === 'Derogada' && <XCircle className="w-3 h-3" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">{item.effectiveDate}</td>
                    <td className="p-3.5 font-sans">
                      {item.sourceUrl ? (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs truncate max-w-[180px]"
                        >
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{item.sourceUrl.replace(/^https?:\/\//, '')}</span>
                        </a>
                      ) : (
                        <span className="text-slate-600 text-xs">Sin enlace</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleCopyCitation(item)}
                          title="Copiar cita pericial para hallazgo"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 transition"
                          title="Editar norma"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-400 transition"
                          title="Eliminar disposición"
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

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Scale className="w-5 h-5 text-sky-400" />
                {editingItem.id ? 'Editar Disposición Normativa' : 'Nueva Disposición Normativa'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">País / Jurisdicción</label>
                  <select
                    value={editingItem.country}
                    onChange={(e) => setEditingItem({ ...editingItem, country: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  >
                    <option value="República Dominicana">República Dominicana</option>
                    <option value="USA">USA (Yellow Book / GAO)</option>
                    <option value="Internacional">Internacional (INTOSAI)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Autoridad Emisora</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Congreso Nacional, DGCP, GAO"
                    value={editingItem.authority}
                    onChange={(e) => setEditingItem({ ...editingItem, authority: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Título de la Ley, Decreto o Estándar</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Ley No. 340-06 sobre Compras y Contrataciones Públicas"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Artículo / Sección</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Art. 14, Párrafo II"
                    value={editingItem.article}
                    onChange={(e) => setEditingItem({ ...editingItem, article: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Versión</label>
                  <input
                    type="text"
                    placeholder="2024.1"
                    value={editingItem.version}
                    onChange={(e) => setEditingItem({ ...editingItem, version: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Estado de Vigencia</label>
                  <select
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  >
                    <option value="Vigente">Vigente</option>
                    <option value="En Modificación">En Modificación</option>
                    <option value="Derogada">Derogada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Fecha de Entrada en Vigencia</label>
                  <input
                    type="date"
                    value={editingItem.effectiveDate}
                    onChange={(e) => setEditingItem({ ...editingItem, effectiveDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">URL de Fuente Oficial (Gaceta/Portal)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={editingItem.sourceUrl}
                    onChange={(e) => setEditingItem({ ...editingItem, sourceUrl: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Texto / Resumen del Criterio Pericial</label>
                <textarea
                  rows={3}
                  placeholder="Detalle de la obligación normativa, prohibición expresa o estándar de control..."
                  value={editingItem.resumen}
                  onChange={(e) => setEditingItem({ ...editingItem, resumen: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md"
                >
                  Guardar en Catálogo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
