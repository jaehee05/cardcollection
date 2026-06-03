import type { Card, CardSet, PokemonCard } from "../types";
import type { CardInput } from "../hooks/useCards";

// 마스터 DB의 PokemonCard + 그 카드가 속한 CardSet 정보를 받아
// 인벤토리에 저장할 Card 입력값으로 변환.
export function pokemonCardToInput(
  card: PokemonCard,
  set: CardSet,
  initialCount = 1,
): CardInput {
  const padded = String(card.number).padStart(3, "0");
  const numberLabel =
    set.totalCards > 0 ? `${padded}/${set.totalCards}` : padded;
  return {
    name: card.name,
    seriesMark: set.code || set.series || "",
    regulationMark: set.regulationMark ?? "H",
    number: numberLabel,
    rarity: card.rarity,
    imageUrl: card.imageUrl,
    count: initialCount,
    sourceSetId: set.id,
    sourceNumber: card.number,
  };
}

// 인벤토리 카드 중 동일한 마스터 DB 카드를 찾음
export function findInventoryFor(
  cards: Card[],
  setId: string,
  number: number,
): Card | undefined {
  return cards.find(
    (c) => c.sourceSetId === setId && c.sourceNumber === number,
  );
}

// setId 기준 인벤토리 매핑: number → Card
export function inventoryBySetNumber(
  cards: Card[],
  setId: string,
): Map<number, Card> {
  const out = new Map<number, Card>();
  for (const c of cards) {
    if (c.sourceSetId === setId && c.sourceNumber != null) {
      out.set(c.sourceNumber, c);
    }
  }
  return out;
}
