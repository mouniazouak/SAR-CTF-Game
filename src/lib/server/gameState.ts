import { LevelId, PlayerSession, LeaderboardEntry, Challenge } from '@/types/ctf';
import { GROUND_TRUTH_CHALLENGES, sanitizeChallengeForClient, verifyFlag } from './flags';

// In-memory persistent state across server lifecycle
const sessions = new Map<string, PlayerSession>();
const attemptTracker = new Map<string, { count: number; resetAt: number }>();

const LEVEL_ORDER: LevelId[] = ['level-0', 'level-1', 'level-2', 'level-3'];

// Pre-seeded competitor roster for hackathon judging demo
const MOCK_LEADERBOARD_TEAMS: LeaderboardEntry[] = [
  {
    rank: 1,
    alias: 'JPL-RadarGhosts',
    totalScore: 900,
    solvedLevels: ['level-0', 'level-1', 'level-2', 'level-3'],
    solvedCount: 4,
    lastSolveTime: '12m ago',
    timeElapsedMinutes: 18,
    affiliation: 'NASA JPL / Caltech',
  },
  {
    rank: 2,
    alias: 'InSAR_FringeHunters',
    totalScore: 785,
    solvedLevels: ['level-0', 'level-1', 'level-2'],
    solvedCount: 3,
    lastSolveTime: '24m ago',
    timeElapsedMinutes: 32,
    affiliation: 'ESA Earth Observation',
  },
  {
    rank: 3,
    alias: 'SpecularScouts-ISRO',
    totalScore: 350,
    solvedLevels: ['level-0', 'level-1'],
    solvedCount: 2,
    lastSolveTime: '45m ago',
    timeElapsedMinutes: 51,
    affiliation: 'ISRO Space Applications Centre',
  },
  {
    rank: 4,
    alias: 'CoherenceCrushers',
    totalScore: 150,
    solvedLevels: ['level-0', 'level-1'],
    solvedCount: 2,
    lastSolveTime: '1h 05m ago',
    timeElapsedMinutes: 65,
    affiliation: 'DLR Microwaves & Radar',
  },
  {
    rank: 5,
    alias: 'NoviceRadarEcho',
    totalScore: 50,
    solvedLevels: ['level-0'],
    solvedCount: 1,
    lastSolveTime: '1h 22m ago',
    timeElapsedMinutes: 82,
    affiliation: 'Space Apps Rookie Crew',
  },
];

/**
 * Generates a cool tactical callsign if the player doesn't have one.
 */
export function generateCallsign(): string {
  const prefixes = ['Astro', 'SAR', 'Orbital', 'Interfero', 'Doppler', 'Radiometric', 'Polar'];
  const suffixes = ['Specter', 'Vanguard', 'Raven', 'Sentry', 'Analyst', 'Pioneer', 'Vector'];
  const num = Math.floor(100 + Math.random() * 900);
  const p = prefixes[Math.floor(Math.random() * prefixes.length)];
  const s = suffixes[Math.floor(Math.random() * suffixes.length)];
  return `${p}-${s}-${num}`;
}

/**
 * Creates or retrieves a player session.
 */
export function getOrCreateSession(token?: string, requestedAlias?: string): PlayerSession {
  if (token && sessions.has(token)) {
    const existing = sessions.get(token)!;
    if (requestedAlias && requestedAlias.trim().length > 0 && requestedAlias !== existing.alias) {
      existing.alias = requestedAlias.trim().slice(0, 24);
    }
    return existing;
  }

  const newToken = token && token.length > 8 ? token : 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  const alias = (requestedAlias && requestedAlias.trim().length > 0) ? requestedAlias.trim().slice(0, 24) : generateCallsign();

  const newSession: PlayerSession = {
    alias,
    token: newToken,
    totalScore: 0,
    solvedLevels: [],
    unlockedHints: {
      'level-0': [],
      'level-1': [],
      'level-2': [],
      'level-3': [],
    },
    levelPointsAwarded: {
      'level-0': 0,
      'level-1': 0,
      'level-2': 0,
      'level-3': 0,
    },
    startedAt: new Date().toISOString(),
  };

  sessions.set(newToken, newSession);
  return newSession;
}

