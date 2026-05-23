import { useEffect, useMemo, useState } from "react";
import type { Region } from "./types";
import { CollectionBook } from "./components/CollectionBook";
import { SummaryView } from "./components/SummaryView";
import { AdminView } from "./components/AdminView";
import { SetPicker } from "./components/SetPicker";
import { useSets } from "./hooks/useSets";
import { useOwnership, ownedCount } from "./hooks/useOwnership";

type Tab = "summary" | "collection" | "admin";

const TABS: { id: Tab; label: string }[] = [
  { id: "summary", label: "집계현황" },
  { id: "collection", label: "콜렉션북" },
  { id: "admin", label: "관리자" },
];

const REGIONS: { id: Region; label: string }[] = [
  { id: "kr", label: "국내판" },
  { id: "us", label: "북미판" },
  { id: "jp", label: "일본판" },
];

function App() {
  const sets = useSets();
  const ownership = useOwnership();
  const [tab, setTab] = useState<Tab>("collection");
  const [region, setRegion] = useState<Region>("kr");
  const [activeSetId, setActiveSetId] = useState<string | undefined>(undefined);

  const regionSets = useMemo(
    () => sets.getByRegion(region),
    [sets, region],
  );

  // 활성 세트가 더 이상 목록에 없으면 비움 (지역 전환 등)
  useEffect(() => {
    if (activeSetId && !regionSets.find((s) => s.id === activeSetId)) {
      setActiveSetId(undefined);
    }
  }, [regionSets, activeSetId]);

  const activeSet = regionSets.find((s) => s.id === activeSetId);

  // 각 세트별 고유 보유 카드 수 (SetPicker에서 표시)
  const ownedBySet = useMemo(() => {
    const out: Record<string, number> = {};
    for (const s of sets.allSets) {
      let n = 0;
      for (const c of s.cards) if (ownedCount(ownership.map, c.id) > 0) n += 1;
      out[s.id] = n;
    }
    return out;
  }, [sets.allSets, ownership.map]);

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 md:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-[28px] font-black tracking-tight text-[#2A2538]">
            콜렉션북
          </h1>
          <SyncBadge state={sets.sync} />
        </div>

        <nav className="flex flex-wrap items-center rounded-full bg-white px-2 py-2 shadow-card">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${
                tab === t.id
                  ? "text-[#2A2538]"
                  : "text-brand-gray hover:text-[#4A4658]"
              }`}
            >
              {t.label}
            </button>
          ))}

          {tab !== "admin" && (
            <>
              <span className="mx-3 hidden h-5 w-px bg-brand-grayLight md:block" />
              {REGIONS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setRegion(r.id);
                    setActiveSetId(undefined);
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${
                    region === r.id
                      ? "text-brand-mintDark underline decoration-brand-mint decoration-[3px] underline-offset-8"
                      : "text-brand-gray hover:text-[#4A4658]"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </>
          )}
        </nav>
      </header>

      <main className="mt-6 space-y-6">
        {tab === "collection" &&
          (activeSet ? (
            <>
              <button
                type="button"
                onClick={() => setActiveSetId(undefined)}
                className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[12px] font-extrabold text-[#4A4658] shadow-card hover:bg-brand-grayLight/60"
              >
                ← 다른 확장팩 선택
              </button>
              <CollectionBook set={activeSet} />
            </>
          ) : (
            <SetPicker
              sets={regionSets}
              ownedCountBySetId={ownedBySet}
              onPick={setActiveSetId}
            />
          ))}

        {tab === "summary" && <SummaryView sets={sets.allSets} />}

        {tab === "admin" && <AdminView />}
      </main>

      <footer className="mt-12 pb-4 text-center text-[12px] text-brand-gray">
        © Pokémon · 카드 데이터/시세는 관리자가 입력합니다.
      </footer>
    </div>
  );
}

function SyncBadge({
  state,
}: {
  state: { status: "loading" | "live" | "offline"; error?: string };
}) {
  if (state.status === "loading") {
    return (
      <span className="rounded-full bg-brand-grayLight px-3 py-1 text-[11px] font-bold text-brand-gray">
        동기화 중…
      </span>
    );
  }
  if (state.status === "live") {
    return (
      <span className="rounded-full bg-brand-mint/15 px-3 py-1 text-[11px] font-bold text-brand-mintDark">
        ● 실시간 동기화
      </span>
    );
  }
  return (
    <span
      title={state.error}
      className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-bold text-red-500"
    >
      ⚠ 오프라인 (로컬만)
    </span>
  );
}

export default App;
