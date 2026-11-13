'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Challenge, ForensicSample } from '@/types/ctf';
import { sampleForensics, generateProceduralSarOverlay } from '@/lib/sar-forensics';
import {
  Crosshair,
  Sliders,
  Radar,
  Copy,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { soundFX } from '@/lib/audio';

interface GeospatialForensicsMapProps {
  challenge: Challenge;
}

type ViewMode = 'curtain' | 'optical' | 'sar' | 'blend';

export function GeospatialForensicsMap({ challenge }: GeospatialForensicsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Map state
  const [zoom, setZoom] = useState<number>(challenge.defaultZoom);
  const [center, setCenter] = useState<[number, number]>(challenge.centerCoordinates);
  const [sliderPos, setSliderPos] = useState<number>(50); // 0 to 100%
  const [viewMode, setViewMode] = useState<ViewMode>('curtain');
  const [isCrosshairActive, setIsCrosshairActive] = useState<boolean>(true);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);

  // Active Forensic Sample
  const [hoverSample, setHoverSample] = useState<ForensicSample | null>(null);
  const [pinnedSample, setPinnedSample] = useState<ForensicSample | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    setCenter(challenge.centerCoordinates);
    setZoom(challenge.defaultZoom);
    setPinnedSample(null);
    setHoverSample(
      sampleForensics(
        challenge.id,
        challenge.targetAnomaly.lat,
        challenge.targetAnomaly.lng
      )
    );
  }, [challenge]);

  const pixelToLatLng = useCallback(
    (pixelX: number, pixelY: number, width: number, height: number): [number, number] => {
      const { north, south, east, west } = challenge.boundingBox;
      const latRange = north - south;
      const lngRange = east - west;

      const zoomFactor = Math.pow(1.3, zoom - challenge.defaultZoom);
      const centerLat = center[0];
      const centerLng = center[1];

      const visibleLatSpan = latRange / zoomFactor;
      const visibleLngSpan = lngRange / zoomFactor;

      const normX = (pixelX / width) - 0.5;
      const normY = (pixelY / height) - 0.5;

      const lng = centerLng + normX * visibleLngSpan;
      const lat = centerLat - normY * visibleLatSpan;

      return [lat, lng];
    },
    [challenge, center, zoom]
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDraggingSlider && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (rawX / rect.width) * 100));
      setSliderPos(percentage);
      return;
    }

    if (containerRef.current && isCrosshairActive) {
      const rect = containerRef.current.getBoundingClientRect();
      const pixelX = e.clientX - rect.left;
      const pixelY = e.clientY - rect.top;

      const [lat, lng] = pixelToLatLng(pixelX, pixelY, rect.width, rect.height);
      const sample = sampleForensics(challenge.id, lat, lng);
      setHoverSample(sample);
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pixelX = e.clientX - rect.left;
    const pixelY = e.clientY - rect.top;

    const [lat, lng] = pixelToLatLng(pixelX, pixelY, rect.width, rect.height);
    const sample = sampleForensics(challenge.id, lat, lng);
    setPinnedSample(sample);
    soundFX.playRadarPing();
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    soundFX.playRadarPing();
    setTimeout(() => setCopiedText(null), 2000);
  };

  const sarOverlayUrl = generateProceduralSarOverlay(challenge.id);
  const activeSample = pinnedSample || hoverSample;

  return (
    <div className="flex flex-col h-full relative overflow-hidden select-none transition-colors duration-300 dark:bg-[#060a12] bg-slate-100">
      {/* Top Toolbar */}
      <div className="p-3 border-b z-30 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md transition-colors duration-300 dark:bg-[#0a1220]/95 dark:border-cyan-950/80 bg-white/95 border-slate-200 shadow-sm">
        {/* Left: Mode Badges */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-mono transition-colors dark:bg-cyan-950/80 dark:border-cyan-800 dark:text-cyan-300 bg-sky-50 border-sky-300 text-sky-800">
            <Radar className="w-3.5 h-3.5 dark:text-cyan-400 text-sky-600 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="font-bold">X-RAY SAR INSPECTOR</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono dark:text-slate-400 text-slate-500">
            <span>FRAME:</span>
            <span className="dark:text-slate-200 text-slate-700 font-medium">NISAR-L1-SLC</span>
          </div>
        </div>

        {/* Center: View Mode Switches */}
        <div className="flex items-center gap-1 p-1 rounded-lg border text-xs font-mono transition-colors dark:bg-[#050811] dark:border-slate-800 bg-slate-100 border-slate-300">
          <button
            onClick={() => setViewMode('curtain')}
            className={`px-2 py-1 rounded transition-colors cursor-pointer ${
              viewMode === 'curtain'
                ? 'dark:bg-cyan-600 dark:text-white bg-sky-600 text-white font-bold shadow-xs'
                : 'dark:text-slate-400 dark:hover:text-white text-slate-600 hover:text-slate-900'
            }`}
          >
            Curtain Swipe
          </button>
          <button
            onClick={() => setViewMode('optical')}
            className={`px-2 py-1 rounded transition-colors cursor-pointer ${
              viewMode === 'optical'
                ? 'dark:bg-cyan-600 dark:text-white bg-sky-600 text-white font-bold shadow-xs'
                : 'dark:text-slate-400 dark:hover:text-white text-slate-600 hover:text-slate-900'
            }`}
          >
            Optical (RGB)
          </button>
          <button
            onClick={() => setViewMode('sar')}
            className={`px-2 py-1 rounded transition-colors cursor-pointer ${
              viewMode === 'sar'
                ? 'dark:bg-cyan-600 dark:text-white bg-sky-600 text-white font-bold shadow-xs'
                : 'dark:text-slate-400 dark:hover:text-white text-slate-600 hover:text-slate-900'
            }`}
          >
            SAR Microwave
          </button>
          <button
            onClick={() => setViewMode('blend')}
            className={`px-2 py-1 rounded transition-colors cursor-pointer ${
              viewMode === 'blend'
                ? 'dark:bg-cyan-600 dark:text-white bg-sky-600 text-white font-bold shadow-xs'
                : 'dark:text-slate-400 dark:hover:text-white text-slate-600 hover:text-slate-900'
            }`}
          >
            50% Blend
          </button>
        </div>

        {/* Right: Map Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom((z) => Math.min(18, z + 1))}
            title="Zoom In"
            className="p-1.5 rounded border transition-colors cursor-pointer dark:bg-slate-900 dark:border-slate-800 dark:hover:border-cyan-600 dark:text-slate-300 dark:hover:text-cyan-300 bg-slate-100 border-slate-300 hover:border-sky-500 text-slate-700 hover:text-sky-700"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(8, z - 1))}
            title="Zoom Out"
            className="p-1.5 rounded border transition-colors cursor-pointer dark:bg-slate-900 dark:border-slate-800 dark:hover:border-cyan-600 dark:text-slate-300 dark:hover:text-cyan-300 bg-slate-100 border-slate-300 hover:border-sky-500 text-slate-700 hover:text-sky-700"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setCenter(challenge.centerCoordinates);
              setZoom(challenge.defaultZoom);
              soundFX.playRadarPing();
            }}
            title="Recenter to Mission Target"
            className="p-1.5 rounded border transition-colors cursor-pointer dark:bg-slate-900 dark:border-slate-800 dark:hover:border-cyan-600 dark:text-slate-300 dark:hover:text-cyan-300 bg-slate-100 border-slate-300 hover:border-sky-500 text-slate-700 hover:text-sky-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsCrosshairActive(!isCrosshairActive)}
            title={isCrosshairActive ? 'Disable Forensics Crosshairs' : 'Enable Forensics Crosshairs'}
            className={`p-1.5 rounded border transition-colors cursor-pointer ${
              isCrosshairActive
                ? 'dark:bg-emerald-950 dark:border-emerald-500 dark:text-emerald-300 bg-emerald-100 border-emerald-500 text-emerald-800'
                : 'dark:bg-slate-900 dark:border-slate-800 dark:text-slate-500 bg-slate-100 border-slate-300 text-slate-400'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Map Canvas Viewport */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseDown={(e) => {
          if (
            viewMode === 'curtain' &&
            Math.abs(
              e.clientX -
                (containerRef.current?.getBoundingClientRect().left || 0) -
                (sliderPos / 100) * (containerRef.current?.clientWidth || 1)
            ) < 20
          ) {
            setIsDraggingSlider(true);
          }
        }}
        onMouseUp={() => setIsDraggingSlider(false)}
        onClick={handleMapClick}
        className={`relative flex-1 w-full h-full overflow-hidden transition-colors duration-300 ${
          isCrosshairActive ? 'cursor-crosshair' : 'cursor-default'
        } dark:bg-[#070b14] bg-slate-200`}
      >
        {/* Layer 1: Simulated True-Color Optical Earth Satellite Layer */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <div
            className="w-full h-full bg-cover bg-center transition-all duration-300"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, #1a2f42 0%, #0d1b28 60%, #060e17 100%)`,
              filter: 'contrast(1.15) brightness(0.95)',
            }}
          >
            {/* Optical Topographic Simulation Grid */}
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-40">
              <defs>
                <pattern id="opticalGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#254252" strokeWidth="0.8" />
                  <circle cx="0" cy="0" r="1.5" fill="#38bdf8" opacity="0.6" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#opticalGrid)" />
            </svg>

            {/* Geographical Landform contours */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
              <div className="w-[85%] h-[85%] rounded-full border border-slate-700/40 border-dashed" />
              <div className="absolute w-[60%] h-[60%] rounded-full border border-slate-700/30" />
              <div className="absolute w-[35%] h-[35%] rounded-full border border-slate-700/20" />
            </div>
          </div>
        </div>

        {/* Layer 2: Microwave SAR Radar Overlay Layer */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-200"
          style={{
            clipPath:
              viewMode === 'curtain'
                ? `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)`
                : viewMode === 'optical'
                ? 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)'
                : 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
            opacity: viewMode === 'blend' ? 0.65 : 1.0,
          }}
        >
          {/* Procedural SAR Radar Visualization */}
          <img
            src={sarOverlayUrl}
            alt="SAR Overlay"
            className="w-full h-full object-cover select-none"
            style={{
              transform: `scale(${Math.pow(1.05, zoom - challenge.defaultZoom)})`,
              transformOrigin: 'center center',
            }}
          />
        </div>

        {/* X-Ray Vision Curtain Divider Handle (Draggable) */}
        {viewMode === 'curtain' && (
          <div
            className="absolute top-0 bottom-0 z-20 flex flex-col items-center cursor-ew-resize group"
            style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
          >
            {/* Vertical Line */}
            <div className="w-0.5 h-full dark:bg-cyan-400 bg-sky-500 dark:shadow-[0_0_10px_#00e5ff] shadow-[0_0_8px_rgba(2,132,199,0.5)]" />

            {/* Central Grab Handle */}
            <div className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg dark:bg-[#0a1628] dark:border-cyan-400 dark:shadow-[0_0_15px_rgba(6,182,212,0.6)] bg-white border-sky-600">
              <Sliders className="w-3.5 h-3.5 dark:text-cyan-300 text-sky-600" />
            </div>

            {/* Labels */}
            <div className="absolute top-4 -left-20 px-2 py-0.5 rounded text-[10px] font-mono shadow-sm dark:bg-black/80 dark:border-slate-700 dark:text-slate-300 bg-white/95 border border-slate-300 text-slate-800 font-bold">
              OPTICAL
            </div>
            <div className="absolute top-4 left-3 px-2 py-0.5 rounded text-[10px] font-mono shadow-sm dark:bg-cyan-950/90 dark:border-cyan-600 dark:text-cyan-300 bg-sky-600 text-white font-bold">
              SAR RADAR
            </div>
          </div>
        )}

        {/* The anomaly location is intentionally not marked: finding it is the CTF task. */}

        {/* Bottom Floating Forensic Telemetry HUD */}
        <div className="absolute bottom-4 left-4 right-4 z-30 pointer-events-auto">
          {activeSample && (
            <div className="p-3.5 rounded-lg border shadow-xl backdrop-blur-md font-mono text-xs max-w-2xl mx-auto transition-colors duration-300 dark:bg-[#071120]/95 dark:border-cyan-500/50 bg-white/95 border-sky-300">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b dark:border-cyan-950/80 border-slate-200">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-4 h-4 dark:text-cyan-400 text-sky-600" />
                  <span className="font-bold uppercase tracking-wider dark:text-white text-slate-900">
                    {pinnedSample ? 'LOCKED FORENSIC PIXEL' : 'LIVE SAMPLER READOUT'}
                  </span>
                  {pinnedSample && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded border dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-700 bg-sky-100 text-sky-800 border-sky-300 font-bold">
                      PINNED
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `${activeSample.lat}, ${activeSample.lng}`,
                        'coords'
                      )
                    }
                    className="flex items-center gap-1 text-[11px] px-2 py-1 rounded border transition-colors cursor-pointer dark:text-cyan-300 dark:hover:text-white dark:bg-slate-900 dark:border-slate-800 bg-sky-50 border-sky-200 text-sky-800 hover:bg-sky-100"
                  >
                    <Copy className="w-3 h-3 dark:text-cyan-400 text-sky-600" />
                    <span>{copiedText === 'coords' ? 'Copied Coordinates!' : 'Copy Coordinates'}</span>
                  </button>
                  {pinnedSample && (
                    <button
                      onClick={() => setPinnedSample(null)}
                      className="text-[11px] underline cursor-pointer dark:text-slate-400 dark:hover:text-white text-slate-500 hover:text-slate-900"
                    >
                      Clear Pin
                    </button>
                  )}
                </div>
              </div>

              {/* Forensic Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 rounded border transition-colors dark:bg-[#050914] dark:border-slate-900 bg-slate-50 border-slate-200">
                  <span className="block text-[10px] dark:text-slate-500 text-slate-400">COORDINATES</span>
                  <span className="font-bold dark:text-cyan-200 text-slate-800">
                    {activeSample.lat.toFixed(5)}°N, {activeSample.lng.toFixed(5)}°W
                  </span>
                </div>

                <div className="p-2 rounded border transition-colors dark:bg-[#050914] dark:border-slate-900 bg-slate-50 border-slate-200">
                  <span className="block text-[10px] dark:text-slate-500 text-slate-400">BACKSCATTER (σ0)</span>
                  <span
                    className={`font-bold ${
                      activeSample.sigma0Db > 10
                        ? 'dark:text-cyan-300 text-sky-700'
                        : activeSample.sigma0Db < -20
                        ? 'dark:text-rose-400 text-rose-700'
                        : 'dark:text-amber-300 text-amber-700'
                    }`}
                  >
                    {activeSample.sigma0Db > 0 ? `+${activeSample.sigma0Db}` : activeSample.sigma0Db} dB
                  </span>
                </div>

                <div className="p-2 rounded border transition-colors dark:bg-[#050914] dark:border-slate-900 bg-slate-50 border-slate-200">
                  <span className="block text-[10px] dark:text-slate-500 text-slate-400">COHERENCE (γ)</span>
                  <span
                    className={`font-bold ${
                      activeSample.coherence < 0.25
                        ? 'dark:text-rose-400 text-rose-700'
                        : 'dark:text-emerald-400 text-emerald-700'
                    }`}
                  >
                    γ = {activeSample.coherence}
                  </span>
                </div>

                <div className="p-2 rounded border transition-colors dark:bg-[#050914] dark:border-slate-900 bg-slate-50 border-slate-200">
                  <span className="block text-[10px] dark:text-slate-500 text-slate-400">InSAR SLIP</span>
                  <span className="font-bold dark:text-purple-300 text-purple-700">
                    {activeSample.displacementCm} cm ({activeSample.fringeCount} fringes)
                  </span>
                </div>
              </div>

              {/* Surface Classification Tag */}
              <div className="mt-2 pt-2 border-t flex items-center justify-between text-[11px] dark:border-cyan-950/60 border-slate-200">
                <div className="flex items-center gap-1.5 dark:text-slate-300 text-slate-700">
                  <span className="dark:text-slate-500 text-slate-400">Surface Class:</span>
                  <span className="font-semibold dark:text-emerald-300 text-emerald-800">{activeSample.surfaceClass}</span>
                </div>
                <div className="dark:text-slate-500 text-slate-400 text-[10px]">
                  Confidence: <span className="dark:text-cyan-400 text-sky-700 font-bold">{activeSample.confidence}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="p-2 border-t px-4 flex flex-wrap items-center justify-between text-[11px] font-mono transition-colors duration-300 dark:bg-[#08101e] dark:border-cyan-950/80 dark:text-slate-400 bg-white border-slate-200 text-slate-600">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 dark:text-cyan-400 text-sky-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full dark:bg-cyan-400 bg-sky-600" />
            SWATH: 242 KM
          </span>
          <span>&bull;</span>
          <span>INCIDENCE: {challenge.satellite.lookAngleDeg}°</span>
          <span>&bull;</span>
          <span>WAVELENGTH: {challenge.satellite.wavelengthCm} CM</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="dark:text-slate-500 text-slate-400">Curtain swipe:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="w-24 h-1 rounded-lg appearance-none cursor-pointer dark:bg-slate-800 dark:accent-cyan-400 bg-slate-300 accent-sky-600"
          />
          <span className="w-8 dark:text-cyan-300 text-sky-800 font-bold">{Math.round(sliderPos)}%</span>
        </div>
      </div>
    </div>
  );
}
