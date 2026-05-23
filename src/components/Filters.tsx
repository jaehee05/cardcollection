import type { PokemonType, Rarity } from "../types";
import { RARITY_LABEL, RARITY_ORDER, TYPE_LABEL } from "../types";

export type SortKey = "number" | "name" | "owned" | "release";

interface Props {
  // 검색/필터
  cardTypeFilter: PokemonType | "all";
  rarityFilter: Rarity | "all";
  query: string;
  onTypeChange: (v: PokemonType | "all") => void;
  onRarityChange: (v: Rarity | "all") => void;
  onQueryChange: (v: string) => void;
  // 정렬
  sortKey: SortKey;
  onSortChange: (v: SortKey) => void;
  // 일괄
  onBulkAdjust: (delta: number) => void;
  // 보기 모드
  viewMode: "grid" | "list";
  onViewModeChange: (v: "grid" | "list") => void;
}

export function Filters({
  cardTypeFilter,
  rarityFilter,
  query,
  onTypeChange,
  onRarityChange,
  onQueryChange,
  sortKey,
  onSortChange,
  onBulkAdjust,
  viewMode,
  onViewModeChange,
}: Props) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-card">
      {/* row 1: dropdowns + search */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_2fr_auto]">
        <Labeled label="카드타입">
          <select
            value={cardTypeFilter}
            onChange={(e) => onTypeChange(e.target.value as PokemonType | "all")}
            className="input-base font-semibold"
          >
            <option value="all">모든 카드</option>
            {(Object.keys(TYPE_LABEL) as PokemonType[]).map((t) => (
              <option key={t} value={t}>
                {TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </Labeled>

        <Labeled label="희귀도">
          <select
            value={rarityFilter}
            onChange={(e) => onRarityChange(e.target.value as Rarity | "all")}
            className="input-base font-semibold"
          >
            <option value="all">전체</option>
            {RARITY_ORDER.map((r) => (
              <option key={r} value={r}>
                {r} {RARITY_LABEL[r]}
              </option>
            ))}
          </select>
        </Labeled>

        <div className="relative">
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="카드 이름"
            className="input-base pr-10"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray">
            🔍
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            /* 검색은 입력 즉시 반영되므로 noop */
          }}
          className="rounded-2xl bg-brand-mint px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-brand-mintDark"
        >
          검색
        </button>
      </div>

      {/* row 2: sort + bulk + view */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {(
          [
            ["number", "번호"],
            ["name", "이름"],
            ["owned", "보유수량"],
            ["release", "발매일"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => onSortChange(k)}
            className={`pill ${sortKey === k ? "pill-active" : "pill-idle"}`}
          >
            <span className="text-base leading-none">≡</span>
            {label}
          </button>
        ))}

        <div className="mx-2 hidden h-6 w-px bg-brand-grayLight md:block" />

        <button
          type="button"
          onClick={() => onBulkAdjust(1)}
          className="pill bg-brand-purple text-white hover:opacity-90"
        >
          <span className="text-base leading-none">+</span>
          전체 +1장
        </button>
        <button
          type="button"
          onClick={() => onBulkAdjust(-1)}
          className="pill bg-brand-purple text-white hover:opacity-90"
        >
          <span className="text-base leading-none">−</span>
          전체 -1장
        </button>

        <button
          type="button"
          className="pill bg-brand-purple text-white hover:opacity-90"
          title="제품명 메모 (미구현)"
        >
          제품명 메모
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`grid h-9 w-9 place-items-center rounded-lg transition ${
              viewMode === "grid"
                ? "bg-brand-mint/15 text-brand-mintDark"
                : "text-brand-gray hover:bg-brand-grayLight"
            }`}
            aria-label="그리드 보기"
          >
            🖼️
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={`grid h-9 w-9 place-items-center rounded-lg transition ${
              viewMode === "list"
                ? "bg-brand-mint/15 text-brand-mintDark"
                : "text-brand-gray hover:bg-brand-grayLight"
            }`}
            aria-label="리스트 보기"
          >
            ≣
          </button>
        </div>
      </div>
    </div>
  );
}

function Labeled({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="relative block">
      <span className="absolute -top-2 left-3 z-10 bg-white px-1 text-[11px] font-bold text-brand-gray">
        {label}
      </span>
      {children}
    </label>
  );
}
