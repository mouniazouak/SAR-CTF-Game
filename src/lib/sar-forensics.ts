import { LevelId, ForensicSample } from '@/types/ctf';

export interface AnomalyProfile {
  centerLat: number;
  centerLng: number;
  radiusDeg: number;
  targetName: string;
}

export const ANOMALY_PROFILES: Record<LevelId, AnomalyProfile> = {
  'level-0': {
    centerLat: 34.8722,
    centerLng: -118.1564,
    radiusDeg: 0.006,
    targetName: 'Trihedral Cal-Reflector TR-04',
  },
  'level-1': {
    centerLat: 39.4628,
    centerLng: -0.4285,
    radiusDeg: 0.025,
    targetName: 'Submerged Multi-Modal Terminal C (Turia)',
  },
  'level-2': {
    centerLat: 52.8732,
    centerLng: -118.0821,
    radiusDeg: 0.035,
    targetName: 'Jasper High-Severity Burn Scar',
  },
  'level-3': {
    centerLat: 35.7692,
    centerLng: -117.5994,
    radiusDeg: 0.040,
    targetName: 'Ridgecrest Strike-Slip Fault Rupture',
  },
};

/**
 * Calculates synthetic radar backscatter, InSAR coherence, phase fringes,
 * and surface classification based on ground-truth geospatial physics.
 */
export function sampleForensics(levelId: LevelId, lat: number, lng: number): ForensicSample {
  const profile = ANOMALY_PROFILES[levelId];
  if (!profile) {
    return {
      lat,
      lng,
      sigma0Db: -14.0,
      coherence: 0.5,
      displacementCm: 0,
      fringeCount: 0,
      surfaceClass: 'Unclassified Scatterer',
      confidence: 70,
    };
  }

  const dLat = lat - profile.centerLat;
  const dLng = lng - profile.centerLng;
  const distanceDeg = Math.sqrt(dLat * dLat + dLng * dLng);
  const normalizedDist = Math.min(1.0, distanceDeg / profile.radiusDeg);
  const proximityFactor = Math.max(0, 1.0 - normalizedDist);

  switch (levelId) {
    case 'level-0': {
      // Point reflector on flat dry lake
      // Background: -19.5 dB. Center spike: +24.8 dB
      const sigma0 = proximityFactor > 0.6
        ? -19.5 + Math.pow(proximityFactor, 4) * 44.3
        : -19.5 + (Math.sin(lat * 1000) * 0.8);
      const coherence = 0.92 + proximityFactor * 0.07;
      const isReflector = proximityFactor > 0.85;

      return {
        lat: Number(lat.toFixed(5)),
        lng: Number(lng.toFixed(5)),
        sigma0Db: Number(sigma0.toFixed(2)),
        coherence: Number(Math.min(0.99, coherence).toFixed(2)),
        displacementCm: 0.0,
        fringeCount: 0,
        surfaceClass: isReflector
          ? 'Trihedral Metal Corner Reflector (Point Target)'
          : 'Dry Playa Mud Flats (Low Backscatter)',
        confidence: isReflector ? 99 : 88,
      };
    }

    case 'level-1': {
      // Inundated flood zone
      // Background: -9.5 dB (urban/soil). Water: -23.4 dB (specular loss)
      const sigma0 = -9.5 - proximityFactor * 13.9 + Math.cos(lng * 500) * 0.5;
      const coherence = Math.max(0.08, 0.68 - proximityFactor * 0.56);
      const isFlooded = proximityFactor > 0.45;

      return {
        lat: Number(lat.toFixed(5)),
        lng: Number(lng.toFixed(5)),
        sigma0Db: Number(sigma0.toFixed(2)),
        coherence: Number(coherence.toFixed(2)),
        displacementCm: 0.0,
        fringeCount: 0,
        surfaceClass: isFlooded
          ? 'Specular Water Surface (Flooded Logistics Corridor)'
          : 'Non-Inundated Urban/Alluvial Soil',
        confidence: isFlooded ? 96 : 82,
      };
    }

    case 'level-2': {
      // Wildfire burn scar
      // Background: Healthy forest -11.0 dB, coherence 0.75. Burn: -14.6 dB, coherence 0.14
      const sigma0 = -11.0 - proximityFactor * 3.6 + Math.sin(lat * 300) * 0.4;
      const coherence = Math.max(0.12, 0.74 - proximityFactor * 0.60);
      const isBurnScar = proximityFactor > 0.5;

      return {
        lat: Number(lat.toFixed(5)),
        lng: Number(lng.toFixed(5)),
        sigma0Db: Number(sigma0.toFixed(2)),
        coherence: Number(coherence.toFixed(2)),
        displacementCm: Number((-1.2 * proximityFactor).toFixed(1)),
        fringeCount: 0,
        surfaceClass: isBurnScar
          ? 'High-Severity Burn Scar (Canopy Decorrelation)'
          : 'Coniferous Canopy (Intact Volumetric Scatterer)',
        confidence: isBurnScar ? 94 : 85,
      };
    }

    case 'level-3': {
      // Tectonic fault slip interferogram
      // NISAR L-band wavelength: 24 cm -> 12 cm per fringe
      // Fault slip peaks at 48 cm (4 full fringes)
      const maxSlipCm = 48.0;
      const displacement = maxSlipCm * Math.pow(proximityFactor, 1.5);
      const fringeCycle = displacement / 12.0; // 1 fringe = 12cm
      const isFaultTrace = proximityFactor > 0.7;

      return {
        lat: Number(lat.toFixed(5)),
        lng: Number(lng.toFixed(5)),
        sigma0Db: Number((-11.5 + Math.sin(lng * 200) * 1.5).toFixed(2)),
        coherence: Number((0.88 - proximityFactor * 0.15).toFixed(2)),
        displacementCm: Number(displacement.toFixed(1)),
        fringeCount: Number(fringeCycle.toFixed(2)),
        surfaceClass: isFaultTrace
          ? 'Primary Fault Rupture (Peak Strike-Slip Displacement)'
          : 'DInSAR Coherent Far-Field Alluvium',
        confidence: isFaultTrace ? 98 : 90,
      };
    }
  }
}

