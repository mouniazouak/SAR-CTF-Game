import { NextRequest, NextResponse } from 'next/server';
import { getLevelDefinition } from '@/lib/server/levelCatalog';
import { verifyLevelSubmission } from '@/lib/server/verifyLevel';

interface VerifyRequestBody {
  levelId?: unknown;
  clickedLat?: unknown;
  clickedLng?: unknown;
  selectedDriverId?: unknown;
  selectedRecoveryId?: unknown;
  hintsUsed?: unknown;
}

function badRequest(message: string) {
  return NextResponse.json({ success: false, message }, { status: 400 });
}

export async function POST(req: NextRequest) {
  let body: VerifyRequestBody;

  try {
    body = (await req.json()) as VerifyRequestBody;
  } catch {
    return badRequest('Malformed JSON payload.');
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return badRequest('Malformed payload: expected a JSON object.');
  }

  const levelId = typeof body.levelId === 'string' ? body.levelId : '';
  const level = getLevelDefinition(levelId);

  if (!level) {
    return badRequest('Unknown levelId. Expected level-1 through level-7.');
  }

  const clickedLat = body.clickedLat;
  const clickedLng = body.clickedLng;

  if (
    typeof clickedLat !== 'number' ||
    typeof clickedLng !== 'number' ||
    !Number.isFinite(clickedLat) ||
    !Number.isFinite(clickedLng) ||
    clickedLat < -90 ||
    clickedLat > 90 ||
    clickedLng < -180 ||
    clickedLng > 180
  ) {
    return badRequest(
      'clickedLat and clickedLng must be finite WGS84 coordinates (lat -90..90, lng -180..180).'
    );
  }

  const selectedDriverId =
    typeof body.selectedDriverId === 'string' ? body.selectedDriverId.trim() : '';
  const selectedRecoveryId =
    typeof body.selectedRecoveryId === 'string' ? body.selectedRecoveryId.trim() : '';

  if (!selectedDriverId || !selectedRecoveryId) {
    return badRequest('selectedDriverId and selectedRecoveryId are required.');
  }

  const rawHintsUsed = body.hintsUsed ?? 0;

  if (
    typeof rawHintsUsed !== 'number' ||
    !Number.isInteger(rawHintsUsed) ||
    rawHintsUsed < 0 ||
    rawHintsUsed > level.hints.length
  ) {
    return badRequest(`hintsUsed must be an integer between 0 and ${level.hints.length}.`);
  }

  try {
    const result = verifyLevelSubmission({
      levelId: level.id,
      clickedLat,
      clickedLng,
      selectedDriverId,
      selectedRecoveryId,
      hintsUsed: rawHintsUsed,
    });

    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Internal telemetry validation error.' },
      { status: 500 }
    );
  }
}
