'use client';

import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '@/types/ctf';
import {
  Trophy,
  X,
  Medal,
  RefreshCw,
} from 'lucide-react';
import { soundFX } from '@/lib/audio';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
}

export function LeaderboardModal({ isOpen, onClose, token }: LeaderboardModalProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/leaderboard', {
        headers: { 'x-session-token': token },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.leaderboard)) {
        setEntries(data.leaderboard);
      }
    } catch (e) {
      // Fetch error fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-colors duration-300 dark:bg-[#091120] dark:border-cyan-500/50 dark:shadow-[0_0_40px_rgba(6,182,212,0.25)] bg-white border-slate-300">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between transition-colors dark:bg-[#0d1a30] dark:border-cyan-950/80 bg-slate-50 border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg border dark:bg-amber-500/10 dark:border-amber-500/30 bg-amber-100 border-amber-300">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2 dark:text-white text-slate-900">
                MISSION GLOBAL LEADERBOARD
                <span className="text-xs font-mono font-normal dark:text-cyan-400 text-sky-700">
                  [LIVE TELEMETRY]
                </span>
              </h3>
              <p className="text-xs font-mono dark:text-slate-400 text-slate-500">
                NASA Space Apps Challenge: Dancing with the SARs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFX.playRadarPing();
                fetchLeaderboard();
              }}
              title="Refresh Leaderboard"
              disabled={isLoading}
              className="p-1.5 rounded-md border transition-colors cursor-pointer dark:bg-slate-900 dark:border-slate-700 dark:hover:border-cyan-500 dark:text-slate-300 dark:hover:text-white bg-slate-100 border-slate-300 hover:border-sky-500 text-slate-700 hover:text-slate-900"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md border transition-colors cursor-pointer dark:bg-slate-900 dark:border-slate-700 dark:hover:border-rose-500 dark:text-slate-300 dark:hover:text-rose-400 bg-slate-100 border-slate-300 hover:border-rose-400 text-slate-700 hover:text-rose-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 dark:bg-[#070c17] bg-slate-50">
          {isLoading && entries.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 font-mono text-xs dark:text-cyan-400 text-sky-700">
              <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin dark:border-cyan-400 border-sky-600" />
              <span>Querying orbital ground stations...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => {
                const isGold = entry.rank === 1;
                const isSilver = entry.rank === 2;
                const isBronze = entry.rank === 3;

                return (
                  <div
                    key={entry.alias}
                    className={`p-3 rounded-lg border transition-all flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-xs ${
                      entry.isCurrentPlayer
                        ? 'dark:bg-gradient-to-r dark:from-cyan-950/90 dark:to-[#0e223b] dark:border-cyan-400 dark:shadow-[0_0_15px_rgba(6,182,212,0.3)] dark:ring-1 dark:ring-cyan-400/50 bg-sky-50 border-sky-400 ring-2 ring-sky-300'
                        : isGold
                        ? 'dark:bg-gradient-to-r dark:from-amber-950/40 dark:to-[#121c2e] dark:border-amber-500/50 bg-amber-50/70 border-amber-300'
                        : 'dark:bg-[#0a1426] dark:border-slate-800 bg-white border-slate-200'
                    }`}
                  >
                    {/* Rank & Identity */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 flex items-center justify-center">
                        {isGold ? (
                          <Medal className="w-5 h-5 text-amber-500" />
                        ) : isSilver ? (
                          <Medal className="w-5 h-5 dark:text-slate-300 text-slate-400" />
                        ) : isBronze ? (
                          <Medal className="w-5 h-5 text-amber-700" />
                        ) : (
                          <span className="font-bold dark:text-slate-500 text-slate-400">#{entry.rank}</span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${
                              entry.isCurrentPlayer
                                ? 'dark:text-cyan-300 text-sky-900 text-sm'
                                : 'dark:text-white text-slate-800'
                            }`}
                          >
                            {entry.alias}
                          </span>
                          {entry.isCurrentPlayer && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-bold text-white dark:bg-cyan-600 bg-sky-600">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] block truncate max-w-[200px] sm:max-w-xs dark:text-slate-400 text-slate-500">
                          {entry.affiliation}
                        </span>
                      </div>
                    </div>

                    {/* Solved Levels Badges */}
                    <div className="flex items-center gap-1.5">
                      {['level-0', 'level-1', 'level-2', 'level-3'].map((lvl, idx) => {
                        const isSolved = entry.solvedLevels.includes(lvl as any);
                        return (
                          <span
                            key={lvl}
                            title={`Level ${idx}: ${isSolved ? 'Solved' : 'Pending'}`}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isSolved
                                ? 'dark:bg-emerald-950 dark:border dark:border-emerald-500/70 dark:text-emerald-300 bg-emerald-100 border border-emerald-300 text-emerald-800'
                                : 'dark:bg-slate-900 dark:border dark:border-slate-800 dark:text-slate-600 bg-slate-100 border border-slate-200 text-slate-400'
                            }`}
                          >
                            L{idx}
                          </span>
                        );
                      })}
                    </div>

                    {/* Time & Points */}
                    <div className="flex items-center gap-4 text-right">
                      <div className="hidden sm:block">
                        <span className="block text-[10px] dark:text-slate-500 text-slate-400">TIME</span>
                        <span className="dark:text-slate-300 text-slate-600 font-medium">{entry.lastSolveTime}</span>
                      </div>

                      <div className="min-w-[70px]">
                        <span className="block text-[10px] dark:text-slate-500 text-slate-400">TOTAL</span>
                        <span className="text-sm font-extrabold dark:text-emerald-400 text-emerald-700">
                          {entry.totalScore}{' '}
                          <span className="text-[10px] font-normal dark:text-emerald-500 text-emerald-600">PTS</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t px-4 flex items-center justify-between text-xs font-mono transition-colors dark:bg-[#0a1220] dark:border-cyan-950/80 dark:text-slate-400 bg-slate-100 border-slate-200 text-slate-600">
          <span>Real-time orbital rank updates synchronize with each flag verification.</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded font-medium transition-colors cursor-pointer text-white dark:bg-slate-800 dark:hover:bg-slate-700 bg-slate-700 hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
