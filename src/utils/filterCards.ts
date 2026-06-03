import type { Card } from "../types";
import { REGULATION_MARKS } from "../types";
import type { FilterState, SortKey } from "../components/CardFilters";

export function applyFilters(cards: Card[], f: FilterState): Card[] {
  const q = f.q.trim().toLowerCase();
  let out = cards.filter((c) => {
    if (q) {
      const hay = `${c.name} ${c.note ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (f.series && c.seriesMark !== f.series) return false;
    if (f.regulation && c.regulationMark !== f.regulation) return false;
    if (f.rarity && c.rarity !== f.rarity) return false;
    if (f.type && c.type !== f.type) return false;
    if (f.onlyOwned && c.count <= 0) return false;
    return true;
  });
  out = sortCards(out, f.sort);
  return out;
}

export function sortCards(cards: Card[], sort: SortKey): Card[] {
  const arr = [...cards];
  switch (sort) {
    case "nameAsc":
      arr.sort((a, b) => a.name.localeCompare(b.name, "ko"));
      break;
    case "countDesc":
      arr.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ko"));
      break;
    case "regulation":
      arr.sort((a, b) => {
        const ai = REGULATION_MARKS.indexOf(a.regulationMark);
        const bi = REGULATION_MARKS.indexOf(b.regulationMark);
        if (ai !== bi) return bi - ai; // 최신 알파벳이 앞으로
        return a.name.localeCompare(b.name, "ko");
      });
      break;
    case "createdDesc":
    default:
      arr.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      break;
  }
  return arr;
}

export function uniqueSeries(cards: Card[]): string[] {
  const set = new Set<string>();
  for (const c of cards) if (c.seriesMark) set.add(c.seriesMark);
  return Array.from(set).sort();
}
