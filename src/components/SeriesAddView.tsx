import { useEffect, useMemo, useRef, useState } from "react";
import type { Card, CardSet, PokemonCard } from "../types";
import type { CardInput } from "../hooks/useCards";
import { CardPlaceholder } from "./CardPlaceholder";
import { compareSetsLatestFirst } from "../utils/sortSets";
import {
  findInventoryFor,
  inventoryBySetNumber,
  pokemonCardToInput,
} from "../utils/importFromMaster";

interface Props {
  sets: CardSet[];
  cards: Card[];
  syncStatus: "loading" | "live" | "offline";
  onAdd: (input: CardInput) => Card;
  onAdjust: (cardId: string, delta: number) => void;
  onUpdate: (id: string, patch: Partial<CardInput>) => void;
  onBack: () => void;
}

// 시리즈에서 카드 추가하는 화면.
// 단계 1: 세트 선택
// 단계 2: 세트 카드 그리드 (인쇄번호 우선, 시크릿 별도). 카드 클릭 = 인벤토리 +1.
//   - 빠른 번호 입력: "번호 입력 후 Enter" → 해당 카드 +1
//   - 전체 추가 (count=0): 인쇄번호 카드 모두 인벤토리에 0개로 추가
export function SeriesAddView({
  sets,
  cards,
  syncStatus,
  onAdd,
  onAdjust,
  onUpdate,
  onBack,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const selected = selectedId ? sets.find((s) => s.id === selectedId) : undefined;

  if (!selected) {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[12px] font-extrabold text-[#4A4658] shadow-card hover:bg-brand-grayLight/60"
        >
          ← 인벤토리
        </button>
        <SeriesPicker
          sets={sets}
          syncStatus={syncStatus}
          onPick={setSelectedId}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setSelectedId(undefined)}
        className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[12px] font-extrabold text-[#4A4658] shadow-card hover:bg-brand-grayLight/60"
      >
        ← 다른 시리즈 선택
      </button>
      <SeriesGrid
        set={selected}
        cards={cards}
        onAdd={onAdd}
        onAdjust={onAdjust}
        onUpdate={onUpdate}
      />
    </div>
  );
}

function SeriesPicker({
  sets,
  syncStatus,
  onPick,
}: {
  sets: CardSet[];
  syncStatus: "loading" | "live" | "offline";
  onPick: (id: string) => void;
}) {
  const sorted = [...sets].sort(compareSetsLatestFirst);
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-white p-4 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-extrabold text-[#2A2538]">
            시리즈 선택
          </h2>
          <SyncBadge status={syncStatus} />
        </div>
        <p className="mt-1 text-[12px] text-brand-gray">
          마스터 DB의 시리즈를 선택해 카드를 인벤토리에 추가하세요. 시리즈가
          없으면 관리자 페이지에서 먼저 추가하세요.
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-sm text-brand-gray shadow-card">
          {syncStatus === "loading"
            ? "시리즈 로딩 중..."
            : "마스터 DB에 등록된 시리즈가 없어요. 푸터의 [⚙ 관리자]에서 추가하세요."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {sorted.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onPick(s.id)}
              className="flex items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-card hover:bg-brand-grayLight/40"
            >
              <div className="grid aspect-[3/4] w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-purple-400 via-pink-300 to-brand-mint">
                {s.coverImageUrl ? (
                  <img
                    src={s.coverImageUrl}
                    alt={s.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-black uppercase tracking-wide text-white">
                    {s.code || "?"}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  {s.code && (
                    <span className="rounded bg-brand-grayLight px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-brand-gray">
                      {s.code}
                    </span>
                  )}
                  {s.regulationMark && (
                    <span className="rounded bg-[#2A2538] px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                      {s.regulationMark}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 truncate text-[13px] font-extrabold text-[#2A2538]">
                  {s.name}
                </div>
                <div className="text-[11px] text-brand-gray">
                  {s.cards.length}장 · {s.totalCards} + 시크릿 {s.secretCards}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SyncBadge({
  status,
}: {
  status: "loading" | "live" | "offline";
}) {
  if (status === "loading") {
    return (
      <span className="rounded-full bg-brand-grayLight px-2 py-0.5 text-[10px] font-bold text-brand-gray">
        동기화 중
      </span>
    );
  }
  if (status === "live") {
    return (
      <span className="rounded-full bg-brand-mint/15 px-2 py-0.5 text-[10px] font-bold text-brand-mintDark">
        ● 실시간
      </span>
    );
  }
  return (
    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-500">
      ⚠ 오프라인
    </span>
  );
}

function SeriesGrid({
  set,
  cards,
  onAdd,
  onAdjust,
  onUpdate,
}: {
  set: CardSet;
  cards: Card[];
  onAdd: (input: CardInput) => Card;
  onAdjust: (cardId: string, delta: number) => void;
  onUpdate: (id: string, patch: Partial<CardInput>) => void;
}) {
  const inv = useMemo(() => inventoryBySetNumber(cards, set.id), [cards, set.id]);
  const sorted = useMemo(
    () => [...set.cards].sort((a, b) => a.number - b.number),
    [set.cards],
  );
  // 인쇄번호 카드와 시크릿 카드 분리
  const printed = sorted.filter(
    (c) => set.totalCards <= 0 || c.number <= set.totalCards,
  );
  const secret = sorted.filter(
    (c) => set.totalCards > 0 && c.number > set.totalCards,
  );

  const [quickNumber, setQuickNumber] = useState("");
  const quickRef = useRef<HTMLInputElement>(null);
  const [lastFlashNumber, setLastFlashNumber] = useState<number | null>(null);

  useEffect(() => {
    if (lastFlashNumber == null) return;
    const t = setTimeout(() => setLastFlashNumber(null), 1200);
    return () => clearTimeout(t);
  }, [lastFlashNumber]);

  function addOne(pc: PokemonCard) {
    const existing = findInventoryFor(cards, set.id, pc.number);
    if (existing) {
      onAdjust(existing.id, 1);
    } else {
      onAdd(pokemonCardToInput(pc, set, 1));
    }
    setLastFlashNumber(pc.number);
  }

  function removeOne(pc: PokemonCard) {
    const existing = findInventoryFor(cards, set.id, pc.number);
    if (existing && existing.count > 0) onAdjust(existing.id, -1);
  }

  function handleQuickSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(quickNumber.trim().replace(/^0+/, ""));
    if (!Number.isFinite(n) || n <= 0) return;
    const target = set.cards.find((c) => c.number === n);
    if (!target) {
      alert(`이 시리즈에 ${n}번 카드가 없습니다.`);
      return;
    }
    addOne(target);
    setQuickNumber("");
    quickRef.current?.focus();
  }

  function bulkAddAllPrinted() {
    const toAdd = printed.filter((pc) => !inv.has(pc.number));
    if (toAdd.length === 0) {
      alert("이미 모든 인쇄번호 카드가 인벤토리에 있습니다.");
      return;
    }
    if (
      !confirm(
        `인쇄번호 카드 ${toAdd.length}장을 보유 0개로 인벤토리에 추가할까요?\n(시크릿 ${secret.length}장 제외)`,
      )
    )
      return;
    for (const pc of toAdd) {
      onAdd(pokemonCardToInput(pc, set, 0));
    }
  }

  // 마스터 DB에서 카드 메타가 바뀌면 인벤토리도 따라가도록 lightweight sync
  // (이름·이미지URL·희귀도가 바뀌면 인벤토리 카드도 업데이트)
  useEffect(() => {
    for (const pc of set.cards) {
      const exist = inv.get(pc.number);
      if (!exist) continue;
      const expected = {
        name: pc.name,
        rarity: pc.rarity,
        imageUrl: pc.imageUrl,
        seriesMark: set.code || set.series || "",
        regulationMark:
          pc.regulationMark ?? set.regulationMark ?? exist.regulationMark,
        evolutionStage: pc.evolutionStage ?? exist.evolutionStage,
      };
      const drifted =
        exist.name !== expected.name ||
        exist.rarity !== expected.rarity ||
        exist.imageUrl !== expected.imageUrl ||
        exist.seriesMark !== expected.seriesMark ||
        exist.regulationMark !== expected.regulationMark ||
        exist.evolutionStage !== expected.evolutionStage;
      if (drifted) onUpdate(exist.id, expected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [set.id, set.code, set.series, set.regulationMark, set.cards.length]);

  const totalOwned = printed.reduce(
    (s, pc) => s + (inv.get(pc.number)?.count ?? 0),
    0,
  );
  const uniqueOwned = printed.filter(
    (pc) => (inv.get(pc.number)?.count ?? 0) > 0,
  ).length;

  return (
    <div className="space-y-3">
      <div className="space-y-3 rounded-2xl bg-white p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              {set.code && (
                <span className="rounded bg-brand-grayLight px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-brand-gray">
                  {set.code}
                </span>
              )}
              {set.regulationMark && (
                <span className="rounded bg-[#2A2538] px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                  {set.regulationMark}
                </span>
              )}
            </div>
            <h2 className="mt-0.5 text-[15px] font-extrabold text-[#2A2538]">
              {set.name}
            </h2>
            <p className="text-[11px] text-brand-gray">
              인쇄 {printed.length}장 · 시크릿 {secret.length}장 · 보유 종류{" "}
              {uniqueOwned} · 보유 총 {totalOwned}
            </p>
          </div>
          <button
            type="button"
            onClick={bulkAddAllPrinted}
            className="rounded-full bg-brand-mint px-4 py-2 text-[12px] font-extrabold text-white shadow-sm hover:bg-brand-mintDark"
            title="시크릿 제외, 인쇄번호 카드 전체를 보유 0으로 등록"
          >
            인쇄번호 전체 추가
          </button>
        </div>

        <form
          onSubmit={handleQuickSubmit}
          className="flex flex-wrap items-center gap-2"
        >
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-brand-gray">
            번호 빠른 추가
          </label>
          <input
            ref={quickRef}
            type="text"
            inputMode="numeric"
            value={quickNumber}
            onChange={(e) =>
              setQuickNumber(e.target.value.replace(/[^0-9]/g, ""))
            }
            placeholder="예: 5 또는 005"
            className="input-base max-w-[160px]"
          />
          <button
            type="submit"
            className="rounded-full bg-brand-purple px-4 py-2 text-[12px] font-extrabold text-white shadow-sm hover:opacity-90"
          >
            +1 추가
          </button>
          <span className="text-[11px] text-brand-gray">
            엔터로 빠르게 연속 입력
          </span>
        </form>
      </div>

      {printed.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-sm text-brand-gray shadow-card">
          이 시리즈에 카드 데이터가 없어요. 관리자 페이지에서 카드를 추가하세요.
        </div>
      ) : (
        <CardGrid
          cards={printed}
          inv={inv}
          flash={lastFlashNumber}
          onAdd={addOne}
          onRemove={removeOne}
          title={`인쇄번호 (${printed.length})`}
        />
      )}

      {secret.length > 0 && (
        <CardGrid
          cards={secret}
          inv={inv}
          flash={lastFlashNumber}
          onAdd={addOne}
          onRemove={removeOne}
          title={`시크릿 (${secret.length})`}
          subtle
        />
      )}
    </div>
  );
}

function CardGrid({
  cards,
  inv,
  flash,
  onAdd,
  onRemove,
  title,
  subtle,
}: {
  cards: PokemonCard[];
  inv: Map<number, Card>;
  flash: number | null;
  onAdd: (pc: PokemonCard) => void;
  onRemove: (pc: PokemonCard) => void;
  title: string;
  subtle?: boolean;
}) {
  return (
    <div className="space-y-2 rounded-2xl bg-white p-3 shadow-card">
      <h3 className="text-[12px] font-extrabold uppercase tracking-wider text-brand-gray">
        {title}
      </h3>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {cards.map((pc) => {
          const owned = inv.get(pc.number)?.count ?? 0;
          const isFlashing = flash === pc.number;
          return (
            <div
              key={pc.number}
              className={`flex flex-col gap-1 rounded-xl bg-brand-bg p-1.5 transition ${isFlashing ? "ring-2 ring-brand-mint" : ""} ${subtle ? "opacity-90" : ""}`}
            >
              <button
                type="button"
                onClick={() => onAdd(pc)}
                className="relative aspect-[5/7] overflow-hidden rounded-lg"
                title={`${pc.name} +1`}
              >
                {pc.imageUrl ? (
                  <img
                    src={pc.imageUrl}
                    alt={pc.name}
                    className={`h-full w-full object-cover ${owned > 0 ? "" : "opacity-60 grayscale"}`}
                    loading="lazy"
                  />
                ) : (
                  <CardPlaceholder
                    name={pc.name}
                    number={String(pc.number).padStart(3, "0")}
                    className={`h-full w-full ${owned > 0 ? "" : "opacity-60"}`}
                  />
                )}
                <span className="absolute left-1 top-1 rounded bg-white/85 px-1 text-[9px] font-extrabold text-[#2A2538]">
                  {String(pc.number).padStart(3, "0")}
                </span>
                {owned > 0 && (
                  <span className="absolute right-1 top-1 rounded-full bg-brand-mint px-1.5 text-[10px] font-extrabold text-white">
                    {owned}
                  </span>
                )}
              </button>
              <div className="flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => onRemove(pc)}
                  disabled={owned === 0}
                  className="h-5 w-5 rounded-full bg-white text-xs font-black text-[#2A2538] shadow-sm disabled:opacity-30"
                >
                  −
                </button>
                <span className="truncate text-[10px] font-bold text-[#2A2538]">
                  {pc.name}
                </span>
                <button
                  type="button"
                  onClick={() => onAdd(pc)}
                  className="h-5 w-5 rounded-full bg-brand-mint text-xs font-black text-white shadow-sm"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
