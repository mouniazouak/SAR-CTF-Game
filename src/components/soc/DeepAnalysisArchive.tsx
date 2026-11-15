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
          These are the real NISAR L-band GCOV layers used in the investigation. The two source scenes are displayed unchanged and in the same frame so they can be compared directly. The final panel is a separate derived analysis layer; it never replaces or edits the original images.
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
            observations={["The runway remains a smooth, dark radar surface in both source scenes.", "Only 0.1 mm of rain fell between acquisitions.", "The scenes use different viewing geometry, so brightness changes must not be treated as physical flooding."]}
            comparison="The derived layer highlights pixel differences caused by the two acquisitions. It does not show one connected, newly flooded area around the airport."
            conclusion="No flood: the dark feature is the airport runway, and the weather plus the comparison layer do not support a large new-water event."
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
            observations={["The lagoon open-water core remains visible in both source scenes.", "About 25 mm of rain fell before the second acquisition.", "The median backscatter change is only +0.8 dB, consistent with wetter soil rather than permanent conversion."]}
            comparison="The derived layer separates areas that became brighter or darker while preserving the stable open-water core. It is an analysis product, not a modified source photograph."
            conclusion="The rain changed wet-soil brightness, but the lagoon remains present. Multi-Otsu classification separates open water, wet low-backscatter areas, and land."
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
  observations: string[];
  comparison: string;
  conclusion: string;
}

function AnalysisCaseStudy({ title, subtitle, before, after, change, beforeAlt, afterAlt, changeAlt, observations, comparison, conclusion }: AnalysisCaseStudyProps) {
  return (
    <article className="rounded-xl border border-cyan-900/70 bg-[#081525] p-4 shadow-lg">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-cyan-300">{subtitle}</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <figure>
          <div className="aspect-square overflow-hidden rounded border border-slate-700 bg-black">
            <Image src={before} alt={beforeAlt} width={1728} height={1728} unoptimized className="h-full w-full object-contain" />
          </div>
          <figcaption className="mt-1 text-center font-mono text-[9px] uppercase text-slate-500">Original before</figcaption>
        </figure>
        <figure>
          <div className="aspect-square overflow-hidden rounded border border-slate-700 bg-black">
            <Image src={after} alt={afterAlt} width={1728} height={1728} unoptimized className="h-full w-full object-contain" />
          </div>
          <figcaption className="mt-1 text-center font-mono text-[9px] uppercase text-slate-500">Original after</figcaption>
        </figure>
        <figure>
          <div className="aspect-square overflow-hidden rounded border border-cyan-700/70 bg-black">
            <Image src={change} alt={changeAlt} width={1728} height={1728} unoptimized className="h-full w-full object-contain" />
          </div>
          <figcaption className="mt-1 text-center font-mono text-[9px] uppercase text-cyan-300">Derived comparison</figcaption>
        </figure>
      </div>
      <div className="mt-4 grid gap-3 border-t border-cyan-950/80 pt-4 text-xs sm:grid-cols-2">
        <section className="rounded-lg border border-slate-800 bg-[#050b16] p-3">
          <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-300">What the source images show</h4>
          <ul className="mt-2 space-y-1.5 leading-relaxed text-slate-300">
            {observations.map((observation) => <li key={observation} className="flex gap-2"><span className="text-cyan-400">•</span><span>{observation}</span></li>)}
          </ul>
        </section>
        <section className="rounded-lg border border-cyan-900/60 bg-cyan-950/20 p-3">
          <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-300">How to read the comparison</h4>
          <p className="mt-2 leading-relaxed text-slate-300">{comparison}</p>
        </section>
      </div>
      <div className="mt-3 rounded-lg border border-emerald-800/60 bg-emerald-950/20 p-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-300">Clear conclusion</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-200">{conclusion}</p>
      </div>
    </article>
  );
}
