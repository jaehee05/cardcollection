import { useCallback, useEffect, useState } from "react";
import type { OwnershipMap } from "../types";

const STORAGE_KEY = "cardcollection.ownership.v1";

function load(): OwnershipMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as OwnershipMap;
  } catch {
    return {};
  }
}

function save(map: OwnershipMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota errors */
  }
}

export function useOwnership() {
  const [map, setMap] = useState<OwnershipMap>(() => load());

  useEffect(() => {
    save(map);
  }, [map]);

  const setCount = useCallback((cardId: string, count: number) => {
    setMap((prev) => {
      const next = { ...prev };
      if (count <= 0) {
        const { [cardId]: _omit, ...rest } = next;
        // keep memo if exists
        const existing = prev[cardId];
        if (existing?.note) {
          return { ...rest, [cardId]: { count: 0, note: existing.note } };
        }
        return rest;
      }
      next[cardId] = { ...(prev[cardId] ?? { count: 0 }), count };
      return next;
    });
  }, []);

  const adjustCount = useCallback((cardId: string, delta: number) => {
    setMap((prev) => {
      const current = prev[cardId]?.count ?? 0;
      const nextCount = Math.max(0, current + delta);
      const next = { ...prev };
      if (nextCount === 0) {
        const memo = prev[cardId]?.note;
        if (memo) {
          next[cardId] = { count: 0, note: memo };
        } else {
          delete next[cardId];
        }
        return next;
      }
      next[cardId] = { ...(prev[cardId] ?? { count: 0 }), count: nextCount };
      return next;
    });
  }, []);

  const setNote = useCallback((cardId: string, note: string) => {
    setMap((prev) => {
      const next = { ...prev };
      const trimmed = note.trim();
      const current = prev[cardId];
      if (!trimmed && (!current || current.count === 0)) {
        delete next[cardId];
        return next;
      }
      next[cardId] = {
        count: current?.count ?? 0,
        note: trimmed || undefined,
      };
      return next;
    });
  }, []);

  const bulkAdjust = useCallback((cardIds: string[], delta: number) => {
    setMap((prev) => {
      const next = { ...prev };
      for (const id of cardIds) {
        const current = next[id]?.count ?? 0;
        const nextCount = Math.max(0, current + delta);
        if (nextCount === 0) {
          const memo = next[id]?.note;
          if (memo) {
            next[id] = { count: 0, note: memo };
          } else {
            delete next[id];
          }
        } else {
          next[id] = { ...(next[id] ?? { count: 0 }), count: nextCount };
        }
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => setMap({}), []);

  return { map, setCount, adjustCount, setNote, bulkAdjust, reset };
}

export function ownedCount(map: OwnershipMap, cardId: string): number {
  return map[cardId]?.count ?? 0;
}

export function ownedNote(map: OwnershipMap, cardId: string): string {
  return map[cardId]?.note ?? "";
}
