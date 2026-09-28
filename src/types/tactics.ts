export type SportType = 'fútbol';

export interface MatchInfo {
  rivalName: string;
  score: string;
  minute: string;
  period: string;
  homeTeam: string;
  notes: string;
}

export interface MovementPattern {
  id: string;
  patternName: string;
  zone: string;
  trigger: string;
  description: string;
  predictability: string; // 'Alta' | 'Media' | 'Baja'
  counterMeasure: string;
  timestamp?: string;
}

export interface TacticalWeakness {
  id: string;
  title: string;
  zone: string;
  severity: 'CRÍTICA' | 'ALTA' | 'MEDIA';
  flawDetail: string;
  howToExploit: string;
  targetPlayerOrSector?: string;
  timestamp?: string;
}

export interface ImmediateAdjustment {
  id: string;
  title: string;
  type: string; // 'Ofensivo' | 'Defensivo' | 'Transición' | 'Balón Parado'
  instruction: string;
  priority: string; // 'Inmediata (En vivo)' | 'Entretiempo' | 'Segundo Tiempo'
  applied?: boolean;
}

export interface TacticalZone {
  name: string;
  x: number; // 0 - 100%
  y: number; // 0 - 100%
  width: number;
  height: number;
  type: 'vulnerable' | 'sobrecarga' | 'espacio_libre' | 'presion';
  note: string;
}

export interface TacticalAnalysisResult {
  tacticalSummary: string;
  formationDetected: string;
  defensiveBlockHeight: string;
  movementPatterns: MovementPattern[];
  tacticalWeaknesses: TacticalWeakness[];
  immediateAdjustments: ImmediateAdjustment[];
  detectedTacticalZones: TacticalZone[];
  audioBriefText: string;
  statisticsConfidence: number;
  timestamp?: string;
  frameSnapshot?: string;
  isSimulated?: boolean;
  notice?: string;
}

export interface TacticalBookmarkEvent {
  id: string;
  timestampSeconds: number;
  minuteFormatted: string;
  title: string;
  type: 'weakness' | 'pattern' | 'adjustment' | 'scan';
  severity?: 'CRÍTICA' | 'ALTA' | 'MEDIA';
  detail: string;
  zone?: string;
  snapshot?: string;
}

export interface FullMatchReport {
  title: string;
  subtitle: string;
  executiveVerdict: string;
  rivalTacticalDNA: {
    system: string;
    strengths: string[];
    fatalVulnerabilities: string[];
    physicalConditionDecline?: string;
  };
  gamePlanAdjustments: {
    phase: string;
    currentProblem: string;
    exactModification: string;
    tacticalOrder: string;
  }[];
  individualTargeting: {
    targetOpponent: string;
    flaw: string;
    actionToExecute: string;
  }[];
  setPieceStrategy: string;
  closingPlanMinutes: string;
  generatedAt: string;
  isSimulated?: boolean;
}

export interface TelestratorDrawing {
  id: string;
  type: 'arrow' | 'circle' | 'line' | 'freehand' | 'spotlight';
  color: string;
  points: { x: number; y: number }[];
  textLabel?: string;
}