/**
 * Returns procedural SVG data URL representing the SAR microwave layer
 * (Backscatter, Inundation mask, Coherence decorrelation, or InSAR fringe pattern).
 * This ensures full offline resilience during hackathon judging even if external tile servers fail!
 */
export function generateProceduralSarOverlay(levelId: LevelId): string {
  switch (levelId) {
    case 'level-0':
      // Calibration point target on lake bed
      return `data:image/svg+xml;utf8,` + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
          <defs>
            <filter id="speckle" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
              <feColorMatrix type="matrix" values="0.2 0 0 0 0.05   0 0.3 0 0 0.1   0 0 0.3 0 0.1   0 0 0 0.8 0" />
            </filter>
            <radialGradient id="pointSpike" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
              <stop offset="10%" stop-color="#00ffcc" stop-opacity="0.9" />
              <stop offset="35%" stop-color="#0088ff" stop-opacity="0.6" />
              <stop offset="70%" stop-color="#001133" stop-opacity="0.2" />
              <stop offset="100%" stop-color="#000000" stop-opacity="0" />
            </radialGradient>
          </defs>
          <rect width="600" height="600" fill="#0d1824" />
          <rect width="600" height="600" filter="url(#speckle)" opacity="0.65" />
          <!-- Dry lake bed boundary -->
          <ellipse cx="300" cy="300" rx="240" ry="190" fill="#15263a" opacity="0.7" stroke="#25476d" stroke-width="2" stroke-dasharray="6,4" />
          <!-- Radiometric grid lines -->
          <path d="M 100 300 L 500 300 M 300 100 L 300 500" stroke="#00e5ff" stroke-width="1" opacity="0.3" stroke-dasharray="4,8" />
          <!-- Trihedral Corner Reflector Point Target (Extreme backscatter spike) -->
          <circle cx="300" cy="300" r="45" fill="url(#pointSpike)" />
          <circle cx="300" cy="300" r="3" fill="#ffffff" stroke="#00ffff" stroke-width="1.5" />
          <!-- Crosshairs -->
          <line x1="285" y1="300" x2="315" y2="300" stroke="#00ffcc" stroke-width="1.5" />
          <line x1="300" y1="285" x2="300" y2="315" stroke="#00ffcc" stroke-width="1.5" />
          <text x="315" y="290" fill="#00ffcc" font-family="monospace" font-size="12" font-weight="bold">TR-04 CAL-REFLECTOR (+24.8 dB)</text>
        </svg>
      `);

    case 'level-1':
      // Flood detection: Turia basin specular water anomaly
      return `data:image/svg+xml;utf8,` + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
          <defs>
            <filter id="sarSpeckle" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="4" result="noise" />
              <feColorMatrix type="matrix" values="0.3 0 0 0 0.15  0 0.4 0 0 0.18  0 0 0.4 0 0.2  0 0 0 0.75 0" />
            </filter>
            <linearGradient id="floodDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#020509" stop-opacity="0.95" />
              <stop offset="100%" stop-color="#040b17" stop-opacity="0.9" />
            </linearGradient>
          </defs>
          <rect width="600" height="600" fill="#1c2836" />
          <rect width="600" height="600" filter="url(#sarSpeckle)" opacity="0.6" />
          <!-- River channel -->
          <path d="M 50 180 Q 200 240 300 290 T 550 420" stroke="#02060c" stroke-width="18" fill="none" opacity="0.9" />
          <!-- Major Inundation Zone (Specular reflection - Dark signal void) -->
          <path d="M 210 240 C 260 210, 380 230, 420 280 C 460 330, 410 410, 330 420 C 240 430, 190 360, 200 300 Z"
                fill="url(#floodDark)" stroke="#00e5ff" stroke-width="2" stroke-dasharray="5,3" />
          <path d="M 230 260 C 270 235, 360 250, 390 295 C 420 340, 380 390, 320 395 C 260 400, 220 340, 230 290 Z"
                fill="#000000" opacity="0.6" />
          <text x="240" y="335" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="bold">SPECULAR WATER ANOMALY</text>
          <text x="240" y="352" fill="#ef4444" font-family="monospace" font-size="11">BACKSCATTER: -23.4 dB (TURIA SURGE)</text>
        </svg>
      `);

    case 'level-2':
      // Wildfire burn scar coherence loss (Jasper)
      return `data:image/svg+xml;utf8,` + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
          <defs>
            <filter id="flameNoise" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="4" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="25" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <radialGradient id="burnGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ff1e00" stop-opacity="0.8" />
              <stop offset="40%" stop-color="#ff7b00" stop-opacity="0.6" />
              <stop offset="75%" stop-color="#990055" stop-opacity="0.4" />
              <stop offset="100%" stop-color="#111827" stop-opacity="0" />
            </radialGradient>
          </defs>
          <rect width="600" height="600" fill="#0f1f18" />
          <!-- Healthy vegetation canopy coherence background -->
          <rect width="600" height="600" fill="#143422" opacity="0.75" />
          <!-- River valley boundary -->
          <path d="M 80 50 Q 250 250 310 320 T 480 580" stroke="#1d4ed8" stroke-width="12" fill="none" opacity="0.6" />
          <!-- Severe Burn Scar Coherence Loss Perimeter -->
          <path d="M 240 180 C 340 160, 430 220, 420 330 C 410 440, 310 480, 220 440 C 140 400, 150 280, 210 210 Z"
                fill="url(#burnGradient)" filter="url(#flameNoise)" stroke="#f59e0b" stroke-width="2.5" />
          <!-- Center of catastrophic decorrelation -->
          <ellipse cx="300" cy="310" rx="60" ry="45" fill="#7f1d1d" opacity="0.85" stroke="#ef4444" stroke-width="1.5" />
          <text x="210" y="315" fill="#fef08a" font-family="monospace" font-size="12" font-weight="bold">SEVERE CANOPY DECORRELATION</text>
          <text x="225" y="335" fill="#ffffff" font-family="monospace" font-size="11">COHERENCE γ = 0.14 (JASPER)</text>
        </svg>
      `);

    case 'level-3':
      // Tectonic fault slip: Differential InSAR cyclic color fringes (Ridgecrest)
      return `data:image/svg+xml;utf8,` + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
          <defs>
            <filter id="insarNoise">
              <feTurbulence type="fractalNoise" baseFrequency="0.3" numOctaves="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" />
            </filter>
          </defs>
          <rect width="600" height="600" fill="#0b1324" />
          <!-- InSAR Rainbow Phase Fringes (Each cycle = 12 cm displacement) -->
          <!-- Fringe 1: 0 - 12 cm -->
          <ellipse cx="300" cy="300" rx="270" ry="180" fill="none" stroke="#ef4444" stroke-width="16" opacity="0.8" filter="url(#insarNoise)" />
          <ellipse cx="300" cy="300" rx="255" ry="165" fill="none" stroke="#f59e0b" stroke-width="14" opacity="0.8" filter="url(#insarNoise)" />
          <ellipse cx="300" cy="300" rx="240" ry="150" fill="none" stroke="#10b981" stroke-width="14" opacity="0.8" filter="url(#insarNoise)" />
          <ellipse cx="300" cy="300" rx="225" ry="135" fill="none" stroke="#06b6d4" stroke-width="14" opacity="0.8" filter="url(#insarNoise)" />
          <ellipse cx="300" cy="300" rx="210" ry="120" fill="none" stroke="#a855f7" stroke-width="14" opacity="0.8" filter="url(#insarNoise)" />

          <!-- Fringe 2: 12 - 24 cm -->
          <ellipse cx="300" cy="300" rx="190" ry="105" fill="none" stroke="#ef4444" stroke-width="14" opacity="0.85" filter="url(#insarNoise)" />
          <ellipse cx="300" cy="300" rx="175" ry="92" fill="none" stroke="#f59e0b" stroke-width="12" opacity="0.85" filter="url(#insarNoise)" />
          <ellipse cx="300" cy="300" rx="160" ry="80" fill="none" stroke="#10b981" stroke-width="12" opacity="0.85" filter="url(#insarNoise)" />
          <ellipse cx="300" cy="300" rx="145" ry="70" fill="none" stroke="#06b6d4" stroke-width="12" opacity="0.85" filter="url(#insarNoise)" />
          <ellipse cx="300" cy="300" rx="130" ry="60" fill="none" stroke="#a855f7" stroke-width="12" opacity="0.85" filter="url(#insarNoise)" />

          <!-- Fringe 3: 24 - 36 cm -->
          <ellipse cx="300" cy="300" rx="110" ry="50" fill="none" stroke="#ef4444" stroke-width="12" opacity="0.9" />
          <ellipse cx="300" cy="300" rx="95" ry="42" fill="none" stroke="#f59e0b" stroke-width="10" opacity="0.9" />
          <ellipse cx="300" cy="300" rx="80" ry="34" fill="none" stroke="#10b981" stroke-width="10" opacity="0.9" />
          <ellipse cx="300" cy="300" rx="65" ry="26" fill="none" stroke="#06b6d4" stroke-width="10" opacity="0.9" />
          <ellipse cx="300" cy="300" rx="50" ry="18" fill="none" stroke="#a855f7" stroke-width="10" opacity="0.9" />

          <!-- Fringe 4: 36 - 48 cm (Peak Displacement) -->
          <ellipse cx="300" cy="300" rx="35" ry="12" fill="none" stroke="#ef4444" stroke-width="8" opacity="0.95" />
          <ellipse cx="300" cy="300" rx="20" ry="7" fill="#ffffff" stroke="#f59e0b" stroke-width="6" opacity="0.95" />

          <!-- Primary Strike-Slip Fault Rupture Trace -->
          <line x1="80" y1="120" x2="520" y2="480" stroke="#ffffff" stroke-width="3" stroke-dasharray="10,5" opacity="0.95" />
          <circle cx="300" cy="300" r="5" fill="#ef4444" stroke="#ffffff" stroke-width="2" />

          <text x="180" y="270" fill="#ffffff" font-family="monospace" font-size="12" font-weight="bold">InSAR PHASE FRINGES (λ/2 = 12cm)</text>
          <text x="210" y="288" fill="#a855f7" font-family="monospace" font-size="11">4 CYCLES = 48cm FAULT SLIP</text>
        </svg>
      `);
  }
}
