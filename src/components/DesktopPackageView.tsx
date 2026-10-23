import React, { useState } from 'react';
import { Terminal, Download, Copy, Check, FolderTree, Play, Sparkles, Layers } from 'lucide-react';

export const DesktopPackageView: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2500);
  };

  const pyinstallerCommand = `pyinstaller --onefile --windowed --name="Audit_Intelligence_Pro" --icon=icon.ico launcher.py`;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
              <Terminal className="w-5 h-5 text-purple-400" />
              Arquitectura Desktop Autónoma (AUDIT_INTELLIGENCE_PRO)
            </h2>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
              Windows EXE Ready
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Archivos fuente preparados para ejecución local en Windows y compilación a ejecutable autónomo con PyInstaller.
          </p>
        </div>
      </div>

      {/* Architecture overview and compilation guide */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-purple-400" />
            Estructura Modular del Proyecto Local
          </h3>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto">
            <div className="text-purple-400 font-bold">AUDIT_INTELLIGENCE_PRO/</div>
            <div>├── launcher.py &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500"># Loader automático y verificador</span></div>
            <div>├── app.py &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500"># Motor unificado final (Streamlit)</span></div>
            <div>├── updater.py &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500"># Autoactualizador normativo</span></div>
            <div>├── requirements.txt &nbsp;&nbsp;<span className="text-slate-500"># Dependencias completas</span></div>
            <div>├── config.ini &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500"># Configuración de motores e IA</span></div>
            <div>├── database/ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500"># Base SQLite con llaves foráneas</span></div>
            <div>├── uploads/ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500"># Custodia de evidencias con SHA-256</span></div>
            <div>├── exports/ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500"># Salidas en Word, Excel, PDF</span></div>
            <div>└── logs/ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500"># Registro inmutable de actividad</span></div>
          </div>

          <div className="space-y-2 text-xs text-slate-400">
            <div className="font-semibold text-slate-300">Flujo al hacer doble clic en el ejecutable:</div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-blue-400 flex items-center justify-center font-bold text-[10px]">1</span>
              <span>Verifica versión de Python instalada.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-blue-400 flex items-center justify-center font-bold text-[10px]">2</span>
              <span>Crea carpetas faltantes (uploads, exports, backups, database).</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-blue-400 flex items-center justify-center font-bold text-[10px]">3</span>
              <span>Verifica e instala dependencias de requirements.txt.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-blue-400 flex items-center justify-center font-bold text-[10px]">4</span>
              <span>Inicializa base SQLite con tablas normalizadas y normativas.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center font-bold text-[10px]">5</span>
              <span>Lanza automáticamente la interfaz de auditoría.</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-400" />
            Compilación a Ejecutable Autónomo (.EXE)
          </h3>

          <p className="text-xs text-slate-400 leading-relaxed">
            Para distribuir la aplicación a los auditores en computadoras Windows sin necesidad de configurar Python manualmente, ejecute este comando en la terminal:
          </p>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
            <code className="text-xs text-emerald-400 font-mono break-all">{pyinstallerCommand}</code>
            <button
              onClick={() => copyCode(pyinstallerCommand, 'pyinstaller')}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0"
              title="Copiar comando"
            >
              {copied === 'pyinstaller' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/40 text-xs text-purple-200 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-purple-300">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Ventajas de la Arquitectura Unificada:
            </div>
            <div>• <strong>Persistencia Completa:</strong> SQLite con WAL y claves foráneas activadas.</div>
            <div>• <strong>Soporte Multi-Formato:</strong> PDF (PyMuPDF), DOCX (python-docx), Excel (openpyxl) y CSV.</div>
            <div>• <strong>Doble Entorno:</strong> Puede usar el sistema web en esta plataforma o el ejecutable desktop en computadoras desconectadas de internet.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
