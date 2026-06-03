import { useMemo, useState } from "react";
import type { Card, Deck } from "../types";
import { STANDARD_LEGAL_MARKS } from "../types";
import { CardFilters, DEFAULT_FILTERS } from "./CardFilters";
import type { FilterState } from "./CardFilters";
import { CardTile } from "./CardTile";
import { applyFilters, uniqueSeries } from "../utils/filterCards";
import { summarizeDeck } from "./DeckList";

interface Props {
  deck: Deck;
  cards: Card[];
  onRename: (name: string) => void;
  onSetNote: (note: string) => void;
  onAdjustCard: (cardId: string, delta: number) => void;
  onBack: () => void;
}

// 같은 이름 4장 룰 — 기본 에너지(이름에 "기본" + 타입명)는 예외로 두지 않음. 사용자 판단.
function countByName(deck: Deck, cards: Card[]): Map<string, number> {
  const cardMap = new Map(cards.map((c) => [c.id, c]));
  const out = new Map<string, number>();
  for (const dc of deck.cards) {
    const c = cardMap.get(dc.cardId);
    if (!c) continue;
    out.set(c.name, (out.get(c.name) ?? 0) + dc.count);
  }
  return out;
}

export function DeckEditor({
  deck,
  cards,
  onRename,
  onSetNote,
  onAdjustCard,
  onBack,
}: Props) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [nameDraft, setNameDraft] = useState(deck.name);
  const [noteDraft, setNoteDraft] = useState(deck.note ?? "");

  const seriesOptions = useMemo(() => uniqueSeries(cards), [cards]);
  const visible = useMemo(() => applyFilters(cards, filters), [cards, filters]);

  const summary = useMemo(() => summarizeDeck(deck, cards), [deck, cards]);
  const nameCounts = useMemo(() => countByName(deck, cards), [deck, cards]);

  const inDeckById = useMemo(() => {
    const m = new Map<string, number>();
    for (const dc of deck.cards) m.set(dc.cardId, dc.count);
    return m;
  }, [deck.cards]);

  // 덱 내 카드 한눈에 보기 (이름·시리즈 그룹)
  const deckEntries = useMemo(() => {
    const cardMap = new Map(cards.map((c) => [c.id, c]));
    return deck.cards
      .map((dc) => ({ dc, card: cardMap.get(dc.cardId) }))
      .filter((e): e is { dc: typeof e.dc; card: Card } => Boolean(e.card))
      .sort((a, b) => a.card.name.localeCompare(b.card.name, "ko"));
  }, [deck.cards, cards]);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[12px] font-extrabold text-[#4A4658] shadow-card hover:bg-brand-grayLight/60"
      >
        ← 덱 목록
      </button>

      <div className="space-y-3 rounded-2xl bg-white p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="input-base flex-1 min-w-[200px]"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={() => {
              if (nameDraft.trim() && nameDraft !== deck.name) onRename(nameDraft);
            }}
            placeholder="덱 이름"
          />
          <div className="flex items-center gap-1.5 text-[11px] font-bold">
            <span
              className={`rounded-md px-2 py-1 ${summary.total === 60 ? "bg-brand-mint/15 text-brand-mintDark" : "bg-brand-grayLight text-brand-gray"}`}
            >
              {summary.total} / 60
            </span>
            <span
              className={`rounded-md px-2 py-1 ${summary.standardLegal ? "bg-brand-mint/15 text-brand-mintDark" : "bg-amber-50 text-amber-600"}`}
            >
              {summary.standardLegal ? "스탠다드 OK" : "익스팬션"}
            </span>
            {!summary.ownershipOk && (
              <span className="rounded-md bg-red-50 px-2 py-1 text-red-500">
                보유 부족
              </span>
            )}
          </div>
        </div>
        <textarea
          className="input-base min-h-[56px]"
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          onBlur={() => {
            if (noteDraft !== (deck.note ?? "")) onSetNote(noteDraft);
          }}
          placeholder="덱 메모 (전략, 픽 룰 등)"
        />
      </div>

      <div className="rounded-2xl bg-white p-3 shadow-card">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[13px] font-extrabold text-[#2A2538]">
            덱 구성 ({deck.cards.length}종)
          </h3>
        </div>
        {deckEntries.length === 0 ? (
          <div className="py-6 text-center text-[12px] text-brand-gray">
            아래 인벤토리에서 카드를 + 눌러 덱에 추가하세요.
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-1 md:grid-cols-2">
            {deckEntries.map(({ dc, card }) => {
              const nameCount = nameCounts.get(card.name) ?? 0;
              const overBase = nameCount > 4;
              const overOwn = dc.count > card.count;
              const notLegal = !STANDARD_LEGAL_MARKS.includes(card.regulationMark);
              return (
                <li
                  key={dc.cardId}
                  className="flex items-center justify-between gap-2 rounded-xl bg-brand-bg px-2 py-1.5"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="shrink-0 rounded-md bg-[#2A2538] px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                      {card.regulationMark}
                    </span>
                    <span className="min-w-0 truncate text-[12px] font-extrabold text-[#2A2538]">
                      {card.name}
                    </span>
                    {card.seriesMark && (
                      <span className="shrink-0 text-[10px] font-bold text-brand-gray">
                        {card.seriesMark}
                      </span>
                    )}
                    <div className="flex shrink-0 gap-1">
                      {overBase && (
                        <span className="rounded bg-red-100 px-1 text-[9px] font-extrabold text-red-600">
                          이름 {nameCount}장
                        </span>
                      )}
                      {overOwn && (
                        <span className="rounded bg-red-100 px-1 text-[9px] font-extrabold text-red-600">
                          보유 {card.count}장 초과
                        </span>
                      )}
                      {notLegal && (
                        <span className="rounded bg-amber-100 px-1 text-[9px] font-extrabold text-amber-700">
                          익스팬션
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onAdjustCard(dc.cardId, -1)}
                      className="h-6 w-6 rounded-full bg-white text-sm font-black text-[#2A2538] shadow-sm"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-[12px] font-extrabold">
                      {dc.count}
                    </span>
                    <button
                      type="button"
                      onClick={() => onAdjustCard(dc.cardId, 1)}
                      disabled={dc.count >= card.count}
                      className="h-6 w-6 rounded-full bg-brand-mint text-sm font-black text-white shadow-sm disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="rounded-2xl bg-white p-3 shadow-card">
        <h3 className="mb-2 text-[13px] font-extrabold text-[#2A2538]">
          인벤토리에서 추가
        </h3>
        <CardFilters
          value={filters}
          onChange={setFilters}
          seriesOptions={seriesOptions}
        />
        {visible.length === 0 ? (
          <div className="py-6 text-center text-[12px] text-brand-gray">
            {cards.length === 0
              ? "먼저 [내 카드] 탭에서 카드를 추가하세요."
              : "검색 결과가 없어요."}
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {visible.map((c) => (
              <CardTile
                key={c.id}
                card={c}
                deckMode={{
                  inDeck: inDeckById.get(c.id) ?? 0,
                  onAddToDeck: () => onAdjustCard(c.id, 1),
                  onRemoveFromDeck: () => onAdjustCard(c.id, -1),
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
