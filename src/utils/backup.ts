import type { BackupV1, Card, Deck } from "../types";

export function makeBackup(cards: Card[], decks: Deck[]): BackupV1 {
  return {
    schema: "cardcollection.v1",
    exportedAt: new Date().toISOString(),
    cards,
    decks,
  };
}

export function downloadBackup(cards: Card[], decks: Deck[]) {
  const data = makeBackup(cards, decks);
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
  a.href = url;
  a.download = `cardcollection-${ts}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export interface ParsedBackup {
  cards: Card[];
  decks: Deck[];
}

export function parseBackup(raw: string): ParsedBackup {
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("JSON 형식이 아닙니다.");
  }
  if (parsed.schema !== "cardcollection.v1") {
    throw new Error(`알 수 없는 백업 포맷: ${parsed.schema ?? "(없음)"}`);
  }
  if (!Array.isArray(parsed.cards) || !Array.isArray(parsed.decks)) {
    throw new Error("cards/decks 배열이 없습니다.");
  }
  return { cards: parsed.cards, decks: parsed.decks };
}
