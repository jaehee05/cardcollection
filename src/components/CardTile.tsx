import type { Card } from "../types";
import { RARITY_COLOR, RARITY_LABEL } from "../types";
import { CardPlaceholder } from "./CardPlaceholder";

interface Props {
  card: Card;
  onEdit?: () => void;
  onDelete?: () => void;
  onAdjust?: (delta: number) => void;
  // 덱 편집기에서 추가/제거 버튼 표시
  deckMode?: {
    inDeck: number;
    onAddToDeck: () => void;
    onRemoveFromDeck: () => void;
  };
}

export function CardTile({ card, onEdit, onDelete, onAdjust, deckMode }: Props) {
  const rarityColor = card.rarity ? RARITY_COLOR[card.rarity] : "#A9A5B5";
  const owned = card.count > 0;

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-white p-2.5 shadow-card">
      <button
        type="button"
        onClick={onEdit}
        className="relative aspect-[5/7] overflow-hidden rounded-xl"
        title={onEdit ? "편집" : undefined}
      >
        {card.imageUrl ? (
          <img
            src={card.imageUrl}
            alt={card.name}
            className={`h-full w-full object-cover ${owned ? "" : "opacity-60 grayscale"}`}
            loading="lazy"
          />
        ) : (
          <CardPlaceholder
            name={card.name}
            number={card.number}
            className={`h-full w-full ${owned ? "" : "opacity-60"}`}
          />
        )}
        <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
          <span
            className="rounded-md px-1.5 py-0.5 text-[10px] font-extrabold text-white shadow-sm"
            style={{ background: rarityColor }}
            title={card.rarity ? RARITY_LABEL[card.rarity] : ""}
          >
            {card.rarity ?? "?"}
          </span>
          <span className="rounded-md bg-[#2A2538] px-1.5 py-0.5 text-[10px] font-extrabold text-white shadow-sm">
            {card.regulationMark}
          </span>
        </div>
        {!owned && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-extrabold text-white">
              미보유
            </span>
          </div>
        )}
      </button>

      <div className="min-h-[40px] px-0.5">
        <div className="line-clamp-2 text-[13px] font-extrabold leading-tight text-[#2A2538]">
          {card.name}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[10px] font-bold text-brand-gray">
          {card.seriesMark && <span>{card.seriesMark}</span>}
          {card.number && <span>· {card.number}</span>}
        </div>
      </div>

      {deckMode ? (
        <div className="flex items-center justify-between rounded-xl bg-brand-bg px-2 py-1.5">
          <button
            type="button"
            onClick={deckMode.onRemoveFromDeck}
            disabled={deckMode.inDeck === 0}
            className="h-7 w-7 rounded-full bg-white text-base font-black text-[#2A2538] shadow-sm disabled:opacity-30"
          >
            −
          </button>
          <span className="text-[12px] font-extrabold text-[#2A2538]">
            덱 {deckMode.inDeck} / 보유 {card.count}
          </span>
          <button
            type="button"
            onClick={deckMode.onAddToDeck}
            disabled={deckMode.inDeck >= card.count}
            className="h-7 w-7 rounded-full bg-brand-mint text-base font-black text-white shadow-sm disabled:opacity-30"
            title={deckMode.inDeck >= card.count ? "보유 수량 초과" : "덱에 추가"}
          >
            +
          </button>
        </div>
      ) : onAdjust ? (
        <div className="flex items-center justify-between rounded-xl bg-brand-bg px-2 py-1.5">
          <button
            type="button"
            onClick={() => onAdjust(-1)}
            disabled={card.count === 0}
            className="h-7 w-7 rounded-full bg-white text-base font-black text-[#2A2538] shadow-sm disabled:opacity-30"
          >
            −
          </button>
          <span className="text-[12px] font-extrabold text-[#2A2538]">
            보유 {card.count}
          </span>
          <button
            type="button"
            onClick={() => onAdjust(1)}
            className="h-7 w-7 rounded-full bg-brand-mint text-base font-black text-white shadow-sm"
          >
            +
          </button>
        </div>
      ) : null}

      {(onEdit || onDelete) && (
        <div className="flex gap-1.5">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="flex-1 rounded-lg bg-brand-grayLight px-2 py-1 text-[11px] font-extrabold text-[#4A4658] hover:bg-brand-grayLight/80"
            >
              편집
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg bg-red-50 px-2 py-1 text-[11px] font-extrabold text-red-500 hover:bg-red-100"
            >
              삭제
            </button>
          )}
        </div>
      )}
    </div>
  );
}
