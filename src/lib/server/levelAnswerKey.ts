import type { IncidentLevelId } from '@/types/levels';

/**
 * Server-only answer key for the seven-level Earth Surface Incident Explorer
 * campaign. This module must never be imported by a client component.
 *
 * It deliberately contains the exact anomaly coordinates, accepted physical
 * driver, accepted recovery action, and ground-truth flag for each level.
 */
export interface LevelAnswerKey {
  levelId: IncidentLevelId;
  flag: string;
  target: {
    label: string;
    lat: number;
    lng: number;
    /** Maximum click distance accepted by the Haversine check. */
    toleranceMeters: number;
    /** Clicks inside this radius receive the full spatial multiplier. */
    precisionRadiusMeters: number;
  };
  correctDriverId: string;
  correctRecoveryId: string;
  earthScienceLearning: string;
  failureHints: {
    location: string;
    driver: string;
    recovery: string;
  };
}

export const LEVEL_ANSWER_KEYS: Record<IncidentLevelId, LevelAnswerKey> = {
  'level-1': {
    levelId: 'level-1',
    flag: 'flag{flood_extent_confirmed}',
    target: {
      label: 'Loukkos floodplain low-backscatter polygon',
      lat: 35.178,
      lng: -6.125,
      toleranceMeters: 4500,
      precisionRadiusMeters: 1200,
    },
    correctDriverId: 'driver-open-water-specular',
    correctRecoveryId: 'recovery-quarantine-reset-mfa',
    earthScienceLearning:
      'L-band SAR sees through cloud and light rain because 24 cm microwaves interact with surface geometry and dielectric properties, not visible light. Smooth open water acts as a specular reflector, so it returns little energy to the radar and appears dark in VV/HH backscatter; the same water loses coherence between passes. A trustworthy flood map combines a low-backscatter threshold with change detection against a dry-season baseline and a connected-component filter, and it reports uncertainty where wind roughening or emergent vegetation complicates the signal.',
    failureHints: {
      location:
        'You are outside the flood signature. Compare the pre-event and post-event VV layers and look for a connected low-backscatter polygon inside the Loukkos floodplain; isolated dark pixels are usually shadow, dry sand, or radar layover, not water.',
      driver:
        'Backscatter amplitude alone is ambiguous. Ask whether the dark return comes from surface geometry, wind roughening, or a vegetation change, then check coherence and the next pass before committing.',
      recovery:
        'Contain the message, remove the credential exposure, and restore trust with a second factor. Blocking one address or forwarding the attachment leaves the exposure in place.',
    },
  },

  'level-2': {
    levelId: 'level-2',
    flag: 'flag{wetland_cycle_restored}',
    target: {
      label: 'Merja Zerga open-water core',
      lat: 34.8667,
      lng: -6.2833,
      toleranceMeters: 3500,
      precisionRadiusMeters: 900,
    },
    correctDriverId: 'driver-seasonal-hydroperiod',
    correctRecoveryId: 'recovery-revoke-rotate-review',
    earthScienceLearning:
      'Seasonal wetlands are dynamic, not static. A time series of backscatter and interferometric coherence can separate the repeating wet-dry hydroperiod from permanent land-cover change: inundation suppresses backscatter and decorrelates the surface, while vegetation recovery raises coherence again. Stacking multiple seasons and checking that the anomaly reverses is the key to restoring a wetland cycle product instead of mislabeling it as permanent loss.',
    failureHints: {
      location:
        'The anomaly is the open-water core of the lagoon network, not the tidal inlet or the reed fringe. Build a seasonal stack and click where the low-backscatter and coherence cycle repeats.',
      driver:
        'Separate a repeating hydroperiod from a one-way land-cover change. Check whether the signal returns in the next dry season; a reversible cycle and a permanent conversion have different physical causes.',
      recovery:
        'Contain the account, invalidate active sessions, rotate the credential, and review access logs. Waiting for expiry leaves the intruder inside.',
    },
  },

  'level-3': {
    levelId: 'level-3',
    flag: 'flag{forest_disturbance_detected}',
    target: {
      label: 'Athabasca high-severity burn perimeter',
      lat: 52.8732,
      lng: -118.0821,
      toleranceMeters: 5000,
      precisionRadiusMeters: 1500,
    },
    correctDriverId: 'driver-fire-canopy-loss',
    correctRecoveryId: 'recovery-isolate-patch-rebuild',
    earthScienceLearning:
      'Wildfire changes both surface roughness and vegetation structure. Before fire, a conifer canopy produces strong volume scattering and stable coherence. After fire, needles and branches are gone, so HV backscatter falls, the surface scattering mechanism changes, and inter-pass coherence collapses. Mapping the connected burn perimeter across two post-fire passes separates true disturbance from transient moisture or cloud effects.',
    failureHints: {
      location:
        'Follow the connected burn perimeter, not the brightest ash pixel. The disturbance should align with terrain and persist on the next post-fire pass.',
      driver:
        'Compare HV before and after. A structural loss of canopy scattering and a collapse in coherence point to one mechanism; a flood or harvest leaves a different, often reversible, signature.',
      recovery:
        'Contain the host first, then remove the vulnerability and rebuild from a trusted image. Delaying the patch or exposing management access keeps the attack surface open.',
    },
  },

  'level-4': {
    levelId: 'level-4',
    flag: 'flag{crop_alert_validated}',
    target: {
      label: 'Nile Delta reversible field block',
      lat: 31.11,
      lng: 30.94,
      toleranceMeters: 3000,
      precisionRadiusMeters: 800,
    },
    correctDriverId: 'driver-rotation-moisture',
    correctRecoveryId: 'recovery-verify-signature-rollback',
    earthScienceLearning:
      'Crop rotation and soil moisture both change SAR backscatter, but on different time scales and through different physics. Rotation alters canopy structure and the VV/VH ratio over weeks; irrigation changes the soil dielectric constant within days and often reverses after drainage. Validating an agricultural alert means comparing the field block with its planting calendar, checking the next pass, and separating a reversible moisture pulse from a structural crop change.',
    failureHints: {
      location:
        'The target is a field block whose VV/VH anomaly reverses after irrigation, not a permanently bare surface or an urban edge. Check the next pass and the planting calendar.',
      driver:
        'Rotation changes canopy structure over weeks; irrigation changes the dielectric constant within days. Match the observed reversal time scale to the physical process.',
      recovery:
        'Reject the artifact, verify its provenance against a trusted signature and SBOM, and restore the last signed release. A filename or an emailed hash is not trust.',
    },
  },

  'level-5': {
    levelId: 'level-5',
    flag: 'flag{subsidence_hotspot_identified}',
    target: {
      label: 'Jakarta Bay coastal subsidence bowl',
      lat: -6.105,
      lng: 106.795,
      toleranceMeters: 4000,
      precisionRadiusMeters: 1000,
    },
    correctDriverId: 'driver-subsidence-compaction',
    correctRecoveryId: 'recovery-isolate-restore-backup',
    earthScienceLearning:
      'GUNW interferograms measure line-of-sight phase change, not brightness. A persistent range-change ramp across independent Sentinel-1 pairs, aligned with a compacting coastal sediment package, is strong evidence of subsidence; a single pair contaminated by water vapor or tides is not. Groundwater withdrawal and sediment compaction can produce millimeter-to-centimeter per year motion that is invisible to optical sensors but clear in InSAR.',
    failureHints: {
      location:
        'Subsidence is a phase ramp, not a bright or dark patch. Click where the unwrapped GUNW fringe pattern forms a persistent coastal deformation bowl.',
      driver:
        'A single interferogram can be contaminated by water vapor or tides. Look for persistence across independent pairs and a spatial pattern consistent with a long-term deformation source.',
      recovery:
        'Contain the segment, preserve evidence, and restore from an immutable backup. Paying or rebuilding from encrypted production data does not restore integrity.',
    },
  },

  'level-6': {
    levelId: 'level-6',
    flag: 'flag{ice_motion_corrected}',
    target: {
      label: 'Jakobshavn fast-flow channel',
      lat: 69.1667,
      lng: -49.8333,
      toleranceMeters: 6000,
      precisionRadiusMeters: 1800,
    },
    correctDriverId: 'driver-ice-advection',
    correctRecoveryId: 'recovery-contain-rotate-reprocess',
    earthScienceLearning:
      'Optical sensors are blocked by cloud, but SAR can track glacier motion through offset tracking or speckle tracking of persistent surface features between acquisitions. Fast ice flow can alias short repeat intervals, so a longer baseline and a physically plausible flow direction toward the calving front are needed. Correcting the velocity field means rejecting cloud-induced artifacts and cross-checking the displacement against independent passes.',
    failureHints: {
      location:
        'Track the fast-flowing ice channel toward the calving front. The target is where persistent crevasses show a coherent displacement vector between passes.',
      driver:
        'Clouds cannot explain a SAR offset field, but they can hide the optical check. Match surface features and confirm the flow direction is physically plausible.',
      recovery:
        'A compromised processing node must be contained, its keys rotated, and the product reprocessed from trusted raw data. Restarting alone does not remove persistence.',
    },
  },

  'level-7': {
    levelId: 'level-7',
    flag: 'flag{earth_response_complete}',
    target: {
      label: 'Sundarbans multi-hazard convergence cell',
      lat: 21.9497,
      lng: 89.1833,
      toleranceMeters: 8000,
      precisionRadiusMeters: 2500,
    },
    correctDriverId: 'driver-compound-coastal',
    correctRecoveryId: 'recovery-coordinated-response',
    earthScienceLearning:
      'A multi-hazard incident report is a synthesis, not a single map. In a subsiding, eroding delta, storm surge and monsoon flooding can overlap with long-term InSAR displacement and mangrove loss. Triage means scoring hazards by spatial convergence and consequence, cross-validating independent SAR measurements, and stating uncertainty explicitly so responders can act on the evidence rather than on the loudest pixel.',
    failureHints: {
      location:
        'Triage by convergence, not by the largest single signal. The capstone target is where flood extent, erosion, and subsidence overlap in the delta.',
      driver:
        'Cross-validate L-band flood and change evidence with C-band coherence and GUNW displacement. A multi-hazard convergence is supported by multiple independent measurements, not one sensor.',
      recovery:
        'The final recovery is coordinated: contain the cyber incident, preserve evidence, validate the Earth observation, and publish the report with uncertainty rather than a single unverified alert.',
    },
  },
};
