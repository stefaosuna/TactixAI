import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, RotateCcw, FastForward, Camera, Sparkles, Upload, Video, Monitor, AlertCircle } from 'lucide-react';
import { SportType, TacticalZone, TelestratorDrawing } from '../types/tactics';

export interface VideoMatchPlayerHandle {
  captureCurrentFrame: () => string | null;
  getCurrentTime: () => number;
  seekTo: (time: number) => void;
  isPlaying: () => boolean;
}

interface VideoMatchPlayerProps {
  rivalName: string;
  isAnalyzing: boolean;
  onAnalyzeFrame: (base64Image: string) => void;
  detectedZones: TacticalZone[];
  showAiZones: boolean;
  telestratorDrawings: TelestratorDrawing[];
  onAddDrawing: (drawing: TelestratorDrawing) => void;
  activeDrawingTool: 'arrow' | 'circle' | 'line' | 'freehand' | 'none';
  drawingColor: string;
  autoScanActive: boolean;
  onToggleAutoScan: () => void;
}

export const VideoMatchPlayer = forwardRef<VideoMatchPlayerHandle, VideoMatchPlayerProps>(({
  rivalName,
  isAnalyzing,
  onAnalyzeFrame,
  detectedZones,
  showAiZones,
  telestratorDrawings,
  onAddDrawing,
  activeDrawingTool,
  drawingColor,
  autoScanActive,
  onToggleAutoScan,
}, ref) => {
  const [sourceType, setSourceType] = useState<'simulated' | 'file' | 'camera'>('simulated');
  const [simulationScenario, setSimulationScenario] = useState<'futbol_high_press' | 'futbol_counter' | 'futbol_low_block'>('futbol_high_press');
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(14.5);
  const [duration, setDuration] = useState(90); // seconds in clip
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const simCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Drawing state
  const isDrawingRef = useRef(false);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const currentPathRef = useRef<{ x: number; y: number }[]>([]);

  // Simulation physics state
  const simStateRef = useRef({
    time: 14.5,
    ball: { x: 50, y: 50, vx: 0.8, vy: 0.4 },
    players: [] as Array<{ id: number; team: 'rival' | 'propio'; x: number; y: number; vx: number; vy: number; role: string; num: number }>,
    highlightWeaknessZone: true,
  });

  // Expose handles to parent
  useImperativeHandle(ref, () => ({
    captureCurrentFrame: () => {
      return captureFrameBase64();
    },
    getCurrentTime: () => {
      if (sourceType === 'file' && videoRef.current) {
        return videoRef.current.currentTime;
      }
      return currentTime;
    },
    seekTo: (time: number) => {
      if (sourceType === 'file' && videoRef.current) {
        videoRef.current.currentTime = time;
      } else {
        setCurrentTime(time);
        simStateRef.current.time = time;
      }
    },
    isPlaying: () => isPlaying,
  }));

  // Capture frame as base64
  const captureFrameBase64 = (): string | null => {
    try {
      const offscreen = document.createElement('canvas');
      offscreen.width = 1280;
      offscreen.height = 720;
      const ctx = offscreen.getContext('2d');
      if (!ctx) return null;

      if (sourceType === 'file' || sourceType === 'camera') {
        if (videoRef.current && videoRef.current.readyState >= 2) {
          ctx.drawImage(videoRef.current, 0, 0, 1280, 720);
        } else {
          return null;
        }
      } else if (simCanvasRef.current) {
        ctx.drawImage(simCanvasRef.current, 0, 0, 1280, 720);
      }

      // Also render telestrator drawings on top of captured snapshot if any
      if (drawingCanvasRef.current) {
        ctx.drawImage(drawingCanvasRef.current, 0, 0, 1280, 720);
      }

      return offscreen.toDataURL('image/jpeg', 0.88);
    } catch (e) {
      console.error('Failed to capture frame:', e);
      return null;
    }
  };

  // Initialize simulation football players
  useEffect(() => {
    const players: Array<{ id: number; team: 'rival' | 'propio'; x: number; y: number; vx: number; vy: number; role: string; num: number }> = [];

    if (simulationScenario === 'futbol_counter') {
      // Counter-attack scenario with defensive line caught in transition
      players.push({ id: 1, team: 'rival', x: 88, y: 50, vx: 0, vy: 0, role: 'Portero (#1)', num: 1 });
      players.push({ id: 2, team: 'rival', x: 55, y: 15, vx: 0.1, vy: 0.1, role: 'Lateral Der (#2)', num: 2 });
      players.push({ id: 3, team: 'rival', x: 62, y: 44, vx: -0.2, vy: 0.05, role: 'Central Der (#4)', num: 4 });
      players.push({ id: 4, team: 'rival', x: 64, y: 65, vx: -0.1, vy: -0.05, role: 'Central Izq (#5)', num: 5 });
      players.push({ id: 5, team: 'rival', x: 50, y: 85, vx: -0.1, vy: 0.1, role: 'Lateral Izq (#3)', num: 3 });
      players.push({ id: 6, team: 'rival', x: 45, y: 48, vx: -0.3, vy: 0.1, role: 'Pivote (#6)', num: 6 });
      players.push({ id: 7, team: 'rival', x: 42, y: 35, vx: -0.2, vy: 0.1, role: 'Interior (#8)', num: 8 });
      players.push({ id: 8, team: 'rival', x: 40, y: 68, vx: -0.2, vy: -0.1, role: 'Interior (#10)', num: 10 });
      players.push({ id: 9, team: 'rival', x: 30, y: 25, vx: -0.1, vy: 0.1, role: 'Extremo (#7)', num: 7 });
      players.push({ id: 10, team: 'rival', x: 26, y: 52, vx: -0.1, vy: 0.1, role: 'Delantero (#9)', num: 9 });
      players.push({ id: 11, team: 'rival', x: 28, y: 78, vx: -0.1, vy: 0.1, role: 'Extremo (#11)', num: 11 });

      // Our fast break
      players.push({ id: 12, team: 'propio', x: 12, y: 50, vx: 0, vy: 0, role: 'Portero (#13)', num: 13 });
      players.push({ id: 13, team: 'propio', x: 25, y: 25, vx: 0, vy: 0, role: 'Central (#3)', num: 3 });
      players.push({ id: 14, team: 'propio', x: 25, y: 75, vx: 0, vy: 0, role: 'Central (#4)', num: 4 });
      players.push({ id: 15, team: 'propio', x: 48, y: 50, vx: 0.5, vy: 0.1, role: 'Mediapunta (#10 - Conducción)', num: 10 });
      players.push({ id: 16, team: 'propio', x: 58, y: 20, vx: 0.7, vy: 0.1, role: 'Extremo Izq (#11 - Ruptura)', num: 11 });
      players.push({ id: 17, team: 'propio', x: 60, y: 50, vx: 0.6, vy: 0.1, role: 'Delantero (#9 - Apoyo)', num: 9 });
      players.push({ id: 18, team: 'propio', x: 56, y: 80, vx: 0.7, vy: -0.1, role: 'Extremo Der (#7 - Desmarque)', num: 7 });
    } else {
      // Soccer 11 vs 11 tactical camera view (High press & fullback space)
      players.push({ id: 1, team: 'rival', x: 88, y: 50, vx: 0, vy: 0, role: 'Portero (#1)', num: 1 });
      players.push({ id: 2, team: 'rival', x: 65, y: 22, vx: 0.4, vy: 0.1, role: 'Lateral Der (#2)', num: 2 });
      players.push({ id: 3, team: 'rival', x: 70, y: 40, vx: 0.05, vy: 0.05, role: 'Central Der (#4)', num: 4 });
      players.push({ id: 4, team: 'rival', x: 70, y: 60, vx: 0.05, vy: -0.05, role: 'Central Izq (#5)', num: 5 });
      players.push({ id: 5, team: 'rival', x: 68, y: 80, vx: -0.1, vy: 0.05, role: 'Lateral Izq (#3)', num: 3 });
      players.push({ id: 6, team: 'rival', x: 55, y: 45, vx: 0.2, vy: 0.1, role: 'Pivote (#6)', num: 6 });
      players.push({ id: 7, team: 'rival', x: 52, y: 62, vx: -0.1, vy: 0.2, role: 'Interior Izq (#8)', num: 8 });
      players.push({ id: 8, team: 'rival', x: 50, y: 30, vx: 0.3, vy: -0.1, role: 'Interior Der (#10)', num: 10 });
      players.push({ id: 9, team: 'rival', x: 38, y: 24, vx: 0.2, vy: 0.1, role: 'Extremo Der (#7)', num: 7 });
      players.push({ id: 10, team: 'rival', x: 34, y: 50, vx: 0.1, vy: 0.2, role: 'Delantero (#9)', num: 9 });
      players.push({ id: 11, team: 'rival', x: 36, y: 76, vx: -0.1, vy: 0.1, role: 'Extremo Izq (#11)', num: 11 });

      // Own Team (Blue / Cyan attacking right to left)
      players.push({ id: 12, team: 'propio', x: 12, y: 50, vx: 0, vy: 0, role: 'Portero (#13)', num: 13 });
      players.push({ id: 13, team: 'propio', x: 30, y: 22, vx: 0.1, vy: 0, role: 'Lateral Izq (#18)', num: 18 });
      players.push({ id: 14, team: 'propio', x: 28, y: 42, vx: 0.05, vy: 0, role: 'Central (#3)', num: 3 });
      players.push({ id: 15, team: 'propio', x: 28, y: 58, vx: 0.05, vy: 0, role: 'Central (#4)', num: 4 });
      players.push({ id: 16, team: 'propio', x: 32, y: 78, vx: 0.1, vy: 0, role: 'Lateral Der (#2)', num: 2 });
      players.push({ id: 17, team: 'propio', x: 42, y: 48, vx: 0.2, vy: 0.1, role: 'Pivote (#5)', num: 5 });
      players.push({ id: 18, team: 'propio', x: 46, y: 35, vx: 0.3, vy: 0.2, role: 'Mediapunta (#10)', num: 10 });
      players.push({ id: 19, team: 'propio', x: 48, y: 65, vx: 0.1, vy: -0.1, role: 'Interior (#8)', num: 8 });
      players.push({ id: 20, team: 'propio', x: 62, y: 16, vx: 0.6, vy: 0.05, role: 'Extremo Izq (#11 - Desmarque)', num: 11 });
      players.push({ id: 21, team: 'propio', x: 66, y: 52, vx: 0.3, vy: 0.1, role: 'Delantero (#9)', num: 9 });
      players.push({ id: 22, team: 'propio', x: 58, y: 82, vx: 0.2, vy: -0.1, role: 'Extremo Der (#7)', num: 7 });
    }

    simStateRef.current.players = players;
  }, [simulationScenario]);

  // Video Canvas Simulation Animation Loop
  useEffect(() => {
    let animId: number;
    let lastTs = performance.now();

    const render = (now: number) => {
      const dt = (now - lastTs) / 1000;
      lastTs = now;

      if (sourceType === 'simulated' && simCanvasRef.current) {
        const canvas = simCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;

          // Update time if playing
          if (isPlaying) {
            simStateRef.current.time += dt * playbackSpeed;
            if (simStateRef.current.time > duration) {
              simStateRef.current.time = 0;
            }
            setCurrentTime(simStateRef.current.time);
          }

          const t = simStateRef.current.time;

          // Render professional soccer pitch
          drawSoccerPitch(ctx, w, h, t);

          // Update and draw players
          drawSimulatedPlayers(ctx, w, h, t, isPlaying);

          // Draw HUD telemetry overlay
          drawTelemetryHUD(ctx, w, h, t, rivalName);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [sourceType, isPlaying, playbackSpeed, rivalName, duration]);

  // Handle Auto-Scan Timer
  useEffect(() => {
    if (!autoScanActive) return;

    const interval = setInterval(() => {
      if (isPlaying && !isAnalyzing) {
        const frame = captureFrameBase64();
        if (frame) {
          onAnalyzeFrame(frame);
        }
      }
    }, 18000); // scans every 18 seconds in continuous mode

    return () => clearInterval(interval);
  }, [autoScanActive, isPlaying, isAnalyzing]);

  // Telestrator Drawing Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeDrawingTool === 'none') return;
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    isDrawingRef.current = true;
    startPointRef.current = { x, y };
    currentPathRef.current = [{ x, y }];
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || activeDrawingTool === 'none') return;
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    currentPathRef.current.push({ x, y });

    // Live redraw preview
    redrawTelestrator(currentPathRef.current);
  };

  const handleMouseUp = () => {
    if (!isDrawingRef.current || activeDrawingTool === 'none') return;
    isDrawingRef.current = false;

    if (currentPathRef.current.length > 0) {
      const newDrawing: TelestratorDrawing = {
        id: `draw-${Date.now()}`,
        type: activeDrawingTool as any,
        color: drawingColor,
        points: [...currentPathRef.current],
      };
      onAddDrawing(newDrawing);
    }

    currentPathRef.current = [];
    startPointRef.current = null;
  };

  // Redraw telestrator canvas whenever telestratorDrawings changes
  const redrawTelestrator = (activePoints?: { x: number; y: number }[]) => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw saved drawings
    telestratorDrawings.forEach((d) => {
      drawSingleTelestratorElement(ctx, d.type, d.color, d.points);
    });

    // Draw active drawing in progress
    if (activePoints && activePoints.length > 1 && startPointRef.current) {
      drawSingleTelestratorElement(ctx, activeDrawingTool as any, drawingColor, activePoints);
    }
  };

  useEffect(() => {
    redrawTelestrator();
  }, [telestratorDrawings]);

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedVideoUrl(url);
      setSourceType('file');
      setIsPlaying(true);
    }
  };

  // Webcam stream start
  const handleStartCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setSourceType('camera');
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Camera access denied:', err);
    }
  };

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Top Source Switcher & Match HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-400">Origen de Señal:</span>
          <div className="inline-flex rounded-lg p-0.5 bg-slate-900 border border-slate-800">
            <button
              onClick={() => setSourceType('simulated')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                sourceType === 'simulated' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Simulador Táctico Pro
            </button>
            <label
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                sourceType === 'file' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
              Subir Video MP4
            </label>
            <button
              onClick={handleStartCamera}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                sourceType === 'camera' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cámara en Vivo
            </button>
          </div>
        </div>

        {sourceType === 'simulated' && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Patrón Táctico Simulado:</span>
            <select
              value={simulationScenario}
              onChange={(e) => setSimulationScenario(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="futbol_high_press">Fútbol: Presión Alta y Espalda Lateral Desprotegida</option>
              <option value="futbol_counter">Fútbol: Transición Ofensiva y Ruptura Central</option>
            </select>
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Continuous Auto-scan switch */}
          <button
            onClick={onToggleAutoScan}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              autoScanActive
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400 animate-pulse'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Analiza automáticamente cada 18 segundos durante el partido"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{autoScanActive ? 'Auto-Escaneo Activo' : 'Activar Auto-Escaneo'}</span>
          </button>
        </div>
      </div>

      {/* Main Video Viewport with Telestrator Overlays */}
      <div ref={containerRef} className="relative aspect-video bg-black overflow-hidden select-none group">
        {/* Layer 1: Render Video or Tactical Simulation */}
        {sourceType === 'simulated' ? (
          <canvas
            ref={simCanvasRef}
            width={1280}
            height={720}
            className="w-full h-full object-contain block bg-slate-950"
          />
        ) : (
          <video
            ref={videoRef}
            src={uploadedVideoUrl || undefined}
            className="w-full h-full object-contain"
            playsInline
            muted
            loop
            onTimeUpdate={() => {
              if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
                setDuration(videoRef.current.duration || 90);
              }
            }}
          />
        )}

        {/* Layer 2: Real-time AI Tactical Zones Overlay */}
        {showAiZones && detectedZones.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {detectedZones.map((zone, idx) => (
              <div
                key={idx}
                style={{
                  left: `${zone.x}%`,
                  top: `${zone.y}%`,
                  width: `${zone.width}%`,
                  height: `${zone.height}%`,
                }}
                className={`absolute rounded-lg border-2 border-dashed transition-all flex flex-col justify-start p-1.5 ${
                  zone.type === 'vulnerable'
                    ? 'border-red-500 bg-red-500/20 animate-pulse'
                    : zone.type === 'espacio_libre'
                    ? 'border-emerald-400 bg-emerald-500/15'
                    : zone.type === 'sobrecarga'
                    ? 'border-amber-400 bg-amber-500/15'
                    : 'border-cyan-400 bg-cyan-500/15'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider drop-shadow-md">
                    {zone.name}
                  </span>
                </div>
                <span className="text-[9px] text-slate-200 mt-0.5 line-clamp-2 drop-shadow">
                  {zone.note}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Layer 3: Interactive Telestrator Drawing Canvas */}
        <canvas
          ref={drawingCanvasRef}
          width={1280}
          height={720}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className={`absolute inset-0 w-full h-full ${
            activeDrawingTool !== 'none' ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'
          }`}
        />

        {/* Live Tag Watermark */}
        <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 bg-slate-950/80 backdrop-blur border border-slate-700 rounded-md text-[11px] font-semibold text-white pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          <span>ANÁLISIS EN VIVO</span>
          <span className="text-slate-400">|</span>
          <span className="text-emerald-400">{rivalName}</span>
        </div>

        {/* In-Video Tactical Trigger Overlay Button */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            onClick={() => {
              const frame = captureFrameBase64();
              if (frame) onAnalyzeFrame(frame);
            }}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-lg shadow-emerald-950/50 transition-all border border-emerald-400/40 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analizando con IA...</span>
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                <span>Capturar y Analizar Rival</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Playback Controls & Timeline Scrubber */}
      <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex flex-col gap-2">
        {/* Scrubber Bar */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 w-12">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={currentTime}
            onChange={(e) => {
              const t = parseFloat(e.target.value);
              setCurrentTime(t);
              simStateRef.current.time = t;
              if (sourceType === 'file' && videoRef.current) {
                videoRef.current.currentTime = t;
              }
            }}
            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <span className="text-xs font-mono text-slate-500 w-12 text-right">
            {formatTime(duration)}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (sourceType === 'file' && videoRef.current) {
                  if (isPlaying) videoRef.current.pause();
                  else videoRef.current.play();
                }
                setIsPlaying(!isPlaying);
              }}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              title={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                const newT = Math.max(0, currentTime - 5);
                setCurrentTime(newT);
                simStateRef.current.time = newT;
                if (sourceType === 'file' && videoRef.current) {
                  videoRef.current.currentTime = newT;
                }
              }}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              title="Retroceder 5s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const newT = Math.min(duration, currentTime + 5);
                setCurrentTime(newT);
                simStateRef.current.time = newT;
                if (sourceType === 'file' && videoRef.current) {
                  videoRef.current.currentTime = newT;
                }
              }}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              title="Avanzar 5s"
            >
              <FastForward className="w-4 h-4" />
            </button>

            {/* Playback speed selector */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 ml-2">
              {[0.5, 1, 1.5, 2].map((spd) => (
                <button
                  key={spd}
                  onClick={() => {
                    setPlaybackSpeed(spd);
                    if (videoRef.current) videoRef.current.playbackRate = spd;
                  }}
                  className={`px-2 py-0.5 text-[11px] font-medium rounded ${
                    playbackSpeed === spd
                      ? 'bg-slate-700 text-emerald-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Presiona espacio o captura para enviar frame al modelo Gemini 3.8</span>
          </div>
        </div>
      </div>
    </div>
  );
});

// Helper: Format seconds to MM:SS
function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Drawing helper functions for simulation
function drawSoccerPitch(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  // Rich emerald grass with cut stripes
  ctx.fillStyle = '#143823';
  ctx.fillRect(0, 0, w, h);

  // Pitch stripes
  const stripes = 12;
  const stripeWidth = w / stripes;
  for (let i = 0; i < stripes; i++) {
    if (i % 2 === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.fillRect(i * stripeWidth, 0, stripeWidth, h);
    }
  }

  // Pitch white line markings
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 2;

  const marginX = w * 0.05;
  const marginY = h * 0.08;
  const pw = w - marginX * 2;
  const ph = h - marginY * 2;

  // Touchlines
  ctx.strokeRect(marginX, marginY, pw, ph);

  // Halfway line
  ctx.beginPath();
  ctx.moveTo(w / 2, marginY);
  ctx.lineTo(w / 2, h - marginY);
  ctx.stroke();

  // Center circle
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, h * 0.16, 0, Math.PI * 2);
  ctx.stroke();

  // Center dot
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, 4, 0, Math.PI * 2);
  ctx.fill();

  // Penalty box left
  const boxW = pw * 0.16;
  const boxH = ph * 0.55;
  ctx.strokeRect(marginX, (h - boxH) / 2, boxW, boxH);

  // Penalty box right
  ctx.strokeRect(w - marginX - boxW, (h - boxH) / 2, boxW, boxH);

  // Goal area small boxes
  const smallW = pw * 0.06;
  const smallH = ph * 0.28;
  ctx.strokeRect(marginX, (h - smallH) / 2, smallW, smallH);
  ctx.strokeRect(w - marginX - smallW, (h - smallH) / 2, smallW, smallH);

  // Corner arcs
  const arcR = 12;
  ctx.beginPath();
  ctx.arc(marginX, marginY, arcR, 0, Math.PI / 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(w - marginX, marginY, arcR, Math.PI / 2, Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(marginX, h - marginY, arcR, Math.PI * 1.5, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(w - marginX, h - marginY, arcR, Math.PI, Math.PI * 1.5);
  ctx.stroke();
}

function drawSimulatedPlayers(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  isPlaying: boolean
) {
  // Animate dynamic movement patterns
  // High defensive line for rival: they oscillate according to match wave
  const wave = Math.sin(time * 0.8) * 4;
  const lateralRun = Math.sin(time * 1.2) * 8;

  // Draw offside / defensive line marker for rival
  const rivalDefensiveX = (w * 0.67) + (wave * 3);
  ctx.save();
  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(rivalDefensiveX, h * 0.15);
  ctx.lineTo(rivalDefensiveX, h * 0.85);
  ctx.stroke();
  ctx.restore();

  // Draw text label on defensive line
  ctx.fillStyle = '#ef4444';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillText('LÍNEA DEFENSIVA RIVAL (38m)', rivalDefensiveX - 80, h * 0.14);

  // Highlight vulnerable space behind rival right fullback
  const spaceX = w * 0.52;
  const spaceY = h * 0.16;
  const spaceW = w * 0.18;
  const spaceH = h * 0.24;

  ctx.save();
  ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.fillRect(spaceX, spaceY, spaceW, spaceH);
  ctx.strokeRect(spaceX, spaceY, spaceW, spaceH);

  ctx.fillStyle = '#fca5a5';
  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.fillText('ESPALDA DESPROTEGIDA', spaceX + 10, spaceY + 20);
  ctx.fillText('Hueco de 28m detectado', spaceX + 10, spaceY + 34);
  ctx.restore();

  // Attack penetration trajectory arrow (our winger running into the space)
  ctx.save();
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w * 0.45, h * 0.28);
  ctx.quadraticCurveTo(w * 0.52, h * 0.22, w * 0.60 + lateralRun, h * 0.24);
  ctx.stroke();

  // Arrowhead
  const tipX = w * 0.60 + lateralRun;
  const tipY = h * 0.24;
  ctx.fillStyle = '#06b6d4';
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(tipX - 10, tipY - 5);
  ctx.lineTo(tipX - 10, tipY + 5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Render Rival Players (Red / White dots)
  const rivalPlayers = [
    { x: 0.90, y: 0.50, num: 1, role: 'POR' },
    { x: 0.65, y: 0.18, num: 2, role: 'LD' }, // Fullback too high!
    { x: 0.69, y: 0.38, num: 4, role: 'DFC' },
    { x: 0.69, y: 0.62, num: 5, role: 'DFC' },
    { x: 0.67, y: 0.82, num: 3, role: 'LI' },
    { x: 0.55, y: 0.44, num: 6, role: 'PIV' },
    { x: 0.53, y: 0.64, num: 8, role: 'MC' },
    { x: 0.52, y: 0.32, num: 10, role: 'MC' },
    { x: 0.40, y: 0.22, num: 7, role: 'ED' },
    { x: 0.36, y: 0.50, num: 9, role: 'DC' },
    { x: 0.38, y: 0.78, num: 11, role: 'EI' },
  ];

  rivalPlayers.forEach((p) => {
    const px = p.x * w + (wave * 0.5);
    const py = p.y * h + (p.num === 2 ? lateralRun * 0.3 : 0);

    // Player shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(px, py + 12, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Player body
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(px, py, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Number
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${p.num}`, px, py);

    // Role label
    ctx.fillStyle = '#fca5a5';
    ctx.font = '8px system-ui, sans-serif';
    ctx.fillText(p.role, px, py - 16);
  });

  // Render Own Team Players (Cyan / Blue)
  const ownPlayers = [
    { x: 0.10, y: 0.50, num: 1, role: 'POR' },
    { x: 0.32, y: 0.20, num: 3, role: 'LI' },
    { x: 0.28, y: 0.40, num: 4, role: 'DFC' },
    { x: 0.28, y: 0.60, num: 5, role: 'DFC' },
    { x: 0.34, y: 0.80, num: 2, role: 'LD' },
    { x: 0.44, y: 0.50, num: 6, role: 'MCD' },
    { x: 0.48, y: 0.36, num: 8, role: 'INT' },
    { x: 0.49, y: 0.64, num: 10, role: 'MCO' },
    { x: 0.60 + (lateralRun * 0.005), y: 0.24, num: 11, role: 'EXT' }, // Attacking space
    { x: 0.64, y: 0.52, num: 9, role: 'DC' },
    { x: 0.58, y: 0.78, num: 7, role: 'EXT' },
  ];

  ownPlayers.forEach((p) => {
    const px = p.x * w;
    const py = p.y * h;

    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(px, py + 12, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(px, py, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${p.num}`, px, py);

    ctx.fillStyle = '#7dd3fc';
    ctx.font = '8px system-ui, sans-serif';
    ctx.fillText(p.role, px, py - 16);
  });

  // Ball
  const ballX = w * 0.48 + wave * 2;
  const ballY = h * 0.36;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(ballX, ballY, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawTelemetryHUD(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  rivalName: string
) {
  // Bottom telemetry bar
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(w * 0.05, h - 48, w * 0.9, 36);

  ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
  ctx.lineWidth = 1;
  ctx.strokeRect(w * 0.05, h - 48, w * 0.9, 36);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  // Item 1: Formation detected
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px system-ui, sans-serif';
  ctx.fillText('SISTEMA RIVAL:', w * 0.07, h - 30);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillText('4-4-2 BLOQUE ALTO (38m)', w * 0.16, h - 30);

  // Item 2: Pressing intensity
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px system-ui, sans-serif';
  ctx.fillText('ÍNDICE PPDA (PRESIÓN):', w * 0.38, h - 30);

  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillText('8.2 (ALTA INTENSIDAD)', w * 0.50, h - 30);

  // Item 3: Alert
  ctx.fillStyle = '#ef4444';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillText('⚠️ DESAJUSTE DETECTADO: BANDA DERECHA', w * 0.68, h - 30);
}

function drawSingleTelestratorElement(
  ctx: CanvasRenderingContext2D,
  type: string,
  color: string,
  points: { x: number; y: number }[]
) {
  if (points.length === 0) return;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (type === 'arrow' && points.length >= 2) {
    const start = points[0];
    const end = points[points.length - 1];

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    // Arrowhead
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const arrowLen = 14;
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - arrowLen * Math.cos(angle - Math.PI / 6),
      end.y - arrowLen * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      end.x - arrowLen * Math.cos(angle + Math.PI / 6),
      end.y - arrowLen * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  } else if (type === 'circle' && points.length >= 2) {
    const start = points[0];
    const end = points[points.length - 1];
    const radius = Math.hypot(end.x - start.x, end.y - start.y);

    ctx.beginPath();
    ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = `${color}33`; // Transparent fill
    ctx.fill();
  } else if (type === 'line' && points.length >= 2) {
    const start = points[0];
    const end = points[points.length - 1];
    ctx.beginPath();
    ctx.setLineDash([8, 8]);
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  } else {
    // Freehand
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  }

  ctx.restore();
}
