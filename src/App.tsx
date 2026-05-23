import { useEffect, useMemo, useState } from "react";
import type { Region } from "./types";
import { CollectionBook } from "./components/CollectionBook";
import { SummaryView } from "./components/SummaryView";
import { AdminView } from "./components/AdminView";
import { useSets } from "./hooks/useSets";

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
  const [tab, setTab] = useState<Tab>("collection");
  const [region, setRegion] = useState<Region>("kr");

  const regionSets = useMemo(
    () => sets.getByRegion(region),
    [sets, region],
  );
  const [activeSetId, setActiveSetId] = useState<string | undefined>(
    regionSets[0]?.id,
  );

  // 지역 변경 또는 세트 목록 변경 시 활성 세트가 더이상 존재하지 않으면 갱신
  useEffect(() => {
    if (!activeSetId || !regionSets.find((s) => s.id === activeSetId)) {
      setActiveSetId(regionSets[0]?.id);
    }
  }, [regionSets, activeSetId]);

  const activeSet = regionSets.find((s) => s.id === activeSetId);

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
                  onClick={() => setRegion(r.id)}
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
        {tab === "collection" && (
          <>
            {regionSets.length > 1 && (
              <SetSwitcher
                sets={regionSets.map((s) => ({ id: s.id, name: s.name }))}
                activeId={activeSet?.id}
                onChange={setActiveSetId}
              />
            )}
            {activeSet ? (
              <CollectionBook set={activeSet} />
            ) : (
              <EmptyState
                message={`${labelOf(region)}의 세트가 아직 없어요`}
                sub="관리자 탭에서 세트를 추가해 주세요."
              />
            )}
          </>
        )}

        {tab === "summary" && <SummaryView sets={sets.allSets} />}

        {tab === "admin" && <AdminView />}
      </main>

      <footer className="mt-12 pb-4 text-center text-[12px] text-brand-gray">
        © Pokémon · 카드 데이터/시세는 관리자가 입력합니다.
      </footer>
    </div>
  );
}

function labelOf(region: Region): string {
  return REGIONS.find((r) => r.id === region)?.label ?? region;
}

function SetSwitcher({
  sets,
  activeId,
  onChange,
}: {
  sets: { id: string; name: string }[];
  activeId?: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {sets.map((s) => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          className={`pill ${
            activeId === s.id ? "pill-active" : "pill-idle"
          } max-w-full truncate`}
        >
          {s.name || "(이름 없음)"}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ message, sub }: { message: string; sub?: string }) {
  return (
    <div className="rounded-3xl bg-white p-10 text-center shadow-card">
      <p className="text-[15px] font-bold text-[#4A4658]">{message}</p>
      {sub && <p className="mt-2 text-[13px] text-brand-gray">{sub}</p>}
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
