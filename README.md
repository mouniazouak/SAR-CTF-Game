# Dancing with the SARs: Jeopardy-Style CTF & Forensic Workbench
> **NASA International Space Apps Challenge**  
> *Geospatial Intelligence, Microwave Radar Forensics & CTF Challenge Engine*

![Mission Status](https://img.shields.io/badge/NISAR%20L--SAR-ACTIVE%20LOCK-00e5ff?style=for-the-badge)
![Security Layer](https://img.shields.io/badge/Flag%20Security-IMMUTABLE%20SERVER--SIDE-10b981?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16%20App%20Router-white?style=for-the-badge&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript)

---

## 🛰️ Executive Overview

**Dancing with the SARs** is a dark-mode Security Operations Center (SOC) forensics workbench and progressive Jeopardy-style CTF game engine designed for the **NASA International Space Apps Challenge**. It challenges players to act as Earth Observation Forensics Officers analyzing synthetic aperture radar (SAR) telemetry downlinked from the **NISAR (NASA-ISRO SAR)** and **Sentinel-1** satellites.

Unlike optical sensors blinded by darkness or cloud cover, microwave radar pulses (L-band and C-band) penetrate clouds, rain, and smoke plumes. By examining radar backscatter intensity ($\sigma^0$), temporal interferometric coherence ($\gamma$), and phase fringes ($\Delta\phi$), players investigate natural disasters, locate covert calibration arrays, track wildfire burn scars, and quantify millimeter-scale tectonic crust displacements.

---

## 🎮 Core Gameplay & Progressive Level Matrix

The game implements strict progressive level unlocking: Level 0 is available immediately, and each subsequent orbital pass unlocks upon authenticating the prerequisite level's telemetry flag.

| Level | Codename | Category | Mission Target | Physical Phenomenon & Metric | Base Pts |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Level 0** | `PROJECT ROSAMOND` | Radiometric Calibration | Rosamond Dry Lake, CA | Trihedral point corner reflector retroreflection ($\sigma^0 > +20\text{ dB}$) | **50 PTS** |
| **Level 1** | `OPERATION TURIA FALSE POSITIVE` | SAR Interpretation | Manises Airport, Valencia | Distinguish a radar-dark runway from new floodwater | **100 PTS** |
| **Level 2** | `JASPER PYRO-RADAR` | Biomass & Coherence Loss | Athabasca Valley, Jasper | Destructive canopy decorrelation ($\gamma < 0.20$) | **250 PTS** |
| **Level 3** | `SEISMIC RIDGE INTERFEROGRAM` | InSAR Crustal Deformation | Ridgecrest Fault Zone, CA | Differential phase fringes ($\Delta r = \frac{\lambda}{2} = 12\text{ cm}$/fringe) | **500 PTS** |
| **Level 4** | `GHOST ORBIT` | Mission Data Forensics | NISAR Ground Data Relay | Timeline, checksum, metadata, and visual evidence correlation | **1000 PTS** |
| **Level 5** | `SILENT INVITATION` | Email Forensics | Mission Operations Mail Gateway | Identify a simulated mission-control phishing attempt | **700 PTS** |
| **Level 6** | `CLOUD ECLIPSE` | Cloud Configuration | Earth Observation Data Archive | Find a simulated public-read policy misconfiguration | **800 PTS** |
| **Level 7** | `NIGHT PASS` | Log Forensics | SAR Downlink Authentication Service | Reconstruct a simulated telemetry intrusion timeline | **900 PTS** |
| **Level 8** | `LAST TRANSMISSION` | Web Integrity | Public Mission Status Portal | Compare snapshots and identify a modified mission asset | **1200 PTS** |

---

## 🛡️ Security Architecture & Anti-Cheating Engine

1. **Immutable Server-Side Flag Storage**:
   - Ground-truth flags strictly reside within `src/lib/server/flags.ts` and are **never bundled into client-side JavaScript**.
   - Client endpoints (`GET /api/challenges`) execute deep sanitization that strips flag strings and masks unrevealed hint texts.
2. **Constant-Time Verification (`verifyFlag`)**:
   - Compares incoming flag strings byte-by-byte using bitwise XOR operations to eliminate side-channel timing attacks.
3. **Dynamic Scoring & Hint Penalty Enforcement**:
   - Revealing tactical hints via `POST /api/hints/reveal` permanently deducts **25%** of that level's maximum yield.
   - Dynamic yield calculation: $\text{CurrentPoints} = \text{BasePoints} \times \max(0.25, 1 - 0.25 \times N_{\text{hints}})$.
4. **Demodulation Rate Limiting**:
   - Throttles brute-force submission loops to 12 attempts per minute per challenge with automatic exponential backoff.
5. **Session Management Without Friction**:
   - Instant guest entry with tactical callsigns (`Astro-Specter-412`) stored via tamper-resistant cookies and local tokens, requiring zero registration friction during judge presentations.

---

## 🔬 Geospatial Forensics Interface (SOC Mode)

- **Split View Layout**:
  - **Left Panel (Incident Forensics)**: Satellite metadata (polarization HH/HV/VV/VH, frequency 1.25 GHz, look angle, pass direction), tactical briefing, real-time synthetic telemetry log stream, hint decryption console, and flag validator.
  - **Right Panel (Interactive Dual-Layer Map)**: High-resolution satellite workspace with interactive **"X-Ray Vision"** swipe curtain to transition seamlessly between optical RGB baselines and microwave SAR overlays.
- **Forensic Coordinate & Intensity Sampler**:
  - Live crosshair mode allowing players to click or hover any geographic coordinate.
  - Real-time physics engine sampling latitude, longitude, radar backscatter ($\sigma^0\text{ in dB}$), interferometric coherence ($\gamma$), line-of-sight displacement ($\text{cm}$), and surface classification.
- **Synthesized Web Audio Engine**:
  - Authentic military/space operations sounds generated entirely via client-side Web Audio API (radar sweeps, crosshair clicks, access granted fanfare, access denied buzzer). Zero external MP3/WAV assets required.

---

## 🚀 Quickstart & Hackathon Deployment

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/Majida-1/SAR-CTF-Game.git
cd SAR-CTF-Game

# Install dependencies
npm install
```

### 2. Run Locally in Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build & Verification
```bash
npm run build
npm start
```

### 4. Run Game Engine Automated Test Suite
```bash
npx tsx test-engine.mjs
```
Runs 30 automated integration assertions covering flag verification, hint deductions, progressive unlocking, and microwave forensics calculations.

### 5. Configure the Gemini Forensics Assistant
Copy `.env.example` to `.env.local`, then paste the Gemini API key created in Google AI Studio into `GEMINI_API_KEY`:

```bash
copy .env.example .env.local
```

The key is used only by `POST /api/ai/analyze` on the server and is never sent to the browser. The assistant receives public challenge evidence and explains the SAR reasoning without revealing flags. The default model is `gemini-3.5-flash-lite`; restart `npm run dev` after changing `.env.local`.

---

## 🔄 CI / Automated Build Verification

Automated continuous integration is pre-configured via GitHub Actions in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):

```yaml
name: CI / Build Verification
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm run build
```

---

## 📡 Physical Principles & Flag Cheat Sheet (Judge Reference Only)

> [!WARNING]
> Ground-truth flags for testing and judge demonstration:

| Level | Physical Anomaly | Verification Flag |
| :--- | :--- | :--- |
| **Level 0** | Trihedral Corner Reflector (+24.8 dB spike at 34.8722°N) | `flag{nisar_cal_point_target_3487}` |
| **Level 1** | Valencia airport runway false alarm (dark smooth surface, not floodwater) | `flag{nisar_false_alarm_valencia_airport}` |
| **Level 2** | Jasper Wildfire Canopy Decorrelation ($\gamma = 0.14$) | `flag{nisar_coherence_burn_jasper}` |
| **Level 3** | InSAR 12cm Fringe Displacement ($\lambda/2 = 12\text{ cm}$) | `flag{nisar_fault_slip_12cm_fringe}` |
| **Level 4** | Ghost Orbit evidence correlation | `flag{nisar_sar_integrity_breach}` |
| **Level 5** | Simulated mission-control phishing | `flag{nisar_phishing_mission_control}` |
| **Level 6** | Simulated exposed SAR metadata archive | `flag{nisar_exposed_sar_metadata}` |
| **Level 7** | Simulated telemetry intrusion | `flag{nisar_telemetry_intrusion_detected}` |
| **Level 8** | Simulated mission-site defacement | `flag{nisar_mission_site_defaced}` |

---

## 👥 Credits & NASA Space Apps Challenge
Developed for the **NASA International Space Apps Challenge** ("Dancing with the SARs").  
Data models based on NISAR Mission Specifications (JPL/ISRO) and Sentinel-1 SAR User Guides (ESA).
