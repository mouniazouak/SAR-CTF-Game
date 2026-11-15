/**
 * Generic rules used before comparing any two NISAR GCOV scenes.
 * The scientific processing itself is performed offline when HDF5 files are
 * converted to web previews; this module keeps the game honest at runtime.
 */

export interface NisarSceneMetadata {
  product: string;
  acquisitionDate: string;
  track: number;
  frame: number;
  passDirection: 'A' | 'D';
  frequency: 'A' | 'B';
  polarization: string;
  layer: string;
  noDataValue?: number;
  sourceUnits: 'linear' | 'db';
}

export interface ComparisonValidation {
  comparable: boolean;
  reasons: string[];
  warnings: string[];
}

export interface NormalizationPlan {
  layer: string;
  convertToDb: boolean;
  commonGrid: 'intersection';
  alignment: 'same-pixel-grid';
  robustPercentiles: [number, number];
  maskNoData: boolean;
}

/**
 * A valid before/after pair keeps acquisition geometry and measurement layer
 * constant. Only the acquisition date and measured Earth state should differ.
 */
export function validateNisarPair(
  before: NisarSceneMetadata,
  after: NisarSceneMetadata
): ComparisonValidation {
  const reasons: string[] = [];
  const warnings: string[] = [];

  const same = (label: string, left: unknown, right: unknown) => {
    if (left !== right) reasons.push(`${label} differs (${String(left)} vs ${String(right)}).`);
  };

  same('track', before.track, after.track);
  same('frame', before.frame, after.frame);
  same('pass direction', before.passDirection, after.passDirection);
  same('frequency', before.frequency, after.frequency);
  same('polarization', before.polarization, after.polarization);
  same('measurement layer', before.layer, after.layer);

  if (before.acquisitionDate === after.acquisitionDate) {
    warnings.push('The two scenes have the same acquisition date.');
  }
  if (before.sourceUnits !== after.sourceUnits) {
    warnings.push('Source units differ; convert both scenes to dB before comparison.');
  }
  if (before.noDataValue !== after.noDataValue) {
    warnings.push('No-data values differ; apply each scene mask before alignment.');
  }

  return { comparable: reasons.length === 0, reasons, warnings };
}

export function createNormalizationPlan(
  before: NisarSceneMetadata,
  after: NisarSceneMetadata
): NormalizationPlan {
  return {
    layer: before.layer,
    convertToDb: before.sourceUnits === 'linear' || after.sourceUnits === 'linear',
    commonGrid: 'intersection',
    alignment: 'same-pixel-grid',
    robustPercentiles: [2, 98],
    maskNoData: true,
  };
}
