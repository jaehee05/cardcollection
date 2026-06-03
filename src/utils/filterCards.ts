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
    if (f.stage && c.evolutionStage !== f.stage) return false;
    if (f.onlyOwned && c.count <= 0) return false;
    return true;
  });
  out = sortCards(out, f.sort);
  return out;
}

// Card.number는 "001/108" 또는 "001" 같은 자유 형식. 앞쪽 숫자만 추출.
// sourceNumber(마스터 DB 링크)가 있으면 그걸 우선 사용.
function cardNumberValue(c: Card): number {
  if (typeof c.sourceNumber === "number") return c.sourceNumber;
  const raw = c.number?.split("/")[0]?.replace(/[^0-9]/g, "");
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
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
    case "numberAsc":
      arr.sort((a, b) => {
        // 시리즈마크가 다르면 시리즈로 그룹핑 (자연 정렬), 같으면 번호로
        if (a.seriesMark !== b.seriesMark) {
          return a.seriesMark.localeCompare(b.seriesMark, "ko", {
            numeric: true,
            sensitivity: "base",
          });
        }
        const an = cardNumberValue(a);
        const bn = cardNumberValue(b);
        if (an !== bn) return an - bn;
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
