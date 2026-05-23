import type { CardSet, Region } from "../types";

// 정적으로 포함되는 세트는 없음. 모든 세트는 관리자 페이지에서 추가되어 Firestore에 저장된다.
export const SETS: CardSet[] = [];

export function getSet(setId: string): CardSet | undefined {
  return SETS.find((s) => s.id === setId);
}

export function getSetsByRegion(region: Region): CardSet[] {
  return SETS.filter((s) => s.region === region);
}
