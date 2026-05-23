import { useMemo, useState } from "react";
import type { CardSet, Rarity } from "../types";
import { useOwnership, ownedCount, ownedNote } from "../hooks/useOwnership";
import { SetHeader } from "./SetHeader";
import { Filters, type SortKey } from "./Filters";
import { CardTile } from "./CardTile";

interface Props {
  set: CardSet;
}

export function CollectionBook({ set }: Props) {
  const ownership = useOwnership();
  const [rarityFilter, setRarityFilter] = useState<Rarity | "all">("all");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("number");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = set.cards.filter((c) => {
      if (rarityFilter !== "all" && c.rarity !== rarityFilter) return false;
      if (q && !c.name.toLowerCase().includes(q) && !String(c.number).includes(q))
        return false;
      return true;
    });
    list.sort((a, b) => {
      switch (sortKey) {
        case "name":
          return a.name.localeCompare(b.name, "ko");
        case "owned": {
          const oa = ownedCount(ownership.map, a.id);
          const ob = ownedCount(ownership.map, b.id);
          if (oa !== ob) return ob - oa;
          return a.number - b.number;
        }
        case "release":
          return a.number - b.number;
        case "number":
        default:
          return a.number - b.number;
      }
    });
    return list;
  }, [set.cards, rarityFilter, query, sortKey, ownership.map]);

  const ownedUnique = useMemo(
    () =>
      set.cards.reduce(
        (acc, c) => acc + (ownedCount(ownership.map, c.id) > 0 ? 1 : 0),
        0,
      ),
    [set.cards, ownership.map],
  );

  return (
    <div className="space-y-4">
      <SetHeader set={set} ownedUniqueCount={ownedUnique} />
      <Filters
        rarityFilter={rarityFilter}
        query={query}
        onRarityChange={setRarityFilter}
        onQueryChange={setQuery}
        sortKey={sortKey}
        onSortChange={setSortKey}
        onBulkAdjust={(d) => ownership.bulkAdjust(filtered.map((c) => c.id), d)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((card) => (
            <CardTile
              key={card.id}
              card={card}
              total={set.totalCards}
              count={ownedCount(ownership.map, card.id)}
              note={ownedNote(ownership.map, card.id)}
              onAdjust={(d) => ownership.adjustCount(card.id, d)}
              onSetCount={(v) => ownership.setCount(card.id, v)}
              onSetNote={(v) => ownership.setNote(card.id, v)}
            />
          ))}
        </div>
      ) : (
        <ListView
          cards={filtered}
          ownership={ownership}
          total={set.totalCards}
        />
      )}

      {filtered.length === 0 && (
        <div className="rounded-2xl bg-white p-10 text-center text-brand-gray shadow-card">
          조건에 맞는 카드가 없어요
        </div>
      )}
    </div>
  );
}

function ListView({
  cards,
  ownership,
  total,
}: {
  cards: CardSet["cards"];
  ownership: ReturnType<typeof useOwnership>;
  total: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card">
      <table className="w-full text-sm">
        <thead className="bg-brand-grayLight/60 text-brand-gray">
          <tr className="text-left">
            <th className="px-4 py-3">번호</th>
            <th className="px-4 py-3">이름</th>
            <th className="px-4 py-3">희귀도</th>
            <th className="px-4 py-3 text-right">시세</th>
            <th className="px-4 py-3 text-center">보유</th>
          </tr>
        </thead>
        <tbody>
          {cards.map((c) => {
            const cnt = ownedCount(ownership.map, c.id);
            return (
              <tr
                key={c.id}
                className={`border-t border-brand-grayLight/60 ${
                  cnt > 0 ? "" : "text-brand-gray"
                }`}
              >
                <td className="px-4 py-2 font-bold">
                  {String(c.number).padStart(3, "0")}/{total}
                </td>
                <td className="px-4 py-2">{c.name}</td>
                <td className="px-4 py-2">{c.rarity}</td>
                <td className="px-4 py-2 text-right">
                  {c.marketPrice.toLocaleString()}원
                </td>
                <td className="px-4 py-2 text-center">
                  <div className="inline-flex items-center gap-1">
                    <button
                      className="grid h-6 w-6 place-items-center rounded-full bg-brand-grayLight"
                      onClick={() => ownership.adjustCount(c.id, -1)}
                      disabled={cnt <= 0}
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-extrabold">{cnt}</span>
                    <button
                      className="grid h-6 w-6 place-items-center rounded-full bg-brand-mint/15 text-brand-mintDark"
                      onClick={() => ownership.adjustCount(c.id, 1)}
                    >
                      +
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