/**
 * Returns challenge list formatted for a player session.
 */
export function getPlayerChallenges(session: PlayerSession): Challenge[] {
  return LEVEL_ORDER.map((lvlId, index) => {
    const groundTruth = GROUND_TRUTH_CHALLENGES[lvlId];
    const isSolved = session.solvedLevels.includes(lvlId);

    // Level 0 is always unlocked.
    // Level N is unlocked if Level N-1 has been solved.
    const isUnlocked = index === 0 || session.solvedLevels.includes(LEVEL_ORDER[index - 1]);
    const unlockedHints = session.unlockedHints[lvlId] || [];

    return sanitizeChallengeForClient(
      groundTruth,
      unlockedHints,
      isUnlocked,
      isSolved,
      isSolved ? session.lastSolveAt : undefined,
      session.levelPointsAwarded[lvlId]
    );
  });
}

/**
 * Submits and validates a flag for the given session.
 */
export function submitFlag(
  session: PlayerSession,
  levelId: LevelId,
  flagInput: string
): { success: boolean; message: string; pointsAwarded?: number; nextLevelUnlocked?: LevelId | null } {
  // Check rate limiting
  const trackerKey = `${session.token}:${levelId}`;
  const now = Date.now();
  const tracker = attemptTracker.get(trackerKey) || { count: 0, resetAt: now + 60000 };

  if (now > tracker.resetAt) {
    tracker.count = 1;
    tracker.resetAt = now + 60000;
  } else {
    tracker.count++;
  }
  attemptTracker.set(trackerKey, tracker);

  if (tracker.count > 12) {
    return {
      success: false,
      message: 'Rate limit exceeded: Microwave demodulator overloaded. Please pause 30s before submitting again.',
    };
  }

  // Check if challenge is unlocked
  const levelIndex = LEVEL_ORDER.indexOf(levelId);
  if (levelIndex < 0) {
    return { success: false, message: 'Invalid challenge identifier.' };
  }

  const isUnlocked = levelIndex === 0 || session.solvedLevels.includes(LEVEL_ORDER[levelIndex - 1]);
  if (!isUnlocked) {
    return { success: false, message: 'Challenge is currently locked. Complete prerequisite levels first.' };
  }

  if (session.solvedLevels.includes(levelId)) {
    return { success: false, message: 'Telemetry verification already completed for this level.' };
  }

  // Format validation
  const cleanFlag = flagInput.trim();
  if (!/^flag\{nisar_[a-z0-9_]+\}$/i.test(cleanFlag)) {
    return {
      success: false,
      message: 'Invalid flag format syntax. Flags must strictly match: flag{nisar_xxxx_xxxx}',
    };
  }

  // Verify against ground truth
  const isCorrect = verifyFlag(levelId, cleanFlag);
  if (!isCorrect) {
    return {
      success: false,
      message: 'Verification failed: Phase correlation mismatch. Cross-check forensic coordinates and radar signatures.',
    };
  }

  // Calculate points considering hints revealed
  const groundTruth = GROUND_TRUTH_CHALLENGES[levelId];
  const revealedHints = session.unlockedHints[levelId] || [];
  const penaltyPercent = revealedHints.reduce((sum, hIdx) => {
    const hint = groundTruth.hints[hIdx];
    return sum + (hint ? hint.penaltyPercent : 0);
  }, 0);

  const penaltyMultiplier = Math.max(0.25, 1 - penaltyPercent / 100);
  const pointsAwarded = Math.round(groundTruth.basePoints * penaltyMultiplier);

  // Update session
  session.solvedLevels.push(levelId);
  session.levelPointsAwarded[levelId] = pointsAwarded;
  session.totalScore += pointsAwarded;
  session.lastSolveAt = new Date().toISOString();

  // Next level unlock
  const nextLevelId = levelIndex + 1 < LEVEL_ORDER.length ? LEVEL_ORDER[levelIndex + 1] : null;

  return {
    success: true,
    message: `Verification Successful! +${pointsAwarded} PTS awarded to ${session.alias}. Orbital telemetry synchronized.`,
    pointsAwarded,
    nextLevelUnlocked: nextLevelId,
  };
}

