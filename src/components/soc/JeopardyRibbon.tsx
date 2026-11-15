'use client';

import React from 'react';
import { Challenge, LevelId } from '@/types/ctf';
import {
  Lock,
  CheckCircle2,
  Crosshair,
  Flame,
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
        return <Crosshair className="w-4 h-4" />;
      case 'level-2':
        return <Flame className="w-4 h-4" />;
      case 'level-3':
        return <Activity className="w-4 h-4" />;
      case 'level-4':
      case 'level-5':
      case 'level-6':
      case 'level-7':
      case 'level-8':
        return <Crosshair className="w-4 h-4" />;
      default:
        return <Crosshair className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Tutorial':
        return 'dark:text-sky-300 dark:bg-sky-950/70 dark:border-sky-800/80 text-sky-800 bg-sky-100 border-sky-300';
      case 'Novice':
        return 'dark:text-emerald-300 dark:bg-emerald-950/70 dark:border-emerald-800/80 text-emerald-800 bg-emerald-100 border-emerald-300';
      case 'Advanced':
        return 'dark:text-amber-300 dark:bg-amber-950/70 dark:border-amber-800/80 text-amber-900 bg-amber-100 border-amber-300';
      case 'Expert':
        return 'dark:text-rose-300 dark:bg-rose-950/70 dark:border-rose-800/80 text-rose-800 bg-rose-100 border-rose-300';
      default:
        return 'dark:text-slate-400 dark:bg-slate-900 dark:border-slate-700 text-slate-700 bg-slate-100 border-slate-300';
    }
  };

  return (
    <div className="w-full border-b transition-colors duration-300 px-4 py-3 dark:bg-[#080f1d] dark:border-cyan-950/80 bg-slate-100/90 border-slate-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full dark:bg-cyan-400 bg-sky-600 animate-ping" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider dark:text-cyan-300 text-slate-800">
              CTF MISSION MATRIX &bull; PROGRESSIVE ORBITAL PHASES
            </h2>
          </div>
          <span className="text-[11px] font-mono dark:text-slate-400 text-slate-500 hidden sm:inline">
            Solve each orbital pass to decrypt subsequent targets
          </span>
        </div>

        {/* Progressive mission cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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
                className={`group relative text-left p-3 rounded-lg border transition-all duration-200 overflow-hidden cursor-pointer ${
                  isSelected
                    ? 'dark:bg-gradient-to-br dark:from-cyan-950/90 dark:via-[#0d1e33] dark:to-[#071322] dark:border-cyan-400 dark:shadow-[0_0_20px_rgba(6,182,212,0.25)] dark:ring-1 dark:ring-cyan-400/50 bg-white border-sky-500 shadow-md ring-2 ring-sky-400/40'
                    : isSolved
                    ? 'dark:bg-[#091522] dark:border-emerald-500/40 dark:hover:border-emerald-400 bg-emerald-50/70 border-emerald-300 hover:border-emerald-500 shadow-sm'
                    : isLocked
                    ? 'dark:bg-[#060a12]/70 dark:border-slate-900 dark:text-slate-600 bg-slate-200/50 border-slate-300 text-slate-400 cursor-not-allowed opacity-60'
                    : 'dark:bg-[#0b1424] dark:border-slate-800 dark:hover:border-cyan-600/70 dark:hover:bg-[#0e1b2f] bg-white border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 shadow-sm'
                }`}
              >
                {/* Active Indicator Top Edge */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1 dark:bg-gradient-to-r dark:from-cyan-400 dark:via-emerald-400 dark:to-cyan-400 dark:shadow-[0_0_8px_#00e5ff] bg-gradient-to-r from-sky-500 via-blue-600 to-sky-500" />
                )}

                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`p-1 rounded ${
                        isSelected
                          ? 'dark:bg-cyan-500/20 dark:text-cyan-300 bg-sky-100 text-sky-700'
                          : isSolved
                          ? 'dark:bg-emerald-500/20 dark:text-emerald-400 bg-emerald-100 text-emerald-700'
                          : isLocked
                          ? 'dark:bg-slate-900 dark:text-slate-600 bg-slate-200 text-slate-400'
                          : 'dark:bg-slate-800 dark:text-slate-400 dark:group-hover:text-cyan-300 bg-slate-100 text-slate-600 group-hover:text-sky-700'
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
                      <span className="flex items-center gap-1 text-[11px] font-mono font-bold dark:text-emerald-400 dark:bg-emerald-950/80 dark:border-emerald-500/50 text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        SOLVED
                      </span>
                    ) : isLocked ? (
                      <span className="flex items-center gap-1 text-[11px] font-mono dark:text-slate-500 dark:bg-slate-950 dark:border-slate-800 text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                        <Lock className="w-3 h-3" />
                        LOCKED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-mono font-bold dark:text-cyan-300 dark:bg-cyan-950/60 dark:border-cyan-600/40 text-sky-800 bg-sky-100 px-2 py-0.5 rounded border border-sky-300">
                        <Sparkles className="w-3 h-3 text-sky-600 dark:text-cyan-400" />
                        ACTIVE
                      </span>
                    )}
                  </div>
                </div>

                {/* Level Title & Codename */}
                <div className="mt-1">
                  <div className="text-[10px] font-mono font-semibold tracking-wider dark:text-cyan-400/90 text-sky-700">
                    {c.codename}
                  </div>
                  <h3
                    className={`text-xs sm:text-sm font-semibold truncate ${
                      isSelected
                        ? 'dark:text-white text-slate-900'
                        : isSolved
                        ? 'dark:text-slate-200 text-slate-800'
                        : isLocked
                        ? 'dark:text-slate-600 text-slate-400'
                        : 'dark:text-slate-300 dark:group-hover:text-white text-slate-700 group-hover:text-slate-900'
                    }`}
                  >
                    {c.title}
                  </h3>
                </div>

                {/* Category & Points Footer */}
                <div className="mt-2 pt-2 border-t flex items-center justify-between text-[11px] font-mono dark:border-slate-800/80 border-slate-200">
                  <span className="dark:text-slate-400 text-slate-500 truncate max-w-[110px]">{c.category}</span>
                  <div className="flex items-center gap-1">
                    <span className="dark:text-slate-500 text-slate-400">VAL:</span>
                    <span
                      className={`font-bold ${
                        isSolved
                          ? 'dark:text-emerald-400 text-emerald-700'
                          : isSelected
                          ? 'dark:text-cyan-300 text-sky-700'
                          : 'dark:text-amber-400 text-amber-700'
                      }`}
                    >
                      {c.currentPoints}
                    </span>
                    <span className="text-[9px] dark:text-slate-500 text-slate-400">PTS</span>
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
