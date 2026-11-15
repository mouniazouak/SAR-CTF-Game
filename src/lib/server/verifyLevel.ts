import { LEVEL_ANSWER_KEYS } from './levelAnswerKey';
import { getLevelDefinition } from './levelCatalog';
import type {
  IncidentLevelId,
  ScoreBreakdown,
  VerifyLevelFailure,
  VerifyLevelPayload,
  VerifyLevelSuccess,
} from '@/types/levels';

const EARTH_RADIUS_METERS = 6371008.8;
const OUTER_RADIUS_MULTIPLIER = 0.85;
const MINIMUM_SCORE_MULTIPLIER = 0.25;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/**
 * Great-circle distance between two WGS84 coordinates using the Haversine
 * formula. Returns meters.
 */
export function haversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(a)));
}

function spatialMultiplier(distanceMeters: number, precisionRadiusMeters: number, toleranceMeters: number): number {
  if (distanceMeters <= precisionRadiusMeters) {
    return 1;
  }

  const span = Math.max(1, toleranceMeters - precisionRadiusMeters);
  const outsidePrecision = Math.min(span, distanceMeters - precisionRadiusMeters);

  return 1 - (1 - OUTER_RADIUS_MULTIPLIER) * (outsidePrecision / span);
}

function round(value: number, digits = 4): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/**
 * Validates a level attempt against the server-only answer key and returns
 * either the flag plus a scoring breakdown, or the first failed check with a
 * SARah / ARSET coaching hint. Failure ordering is intentional: the physical
 * driver and recovery are not evaluated until the coordinate is inside the
 * target anomaly, which prevents blind option enumeration.
 */
export function verifyLevelSubmission(
  payload: VerifyLevelPayload
): VerifyLevelSuccess | VerifyLevelFailure {
  const level = getLevelDefinition(payload.levelId);
  const answer = LEVEL_ANSWER_KEYS[payload.levelId];

  if (!level || !answer) {
    throw new Error(`No answer key configured for level: ${payload.levelId}`);
  }

  const distanceMeters = haversineDistanceMeters(
    payload.clickedLat,
    payload.clickedLng,
    answer.target.lat,
    answer.target.lng
  );

  if (distanceMeters > answer.target.toleranceMeters) {
    return {
      success: false,
      levelId: payload.levelId,
      failedCheck: 'location',
      hint: `SARah // ARSET: ${answer.failureHints.location}`,
      message:
        'No matching anomaly at the clicked coordinate. The spatial signature is outside this incident target.',
    };
  }

  if (payload.selectedDriverId !== answer.correctDriverId) {
    return {
      success: false,
      levelId: payload.levelId,
      failedCheck: 'driver',
      hint: `SARah // ARSET: ${answer.failureHints.driver}`,
      message:
        'The selected physical driver does not explain the SAR signature in this scene.',
    };
  }

  if (payload.selectedRecoveryId !== answer.correctRecoveryId) {
    return {
      success: false,
      levelId: payload.levelId,
      failedCheck: 'recovery',
      hint: `SARah // ARSET: ${answer.failureHints.recovery}`,
      message:
        'The selected recovery action does not contain the incident or restore data integrity.',
    };
  }

  const hintsUsed = Math.min(Math.max(0, Math.trunc(payload.hintsUsed)), level.hints.length);
  const hintPenaltyPercent = hintsUsed * (level.hints[0]?.penaltyPercent ?? 15);
  const hintMultiplier = Math.max(
    MINIMUM_SCORE_MULTIPLIER,
    1 - hintPenaltyPercent / 100
  );
  const accuracyMultiplier = spatialMultiplier(
    distanceMeters,
    answer.target.precisionRadiusMeters,
    answer.target.toleranceMeters
  );

  const pointsEarned = Math.round(
    level.basePoints * hintMultiplier * accuracyMultiplier
  );

  const scoreBreakdown: ScoreBreakdown = {
    basePoints: level.basePoints,
    hintsUsed,
    hintPenaltyPercent,
    hintMultiplier: round(hintMultiplier),
    accuracyMultiplier: round(accuracyMultiplier),
    distanceMeters: Math.round(distanceMeters),
    precisionRadiusMeters: answer.target.precisionRadiusMeters,
    toleranceMeters: answer.target.toleranceMeters,
  };

  return {
    success: true,
    levelId: payload.levelId,
    flag: answer.flag,
    pointsEarned,
    earthScienceLearning: answer.earthScienceLearning,
    scoreBreakdown,
    message: `Anomaly confirmed at ${answer.target.label}. +${pointsEarned} PTS. Flag recovered.`,
  };
}
