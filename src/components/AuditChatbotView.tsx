import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Sparkles,
  Globe,
  Trash2,
  Copy,
  Check,
  Building2,
  FileSpreadsheet,
  Users,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { ChatMessage } from '../types';
import { api } from '../services/api';

export const AuditChatbotView: React.FC = () => {
  const [role, setRole] = useState<'compras' | 'financiero' | 'nomina' | 'forense'>('compras');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'Saludos cordiales. Soy su Asistente Pericial de Auditoría Gubernamental impulsado por Gemini 3.8 Flash con acceso a Search Grounding en tiempo real. ¿En qué proceso de fiscalización o cruce con órganos rectores (DGCP, Contraloría, MAP, DIGECOG, Hacienda) requiere apoyo técnico hoy?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useGoogleSearch, setUseGoogleSearch] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const rolesConfig = {
    compras: {
      title: 'Auditor Senior de Compras & Contratos',
      authority: 'DGCP / Contraloría / Ley 340-06',
      icon: <Building2 className="w-4 h-4 text-blue-400" />,
      color: 'border-blue-500/30 text-blue-400 bg-blue-500/10'
    },
    financiero: {
      title: 'Perito Contable & Estados Financieros',
      authority: 'DIGECOG / NICSP / Ley 126-01',
      icon: <FileSpreadsheet className="w-4 h-4 text-emerald-400" />,
      color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
    },
    nomina: {
      title: 'Fiscalizador de Personal & Salarios',
      authority: 'MAP / SASP / Ley 41-08 / Ley 105-13',
      icon: <Users className="w-4 h-4 text-purple-400" />,
      color: 'border-purple-500/30 text-purple-400 bg-purple-500/10'
    },
    forense: {
      title: 'Auditor Forense Antifraude & Evidencias',
      authority: 'Cámara de Cuentas / Ley 10-04',
      icon: <ShieldAlert className="w-4 h-4 text-red-400" />,
      color: 'border-red-500/30 text-red-400 bg-red-500/10'
    }
  };

  const promptSuggestions = {
    compras: [
      '¿Cuáles son los criterios periciales para tipificar fraccionamiento de compras?',
      '¿Qué requisitos debe contener un acta de recepción conforme de peritos?',
      '¿Cuándo procede ejecutar la póliza de fiel cumplimiento?'
    ],
    financiero: [
      '¿Cómo conciliar el pasivo devengado institucional vs reporte de DIGECOG?',
      '¿Qué tratamiento tienen los anticipos no amortizados al cierre del año fiscal?',
      '¿Cuáles son las pruebas periciales de corte de operaciones en Caja Única?'
    ],
    nomina: [
      '¿Cómo detectar una nómina paralela frente a la estructura aprobada por el MAP?',
      '¿Cuáles son las excepciones constitucionales a la doble remuneración estatal?',
      '¿Qué hacer ante sueldos por encima de la escala de la Ley 105-13?'
    ],
    forense: [
      'Estructure un hallazgo formal con Condición, Criterio, Causa y Efecto para pagos sin soporte',
      '¿Qué valor probatorio tiene el hash SHA-256 en custodia pericial?',
      '¿Cómo cuantificar el perjuicio patrimonial presunto para la Cámara de Cuentas?'
    ]
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      // Build conversation history for API
      const historyPayload = newMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.sendChatMessage(historyPayload, role, useGoogleSearch);

      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingSources: res.groundingSources
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: `Error al procesar consulta: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    if (confirm('¿Desea reiniciar la sesión de consulta pericial?')) {
      setMessages([
        {
          id: 'welcome-reset',
          role: 'model',
          content: `Sesión reiniciada. Ha seleccionado el rol: ${rolesConfig[role].title}. ¿En qué podemos asistirle?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              Asistente Pericial Forense (Gemini 3.8 Flash Chatbot)
            </h2>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              Multi-Turno con Grounding
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Interrogue jurisprudencia, normativas dominicanas y redacción pericial en vivo con roles especializados de fiscalización.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={useGoogleSearch}
              onChange={(e) => setUseGoogleSearch(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
            />
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-blue-400" /> Google Grounding
            </span>
          </label>

          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            title="Limpiar conversación"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reiniciar</span>
          </button>
        </div>
      </div>

      {/* Role Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.keys(rolesConfig) as Array<keyof typeof rolesConfig>).map((key) => {
          const cfg = rolesConfig[key];
          const isActive = role === key;
          return (
            <button
              key={key}
              onClick={() => setRole(key)}
              className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between gap-3 ${
                isActive
                  ? `${cfg.color} border-current shadow-md`
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="truncate">
                <div className="text-xs font-bold truncate">{cfg.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">{cfg.authority}</div>
              </div>
              <div className="shrink-0">{cfg.icon}</div>
            </button>
          );
        })}
      </div>

      {/* Chat Thread Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm flex flex-col h-[520px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-indigo-950/80 border border-indigo-700/50 text-indigo-400'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className="space-y-1.5 flex-1">
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none space-y-2'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {/* Google Grounding Sources */}
                    {msg.groundingSources && msg.groundingSources.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/80 mt-2">
                        <div className="text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                          <Globe className="w-3 h-3 text-blue-400" />
                          Fuentes Oficiales Contrastadas (Google Search Grounding):
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.groundingSources.map((source, idx) => (
                            <a
                              key={idx}
                              href={source.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-blue-400 text-[10px] hover:text-blue-300 truncate max-w-xs"
                            >
                              <span className="truncate">{source.title}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`flex items-center gap-2 text-[10px] text-slate-500 px-1 ${isUser ? 'justify-end' : ''}`}>
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="hover:text-slate-300 transition"
                        title="Copiar respuesta"
                      >
                        {copiedId === msg.id ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Copiado
                          </span>
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-3xl">
              <div className="w-8 h-8 rounded-xl bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center text-indigo-400 shrink-0">
                <Sparkles className="w-4 h-4 animate-spin text-indigo-400" />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-none bg-slate-950 border border-slate-800 text-xs text-indigo-300 flex items-center gap-2">
                <span>El auditor pericial está analizando normativas y bases oficiales...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Queries Chips */}
        <div className="px-5 py-2 border-t border-slate-800/60 bg-slate-950/40 flex items-center gap-2 overflow-x-auto text-[11px] text-slate-400">
          <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="font-semibold text-slate-400 shrink-0">Sugerencias:</span>
          {promptSuggestions[role].map((sug, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(sug)}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition truncate shrink-0 max-w-xs"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Consulte al ${rolesConfig[role].title}...`}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md disabled:opacity-50 flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Consultar</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
