'use client';

import {
  ArrowRight,
  CloudRain,
  Crosshair,
  Lightbulb,
  MousePointerClick,
  Orbit,
  Radar,
  Satellite,
  ScanLine,
  Trophy,
} from 'lucide-react';
import { soundFX } from '@/lib/audio';

interface MissionWelcomeProps {
  onBegin: () => void;
}

const STATS = [
  { icon: Radar, value: 'L-BAND', label: '24 cm radar, sees through clouds and night' },
  { icon: Orbit, value: '12 DAYS', label: 'NISAR revisits the whole planet' },
  { icon: Satellite, value: '9 MISSIONS', label: 'From calibration to Earth response' },
];

const STEPS = [
  { icon: ScanLine, title: 'Read the briefing', text: 'Each mission starts with a real-world incident.' },
  { icon: MousePointerClick, title: 'Compare before / after', text: 'Swipe between two radar dates and click the anomaly.' },
  { icon: Lightbulb, title: 'Ask SARah or use a hint', text: 'The assistant explains the evidence, never the flag.' },
  { icon: Trophy, title: 'Earn the flag', text: 'Correct science unlocks the next mission.' },
];

function Wave({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M0 ${60 + i * 4} C 200 ${10 + i * 6}, 400 ${110 - i * 6}, 600 ${60 + i * 2} S 1000 ${10 + i * 6}, 1200 ${60 - i * 3}`}
          fill="none"
          stroke="rgba(56,189,248,0.35)"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

export function MissionWelcome({ onBegin }: MissionWelcomeProps) {
  const beginMission = () => {
    soundFX.playRadarPing();
    onBegin();
  };

  return (
    <main className="min-h-screen w-full cosmic-space-bg bg-[#03060d] text-slate-200">
      {/* Navigation */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-sky-400/60 text-sky-300">
            <Satellite className="h-5 w-5" />
          </div>
          <span className="text-sm font-black uppercase tracking-[0.3em] text-white">Dancing with the SARs</span>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <a href="#mission" className="hover:text-white">Mission</a>
          <a href="#data" className="hover:text-white">Real data</a>
          <a href="#how" className="hover:text-white">How it works</a>
          <button
            type="button"
            onClick={beginMission}
            className="rounded border border-sky-400/70 px-4 py-1.5 text-sky-200 hover:bg-sky-400/10"
          >
            Play
          </button>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-6 lg:grid-cols-2 lg:pt-12">
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-sky-400">NASA Space Apps 2026 · NISAR</p>
          <h1 className="mt-5 text-5xl font-black uppercase leading-[1.05] tracking-[0.06em] text-white sm:text-6xl">
            Read the
            <br />
            Earth&apos;s echo
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-slate-300">
            NISAR, the NASA-ISRO radar satellite, sees the Earth through clouds, smoke and darkness. But radar images are hard to
            read. In this game, you become an Earth detective: compare real radar images, find what changed, and explain why.
          </p>
          <button
            type="button"
            onClick={beginMission}
            className="group mt-8 inline-flex items-center gap-3 rounded-md bg-sky-500 px-7 py-3.5 text-sm font-bold uppercase tracking-[0.15em] text-white shadow-[0_0_30px_rgba(14,165,233,0.35)] transition hover:bg-sky-400"
          >
            <Crosshair className="h-5 w-5" />
            Begin mission
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* "Radar planet": real NISAR image of Merja Zerga inside a glowing sphere */}
        <div className="relative mx-auto aspect-square w-full max-w-md">
          <div className="absolute inset-0 rounded-full bg-sky-500/20 blur-3xl" />
          <div className="relative h-full w-full overflow-hidden rounded-full border border-sky-400/40 shadow-[0_0_80px_rgba(56,189,248,0.35)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/data/merja_zerga/after.png" alt="NISAR radar image of Merja Zerga, Morocco" className="h-full w-full scale-125 object-cover" />
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,transparent_35%,rgba(3,6,13,0.9)_75%)]" />
          </div>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-sky-400/40 bg-[#03060d]/80 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-sky-300">
            Real NISAR data · Merja Zerga, Morocco
          </span>
        </div>
      </section>

      {/* Stat cards */}
      <section className="relative">
        <Wave className="absolute inset-x-0 top-1/2 h-24 w-full -translate-y-1/2" />
        <div className="relative mx-auto grid max-w-6xl gap-5 px-6 sm:grid-cols-3">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={value} className="rounded-lg border border-sky-900/60 bg-[#071226]/90 px-6 py-8 text-center">
              <Icon className="mx-auto h-10 w-10 text-sky-400" strokeWidth={1.2} />
              <p className="mt-4 text-xl font-black uppercase tracking-[0.15em] text-white">{value}</p>
              <p className="mt-2 text-sm text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-sky-400">— Our mission</p>
          <h2 className="mt-3 text-4xl font-black uppercase tracking-[0.06em] text-white">Learn by investigating</h2>
          <p className="mt-5 max-w-md leading-relaxed text-slate-300">
            NISAR maps the whole planet every 12 days, but very few people know how to read radar. Our game turns that skill into
            missions: floods, wetlands, fires and ground motion. Players learn the physics, not just the answer.
          </p>
          <button
            type="button"
            onClick={beginMission}
            className="mt-7 rounded-md bg-sky-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.15em] text-white hover:bg-sky-400"
          >
            Start training
          </button>
        </div>
        <div className="relative overflow-hidden rounded-lg border border-sky-900/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/data/valencia/before.png" alt="NISAR radar image of Valencia, Spain" className="h-72 w-full object-cover" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/data/valencia/water.png" alt="" className="absolute inset-0 h-72 w-full object-cover" />
          <span className="absolute bottom-3 left-3 rounded bg-[#03060d]/80 px-3 py-1 text-xs text-slate-200">
            Valencia: the AI saw &quot;water&quot;… it was the airport runway
          </span>
        </div>
      </section>

      <Wave className="h-20 w-full" />

      {/* Real data */}
      <section id="data" className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-sky-400">— Real data</p>
        <h2 className="mt-3 text-4xl font-black uppercase tracking-[0.06em] text-white">Before. After. Why?</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            { src: '/data/merja_zerga/before.png', title: 'Before · 25 Oct 2026', text: 'Merja Zerga lagoon at the end of the dry season.' },
            { src: '/data/merja_zerga/after.png', title: 'After · 6 Nov 2026', text: 'Two days after the first 22 mm of rain.' },
            { src: '/data/merja_zerga/change.png', title: 'What changed', text: 'Red = brighter: wet soil reflects more radar.' },
          ].map(({ src, title, text }) => (
            <div key={title} className="overflow-hidden rounded-lg border border-sky-900/60 bg-[#071226]/90">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={title} className="h-48 w-full bg-black object-cover" />
              <div className="p-4">
                <p className="font-bold uppercase tracking-[0.1em] text-white">{title}</p>
                <p className="mt-1 text-sm text-slate-400">{text}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 flex items-center gap-2 text-sm text-slate-400">
          <CloudRain className="h-4 w-4 text-sky-400" />
          Radar shows what changed. Weather explains why.
        </p>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-sky-400">— How it works</p>
        <h2 className="mt-3 text-4xl font-black uppercase tracking-[0.06em] text-white">One mission, four steps</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="rounded-lg border border-sky-900/60 bg-[#071226]/90 p-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-sky-400">{i + 1}</span>
                <Icon className="h-6 w-6 text-sky-300" />
              </div>
              <p className="mt-4 font-bold text-white">{title}</p>
              <p className="mt-1 text-sm text-slate-400">{text}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={beginMission}
            className="group inline-flex items-center gap-3 rounded-md bg-sky-500 px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-white shadow-[0_0_30px_rgba(14,165,233,0.35)] hover:bg-sky-400"
          >
            Begin mission
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sky-950/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>NASA Space Apps Challenge 2026 · Ben Guerir · Dancing with the SARs</span>
          <span>NISAR data courtesy of NASA/JPL-Caltech and ISRO, distributed by ASF DAAC</span>
        </div>
      </footer>
    </main>
  );
}
