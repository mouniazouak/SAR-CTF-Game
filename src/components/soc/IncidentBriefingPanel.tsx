'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Challenge, LevelId, FlagSubmissionResult, HintRevealResult } from '@/types/ctf';
import {
  Satellite,
  Compass,
  AlertTriangle,
  Lightbulb,
  Send,
  CheckCircle2,
  XCircle,
  Copy,
  Terminal,
  Zap,
  Info,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { soundFX } from '@/lib/audio';
import confetti from 'canvas-confetti';

interface IncidentBriefingPanelProps {
  challenge: Challenge;
  token: string;
  onFlagSolved: (result: FlagSubmissionResult) => void;
  onHintRevealed: (result: HintRevealResult) => void;
}

export function IncidentBriefingPanel({
  challenge,
  token,
  onFlagSolved,
  onHintRevealed,
}: IncidentBriefingPanelProps) {
  const [flagInput, setFlagInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitFeedback, setSubmitFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [revealingHintId, setRevealingHintId] = useState<number | null>(null);
  const [showLogs, setShowLogs] = useState<boolean>(true);
  const [copiedCoords, setCopiedCoords] = useState<boolean>(false);

  // Streaming synthetic logs
  const [sensorLogs, setSensorLogs] = useState<string[]>([
    `[SYS_INIT] SweepSAR phased array receiver active. Doppler centroid lock: 412 Hz.`,
    `[EPHEMERIS] Bounding box [N:${challenge.boundingBox.north.toFixed(4)}, S:${challenge.boundingBox.south.toFixed(4)}, E:${challenge.boundingBox.east.toFixed(4)}, W:${challenge.boundingBox.west.toFixed(4)}] locked.`,
    `[POLARIMETRY] Channel matrix synthesized: ${challenge.satellite.polarization}. Cross-talk calibrated < -35 dB.`,
    `[SLC_PROC] Range compression FFT complete. Azimuth multilooking factor: 4x1.`,
  ]);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Periodically add subtle telemetry pulses to simulate active satellite downlink
  useEffect(() => {
    const messages = [
      `[DOWNLINK] Sub-aperture Doppler drift corrected: +0.02 Hz/s.`,
      `[CALIB] Radiometric sigma0 gain matrix aligned to internal noise diode.`,
      `[TELEMETRY] Ground track velocity: 7.56 km/s. Incidence angle: ${challenge.satellite.lookAngleDeg}°.`,
      `[RFI_FILTER] Pulse compression filter matched. Raw bit error rate: 1.2e-6.`,
    ];

    const timer = setInterval(() => {
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      setSensorLogs((prev) => [...prev.slice(-15), `[${new Date().toISOString().substring(11, 19)}] ${randomMsg}`]);
    }, 12000);

    return () => clearInterval(timer);
  }, [challenge]);

  const handleCopyCoords = () => {
    const coordString = `${challenge.targetAnomaly.lat}, ${challenge.targetAnomaly.lng}`;
    navigator.clipboard.writeText(coordString);
    setCopiedCoords(true);
    soundFX.playRadarPing();
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagInput.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitFeedback(null);

    try {
      const res = await fetch('/api/flags/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-token': token,
        },
        body: JSON.stringify({
          challengeId: challenge.id,
          flag: flagInput.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        soundFX.playSuccessFanfare();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00e5ff', '#10b981', '#ffffff', '#38bdf8'],
        });
        setSubmitFeedback({
          success: true,
          message: data.message,
        });
        setFlagInput('');
        onFlagSolved(data);
      } else {
        soundFX.playErrorBuzzer();
        setSubmitFeedback({
          success: false,
          message: data.message || 'Verification rejected: Phase decorrelation detected.',
        });
      }
    } catch (err) {
      soundFX.playErrorBuzzer();
      setSubmitFeedback({
        success: false,
        message: 'Network telemetry error. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevealHint = async (hintIndex: number) => {
    if (revealingHintId !== null) return;
    setRevealingHintId(hintIndex);

    try {
      const res = await fetch('/api/hints/reveal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-token': token,
        },
        body: JSON.stringify({
          challengeId: challenge.id,
          hintIndex,
        }),
      });

      const data = await res.json();
      if (data.success) {
        soundFX.playHintChime();
        onHintRevealed(data);
      }
    } catch (e) {
      // Failed to reveal hint
    } finally {
      setRevealingHintId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#080e1a] border-r border-cyan-950/80 overflow-y-auto">
      {/* Incident Header */}
      <div className="p-4 border-b border-cyan-950/70 bg-[#0a1222]/90 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/80">
            {challenge.codename} &bull; LEVEL {challenge.levelNumber}
          </span>
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-400">Current Yield:</span>
            <span className="font-bold text-amber-300">{challenge.currentPoints} PTS</span>
          </div>
        </div>

        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
          {challenge.title}
        </h2>

        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1 text-cyan-300">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            {challenge.targetLocation}
          </span>
          <span>&bull;</span>
          <button
            onClick={handleCopyCoords}
            title="Click to copy target coordinates"
            className="flex items-center gap-1 hover:text-white transition-colors bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800"
          >
            <span>[{challenge.centerCoordinates[0].toFixed(4)}°, {challenge.centerCoordinates[1].toFixed(4)}°]</span>
            <Copy className="w-3 h-3 text-cyan-400" />
            {copiedCoords && <span className="text-emerald-400 text-[10px]">Copied!</span>}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Solved Banner if completed */}
        {challenge.solved && (
          <div className="p-3 rounded-lg bg-emerald-950/70 border border-emerald-500/50 flex items-start gap-3 text-emerald-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs font-mono">
              <div className="font-bold text-emerald-300">TELEMETRY AUTHENTICATION CONFIRMED</div>
              <p className="mt-0.5 text-slate-300">
                Flag verified and registered on the mission ledger. You earned points for this orbital target!
              </p>
            </div>
          </div>
        )}

        {/* Satellite Telemetry Card */}
        <div className="rounded-lg bg-[#0b1626] border border-cyan-900/50 p-3 text-xs font-mono">
          <div className="flex items-center gap-2 pb-2 mb-2 border-b border-cyan-950/80 text-cyan-400">
            <Satellite className="w-4 h-4 text-cyan-400" />
            <span className="font-bold tracking-wider uppercase">ORBITAL SENSOR TELEMETRY</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500">Platform:</span>
              <div className="text-slate-200 font-semibold truncate">{challenge.satellite.mission}</div>
            </div>
            <div>
              <span className="text-slate-500">Payload:</span>
              <div className="text-slate-200 font-semibold">{challenge.satellite.sensor}</div>
            </div>
            <div>
              <span className="text-slate-500">Frequency / Band:</span>
              <div className="text-cyan-300">{challenge.satellite.frequencyGhz} GHz (λ={challenge.satellite.wavelengthCm} cm)</div>
            </div>
            <div>
              <span className="text-slate-500">Polarization:</span>
              <div className="text-cyan-300">{challenge.satellite.polarization}</div>
            </div>
            <div>
              <span className="text-slate-500">Pass Direction:</span>
              <div className="text-slate-200">{challenge.satellite.passDirection} ({challenge.satellite.lookAngleDeg}° Inc)</div>
            </div>
            <div>
              <span className="text-slate-500">Ground Res:</span>
              <div className="text-slate-200">{challenge.satellite.groundResolutionM}m spatial resolution</div>
            </div>
          </div>
        </div>

        {/* Tactical Scenario Briefing */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>INCIDENT BRIEFING</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed bg-[#0b1424] p-3 rounded-lg border border-slate-800">
            {challenge.scenarioBriefing}
          </p>
        </div>

        {/* Forensic Mission Objective */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>FORENSIC OBJECTIVE</span>
          </div>
          <div className="text-xs text-amber-100/90 leading-relaxed bg-amber-950/20 p-3 rounded-lg border border-amber-900/40">
            <p>{challenge.forensicMission}</p>
            <div className="mt-2 pt-2 border-t border-amber-900/30 flex items-center gap-1 text-[11px] font-mono text-amber-300">
              <span className="font-semibold text-amber-400">Clue:</span>
              <span>{challenge.targetAnomaly.samplingClue}</span>
            </div>
          </div>
        </div>

        {/* Synthetic Streaming Sensor Logs */}
        <div className="rounded-lg bg-[#050912] border border-slate-800 overflow-hidden">
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="w-full flex items-center justify-between p-2.5 text-xs font-mono text-slate-400 hover:text-slate-200 bg-[#0a101d] border-b border-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>SYNTHETIC SENSOR TELEMETRY LOGS</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            {showLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showLogs && (
            <div className="p-2.5 font-mono text-[10px] space-y-1 text-slate-400 max-h-36 overflow-y-auto">
              {sensorLogs.map((log, idx) => (
                <div key={idx} className="leading-snug">
                  <span className="text-cyan-500/80">&gt;</span> {log}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>

        {/* Tactical Hints Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              TACTICAL HINTS ({challenge.hints.filter((h) => h.revealed).length}/{challenge.hints.length})
            </span>
            <span className="text-[10px] text-amber-400/90 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              -25% pts per hint
            </span>
          </div>

          <div className="space-y-2">
            {challenge.hints.map((hint, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border text-xs font-mono transition-all ${
                  hint.revealed
                    ? 'bg-cyan-950/30 border-cyan-800/60 text-slate-300'
                    : 'bg-[#091120] border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-cyan-300">
                    Hint #{idx + 1}: {hint.title}
                  </span>
                  {!hint.revealed && (
                    <button
                      disabled={revealingHintId !== null}
                      onClick={() => handleRevealHint(idx)}
                      className="px-2 py-1 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-600/60 text-amber-300 text-[10px] font-bold transition-colors"
                    >
                      {revealingHintId === idx ? 'Decrypting...' : `Reveal (-${hint.penaltyPercent}%)`}
                    </button>
                  )}
                </div>

                {hint.revealed && hint.text && (
                  <p className="mt-2 text-[11px] text-slate-300 leading-relaxed bg-black/30 p-2 rounded border border-cyan-950">
                    {hint.text}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Flag Submission Console */}
        <div className="rounded-lg bg-[#091424] border border-cyan-800/60 p-3.5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-white tracking-wide uppercase">
                AUTHENTICATE TELEMETRY FLAG
              </span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400/70">
              Syntax: flag&#123;nisar_xxxx_xxxx&#125;
            </span>
          </div>

          <form onSubmit={handleFlagSubmit} className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={flagInput}
                onChange={(e) => setFlagInput(e.target.value)}
                placeholder="flag{nisar_...}"
                disabled={isSubmitting || challenge.solved}
                className="w-full bg-[#050912] border border-cyan-900 focus:border-cyan-400 rounded-md py-2 px-3 text-xs font-mono text-cyan-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-400 disabled:opacity-50"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isSubmitting || !flagInput.trim() || challenge.solved}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Cross-Correlating...</span>
                  </>
                ) : challenge.solved ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Level Authenticated</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Verification Flag</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Submission Feedback Banner */}
          {submitFeedback && (
            <div
              className={`p-2.5 rounded-md text-xs font-mono flex items-start gap-2 border ${
                submitFeedback.success
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
                  : 'bg-rose-950/80 border-rose-500/60 text-rose-200'
              }`}
            >
              {submitFeedback.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="leading-snug">{submitFeedback.message}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
