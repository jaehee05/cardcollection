import { useState } from "react";
import type { PokemonCard } from "../types";
import { RARITY_LABEL } from "../types";
import { CardPlaceholder } from "./CardPlaceholder";

interface Props {
  card: PokemonCard;
  count: number;
  note: string;
  total: number; // total cards in set
  onAdjust: (delta: number) => void;
  onSetCount: (count: number) => void;
  onSetNote: (note: string) => void;
}

export function CardTile({
  card,
  count,
  note,
  total,
  onAdjust,
  onSetCount,
  onSetNote,
}: Props) {
  const owned = count > 0;
  const [memoOpen, setMemoOpen] = useState(false);

  return (
    <div className="flex flex-col">
      <div className="relative">
        {/* card image (그레이스케일 미보유) */}
        <div
          className={`overflow-hidden rounded-xl shadow-card transition ${
            owned ? "" : "grayscale opacity-60"
          }`}
        >
          {card.imageUrl ? (
            <img
              src={card.imageUrl}
              alt={card.name}
              className="block h-auto w-full"
            />
          ) : (
            <CardPlaceholder card={card} className="block h-auto w-full" />
          )}
        </div>

        {/* number badge in bottom-left of image */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/55 px-2 py-0.5 text-[11px] font-bold text-white">
          {String(card.number).padStart(3, "0")} {card.name}
        </div>
      </div>

      {/* meta row: rarity + number/total */}
      <div className="mt-2 flex items-center justify-between text-[13px]">
        <span className="font-semibold text-brand-gray">
          <span className="mr-1 inline-block min-w-[18px] text-center">
            {card.rarity}
          </span>
          <span>{RARITY_LABEL[card.rarity]}</span>
        </span>
        <span className="text-brand-gray">
          {card.number}/{total}
        </span>
      </div>

      {/* control row */}
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMemoOpen((v) => !v)}
          className={`rounded-md px-2 py-1 text-[11px] font-bold transition ${
            note
              ? "bg-brand-purple text-white"
              : "bg-brand-grayLight text-brand-gray hover:bg-purple-200"
          }`}
          title={note || "메모 추가"}
        >
          메모
        </button>

        <div className="flex flex-1 items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onAdjust(-1)}
            disabled={count <= 0}
            className="grid h-7 w-7 place-items-center rounded-full bg-brand-grayLight text-brand-gray transition hover:bg-purple-200 disabled:opacity-40"
            aria-label="개수 감소"
          >
            −
          </button>
          <input
            type="number"
            min={0}
            value={count}
            onChange={(e) => {
              const v = Math.max(0, Number(e.target.value) || 0);
              onSetCount(v);
            }}
            className="w-10 bg-transparent text-center text-[15px] font-extrabold text-brand-gray outline-none"
          />
          <button
            type="button"
            onClick={() => onAdjust(1)}
            className="grid h-7 w-7 place-items-center rounded-full bg-brand-mint/15 text-brand-mintDark transition hover:bg-brand-mint/30"
            aria-label="개수 증가"
          >
            +
          </button>
        </div>

        <span
          className={`rounded-md px-2 py-1 text-[11px] font-bold ${
            owned
              ? "bg-brand-mint/15 text-brand-mintDark"
              : "bg-brand-grayLight text-brand-gray"
          }`}
        >
          {owned ? "보유" : "미보유"}
        </span>
      </div>

      {memoOpen && (
        <textarea
          value={note}
          onChange={(e) => onSetNote(e.target.value)}
          placeholder="이 카드에 대한 메모"
          className="mt-2 w-full resize-none rounded-md border border-brand-grayLight bg-white px-2 py-1 text-[12px] outline-none focus:ring-2 focus:ring-brand-mint/40"
          rows={2}
        />
      )}
    </div>
  );
}
