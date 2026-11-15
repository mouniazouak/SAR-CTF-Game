'use client';

import { useState } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import type { Challenge, ForensicSample } from '@/types/ctf';

interface GeminiForensicsAssistantProps {
  challenge: Challenge;
  sample: ForensicSample | null;
}

export function GeminiForensicsAssistant({ challenge, sample }: GeminiForensicsAssistantProps) {
  const [question, setQuestion] = useState('Que signifie cette signature SAR ?');
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const askGemini = async () => {
    if (!question.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          challenge: {
            title: challenge.title,
            codename: challenge.codename,
            category: challenge.category,
            targetLocation: challenge.targetLocation,
            scenarioBriefing: challenge.scenarioBriefing,
            forensicMission: challenge.forensicMission,
            samplingClue: challenge.targetAnomaly.samplingClue,
            satellite: challenge.satellite,
            sample: sample
              ? {
                  sigma0Db: sample.sigma0Db,
                  coherence: sample.coherence,
                  displacementCm: sample.displacementCm,
                  surfaceClass: sample.surfaceClass,
                }
              : undefined,
          },
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message || 'Gemini analysis unavailable.');
      setAnswer(payload.answer);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Gemini analysis unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border p-3 space-y-2 shadow-sm dark:bg-[#081525] dark:border-violet-800/60 bg-violet-50 border-violet-200">
      <div className="flex items-center gap-2 text-xs font-mono font-bold dark:text-violet-200 text-violet-900">
        <Bot className="w-3.5 h-3.5 dark:text-violet-300 text-violet-700" />
        <span>GEMINI FORENSICS ASSISTANT</span>
        <Sparkles className="w-3 h-3 ml-auto dark:text-amber-300 text-amber-600" />
      </div>
      <p className="text-[11px] leading-relaxed dark:text-slate-400 text-slate-600">
        Assistant pédagogique : il explique les preuves publiques sans donner le flag.
      </p>
      <textarea
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        maxLength={500}
        rows={2}
        className="w-full rounded-md border p-2 text-xs resize-none focus:outline-none focus:ring-2 dark:bg-[#050912] dark:border-violet-900 dark:text-violet-100 dark:focus:ring-violet-500/40 bg-white border-violet-200 text-slate-900 focus:ring-violet-200"
        aria-label="Question à Gemini"
      />
      <button
        type="button"
        onClick={askGemini}
        disabled={isLoading || !question.trim()}
        className="w-full flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-mono font-bold text-white bg-violet-700 hover:bg-violet-600 disabled:opacity-50 cursor-pointer"
      >
        <Send className="w-3.5 h-3.5" />
        {isLoading ? 'Analyse Gemini en cours...' : 'Demander une analyse'}
      </button>
      {answer && <div className="rounded-md border p-2.5 text-xs leading-relaxed whitespace-pre-wrap dark:bg-black/20 dark:border-violet-900 dark:text-slate-200 bg-white/80 border-violet-200 text-slate-800">{answer}</div>}
      {error && <div className="rounded-md border p-2.5 text-xs dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-200 bg-rose-50 border-rose-200 text-rose-800">{error}</div>}
    </div>
  );
}
