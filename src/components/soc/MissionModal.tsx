'use client';

import React, { useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, Crosshair, Info, Satellite, X } from 'lucide-react';
import type { Challenge, LevelId } from '@/types/ctf';
import { LEVEL_EXPLANATIONS } from '@/lib/level-explanations';

interface MissionModalProps { mode: 'how-to-play' | 'level-explanation'; challenge?: Challenge; levelId?: LevelId; onClose: () => void; }

const TOUR_STEPS = [
  { title: 'Switch sensor views', text: 'Use the sensor controls to switch between radar layers and understand what each view measures.' },
  { title: 'Read the incident briefing', text: 'Start with the briefing panel. It explains the location, scientific context, and forensic objective.' },
  { title: 'Pin a pixel for analysis', text: 'Click anywhere on the map to lock a forensic sample. Review its coordinates, backscatter, coherence, displacement, and surface class.' },
  { title: 'Open the field guide', text: 'Use the field guide to understand the SAR physics, clues, and evidence required for the level.' },
  { title: 'Submit the verification flag', text: 'Enter the exact flag. A correct answer unlocks the next level and opens its explanation automatically.' },
];

export function MissionModal({ mode, challenge, levelId, onClose }: MissionModalProps) {
  const explanation = levelId ? LEVEL_EXPLANATIONS[levelId] : undefined;
  const [tutorialStep, setTutorialStep] = useState(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const tourStep = TOUR_STEPS[tutorialStep];
  const tourPosition = [
    'items-start justify-end p-8 pt-24',
    'items-center justify-center p-4',
    'items-end justify-end p-8 pb-24',
    'items-end justify-start p-8 pb-24',
    'items-end justify-start p-8 pb-10',
  ][tutorialStep];
  const modalPosition = mode === 'how-to-play' ? tourPosition : 'items-center justify-center p-4';

  return (
    <div className={`fixed inset-0 z-[70] flex bg-slate-950/45 backdrop-blur-[2px] max-sm:items-center max-sm:justify-center max-sm:p-4 ${modalPosition}`} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="mission-modal-title" className={`flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-2xl border shadow-[0_0_60px_rgba(6,182,212,0.2)] dark:border-cyan-600/70 dark:bg-[#081525] dark:text-slate-100 border-sky-300 bg-white text-slate-900 ${mode === 'how-to-play' ? 'max-w-md' : 'max-w-2xl'}`}>
        <header className="flex items-start justify-between gap-4 border-b px-5 py-4 dark:border-cyan-950/80 border-slate-200">
          <div className="flex items-start gap-3">
            <div className="rounded-lg border p-2 dark:border-cyan-700/70 dark:bg-cyan-950/60 dark:text-cyan-300 border-sky-300 bg-sky-50 text-sky-700">{mode === 'how-to-play' ? <BookOpen className="h-5 w-5" /> : <Satellite className="h-5 w-5" />}</div>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] dark:text-cyan-400 text-sky-700">{mode === 'how-to-play' ? `Interface tour // ${tutorialStep + 1} of ${TOUR_STEPS.length}` : `Next mission briefing${challenge ? ` // Level ${challenge.levelNumber}` : ''}`}</p>
              <h2 id="mission-modal-title" className="mt-1 text-xl font-bold dark:text-white text-slate-900">{mode === 'how-to-play' ? tourStep.title : challenge?.title || 'Briefing unavailable'}</h2>
              {mode === 'level-explanation' && challenge && <p className="mt-1 font-mono text-xs dark:text-slate-400 text-slate-500">{challenge.codename}</p>}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 dark:hover:bg-slate-800 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </header>

        {mode === 'how-to-play' ? (
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 text-sm leading-relaxed dark:text-slate-300 text-slate-700">
            <p>{tourStep.text}</p>
            {tutorialStep === 1 && <div className="mt-4 rounded-lg border p-3 dark:border-cyan-800/60 dark:bg-cyan-950/20 border-sky-200 bg-sky-50"><p className="font-mono text-[10px] font-bold uppercase tracking-wider dark:text-cyan-300 text-sky-700">Level 0 calibration target</p><p className="mt-2 text-xs leading-relaxed">The briefing is on the left and the radar map is on the right. Center the map on Rosamond Dry Lake, California: <strong>34.8722°N, -118.1564°W</strong>. Look for one bright point near <strong>+24.8 dB</strong>, coherence <strong>0.98</strong>, and displacement <strong>0 cm</strong>.</p></div>}
            {tutorialStep === 4 && <div className="mt-4 rounded-lg border p-3 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-200 border-emerald-200 bg-emerald-50 text-emerald-900"><strong>Mission flow:</strong> analyze → submit the flag → unlock the next level → read its briefing → continue.</div>}
            {tutorialStep === 2 && <p className="mt-4 flex items-start gap-2 rounded-lg border p-3 text-xs dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-200 border-amber-200 bg-amber-50 text-amber-900"><Info className="mt-0.5 h-4 w-4 shrink-0" /> Click the map to sample a point. Hints are optional, but each revealed hint reduces your score.</p>}
          </div>
        ) : (
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 text-sm">
            <div className="flex items-start gap-2 rounded-lg border p-3 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-200 border-emerald-200 bg-emerald-50 text-emerald-900"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> Mission authenticated. The next mission is now available.</div>
            {explanation && <div className="grid gap-4"><section><h3 className="font-semibold dark:text-cyan-300 text-sky-700">Objective</h3><p className="mt-1 leading-relaxed dark:text-slate-300 text-slate-700">{explanation.objective}</p></section><section><h3 className="font-semibold dark:text-cyan-300 text-sky-700">Scientific concept</h3><p className="mt-1 leading-relaxed dark:text-slate-300 text-slate-700">{explanation.science}</p></section><section><h3 className="font-semibold dark:text-cyan-300 text-sky-700">Analysis steps</h3><ol className="mt-2 space-y-2 dark:text-slate-300 text-slate-700">{explanation.steps.map((step, index) => <li key={step} className="flex gap-2 leading-relaxed"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-600/20 font-mono text-[10px] font-bold dark:text-cyan-300 text-sky-700">{index + 1}</span><span>{step}</span></li>)}</ol></section><section><h3 className="font-semibold dark:text-cyan-300 text-sky-700">Expected evidence</h3><p className="mt-1 leading-relaxed dark:text-slate-300 text-slate-700">{explanation.evidence}</p></section><section><h3 className="font-semibold dark:text-cyan-300 text-sky-700">What you learn</h3><p className="mt-1 leading-relaxed dark:text-slate-300 text-slate-700">{explanation.result}</p></section></div>}
            <div className="flex items-center gap-2 border-t pt-4 font-mono text-xs dark:border-slate-800 dark:text-cyan-300 border-slate-200 text-sky-700"><Crosshair className="h-4 w-4" /> Close this window to start the next mission.</div>
          </div>
        )}

        <footer className="flex items-center justify-between border-t px-5 py-4 dark:border-cyan-950/80 border-slate-200">
          {mode === 'how-to-play' ? <><button type="button" onClick={onClose} className="font-mono text-[10px] font-bold uppercase tracking-wider dark:text-slate-400 dark:hover:text-white text-slate-500 hover:text-slate-900">Skip</button><div className="flex items-center gap-2">{tutorialStep > 0 && <button type="button" onClick={() => setTutorialStep((step) => step - 1)} className="rounded-lg border px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 border-slate-300 text-slate-700 hover:bg-slate-100">← Prev</button>}<button type="button" onClick={() => tutorialStep < TOUR_STEPS.length - 1 ? setTutorialStep((step) => step + 1) : onClose()} className="rounded-lg bg-cyan-400 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_18px_rgba(34,211,238,0.35)] transition hover:bg-cyan-300">{tutorialStep < TOUR_STEPS.length - 1 ? 'Next →' : 'Start Level 0'}</button></div></> : <div className="ml-auto"><button type="button" onClick={onClose} className="rounded-lg bg-gradient-to-r from-cyan-600 to-blue-700 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:from-cyan-500 hover:to-blue-600">Start mission</button></div>}
        </footer>
      </section>
    </div>
  );
}
