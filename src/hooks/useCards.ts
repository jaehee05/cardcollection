import { useCallback, useEffect, useState } from "react";
import type { Card } from "../types";
import { newId } from "../utils/id";

const STORAGE_KEY = "cardcollection.cards.v1";

function load(): Card[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Card[];
  } catch {
    return [];
  }
}

function save(cards: Card[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch {
    /* quota — ignore */
  }
}

export type CardInput = Omit<Card, "id" | "createdAt" | "updatedAt">;

export function useCards() {
  const [cards, setCards] = useState<Card[]>(() => load());

  useEffect(() => {
    save(cards);
  }, [cards]);

  const add = useCallback((input: CardInput): Card => {
    const now = new Date().toISOString();
    const card: Card = {
      ...input,
      id: newId("c_"),
      createdAt: now,
      updatedAt: now,
    };
    setCards((prev) => [card, ...prev]);
    return card;
  }, []);

  const update = useCallback((id: string, patch: Partial<CardInput>) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, ...patch, updatedAt: new Date().toISOString() }
          : c,
      ),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const adjustCount = useCallback((id: string, delta: number) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              count: Math.max(0, c.count + delta),
              updatedAt: new Date().toISOString(),
            }
          : c,
      ),
    );
  }, []);

  const replaceAll = useCallback((next: Card[]) => {
    setCards(next);
  }, []);

  return { cards, add, update, remove, adjustCount, replaceAll };
}
