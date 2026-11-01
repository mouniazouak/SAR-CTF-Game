import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateSession } from '@/lib/server/gameState';

export async function GET(req: NextRequest) {
  const token = req.headers.get('x-session-token') || req.cookies.get('sar_session_token')?.value || undefined;
  const alias = req.headers.get('x-player-alias') || undefined;

  const session = getOrCreateSession(token, alias);

  const res = NextResponse.json({
    success: true,
    session: {
      alias: session.alias,
      token: session.token,
      totalScore: session.totalScore,
      solvedLevels: session.solvedLevels,
      unlockedHints: session.unlockedHints,
      startedAt: session.startedAt,
    },
  });

  // Set persistent cookie for frictionless hackathon experience
  res.cookies.set('sar_session_token', session.token, {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return res;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = body.token || req.headers.get('x-session-token') || req.cookies.get('sar_session_token')?.value || undefined;
    const alias = body.alias || req.headers.get('x-player-alias') || undefined;

    const session = getOrCreateSession(token, alias);

    const res = NextResponse.json({
      success: true,
      session: {
        alias: session.alias,
        token: session.token,
        totalScore: session.totalScore,
        solvedLevels: session.solvedLevels,
        unlockedHints: session.unlockedHints,
        startedAt: session.startedAt,
      },
    });

    res.cookies.set('sar_session_token', session.token, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Session initialization failed' }, { status: 500 });
  }
}
