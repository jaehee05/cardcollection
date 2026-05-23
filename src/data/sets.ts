import type { CardSet } from "../types";
import { paradiseDragona } from "./paradiseDragona";

export const SETS: CardSet[] = [paradiseDragona];

export function getSet(setId: string): CardSet | undefined {
  return SETS.find((s) => s.id === setId);
}

export function getSetsByRegion(region: CardSet["region"]): CardSet[] {
  return SETS.filter((s) => s.region === region);
}
