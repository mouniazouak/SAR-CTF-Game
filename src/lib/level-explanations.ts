import type { LevelId } from '@/types/ctf';

export interface LevelExplanation {
  objective: string;
  science: string;
  evidence: string;
  skills: string;
}

export const LEVEL_EXPLANATIONS: Record<LevelId, LevelExplanation> = {
  'level-0': {
    objective: 'Find the radiometric calibration target at Rosamond Dry Lake.',
    science: 'A trihedral corner reflector produces a very strong, stable radar return and is used to calibrate SAR measurements.',
    evidence: 'Look for the localized backscatter peak and confirm the target coordinates with the live sampler.',
    skills: 'Radar backscatter, point targets, calibration, and geographic sampling.',
  },
  'level-1': {
    objective: 'Determine whether the dark feature near Manises Airport is floodwater or a smooth runway surface.',
    science: 'Smooth surfaces can appear dark in SAR imagery because they reflect energy away from the sensor. Darkness alone does not prove flooding.',
    evidence: 'Compare the before/after scenes, surface response, and contextual weather information.',
    skills: 'SAR interpretation, false-alarm analysis, and evidence-based classification.',
  },
  'level-2': {
    objective: 'Assess the radar change caused by the Jasper wildfire.',
    science: 'A fire can remove or alter vegetation structure, causing a strong loss of temporal coherence between acquisitions.',
    evidence: 'Use the coherence value and the burn-scar pattern to separate vegetation change from normal radar variation.',
    skills: 'Coherence analysis, wildfire mapping, and change detection.',
  },
  'level-3': {
    objective: 'Estimate crustal displacement across the Ridgecrest fault zone.',
    science: 'InSAR phase fringes encode line-of-sight movement. Each full fringe represents a fraction of the radar wavelength.',
    evidence: 'Count the phase fringes and relate them to the stated wavelength and displacement measurement.',
    skills: 'Interferometry, phase interpretation, wavelength physics, and tectonic monitoring.',
  },
  'level-4': {
    objective: 'Reconstruct the evidence trail of a corrupted NISAR ground-data relay package.',
    science: 'Mission data integrity depends on consistent timestamps, checksums, metadata, and visual products.',
    evidence: 'Cross-check the timeline, package metadata, checksum clues, and the associated SAR evidence.',
    skills: 'Mission data forensics, metadata correlation, and integrity checking.',
  },
  'level-5': {
    objective: 'Identify a simulated phishing attempt targeting mission operations staff.',
    science: 'Social-engineering messages often combine urgency, unusual sender details, and requests that bypass normal procedures.',
    evidence: 'Inspect the sender, links, wording, requested action, and mission-control context before reaching a conclusion.',
    skills: 'Email forensics, threat awareness, and security decision-making.',
  },
  'level-6': {
    objective: 'Find the simulated public-read configuration exposing an Earth-observation archive.',
    science: 'Access-control errors can expose sensitive metadata even when the underlying imagery is not modified.',
    evidence: 'Compare the intended access policy with the observed permissions and identify the unsafe setting.',
    skills: 'Cloud configuration review, least privilege, and data protection.',
  },
  'level-7': {
    objective: 'Reconstruct a simulated unauthorized telemetry session.',
    science: 'A reliable incident timeline links authentication events, source information, session actions, and anomalies.',
    evidence: 'Order the log events chronologically and distinguish normal ground-station activity from the intrusion indicators.',
    skills: 'Log analysis, timeline reconstruction, and incident response.',
  },
  'level-8': {
    objective: 'Identify the modified asset in a simulated public mission-status portal.',
    science: 'Integrity monitoring detects unexpected changes by comparing trusted and current versions of public assets.',
    evidence: 'Compare the snapshots, metadata, checksums, and visible content to locate the tampered mission asset.',
    skills: 'Web integrity, snapshot comparison, and digital forensics.',
  },
};
