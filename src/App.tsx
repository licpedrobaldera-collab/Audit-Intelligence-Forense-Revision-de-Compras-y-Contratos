import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ExpedientesView } from './components/ExpedientesView';
import { DocumentosOcrView } from './components/DocumentosOcrView';
import { IaAuditorView } from './components/IaAuditorView';
import { HallazgosView } from './components/HallazgosView';
import { RiesgosView } from './components/RiesgosView';
import { ProveedoresContratosView } from './components/ProveedoresContratosView';
import { PagosConciliacionView } from './components/PagosConciliacionView';
import { WebAuditView } from './components/WebAuditView';
import { NormativaView } from './components/NormativaView';
import { ReportesExportView } from './components/ReportesExportView';
import { DesktopPackageView } from './components/DesktopPackageView';
import { SeguridadView } from './components/SeguridadView';
import { DatabaseState, Expediente, Hallazgo, Riesgo, Proveedor, Contrato, Pago, Evidencia } from './types';
import { api } from './services/api';
import { exportService } from './services/exportService';

export default function App() {
  const [data, setData] = useState<DatabaseState | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedExpedienteId, setSelectedExpedienteId] = useState<number | null>(1);
  const [currentUser] = useState('admin');

  // Text transferred from Documentos/OCR to IA Auditor
  const [aiAuditorPreset, setAiAuditorPreset] = useState<{ text: string; title: string } | null>(null);

  // Load all data on mount
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getAll();
      setData(res);
      // If selected dossier no longer exists, select first
      if (res.expedientes.length > 0 && !res.expedientes.some(e => e.id === selectedExpedienteId)) {
        setSelectedExpedienteId(res.expedientes[0].id);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResetSample = async () => {
    if (confirm('¿Restaurar la base de datos con el caso modelo de auditoría integral?')) {
      const res = await api.resetToSample(currentUser);
      if (res.success) {
        setData(res.data);
        setSelectedExpedienteId(res.data.expedientes[0]?.id || null);
      }
    }
  };

  const handleExportZip = async () => {
    if (!data) return;
    const activeExp = data.expedientes.find(e => e.id === selectedExpedienteId) || null;
    await exportService.exportFullZip(data, activeExp);
  };

  // --- Handlers for Entities ---
  const handleSaveExpediente = async (exp: Partial<Expediente>) => {
    await api.saveExpediente({ ...exp, user: currentUser });
    await loadData();
  };

  const handleDeleteExpediente = async (id: number) => {
    await api.deleteExpediente(id, currentUser);
    if (selectedExpedienteId === id) setSelectedExpedienteId(null);
    await loadData();
  };

  const handleSaveHallazgo = async (h: Partial<Hallazgo>) => {
    await api.saveHallazgo({ ...h, user: currentUser });
    await loadData();
  };

  const handleDeleteHallazgo = async (id: number) => {
    await api.deleteHallazgo(id, currentUser);
    await loadData();
  };

  const handleSaveRiesgo = async (r: Partial<Riesgo>) => {
    await api.saveRiesgo({ ...r, user: currentUser });
    await loadData();
  };

  const handleDeleteRiesgo = async (id: number) => {
    await api.deleteRiesgo(id, currentUser);
    await loadData();
  };

  const handleSaveProveedor = async (p: Partial<Proveedor>) => {
    await api.saveProveedor({ ...p, user: currentUser });
    await loadData();
  };

  const handleDeleteProveedor = async (id: number) => {
    await api.deleteProveedor(id, currentUser);
    await loadData();
  };

  const handleSaveContrato = async (c: Partial<Contrato>) => {
    await api.saveContrato({ ...c, user: currentUser });
    await loadData();
  };

  const handleDeleteContrato = async (id: number) => {
    await api.deleteContrato(id, currentUser);
    await loadData();
  };

  const handleSavePago = async (p: Partial<Pago>) => {
    const res = await api.savePago({ ...p, user: currentUser });
    if (res.alertaDuplicado) {
      alert('⚠️ ALERTA: Este pago presenta coincidencias con un desembolso previo (mismo beneficiario o comprobante). Fue marcado para revisión especial.');
    }
    await loadData();
  };

  const handleDeletePago = async (id: number) => {
    await api.deletePago(id, currentUser);
    await loadData();
  };

  const handleSaveEvidencia = async (ev: Partial<Evidencia>) => {
    await api.saveEvidencia({ ...ev, user: currentUser });
    await loadData();
  };

  const handleDeleteEvidencia = async (id: number) => {
    await api.deleteEvidencia(id, currentUser);
    await loadData();
  };

  const handleSendToAiAuditor = (text: string, title?: string) => {
    setAiAuditorPreset({ text, title: title || 'Evidencia analizada' });
    setActiveTab('ia-auditor');
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-black text-2xl animate-pulse">
          AI
        </div>
        <div className="text-sm font-semibold tracking-wide text-slate-300">
          Iniciando Audit Intelligence Pro Enterprise...
        </div>
        <div className="text-xs text-slate-500">Cargando base normativa y casos de fiscalización</div>
      </div>
    );
  }

  const activeExpediente = data.expedientes.find(e => e.id === selectedExpedienteId) || null;
  const riesgosCriticos = data.riesgos.filter(r => r.nivel === 'Crítico').length;
  const pagosDuplicados = data.pagos.filter(p => p.alertaDuplicado).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Global Header */}
      <Header
        expedientes={data.expedientes}
        selectedExpedienteId={selectedExpedienteId}
        onSelectExpediente={setSelectedExpedienteId}
        onResetSample={handleResetSample}
        onExportZip={handleExportZip}
        currentUser={currentUser}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          hallazgosCount={data.hallazgos.length}
          riesgosCriticosCount={riesgosCriticos}
          pagosDuplicadosCount={pagosDuplicados}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 p-6 overflow-y-auto bg-slate-950">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                data={data}
                selectedExpediente={activeExpediente}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'expedientes' && (
              <ExpedientesView
                data={data}
                selectedExpedienteId={selectedExpedienteId}
                onSelectExpediente={setSelectedExpedienteId}
                onSaveExpediente={handleSaveExpediente}
                onDeleteExpediente={handleDeleteExpediente}
              />
            )}

            {activeTab === 'documentos' && (
              <DocumentosOcrView
                data={data}
                selectedExpedienteId={selectedExpedienteId}
                onSaveEvidencia={handleSaveEvidencia}
                onDeleteEvidencia={handleDeleteEvidencia}
                onSendToAiAuditor={handleSendToAiAuditor}
              />
            )}

            {activeTab === 'ia-auditor' && (
              <IaAuditorView
                data={data}
                selectedExpedienteId={selectedExpedienteId}
                initialText={aiAuditorPreset?.text}
                initialTitle={aiAuditorPreset?.title}
                onSaveHallazgo={handleSaveHallazgo}
              />
            )}

            {activeTab === 'hallazgos' && (
              <HallazgosView
                data={data}
                selectedExpedienteId={selectedExpedienteId}
                onSaveHallazgo={handleSaveHallazgo}
                onDeleteHallazgo={handleDeleteHallazgo}
              />
            )}

            {activeTab === 'riesgos' && (
              <RiesgosView
                data={data}
                selectedExpedienteId={selectedExpedienteId}
                onSaveRiesgo={handleSaveRiesgo}
                onDeleteRiesgo={handleDeleteRiesgo}
              />
            )}

            {activeTab === 'proveedores' && (
              <ProveedoresContratosView
                data={data}
                onSaveProveedor={handleSaveProveedor}
                onDeleteProveedor={handleDeleteProveedor}
                onSaveContrato={handleSaveContrato}
                onDeleteContrato={handleDeleteContrato}
              />
            )}

            {activeTab === 'pagos' && (
              <PagosConciliacionView
                data={data}
                onSavePago={handleSavePago}
                onDeletePago={handleDeletePago}
              />
            )}

            {activeTab === 'web-audit' && <WebAuditView />}

            {activeTab === 'normativas' && <NormativaView data={data} />}

            {activeTab === 'reportes' && (
              <ReportesExportView
                data={data}
                selectedExpediente={activeExpediente}
              />
            )}

            {activeTab === 'desktop-pack' && <DesktopPackageView />}

            {activeTab === 'seguridad' && (
              <SeguridadView
                data={data}
                currentUser={currentUser}
                onResetSample={handleResetSample}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
