import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  Timestamp,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../firebase";
import type { CardSet } from "../types";

const COLLECTION = "sets";

function toDoc(set: CardSet): DocumentData {
  return {
    id: set.id,
    region: set.region,
    code: set.code ?? "",
    name: set.name ?? "",
    series: set.series ?? "",
    releaseDate: set.releaseDate ?? "",
    totalCards: set.totalCards ?? 0,
    secretCards: set.secretCards ?? 0,
    coverImageUrl: set.coverImageUrl ?? null,
    cards: set.cards.map((c) => ({
      id: c.id,
      setId: c.setId,
      number: c.number,
      name: c.name,
      rarity: c.rarity,
      illustrator: c.illustrator ?? null,
      marketPrice: c.marketPrice ?? 0,
      imageUrl: c.imageUrl ?? null,
    })),
    updatedAt: serverTimestamp(),
  };
}

function fromDoc(raw: DocumentData): CardSet {
  return {
    id: raw.id,
    region: raw.region,
    code: raw.code ?? "",
    name: raw.name ?? "",
    series: raw.series ?? "",
    releaseDate: raw.releaseDate ?? "",
    totalCards: raw.totalCards ?? 0,
    secretCards: raw.secretCards ?? 0,
    coverImageUrl: raw.coverImageUrl ?? undefined,
    cards: (raw.cards ?? []).map((c: DocumentData) => ({
      id: c.id,
      setId: c.setId,
      number: c.number,
      name: c.name,
      rarity: c.rarity,
      illustrator: c.illustrator ?? undefined,
      marketPrice: c.marketPrice ?? 0,
      imageUrl: c.imageUrl ?? undefined,
    })),
  };
}

export function subscribeAllSets(
  cb: (sets: CardSet[]) => void,
  onError?: (err: Error) => void,
): () => void {
  const ref = collection(db, COLLECTION);
  return onSnapshot(
    ref,
    (snap) => {
      const sets: CardSet[] = [];
      snap.forEach((d) => {
        try {
          sets.push(fromDoc(d.data()));
        } catch {
          /* skip malformed */
        }
      });
      cb(sets);
    },
    (err) => onError?.(err),
  );
}

export async function upsertSet(set: CardSet): Promise<void> {
  await setDoc(doc(db, COLLECTION, set.id), toDoc(set), { merge: true });
}

export async function removeSet(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export type WithTimestamp<T> = T & { updatedAt?: Timestamp };
