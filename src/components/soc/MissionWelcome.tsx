'use client';

import { ArrowRight, CloudRain, Lightbulb, MousePointerClick, Orbit, Radar, Satellite, ScanLine, Trophy } from 'lucide-react';
import { soundFX } from '@/lib/audio';

interface MissionWelcomeProps {
  onBegin: () => void;
}

// Monochrome landscape style: black, white and greys only. Radar images are monochrome landscapes by nature.
const STATS = [
  { icon: Radar, value: 'L-band', label: '24 cm radar, sees through clouds and night' },
  { icon: Orbit, value: '12 days', label: 'NISAR revisits the whole planet' },
  { icon: Satellite, value: '9 missions', label: 'From calibration to Earth response' },
];

const STEPS = [
  { icon: ScanLine, title: 'Read the briefing', text: 'Each mission starts with a real-world incident.' },
  { icon: MousePointerClick, title: 'Compare before / after', text: 'Swipe between two radar dates and click the anomaly.' },
  { icon: Lightbulb, title: 'Ask SARah or use a hint', text: 'The assistant explains the evidence, never the flag.' },
  { icon: Trophy, title: 'Earn the flag', text: 'Correct science unlocks the next mission.' },
];

const GALLERY = [
  { src: '/data/merja_zerga/before.png', title: 'Before', date: '25 Oct 2026', text: 'Merja Zerga lagoon, Morocco, end of the dry season.' },
  { src: '/data/merja_zerga/after.png', title: 'After', date: '6 Nov 2026', text: 'Two days after the first 22 mm of rain.' },
  { src: '/data/valencia/before.png', title: 'False alarm', date: '23 Oct 2026', text: 'Valencia: the dark strip is the airport runway, not water.' },
];

export function MissionWelcome({ onBegin }: MissionWelcomeProps) {
  const beginMission = () => {
    soundFX.playRadarPing();
    onBegin();
  };

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-neutral-300">
      {/* Navigation */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <Satellite className="h-5 w-5 text-white" strokeWidth={1.5} />
          <span className="text-xs font-medium uppercase tracking-[0.4em] text-white">Dancing with the SARs</span>
        </div>
        <nav className="hidden items-center gap-8 text-xs uppercase tracking-[0.25em] text-neutral-400 md:flex">
          <a href="#mission" className="hover:text-white">Mission</a>
          <a href="#data" className="hover:text-white">Real data</a>
          <a href="#how" className="hover:text-white">How it works</a>
          <button type="button" onClick={beginMission} className="border border-white px-4 py-2 text-white hover:bg-white hover:text-black">
            Play
          </button>
        </nav>
      </header>

      {/* Hero: full-width monochrome radar landscape */}
      <section className="relative mx-auto max-w-6xl px-6">
        <div className="relative overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/data/merja_zerga/after.png"
            alt="NISAR radar landscape of Merja Zerga, Morocco"
            className="h-[70vh] min-h-[420px] w-full object-cover grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12">
            <p className="text-[11px] uppercase tracking-[0.45em] text-neutral-400">NASA Space Apps 2026 · NISAR</p>
            <h1 className="mt-6 text-5xl font-light uppercase leading-[1.05] tracking-[0.12em] text-white sm:text-7xl">
              Read the
              <br />
              <span className="font-semibold">Earth&apos;s echo</span>
            </h1>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-neutral-300 sm:text-base">
              NISAR, the NASA-ISRO radar satellite, sees the Earth through clouds, smoke and darkness. Radar images are hard to
              read. In this game, you become an Earth detective: compare real radar images, find what changed, and explain why.
            </p>
            <button
              type="button"
              onClick={beginMission}
              className="group mt-9 inline-flex w-fit items-center gap-3 bg-white px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.3em] text-black hover:bg-neutral-200"
            >
              Begin mission
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
          <span className="absolute bottom-4 right-4 text-[10px] uppercase tracking-[0.3em] text-neutral-500">
            Real NISAR L-band image · Merja Zerga, Morocco
          </span>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="grid gap-px border-y border-neutral-800 bg-neutral-800 sm:grid-cols-3">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={value} className="bg-neutral-950 px-6 py-10 text-center">
              <Icon className="mx-auto h-7 w-7 text-neutral-400" strokeWidth={1.2} />
              <p className="mt-4 text-lg font-light uppercase tracking-[0.3em] text-white">{value}</p>
              <p className="mt-2 text-xs text-neutral-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="mx-auto max-w-6xl px-6 py-24">
        <p className="text-[11px] uppercase tracking-[0.45em] text-neutral-500">Our mission</p>
        <h2 className="mt-4 max-w-2xl text-3xl font-light uppercase tracking-[0.12em] text-white sm:text-4xl">
          Learn to read radar by investigating
        </h2>
        <p className="mt-6 max-w-2xl leading-relaxed text-neutral-400">
          NISAR maps the whole planet every 12 days, but very few people know how to read radar. Our game turns that skill into
          missions: floods, wetlands, fires and ground motion. Players learn the physics, not just the answer.
        </p>
      </section>

      {/* Real data gallery */}
      <section id="data" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="flex items-end justify-between border-b border-neutral-800 pb-4">
          <h2 className="text-xl font-light uppercase tracking-[0.3em] text-white">Before. After. Why?</h2>
          <p className="hidden items-center gap-2 text-xs text-neutral-500 sm:flex">
            <CloudRain className="h-4 w-4" />
            Radar shows what changed. Weather explains why.
          </p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {GALLERY.map(({ src, title, date, text }) => (
            <figure key={title}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`${title}, ${date}`} className="aspect-[4/3] w-full bg-black object-cover grayscale" />
              <figcaption className="mt-4">
                <p className="text-xs uppercase tracking-[0.35em] text-white">
                  {title} <span className="text-neutral-500">· {date}</span>
                </p>
                <p className="mt-2 text-sm text-neutral-500">{text}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="border-b border-neutral-800 pb-4 text-xl font-light uppercase tracking-[0.3em] text-white">
          One mission, four steps
        </h2>
        <div className="mt-8 grid gap-px bg-neutral-800 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="bg-neutral-950 p-6">
              <div className="flex items-center gap-3 text-neutral-500">
                <span className="text-2xl font-light text-white">0{i + 1}</span>
                <Icon className="h-5 w-5" strokeWidth={1.3} />
              </div>
              <p className="mt-5 text-sm uppercase tracking-[0.2em] text-white">{title}</p>
              <p className="mt-2 text-sm text-neutral-500">{text}</p>
            </div>
          ))}
        </div>
        <div className="mt-14 text-center">
          <button
            type="button"
            onClick={beginMission}
            className="group inline-flex items-center gap-3 border border-white px-8 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-white hover:text-black"
          >
            Begin mission
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-[11px] uppercase tracking-[0.2em] text-neutral-600 sm:flex-row sm:justify-between">
          <span>NASA Space Apps 2026 · Ben Guerir</span>
          <span>NISAR data: NASA/JPL-Caltech and ISRO, via ASF DAAC</span>
        </div>
      </footer>
    </main>
  );
}
