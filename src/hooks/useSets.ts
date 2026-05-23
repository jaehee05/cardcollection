import { useCallback, useEffect, useRef, useState } from "react";
import type { CardSet, Region } from "../types";
import { SETS as STATIC_SETS } from "../data/sets";
import {
  removeSet as repoRemoveSet,
  subscribeAllSets,
  upsertSet as repoUpsertSet,
} from "../services/setRepo";

const STORAGE_KEY = "cardcollection.userSets.v2";
const USER_PREFIX = "user-";

interface PersistShape {
  version: 2;
  sets: CardSet[];
}

function loadCache(): CardSet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PersistShape | CardSet[];
    if (Array.isArray(parsed)) return parsed;
    if (parsed?.version === 2 && Array.isArray(parsed.sets)) return parsed.sets;
    return [];
  } catch {
    return [];
  }
}

function saveCache(sets: CardSet[]) {
  try {
    const payload: PersistShape = { version: 2, sets };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

function newSetId(): string {
  return `${USER_PREFIX}${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

export interface SyncState {
  status: "loading" | "live" | "offline";
  error?: string;
}

export function useSets() {
  // 1) localStorage 캐시로 즉시 초기화 → 첫 페인트가 비어있지 않게
  const [userSets, setUserSets] = useState<CardSet[]>(() => loadCache());
  const [sync, setSync] = useState<SyncState>({ status: "loading" });
  // Firestore에서 한 번이라도 데이터를 받았는지
  const liveReceivedRef = useRef(false);

  // 2) Firestore 실시간 구독
  useEffect(() => {
    const unsub = subscribeAllSets(
      (sets) => {
        liveReceivedRef.current = true;
        setUserSets(sets);
        saveCache(sets);
        setSync({ status: "live" });
      },
      (err) => {
        setSync({ status: "offline", error: err.message });
      },
    );
    return unsub;
  }, []);

  const allSets: CardSet[] = [...STATIC_SETS, ...userSets];

  const getSet = useCallback(
    (id: string) => allSets.find((s) => s.id === id),
    [allSets],
  );

  const getByRegion = useCallback(
    (region: Region) => allSets.filter((s) => s.region === region),
    [allSets],
  );

  const createSet = useCallback(
    (init: Partial<CardSet> & { region: Region; name: string }) => {
      const id = newSetId();
      const next: CardSet = {
        id,
        region: init.region,
        name: init.name,
        code: init.code ?? "",
        series: init.series ?? "",
        releaseDate: init.releaseDate ?? "",
        totalCards: init.totalCards ?? 0,
        secretCards: init.secretCards ?? 0,
        coverImageUrl: init.coverImageUrl,
        cards: init.cards ?? [],
      };
      // 낙관적 업데이트 (Firestore 응답 전 UI 반영)
      setUserSets((prev) => [...prev, next]);
      void repoUpsertSet(next).catch((e) =>
        setSync({ status: "offline", error: (e as Error).message }),
      );
      return id;
    },
    [],
  );

  const updateSet = useCallback(
    (id: string, patch: Partial<CardSet>) => {
      if (!id.startsWith(USER_PREFIX)) return false;
      let next: CardSet | undefined;
      setUserSets((prev) =>
        prev.map((s) => {
          if (s.id !== id) return s;
          const merged: CardSet = { ...s, ...patch, id: s.id };
          next = merged;
          return merged;
        }),
      );
      if (next) {
        const target = next;
        void repoUpsertSet(target).catch((e) =>
          setSync({ status: "offline", error: (e as Error).message }),
        );
      }
      return true;
    },
    [],
  );

  const deleteSet = useCallback((id: string) => {
    if (!id.startsWith(USER_PREFIX)) return false;
    setUserSets((prev) => prev.filter((s) => s.id !== id));
    void repoRemoveSet(id).catch((e) =>
      setSync({ status: "offline", error: (e as Error).message }),
    );
    return true;
  }, []);

  const isEditable = useCallback((id: string) => id.startsWith(USER_PREFIX), []);

  return {
    allSets,
    staticSets: STATIC_SETS,
    userSets,
    sync,
    getSet,
    getByRegion,
    createSet,
    updateSet,
    deleteSet,
    isEditable,
  };
}

export const USER_SET_PREFIX = USER_PREFIX;
