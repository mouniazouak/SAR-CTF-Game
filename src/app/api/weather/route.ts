import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_TIMEZONES = new Set(['UTC', 'America/Edmonton', 'Europe/Madrid']);

function isDate(value: string | null): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const latitude = Number(params.get('latitude'));
  const longitude = Number(params.get('longitude'));
  const startDate = params.get('start_date');
  const endDate = params.get('end_date');
  const timezone = params.get('timezone') || 'UTC';

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    return NextResponse.json({ success: false, message: 'Invalid latitude.' }, { status: 400 });
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return NextResponse.json({ success: false, message: 'Invalid longitude.' }, { status: 400 });
  }
  if (!isDate(startDate) || !isDate(endDate) || startDate > endDate) {
    return NextResponse.json({ success: false, message: 'Invalid date range.' }, { status: 400 });
  }
  if (!ALLOWED_TIMEZONES.has(timezone)) {
    return NextResponse.json({ success: false, message: 'Unsupported timezone.' }, { status: 400 });
  }

  const upstream = new URL('https://archive-api.open-meteo.com/v1/archive');
  upstream.searchParams.set('latitude', String(latitude));
  upstream.searchParams.set('longitude', String(longitude));
  upstream.searchParams.set('start_date', startDate);
  upstream.searchParams.set('end_date', endDate);
  upstream.searchParams.set('hourly', 'precipitation,temperature_2m,relative_humidity_2m,wind_speed_10m');
  upstream.searchParams.set('timezone', timezone);

  try {
    const response = await fetch(upstream, { next: { revalidate: 3600 } });
    if (!response.ok) {
      return NextResponse.json({ success: false, message: 'Open-Meteo request failed.' }, { status: 502 });
    }
    const weather = await response.json();
    return NextResponse.json({ success: true, source: 'Open-Meteo historical archive', weather });
  } catch {
    return NextResponse.json({ success: false, message: 'Weather service unavailable.' }, { status: 503 });
  }
}
