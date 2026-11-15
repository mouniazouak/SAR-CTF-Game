// Comprehensive verification test for the Dancing with the SARs CTF Game Engine & Validation Layer
import { GROUND_TRUTH_CHALLENGES, verifyFlag, sanitizeChallengeForClient } from './src/lib/server/flags.ts';
import { getOrCreateSession, submitFlag, revealHint, getPlayerChallenges, getLeaderboard } from './src/lib/server/gameState.ts';
import { sampleForensics } from './src/lib/sar-forensics.ts';

console.log('=== TEST SUITE: Dancing with the SARs CTF Engine ===\n');

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error(`❌ FAILED: ${msg}`);
    failed++;
  } else {
    console.log(`✅ PASSED: ${msg}`);
  }
}

// 1. Verify Ground Truth Flags format
const flags = Object.values(GROUND_TRUTH_CHALLENGES).map(c => c.flag);
assert(flags.length === 9, 'All 9 levels exist in ground truth database');
flags.forEach((f, idx) => {
  assert(/^flag\{nisar_[a-z0-9_]+\}$/.test(f), `Level ${idx} flag matches syntax: ${f}`);
});

// 2. Test verifyFlag with constant-time check
assert(verifyFlag('level-0', 'flag{nisar_cal_point_target_3487}'), 'Level 0 flag verifies successfully');
assert(!verifyFlag('level-0', 'flag{wrong_flag_attempt}'), 'Level 0 rejects incorrect flag');
assert(!verifyFlag('level-0', 'flag{nisar_cal_point_target_3488}'), 'Level 0 rejects near-miss flag');

// 3. Test Sanitize Challenges (verify ground truth flag is never leaked)
const sanitized = sanitizeChallengeForClient(GROUND_TRUTH_CHALLENGES['level-0'], [], true, false);
assert(!('flag' in sanitized), 'Ground-truth flag stripped from client-facing challenge payload');
assert(sanitized.hints[0].text === undefined, 'Unrevealed hint text is omitted from client');

// 4. Test Progressive Unlocking & Game Progression
const session = getOrCreateSession('test_analyst_session_001', 'Test-Ghost-99');
assert(session.alias === 'Test-Ghost-99', 'Player session created with custom callsign');

const challengesInitial = getPlayerChallenges(session);
assert(challengesInitial[0].unlocked === true, 'Level 0 (Tutorial) is initially unlocked');
assert(challengesInitial[1].unlocked === false, 'Level 1 is locked before Level 0 is solved');
assert(challengesInitial[2].unlocked === false, 'Level 2 is locked');
assert(challengesInitial[3].unlocked === false, 'Level 3 is locked');
assert(challengesInitial[4].unlocked === false, 'Level 4 is locked');
assert(challengesInitial[8].unlocked === false, 'Level 8 is locked');

// Attempt to submit Level 1 before Level 0
const prematureSubmit = submitFlag(session, 'level-1', 'flag{nisar_false_alarm_valencia_airport}');
assert(!prematureSubmit.success, 'Premature submission for locked Level 1 is blocked');

// Reveal Hint #1 on Level 0 (-25% penalty)
const hintResult = revealHint(session, 'level-0', 0);
assert(hintResult.success && hintResult.penaltyApplied === 25, 'Hint reveal applies 25% penalty');
assert(session.unlockedHints['level-0'].includes(0), 'Hint recorded in player session');

// Solve Level 0 with hint deduction: Base 50 pts - 25% = 38 pts
const solveLevel0 = submitFlag(session, 'level-0', 'flag{nisar_cal_point_target_3487}');
assert(solveLevel0.success, 'Level 0 solved successfully');
assert(solveLevel0.pointsAwarded === 38, `Level 0 points dynamically adjusted with hint penalty: ${solveLevel0.pointsAwarded} pts (expected 38)`);
assert(session.totalScore === 38, `Session score updated: ${session.totalScore} pts`);
assert(solveLevel0.nextLevelUnlocked === 'level-1', 'Level 1 unlocked upon Level 0 completion');

// Verify Level 1 is now unlocked
const challengesAfterL0 = getPlayerChallenges(session);
assert(challengesAfterL0[1].unlocked === true, 'Level 1 is now unlocked in challenge list');

// Solve Level 1 (Base 100 pts, no hints = 100 pts)
const solveLevel1 = submitFlag(session, 'level-1', 'flag{nisar_false_alarm_valencia_airport}');
assert(solveLevel1.success, 'Level 1 solved successfully');
assert(solveLevel1.pointsAwarded === 100, 'Level 1 awards full 100 points without hints');
assert(session.totalScore === 138, 'Session score updated to 138 pts');

// Solve Level 2 (Base 250 pts)
const solveLevel2 = submitFlag(session, 'level-2', 'flag{nisar_coherence_burn_jasper}');
assert(solveLevel2.success, 'Level 2 solved successfully (+250 pts)');
assert(session.totalScore === 388, 'Session score updated to 388 pts');

// Solve Level 3 (Base 500 pts)
const solveLevel3 = submitFlag(session, 'level-3', 'flag{nisar_fault_slip_12cm_fringe}');
assert(solveLevel3.success, 'Level 3 solved successfully (+500 pts)');
assert(session.totalScore === 888, 'Session score updated to 888 pts');

// Solve the new expert forensic challenge
const solveLevel4 = submitFlag(session, 'level-4', 'flag{nisar_sar_integrity_breach}');
assert(solveLevel4.success, 'Level 4 Ghost Orbit solved successfully (+1000 pts)');
assert(solveLevel4.nextLevelUnlocked === 'level-5', 'Level 5 unlocked upon Level 4 completion');
assert(session.solvedLevels.length === 5, 'First 5 levels recorded as completed');

// 5. Test Leaderboard Injection
const leaderboard = getLeaderboard(session.token);
const playerEntry = leaderboard.find(e => e.alias === 'Test-Ghost-99');
assert(playerEntry !== undefined, 'Player entry present in real-time leaderboard');
assert(playerEntry.totalScore === 1888, 'Leaderboard displays accurate total score');
assert(playerEntry.isCurrentPlayer === true, 'Current player flagged in leaderboard response');

// 6. Test Forensic Sampler Physics
const calSample = sampleForensics('level-0', 34.8722, -118.1564);
assert(calSample.sigma0Db > 20, `Calibration point returns hyper-bright backscatter: ${calSample.sigma0Db} dB`);

const runwaySample = sampleForensics('level-1', 39.48821, -0.48278);
assert(
  runwaySample.sigma0Db < -13 && runwaySample.sigma0Db > -20,
  `Airport runway false alarm returns a dark but non-water signature: ${runwaySample.sigma0Db} dB`
);

const burnSample = sampleForensics('level-2', 52.8732, -118.0821);
assert(burnSample.coherence < 0.25, `Wildfire burn scar returns severe coherence decorrelation: γ = ${burnSample.coherence}`);

const tectonicSample = sampleForensics('level-3', 35.7692, -117.5994);
assert(tectonicSample.displacementCm >= 45, `Tectonic fault peak displacement measured: ${tectonicSample.displacementCm} cm`);

console.log(`\n=== TEST SUITE COMPLETED with ${failed} failures ===`);
process.exit(failed > 0 ? 1 : 0);
