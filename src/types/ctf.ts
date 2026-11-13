export type LevelId = 'level-0' | 'level-1' | 'level-2' | 'level-3' | 'level-4' | 'level-5' | 'level-6' | 'level-7' | 'level-8';

export type ChallengeDifficulty = 'Tutorial' | 'Novice' | 'Advanced' | 'Expert';

export interface SatelliteMetadata {
  mission: string;             // e.g. "NISAR (NASA-ISRO SAR)" or "Sentinel-1A"
  sensor: string;              // e.g. "L-band SweepSAR (1.25 GHz)"
  frequencyGhz: number;        // e.g. 1.25
  wavelengthCm: number;        // e.g. 24.0 (L-band) or 5.6 (C-band)
  polarization: string;        // e.g. "Dual-Pol (HH + HV)" or "Quad-Pol"
  passDirection: 'Ascending' | 'Descending';
  lookAngleDeg: number;        // e.g. 37.5
  acquisitionDate: string;     // e.g. "2024-10-30T18:42:10Z"
  repeatPassDays: number;      // e.g. 12
  groundResolutionM: number;   // e.g. 6.0
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface ForensicPointTarget {
  lat: number;
  lng: number;
  name: string;
  expectedSigma0Db?: number;   // Radar backscatter in decibels
  expectedCoherence?: number;  // 0.0 to 1.0
  expectedPhaseDisplacementCm?: number; // Ground displacement in cm
  samplingClue: string;
}

export interface Hint {
  id: number;
  title: string;
  text?: string;               // Stripped on server unless revealed
  penaltyPercent: number;      // e.g. 25
  revealed: boolean;
}

export interface Challenge {
  id: LevelId;
  levelNumber: number;
  title: string;
  codename: string;
  category: string;
  difficulty: ChallengeDifficulty;
  basePoints: number;
  currentPoints: number;       // Adjusted for hints revealed
  unlocked: boolean;
  solved: boolean;
  solvedAt?: string;
  targetLocation: string;
  centerCoordinates: [number, number]; // [lat, lng]
  defaultZoom: number;
  boundingBox: BoundingBox;
  satellite: SatelliteMetadata;
  scenarioBriefing: string;
  forensicMission: string;
  targetAnomaly: ForensicPointTarget;
  hints: Hint[];
}

export interface PlayerSession {
  alias: string;
  token: string;
  totalScore: number;
  solvedLevels: LevelId[];
  unlockedHints: Record<LevelId, number[]>; // levelId -> array of revealed hint indices
  levelPointsAwarded: Record<LevelId, number>;
  startedAt: string;
  lastSolveAt?: string;
}

export interface FlagSubmissionPayload {
  challengeId: LevelId;
  flag: string;
}

export interface FlagSubmissionResult {
  success: boolean;
  message: string;
  levelId?: LevelId;
  pointsAwarded?: number;
  totalScore?: number;
  nextLevelUnlocked?: LevelId | null;
  timestamp?: string;
}

export interface HintRevealPayload {
  challengeId: LevelId;
  hintIndex: number;
}

export interface HintRevealResult {
  success: boolean;
  message: string;
  hintIndex?: number;
  hintText?: string;
  penaltyApplied?: number;
  currentChallengePoints?: number;
  totalScore?: number;
}

export interface LeaderboardEntry {
  rank: number;
  alias: string;
  isCurrentPlayer?: boolean;
  totalScore: number;
  solvedLevels: LevelId[];
  solvedCount: number;
  lastSolveTime: string;
  timeElapsedMinutes: number;
  affiliation: string;
}

export interface ForensicSample {
  lat: number;
  lng: number;
  sigma0Db: number;            // Radar backscatter dB
  coherence: number;           // InSAR temporal coherence (0 - 1)
  displacementCm: number;      // Line-of-sight ground displacement
  fringeCount: number;         // Phase cycle count
  surfaceClass: string;        // Inundated Water, Corner Reflector, Burn Scar, Tectonic Fault, etc.
  confidence: number;          // Measurement confidence %
}