/**
 * Reveals a hint for a challenge and records point penalty.
 */
export function revealHint(
  session: PlayerSession,
  levelId: LevelId,
  hintIndex: number
): { success: boolean; message: string; hintText?: string; penaltyApplied?: number } {
  const groundTruth = GROUND_TRUTH_CHALLENGES[levelId];
  if (!groundTruth) {
    return { success: false, message: 'Challenge not found.' };
  }

  if (!groundTruth.hints[hintIndex]) {
    return { success: false, message: 'Hint index out of bounds.' };
  }

  const existingHints = session.unlockedHints[levelId] || [];
  if (existingHints.includes(hintIndex)) {
    return {
      success: true,
      message: 'Hint already revealed.',
      hintText: groundTruth.hints[hintIndex].text,
      penaltyApplied: 0,
    };
  }

  // Record hint reveal
  existingHints.push(hintIndex);
  session.unlockedHints[levelId] = existingHints;

  const hint = groundTruth.hints[hintIndex];

  return {
    success: true,
    message: `Hint revealed. Notice: -${hint.penaltyPercent}% maximum point penalty applied to this level.`,
    hintText: hint.text,
    penaltyApplied: hint.penaltyPercent,
  };
}

/**
 * Gets real-time dynamic leaderboard with current player injected.
 */
export function getLeaderboard(currentSessionToken?: string): LeaderboardEntry[] {
  const currentSession = currentSessionToken ? sessions.get(currentSessionToken) : null;
  const list: LeaderboardEntry[] = [...MOCK_LEADERBOARD_TEAMS];

  if (currentSession) {
    const elapsedMinutes = Math.max(
      1,
      Math.round((Date.now() - new Date(currentSession.startedAt).getTime()) / 60000)
    );

    const playerEntry: LeaderboardEntry = {
      rank: 0,
      alias: currentSession.alias,
      isCurrentPlayer: true,
      totalScore: currentSession.totalScore,
      solvedLevels: currentSession.solvedLevels,
      solvedCount: currentSession.solvedLevels.length,
      lastSolveTime: currentSession.lastSolveAt
        ? `${Math.max(1, Math.round((Date.now() - new Date(currentSession.lastSolveAt).getTime()) / 60000))}m ago`
        : 'Active Now',
      timeElapsedMinutes: elapsedMinutes,
      affiliation: 'Player Field Station (Active Mission)',
    };

    // Filter out if duplicate alias
    const filtered = list.filter((e) => e.alias !== currentSession.alias);
    filtered.push(playerEntry);

    // Sort by score descending, then by time elapsed ascending
    filtered.sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return a.timeElapsedMinutes - b.timeElapsedMinutes;
    });

    // Assign ranks
    return filtered.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }

  return list.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

/**
 * Resets a player session for fresh demonstration runs.
 */
export function resetSession(session: PlayerSession): void {
  session.totalScore = 0;
  session.solvedLevels = [];
  session.unlockedHints = {
    'level-0': [],
    'level-1': [],
    'level-2': [],
    'level-3': [],
  };
  session.levelPointsAwarded = {
    'level-0': 0,
    'level-1': 0,
    'level-2': 0,
    'level-3': 0,
  };
  session.startedAt = new Date().toISOString();
  session.lastSolveAt = undefined;
}
