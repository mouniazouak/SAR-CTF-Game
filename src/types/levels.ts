import type { BoundingBox, SatelliteMetadata } from './ctf';

export type IncidentLevelId =
  | 'level-1'
  | 'level-2'
  | 'level-3'
  | 'level-4'
  | 'level-5'
  | 'level-6'
  | 'level-7';

export type IncidentDifficulty = 'Novice' | 'Intermediate' | 'Advanced' | 'Expert';

export interface SecurityWrapper {
  type:
    | 'Phishing'
    | 'Compromised Account'
    | 'Unpatched Server'
    | 'Supply Chain'
    | 'Ransomware'
    | 'Server Compromise'
    | 'Capstone';
  briefing: string;
}

export interface LevelOption {
  id: string;
  label: string;
  description: string;
}

export interface LevelHint {
  id: number;
  title: string;
  text: string;
  penaltyPercent: number;
}

export interface LevelDefinition {
  id: IncidentLevelId;
  levelNumber: number;
  title: string;
  unlockRequires: IncidentLevelId | null;
  category: string;
  difficulty: IncidentDifficulty;
  basePoints: number;
  securityWrapper: SecurityWrapper;
  targetLocation: string;
  regionCenter: [number, number];
  defaultZoom: number;
  boundingBox: BoundingBox;
  satellite: SatelliteMetadata;
  incidentBriefing: string;
  forensicMission: string;
  sarPrimer: string;
  dataProducts: string[];
  drivers: LevelOption[];
  recoveryActions: LevelOption[];
  hints: LevelHint[];
  learningObjectives: string[];
}

export interface LevelsDataset {
  meta: {
    campaign: string;
    subtitle: string;
    version: string;
    totalLevels: number;
    scenarioMode: string;
    arsetReference: string;
    scoring: {
      hintPenaltyPercent: number;
      minimumScoreMultiplier: number;
      outerRadiusMultiplier: number;
      description: string;
    };
  };
  levels: LevelDefinition[];
}

export interface VerifyLevelPayload {
  levelId: IncidentLevelId;
  clickedLat: number;
  clickedLng: number;
  selectedDriverId: string;
  selectedRecoveryId: string;
  hintsUsed: number;
}

export interface ScoreBreakdown {
  basePoints: number;
  hintsUsed: number;
  hintPenaltyPercent: number;
  hintMultiplier: number;
  accuracyMultiplier: number;
  distanceMeters: number;
  precisionRadiusMeters: number;
  toleranceMeters: number;
}

export interface VerifyLevelSuccess {
  success: true;
  levelId: IncidentLevelId;
  flag: string;
  pointsEarned: number;
  earthScienceLearning: string;
  scoreBreakdown: ScoreBreakdown;
  message: string;
}

export interface VerifyLevelFailure {
  success: false;
  levelId: IncidentLevelId;
  failedCheck: 'location' | 'driver' | 'recovery';
  hint: string;
  message: string;
}
