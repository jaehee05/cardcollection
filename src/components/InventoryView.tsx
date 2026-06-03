import { useMemo, useState } from "react";
import type { Card } from "../types";
import { CardForm } from "./CardForm";
import { CardFilters, DEFAULT_FILTERS } from "./CardFilters";
import type { FilterState } from "./CardFilters";
import { CardTile } from "./CardTile";
import { applyFilters, uniqueSeries } from "../utils/filterCards";
import type { CardInput } from "../hooks/useCards";

interface Props {
  cards: Card[];
  onAdd: (input: CardInput) => Card;
  onUpdate: (id: string, patch: Partial<CardInput>) => void;
  onDelete: (id: string) => void;
  onAdjust: (id: string, delta: number) => void;
  onOpenSeriesAdd: () => void;
}

type Mode =
  | { kind: "list" }
  | { kind: "create" }
  | { kind: "edit"; card: Card };

export function InventoryView({
  cards,
  onAdd,
  onUpdate,
  onDelete,
  onAdjust,
  onOpenSeriesAdd,
}: Props) {
  const [mode, setMode] = useState<Mode>({ kind: "list" });
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const seriesOptions = useMemo(() => uniqueSeries(cards), [cards]);
  const visible = useMemo(() => applyFilters(cards, filters), [cards, filters]);

  const totalUnique = cards.length;
  const totalOwned = cards.reduce((s, c) => s + c.count, 0);

  if (mode.kind === "create" || mode.kind === "edit") {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setMode({ kind: "list" })}
          className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[12px] font-extrabold text-[#4A4658] shadow-card hover:bg-brand-grayLight/60"
        >
          ← 목록으로
        </button>
        <CardForm
          initial={mode.kind === "edit" ? mode.card : undefined}
          onSubmit={(input) => {
            if (mode.kind === "edit") {
              onUpdate(mode.card.id, input);
            } else {
              onAdd(input);
            }
            setMode({ kind: "list" });
          }}
          onCancel={() => setMode({ kind: "list" })}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[13px] font-extrabold text-[#2A2538]">
          종류 <span className="text-brand-mintDark">{totalUnique}</span> · 총 매수{" "}
          <span className="text-brand-mintDark">{totalOwned}</span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onOpenSeriesAdd}
            className="rounded-full bg-brand-purple px-4 py-2 text-[13px] font-extrabold text-white shadow-sm hover:opacity-90"
            title="마스터 DB의 시리즈에서 카드 한 번에 추가"
          >
            ＋ 시리즈에서
          </button>
          <button
            type="button"
            onClick={() => setMode({ kind: "create" })}
            className="rounded-full bg-brand-mint px-4 py-2 text-[13px] font-extrabold text-white shadow-sm hover:bg-brand-mintDark"
          >
            + 직접 추가
          </button>
        </div>
      </div>

      <CardFilters
        value={filters}
        onChange={setFilters}
        seriesOptions={seriesOptions}
      />

      {visible.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-sm text-brand-gray shadow-card">
          {cards.length === 0
            ? "아직 카드가 없어요. 우측 위 [+ 카드 추가] 눌러서 첫 카드를 등록하세요."
            : "검색 결과가 없어요."}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {visible.map((c) => (
            <CardTile
              key={c.id}
              card={c}
              onEdit={() => setMode({ kind: "edit", card: c })}
              onDelete={() => {
                if (confirm(`"${c.name}" 카드를 인벤토리에서 삭제할까요?`)) {
                  onDelete(c.id);
                }
              }}
              onAdjust={(d) => onAdjust(c.id, d)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
