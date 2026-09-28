import React from 'react';
import { MousePointer, ArrowRight, Circle, Minus, Edit3, Trash2, Undo, Eye, EyeOff } from 'lucide-react';

interface TelestratorToolbarProps {
  activeTool: 'arrow' | 'circle' | 'line' | 'freehand' | 'none';
  onSelectTool: (tool: 'arrow' | 'circle' | 'line' | 'freehand' | 'none') => void;
  selectedColor: string;
  onSelectColor: (color: string) => void;
  onUndo: () => void;
  onClear: () => void;
  showAiZones: boolean;
  onToggleAiZones: () => void;
  drawingsCount: number;
}

export const TelestratorToolbar: React.FC<TelestratorToolbarProps> = ({
  activeTool,
  onSelectTool,
  selectedColor,
  onSelectColor,
  onUndo,
  onClear,
  showAiZones,
  onToggleAiZones,
  drawingsCount,
}) => {
  const colors = [
    { value: '#ef4444', label: 'Rival (Rojo)' },
    { value: '#38bdf8', label: 'Propio (Azul)' },
    { value: '#f59e0b', label: 'Vulnerabilidad (Ámbar)' },
    { value: '#10b981', label: 'Espacio Libre (Verde)' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs">
      {/* Drawing tools */}
      <div className="flex items-center gap-1.5">
        <span className="font-semibold text-slate-400 mr-1">Pizarra Táctica:</span>

        <button
          onClick={() => onSelectTool('none')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium transition-colors ${
            activeTool === 'none'
              ? 'bg-slate-700 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Modo Puntero (Sin dibujar)"
        >
          <MousePointer className="w-3.5 h-3.5" />
          <span>Puntero</span>
        </button>

        <button
          onClick={() => onSelectTool('arrow')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium transition-colors ${
            activeTool === 'arrow'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Flecha de Desmarque o Presión"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>Flecha</span>
        </button>

        <button
          onClick={() => onSelectTool('circle')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium transition-colors ${
            activeTool === 'circle'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Círculo de Zona o Jugador"
        >
          <Circle className="w-3.5 h-3.5" />
          <span>Zona</span>
        </button>

        <button
          onClick={() => onSelectTool('line')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium transition-colors ${
            activeTool === 'line'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Línea de Fuera de Juego / Basculación"
        >
          <Minus className="w-3.5 h-3.5" />
          <span>Línea</span>
        </button>

        <button
          onClick={() => onSelectTool('freehand')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium transition-colors ${
            activeTool === 'freehand'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Trazado Libre"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Libre</span>
        </button>
      </div>

      {/* Color picker & utilities */}
      <div className="flex items-center gap-3">
        {/* Colors */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
          {colors.map((c) => (
            <button
              key={c.value}
              onClick={() => onSelectColor(c.value)}
              className={`w-4 h-4 rounded-full transition-transform ${
                selectedColor === c.value ? 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-slate-950' : 'hover:scale-110 opacity-70 hover:opacity-100'
              }`}
              style={{ backgroundColor: c.value }}
              title={c.label}
            />
          ))}
        </div>

        {/* Undo & Clear */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={drawingsCount === 0}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded disabled:opacity-30 disabled:pointer-events-none"
            title="Deshacer último trazo"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClear}
            disabled={drawingsCount === 0}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded disabled:opacity-30 disabled:pointer-events-none"
            title="Borrar todos los trazos"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Toggle AI zones overlay */}
        <button
          onClick={onToggleAiZones}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            showAiZones
              ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Mostrar/Ocultar zonas calculadas por IA"
        >
          {showAiZones ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>Zonas IA</span>
        </button>
      </div>
    </div>
  );
};
