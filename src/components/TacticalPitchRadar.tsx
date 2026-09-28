import React from 'react';
import { SportType, TacticalZone } from '../types/tactics';
import { ShieldAlert, Crosshair, Users, MapPin } from 'lucide-react';

interface TacticalPitchRadarProps {
  rivalName: string;
  formation: string;
  defensiveBlockHeight: string;
  tacticalZones: TacticalZone[];
  onSelectZone?: (zone: TacticalZone) => void;
  selectedZoneName?: string | null;
}

export const TacticalPitchRadar: React.FC<TacticalPitchRadarProps> = ({
  rivalName,
  formation,
  defensiveBlockHeight,
  tacticalZones,
  onSelectZone,
  selectedZoneName,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Radar Táctico Espacial (Vista Cenital)
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span>{formation}</span>
          <span>·</span>
          <span className="text-emerald-400 font-semibold">{defensiveBlockHeight}</span>
        </div>
      </div>

      {/* 2D Pitch Radar Canvas */}
      <div className="relative aspect-[16/10] w-full rounded-lg bg-emerald-950/60 border border-emerald-800/40 overflow-hidden shadow-inner">
        {/* Pitch Lines */}
        <div className="absolute inset-0 p-3 pointer-events-none">
          <div className="w-full h-full border border-emerald-500/30 rounded relative flex items-center justify-center">
            {/* Midfield line */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-emerald-500/30"></div>
            {/* Center circle */}
            <div className="w-20 h-20 rounded-full border border-emerald-500/30 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div>
            </div>
            {/* Left penalty box */}
            <div className="absolute left-0 top-1/4 bottom-1/4 w-12 border-r border-y border-emerald-500/30"></div>
            {/* Right penalty box */}
            <div className="absolute right-0 top-1/4 bottom-1/4 w-12 border-l border-y border-emerald-500/30"></div>
          </div>
        </div>

        {/* Rival Defensive Line Guide */}
        <div
          className="absolute top-3 bottom-3 border-l-2 border-dashed border-red-500/70 pointer-events-none"
          style={{ left: '68%' }}
        >
          <span className="absolute -top-1 left-1.5 text-[9px] font-mono font-bold text-red-400 whitespace-nowrap bg-slate-950/80 px-1 rounded">
            Línea Rival 38m
          </span>
        </div>

        {/* Tactical Zones Rendered on Radar */}
        {tacticalZones.map((zone, idx) => {
          const isSelected = selectedZoneName === zone.name;
          return (
            <div
              key={idx}
              onClick={() => onSelectZone && onSelectZone(zone)}
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.width}%`,
                height: `${zone.height}%`,
              }}
              className={`absolute rounded cursor-pointer transition-all duration-300 border p-1 flex flex-col justify-between ${
                zone.type === 'vulnerable'
                  ? 'border-red-500 bg-red-500/25 hover:bg-red-500/40 text-red-200'
                  : zone.type === 'espacio_libre'
                  ? 'border-emerald-400 bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-200'
                  : 'border-amber-400 bg-amber-500/25 hover:bg-amber-500/40 text-amber-200'
              } ${isSelected ? 'ring-2 ring-white scale-105 z-10 shadow-lg' : 'opacity-85'}`}
            >
              <div className="flex items-center gap-1">
                <ShieldAlert className="w-2.5 h-2.5 flex-shrink-0" />
                <span className="text-[9px] font-bold truncate leading-tight">
                  {zone.name}
                </span>
              </div>
              <span className="text-[8px] font-mono uppercase opacity-90">
                {zone.type}
              </span>
            </div>
          );
        })}

        {/* Player Dots for visual context */}
        {/* Rival Block */}
        {[
          { x: 88, y: 50, label: '1' },
          { x: 67, y: 22, label: '2' },
          { x: 70, y: 38, label: '4' },
          { x: 70, y: 62, label: '5' },
          { x: 68, y: 80, label: '3' },
          { x: 55, y: 45, label: '6' },
          { x: 54, y: 65, label: '8' },
          { x: 52, y: 32, label: '10' },
          { x: 42, y: 24, label: '7' },
          { x: 38, y: 50, label: '9' },
          { x: 40, y: 76, label: '11' },
        ].map((p, i) => (
          <div
            key={`rival-dot-${i}`}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-red-600 border border-white flex items-center justify-center text-[7px] font-bold text-white shadow-sm pointer-events-none"
            title={`Rival #${p.label}`}
          >
            {p.label}
          </div>
        ))}

        {/* Own Team Dots */}
        {[
          { x: 12, y: 50, label: '1' },
          { x: 30, y: 22, label: '3' },
          { x: 28, y: 40, label: '4' },
          { x: 28, y: 60, label: '5' },
          { x: 32, y: 78, label: '2' },
          { x: 44, y: 48, label: '6' },
          { x: 48, y: 34, label: '8' },
          { x: 50, y: 65, label: '10' },
          { x: 60, y: 20, label: '11' }, // attacking wing
          { x: 64, y: 52, label: '9' },
          { x: 58, y: 78, label: '7' },
        ].map((p, i) => (
          <div
            key={`own-dot-${i}`}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-sky-500 border border-sky-200 flex items-center justify-center text-[7px] font-bold text-white shadow-sm pointer-events-none"
            title={`Propio #${p.label}`}
          >
            {p.label}
          </div>
        ))}
      </div>

      {/* Legend & quick indicators */}
      <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>Rival ({rivalName})</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            <span>Nuestro Equipo</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-red-500/40 border border-red-500"></span>
            <span>Zona Crítica</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-emerald-500/40 border border-emerald-400"></span>
            <span>Espacio de Penetración</span>
          </div>
        </div>
      </div>
    </div>
  );
};
