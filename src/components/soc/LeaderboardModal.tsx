'use client';

import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '@/types/ctf';
import {
  Trophy,
  X,
  Medal,
  Clock,
  Shield,
  CheckCircle2,
  RefreshCw,
  Users,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-xl bg-[#091120] border border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-[#0d1a30] border-b border-cyan-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                MISSION GLOBAL LEADERBOARD
                <span className="text-xs font-mono text-cyan-400 font-normal">
                  [LIVE TELEMETRY]
                </span>
              </h3>
              <p className="text-xs font-mono text-slate-400">
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
              className="p-1.5 rounded-md bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md bg-slate-900 border border-slate-700 hover:border-rose-500 text-slate-300 hover:text-rose-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading && entries.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-cyan-400 font-mono text-xs">
              <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
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
                    className={`p-3 rounded-lg border transition-all flex flex-wrap items-center justify-between gap-3 text-xs font-mono ${
                      entry.isCurrentPlayer
                        ? 'bg-gradient-to-r from-cyan-950/90 to-[#0e223b] border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/50'
                        : isGold
                        ? 'bg-gradient-to-r from-amber-950/40 to-[#121c2e] border-amber-500/50'
                        : 'bg-[#0a1426] border-slate-800'
                    }`}
                  >
                    {/* Rank & Identity */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 flex items-center justify-center">
                        {isGold ? (
                          <Medal className="w-5 h-5 text-amber-400" />
                        ) : isSilver ? (
                          <Medal className="w-5 h-5 text-slate-300" />
                        ) : isBronze ? (
                          <Medal className="w-5 h-5 text-amber-600" />
                        ) : (
                          <span className="text-slate-500 font-bold">#{entry.rank}</span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${
                              entry.isCurrentPlayer
                                ? 'text-cyan-300 text-sm'
                                : 'text-white'
                            }`}
                          >
                            {entry.alias}
                          </span>
                          {entry.isCurrentPlayer && (
                            <span className="text-[10px] bg-cyan-600 text-white px-1.5 py-0.2 rounded font-bold">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 block truncate max-w-[200px] sm:max-w-xs">
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
                                ? 'bg-emerald-950 border border-emerald-500/70 text-emerald-300'
                                : 'bg-slate-900 border border-slate-800 text-slate-600'
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
                        <span className="text-slate-500 block text-[10px]">TIME</span>
                        <span className="text-slate-300">{entry.lastSolveTime}</span>
                      </div>

                      <div className="min-w-[70px]">
                        <span className="text-slate-500 block text-[10px]">TOTAL</span>
                        <span className="text-sm font-extrabold text-emerald-400">
                          {entry.totalScore}{' '}
                          <span className="text-[10px] font-normal text-emerald-500">PTS</span>
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
        <div className="p-3 bg-[#0a1220] border-t border-cyan-950/80 px-4 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Real-time rank updates synchronize with each flag verification.</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
