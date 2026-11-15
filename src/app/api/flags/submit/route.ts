import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateSession, submitFlag } from '@/lib/server/gameState';
import { LevelId } from '@/types/ctf';

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('x-session-token') || req.cookies.get('sar_session_token')?.value || undefined;
    const session = getOrCreateSession(token);

    const body = await req.json().catch(() => ({}));
    const challengeId = body.challengeId as LevelId;
    const flag = typeof body.flag === 'string' ? body.flag : '';

    if (!challengeId || !flag) {
      return NextResponse.json(
        {
          success: false,
          message: 'Malformed payload: challengeId and flag string are required.',
        },
        { status: 400 }
      );
    }

    const result = submitFlag(session, challengeId, flag);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          totalScore: session.totalScore,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      levelId: challengeId,
      pointsAwarded: result.pointsAwarded,
      totalScore: session.totalScore,
      nextLevelUnlocked: result.nextLevelUnlocked,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: 'Internal telemetry validation error.',
      },
      { status: 500 }
    );
  }
}
