'use client';

import { ArrowRight, Crosshair, LockKeyhole, Radio, Satellite, ScanLine, Sparkles } from 'lucide-react';
import { soundFX } from '@/lib/audio';

interface MissionWelcomeProps {
  onBegin: () => void;
}

export function MissionWelcome({ onBegin }: MissionWelcomeProps) {
  const beginMission = () => {
    soundFX.playRadarPing();
    onBegin();
  };

  return (
    <main className="min-h-screen cosmic-space-bg overflow-hidden px-5 py-6 text-slate-200 sm:px-10 sm:py-8">
      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col overflow-hidden rounded-2xl border border-cyan-900/70 bg-[#030914]/90 shadow-[0_0_80px_rgba(6,182,212,0.08)]">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(56,189,248,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.08)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="pointer-events-none absolute -right-40 -top-32 h-[520px] w-[520px] rounded-full border border-cyan-700/30 shadow-[0_0_80px_rgba(6,182,212,0.08)]" />
        <div className="pointer-events-none absolute -right-24 -top-16 h-[360px] w-[360px] rounded-full border border-cyan-700/20" />

        <header className="relative flex items-center justify-between border-b border-cyan-950/80 px-6 py-5 sm:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-500/60 bg-cyan-950/60 text-cyan-300">
              <Satellite className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-cyan-300">Orbital briefing</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">NISAR Earth Observatory</p>
            </div>
          </div>
          <div className="hidden rounded-full border border-cyan-800/80 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300 sm:block">
            L-band // all-weather // all-hours
          </div>
        </header>

        <section className="relative flex flex-1 flex-col justify-center px-6 py-12 sm:px-14 lg:max-w-4xl lg:py-16">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.32em] text-cyan-400">NASA Space Apps // Earth surface incident explorer</p>
          <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.95] tracking-[-0.05em] text-white sm:text-7xl">
            Earth is not a still image.
          </h1>
          <p className="mt-6 max-w-2xl text-xl font-semibold leading-relaxed text-cyan-100 sm:text-2xl">
            It is a living canvas, rewritten by water, fire, ice, and human hands.
          </p>

          <div className="mt-8 max-w-3xl space-y-4 text-base leading-relaxed text-slate-300 sm:text-lg">
            <p>
              Every few days, NISAR sweeps the planet with L-band radar. It does not need daylight, and it does not blink when clouds close the sky. It listens to the way the surface answers.
            </p>
            <p>
              Floods become mirrors. Forests lose their coherence. Faults breathe in centimeters. Each answer is a clue, and every clue redraws the map.
            </p>
            <p>
              In this game, you investigate nine orbital incidents. Read the signatures, protect the evidence chain, use hints carefully, and submit the correct flag to unlock the next mission.
            </p>
          </div>

          <div className="mt-8 border-l-2 border-cyan-400 px-4 font-mono text-xs uppercase tracking-[0.18em] text-cyan-300 sm:text-sm">
            “The map is not the territory. The echo is.”
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={beginMission}
              className="group inline-flex items-center gap-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-4 font-mono text-sm font-bold uppercase tracking-[0.2em] text-white shadow-[0_0_28px_rgba(6,182,212,0.35)] transition hover:from-cyan-400 hover:to-blue-500"
            >
              <Crosshair className="h-5 w-5" />
              Begin mission
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">First light: Level 0 calibration</span>
          </div>
        </section>

        <footer className="relative grid gap-4 border-t border-cyan-950/80 px-6 py-5 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500 sm:grid-cols-3 sm:px-10">
          <span className="flex items-center gap-2"><ScanLine className="h-3.5 w-3.5 text-cyan-400" /> Level 0 calibration → Earth response center</span>
          <span className="flex items-center gap-2"><Radio className="h-3.5 w-3.5 text-emerald-400" /> NISAR L-band + Sentinel-1</span>
          <span className="flex items-center gap-2 sm:justify-end"><LockKeyhole className="h-3.5 w-3.5 text-amber-300" /> Mission ready // awaiting input</span>
        </footer>
        <Sparkles className="pointer-events-none absolute right-10 top-12 h-4 w-4 animate-pulse text-cyan-300" />
      </div>
    </main>
  );
}
