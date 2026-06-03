import { useCallback, useEffect, useState } from "react";
import type { Deck, DeckCard } from "../types";
import { newId } from "../utils/id";

const STORAGE_KEY = "cardcollection.decks.v1";

function load(): Deck[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Deck[];
  } catch {
    return [];
  }
}

function save(decks: Deck[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
  } catch {
    /* quota — ignore */
  }
}

export function useDecks() {
  const [decks, setDecks] = useState<Deck[]>(() => load());

  useEffect(() => {
    save(decks);
  }, [decks]);

  const create = useCallback((name: string): Deck => {
    const now = new Date().toISOString();
    const deck: Deck = {
      id: newId("d_"),
      name: name.trim() || "새 덱",
      cards: [],
      createdAt: now,
      updatedAt: now,
    };
    setDecks((prev) => [deck, ...prev]);
    return deck;
  }, []);

  const rename = useCallback((id: string, name: string) => {
    setDecks((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, name: name.trim() || d.name, updatedAt: new Date().toISOString() }
          : d,
      ),
    );
  }, []);

  const setNote = useCallback((id: string, note: string) => {
    setDecks((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              note: note.trim() || undefined,
              updatedAt: new Date().toISOString(),
            }
          : d,
      ),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setDecks((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // 덱 내 카드 수량 조정. delta가 더하기/빼기.
  // 0이 되면 항목 제거. cardId 없으면 추가.
  const adjustCard = useCallback(
    (deckId: string, cardId: string, delta: number) => {
      setDecks((prev) =>
        prev.map((d) => {
          if (d.id !== deckId) return d;
          const idx = d.cards.findIndex((c) => c.cardId === cardId);
          let nextCards: DeckCard[];
          if (idx === -1) {
            if (delta <= 0) return d;
            nextCards = [...d.cards, { cardId, count: delta }];
          } else {
            const current = d.cards[idx];
            const nextCount = Math.max(0, current.count + delta);
            if (nextCount === 0) {
              nextCards = d.cards.filter((_, i) => i !== idx);
            } else {
              nextCards = d.cards.map((c, i) =>
                i === idx ? { ...c, count: nextCount } : c,
              );
            }
          }
          return { ...d, cards: nextCards, updatedAt: new Date().toISOString() };
        }),
      );
    },
    [],
  );

  const setCardCount = useCallback(
    (deckId: string, cardId: string, count: number) => {
      setDecks((prev) =>
        prev.map((d) => {
          if (d.id !== deckId) return d;
          const idx = d.cards.findIndex((c) => c.cardId === cardId);
          const safe = Math.max(0, count);
          let nextCards: DeckCard[];
          if (idx === -1) {
            if (safe === 0) return d;
            nextCards = [...d.cards, { cardId, count: safe }];
          } else {
            if (safe === 0) {
              nextCards = d.cards.filter((_, i) => i !== idx);
            } else {
              nextCards = d.cards.map((c, i) =>
                i === idx ? { ...c, count: safe } : c,
              );
            }
          }
          return { ...d, cards: nextCards, updatedAt: new Date().toISOString() };
        }),
      );
    },
    [],
  );

  // 인벤토리에서 카드가 사라졌을 때 호출 — 모든 덱에서 그 cardId 제거
  const purgeCard = useCallback((cardId: string) => {
    setDecks((prev) =>
      prev.map((d) => {
        if (!d.cards.find((c) => c.cardId === cardId)) return d;
        return {
          ...d,
          cards: d.cards.filter((c) => c.cardId !== cardId),
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  }, []);

  const replaceAll = useCallback((next: Deck[]) => {
    setDecks(next);
  }, []);

  return {
    decks,
    create,
    rename,
    setNote,
    remove,
    adjustCard,
    setCardCount,
    purgeCard,
    replaceAll,
  };
}
