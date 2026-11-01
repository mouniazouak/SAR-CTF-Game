import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateSession, getPlayerChallenges } from '@/lib/server/gameState';

export async function GET(req: NextRequest) {
  const token = req.headers.get('x-session-token') || req.cookies.get('sar_session_token')?.value || undefined;
  const session = getOrCreateSession(token);
  const challenges = getPlayerChallenges(session);

  return NextResponse.json({
    success: true,
    challenges,
    player: {
      alias: session.alias,
      totalScore: session.totalScore,
      solvedCount: session.solvedLevels.length,
    },
  });
}
