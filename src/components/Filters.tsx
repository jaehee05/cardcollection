import type { Rarity } from "../types";
import { RARITY_LABEL, RARITY_ORDER } from "../types";

export type SortKey = "number" | "name" | "owned" | "release";

interface Props {
  rarityFilter: Rarity | "all";
  query: string;
  onRarityChange: (v: Rarity | "all") => void;
  onQueryChange: (v: string) => void;
  sortKey: SortKey;
  onSortChange: (v: SortKey) => void;
  onBulkAdjust: (delta: number) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (v: "grid" | "list") => void;
}

export function Filters({
  rarityFilter,
  query,
  onRarityChange,
  onQueryChange,
  sortKey,
  onSortChange,
  onBulkAdjust,
  viewMode,
  onViewModeChange,
}: Props) {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-card md:rounded-3xl md:p-4">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-[180px_1fr] md:gap-3">
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
            placeholder="카드 이름 또는 번호로 검색"
            className="input-base pr-10"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray">
            🔍
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 md:mt-4 md:gap-2">
        {(
          [
            ["number", "번호"],
            ["name", "이름"],
            ["owned", "보유"],
            ["release", "발매일"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => onSortChange(k)}
            className={`pill !px-3 !py-1.5 !text-[12px] md:!px-4 md:!py-2 md:!text-sm ${
              sortKey === k ? "pill-active" : "pill-idle"
            }`}
          >
            <span className="text-base leading-none">≡</span>
            {label}
          </button>
        ))}

        <div className="mx-1 hidden h-6 w-px bg-brand-grayLight md:block" />

        <button
          type="button"
          onClick={() => onBulkAdjust(1)}
          className="pill !px-3 !py-1.5 !text-[12px] bg-brand-purple text-white hover:opacity-90 md:!px-4 md:!py-2 md:!text-sm"
        >
          <span className="text-base leading-none">+</span>
          전체 +1
        </button>
        <button
          type="button"
          onClick={() => onBulkAdjust(-1)}
          className="pill !px-3 !py-1.5 !text-[12px] bg-brand-purple text-white hover:opacity-90 md:!px-4 md:!py-2 md:!text-sm"
        >
          <span className="text-base leading-none">−</span>
          전체 -1
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`grid h-8 w-8 place-items-center rounded-lg transition md:h-9 md:w-9 ${
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
            className={`grid h-8 w-8 place-items-center rounded-lg transition md:h-9 md:w-9 ${
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
