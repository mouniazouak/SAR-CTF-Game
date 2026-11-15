import type { LevelId } from '@/types/ctf';

export interface MissionAssetPackage {
  before: string;
  after: string;
  change?: string;
  waterMask?: string;
  metadata?: string;
  mode: 'real-nisar-visual' | 'synthetic-training';
}

/**
 * Runtime mapping between CTF levels and their evidence package.
 * Add a new level here only after its data package has been processed and
 * labelled honestly in metadata.json.
 */
export const MISSION_ASSETS: Partial<Record<LevelId, MissionAssetPackage>> = {
  'level-1': {
    before: '/data/valencia/before.png',
    after: '/data/valencia/after.png',
    change: '/data/valencia/change.png',
    waterMask: '/data/valencia/water.png',
    metadata: '/data/valencia/metadata.json',
    mode: 'real-nisar-visual',
  },
};

