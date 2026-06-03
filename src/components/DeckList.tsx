import { useState } from "react";
import type { Card, Deck } from "../types";
import { STANDARD_LEGAL_MARKS } from "../types";

interface Props {
  decks: Deck[];
  cards: Card[];
  onCreate: (name: string) => Deck;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

interface DeckSummary {
  total: number;
  standardLegal: boolean;
  ownershipOk: boolean;
}

export function summarizeDeck(deck: Deck, cards: Card[]): DeckSummary {
  let total = 0;
  let standardLegal = true;
  let ownershipOk = true;
  const cardMap = new Map(cards.map((c) => [c.id, c]));
  for (const dc of deck.cards) {
    total += dc.count;
    const c = cardMap.get(dc.cardId);
    if (!c) {
      ownershipOk = false;
      continue;
    }
    if (!STANDARD_LEGAL_MARKS.includes(c.regulationMark)) standardLegal = false;
    if (dc.count > c.count) ownershipOk = false;
  }
  return { total, standardLegal, ownershipOk };
}

export function DeckList({ decks, cards, onCreate, onOpen, onDelete }: Props) {
  const [name, setName] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const d = onCreate(name);
    setName("");
    onOpen(d.id);
  }

  return (
    <div className="space-y-3">
      <form
        onSubmit={submit}
        className="flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 shadow-card"
      >
        <input
          className="input-base flex-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="새 덱 이름 (비워두면 '새 덱')"
        />
        <button
          type="submit"
          className="rounded-full bg-brand-mint px-5 py-2 text-sm font-extrabold text-white shadow-sm hover:bg-brand-mintDark"
        >
          + 새 덱
        </button>
      </form>

      {decks.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-sm text-brand-gray shadow-card">
          저장된 덱이 없어요. 위에서 새 덱을 만들어보세요.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {decks.map((d) => {
            const s = summarizeDeck(d, cards);
            return (
              <div
                key={d.id}
                className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-card"
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onOpen(d.id)}
                    className="min-w-0 flex-1 text-left text-[15px] font-extrabold text-[#2A2538] hover:text-brand-mintDark"
                  >
                    {d.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`"${d.name}" 덱을 삭제할까요?`)) onDelete(d.id);
                    }}
                    className="rounded-md bg-red-50 px-2 py-1 text-[11px] font-extrabold text-red-500 hover:bg-red-100"
                  >
                    삭제
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
                  <span
                    className={`rounded-md px-2 py-0.5 ${s.total === 60 ? "bg-brand-mint/15 text-brand-mintDark" : "bg-brand-grayLight text-brand-gray"}`}
                  >
                    {s.total} / 60
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 ${s.standardLegal ? "bg-brand-mint/15 text-brand-mintDark" : "bg-amber-50 text-amber-600"}`}
                    title="현 스탠다드 합법성"
                  >
                    {s.standardLegal ? "스탠다드 OK" : "익스팬션"}
                  </span>
                  {!s.ownershipOk && (
                    <span className="rounded-md bg-red-50 px-2 py-0.5 text-red-500">
                      보유 부족
                    </span>
                  )}
                </div>
                {d.note && (
                  <div className="line-clamp-2 text-[11px] text-brand-gray">
                    {d.note}
                  </div>
                )}
                <div className="text-[10px] text-brand-gray">
                  수정 {d.updatedAt.slice(0, 10)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
