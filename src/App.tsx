/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { VideoMatchPlayer, VideoMatchPlayerHandle } from './components/VideoMatchPlayer';
import { TelestratorToolbar } from './components/TelestratorToolbar';
import { TacticalPitchRadar } from './components/TacticalPitchRadar';
import { TacticalIntelligenceDeck } from './components/TacticalIntelligenceDeck';
import { MatchReportModal } from './components/MatchReportModal';
import {
  SportType,
  TacticalWeakness,
  MovementPattern,
  ImmediateAdjustment,
  TacticalZone,
  TacticalBookmarkEvent,
  TelestratorDrawing,
  FullMatchReport,
} from './types/tactics';
import {
  Sparkles,
  Info,
  Shield,
  Layers,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';

export default function App() {
  // Match metadata state
  const sport: SportType = 'fútbol';
  const [rivalName, setRivalName] = useState('Atlético Rival CF');
  const [score, setScore] = useState('0 - 1');
  const [minute, setMinute] = useState('26\'');

  // AI & Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);
  const [autoScanActive, setAutoScanActive] = useState(false);
  const [showAiZones, setShowAiZones] = useState(true);
  const [tacticalSummary, setTacticalSummary] = useState(
    'El rival adelanta la línea defensiva a 38 metros pero sufre descoordinación en basculación: lateral derecho sube sin relevo del mediocentro.'
  );
  const [formationDetected, setFormationDetected] = useState('4-4-2 Bloque Alto');
  const [defensiveBlockHeight, setDefensiveBlockHeight] = useState('38m (Línea Adelantada)');
  const [statisticsConfidence, setStatisticsConfidence] = useState(96);
  const [audioBriefText, setAudioBriefText] = useState(
    '¡Atención banda izquierda! Espacio libre a la espalda de su lateral derecho, ataque directo.'
  );
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedZoneName, setSelectedZoneName] = useState<string | null>(null);

  // Tactical data collections
  const [weaknesses, setWeaknesses] = useState<TacticalWeakness[]>([
    {
      id: 'w-init-1',
      title: 'Espacio desprotegido a la espalda de laterales',
      zone: 'Banda Derecha Rival (Nuestra Izquierda)',
      severity: 'CRÍTICA',
      flawDetail:
        'Distancia excesiva de 28 metros entre lateral derecho y central derecho al adelantar filas. No hay cobertura de repliegue del pivote defensivo.',
      howToExploit:
        'Lanzar de primera a nuestro extremo zurdo en cuanto recuperemos la posesión, sin conducción intermedia.',
      targetPlayerOrSector: 'Lateral #2 rival y espalda del pivote',
      timestamp: '14:20',
    },
    {
      id: 'w-init-2',
      title: 'Vulnerabilidad al pase entre líneas en salida de balón',
      zone: 'Zona 14 (Mediapunta rival)',
      severity: 'ALTA',
      flawDetail:
        'Sus dos mediocentros no coordinan la altura: uno presiona y el otro se hunde, creando un pozo de 15 metros sin vigilancia.',
      howToExploit:
        'Fijar a nuestro mediapunta en el vértice ciego para girar de cara al marco en dos toques.',
      targetPlayerOrSector: 'Pivote defensivo #6 rival',
      timestamp: '21:05',
    },
    {
      id: 'w-init-3',
      title: 'Falta de agresividad en segundas jugadas de córner',
      zone: 'Borde del área grande',
      severity: 'MEDIA',
      flawDetail:
        'Rechazan hacia el centro y ningún volante sale a cerrar el disparo exterior de media distancia.',
      howToExploit:
        'Dejar un tirador libre en la frontal esperando el balón suelto.',
      targetPlayerOrSector: 'Frontal del área',
      timestamp: '25:40',
    },
  ]);

  const [patterns, setPatterns] = useState<MovementPattern[]>([
    {
      id: 'p-init-1',
      patternName: 'Proyección ciega del Lateral Derecho',
      zone: 'Banda Derecha Rival',
      trigger: 'Pérdida de balón en 3/4 de cancha',
      description:
        'El lateral sube constantemente hasta línea de fondo pero tarda 4.2 segundos en iniciar el repliegue.',
      predictability: 'Alta',
      counterMeasure:
        'Transición vertiginosa directa al espacio libre a su espalda con nuestro extremo.',
    },
    {
      id: 'p-init-2',
      patternName: 'Salto descoordinado del Central zurdo a presión',
      zone: 'Carril Central',
      trigger: 'Recepción del mediapunta entre líneas',
      description:
        'El central #4 salta agresivo a interceptar dejando una brecha enorme entre él y su compañero de zaga.',
      predictability: 'Media',
      counterMeasure:
        'Pared rápida de espaldas y desmarque de ruptura al hueco generado.',
    },
    {
      id: 'p-init-3',
      patternName: 'Basculación lenta hacia banda contraria',
      zone: 'Cambio de orientación',
      trigger: 'Atracción en banda izquierda',
      description:
        'El equipo rival se junta en 30 metros de ancho, concediendo el lado débil completamente desguarnecido.',
      predictability: 'Alta',
      counterMeasure:
        'Cambio de juego de 40 metros con golpeo tenso al lateral opuesto incorporado.',
    },
  ]);

  const [adjustments, setAdjustments] = useState<ImmediateAdjustment[]>([
    {
      id: 'adj-init-1',
      title: 'Explotar carril izquierdo con balones al espacio',
      type: 'Ofensivo',
      instruction:
        'Evitar la circulación lenta horizontal. En cuanto recuperemos, pase vertical al desmarque del extremo izquierdo.',
      priority: 'Inmediata (En vivo)',
      applied: false,
    },
    {
      id: 'adj-init-2',
      title: 'Orientar la presión sobre su central diestro',
      type: 'Defensivo',
      instruction:
        'Tapar el pase hacia el centro y forzar su salida hacia la banda con pierna izquierda.',
      priority: 'Inmediata (En vivo)',
      applied: false,
    },
    {
      id: 'adj-init-3',
      title: 'Escalonamiento de marcas en repliegue',
      type: 'Transición',
      instruction:
        'Pivote defensivo debe escalonar 5 metros por detrás para cortar el pase diagonal.',
      priority: 'Entretiempo',
      applied: false,
    },
  ]);

  const [detectedZones, setDetectedZones] = useState<TacticalZone[]>([
    {
      name: 'Espalda Lateral Derecho',
      x: 52,
      y: 16,
      width: 20,
      height: 25,
      type: 'vulnerable',
      note: 'Espacio desguarnecido de 28m tras proyección de lateral rival',
    },
    {
      name: 'Sobrecarga Defensiva Rival',
      x: 64,
      y: 42,
      width: 24,
      height: 30,
      type: 'sobrecarga',
      note: '6 jugadores rivales concentrados en sector derecho',
    },
    {
      name: 'Pasillo de Pase Vertical',
      x: 44,
      y: 48,
      width: 16,
      height: 20,
      type: 'espacio_libre',
      note: 'Hueco entre líneas para giro de mediapunta',
    },
  ]);

  const [timelineEvents, setTimelineEvents] = useState<TacticalBookmarkEvent[]>([
    {
      id: 'bm-1',
      timestampSeconds: 14.5,
      minuteFormatted: '14\'',
      title: 'Desajuste en Espalda de Lateral',
      type: 'weakness',
      severity: 'CRÍTICA',
      detail: 'Lateral #2 rival proyectado sin cobertura de central.',
      zone: 'Banda Derecha Rival',
    },
    {
      id: 'bm-2',
      timestampSeconds: 21.0,
      minuteFormatted: '21\'',
      title: 'Hueco Entre Líneas (Zona 14)',
      type: 'pattern',
      severity: 'ALTA',
      detail: 'Pivotes rivales descoordinados en altura de presión.',
      zone: 'Zona 14',
    },
  ]);

  // Telestrator state
  const [telestratorDrawings, setTelestratorDrawings] = useState<TelestratorDrawing[]>([]);
  const [activeDrawingTool, setActiveDrawingTool] = useState<'arrow' | 'circle' | 'line' | 'freehand' | 'none'>('arrow');
  const [drawingColor, setDrawingColor] = useState('#ef4444');

  // Report modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [fullReport, setFullReport] = useState<FullMatchReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const videoPlayerRef = useRef<VideoMatchPlayerHandle | null>(null);

  // Check backend status on mount
  useEffect(() => {
    fetch('/api/status')
      .then((r) => r.json())
      .then((data) => {
        if (data.hasApiKey !== undefined) {
          setHasApiKey(data.hasApiKey);
        }
      })
      .catch((err) => console.log('Backend status check:', err));
  }, []);

  // Handle Analyzing a frame with Gemini AI
  const handleAnalyzeFrame = async (base64Image: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          sport,
          matchContext: {
            rivalName,
            score,
            minute,
          },
          focusArea: 'patrones_y_debilidades_tiempo_real',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Update state with AI analysis
      if (data.tacticalSummary) setTacticalSummary(data.tacticalSummary);
      if (data.formationDetected) setFormationDetected(data.formationDetected);
      if (data.defensiveBlockHeight) setDefensiveBlockHeight(data.defensiveBlockHeight);
      if (data.statisticsConfidence) setStatisticsConfidence(data.statisticsConfidence);
      if (data.audioBriefText) setAudioBriefText(data.audioBriefText);

      // Merge new weaknesses without duplicating IDs
      if (data.tacticalWeaknesses && data.tacticalWeaknesses.length > 0) {
        setWeaknesses((prev) => {
          const newItems = data.tacticalWeaknesses.map((w: any) => ({
            ...w,
            id: w.id || `w-${Date.now()}-${Math.random()}`,
            timestamp: minute,
          }));
          return [...newItems, ...prev];
        });

        // Add to timeline
        const primaryWeakness = data.tacticalWeaknesses[0];
        const currentTime = videoPlayerRef.current?.getCurrentTime() || 0;
        setTimelineEvents((prev) => [
          {
            id: `bm-${Date.now()}`,
            timestampSeconds: currentTime,
            minuteFormatted: minute,
            title: primaryWeakness.title,
            type: 'weakness',
            severity: primaryWeakness.severity || 'ALTA',
            detail: primaryWeakness.flawDetail,
            zone: primaryWeakness.zone,
          },
          ...prev,
        ]);
      }

      if (data.movementPatterns && data.movementPatterns.length > 0) {
        setPatterns((prev) => {
          const newItems = data.movementPatterns.map((p: any) => ({
            ...p,
            id: p.id || `p-${Date.now()}-${Math.random()}`,
          }));
          return [...newItems, ...prev];
        });
      }

      if (data.immediateAdjustments && data.immediateAdjustments.length > 0) {
        setAdjustments((prev) => {
          const newItems = data.immediateAdjustments.map((a: any) => ({
            ...a,
            id: a.id || `adj-${Date.now()}-${Math.random()}`,
            applied: false,
          }));
          return [...newItems, ...prev];
        });
      }

      if (data.detectedTacticalZones && data.detectedTacticalZones.length > 0) {
        setDetectedZones(data.detectedTacticalZones);
      }
    } catch (error) {
      console.error('Error analyzing frame with Gemini:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate full match report
  const handleOpenFullReport = async () => {
    setReportModalOpen(true);
    setIsLoadingReport(true);
    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rivalName,
          sport,
          currentScore: score,
          matchMinute: minute,
          accumulatedWeaknesses: weaknesses,
          accumulatedPatterns: patterns,
          adjustmentsApplied: adjustments,
          keyFramesCount: timelineEvents.length + 1,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reportData = await response.json();
      setFullReport(reportData);
    } catch (err) {
      console.error('Failed to generate full report:', err);
    } finally {
      setIsLoadingReport(false);
    }
  };

  // Apply tactical adjustment
  const handleApplyAdjustment = (id: string) => {
    setAdjustments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, applied: !a.applied } : a))
    );
  };

  // Audio briefing with Gemini TTS or Web Speech fallback
  const handlePlayAudioBrief = async (text: string) => {
    if (!text) return;
    setIsPlayingAudio(true);

    try {
      // First attempt server-side Gemini TTS
      const res = await fetch('/api/audio-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (data.available && data.audioBase64) {
        const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = () => fallbackWebSpeech(text);
        await audio.play();
      } else {
        fallbackWebSpeech(text);
      }
    } catch (e) {
      fallbackWebSpeech(text);
    }
  };

  const fallbackWebSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(false);
    }
  };

  // Telestrator tools
  const handleAddDrawing = (drawing: TelestratorDrawing) => {
    setTelestratorDrawings((prev) => [...prev, drawing]);
  };

  const handleUndoDrawing = () => {
    setTelestratorDrawings((prev) => prev.slice(0, -1));
  };

  const handleClearDrawings = () => {
    setTelestratorDrawings([]);
  };

  // Seek video
  const handleSeekToEvent = (timestampSeconds: number) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.seekTo(timestampSeconds);
    }
  };

  // Select zone
  const handleSelectZone = (zone: TacticalZone) => {
    setSelectedZoneName(zone.name);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header
        rivalName={rivalName}
        onChangeRivalName={setRivalName}
        score={score}
        onChangeScore={setScore}
        minute={minute}
        onChangeMinute={setMinute}
        onOpenReportModal={handleOpenFullReport}
        hasApiKey={hasApiKey}
        totalWeaknessesCount={weaknesses.length}
      />

      {/* Main Tactical Operations Dashboard */}
      <main className="flex-1 p-3 lg:p-5 max-w-[1720px] w-full mx-auto flex flex-col gap-4">
        {/* Dual Column Layout: Video & Telestrator (Left) + Tactical Intelligence & Radar (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Column (7 cols): Match Video Player + Telestrator Controls */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            {/* Video Player */}
            <VideoMatchPlayer
              ref={videoPlayerRef}
              rivalName={rivalName}
              isAnalyzing={isAnalyzing}
              onAnalyzeFrame={handleAnalyzeFrame}
              detectedZones={detectedZones}
              showAiZones={showAiZones}
              telestratorDrawings={telestratorDrawings}
              onAddDrawing={handleAddDrawing}
              activeDrawingTool={activeDrawingTool}
              drawingColor={drawingColor}
              autoScanActive={autoScanActive}
              onToggleAutoScan={() => setAutoScanActive(!autoScanActive)}
            />

            {/* Telestrator Drawing Toolbar */}
            <TelestratorToolbar
              activeTool={activeDrawingTool}
              onSelectTool={setActiveDrawingTool}
              selectedColor={drawingColor}
              onSelectColor={setDrawingColor}
              onUndo={handleUndoDrawing}
              onClear={handleClearDrawings}
              showAiZones={showAiZones}
              onToggleAiZones={() => setShowAiZones(!showAiZones)}
              drawingsCount={telestratorDrawings.length}
            />
          </div>

          {/* Right Column (5 cols): AI Intelligence Deck + Spatial Radar */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Real-time Tactical Intelligence Deck */}
            <TacticalIntelligenceDeck
              tacticalSummary={tacticalSummary}
              formationDetected={formationDetected}
              defensiveBlockHeight={defensiveBlockHeight}
              statisticsConfidence={statisticsConfidence}
              weaknesses={weaknesses}
              patterns={patterns}
              adjustments={adjustments}
              timelineEvents={timelineEvents}
              audioBriefText={audioBriefText}
              onApplyAdjustment={handleApplyAdjustment}
              onSeekToEvent={handleSeekToEvent}
              onPlayAudioBrief={handlePlayAudioBrief}
              isPlayingAudio={isPlayingAudio}
              onSelectZoneByName={(name) => setSelectedZoneName(name)}
            />

            {/* 2D Overhead Pitch Radar */}
            <TacticalPitchRadar
              rivalName={rivalName}
              formation={formationDetected}
              defensiveBlockHeight={defensiveBlockHeight}
              tacticalZones={detectedZones}
              onSelectZone={handleSelectZone}
              selectedZoneName={selectedZoneName}
            />
          </div>
        </div>
      </main>

      {/* Match Comprehensive Report Modal */}
      <MatchReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        report={fullReport}
        isLoading={isLoadingReport}
        rivalName={rivalName}
        score={score}
        minute={minute}
        accumulatedWeaknesses={weaknesses}
        accumulatedPatterns={patterns}
        appliedAdjustments={adjustments}
      />
    </div>
  );
}
