import { LevelId, Challenge, Hint } from '@/types/ctf';

export interface GroundTruthChallenge {
  id: LevelId;
  levelNumber: number;
  title: string;
  codename: string;
  category: string;
  difficulty: 'Tutorial' | 'Novice' | 'Advanced' | 'Expert';
  basePoints: number;
  flag: string; // NEVER sent to frontend!
  targetLocation: string;
  centerCoordinates: [number, number];
  defaultZoom: number;
  boundingBox: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  satellite: {
    mission: string;
    sensor: string;
    frequencyGhz: number;
    wavelengthCm: number;
    polarization: string;
    passDirection: 'Ascending' | 'Descending';
    lookAngleDeg: number;
    acquisitionDate: string;
    repeatPassDays: number;
    groundResolutionM: number;
  };
  scenarioBriefing: string;
  forensicMission: string;
  targetAnomaly: {
    lat: number;
    lng: number;
    name: string;
    expectedSigma0Db: number;
    expectedCoherence: number;
    expectedPhaseDisplacementCm: number;
    samplingClue: string;
  };
  hints: {
    id: number;
    title: string;
    text: string;
    penaltyPercent: number;
  }[];
}

export const GROUND_TRUTH_CHALLENGES: Record<LevelId, GroundTruthChallenge> = {
  'level-0': {
    id: 'level-0',
    levelNumber: 0,
    title: 'Level 0: SAR Calibration Beacon',
    codename: 'PROJECT ROSAMOND',
    category: 'Radiometric Calibration',
    difficulty: 'Tutorial',
    basePoints: 50,
    flag: 'flag{nisar_cal_point_target_3487}',
    targetLocation: 'Rosamond Dry Lake, Mojave Desert, CA',
    centerCoordinates: [34.8722, -118.1564],
    defaultZoom: 14,
    boundingBox: {
      north: 34.9100,
      south: 34.8300,
      east: -118.1000,
      west: -118.2100,
    },
    satellite: {
      mission: 'NISAR Pre-Flight Calibration Suite',
      sensor: 'L-SAR SweepSAR (1.25 GHz)',
      frequencyGhz: 1.25,
      wavelengthCm: 24.0,
      polarization: 'Quad-Pol (HH + HV + VV + VH)',
      passDirection: 'Descending',
      lookAngleDeg: 36.8,
      acquisitionDate: '2024-09-12T14:22:05Z',
      repeatPassDays: 12,
      groundResolutionM: 3.5,
    },
    scenarioBriefing:
      'Welcome to the NASA Space Apps SAR Forensic Workbench. Prior to orbital deployment, NISAR ground crews calibrate backscatter intensity against precision-engineered trihedral corner reflectors installed on the dry lake bed.',
    forensicMission:
      'Locate the high-radiometric calibration point target. Standard flat dry mud reflects radar pulses away (dark, ~ -20 dB), whereas trihedral corner reflectors create intense triple-bounce retroreflection (> +22 dB). Sample the point target coordinates and reconstruct the verification flag.',
    targetAnomaly: {
      lat: 34.8722,
      lng: -118.1564,
      name: 'Trihedral Cal-Reflector TR-04',
      expectedSigma0Db: 24.8,
      expectedCoherence: 0.98,
      expectedPhaseDisplacementCm: 0.0,
      samplingClue: 'Look for the blazing high-intensity point spike (+24.8 dB) near 34.8722°N, -118.1564°W.',
    },
    hints: [
      {
        id: 0,
        title: 'Point Target Signature',
        text: 'Radar corner reflectors act as artificial point targets. While the surrounding lake bed has low backscatter (-18 to -22 dB), the trihedral metal reflector yields an extreme localized spike exceeding +20 dB.',
        penaltyPercent: 25,
      },
      {
        id: 1,
        title: 'Flag Reconstruction Syntax',
        text: 'The flag follows the standard pattern flag{nisar_cal_point_target_XXXX} where XXXX is the first four digits of the calibration point latitude (34.87 -> 3487).',
        penaltyPercent: 25,
      },
    ],
  },
  'level-1': {
    id: 'level-1',
    levelNumber: 1,
    title: 'Level 1: Submerged Anomaly',
    codename: 'OPERATION TURIA SURGE',
    category: 'Disaster Rapid Response',
    difficulty: 'Novice',
    basePoints: 100,
    flag: 'flag{nisar_flood_specular_turia}',
    targetLocation: 'Turia Basin Logistics Corridor, Valencia, Spain',
    centerCoordinates: [39.4628, -0.4285],
    defaultZoom: 13,
    boundingBox: {
      north: 39.5100,
      south: 39.4100,
      east: -0.3700,
      west: -0.4900,
    },
    satellite: {
      mission: 'NISAR Disaster Rapid Response',
      sensor: 'L-SAR High-Res Flood Mode',
      frequencyGhz: 1.25,
      wavelengthCm: 24.0,
      polarization: 'Dual-Pol (VV + VH)',
      passDirection: 'Ascending',
      lookAngleDeg: 41.2,
      acquisitionDate: '2024-10-30T05:18:41Z',
      repeatPassDays: 6,
      groundResolutionM: 5.0,
    },
    scenarioBriefing:
      'Catastrophic flash flooding struck the industrial basin following an extreme DANA meteorological event. Cloud cover blinds optical satellites, but microwave radar penetrates cloud decks directly.',
    forensicMission:
      'Detect the submerged logistics hub. Smooth standing floodwater causes specular reflection, bouncing microwave pulses away from the sensor and creating deep signal voids (dark backscatter drop <= -22 dB). Use the X-Ray swipe curtain to cross-reference optical baselines with the SAR radar depression.',
    targetAnomaly: {
      lat: 39.4628,
      lng: -0.4285,
      name: 'Submerged Multi-Modal Terminal C',
      expectedSigma0Db: -23.4,
      expectedCoherence: 0.12,
      expectedPhaseDisplacementCm: 0.0,
      samplingClue: 'Specular water reflection causes extreme backscatter loss (-23.4 dB) over previously reflective industrial terrain.',
    },
    hints: [
      {
        id: 0,
        title: 'Microwave Specular Reflection',
        text: 'Smooth open water acts as a specular reflector (mirror). Instead of backscattering energy back to the satellite, the pulse is deflected away into space, creating an intensely dark signature (down to -24 dB).',
        penaltyPercent: 25,
      },
      {
        id: 1,
        title: 'Geographic Keyword Extraction',
        text: 'The affected river basin is named after the ancient Turia waterway. The key phrase format is flag{nisar_flood_specular_turia}.',
        penaltyPercent: 25,
      },
    ],
  },
  'level-2': {
    id: 'level-2',
    levelNumber: 2,
    title: 'Level 2: Ashes of Coherence',
    codename: 'JASPER PYRO-RADAR',
    category: 'Biomass & Coherence Loss',
    difficulty: 'Advanced',
    basePoints: 250,
    flag: 'flag{nisar_coherence_burn_jasper}',
    targetLocation: 'Athabasca Valley / Jasper Complex, Alberta',
    centerCoordinates: [52.8732, -118.0821],
    defaultZoom: 12,
    boundingBox: {
      north: 52.9300,
      south: 52.8100,
      east: -117.9800,
      west: -118.1900,
    },
    satellite: {
      mission: 'NISAR Ecosystem Observation',
      sensor: 'L-SAR Quad-Pol Polarimetric InSAR',
      frequencyGhz: 1.25,
      wavelengthCm: 24.0,
      polarization: 'Quad-Pol (HH + HV + VV + VH)',
      passDirection: 'Ascending',
      lookAngleDeg: 38.4,
      acquisitionDate: '2024-07-28T22:04:15Z',
      repeatPassDays: 12,
      groundResolutionM: 6.0,
    },
    scenarioBriefing:
      'A fast-moving wildfire swept through coniferous canopy stands. Optical imagery is heavily obscured by lingering pyrocumulonimbus haze. Polarimetric InSAR reveals total destruction of canopy scatterers.',
    forensicMission:
      'Trace the wildfire burn scar severity. In healthy forests, complex volumetric canopy scattering maintains moderate coherence and strong HV backscatter. Intense fire consumes branches and needles, resulting in total loss of temporal coherence (gamma < 0.20) and surface bare-soil scattering.',
    targetAnomaly: {
      lat: 52.8732,
      lng: -118.0821,
      name: 'High-Severity Canopy Collapse Zone',
      expectedSigma0Db: -14.6,
      expectedCoherence: 0.14,
      expectedPhaseDisplacementCm: -1.2,
      samplingClue: 'Identify the high-burn perimeter showing catastrophic coherence decorrelation (gamma = 0.14).',
    },
    hints: [
      {
        id: 0,
        title: 'Interferometric Decorrelation',
        text: 'Coherence (gamma) ranges from 0.0 (total decorrelation/noise) to 1.0 (perfect phase stability). Intense burn scars destroy the 3D scattering canopy structure, dropping coherence to near zero.',
        penaltyPercent: 25,
      },
      {
        id: 1,
        title: 'Target Codename Flag',
        text: 'The flag combines the coherence loss phenomenon and the national park name: flag{nisar_coherence_burn_jasper}.',
        penaltyPercent: 25,
      },
    ],
  },
  'level-3': {
    id: 'level-3',
    levelNumber: 3,
    title: 'Level 3: Fractured Crust',
    codename: 'SEISMIC RIDGE INTERFEROGRAM',
    category: 'InSAR Crustal Deformation',
    difficulty: 'Expert',
    basePoints: 500,
    flag: 'flag{nisar_fault_slip_12cm_fringe}',
    targetLocation: 'Ridgecrest Fault Zone, Eastern California',
    centerCoordinates: [35.7692, -117.5994],
    defaultZoom: 12,
    boundingBox: {
      north: 35.8400,
      south: 35.6900,
      east: -117.5000,
      west: -117.7000,
    },
    satellite: {
      mission: 'NISAR Geodynamics & Hazard Mission',
      sensor: 'L-SAR Repeat-Pass Differential InSAR',
      frequencyGhz: 1.25,
      wavelengthCm: 24.0,
      polarization: 'HH Single-Look Complex (SLC)',
      passDirection: 'Descending',
      lookAngleDeg: 34.2,
      acquisitionDate: '2024-08-14T03:55:12Z',
      repeatPassDays: 12,
      groundResolutionM: 4.0,
    },
    scenarioBriefing:
      'A magnitude 7.1 strike-slip seismic rupture tore across the Mojave crust. Differential InSAR (DInSAR) phase interferometry maps crustal movement with millimeter-level precision via cyclic color fringes.',
    forensicMission:
      'Perform fringe counting along the rupture gradient. For NISAR L-band SAR with wavelength lambda = 24.0 cm, each complete repeating color fringe cycle (0 to 2*pi) corresponds to lambda/2 = 12.0 cm of line-of-sight ground displacement. Unravel the displacement metric to confirm crustal displacement and extract the final master flag.',
    targetAnomaly: {
      lat: 35.7692,
      lng: -117.5994,
      name: 'Primary Strike-Slip Rupture Trace',
      expectedSigma0Db: -8.2,
      expectedCoherence: 0.88,
      expectedPhaseDisplacementCm: 48.0,
      samplingClue: 'Count four consecutive fringe cycles converging near the epicentral fault rupture (4 * 12cm = 48cm total slip displacement).',
    },
    hints: [
      {
        id: 0,
        title: 'InSAR Fringe Equation',
        text: 'In radar interferometry, ground displacement in the radar line-of-sight (LOS) is directly proportional to phase change: Delta_r = (lambda / 4*pi) * Delta_phi. One full phase cycle (2*pi) equals half the wavelength (lambda / 2). For NISAR L-band (24 cm), one fringe = 12 cm.',
        penaltyPercent: 25,
      },
      {
        id: 1,
        title: 'Master Flag Pattern',
        text: 'The master flag embeds the radar displacement constant (12cm): flag{nisar_fault_slip_12cm_fringe}.',
        penaltyPercent: 25,
      },
    ],
  },
};

