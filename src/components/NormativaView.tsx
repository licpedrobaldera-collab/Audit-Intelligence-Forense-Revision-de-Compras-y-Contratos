import React, { useState } from 'react';
import { Scale, Search, Copy, Check, BookOpen, ExternalLink, Bookmark } from 'lucide-react';
import { DatabaseState, Normativa } from '../types';

interface NormativaViewProps {
  data: DatabaseState;
}

export const NormativaView: React.FC<NormativaViewProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState<string>('todos');
  const [copiedArt, setCopiedArt] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedArt(id);
    setTimeout(() => setCopiedArt(null), 2500);
  };

  const filtered = data.normativas.filter(n => {
    const matchesSearch =
      n.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.resumen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.articulosClave.some(a =>
        a.articulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.texto.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesTipo = selectedTipo === 'todos' || n.tipo === selectedTipo;
    return matchesSearch && matchesTipo;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-sky-400" />
            Base Normativa y Criterios Legales de Auditoría
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Compendio legal indexado: Ley 340-06, Decreto 543-12, Ley 10-04, Ley 41-08, NOBACI e ISSAI/INTOSAI.
          </p>
        </div>

        {/* Quick filters */}
        <div className="flex items-center gap-2">
          {['todos', 'Ley', 'Decreto', 'Norma Interna', 'Estándar Internacional'].map((tipo) => (
            <button
              key={tipo}
              onClick={() => setSelectedTipo(tipo)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                selectedTipo === tipo
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {tipo === 'todos' ? 'Todas' : tipo}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Buscar por artículo, tema (ej. fraccionamiento, fianza, recepción, comité de compras)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 shadow-sm"
        />
      </div>

      {/* Normative Cards */}
      <div className="space-y-6">
        {filtered.map((norm) => (
          <div key={norm.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {norm.id}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">({norm.organismo})</span>
                </div>
                <h3 className="text-base font-bold text-slate-100 mt-1">{norm.nombre}</h3>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 w-fit">
                {norm.tipo}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{norm.resumen}</p>

            {/* Key Articles Cards */}
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                Artículos y Disposiciones Clave para el Criterio del Hallazgo:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {norm.articulosClave.map((art, idx) => {
                  const copyKey = `${norm.id}-${idx}`;
                  const isCopied = copiedArt === copyKey;
                  const fullCitation = `${norm.nombre}, ${art.articulo} (${art.tema}): "${art.texto}"`;

                  return (
                    <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-2 text-xs">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-bold text-sky-400 font-mono">{art.articulo}</span>
                          <span className="text-[10px] text-slate-400 font-medium bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {art.tema}
                          </span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{art.texto}</p>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => copyToClipboard(fullCitation, copyKey)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition"
                          title="Copiar texto para usarlo como Criterio en el Hallazgo"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">¡Copiado al portapapeles!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-400" />
                              <span>Copiar Criterio Legal</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
