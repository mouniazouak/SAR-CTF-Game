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
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { soundFX } from '@/lib/audio';

interface NavbarProps {
  alias: string;
  totalScore: number;
  solvedCount: number;
  totalChallenges: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenLeaderboard: () => void;
  onResetSession: () => void;
  onChangeAlias: (newAlias: string) => void;
}

export function Navbar({
  alias,
  totalScore,
  solvedCount,
  totalChallenges,
  theme,
  onToggleTheme,
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
    <header className="border-b transition-colors duration-300 sticky top-0 z-40 px-4 py-2.5 backdrop-blur-md dark:bg-[#070d18]/90 dark:border-cyan-900/60 bg-white/90 border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Logo and Mission Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg transition-all dark:bg-gradient-to-br dark:from-cyan-950 dark:to-blue-900 dark:border dark:border-cyan-500/40 dark:shadow-[0_0_15px_rgba(6,182,212,0.3)] bg-gradient-to-br from-sky-50 to-blue-100 border border-sky-300 shadow-sm">
            <Satellite className="w-5 h-5 dark:text-cyan-400 text-sky-600 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full dark:bg-emerald-400 bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-1.5 py-0.5 rounded transition-colors dark:bg-cyan-950/80 dark:border-cyan-800/80 dark:text-cyan-300 bg-sky-100 border border-sky-300 text-sky-800">
                NASA Space Apps
              </span>
              <span className="text-[11px] font-mono flex items-center gap-1 dark:text-emerald-400 text-emerald-700 font-semibold">
                <Radio className="w-3 h-3 animate-pulse" />
                NISAR L-SAR ACTIVE
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2 dark:text-white text-slate-900">
              Dancing with the SARs
              <span className="text-xs font-mono font-normal hidden sm:inline dark:text-cyan-400/80 text-sky-700">
                | Space Forensic Workbench
              </span>
            </h1>
          </div>
        </div>

        {/* Center: Live UTC Clock & Satellite Telemetry */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono px-3 py-1.5 rounded-md border transition-colors dark:text-slate-300 dark:bg-slate-950/60 dark:border-slate-800 bg-slate-100/90 border-slate-200 text-slate-700">
          <div className="flex items-center gap-1.5 dark:text-cyan-300 text-sky-800">
            <Clock className="w-3.5 h-3.5 dark:text-cyan-400 text-sky-600" />
            <span>{utcTime || '2024-10-30 18:00:00 UTC'}</span>
          </div>
          <span className="dark:text-slate-600 text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <span className="dark:text-slate-400 text-slate-500">SWEEPSAR:</span>
            <span className="dark:text-emerald-400 text-emerald-700 font-semibold">1.25 GHz L-BAND</span>
          </div>
          <span className="dark:text-slate-600 text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <span className="dark:text-slate-400 text-slate-500">ORBIT:</span>
            <span className="dark:text-cyan-400 text-sky-700 font-semibold">747 KM POLAR SSO</span>
          </div>
        </div>

        {/* Right: Theme Toggle, Callsign, Score, Leaderboard & Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Eye-Comfort Theme Toggle (Deep Space Night vs Orbital Daylight) */}
          <button
            onClick={() => {
              soundFX.playRadarPing();
              onToggleTheme();
            }}
            title={theme === 'dark' ? 'Switch to Eye-Comfort Daylight Mode' : 'Switch to Deep Space Night Mode'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all text-xs font-mono font-medium border cursor-pointer dark:bg-slate-900 dark:border-slate-700 dark:text-amber-300 dark:hover:bg-slate-800 dark:hover:border-amber-400 bg-sky-50 border-sky-200 text-sky-900 hover:bg-sky-100 hover:border-sky-400 shadow-sm"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '20s' }} />
                <span className="hidden md:inline text-[11px]">Daylight</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden md:inline text-[11px]">Deep Space</span>
              </>
            )}
          </button>

          {/* Callsign / Alias */}
          {isEditingAlias ? (
            <form onSubmit={handleSaveAlias} className="flex items-center gap-1">
              <input
                type="text"
                value={aliasInput}
                onChange={(e) => setAliasInput(e.target.value)}
                maxLength={20}
                className="w-28 sm:w-32 rounded px-2 py-1 text-xs font-mono focus:outline-none transition-colors dark:bg-slate-900 dark:border dark:border-cyan-500 dark:text-white bg-white border border-sky-400 text-slate-900"
                autoFocus
              />
              <button
                type="submit"
                className="px-2 py-1 text-xs font-mono rounded text-white dark:bg-cyan-600 dark:hover:bg-cyan-500 bg-sky-600 hover:bg-sky-500 cursor-pointer"
              >
                Save
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsEditingAlias(true)}
              title="Click to edit player callsign"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-mono transition-colors cursor-pointer dark:bg-slate-900/90 dark:border-slate-700 dark:hover:border-cyan-500 dark:text-slate-200 bg-slate-100 border-slate-300 hover:border-sky-500 text-slate-800"
            >
              <User className="w-3.5 h-3.5 dark:text-cyan-400 text-sky-600" />
              <span className="max-w-[110px] truncate font-semibold dark:text-cyan-200 text-sky-900">{alias}</span>
            </button>
          )}

          {/* Points Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md border transition-all dark:bg-gradient-to-r dark:from-emerald-950/80 dark:to-slate-900 dark:border-emerald-500/40 dark:shadow-[0_0_12px_rgba(16,185,129,0.2)] bg-emerald-50 border-emerald-300 shadow-sm">
            <Shield className="w-3.5 h-3.5 dark:text-emerald-400 text-emerald-600" />
            <div className="flex flex-col text-right leading-tight">
              <span className="text-[9px] font-mono uppercase tracking-wider dark:text-slate-400 text-slate-500">Score</span>
              <span className="text-xs sm:text-sm font-mono font-extrabold dark:text-emerald-300 text-emerald-800">
                {totalScore} <span className="text-[10px] font-normal dark:text-emerald-400 text-emerald-700">PTS</span>
              </span>
            </div>
          </div>

          {/* Solved Levels Ratio */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-md border text-xs font-mono transition-colors dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-300 bg-slate-100 border-slate-200 text-slate-700">
            <span className="dark:text-slate-500 text-slate-400">SOLVED:</span>
            <span className="font-bold dark:text-cyan-400 text-sky-700">{solvedCount}/{totalChallenges}</span>
          </div>

          {/* Leaderboard Button */}
          <button
            onClick={() => {
              soundFX.playRadarPing();
              onOpenLeaderboard();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-mono font-medium transition-all shadow-sm cursor-pointer dark:bg-cyan-950/80 dark:hover:bg-cyan-900 dark:border-cyan-600/50 dark:hover:border-cyan-400 dark:text-cyan-300 bg-amber-50 hover:bg-amber-100 border-amber-300 hover:border-amber-400 text-amber-900"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline">Leaderboard</span>
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={toggleSound}
            title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
            className="p-1.5 rounded-md border transition-colors cursor-pointer dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 dark:text-cyan-400 text-sky-600" />}
          </button>

          {/* Reset Mission */}
          <button
            onClick={onResetSession}
            title="Reset Mission Progress"
            className="p-1.5 rounded-md border transition-colors cursor-pointer dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-rose-400 bg-slate-100 border-slate-200 text-slate-500 hover:text-rose-600"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
