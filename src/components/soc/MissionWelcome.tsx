'use client';

import { ArrowRight, Crosshair, LockKeyhole, Radio, Satellite, ScanLine, Sparkles, type LucideIcon } from 'lucide-react';
import { soundFX } from '@/lib/audio';

interface MissionWelcomeProps { onBegin: () => void; }

const FEATURES: Array<{ number: string; Icon: LucideIcon; title: string; text: string }> = [
  { number: '01', Icon: ScanLine, title: 'Study the signal', text: 'Read the radar return, the map context, and the mission clue.' },
  { number: '02', Icon: Radio, title: 'Follow the evidence', text: 'Compare scenes, metadata, coherence, and change layers.' },
  { number: '03', Icon: LockKeyhole, title: 'Authenticate the mission', text: 'Submit the correct flag and unlock the next orbital incident.' },
];

export function MissionWelcome({ onBegin }: MissionWelcomeProps) {
  const beginMission = () => { soundFX.playRadarPing(); onBegin(); };

  return (
    <main className="h-screen max-h-screen overflow-hidden bg-black text-white selection:bg-amber-300/30">
      <div className="relative flex h-full flex-col overflow-hidden bg-black">
        <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(1px_1px_at_12%_22%,#fff,transparent),radial-gradient(1px_1px_at_28%_68%,#fbbf24,transparent),radial-gradient(1px_1px_at_73%_18%,#93c5fd,transparent),radial-gradient(1px_1px_at_88%_76%,#fff,transparent),linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] [background-size:auto,auto,auto,auto,48px_48px,48px_48px]" />
        <div className="pointer-events-none absolute left-[-15%] top-[8%] h-[55vh] w-[55vh] rounded-full border border-cyan-900/30 shadow-[0_0_100px_rgba(6,182,212,0.08)]" />
        <div className="pointer-events-none absolute right-[-12%] top-[22%] h-[75vh] w-[75vh] rounded-full border border-cyan-800/20" />

        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/70 bg-slate-900/80 shadow-[0_0_20px_rgba(226,232,240,0.14)]"><Satellite className="h-5 w-5 text-slate-100" /></div>
            <div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-slate-100">NASA Space Apps</p><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-amber-300/70">NISAR Earth Observatory</p></div>
          </div>
          <div className="hidden items-center gap-4 rounded-full border border-cyan-900/70 bg-slate-950/45 px-5 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400 shadow-[0_0_24px_rgba(34,211,238,0.08)] lg:flex">
            <span className="text-cyan-300">Mission control</span><span className="text-slate-700">{'//'}</span><span>Orbit 747 km</span><span className="text-slate-700">{'//'}</span><span className="text-fuchsia-300">L-band 1.25 GHz</span>
          </div>
          <div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-amber-200 sm:flex"><span className="h-2 w-2 animate-pulse rounded-full bg-amber-300" /> Orbital link active</div>
        </header>

        <section className="relative z-10 mx-auto grid min-h-0 w-full flex-1 items-center gap-5 overflow-hidden px-5 py-2 sm:px-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.38em] text-amber-300">Earth surface incident explorer</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-light leading-[0.9] tracking-[-0.06em] text-white sm:text-6xl lg:text-[5.7rem]">Dancing<br /><span className="bg-gradient-to-r from-white via-slate-300 to-amber-300 bg-clip-text font-semibold text-transparent">with the SARs</span></h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">Read the surface through radar. Investigate water, fire, ice, faults, and mission threats through a sequence of orbital forensic missions.</p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button type="button" onClick={beginMission} className="group inline-flex items-center gap-3 rounded-full border border-amber-100 bg-amber-300 px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.16em] text-slate-950 shadow-[0_0_32px_rgba(245,158,11,0.28)] transition hover:bg-amber-200"><Crosshair className="h-4 w-4" /> Begin mission <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></button>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">First light // Level 0 calibration</span>
            </div>
            <div className="mt-7 grid max-w-xl grid-cols-3 border-y border-slate-800/80 py-3 font-mono">
              <div><p className="text-lg text-white">09</p><p className="mt-1 text-[9px] uppercase tracking-widest text-slate-500">Missions</p></div>
              <div className="border-l border-slate-800 pl-4"><p className="text-lg text-white">L-BAND</p><p className="mt-1 text-[9px] uppercase tracking-widest text-slate-500">Radar signal</p></div>
              <div className="border-l border-slate-800 pl-4"><p className="text-lg text-white">24 cm</p><p className="mt-1 text-[9px] uppercase tracking-widest text-slate-500">Wavelength</p></div>
            </div>
          </div>

          <div className="relative flex min-h-[330px] items-center justify-center lg:min-h-[470px]">
            <div role="img" aria-label="Earth surrounded by satellites and orbital debris" className="absolute inset-0 bg-contain bg-center bg-no-repeat drop-shadow-[0_0_45px_rgba(34,211,238,0.35)]" style={{ backgroundImage: "url('/assets/earth-orbit-hero.png')" }} />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[2px] w-[72%] origin-left -translate-y-1/2 rotate-[-26deg] bg-gradient-to-r from-transparent via-amber-200/70 to-transparent shadow-[0_0_14px_#fbbf24] animate-pulse" />
            <div className="absolute left-[8%] top-[10%] rounded border border-slate-300/35 bg-slate-950/75 px-3 py-2 font-mono text-[8px] uppercase leading-relaxed tracking-[0.16em] text-slate-400 backdrop-blur-sm"><span className="text-amber-200">Live SAR pass</span><br />HH polarization<br />Descending orbit</div>
            <div className="absolute bottom-[10%] right-[7%] rounded border border-amber-300/35 bg-slate-950/75 px-3 py-2 font-mono text-[8px] uppercase leading-relaxed tracking-[0.16em] text-slate-400 backdrop-blur-sm"><span className="text-amber-200">Signal locked</span><br />1.25 GHz // 24 cm<br />Coherence 0.98</div>
            <Sparkles className="absolute right-[18%] top-[13%] h-4 w-4 animate-pulse text-amber-200" />
          </div>
        </section>

        <section className="relative z-10 shrink-0 border-t border-slate-800/80 bg-black px-5 py-4 sm:px-10">
          <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-3">
              {FEATURES.map(({ number, Icon, title, text }) => <div key={number} className="flex gap-3 border-l border-slate-700 pl-3"><Icon className="mt-1 h-5 w-5 shrink-0 text-amber-200" /><div><p className="font-mono text-[9px] tracking-[0.25em] text-slate-400">{number}</p><h2 className="mt-1 text-base font-light text-white">{title}</h2><p className="mt-1 max-w-xs text-[11px] leading-relaxed text-slate-500">{text}</p></div></div>)}
          </div>
        </section>
      </div>
    </main>
  );
}
