import React, { useState, useEffect } from 'react';
import { SportType } from '../types/tactics';
import {
  Activity,
  FileSpreadsheet,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Shield,
  Layers,
} from 'lucide-react';

interface HeaderProps {
  rivalName: string;
  onChangeRivalName: (name: string) => void;
  score: string;
  onChangeScore: (score: string) => void;
  minute: string;
  onChangeMinute: React.Dispatch<React.SetStateAction<string>>;
  onOpenReportModal: () => void;
  onResetMatch: () => void;
  hasApiKey: boolean;
  totalWeaknessesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  rivalName,
  onChangeRivalName,
  score,
  onChangeScore,
  minute,
  onChangeMinute,
  onOpenReportModal,
  onResetMatch,
  hasApiKey,
  totalWeaknessesCount,
}) => {
  const [timerRunning, setTimerRunning] = useState(true);
  const [isEditingRival, setIsEditingRival] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Match clock ticker: cleanly updates parent minute when running without nested setState
  useEffect(() => {
    if (!timerRunning) return;

    const interval = setInterval(() => {
      onChangeMinute((prevMinute) => {
        const parsed = parseInt(prevMinute.replace(/\D/g, ''), 10);
        const current = isNaN(parsed) ? 26 : parsed;
        return `${current + 1}'`;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [timerRunning, onChangeMinute]);

  return (
    <header className="bg-slate-950 border-b border-slate-800 text-white px-4 lg:px-6 py-3 sticky top-0 z-40">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Soccer Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-tight text-base text-white">
                  TACTIX<span className="text-emerald-400">AI</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 font-semibold">
                  FÚTBOL PRO
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Análisis Táctico de Fútbol 11 y Scouting en Tiempo Real
              </p>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-slate-800 hidden md:block"></div>

          {/* Match Status Tag */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-[11px] text-slate-300">Encuentro Oficial Fútbol 11</span>
          </div>
        </div>

        {/* Match Center: Rival & Score & Time Controls */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
          {/* Rival Name */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Rival:</span>
            {isEditingRival ? (
              <input
                type="text"
                value={rivalName}
                onChange={(e) => onChangeRivalName(e.target.value)}
                onBlur={() => setIsEditingRival(false)}
                autoFocus
                className="bg-slate-950 border border-emerald-500 rounded px-1.5 py-0.5 text-white font-bold text-xs focus:outline-none w-28"
              />
            ) : (
              <button
                onClick={() => setIsEditingRival(true)}
                className="font-bold text-slate-100 hover:text-emerald-400 hover:underline transition-colors"
                title="Haz clic para cambiar el nombre del rival"
              >
                {rivalName}
              </button>
            )}
          </div>

          <span className="text-slate-700">|</span>

          {/* Score */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[11px]">Marcador:</span>
            <input
              type="text"
              value={score}
              onChange={(e) => onChangeScore(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-center font-mono font-bold text-white rounded px-1.5 py-0.5 text-xs w-14 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <span className="text-slate-700">|</span>

          {/* Clock Timer */}
          <div className="flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={minute}
              onChange={(e) => onChangeMinute(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-center font-mono text-emerald-400 font-bold rounded px-1 py-0.5 text-xs w-12 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
              title={timerRunning ? 'Pausar reloj' : 'Reanudar reloj'}
            >
              {timerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Action Buttons: Reset & Report */}
        <div className="flex items-center gap-2">
          {/* Reset All Data Button */}
          {showConfirmReset ? (
            <div className="flex items-center gap-1 bg-slate-900 border border-red-500/50 rounded-lg p-1 animate-in fade-in zoom-in-95 duration-150">
              <span className="text-[11px] font-medium text-red-300 px-1.5">
                ¿Resetear todo?
              </span>
              <button
                onClick={() => {
                  onResetMatch();
                  setShowConfirmReset(false);
                }}
                className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[11px] font-bold transition-colors shadow"
              >
                Sí, limpiar
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-red-300 border border-slate-800 hover:border-red-900/40 rounded-lg text-xs font-semibold transition-all"
              title="Reiniciar y limpiar todo el análisis del partido"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Resetear Info</span>
            </button>
          )}

          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-lg shadow-emerald-950/40 transition-all border border-emerald-500/40"
            title="Generar informe completo descargable e imprimible"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Generar Reporte de Partido</span>
            {totalWeaknessesCount > 0 && (
              <span className="px-1.5 py-0.2 bg-white/20 text-white rounded-full text-[10px] font-mono">
                {totalWeaknessesCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
