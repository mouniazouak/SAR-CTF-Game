import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateSession, resetSession, getPlayerChallenges } from '@/lib/server/gameState';

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-session-token') || req.cookies.get('sar_session_token')?.value || undefined;
  const session = getOrCreateSession(token);

  resetSession(session);
  const challenges = getPlayerChallenges(session);

  return NextResponse.json({
    success: true,
    message: 'Player telemetry and challenge progression reset to initial pre-flight state.',
    session: {
      alias: session.alias,
      totalScore: session.totalScore,
      solvedLevels: session.solvedLevels,
    },
    challenges,
  });
}