/**
 * Validates a flag submission in constant time to prevent timing attacks.
 */
export function verifyFlag(levelId: LevelId, userFlag: string): boolean {
  const challenge = GROUND_TRUTH_CHALLENGES[levelId];
  if (!challenge) return false;

  const normalizedExpected = challenge.flag.trim().toLowerCase();
  const normalizedActual = userFlag.trim().toLowerCase();

  if (normalizedExpected.length !== normalizedActual.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < normalizedExpected.length; i++) {
    mismatch |= normalizedExpected.charCodeAt(i) ^ normalizedActual.charCodeAt(i);
  }

  return mismatch === 0;
}

/**
 * Strips ground truth flag and unrevealed hint text before returning to client.
 */
export function sanitizeChallengeForClient(
  challenge: GroundTruthChallenge,
  unlockedHintIds: number[],
  isUnlocked: boolean,
  isSolved: boolean,
  solvedAt?: string,
  levelPointsAwarded?: number
): Challenge {
  const revealedHints: Hint[] = challenge.hints.map((h, index) => {
    const isRevealed = unlockedHintIds.includes(index);
    return {
      id: h.id,
      title: h.title,
      text: isRevealed ? h.text : undefined,
      penaltyPercent: h.penaltyPercent,
      revealed: isRevealed,
    };
  });

  // Calculate current available points based on revealed hints
  const totalPenaltyPercent = revealedHints
    .filter((h) => h.revealed)
    .reduce((sum, h) => sum + h.penaltyPercent, 0);

  const penaltyMultiplier = Math.max(0.25, 1 - totalPenaltyPercent / 100);
  const currentPoints = Math.round(challenge.basePoints * penaltyMultiplier);

  return {
    id: challenge.id,
    levelNumber: challenge.levelNumber,
    title: challenge.title,
    codename: challenge.codename,
    category: challenge.category,
    difficulty: challenge.difficulty,
    basePoints: challenge.basePoints,
    currentPoints: isSolved && levelPointsAwarded !== undefined ? levelPointsAwarded : currentPoints,
    unlocked: isUnlocked,
    solved: isSolved,
    solvedAt,
    targetLocation: challenge.targetLocation,
    centerCoordinates: challenge.centerCoordinates,
    defaultZoom: challenge.defaultZoom,
    boundingBox: challenge.boundingBox,
    satellite: challenge.satellite,
    scenarioBriefing: challenge.scenarioBriefing,
    forensicMission: challenge.forensicMission,
    targetAnomaly: challenge.targetAnomaly,
    hints: revealedHints,
  };
}
