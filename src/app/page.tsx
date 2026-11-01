'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Challenge, LevelId, FlagSubmissionResult, HintRevealResult } from '@/types/ctf';
import { Navbar } from '@/components/soc/Navbar';
import { JeopardyRibbon } from '@/components/soc/JeopardyRibbon';
import { IncidentBriefingPanel } from '@/components/soc/IncidentBriefingPanel';
import { GeospatialForensicsMap } from '@/components/soc/GeospatialForensicsMap';
import { LeaderboardModal } from '@/components/soc/LeaderboardModal';

export default function ForensicWorkbenchPage() {
  const [token, setToken] = useState<string>('');
  const [alias, setAlias] = useState<string>('Analyst-01');
  const [totalScore, setTotalScore] = useState<number>(0);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<LevelId>('level-0');
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize or restore session
  const initSession = useCallback(async () => {
    try {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('sar_session_token') : null;
      const storedAlias = typeof window !== 'undefined' ? localStorage.getItem('sar_player_alias') : null;

      const res = await fetch('/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(storedToken ? { 'x-session-token': storedToken } : {}),
        },
        body: JSON.stringify({
          token: storedToken || undefined,
          alias: storedAlias || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.session) {
        setToken(data.session.token);
        setAlias(data.session.alias);
        setTotalScore(data.session.totalScore);

        if (typeof window !== 'undefined') {
          localStorage.setItem('sar_session_token', data.session.token);
          localStorage.setItem('sar_player_alias', data.session.alias);
        }

        // Fetch challenges with this session token
        await fetchChallenges(data.session.token);
      }
    } catch (err) {
      console.error('Session initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch challenge status
  const fetchChallenges = async (sessionToken: string) => {
    try {
      const res = await fetch('/api/challenges', {
        headers: { 'x-session-token': sessionToken },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.challenges)) {
        setChallenges(data.challenges);
        if (data.player) {
          setTotalScore(data.player.totalScore);
        }
      }
    } catch (err) {
      console.error('Failed to load orbital challenges:', err);
    }
  };

  useEffect(() => {
    initSession();
  }, [initSession]);

  // Handle flag solved
  const handleFlagSolved = (result: FlagSubmissionResult) => {
    if (result.totalScore !== undefined) {
      setTotalScore(result.totalScore);
    }

    // Refresh challenge states from server
    if (token) {
      fetchChallenges(token).then(() => {
        // Automatically advance to newly unlocked level if available
        if (result.nextLevelUnlocked) {
          setSelectedLevelId(result.nextLevelUnlocked);
        }
      });
    }
  };

  // Handle hint revealed
  const handleHintRevealed = (result: HintRevealResult) => {
    if (token) {
      fetchChallenges(token);
    }
  };

  // Reset session
  const handleResetSession = async () => {
    if (!confirm('Reset mission telemetry and start fresh from Level 0?')) return;
    try {
      const res = await fetch('/api/reset', {
        method: 'POST',
        headers: { 'x-session-token': token },
      });
      const data = await res.json();
      if (data.success) {
        setTotalScore(0);
        setSelectedLevelId('level-0');
        if (data.challenges) {
          setChallenges(data.challenges);
        }
      }
    } catch (e) {
      console.error('Failed to reset session:', e);
    }
  };

  // Change alias
  const handleChangeAlias = async (newAlias: string) => {
    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-token': token,
        },
        body: JSON.stringify({ token, alias: newAlias }),
      });
      const data = await res.json();
      if (data.success && data.session) {
        setAlias(data.session.alias);
        if (typeof window !== 'undefined') {
          localStorage.setItem('sar_player_alias', data.session.alias);
        }
      }
    } catch (e) {
      console.error('Failed to update alias:', e);
    }
  };

  const selectedChallenge = challenges.find((c) => c.id === selectedLevelId) || challenges[0];
  const solvedCount = challenges.filter((c) => c.solved).length;

  if (isLoading || !selectedChallenge) {
    return (
      <div className="min-h-screen bg-[#060a12] flex flex-col items-center justify-center text-cyan-400 font-mono text-xs gap-3">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <div className="tracking-widest uppercase text-center">
          <p className="font-bold text-sm text-white">CALIBRATING NISAR RADAR COHERENCE...</p>
          <p className="text-slate-500 mt-1">Connecting to Space Apps Orbital Ground Station</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#060a12] text-slate-200">
      {/* Navigation & Telemetry Header */}
      <Navbar
        alias={alias}
        totalScore={totalScore}
        solvedCount={solvedCount}
        totalChallenges={challenges.length}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onResetSession={handleResetSession}
        onChangeAlias={handleChangeAlias}
      />

      {/* Jeopardy-style Challenge Matrix Ribbon */}
      <JeopardyRibbon
        challenges={challenges}
        selectedLevelId={selectedLevelId}
        onSelectChallenge={(id) => setSelectedLevelId(id)}
      />

      {/* Main Forensic Workbench Split View */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-140px)]">
        {/* Left Column: Incident Briefing Panel (approx 42% on wide screens) */}
        <div className="lg:col-span-5 h-[600px] lg:h-auto overflow-hidden">
          <IncidentBriefingPanel
            challenge={selectedChallenge}
            token={token}
            onFlagSolved={handleFlagSolved}
            onHintRevealed={handleHintRevealed}
          />
        </div>

        {/* Right Column: Dual-Layer Geospatial Forensics Map (approx 58% on wide screens) */}
        <div className="lg:col-span-7 h-[650px] lg:h-auto overflow-hidden">
          <GeospatialForensicsMap challenge={selectedChallenge} />
        </div>
      </main>

      {/* Real-time Global Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        token={token}
      />
    </div>
  );
}
