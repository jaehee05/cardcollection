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
  const [userSets, setUserSets] = useState<CardSet[]>(() => loadCache());
  const [sync, setSync] = useState<SyncState>({ status: "loading" });

  // userSets가 바뀔 때마다 localStorage에도 백업 (오프라인 편집 보존)
  useEffect(() => {
    saveCache(userSets);
  }, [userSets]);

  // Firestore 실시간 구독
  useEffect(() => {
    const unsub = subscribeAllSets(
      (sets) => {
        setUserSets(sets);
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

  // 동기적 상태 추적용 ref — setState 함수형 updater는 비동기 실행이라
  // 외부에서 새 값을 바로 읽으려면 ref가 필요
  const userSetsRef = useRef(userSets);
  useEffect(() => {
    userSetsRef.current = userSets;
  }, [userSets]);

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
      // ref와 state 동시 갱신 → 같은 tick에서 다시 호출돼도 stale 안 됨
      userSetsRef.current = [...userSetsRef.current, next];
      setUserSets(userSetsRef.current);
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
      const current = userSetsRef.current.find((s) => s.id === id);
      if (!current) return false;
      const merged: CardSet = { ...current, ...patch, id: current.id };

      userSetsRef.current = userSetsRef.current.map((s) =>
        s.id === id ? merged : s,
      );
      setUserSets(userSetsRef.current);

      void repoUpsertSet(merged).catch((e) =>
        setSync({ status: "offline", error: (e as Error).message }),
      );
      return true;
    },
    [],
  );

  const deleteSet = useCallback((id: string) => {
    if (!id.startsWith(USER_PREFIX)) return false;
    userSetsRef.current = userSetsRef.current.filter((s) => s.id !== id);
    setUserSets(userSetsRef.current);
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
