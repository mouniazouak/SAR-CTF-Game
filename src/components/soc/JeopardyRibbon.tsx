'use client';

import React from 'react';
import { Challenge, LevelId } from '@/types/ctf';
import {
  Lock,
  CheckCircle2,
  Crosshair,
  Flame,
  Droplets,
  Activity,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { soundFX } from '@/lib/audio';

interface JeopardyRibbonProps {
  challenges: Challenge[];
  selectedLevelId: LevelId;
  onSelectChallenge: (id: LevelId) => void;
}

export function JeopardyRibbon({
  challenges,
  selectedLevelId,
  onSelectChallenge,
}: JeopardyRibbonProps) {
  const getLevelIcon = (id: LevelId) => {
    switch (id) {
      case 'level-0':
        return <Sliders className="w-4 h-4" />;
      case 'level-1':
        return <Droplets className="w-4 h-4" />;
      case 'level-2':
        return <Flame className="w-4 h-4" />;
      case 'level-3':
        return <Activity className="w-4 h-4" />;
      default:
        return <Crosshair className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Tutorial':
        return 'text-sky-400 bg-sky-950/70 border-sky-800/80';
      case 'Novice':
        return 'text-emerald-400 bg-emerald-950/70 border-emerald-800/80';
      case 'Advanced':
        return 'text-amber-400 bg-amber-950/70 border-amber-800/80';
      case 'Expert':
        return 'text-rose-400 bg-rose-950/70 border-rose-800/80';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-700';
    }
  };

  return (
    <div className="w-full bg-[#0a101d] border-b border-cyan-950/70 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
              CTF MISSION MATRIX &bull; PROGRESSIVE ORBITAL PHASES
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Solve level to unlock subsequent orbital pass
          </span>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {challenges.map((c) => {
            const isSelected = c.id === selectedLevelId;
            const isLocked = !c.unlocked;
            const isSolved = c.solved;

            return (
              <button
                key={c.id}
                disabled={isLocked}
                onClick={() => {
                  if (!isLocked) {
                    soundFX.playRadarPing();
                    onSelectChallenge(c.id);
                  }
                }}
                className={`group relative text-left p-3 rounded-lg border transition-all duration-200 overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-br from-cyan-950/90 via-[#0d1e33] to-[#071322] border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50'
                    : isSolved
                    ? 'bg-[#091522] border-emerald-500/40 hover:border-emerald-400 shadow-sm'
                    : isLocked
                    ? 'bg-[#060a12]/70 border-slate-900 text-slate-600 cursor-not-allowed opacity-60'
                    : 'bg-[#0b1424] border-slate-800 hover:border-cyan-600/70 hover:bg-[#0e1b2f]'
                }`}
              >
                {/* Active Indicator Top Edge */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 shadow-[0_0_8px_#00e5ff]" />
                )}

                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`p-1 rounded ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : isSolved
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isLocked
                          ? 'bg-slate-900 text-slate-600'
                          : 'bg-slate-800 text-slate-400 group-hover:text-cyan-300'
                      }`}
                    >
                      {getLevelIcon(c.id)}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase font-medium ${getDifficultyColor(
                        c.difficulty
                      )}`}
                    >
                      {c.difficulty}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  <div>
                    {isSolved ? (
                      <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/50">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        SOLVED
                      </span>
                    ) : isLocked ? (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        <Lock className="w-3 h-3" />
                        LOCKED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-600/40">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        ACTIVE
                      </span>
                    )}
                  </div>
                </div>

                {/* Level Title & Codename */}
                <div className="mt-1">
                  <div className="text-[10px] font-mono text-cyan-500/90 font-medium tracking-wider">
                    {c.codename}
                  </div>
                  <h3
                    className={`text-xs sm:text-sm font-semibold truncate ${
                      isSelected
                        ? 'text-white'
                        : isSolved
                        ? 'text-slate-200'
                        : isLocked
                        ? 'text-slate-600'
                        : 'text-slate-300 group-hover:text-white'
                    }`}
                  >
                    {c.title}
                  </h3>
                </div>

                {/* Category & Points Footer */}
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400 truncate max-w-[110px]">{c.category}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">VAL:</span>
                    <span
                      className={`font-bold ${
                        isSolved
                          ? 'text-emerald-400'
                          : isSelected
                          ? 'text-cyan-300'
                          : 'text-amber-400'
                      }`}
                    >
                      {c.currentPoints}
                    </span>
                    <span className="text-[9px] text-slate-500">PTS</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
