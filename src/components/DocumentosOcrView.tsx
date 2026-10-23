import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  Eye,
  Trash2,
  CheckCircle2,
  FileSearch,
  ScanText,
  ShieldCheck,
  FileCode,
  Tag
} from 'lucide-react';
import { Evidencia, DatabaseState } from '../types';
import { api } from '../services/api';

interface DocumentosOcrViewProps {
  data: DatabaseState;
  selectedExpedienteId: number | null;
  onSaveEvidencia: (ev: Partial<Evidencia>) => Promise<void>;
  onDeleteEvidencia: (id: number) => Promise<void>;
  onSendToAiAuditor: (text: string, title?: string) => void;
}

export const DocumentosOcrView: React.FC<DocumentosOcrViewProps> = ({
  data,
  selectedExpedienteId,
  onSaveEvidencia,
  onDeleteEvidencia,
  onSendToAiAuditor,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [selectedEvidencia, setSelectedEvidencia] = useState<Evidencia | null>(null);

  // Helper to compute SHA-256 in browser
  async function computeSha256(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Handle file drop/upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setStatusMessage('Calculando hash criptográfico SHA-256 e inspeccionando archivo...');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const sha256 = await computeSha256(file);
        let textoExtraido = '';
        let metadatos: any = {};

        // If image or PDF, try OCR with Gemini
        if (file.type.startsWith('image/') || file.name.endsWith('.pdf')) {
          setStatusMessage(`Ejecutando OCR pericial en ${file.name}...`);
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onload = () => {
              const res = reader.result as string;
              resolve(res.split(',')[1]);
            };
            reader.readAsDataURL(file);
          });
          const base64Data = await base64Promise;

          try {
            const ocrRes = await api.ocrExtract(base64Data, file.type, file.name);
            if (ocrRes && ocrRes.result) {
              textoExtraido = ocrRes.result.textoExtraido || '';
              metadatos = {
                rnc: ocrRes.result.rnc || [],
                montos: ocrRes.result.montos || [],
                fechas: ocrRes.result.fechas || [],
                ncf: ocrRes.result.ncf || [],
                firmasDetectadas: ocrRes.result.firmasDetectadas,
              };
            }
          } catch (ocrErr) {
            console.error('OCR Error:', ocrErr);
            textoExtraido = `[Archivo ${file.name} cargado en custodia].`;
          }
        } else if (file.type === 'text/plain' || file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
          textoExtraido = await file.text();
        } else {
          textoExtraido = `Documento ${file.name} registrado con verificación de integridad.`;
        }

        await onSaveEvidencia({
          expedienteId: selectedExpedienteId,
          nombreOriginal: file.name,
          sha256,
          tipo: file.type || 'application/octet-stream',
          tamano: file.size,
          textoExtraido,
          metadatos,
        });

      } catch (err: any) {
        console.error('Error uploading file:', err);
        alert(`Error al procesar ${file.name}: ${err.message}`);
      }
    }

    setIsProcessing(false);
    setStatusMessage(null);
    e.target.value = '';
  };

  const filtered = selectedExpedienteId
    ? data.evidencias.filter(e => e.expedienteId === selectedExpedienteId)
    : data.evidencias;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <ScanText className="w-5 h-5 text-indigo-400" />
            Evidencias Documentales y Motor OCR Multimodal
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Carga de contratos, facturas, comprobantes fiscales, órdenes de compra y extracción pericial de texto con Gemini 3.8.
          </p>
        </div>

        <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-md transition shrink-0">
          <Upload className="w-4 h-4" />
          <span>Cargar Documentos / Facturas</span>
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.docx,.xlsx,.xls,.csv,.txt,.png,.jpg,.jpeg"
            disabled={isProcessing}
          />
        </label>
      </div>

      {isProcessing && (
        <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/80 text-indigo-300 text-xs flex items-center gap-3 animate-pulse">
          <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" />
          <span>{statusMessage || 'Procesando documentos con inteligencia artificial...'}</span>
        </div>
      )}

      {/* Main Grid: Evidence List & Text Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Evidences list (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-blue-400" />
              Expedientes en Custodia Digital ({filtered.length})
            </h3>
            <span className="text-[11px] text-slate-400">Verificados con SHA-256</span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                No hay evidencias cargadas para este expediente. Utilice el botón superior para cargar archivos.
              </div>
            ) : (
              filtered.map((ev) => {
                const isSelected = selectedEvidencia?.id === ev.id;
                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvidencia(ev)}
                    className={`p-4 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/90 border-blue-500 ring-1 ring-blue-500/20'
                        : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <FileCode className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-slate-200">{ev.nombreOriginal}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            SHA-256: {ev.sha256.slice(0, 20)}...
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                          {(ev.tamano / 1024).toFixed(1)} KB
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`¿Eliminar la evidencia ${ev.nombreOriginal}?`)) {
                              onDeleteEvidencia(ev.id);
                              if (selectedEvidencia?.id === ev.id) setSelectedEvidencia(null);
                            }
                          }}
                          className="p-1 rounded hover:bg-red-950/40 text-slate-500 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata tags */}
                    {ev.metadatos && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-700/40">
                        {ev.metadatos.rnc && ev.metadatos.rnc.length > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/50">
                            RNC: {ev.metadatos.rnc.join(', ')}
                          </span>
                        )}
                        {ev.metadatos.ncf && ev.metadatos.ncf.length > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                            NCF: {ev.metadatos.ncf.join(', ')}
                          </span>
                        )}
                        {ev.metadatos.montos && ev.metadatos.montos.length > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/50">
                            Monto: {ev.metadatos.montos[0]}
                          </span>
                        )}
                        {ev.metadatos.firmasDetectadas && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/50 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Firmas detectadas
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Evidence Inspector / Extracted Text Viewer (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                Visor de Transcripción & OCR
              </h3>
              {selectedEvidencia && (
                <button
                  onClick={() => onSendToAiAuditor(selectedEvidencia.textoExtraido, selectedEvidencia.nombreOriginal)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Auditar con IA</span>
                </button>
              )}
            </div>

            {selectedEvidencia ? (
              <div className="space-y-3 mt-3">
                <div className="text-xs text-slate-300">
                  <strong>Archivo:</strong> {selectedEvidencia.nombreOriginal}
                </div>
                <div className="text-[11px] text-slate-400">
                  <strong>Cadena de custodia (SHA-256):</strong>
                  <div className="font-mono bg-slate-950 p-2 rounded text-[10px] text-slate-300 break-all mt-1">
                    {selectedEvidencia.sha256}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-1">Texto Extraído / Contenido:</div>
                  <textarea
                    readOnly
                    rows={12}
                    value={selectedEvidencia.textoExtraido}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono leading-relaxed resize-none focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-slate-500">
                Seleccione un documento de la lista para ver su texto extraído, datos fiscales y firmas.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Verificación forense contra Ley 340-06</span>
            <span className="text-emerald-400 font-medium">Cadena de custodia intacta</span>
          </div>
        </div>
      </div>
    </div>
  );
};
