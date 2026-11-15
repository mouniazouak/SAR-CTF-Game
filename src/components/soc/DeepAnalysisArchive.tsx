'use client';

import Image from 'next/image';
import { CheckCircle2, Database, ScanLine } from 'lucide-react';

export function DeepAnalysisArchive() {
  return (
    <section className="border-t border-cyan-900/70 bg-[#050b16] px-4 py-10 text-slate-200 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          Mission complete // deep analysis archive
        </div>
        <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">From HDF5 radar data to compatible evidence</h2>
        <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-300">
          These are the real processed NISAR L-band GCOV layers used in the investigation. The original HDF5 scenes were read, calibrated, converted to dB, aligned with compatible geometry, compared as before/after acquisitions, and rendered into these separate visual layers. The AI helps explain the evidence; it does not generate the satellite observations.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <AnalysisCaseStudy
            title="Valencia, Spain"
            subtitle="Airport runway false-water alarm"
            before="/data/valencia/before.png"
            after="/data/valencia/after.png"
            change="/data/valencia/change.png"
            beforeAlt="Real NISAR Valencia before scene"
            afterAlt="Real NISAR Valencia after scene"
            changeAlt="NISAR Valencia change layer"
            conclusion="The apparent water signal is not a flood: the smooth airport runway creates a dark radar response, and the low rainfall plus the change pattern do not support a large new-water event."
          />
          <AnalysisCaseStudy
            title="Merja Zerga, Morocco"
            subtitle="Wetland response after autumn rain"
            before="/data/merja_zerga/before.png"
            after="/data/merja_zerga/after.png"
            change="/data/merja_zerga/water.png"
            beforeAlt="Real NISAR Merja Zerga before scene"
            afterAlt="Real NISAR Merja Zerga after scene"
            changeAlt="NISAR Merja Zerga wetland classification layer"
            conclusion="Rain brightens wet soils while the lagoon keeps its open-water core. Multi-Otsu classification separates open water, wet lagoon or marsh, and land."
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-4 border-t border-cyan-950/80 pt-4 font-mono text-[10px] uppercase tracking-wider text-slate-500">
          <span className="flex items-center gap-2"><Database className="h-3.5 w-3.5 text-cyan-400" /> NISAR L-band GCOV</span>
          <span className="flex items-center gap-2"><ScanLine className="h-3.5 w-3.5 text-emerald-400" /> NASA/JPL-Caltech + ISRO</span>
          <span>Distributed by ASF DAAC</span>
        </div>
      </div>
    </section>
  );
}

interface AnalysisCaseStudyProps {
  title: string;
  subtitle: string;
  before: string;
  after: string;
  change: string;
  beforeAlt: string;
  afterAlt: string;
  changeAlt: string;
  conclusion: string;
}

function AnalysisCaseStudy({ title, subtitle, before, after, change, beforeAlt, afterAlt, changeAlt, conclusion }: AnalysisCaseStudyProps) {
  return (
    <article className="rounded-xl border border-cyan-900/70 bg-[#081525] p-4 shadow-lg">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-cyan-300">{subtitle}</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <figure>
          <Image src={before} alt={beforeAlt} width={1728} height={1728} className="aspect-square w-full rounded border border-slate-700 object-cover" />
          <figcaption className="mt-1 text-center font-mono text-[9px] uppercase text-slate-500">Before</figcaption>
        </figure>
        <figure>
          <Image src={after} alt={afterAlt} width={1728} height={1728} className="aspect-square w-full rounded border border-slate-700 object-cover" />
          <figcaption className="mt-1 text-center font-mono text-[9px] uppercase text-slate-500">After</figcaption>
        </figure>
        <figure>
          <Image src={change} alt={changeAlt} width={1728} height={1728} className="aspect-square w-full rounded border border-cyan-700/70 object-cover" />
          <figcaption className="mt-1 text-center font-mono text-[9px] uppercase text-cyan-300">Analysis</figcaption>
        </figure>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-slate-300">{conclusion}</p>
    </article>
  );
}
