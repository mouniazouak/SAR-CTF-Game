import levelsData from '@/data/levels.json';
import type { IncidentLevelId, LevelDefinition, LevelsDataset } from '@/types/levels';

const DATASET = levelsData as LevelsDataset;

const LEVELS_BY_ID = new Map<string, LevelDefinition>(
  DATASET.levels.map((level) => [level.id, level])
);

export function getLevelCatalog(): LevelsDataset {
  return DATASET;
}

export function getLevelDefinition(levelId: string): LevelDefinition | undefined {
  return LEVELS_BY_ID.get(levelId);
}

export function isIncidentLevelId(value: string): value is IncidentLevelId {
  return LEVELS_BY_ID.has(value);
}
