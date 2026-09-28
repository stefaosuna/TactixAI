import React, { useState } from 'react';
import { FullMatchReport, TacticalWeakness, MovementPattern, ImmediateAdjustment } from '../types/tactics';
import {
  FileText,
  Printer,
  Download,
  Copy,
  Check,
  X,
  ShieldAlert,
  Target,
  Users,
  Compass,
  Zap,
} from 'lucide-react';

interface MatchReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: FullMatchReport | null;
  isLoading: boolean;
  rivalName: string;
  score: string;
  minute: string;
  accumulatedWeaknesses: TacticalWeakness[];
  accumulatedPatterns: MovementPattern[];
  appliedAdjustments: ImmediateAdjustment[];
}

export const MatchReportModal: React.FC<MatchReportModalProps> = ({
  isOpen,
  onClose,
  report,
  isLoading,
  rivalName,
  score,
  minute,
  accumulatedWeaknesses,
  accumulatedPatterns,
  appliedAdjustments,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataToExport = {
      matchMeta: {
        competition: 'Fútbol 11',
        rival: rivalName,
        score,
        minute,
        exportedAt: new Date().toISOString(),
      },
      report,
      detectedWeaknesses: accumulatedWeaknesses,
      detectedPatterns: accumulatedPatterns,
      adjustmentsApplied: appliedAdjustments,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte-Tactico-Futbol-${rivalName.replace(/\s+/g, '_')}-${minute.replace("'", 'm')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = () => {
    if (!report) return;
    const text = `📋 DOSSIER TÁCTICO DE FÚTBOL: vs ${rivalName} (${score}, Min: ${minute})
Veredicto Táctico: ${report.executiveVerdict}

🔴 VULNERABILIDADES CRÍTICAS:
${report.rivalTacticalDNA.fatalVulnerabilities.map((v) => `• ${v}`).join('\n')}

⚡ PLAN DE AJUSTE EN VIVO:
${report.gamePlanAdjustments.map((a) => `[${a.phase}] ${a.tacticalOrder}`).join('\n')}

🎯 MARCAS INDIVIDUALES:
${report.individualTargeting.map((t) => `• ${t.targetOpponent}: ${t.actionToExecute}`).join('\n')}

Estrategia Cierre: ${report.closingPlanMinutes}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 no-print">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Informe Técnico y Plan de Ajuste Estratégico
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Rival: {rivalName}</span>
                <span aria-hidden="true">·</span>
                <span>Marcador: {score}</span>
                <span aria-hidden="true">·</span>
                <span>Minuto: {minute}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Copiar texto resumen para cuerpo técnico"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Exportar archivo JSON con telemetría completa"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Exportar JSON</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
              title="Imprimir informe en formato PDF oficial"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable & Scrollable Report Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200 bg-slate-900 print:bg-white print:text-black">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-300">
                Compilando análisis de video y estructurando plan de ajuste con IA...
              </p>
            </div>
          ) : report ? (
            <div className="space-y-6">
              {/* Document Header */}
              <div className="border-b border-slate-800 print:border-black pb-4">
                <div className="flex items-center justify-between text-xs text-slate-400 print:text-slate-600 mb-1">
                  <span>CONFIDENCIAL · CUERPO TÉCNICO Y DIRECCIÓN DEPORTIVA</span>
                  <span>Generado: {report.generatedAt || new Date().toLocaleTimeString()}</span>
                </div>
                <h1 className="text-xl font-bold text-white print:text-black">
                  {report.title}
                </h1>
                <p className="text-xs text-emerald-400 print:text-emerald-700 font-medium mt-0.5">
                  {report.subtitle}
                </p>
              </div>

              {/* Section 1: Executive Verdict */}
              <div className="bg-slate-950/80 print:bg-slate-100 border border-slate-800 print:border-slate-300 rounded-xl p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-700 mb-2 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>Diagnóstico Estratégico Ejecutivo</span>
                </h3>
                <p className="text-sm text-slate-200 print:text-slate-900 leading-relaxed font-medium">
                  {report.executiveVerdict}
                </p>
              </div>

              {/* Section 2: Rival Tactical DNA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-300 rounded-xl p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-700 mb-3 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span>Estructura y Fortalezas Rival</span>
                  </h3>
                  <div className="text-xs text-slate-300 print:text-slate-800 font-mono mb-2">
                    Sistema Base: {report.rivalTacticalDNA.system}
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300 print:text-slate-800 list-disc list-inside">
                    {report.rivalTacticalDNA.strengths.map((str, idx) => (
                      <li key={idx} className="leading-snug">{str}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950/60 print:bg-red-50 border border-red-950/60 print:border-red-300 rounded-xl p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 print:text-red-700 mb-3 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span>Vulnerabilidades Críticas Detectadas</span>
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-300 print:text-red-900 list-disc list-inside">
                    {report.rivalTacticalDNA.fatalVulnerabilities.map((vuln, idx) => (
                      <li key={idx} className="leading-snug">{vuln}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Section 3: Phase-by-phase tactical modifications */}
              <div className="bg-slate-950/60 print:bg-white border border-slate-800 print:border-slate-300 rounded-xl p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-700 mb-3 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Modificaciones Operativas por Fase de Juego</span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 print:border-slate-300 text-slate-400 print:text-slate-600 font-semibold">
                        <th className="py-2 pr-3">Fase</th>
                        <th className="py-2 pr-3">Problema Actual</th>
                        <th className="py-2 pr-3">Modificación Táctica</th>
                        <th className="py-2">Orden de Banquillo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
                      {report.gamePlanAdjustments.map((adj, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/50 print:hover:bg-transparent">
                          <td className="py-2.5 pr-3 font-semibold text-emerald-400 print:text-emerald-700 whitespace-nowrap">
                            {adj.phase}
                          </td>
                          <td className="py-2.5 pr-3 text-slate-300 print:text-slate-800">
                            {adj.currentProblem}
                          </td>
                          <td className="py-2.5 pr-3 text-slate-300 print:text-slate-800">
                            {adj.exactModification}
                          </td>
                          <td className="py-2.5 font-mono text-[11px] text-cyan-300 print:text-cyan-800 font-semibold">
                            {adj.tacticalOrder}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 4: Individual Targeting */}
              <div className="bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-300 rounded-xl p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-700 mb-3 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span>Marcas y Objetivos Individuales</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {report.individualTargeting.map((target, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-900 print:bg-white border border-slate-800 print:border-slate-200 rounded-lg text-xs"
                    >
                      <div className="font-semibold text-slate-200 print:text-black mb-1">
                        {target.targetOpponent}
                      </div>
                      <div className="text-slate-400 print:text-slate-600 mb-1.5">
                        <strong className="text-slate-300 print:text-slate-800">Punto Débil: </strong>
                        {target.flaw}
                      </div>
                      <div className="text-emerald-300 print:text-emerald-700 font-mono text-[11px]">
                        <strong>Acción: </strong>
                        {target.actionToExecute}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 5: Set Pieces & Closing Plan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-300 rounded-xl p-4 text-xs">
                  <h4 className="font-bold text-slate-300 print:text-black mb-1">
                    Estrategia a Balón Parado (Córners / Faltas)
                  </h4>
                  <p className="text-slate-300 print:text-slate-800 leading-relaxed">
                    {report.setPieceStrategy}
                  </p>
                </div>

                <div className="bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-300 rounded-xl p-4 text-xs">
                  <h4 className="font-bold text-slate-300 print:text-black mb-1">
                    Plan de Cierre para Segundo Tiempo / Tramo Final
                  </h4>
                  <p className="text-slate-300 print:text-slate-800 leading-relaxed">
                    {report.closingPlanMinutes}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              No hay reporte generado todavía. Haz clic en "Generar Reporte Completo".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
