import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/server/gameState';

export async function GET(req: NextRequest) {
  const token = req.headers.get('x-session-token') || req.cookies.get('sar_session_token')?.value || undefined;
  const leaderboard = getLeaderboard(token);

  return NextResponse.json({
    success: true,
    leaderboard,
    updatedAt: new Date().toISOString(),
  });
}
