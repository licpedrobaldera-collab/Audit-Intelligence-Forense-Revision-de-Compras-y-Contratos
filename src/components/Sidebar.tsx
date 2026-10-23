import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Bot,
  AlertTriangle,
  TrendingDown,
  Building2,
  Receipt,
  Globe,
  Scale,
  FileSpreadsheet,
  Terminal,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'expedientes'
  | 'documentos'
  | 'ia-auditor'
  | 'hallazgos'
  | 'riesgos'
  | 'proveedores'
  | 'pagos'
  | 'web-audit'
  | 'normativas'
  | 'reportes'
  | 'desktop-pack'
  | 'seguridad';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  hallazgosCount: number;
  riesgosCriticosCount: number;
  pagosDuplicadosCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  hallazgosCount,
  riesgosCriticosCount,
  pagosDuplicadosCount,
}) => {
  const menuItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard Ejecutivo', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'expedientes', label: 'Expedientes de Auditoría', icon: <FolderKanban className="w-4 h-4" /> },
    { id: 'documentos', label: 'Documentos & OCR', icon: <FileText className="w-4 h-4" /> },
    { id: 'ia-auditor', label: 'IA Auditor (Normativo)', icon: <Bot className="w-4 h-4 text-indigo-400" /> },
    {
      id: 'hallazgos',
      label: 'Hallazgos (Editor)',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
      badge: hallazgosCount,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      id: 'riesgos',
      label: 'Matriz de Riesgos',
      icon: <TrendingDown className="w-4 h-4 text-red-400" />,
      badge: riesgosCriticosCount > 0 ? riesgosCriticosCount : undefined,
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30'
    },
    { id: 'proveedores', label: 'Proveedores & Contratos', icon: <Building2 className="w-4 h-4" /> },
    {
      id: 'pagos',
      label: 'Pagos & Duplicados',
      icon: <Receipt className="w-4 h-4" />,
      badge: pagosDuplicadosCount > 0 ? pagosDuplicadosCount : undefined,
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30'
    },
    { id: 'web-audit', label: 'Auditoría Sitios Web', icon: <Globe className="w-4 h-4 text-emerald-400" /> },
    { id: 'normativas', label: 'Base Normativa', icon: <Scale className="w-4 h-4 text-sky-400" /> },
    { id: 'reportes', label: 'Reportes & Exportaciones', icon: <FileSpreadsheet className="w-4 h-4 text-blue-400" /> },
    { id: 'desktop-pack', label: 'Paquete Python Desktop', icon: <Terminal className="w-4 h-4 text-purple-400" /> },
    { id: 'seguridad', label: 'Seguridad & Bitácora', icon: <ShieldCheck className="w-4 h-4 text-slate-400" /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col shrink-0">
      <div className="p-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4">
        Módulos de Fiscalización
      </div>
      <nav className="flex-1 px-2.5 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className={isActive ? 'text-blue-400' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {item.badge !== undefined && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-400" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="p-3 m-2.5 rounded-lg bg-slate-800/60 border border-slate-800 text-[11px] text-slate-400">
        <div className="font-semibold text-slate-300">Normas Clave Activas</div>
        <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">
          Ley 340-06 · Dec. 543-12<br />
          Ley 10-04 · NOBACI · ISSAI
        </div>
      </div>
    </aside>
  );
};
