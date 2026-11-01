'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Challenge, ForensicSample } from '@/types/ctf';
import { sampleForensics, generateProceduralSarOverlay } from '@/lib/sar-forensics';
import {
  Maximize2,
  Crosshair,
  Sliders,
  Eye,
  Radar,
  MapPin,
  Layers,
  Copy,
  Info,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Target,
  Sparkles,
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

  // Reset view when challenge changes
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

  // Convert pixel coordinate to Geographic Lat/Lng relative to bounding box
  const pixelToLatLng = useCallback(
    (pixelX: number, pixelY: number, width: number, height: number): [number, number] => {
      const { north, south, east, west } = challenge.boundingBox;
      const latRange = north - south;
      const lngRange = east - west;

      // Adjust for zoom factor
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

  // Convert Lat/Lng to pixel coordinate
  const latLngToPixel = useCallback(
    (lat: number, lng: number, width: number, height: number): [number, number] => {
      const { north, south, east, west } = challenge.boundingBox;
      const latRange = north - south;
      const lngRange = east - west;

      const zoomFactor = Math.pow(1.3, zoom - challenge.defaultZoom);
      const centerLat = center[0];
      const centerLng = center[1];

      const visibleLatSpan = latRange / zoomFactor;
      const visibleLngSpan = lngRange / zoomFactor;

      const normX = (lng - centerLng) / visibleLngSpan;
      const normY = (centerLat - lat) / visibleLatSpan;

      const pixelX = (normX + 0.5) * width;
      const pixelY = (normY + 0.5) * height;

      return [pixelX, pixelY];
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
    <div className="flex flex-col h-full bg-[#060a12] relative overflow-hidden select-none">
      {/* Top Toolbar */}
      <div className="p-3 bg-[#0a1220]/95 border-b border-cyan-950/80 backdrop-blur-md z-30 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Mode Badges */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-mono">
            <Radar className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="font-bold">X-RAY SAR INSPECTOR</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-400">
            <span className="text-slate-500">FRAME:</span>
            <span className="text-slate-200">NISAR-L1-SLC</span>
          </div>
        </div>

        {/* Center: View Mode Switches */}
        <div className="flex items-center gap-1 bg-[#050811] p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setViewMode('curtain')}
            className={`px-2 py-1 rounded transition-colors ${
              viewMode === 'curtain'
                ? 'bg-cyan-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Curtain Swipe
          </button>
          <button
            onClick={() => setViewMode('optical')}
            className={`px-2 py-1 rounded transition-colors ${
              viewMode === 'optical'
                ? 'bg-cyan-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Optical (RGB)
          </button>
          <button
            onClick={() => setViewMode('sar')}
            className={`px-2 py-1 rounded transition-colors ${
              viewMode === 'sar'
                ? 'bg-cyan-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            SAR Microwave
          </button>
          <button
            onClick={() => setViewMode('blend')}
            className={`px-2 py-1 rounded transition-colors ${
              viewMode === 'blend'
                ? 'bg-cyan-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            50% Blend
          </button>
        </div>

        {/* Right: Map Controls */}
        <div className="flex items-center gap-1 text-slate-300">
          <button
            onClick={() => setZoom((z) => Math.min(18, z + 1))}
            title="Zoom In"
            className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-cyan-600 hover:text-cyan-300 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(8, z - 1))}
            title="Zoom Out"
            className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-cyan-600 hover:text-cyan-300 transition-colors"
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
            className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-cyan-600 hover:text-cyan-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsCrosshairActive(!isCrosshairActive)}
            title={isCrosshairActive ? 'Disable Forensics Crosshairs' : 'Enable Forensics Crosshairs'}
            className={`p-1.5 rounded border transition-colors ${
              isCrosshairActive
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
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
          if (viewMode === 'curtain' && Math.abs(e.clientX - (containerRef.current?.getBoundingClientRect().left || 0) - (sliderPos / 100) * (containerRef.current?.clientWidth || 1)) < 20) {
            setIsDraggingSlider(true);
          }
        }}
        onMouseUp={() => setIsDraggingSlider(false)}
        onClick={handleMapClick}
        className={`relative flex-1 w-full h-full overflow-hidden bg-[#070b14] ${
          isCrosshairActive ? 'cursor-crosshair' : 'cursor-default'
        }`}
      >
        {/* Layer 1: Simulated Realistic True-Color Optical Earth Satellite Layer */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-300"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, #172a3a 0%, #0c1822 65%, #050d14 100%)`,
              filter: 'contrast(1.15) brightness(0.95)',
            }}
          >
            {/* Optical Topographic Simulation Grid */}
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-40">
              <defs>
                <pattern id="opticalGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#254252" strokeWidth="0.8" />
                  <circle cx="0" cy="0" r="1.5" fill="#3b82f6" opacity="0.6" />
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
            <div className="w-0.5 h-full bg-cyan-400 shadow-[0_0_10px_#00e5ff]" />

            {/* Central Grab Handle */}
            <div className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#0a1628] border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.6)] group-hover:scale-110 transition-transform">
              <Sliders className="w-3.5 h-3.5 text-cyan-300" />
            </div>

            {/* Labels */}
            <div className="absolute top-4 -left-20 px-2 py-0.5 rounded bg-black/80 border border-slate-700 text-[10px] font-mono text-slate-300">
              OPTICAL
            </div>
            <div className="absolute top-4 left-3 px-2 py-0.5 rounded bg-cyan-950/90 border border-cyan-600 text-[10px] font-mono text-cyan-300">
              SAR RADAR
            </div>
          </div>
        )}

        {/* Pinpoint Anomaly Beacon Marker */}
        {containerRef.current && (
          <div
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              left: `${latLngToPixel(challenge.targetAnomaly.lat, challenge.targetAnomaly.lng, containerRef.current.clientWidth || 600, containerRef.current.clientHeight || 500)[0]}px`,
              top: `${latLngToPixel(challenge.targetAnomaly.lat, challenge.targetAnomaly.lng, containerRef.current.clientWidth || 600, containerRef.current.clientHeight || 500)[1]}px`,
            }}
          >
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-cyan-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 border-2 border-white shadow-[0_0_12px_#00ffff]"></span>
            </div>
          </div>
        )}

        {/* Bottom Floating Forensic Telemetry HUD */}
        <div className="absolute bottom-4 left-4 right-4 z-30 pointer-events-auto">
          {activeSample && (
            <div className="p-3.5 rounded-lg bg-[#071120]/95 border border-cyan-500/50 shadow-[0_4px_25px_rgba(0,0,0,0.8)] backdrop-blur-md font-mono text-xs max-w-2xl mx-auto">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-cyan-950/80">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-white uppercase tracking-wider">
                    {pinnedSample ? 'LOCKED FORENSIC PIXEL' : 'LIVE SAMPLER READOUT'}
                  </span>
                  {pinnedSample && (
                    <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-700">
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
                    className="flex items-center gap-1 text-[11px] text-cyan-300 hover:text-white bg-slate-900 px-2 py-1 rounded border border-slate-800 transition-colors"
                  >
                    <Copy className="w-3 h-3 text-cyan-400" />
                    <span>{copiedText === 'coords' ? 'Copied Coordinates!' : 'Copy Coordinates'}</span>
                  </button>
                  {pinnedSample && (
                    <button
                      onClick={() => setPinnedSample(null)}
                      className="text-[11px] text-slate-400 hover:text-white underline"
                    >
                      Clear Pin
                    </button>
                  )}
                </div>
              </div>

              {/* Forensic Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="bg-[#050914] p-2 rounded border border-slate-900">
                  <span className="text-slate-500 block text-[10px]">COORDINATES</span>
                  <span className="text-cyan-200 font-bold">
                    {activeSample.lat.toFixed(5)}°N, {activeSample.lng.toFixed(5)}°W
                  </span>
                </div>

                <div className="bg-[#050914] p-2 rounded border border-slate-900">
                  <span className="text-slate-500 block text-[10px]">RADAR BACKSCATTER (σ0)</span>
                  <span
                    className={`font-bold ${
                      activeSample.sigma0Db > 10
                        ? 'text-cyan-300'
                        : activeSample.sigma0Db < -20
                        ? 'text-rose-400'
                        : 'text-amber-300'
                    }`}
                  >
                    {activeSample.sigma0Db > 0 ? `+${activeSample.sigma0Db}` : activeSample.sigma0Db} dB
                  </span>
                </div>

                <div className="bg-[#050914] p-2 rounded border border-slate-900">
                  <span className="text-slate-500 block text-[10px]">TEMPORAL COHERENCE (γ)</span>
                  <span
                    className={`font-bold ${
                      activeSample.coherence < 0.25 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    γ = {activeSample.coherence}
                  </span>
                </div>

                <div className="bg-[#050914] p-2 rounded border border-slate-900">
                  <span className="text-slate-500 block text-[10px]">InSAR DISPLACEMENT</span>
                  <span className="text-purple-300 font-bold">
                    {activeSample.displacementCm} cm ({activeSample.fringeCount} fringes)
                  </span>
                </div>
              </div>

              {/* Surface Classification Tag */}
              <div className="mt-2 pt-2 border-t border-cyan-950/60 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="text-slate-500">Surface Scatterer:</span>
                  <span className="font-semibold text-emerald-300">{activeSample.surfaceClass}</span>
                </div>
                <div className="text-slate-500 text-[10px]">
                  Confidence: <span className="text-cyan-400">{activeSample.confidence}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="p-2 bg-[#08101e] border-t border-cyan-950/80 px-4 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            SWATH: 242 KM
          </span>
          <span>&bull;</span>
          <span>INCIDENCE: {challenge.satellite.lookAngleDeg}°</span>
          <span>&bull;</span>
          <span>WAVELENGTH: {challenge.satellite.wavelengthCm} CM</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">Curtain swipe:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="w-24 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="text-cyan-300 w-8">{Math.round(sliderPos)}%</span>
        </div>
      </div>
    </div>
  );
}
