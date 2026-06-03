import type { CardType, Rarity, RegulationMark } from "../types";
import { CARD_TYPES, RARITIES, REGULATION_MARKS } from "../types";

export type SortKey = "createdDesc" | "nameAsc" | "countDesc" | "regulation";

export interface FilterState {
  q: string;
  series: string; // 시리즈마크 정확 일치
  regulation: RegulationMark | "";
  rarity: Rarity | "";
  type: CardType | "";
  onlyOwned: boolean;
  sort: SortKey;
}

export const DEFAULT_FILTERS: FilterState = {
  q: "",
  series: "",
  regulation: "",
  rarity: "",
  type: "",
  onlyOwned: false,
  sort: "createdDesc",
};

interface Props {
  value: FilterState;
  onChange: (next: FilterState) => void;
  seriesOptions: string[];
}

export function CardFilters({ value, onChange, seriesOptions }: Props) {
  function patch(p: Partial<FilterState>) {
    onChange({ ...value, ...p });
  }

  return (
    <div className="space-y-2 rounded-2xl bg-white p-3 shadow-card">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <input
          className="input-base"
          value={value.q}
          onChange={(e) => patch({ q: e.target.value })}
          placeholder="이름·메모 검색"
        />
        <div className="flex items-center justify-between gap-2">
          <select
            className="input-base"
            value={value.sort}
            onChange={(e) => patch({ sort: e.target.value as SortKey })}
          >
            <option value="createdDesc">최근 추가순</option>
            <option value="nameAsc">이름순</option>
            <option value="countDesc">보유 많은순</option>
            <option value="regulation">레귤레이션순</option>
          </select>
          <label className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand-bg px-3 py-2 text-[12px] font-extrabold text-[#4A4658]">
            <input
              type="checkbox"
              checked={value.onlyOwned}
              onChange={(e) => patch({ onlyOwned: e.target.checked })}
              className="h-4 w-4 accent-brand-mint"
            />
            보유만
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <select
          className="input-base"
          value={value.series}
          onChange={(e) => patch({ series: e.target.value })}
        >
          <option value="">시리즈 전체</option>
          {seriesOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="input-base"
          value={value.regulation}
          onChange={(e) =>
            patch({ regulation: e.target.value as RegulationMark | "" })
          }
        >
          <option value="">레귤 전체</option>
          {REGULATION_MARKS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          className="input-base"
          value={value.rarity}
          onChange={(e) => patch({ rarity: e.target.value as Rarity | "" })}
        >
          <option value="">희귀도 전체</option>
          {RARITIES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          className="input-base"
          value={value.type}
          onChange={(e) => patch({ type: e.target.value as CardType | "" })}
        >
          <option value="">타입 전체</option>
          {CARD_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
