import React, { useState } from 'react';
import { Globe, Search, CheckCircle2, XCircle, AlertTriangle, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export const WebAuditView: React.FC = () => {
  const [url, setUrl] = useState('https://portaltransparencia.gob.do');
  const [contexto, setContexto] = useState('Entidad pública descentralizada del Estado Dominicano sujeta a fiscalización');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<any>(null);

  const handleAuditWebsite = async () => {
    if (!url.trim()) return;
    setIsAnalyzing(true);
    setReport(null);
    try {
      const res = await api.analyzeWebsite(url, contexto);
      if (res && res.report) {
        setReport(res.report);
      }
    } catch (err: any) {
      alert(`Error auditando sitio web: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-emerald-400" />
            Auditoría de Portales Web y Transparencia Activa
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Evaluación de cumplimiento de la Ley 200-04 (Acceso a la Información) y Ley 340-06 (Publicidad de Compras).
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              URL del Portal Institucional a Fiscalizar *
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://entidad.gob.do o https://transparencia.entidad.gob.do"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="md:col-span-4 flex items-end">
            <button
              onClick={handleAuditWebsite}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-white" />
                  <span>Inspeccionando Portal...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Auditar Portal Web</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Contexto Institucional (Opcional)</label>
          <input
            type="text"
            value={contexto}
            onChange={(e) => setContexto(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Results view */}
      {isAnalyzing ? (
        <div className="p-16 text-center space-y-3 bg-slate-900 border border-slate-800 rounded-2xl">
          <Sparkles className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
          <div className="text-sm font-bold text-slate-200">Verificando estándares de transparencia pública...</div>
          <div className="text-xs text-slate-400 max-w-md mx-auto">
            Auditando subportal de transparencia, nómina, plan anual de compras (PACC) y actas de comités de compras.
          </div>
        </div>
      ) : report ? (
        <div className="space-y-6">
          {/* Summary Score Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 border border-slate-700 shadow-lg text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Dictamen de Transparencia Activa
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{report.url}</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Nivel de Riesgo Institucional: <strong className={
                    report.nivelRiesgo === 'Crítico' ? 'text-red-400' :
                    report.nivelRiesgo === 'Alto' ? 'text-orange-400' : 'text-emerald-400'
                  }>{report.nivelRiesgo}</strong>
                </p>
              </div>

              <div className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Puntuación Global</div>
                  <div className="text-3xl font-black text-emerald-400">{report.puntuacionTransparencia}/100</div>
                </div>
              </div>
            </div>
          </div>

          {/* Checklist of Evaluated Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-slate-100">Renglones Evaluados de Libre Acceso y Compras</h4>
              <div className="space-y-2.5">
                {report.evaluaciones?.map((ev: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-200">{ev.rubro}</span>
                      {ev.cumplimiento ? (
                        <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Conforme
                        </span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-1 text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Inobservado
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{ev.observacion}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hallazgos & Recomendaciones */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Hallazgos Sugeridos para el Informe
                </h4>
                <div className="space-y-2">
                  {report.hallazgosSugeridos?.map((h: string, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/50 text-xs text-amber-200">
                      • {h}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Medidas de Mitigación Recomendadas
                </h4>
                <div className="space-y-2">
                  {report.recomendacionesMejora?.map((rec: string, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/50 text-xs text-emerald-200">
                      ✓ {rec}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
