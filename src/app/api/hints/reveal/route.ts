import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateSession, revealHint, getPlayerChallenges } from '@/lib/server/gameState';
import { LevelId } from '@/types/ctf';

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('x-session-token') || req.cookies.get('sar_session_token')?.value || undefined;
    const session = getOrCreateSession(token);

    const body = await req.json().catch(() => ({}));
    const challengeId = body.challengeId as LevelId;
    const hintIndex = typeof body.hintIndex === 'number' ? body.hintIndex : -1;

    if (!challengeId || hintIndex < 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing or invalid challengeId and hintIndex.',
        },
        { status: 400 }
      );
    }

    const result = revealHint(session, challengeId, hintIndex);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 400 }
      );
    }

    // Get updated challenge state to return new potential points
    const challenges = getPlayerChallenges(session);
    const activeChallenge = challenges.find((c) => c.id === challengeId);

    return NextResponse.json({
      success: true,
      message: result.message,
      hintIndex,
      hintText: result.hintText,
      penaltyApplied: result.penaltyApplied,
      currentChallengePoints: activeChallenge?.currentPoints,
      totalScore: session.totalScore,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Internal error resolving hint decryption.',
      },
      { status: 500 }
    );
  }
}
