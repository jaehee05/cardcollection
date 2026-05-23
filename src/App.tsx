import { useEffect, useMemo, useRef, useState } from "react";
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

interface NavState {
  tab: Tab;
  region: Region;
  activeSetId?: string;
}

const DEFAULT_NAV: NavState = {
  tab: "collection",
  region: "kr",
  activeSetId: undefined,
};

function readNavFromUrl(): NavState {
  if (typeof window === "undefined") return DEFAULT_NAV;
  const p = new URLSearchParams(window.location.search);
  const t = p.get("tab");
  const r = p.get("region");
  return {
    tab: (TABS.find((x) => x.id === t)?.id ?? "collection") as Tab,
    region: (REGIONS.find((x) => x.id === r)?.id ?? "kr") as Region,
    activeSetId: p.get("set") || undefined,
  };
}

function navToSearch(s: NavState): string {
  const p = new URLSearchParams();
  if (s.tab !== "collection") p.set("tab", s.tab);
  if (s.region !== "kr") p.set("region", s.region);
  if (s.activeSetId) p.set("set", s.activeSetId);
  const str = p.toString();
  return str ? `?${str}` : "";
}

function App() {
  const sets = useSets();
  const ownership = useOwnership();
  const initial = useRef<NavState>(readNavFromUrl()).current;
  const [tab, setTab] = useState<Tab>(initial.tab);
  const [region, setRegion] = useState<Region>(initial.region);
  const [activeSetId, setActiveSetId] = useState<string | undefined>(
    initial.activeSetId,
  );

  // popstate (브라우저 앞/뒤) → 상태 동기화
  useEffect(() => {
    function onPop() {
      const next = readNavFromUrl();
      setTab(next.tab);
      setRegion(next.region);
      setActiveSetId(next.activeSetId);
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // 상태 → URL pushState (현재 URL과 다를 때만)
  useEffect(() => {
    const desired = navToSearch({ tab, region, activeSetId });
    const current = window.location.search;
    if (desired !== current) {
      const url = window.location.pathname + desired + window.location.hash;
      window.history.pushState({ tab, region, activeSetId }, "", url);
    }
  }, [tab, region, activeSetId]);

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

  // 각 세트별 고유 보유 카드 수
  const ownedBySet = useMemo(() => {
    const out: Record<string, number> = {};
    for (const s of sets.allSets) {
      let n = 0;
      for (const c of s.cards) if (ownedCount(ownership.map, c.id) > 0) n += 1;
      out[s.id] = n;
    }
    return out;
  }, [sets.allSets, ownership.map]);

  const showRegionBar = tab === "collection";

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-3 py-4 md:px-6 md:py-6 lg:px-8">
      <header className="space-y-3">
        {/* Row 1: 로고 + 동기화 + 메인 탭 */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="text-[22px] font-black tracking-tight text-[#2A2538] md:text-[28px]">
              콜렉션북
            </h1>
            <SyncBadge state={sets.sync} />
          </div>

          <nav className="flex w-full items-center rounded-full bg-white p-1 shadow-card sm:w-auto sm:p-1.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 rounded-full px-3 py-2 text-[13px] font-extrabold transition sm:flex-none sm:px-4 sm:text-sm ${
                  tab === t.id
                    ? "bg-[#2A2538] text-white shadow-sm"
                    : "text-brand-gray hover:text-[#4A4658]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Row 2: 지역 선택 — 콜렉션북 탭에서만, 별도 컨테이너로 명확히 분리 */}
        {showRegionBar && (
          <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-card">
            <span className="shrink-0 text-[11px] font-extrabold uppercase tracking-wider text-brand-gray">
              지역
            </span>
            <div className="flex flex-1 items-center gap-1 overflow-x-auto">
              {REGIONS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setRegion(r.id);
                    setActiveSetId(undefined);
                  }}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-extrabold transition ${
                    region === r.id
                      ? "bg-brand-mint text-white shadow-sm"
                      : "text-brand-gray hover:bg-brand-grayLight/60"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="mt-4 space-y-4 md:mt-6 md:space-y-6">
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
      <span className="rounded-full bg-brand-grayLight px-2 py-0.5 text-[10px] font-bold text-brand-gray sm:px-3 sm:py-1 sm:text-[11px]">
        동기화 중…
      </span>
    );
  }
  if (state.status === "live") {
    return (
      <span className="rounded-full bg-brand-mint/15 px-2 py-0.5 text-[10px] font-bold text-brand-mintDark sm:px-3 sm:py-1 sm:text-[11px]">
        ● 실시간
      </span>
    );
  }
  return (
    <span
      title={state.error}
      className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-500 sm:px-3 sm:py-1 sm:text-[11px]"
    >
      ⚠ 오프라인
    </span>
  );
}

export default App;
