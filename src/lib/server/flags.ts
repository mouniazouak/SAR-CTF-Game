import type { LevelId, Challenge, Hint } from '@/types/ctf';

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
    title: 'Level 1: The Valencia False Alarm',
    codename: 'OPERATION TURIA FALSE POSITIVE',
    category: 'SAR Interpretation',
    difficulty: 'Novice',
    basePoints: 100,
    flag: 'flag{nisar_false_alarm_valencia_airport}',
    targetLocation: 'Manises Airport, Valencia, Spain',
    centerCoordinates: [39.4650, -0.4846],
    defaultZoom: 12,
    boundingBox: {
      north: 39.5571,
      south: 39.3729,
      east: -0.3135,
      west: -0.6557,
    },
    satellite: {
      mission: 'NISAR (NASA-ISRO SAR)',
      sensor: 'L-SAR GCOV frequency A',
      frequencyGhz: 1.25,
      wavelengthCm: 24.0,
      polarization: 'HH',
      passDirection: 'Descending',
      lookAngleDeg: 44.5,
      acquisitionDate: '2026-10-23T19:01:37Z',
      repeatPassDays: 6,
      groundResolutionM: 20.0,
    },
    scenarioBriefing:
      'A dark radar signature near Valencia Airport has been reported as a possible flood. Your task is to determine whether the signal represents water or a stable artificial surface.',
    forensicMission:
      'Investigate the dark smooth surface at Manises Airport. Smooth runways can create radar-dark signatures similar to calm water. Compare the real NISAR HH evidence, use the weather context, and reject the flood hypothesis when the evidence does not support new water.',
    targetAnomaly: {
      lat: 39.48821,
      lng: -0.48278,
      name: 'Manises Airport runway false alarm',
      expectedSigma0Db: -15.0,
      expectedCoherence: 0.55,
      expectedPhaseDisplacementCm: 0.0,
      samplingClue: 'A dark, smooth radar surface is visible near the airport. Dark does not automatically mean water: compare shape, context and rainfall before declaring a flood.',
    },
    hints: [
      {
        id: 0,
        title: 'Dark Does Not Mean Water',
        text: 'Calm water can be radar-dark, but runways and other smooth artificial surfaces can also produce a dark signature. Use the shape and geographic context before calling it a flood.',
        penaltyPercent: 25,
      },
      {
        id: 1,
        title: 'Weather Cross-Check',
        text: 'The historical weather context shows almost no rain between the scenes. The evidence supports a false alarm at the airport, not a newly flooded logistics hub.',
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
  'level-4': {
    id: 'level-4',
    levelNumber: 4,
    title: 'Level 4: Operation Ghost Orbit',
    codename: 'GHOST ORBIT',
    category: 'Mission Data Forensics',
    difficulty: 'Expert',
    basePoints: 1000,
    flag: 'flag{nisar_sar_integrity_breach}',
    targetLocation: 'NISAR Ground Data Relay, Mojave Sector',
    centerCoordinates: [34.8750, -118.1600],
    defaultZoom: 14,
    boundingBox: {
      north: 34.9100,
      south: 34.8400,
      east: -118.1100,
      west: -118.2100,
    },
    satellite: {
      mission: 'NISAR Secure Downlink Integrity Drill',
      sensor: 'L-SAR Repeat-Pass Forensic Feed (1.25 GHz)',
      frequencyGhz: 1.25,
      wavelengthCm: 24.0,
      polarization: 'Dual-Pol (HH + HV)',
      passDirection: 'Descending',
      lookAngleDeg: 37.1,
      acquisitionDate: '2024-09-13T14:22:05Z',
      repeatPassDays: 12,
      groundResolutionM: 3.5,
    },
    scenarioBriefing:
      'A ground relay reported a possible manipulation of a SAR downlink package. The evidence is distributed across access logs, image metadata, checksums, and a visual payload. Treat the event as a contained forensic exercise: do not attack any external system.',
    forensicMission:
      'Reconstruct the incident timeline, identify the altered package, verify its checksum mismatch, and combine the recovered evidence fragments to authenticate the final mission flag.',
    targetAnomaly: {
      lat: 34.8750,
      lng: -118.1600,
      name: 'Altered SAR Downlink Package',
      expectedSigma0Db: -7.8,
      expectedCoherence: 0.31,
      expectedPhaseDisplacementCm: 0.0,
      samplingClue: 'The visual layer contains several similar telemetry blocks. Compare their timestamps and integrity values instead of trusting the labels.',
    },
    hints: [
      {
        id: 0,
        title: 'Start With Time',
        text: 'Sort the synthetic access events chronologically. The first unusual session appears shortly before the altered package is registered.',
        penaltyPercent: 10,
      },
      {
        id: 1,
        title: 'Checksum Mismatch',
        text: 'One package has a checksum that does not match the trusted manifest. That package contains the first evidence fragment.',
        penaltyPercent: 15,
      },
      {
        id: 2,
        title: 'Metadata Drift',
        text: 'Compare the image acquisition timestamp, pass direction, and filename. A small metadata inconsistency identifies the tampered record.',
        penaltyPercent: 20,
      },
      {
        id: 3,
        title: 'Final Evidence Fragment',
        text: 'The final fragment is encoded in the visual telemetry payload. Combine all fragments in incident order to form the flag.',
        penaltyPercent: 25,
      },
    ],
  },
  'level-5': {
    id: 'level-5',
    levelNumber: 5,
    title: 'Level 5: Mission Control Phishing',
    codename: 'SILENT INVITATION',
    category: 'Email Forensics',
    difficulty: 'Expert',
    basePoints: 700,
    flag: 'flag{nisar_phishing_mission_control}',
    targetLocation: 'Mission Operations Mail Gateway',
    centerCoordinates: [34.8800, -118.1500],
    defaultZoom: 13,
    boundingBox: { north: 34.9200, south: 34.8400, east: -118.1000, west: -118.2000 },
    satellite: {
      mission: 'NISAR Mission Operations Security Drill',
      sensor: 'Secure Mail-to-Telemetry Gateway',
      frequencyGhz: 1.25,
      wavelengthCm: 24.0,
      polarization: 'Dual-Pol (HH + HV)',
      passDirection: 'Ascending',
      lookAngleDeg: 35.0,
      acquisitionDate: '2024-09-14T14:22:05Z',
      repeatPassDays: 12,
      groundResolutionM: 3.5,
    },
    scenarioBriefing: 'A message claiming to come from a mission collaborator requested access to a SAR processing package. Analyze the synthetic email evidence without opening external links or attachments.',
    forensicMission: 'Identify the impersonated sender, the look-alike domain, and the suspicious request. Extract the flag from the email headers and evidence timeline.',
    targetAnomaly: { lat: 34.8800, lng: -118.1500, name: 'Suspicious Mission Email', expectedSigma0Db: -6.2, expectedCoherence: 0.42, expectedPhaseDisplacementCm: 0, samplingClue: 'Look for the evidence card whose sender identity does not match the trusted mission domain.' },
    hints: [
      { id: 0, title: 'Check the Domain', text: 'The display name looks familiar, but the sender domain contains a subtle extra character.', penaltyPercent: 15 },
      { id: 1, title: 'Follow the Request', text: 'The suspicious message asks for software or source code outside the normal mission workflow.', penaltyPercent: 20 },
      { id: 2, title: 'Header Fragment', text: 'The first flag fragment is in the Received header timestamp, not in the email body.', penaltyPercent: 25 },
    ],
  },
  'level-6': {
    id: 'level-6',
    levelNumber: 6,
    title: 'Level 6: The Open Bucket',
    codename: 'CLOUD ECLIPSE',
    category: 'Cloud Configuration',
    difficulty: 'Expert',
    basePoints: 800,
    flag: 'flag{nisar_exposed_sar_metadata}',
    targetLocation: 'Earth Observation Data Archive',
    centerCoordinates: [34.8850, -118.1450],
    defaultZoom: 13,
    boundingBox: { north: 34.9250, south: 34.8450, east: -118.0950, west: -118.1950 },
    satellite: {
      mission: 'NISAR Data Archive Security Drill',
      sensor: 'Cloud Object Storage Manifest',
      frequencyGhz: 1.25,
      wavelengthCm: 24.0,
      polarization: 'Quad-Pol (HH + HV + VV + VH)',
      passDirection: 'Descending',
      lookAngleDeg: 39.0,
      acquisitionDate: '2024-09-15T14:22:05Z',
      repeatPassDays: 12,
      groundResolutionM: 5.0,
    },
    scenarioBriefing: 'A synthetic archive manifest contains a storage policy and several SAR metadata records. The goal is to identify the least-privilege failure, not to access any real cloud service.',
    forensicMission: 'Compare the intended policy with the effective policy, identify the public-read rule, and recover the flag from the exposed metadata record.',
    targetAnomaly: { lat: 34.8850, lng: -118.1450, name: 'Public Archive Policy', expectedSigma0Db: -12.0, expectedCoherence: 0.55, expectedPhaseDisplacementCm: 0, samplingClue: 'Compare the policy cards: one archive path is readable by everyone instead of the mission role.' },
    hints: [
      { id: 0, title: 'Least Privilege', text: 'The intended reader is a named mission role, not an anonymous principal.', penaltyPercent: 15 },
      { id: 1, title: 'Policy Delta', text: 'The dangerous difference is in the resource permission, not the encryption setting.', penaltyPercent: 20 },
      { id: 2, title: 'Metadata Record', text: 'The exposed record contains the second fragment needed for the flag.', penaltyPercent: 25 },
    ],
  },
  'level-7': {
    id: 'level-7',
    levelNumber: 7,
    title: 'Level 7: Telemetry Intrusion',
    codename: 'NIGHT PASS',
    category: 'Log Forensics',
    difficulty: 'Expert',
    basePoints: 900,
    flag: 'flag{nisar_telemetry_intrusion_detected}',
    targetLocation: 'SAR Downlink Authentication Service',
    centerCoordinates: [34.8900, -118.1400],
    defaultZoom: 13,
    boundingBox: { north: 34.9300, south: 34.8500, east: -118.0900, west: -118.1900 },
    satellite: {
      mission: 'NISAR Ground Segment Detection Drill',
      sensor: 'Telemetry Authentication Logs',
      frequencyGhz: 1.25,
      wavelengthCm: 24.0,
      polarization: 'HH + HV',
      passDirection: 'Ascending',
      lookAngleDeg: 33.5,
      acquisitionDate: '2024-09-16T14:22:05Z',
      repeatPassDays: 12,
      groundResolutionM: 3.5,
    },
    scenarioBriefing: 'The ground segment reports unusual activity around a telemetry authentication service. All evidence is synthetic and limited to the challenge workspace.',
    forensicMission: 'Reconstruct the login timeline, identify the anomalous session, and correlate it with the modified telemetry package.',
    targetAnomaly: { lat: 34.8900, lng: -118.1400, name: 'Anomalous Telemetry Session', expectedSigma0Db: -9.3, expectedCoherence: 0.38, expectedPhaseDisplacementCm: 0, samplingClue: 'The suspicious session occurs outside the expected pass window and uses a never-seen service identity.', },
    hints: [
      { id: 0, title: 'Sort the Timeline', text: 'Read the event timestamps in order before looking at the usernames.', penaltyPercent: 15 },
      { id: 1, title: 'Service Identity', text: 'One service account appears only once and immediately precedes the package alteration.', penaltyPercent: 20 },
      { id: 2, title: 'Correlate Events', text: 'The final fragment is attached to the event sharing the same request ID as the altered package.', penaltyPercent: 25 },
    ],
  },
  'level-8': {
    id: 'level-8',
    levelNumber: 8,
    title: 'Level 8: Mission Site Defaced',
    codename: 'LAST TRANSMISSION',
    category: 'Web Integrity',
    difficulty: 'Expert',
    basePoints: 1200,
    flag: 'flag{nisar_mission_site_defaced}',
    targetLocation: 'Public Mission Status Portal',
    centerCoordinates: [34.8950, -118.1350],
    defaultZoom: 13,
    boundingBox: { north: 34.9350, south: 34.8550, east: -118.0850, west: -118.1850 },
    satellite: {
      mission: 'NISAR Public Status Portal Integrity Drill',
      sensor: 'Web Asset Change Monitor',
      frequencyGhz: 1.25,
      wavelengthCm: 24.0,
      polarization: 'VV + VH',
      passDirection: 'Descending',
      lookAngleDeg: 36.0,
      acquisitionDate: '2024-09-17T14:22:05Z',
      repeatPassDays: 12,
      groundResolutionM: 4.0,
    },
    scenarioBriefing: 'The public mission status page changed unexpectedly. Players receive two safe snapshots and a synthetic change log for forensic comparison.',
    forensicMission: 'Compare the trusted and altered snapshots, identify the modified asset, and recover the final flag from the integrity report.',
    targetAnomaly: { lat: 34.8950, lng: -118.1350, name: 'Modified Mission Status Asset', expectedSigma0Db: -5.5, expectedCoherence: 0.29, expectedPhaseDisplacementCm: 0, samplingClue: 'One asset hash differs from the trusted release manifest. Use the change log to identify it.', },
    hints: [
      { id: 0, title: 'Hash the Assets', text: 'Compare the trusted and current asset hashes instead of relying on visual appearance.', penaltyPercent: 15 },
      { id: 1, title: 'Change Log', text: 'The modified asset was changed after the last approved deployment window.', penaltyPercent: 20 },
      { id: 2, title: 'Final Report', text: 'The integrity report contains the last flag fragment after the altered asset is identified.', penaltyPercent: 25 },
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
