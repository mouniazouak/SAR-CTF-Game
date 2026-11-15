import { NextResponse } from 'next/server';

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

interface PublicChallengeContext {
  title?: string;
  codename?: string;
  category?: string;
  scenarioBriefing?: string;
  forensicMission?: string;
  samplingClue?: string;
  targetLocation?: string;
  satellite?: {
    mission?: string;
    sensor?: string;
    polarization?: string;
    frequencyGhz?: number;
    wavelengthCm?: number;
  };
  sample?: {
    sigma0Db?: number;
    coherence?: number;
    displacementCm?: number;
    surfaceClass?: string;
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, message: 'Gemini is not configured. Add GEMINI_API_KEY to .env.local.' },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as {
      question?: unknown;
      challenge?: PublicChallengeContext;
    };
    const question = typeof body.question === 'string' ? body.question.trim() : '';
    if (!question || question.length > 500) {
      return NextResponse.json({ success: false, message: 'Question is required and must be under 500 characters.' }, { status: 400 });
    }

    const context = body.challenge || {};
    const prompt = [
      'You are the forensic assistant inside a NASA Space Apps SAR CTF game.',
      'Analyze only the public evidence below. Never invent or reveal a flag.',
      'Answer in clear English in 3 to 5 short sentences: interpretation, conclusion, and one next step.',
      'If the evidence is insufficient, say so clearly.',
      '',
      `Mission: ${context.title || 'Unknown'} / ${context.codename || 'Unknown'}`,
      `Category: ${context.category || 'Unknown'}`,
      `Location: ${context.targetLocation || 'Unknown'}`,
      `Satellite: ${JSON.stringify({ mission: context.satellite?.mission, sensor: context.satellite?.sensor, polarization: context.satellite?.polarization, frequencyGhz: context.satellite?.frequencyGhz })}`,
      `Briefing: ${context.scenarioBriefing || ''}`,
      `Objective: ${context.forensicMission || ''}`,
      `Clue: ${context.samplingClue || ''}`,
      `Public sample: ${JSON.stringify(context.sample || {})}`,
      '',
      `Player question: ${question}`,
    ].join('\n');

    const response = await fetch(`${GEMINI_ENDPOINT}/${process.env.GEMINI_MODEL || 'gemini-3.8-flash-lite'}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: 'You are a concise, careful SAR forensics tutor. Do not provide flags.' }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 260, candidateCount: 1 },
      }),
    });

    const payload = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      error?: { message?: string };
    };
    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: payload.error?.message || 'Gemini request failed.' },
        { status: 502 }
      );
    }

    const answer = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
    if (!answer) {
      return NextResponse.json({ success: false, message: 'Gemini returned an empty analysis.' }, { status: 502 });
    }

    return NextResponse.json({ success: true, answer });
  } catch {
    return NextResponse.json({ success: false, message: 'Unable to contact Gemini.' }, { status: 500 });
  }
}
