import { useState } from "react";
import type { PokemonCard } from "../types";
import { RARITY_LABEL } from "../types";
import { CardPlaceholder } from "./CardPlaceholder";
import { NumberInput } from "./NumberInput";

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
  const [imgFailed, setImgFailed] = useState(false);
  // 카드 imageUrl이 바뀌면 실패 상태 리셋
  const showImage = !!card.imageUrl && !imgFailed;

  return (
    <div className="flex flex-col">
      <div className="relative">
        {/* card image — 5:7 비율로 모든 카드 동일 사이즈, 실패 시 NO IMAGE 자동 폴백 */}
        <div
          className={`overflow-hidden rounded-xl shadow-card transition ${
            owned ? "" : "grayscale opacity-60"
          }`}
        >
          <div className="aspect-[5/7] w-full bg-brand-grayLight/40">
            {showImage ? (
              <img
                key={card.imageUrl}
                src={card.imageUrl}
                alt={card.name}
                loading="lazy"
                className="h-full w-full object-cover"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <CardPlaceholder card={card} className="block h-full w-full" />
            )}
          </div>
        </div>

        {/* number badge in bottom-left of image */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/55 px-2 py-0.5 text-[11px] font-bold text-white">
          {String(card.number).padStart(3, "0")} {card.name}
        </div>
      </div>

      {/* meta row: rarity + number/total + 보유 배지 */}
      <div className="mt-2 flex items-center justify-between gap-1 text-[12px] md:text-[13px]">
        <span className="truncate font-semibold text-brand-gray">
          <span className="mr-1 inline-block min-w-[18px] text-center">
            {card.rarity}
          </span>
          <span className="hidden sm:inline">{RARITY_LABEL[card.rarity]}</span>
        </span>
        <span className="shrink-0 text-brand-gray">
          {card.number}/{total}
        </span>
        <span
          className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold md:px-2 md:text-[11px] ${
            owned
              ? "bg-brand-mint/15 text-brand-mintDark"
              : "bg-brand-grayLight text-brand-gray"
          }`}
        >
          {owned ? "보유" : "미보유"}
        </span>
      </div>

      {/* control row: 메모 + 카운터 */}
      <div className="mt-1.5 flex items-center gap-1.5 md:mt-2 md:gap-2">
        <button
          type="button"
          onClick={() => setMemoOpen((v) => !v)}
          className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-bold transition ${
            note
              ? "bg-brand-purple text-white"
              : "bg-brand-grayLight text-brand-gray hover:bg-purple-200"
          }`}
          title={note || "메모 추가"}
          aria-label="메모"
        >
          메모
        </button>

        <div className="flex flex-1 items-center justify-end gap-1.5 md:gap-2">
          <button
            type="button"
            onClick={() => onAdjust(-1)}
            disabled={count <= 0}
            className="grid h-8 w-8 place-items-center rounded-full bg-brand-grayLight text-brand-gray transition hover:bg-purple-200 disabled:opacity-40"
            aria-label="개수 감소"
          >
            −
          </button>
          <NumberInput
            value={count}
            onChange={onSetCount}
            className="w-9 bg-transparent text-center text-[15px] font-extrabold text-brand-gray outline-none"
          />
          <button
            type="button"
            onClick={() => onAdjust(1)}
            className="grid h-8 w-8 place-items-center rounded-full bg-brand-mint/15 text-brand-mintDark transition hover:bg-brand-mint/30"
            aria-label="개수 증가"
          >
            +
          </button>
        </div>
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
