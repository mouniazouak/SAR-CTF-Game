'use client';

import React, { useState, useEffect } from 'react';
import {
  Satellite,
  Shield,
  Trophy,
  Volume2,
  VolumeX,
  RotateCcw,
  User,
  Clock,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { soundFX } from '@/lib/audio';

interface NavbarProps {
  alias: string;
  totalScore: number;
  solvedCount: number;
  totalChallenges: number;
  onOpenLeaderboard: () => void;
  onResetSession: () => void;
  onChangeAlias: (newAlias: string) => void;
}

export function Navbar({
  alias,
  totalScore,
  solvedCount,
  totalChallenges,
  onOpenLeaderboard,
  onResetSession,
  onChangeAlias,
}: NavbarProps) {
  const [utcTime, setUtcTime] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isEditingAlias, setIsEditingAlias] = useState<boolean>(false);
  const [aliasInput, setAliasInput] = useState<string>(alias);

  useEffect(() => {
    setAliasInput(alias);
  }, [alias]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(
        now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    soundFX.setMuted(nextState);
    if (!nextState) {
      soundFX.playRadarPing();
    }
  };

  const handleSaveAlias = (e: React.FormEvent) => {
    e.preventDefault();
    if (aliasInput.trim().length > 0) {
      onChangeAlias(aliasInput.trim());
      setIsEditingAlias(false);
      soundFX.playRadarPing();
    }
  };

  return (
    <header className="border-b border-cyan-900/60 bg-[#070d18]/90 backdrop-blur-md sticky top-0 z-40 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Logo and Mission Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-950 to-blue-900 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Satellite className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest uppercase px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/80 text-cyan-300">
                NASA Space Apps
              </span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" />
                NISAR L-SAR LOCK
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Dancing with the SARs
              <span className="text-xs font-mono font-normal text-cyan-400/80 hidden sm:inline">
                | Jeopardy CTF Forensic Workbench
              </span>
            </h1>
          </div>
        </div>

        {/* Center: Live UTC Clock & Satellite Telemetry */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-md border border-slate-800">
          <div className="flex items-center gap-1.5 text-cyan-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{utcTime || '2024-10-30 18:00:00 UTC'}</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">SWEEPSAR:</span>
            <span className="text-emerald-400 font-semibold">1.25 GHz L-BAND</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">EPHEMERIS:</span>
            <span className="text-cyan-400 font-semibold">747 KM SSO</span>
          </div>
        </div>

        {/* Right: Player Profile, Score, Leaderboard & Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Callsign / Alias */}
          {isEditingAlias ? (
            <form onSubmit={handleSaveAlias} className="flex items-center gap-1">
              <input
                type="text"
                value={aliasInput}
                onChange={(e) => setAliasInput(e.target.value)}
                maxLength={20}
                className="w-32 bg-slate-900 border border-cyan-500 rounded px-2 py-1 text-xs font-mono text-white focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-xs font-mono rounded text-white"
              >
                Save
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsEditingAlias(true)}
              title="Click to edit player callsign"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-700 hover:border-cyan-500 text-xs font-mono text-slate-200 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span className="max-w-[120px] truncate font-semibold text-cyan-200">{alias}</span>
            </button>
          )}

          {/* Points Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <div className="flex flex-col text-right leading-tight">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Score</span>
              <span className="text-xs sm:text-sm font-mono font-extrabold text-emerald-300">
                {totalScore} <span className="text-[10px] font-normal text-emerald-400">PTS</span>
              </span>
            </div>
          </div>

          {/* Solved Levels Ratio */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
            <span className="text-slate-500">SOLVED:</span>
            <span className="font-bold text-cyan-400">{solvedCount}/{totalChallenges}</span>
          </div>

          {/* Leaderboard Button */}
          <button
            onClick={() => {
              soundFX.playRadarPing();
              onOpenLeaderboard();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-600/50 hover:border-cyan-400 text-cyan-300 text-xs font-mono font-medium transition-all shadow-sm"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Leaderboard</span>
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={toggleSound}
            title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
            className="p-1.5 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Reset Mission */}
          <button
            onClick={onResetSession}
            title="Reset Mission Progress"
            className="p-1.5 rounded-md bg-slate-900 border border-slate-800 hover:border-rose-700 text-slate-400 hover:text-rose-400 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
