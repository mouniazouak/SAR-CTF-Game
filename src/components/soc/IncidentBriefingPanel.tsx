'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Challenge, FlagSubmissionResult, HintRevealResult, ForensicSample } from '@/types/ctf';
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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { soundFX } from '@/lib/audio';
import { sampleForensics } from '@/lib/sar-forensics';
import confetti from 'canvas-confetti';
import { GeminiForensicsAssistant } from '@/components/soc/GeminiForensicsAssistant';

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
  const [weatherSummary, setWeatherSummary] = useState<{
    precipitation: number;
    temperature: number | null;
    wind: number | null;
  } | null>(null);
  const [weatherStatus, setWeatherStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');

  // Streaming synthetic logs
  const [sensorLogs, setSensorLogs] = useState<string[]>([
    `[SYS_INIT] SweepSAR phased array receiver active. Doppler centroid lock: 412 Hz.`,
    `[EPHEMERIS] Bounding box [N:${challenge.boundingBox.north.toFixed(4)}, S:${challenge.boundingBox.south.toFixed(4)}, E:${challenge.boundingBox.east.toFixed(4)}, W:${challenge.boundingBox.west.toFixed(4)}] locked.`,
    `[POLARIMETRY] Channel matrix synthesized: ${challenge.satellite.polarization}. Cross-talk calibrated < -35 dB.`,
    `[SLC_PROC] Range compression FFT complete. Azimuth multilooking factor: 4x1.`,
  ]);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const [activeSample, setActiveSample] = useState<ForensicSample | null>(null);

  useEffect(() => {
    setActiveSample(sampleForensics(challenge.id, challenge.targetAnomaly.lat, challenge.targetAnomaly.lng));
  }, [challenge]);

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

  // Weather is contextual evidence, not the scientific answer by itself.
  useEffect(() => {
    const date = challenge.satellite.acquisitionDate.slice(0, 10);
    const query = new URLSearchParams({
      latitude: String(challenge.centerCoordinates[0]),
      longitude: String(challenge.centerCoordinates[1]),
      start_date: date,
      end_date: date,
      timezone: 'UTC',
    });
    setWeatherStatus('loading');
    fetch(`/api/weather?${query.toString()}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('weather'))))
      .then((payload) => {
        const hourly = payload.weather?.hourly;
        if (!payload.success || !hourly) throw new Error('weather');
        const totalRain = (hourly.precipitation || []).reduce((sum: number, value: number) => sum + (value || 0), 0);
        const temperatures = (hourly.temperature_2m || []).filter((value: number | null) => value !== null);
        const winds = (hourly.wind_speed_10m || []).filter((value: number | null) => value !== null);
        setWeatherSummary({
          precipitation: Number(totalRain.toFixed(1)),
          temperature: temperatures.length ? Number((temperatures.reduce((a: number, b: number) => a + b, 0) / temperatures.length).toFixed(1)) : null,
          wind: winds.length ? Number(Math.max(...winds).toFixed(1)) : null,
        });
        setWeatherStatus('ready');
      })
      .catch(() => {
        setWeatherSummary(null);
        setWeatherStatus('unavailable');
      });
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
          particleCount: 110,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#00e5ff', '#10b981', '#ffffff', '#38bdf8', '#fbbf24'],
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
    } catch {
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
    } catch {
      // Failed to reveal hint
    } finally {
      setRevealingHintId(null);
    }
  };

  return (
    <div className="flex flex-col h-full border-r overflow-y-auto transition-colors duration-300 dark:bg-[#080e1a] dark:border-cyan-950/80 bg-slate-50/90 border-slate-200">
      {/* Incident Header */}
      <div className="p-4 border-b sticky top-0 z-20 backdrop-blur-md transition-colors duration-300 dark:bg-[#0a1222]/95 dark:border-cyan-950/70 bg-white/95 border-slate-200 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border transition-colors dark:text-cyan-400 dark:bg-cyan-950/80 dark:border-cyan-800/80 text-sky-800 bg-sky-100 border-sky-300">
            {challenge.codename} &bull; LEVEL {challenge.levelNumber}
          </span>
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="dark:text-slate-400 text-slate-500">Yield:</span>
            <span className="font-bold dark:text-amber-300 text-amber-700">{challenge.currentPoints} PTS</span>
          </div>
        </div>

        <h2 className="text-base sm:text-lg font-bold tracking-tight dark:text-white text-slate-900">
          {challenge.title}
        </h2>

        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-mono dark:text-slate-400 text-slate-600">
          <span className="flex items-center gap-1 dark:text-cyan-300 text-sky-700 font-medium">
            <Compass className="w-3.5 h-3.5 dark:text-cyan-400 text-sky-600" />
            {challenge.targetLocation}
          </span>
          <span>&bull;</span>
          <button
            onClick={handleCopyCoords}
            title="Click to copy target coordinates"
            className="flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded border cursor-pointer dark:bg-slate-900/80 dark:border-slate-800 dark:hover:text-white bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700"
          >
            <span>[{challenge.centerCoordinates[0].toFixed(4)}°, {challenge.centerCoordinates[1].toFixed(4)}°]</span>
            <Copy className="w-3 h-3 dark:text-cyan-400 text-sky-600" />
            {copiedCoords && <span className="dark:text-emerald-400 text-emerald-600 text-[10px] font-bold">Copied!</span>}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Solved Banner if completed */}
        {challenge.solved && (
          <div className="p-3 rounded-lg border flex items-start gap-3 transition-colors dark:bg-emerald-950/70 dark:border-emerald-500/50 dark:text-emerald-200 bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm">
            <CheckCircle2 className="w-5 h-5 dark:text-emerald-400 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs font-mono">
              <div className="font-bold dark:text-emerald-300 text-emerald-900">TELEMETRY AUTHENTICATION CONFIRMED</div>
              <p className="mt-0.5 dark:text-slate-300 text-emerald-800">
                Flag verified and registered on the orbital mission ledger. Level points awarded!
              </p>
            </div>
          </div>
        )}

        {/* Satellite Telemetry Card */}
        <div className="rounded-lg border p-3 text-xs font-mono transition-colors shadow-sm dark:bg-[#0b1626] dark:border-cyan-900/50 bg-white border-slate-200">
          <div className="flex items-center gap-2 pb-2 mb-2 border-b dark:border-cyan-950/80 dark:text-cyan-400 border-slate-200 text-sky-700 font-bold">
            <Satellite className="w-4 h-4 dark:text-cyan-400 text-sky-600" />
            <span className="tracking-wider uppercase">ORBITAL SENSOR TELEMETRY</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="dark:text-slate-500 text-slate-400">Platform:</span>
              <div className="dark:text-slate-200 text-slate-800 font-semibold truncate">{challenge.satellite.mission}</div>
            </div>
            <div>
              <span className="dark:text-slate-500 text-slate-400">Payload:</span>
              <div className="dark:text-slate-200 text-slate-800 font-semibold">{challenge.satellite.sensor}</div>
            </div>
            <div>
              <span className="dark:text-slate-500 text-slate-400">Frequency / Band:</span>
              <div className="dark:text-cyan-300 text-sky-700 font-medium">{challenge.satellite.frequencyGhz} GHz (λ={challenge.satellite.wavelengthCm} cm)</div>
            </div>
            <div>
              <span className="dark:text-slate-500 text-slate-400">Polarization:</span>
              <div className="dark:text-cyan-300 text-sky-700 font-medium">{challenge.satellite.polarization}</div>
            </div>
            <div>
              <span className="dark:text-slate-500 text-slate-400">Pass Direction:</span>
              <div className="dark:text-slate-200 text-slate-800">{challenge.satellite.passDirection} ({challenge.satellite.lookAngleDeg}° Inc)</div>
            </div>
            <div>
              <span className="dark:text-slate-500 text-slate-400">Ground Res:</span>
              <div className="dark:text-slate-200 text-slate-800">{challenge.satellite.groundResolutionM}m spatial resolution</div>
            </div>
          </div>
        </div>

        {/* Historical weather context */}
        <div className="rounded-lg border p-3 text-xs font-mono transition-colors shadow-sm dark:bg-[#0b1626] dark:border-cyan-900/50 bg-white border-slate-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b dark:border-cyan-950/80 border-slate-200">
            <span className="font-bold tracking-wider uppercase dark:text-cyan-400 text-sky-700">WEATHER CONTEXT</span>
            <span className="text-[10px] dark:text-slate-500 text-slate-400">Open-Meteo archive</span>
          </div>
          {weatherStatus === 'loading' && <p className="text-[11px] dark:text-slate-400 text-slate-500">Loading historical conditions...</p>}
          {weatherStatus === 'unavailable' && <p className="text-[11px] dark:text-amber-300 text-amber-700">Weather data unavailable for this mission.</p>}
          {weatherStatus === 'ready' && weatherSummary && (
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div><span className="block dark:text-slate-500 text-slate-400">RAIN</span><strong>{weatherSummary.precipitation} mm</strong></div>
              <div><span className="block dark:text-slate-500 text-slate-400">TEMP AVG</span><strong>{weatherSummary.temperature ?? '—'} °C</strong></div>
              <div><span className="block dark:text-slate-500 text-slate-400">WIND MAX</span><strong>{weatherSummary.wind ?? '—'} km/h</strong></div>
            </div>
          )}
        </div>

        {/* Tactical Scenario Briefing */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold dark:text-slate-300 text-slate-700">
            <Info className="w-3.5 h-3.5 dark:text-cyan-400 text-sky-600" />
            <span>INCIDENT BRIEFING</span>
          </div>
          <p className="text-xs leading-relaxed p-3 rounded-lg border transition-colors dark:text-slate-300 dark:bg-[#0b1424] dark:border-slate-800 bg-white border-slate-200 text-slate-700 shadow-sm">
            {challenge.scenarioBriefing}
          </p>
        </div>

        {/* Forensic Mission Objective */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold dark:text-amber-400 text-amber-700">
            <Zap className="w-3.5 h-3.5 dark:text-amber-400 text-amber-600" />
            <span>FORENSIC OBJECTIVE</span>
          </div>
          <div className="text-xs leading-relaxed p-3 rounded-lg border transition-colors shadow-sm dark:text-amber-100/90 dark:bg-amber-950/20 dark:border-amber-900/40 bg-amber-50/80 border-amber-200 text-amber-950">
            <p>{challenge.forensicMission}</p>
            <div className="mt-2 pt-2 border-t flex items-center gap-1 text-[11px] font-mono dark:border-amber-900/30 dark:text-amber-300 border-amber-200 text-amber-800">
              <span className="font-semibold dark:text-amber-400 text-amber-900">Clue:</span>
              <span>{challenge.targetAnomaly.samplingClue}</span>
            </div>
          </div>
        </div>

        {/* Synthetic Streaming Sensor Logs (Authentic terminal styled cleanly for both themes) */}
        <div className="rounded-lg border overflow-hidden shadow-sm dark:bg-[#050912] dark:border-slate-800 bg-slate-900 border-slate-800 text-slate-200">
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="w-full flex items-center justify-between p-2.5 text-xs font-mono dark:text-slate-300 text-slate-300 bg-slate-950 border-b border-slate-800 transition-colors cursor-pointer hover:text-white"
          >
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>SYNTHETIC SENSOR TELEMETRY LOGS</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            {showLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showLogs && (
            <div className="p-2.5 font-mono text-[10px] space-y-1 text-slate-300 max-h-36 overflow-y-auto bg-[#070c18]">
              {sensorLogs.map((log, idx) => (
                <div key={idx} className="leading-snug">
                  <span className="text-cyan-400 font-bold">&gt;</span> {log}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>

        <GeminiForensicsAssistant challenge={challenge} sample={activeSample} />

        {/* Tactical Hints Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold flex items-center gap-1.5 dark:text-slate-300 text-slate-700">
              <Lightbulb className="w-3.5 h-3.5 dark:text-amber-400 text-amber-600" />
              TACTICAL HINTS ({challenge.hints.filter((h) => h.revealed).length}/{challenge.hints.length})
            </span>
            <span className="text-[10px] flex items-center gap-1 dark:text-amber-400/90 text-amber-700 font-medium">
              <AlertTriangle className="w-3 h-3 dark:text-amber-400 text-amber-600" />
              -25% pts per hint
            </span>
          </div>

          <div className="space-y-2">
            {challenge.hints.map((hint, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border text-xs font-mono transition-all shadow-sm ${
                  hint.revealed
                    ? 'dark:bg-cyan-950/30 dark:border-cyan-800/60 dark:text-slate-300 bg-sky-50 border-sky-300 text-slate-800'
                    : 'dark:bg-[#091120] dark:border-slate-800 dark:text-slate-400 bg-white border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold dark:text-cyan-300 text-sky-800">
                    Hint #{idx + 1}: {hint.title}
                  </span>
                  {!hint.revealed && (
                    <button
                      disabled={revealingHintId !== null}
                      onClick={() => handleRevealHint(idx)}
                      className="px-2 py-1 rounded border text-[10px] font-bold transition-colors cursor-pointer dark:bg-amber-950/80 dark:hover:bg-amber-900 dark:border-amber-600/60 dark:text-amber-300 bg-amber-100 hover:bg-amber-200 border-amber-400 text-amber-900 shadow-xs"
                    >
                      {revealingHintId === idx ? 'Decrypting...' : `Reveal (-${hint.penaltyPercent}%)`}
                    </button>
                  )}
                </div>

                {hint.revealed && hint.text && (
                  <p className="mt-2 text-[11px] leading-relaxed p-2.5 rounded border transition-colors dark:text-slate-200 dark:bg-black/30 dark:border-cyan-950 bg-white/90 border-sky-200 text-slate-800">
                    {hint.text}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Flag Submission Console */}
        <div className="rounded-lg border p-3.5 space-y-3 shadow-md transition-colors dark:bg-[#091424] dark:border-cyan-800/60 bg-white border-slate-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full dark:bg-cyan-400 bg-sky-600 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-wide uppercase dark:text-white text-slate-900">
                AUTHENTICATE TELEMETRY FLAG
              </span>
            </div>
            <span className="text-[10px] font-mono dark:text-cyan-400/70 text-sky-700">
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
                className="w-full rounded-md py-2 px-3 text-xs font-mono focus:outline-none focus:ring-2 transition-all disabled:opacity-50 dark:bg-[#050912] dark:border dark:border-cyan-900 dark:focus:border-cyan-400 dark:text-cyan-200 dark:placeholder-slate-600 dark:focus:ring-cyan-500/40 bg-slate-50 border border-slate-300 focus:border-sky-500 text-slate-900 placeholder-slate-400 focus:ring-sky-200"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isSubmitting || !flagInput.trim() || challenge.solved}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md font-mono text-xs font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white dark:bg-gradient-to-r dark:from-cyan-600 dark:to-blue-600 dark:hover:from-cyan-500 dark:hover:to-blue-500 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 shadow-sky-600/20"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                  ? 'dark:bg-emerald-950/80 dark:border-emerald-500/60 dark:text-emerald-200 bg-emerald-50 border-emerald-400 text-emerald-900'
                  : 'dark:bg-rose-950/80 dark:border-rose-500/60 dark:text-rose-200 bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              {submitFeedback.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              )}
              <div className="leading-snug">{submitFeedback.message}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
