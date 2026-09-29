import React, { useState } from 'react';
import {
  TacticalWeakness,
  MovementPattern,
  ImmediateAdjustment,
  TacticalBookmarkEvent,
  TacticalZone,
} from '../types/tactics';
import {
  AlertTriangle,
  TrendingUp,
  Sliders,
  Clock,
  Volume2,
  VolumeX,
  CheckCircle2,
  ChevronRight,
  Shield,
  Zap,
  Target,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

interface TacticalIntelligenceDeckProps {
  tacticalSummary: string;
  formationDetected: string;
  defensiveBlockHeight: string;
  statisticsConfidence: number;
  weaknesses: TacticalWeakness[];
  patterns: MovementPattern[];
  adjustments: ImmediateAdjustment[];
  timelineEvents: TacticalBookmarkEvent[];
  audioBriefText: string;
  onApplyAdjustment: (id: string) => void;
  onSeekToEvent: (timestamp: number) => void;
  onPlayAudioBrief: (text: string) => void;
  isPlayingAudio: boolean;
  onSelectZoneByName?: (zoneName: string) => void;
}

export const TacticalIntelligenceDeck: React.FC<TacticalIntelligenceDeckProps> = ({
  tacticalSummary,
  formationDetected,
  defensiveBlockHeight,
  statisticsConfidence,
  weaknesses,
  patterns,
  adjustments,
  timelineEvents,
  audioBriefText,
  onApplyAdjustment,
  onSeekToEvent,
  onPlayAudioBrief,
  isPlayingAudio,
  onSelectZoneByName,
}) => {
  const [activeTab, setActiveTab] = useState<'debilidades' | 'patrones' | 'ajustes' | 'timeline'>('debilidades');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const appliedAdjustmentsCount = adjustments.filter((a) => a.applied).length;

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Top Tactical Briefing Banner */}
      <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span className="font-semibold text-emerald-400">Diagnóstico Táctico IA</span>
              <span aria-hidden="true">·</span>
              <span>Certeza: {statisticsConfidence}%</span>
              <span aria-hidden="true">·</span>
              <span>{formationDetected}</span>
            </div>
            <p className="text-sm font-medium text-slate-100 leading-snug">
              {tacticalSummary}
            </p>
          </div>

          {/* Coach Quick Audio Alert Button */}
          <button
            onClick={() => audioBriefText && onPlayAudioBrief(audioBriefText)}
            disabled={!audioBriefText}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
              !audioBriefText
                ? 'opacity-40 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-500'
                : isPlayingAudio
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title={audioBriefText ? 'Escuchar indicación táctica urgente por audio' : 'Sin indicaciones de audio pendientes'}
          >
            {isPlayingAudio ? (
              <>
                <Volume2 className="w-4 h-4 text-amber-400 animate-bounce" />
                <span className="hidden sm:inline">Transmitiendo...</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Pinganillo DT</span>
              </>
            )}
          </button>
        </div>

        {/* Audio Briefing Transcription Line */}
        {audioBriefText && (
          <div className="mt-2.5 px-3 py-1.5 bg-slate-950/70 border border-slate-800/80 rounded-md flex items-center gap-2 text-xs text-amber-300/90 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span className="text-[11px] truncate">"{audioBriefText}"</span>
          </div>
        )}
      </div>

      {/* Navigation Segmented Tabs */}
      <div className="flex items-center gap-1 p-1.5 bg-slate-950 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('debilidades')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'debilidades'
              ? 'bg-red-500/20 text-red-300 border border-red-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          <span>Debilidades</span>
          <span className="ml-1 text-[10px] font-mono text-slate-400">({weaknesses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('patrones')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'patrones'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          <span>Patrones</span>
          <span className="ml-1 text-[10px] font-mono text-slate-400">({patterns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ajustes')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'ajustes'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ajustes en Vivo</span>
          {appliedAdjustmentsCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-emerald-500 text-slate-950 font-bold rounded-full text-[9px]">
              {appliedAdjustmentsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'timeline'
              ? 'bg-slate-800 text-slate-200 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Línea Temporal</span>
          <span className="ml-1 text-[10px] font-mono text-slate-400">({timelineEvents.length})</span>
        </button>
      </div>

      {/* Tab Body Content */}
      <div className="p-4 overflow-y-auto max-h-[380px] space-y-3">
        {/* Tab 1: Tactical Weaknesses */}
        {activeTab === 'debilidades' && (
          <div className="space-y-3">
            {weaknesses.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                Captura un frame o activa el auto-escaneo para detectar debilidades tácticas.
              </div>
            ) : (
              weaknesses.map((w) => {
                const isExpanded = expandedItemId === w.id;
                return (
                  <div
                    key={w.id}
                    className="border border-slate-800 hover:border-slate-700 bg-slate-950/60 rounded-lg p-3 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-bold tracking-wider uppercase ${
                              w.severity === 'CRÍTICA'
                                ? 'text-red-400'
                                : w.severity === 'ALTA'
                                ? 'text-amber-400'
                                : 'text-slate-400'
                            }`}
                          >
                            Severidad {w.severity}
                          </span>
                          <span className="text-slate-600">·</span>
                          <button
                            onClick={() => onSelectZoneByName && onSelectZoneByName(w.zone)}
                            className="text-[11px] text-cyan-400 hover:underline flex items-center gap-0.5"
                          >
                            <span>{w.zone}</span>
                            <ArrowUpRight className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-200">
                          {w.title}
                        </h4>
                      </div>

                      <button
                        onClick={() => setExpandedItemId(isExpanded ? null : w.id)}
                        className="text-xs text-slate-400 hover:text-slate-200 p-1"
                      >
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        />
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      {w.flawDetail}
                    </p>

                    {/* How to exploit callout */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-start gap-2 bg-emerald-950/20 -mx-1 px-2.5 py-1.5 rounded">
                      <Target className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-emerald-200 leading-snug">
                        <strong className="text-emerald-400 font-semibold">Cómo Explotar: </strong>
                        {w.howToExploit}
                      </div>
                    </div>

                    {isExpanded && w.targetPlayerOrSector && (
                      <div className="mt-2 text-[11px] text-slate-400 bg-slate-900 px-2 py-1 rounded">
                        <span className="font-semibold text-slate-300">Objetivo Directo: </span>
                        {w.targetPlayerOrSector}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Movement Patterns */}
        {activeTab === 'patrones' && (
          <div className="space-y-3">
            {patterns.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                Analizando dinámica de movimiento y basculación del rival...
              </div>
            ) : (
              patterns.map((p) => (
                <div
                  key={p.id}
                  className="border border-slate-800 bg-slate-950/60 rounded-lg p-3 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h4 className="text-xs font-semibold text-slate-200">
                      {p.patternName}
                    </h4>
                    <span className="text-[10px] text-cyan-400 font-mono">
                      Predecibilidad: {p.predictability}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 mb-2">
                    <span className="font-semibold text-slate-300">Detonante (Trigger): </span>
                    {p.trigger}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {p.description}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-start gap-2 bg-cyan-950/20 -mx-1 px-2.5 py-1.5 rounded">
                    <Zap className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-cyan-200 leading-snug">
                      <strong className="text-cyan-400 font-semibold">Contramedida: </strong>
                      {p.counterMeasure}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Immediate In-Game Tactical Adjustments */}
        {activeTab === 'ajustes' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800">
              <span>Instrucciones directas para el banquillo</span>
              <span className="font-mono text-emerald-400">
                {appliedAdjustmentsCount} de {adjustments.length} ejecutados
              </span>
            </div>

            {adjustments.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                Sin ajustes pendientes generados.
              </div>
            ) : (
              adjustments.map((adj) => (
                <div
                  key={adj.id}
                  className={`border rounded-lg p-3 transition-all ${
                    adj.applied
                      ? 'border-emerald-500/40 bg-emerald-950/20'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          {adj.type}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-[10px] text-amber-400 font-medium">
                          {adj.priority}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-100">
                        {adj.title}
                      </h4>
                    </div>

                    <button
                      onClick={() => onApplyAdjustment(adj.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        adj.applied
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{adj.applied ? 'Instrucción Dada' : 'Ejecutar Ajuste'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-900/80 p-2 rounded border border-slate-800/80 font-mono text-[11px]">
                    "{adj.instruction}"
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Match Timeline Bookmarks */}
        {activeTab === 'timeline' && (
          <div className="space-y-2">
            {timelineEvents.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                La línea de tiempo registrará automáticamente cada hallazgo durante el partido.
              </div>
            ) : (
              timelineEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => onSeekToEvent(ev.timestampSeconds)}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800/80 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[11px] font-mono font-bold">
                      {ev.minuteFormatted}
                    </span>
                    <div>
                      <div className="text-xs font-medium text-slate-200">
                        {ev.title}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[280px]">
                        {ev.detail}
                      </div>
                    </div>
                  </div>

                  <button className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-0.5">
                    <span>Ver</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
