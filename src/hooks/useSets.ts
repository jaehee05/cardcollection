import { useCallback, useEffect, useRef, useState } from "react";
import type { CardSet, Region } from "../types";
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
  const [sets, setSets] = useState<CardSet[]>(() => loadCache());
  const [sync, setSync] = useState<SyncState>({ status: "loading" });

  useEffect(() => {
    saveCache(sets);
  }, [sets]);

  useEffect(() => {
    const unsub = subscribeAllSets(
      (next) => {
        setSets(next);
        setSync({ status: "live" });
      },
      (err) => {
        setSync({ status: "offline", error: err.message });
      },
    );
    return unsub;
  }, []);

  const setsRef = useRef(sets);
  useEffect(() => {
    setsRef.current = sets;
  }, [sets]);

  const getSet = useCallback(
    (id: string) => sets.find((s) => s.id === id),
    [sets],
  );

  const getByRegion = useCallback(
    (region: Region) => sets.filter((s) => s.region === region),
    [sets],
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
        regulationMark: init.regulationMark,
        coverImageUrl: init.coverImageUrl,
        cards: init.cards ?? [],
      };
      setsRef.current = [...setsRef.current, next];
      setSets(setsRef.current);
      void repoUpsertSet(next).catch((e) =>
        setSync({ status: "offline", error: (e as Error).message }),
      );
      return id;
    },
    [],
  );

  const updateSet = useCallback((id: string, patch: Partial<CardSet>) => {
    const current = setsRef.current.find((s) => s.id === id);
    if (!current) return false;
    const merged: CardSet = { ...current, ...patch, id: current.id };
    setsRef.current = setsRef.current.map((s) => (s.id === id ? merged : s));
    setSets(setsRef.current);
    void repoUpsertSet(merged).catch((e) =>
      setSync({ status: "offline", error: (e as Error).message }),
    );
    return true;
  }, []);

  const deleteSet = useCallback((id: string) => {
    setsRef.current = setsRef.current.filter((s) => s.id !== id);
    setSets(setsRef.current);
    void repoRemoveSet(id).catch((e) =>
      setSync({ status: "offline", error: (e as Error).message }),
    );
    return true;
  }, []);

  const isEditable = useCallback((id: string) => id.startsWith(USER_PREFIX), []);

  return {
    sets,
    sync,
    getSet,
    getByRegion,
    createSet,
    updateSet,
    deleteSet,
    isEditable,
  };
}
