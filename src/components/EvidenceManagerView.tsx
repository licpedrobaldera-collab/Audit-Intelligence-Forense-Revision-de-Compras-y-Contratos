import React, { useState } from 'react';
import {
  FolderArchive,
  FolderOpen,
  FileText,
  Image,
  ExternalLink,
  ShieldCheck,
  Plus,
  Search,
  Download,
  Copy,
  Check,
  FileCode,
  FileSpreadsheet,
  AlertTriangle,
  FolderTree,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { DatabaseState, EvidenceFolder, EvidenceFolderItem } from '../types';
import { api } from '../services/api';

interface EvidenceManagerViewProps {
  data: DatabaseState;
  selectedExpedienteId: number | null;
  currentUser: string;
  onRefreshData: () => Promise<void>;
}

export const EvidenceManagerView: React.FC<EvidenceManagerViewProps> = ({
  data,
  selectedExpedienteId,
  currentUser,
  onRefreshData,
}) => {
  const folders = data.evidenceFolders || [];
  const [selectedFolderId, setSelectedFolderId] = useState<string>(folders[0]?.id || 'evidence/hallazgo_0001');
  const [activeSubTab, setActiveSubTab] = useState<'todos' | 'capturas' | 'pdf' | 'ocr' | 'links' | 'reportes'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // New Evidence Item Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemTipo, setNewItemTipo] = useState<'captura' | 'pdf' | 'ocr' | 'link' | 'reporte'>('link');
  const [newItemNombre, setNewItemNombre] = useState('');
  const [newItemUrl, setNewItemUrl] = useState('');
  const [newItemTexto, setNewItemTexto] = useState('');

  const currentFolder = folders.find(f => f.id === selectedFolderId) || folders[0] || null;

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFolder || !newItemNombre.trim()) return;

    try {
      await api.addEvidenceFolderItem({
        folderId: currentFolder.id,
        tipo: newItemTipo,
        nombre: newItemNombre,
        url: newItemUrl || undefined,
        texto: newItemTexto || undefined,
        user: currentUser
      });

      setIsModalOpen(false);
      setNewItemNombre('');
      setNewItemUrl('');
      setNewItemTexto('');
      await onRefreshData();
    } catch (err: any) {
      alert(`Error al agregar soporte: ${err.message}`);
    }
  };

  const downloadFolderManifest = () => {
    if (!currentFolder) return;
    const manifestJson = JSON.stringify(currentFolder, null, 2);
    const blob = new Blob([manifestJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manifest_${currentFolder.id.replace('/', '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
              <FolderArchive className="w-5 h-5 text-purple-400" />
              Gestor de Evidencias Digitales por Hallazgo (evidence/hallazgo_XXXX)
            </h2>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
              Cadena de Custodia SHA-256
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Sustento probatorio autónomo para cada hallazgo de auditoría. Carpetas con capturas digitales de portales, contratos PDF, transcripciones OCR, enlaces web verificables y actas periciales para transcripción al informe y verificación física.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={downloadFolderManifest}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            Descargar Metadatos JSON
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Incorporar Soporte Digital
          </button>
        </div>
      </div>

      {/* Main Layout: Folder Tree & Evidence Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Folders Directory */}
        <div className="lg:col-span-4 space-y-3">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2 text-xs text-slate-400 pb-2 border-b border-slate-800 font-semibold uppercase tracking-wider">
              <FolderTree className="w-4 h-4 text-purple-400" />
              Directorios de Evidencias ({folders.length})
            </div>

            <div className="space-y-2 mt-3 max-h-[600px] overflow-y-auto pr-1">
              {folders.map((f) => {
                const isSelected = f.id === selectedFolderId;
                const totalFiles =
                  f.subcarpetas.capturas.length +
                  f.subcarpetas.pdf.length +
                  f.subcarpetas.ocr.length +
                  f.subcarpetas.links.length +
                  f.subcarpetas.reportes.length;

                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFolderId(f.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-purple-950/20 border-purple-500/50 shadow-md'
                        : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FolderOpen className={`w-4 h-4 ${isSelected ? 'text-purple-400' : 'text-slate-400'}`} />
                        <span className="font-mono text-xs font-bold text-slate-200">
                          {f.id}
                        </span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                        {totalFiles} soportes
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 line-clamp-1 mt-1 font-medium">
                      {f.hallazgoTitulo}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
                      <span>{f.metadata.entidad}</span>
                      <span>{f.fecha}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Evidence Inspector for Selected Folder */}
        <div className="lg:col-span-8">
          {currentFolder ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
              {/* Folder Header */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-purple-400 px-2 py-0.5 bg-purple-500/10 rounded border border-purple-500/30">
                      {currentFolder.id}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                      Hallazgo #{currentFolder.hallazgoId}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-medium border border-blue-500/30">
                      {currentFolder.metadata.clasificacion}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 mt-2">
                    {currentFolder.hallazgoTitulo}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Fuente: <span className="text-slate-200 font-medium">{currentFolder.fuente}</span> &bull; Fecha de custodia: {currentFolder.fecha}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-right">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 justify-end">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Hash SHA-256 de Custodia:</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-[10px] text-slate-300">
                      {currentFolder.sha256.slice(0, 18)}...
                    </span>
                    <button
                      onClick={() => copyHash(currentFolder.sha256)}
                      className="text-slate-400 hover:text-white"
                      title="Copiar hash completo"
                    >
                      {copiedHash === currentFolder.sha256 ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Subfolders Navigation Tabs */}
              <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 text-xs">
                {(['todos', 'capturas', 'pdf', 'ocr', 'links', 'reportes'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveSubTab(t)}
                    className={`px-3 py-1.5 rounded-lg capitalize transition font-medium text-xs ${
                      activeSubTab === t
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Items Display */}
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {/* 1. Links */}
                {(activeSubTab === 'todos' || activeSubTab === 'links') && currentFolder.subcarpetas.links.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                      Enlaces Oficiales Verificados ({currentFolder.subcarpetas.links.length})
                    </span>
                    {currentFolder.subcarpetas.links.map((lnk) => (
                      <div key={lnk.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/70 flex items-center justify-between gap-3 text-xs">
                        <div>
                          <h5 className="font-semibold text-slate-200">{lnk.titulo}</h5>
                          <p className="text-[11px] text-slate-400 mt-0.5">{lnk.descripcion}</p>
                          <span className="text-[10px] text-slate-500 font-mono">{lnk.url}</span>
                        </div>
                        <a
                          href={lnk.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 bg-sky-600/20 text-sky-300 border border-sky-500/30 rounded-lg hover:bg-sky-600/30 font-medium flex items-center gap-1 shrink-0"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Abrir Link
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. Capturas */}
                {(activeSubTab === 'todos' || activeSubTab === 'capturas') && currentFolder.subcarpetas.capturas.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Image className="w-3.5 h-3.5 text-emerald-400" />
                      Capturas de Pantalla de Portales ({currentFolder.subcarpetas.capturas.length})
                    </span>
                    {currentFolder.subcarpetas.capturas.map((cap) => (
                      <div key={cap.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/70 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <Image className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <span className="font-semibold text-slate-200">{cap.nombre}</span>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">SHA256: {cap.sha256}</div>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400">{cap.fecha}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. PDFs */}
                {(activeSubTab === 'todos' || activeSubTab === 'pdf') && currentFolder.subcarpetas.pdf.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-rose-400" />
                      Pliegos y Contratos Digitales PDF ({currentFolder.subcarpetas.pdf.length})
                    </span>
                    {currentFolder.subcarpetas.pdf.map((doc) => (
                      <div key={doc.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/70 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                          <div>
                            <span className="font-semibold text-slate-200">{doc.nombre}</span>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">{doc.tamano} &bull; SHA256: {doc.sha256}</div>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400">{doc.fecha}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 4. OCR Extractos */}
                {(activeSubTab === 'todos' || activeSubTab === 'ocr') && currentFolder.subcarpetas.ocr.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-amber-400" />
                      Transcripciones OCR de Soporte ({currentFolder.subcarpetas.ocr.length})
                    </span>
                    {currentFolder.subcarpetas.ocr.map((ocr) => (
                      <div key={ocr.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/70 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-amber-300">{ocr.nombre}</span>
                          <span className="text-[10px] text-slate-500">{ocr.fecha}</span>
                        </div>
                        <div className="p-2.5 rounded bg-slate-900/90 font-mono text-[11px] text-slate-300 whitespace-pre-wrap border border-slate-800">
                          {ocr.texto}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 5. Reportes Periciales */}
                {(activeSubTab === 'todos' || activeSubTab === 'reportes') && currentFolder.subcarpetas.reportes.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
                      Fichas Periciales &amp; Dictámenes (.docx / .xlsx)
                    </span>
                    {currentFolder.subcarpetas.reportes.map((rep) => (
                      <div key={rep.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/70 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <FileSpreadsheet className="w-4 h-4 text-indigo-400 shrink-0" />
                          <div>
                            <span className="font-semibold text-slate-200">{rep.nombre}</span>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">{rep.tamano} &bull; SHA256: {rep.sha256}</div>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400">{rep.fecha}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
              Seleccione una carpeta de evidencias para examinar los soportes digitales.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add Evidence Item */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-purple-400" />
                Incorporar Soporte Digital a {currentFolder?.id}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Tipo de Soporte:</label>
                <select
                  value={newItemTipo}
                  onChange={(e) => setNewItemTipo(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                >
                  <option value="link">Enlace Web Oficial (URL Transparencia / DGCP)</option>
                  <option value="captura">Captura de Pantalla (.png / .jpg)</option>
                  <option value="pdf">Documento PDF (Pliego, Contrato, Factura)</option>
                  <option value="ocr">Extracto de Texto OCR</option>
                  <option value="reporte">Ficha / Reporte Pericial (.docx)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Nombre o Título del Archivo/Soporte:</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Contrato_Formal_Firmado_INCART_LINAC.pdf"
                  value={newItemNombre}
                  onChange={(e) => setNewItemNombre(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              {newItemTipo === 'link' || newItemTipo === 'captura' ? (
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">URL Oficial:</label>
                  <input
                    type="url"
                    placeholder="https://www.incart.gob.do/transparencia..."
                    value={newItemUrl}
                    onChange={(e) => setNewItemUrl(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
              ) : null}

              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  {newItemTipo === 'ocr' ? 'Texto Extraído OCR:' : 'Descripción o Notas del Perito:'}
                </label>
                <textarea
                  rows={3}
                  value={newItemTexto}
                  onChange={(e) => setNewItemTexto(e.target.value)}
                  placeholder="Detallar extracto del documento, firma de perito, fianza o folio..."
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
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg shadow"
                >
                  Guardar con SHA-256
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
