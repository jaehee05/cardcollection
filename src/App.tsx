import { useMemo, useState } from "react";
import type { Region } from "./types";
import { SETS, getSetsByRegion } from "./data/sets";
import { CollectionBook } from "./components/CollectionBook";
import { SummaryView } from "./components/SummaryView";

type Tab = "challenge" | "summary" | "collection";

const TABS: { id: Tab; label: string }[] = [
  { id: "challenge", label: "챌린지북" },
  { id: "summary", label: "집계현황" },
  { id: "collection", label: "콜렉션북" },
];

const REGIONS: { id: Region; label: string }[] = [
  { id: "kr", label: "국내판" },
  { id: "us", label: "북미판" },
  { id: "jp", label: "일본판" },
];

function App() {
  const [tab, setTab] = useState<Tab>("collection");
  const [region, setRegion] = useState<Region>("kr");
  const regionSets = useMemo(() => getSetsByRegion(region), [region]);
  const [activeSetId, setActiveSetId] = useState<string | undefined>(
    regionSets[0]?.id,
  );

  // 지역이 바뀌면 첫번째 세트 자동 선택
  const activeSet =
    regionSets.find((s) => s.id === activeSetId) ?? regionSets[0];

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 md:px-6 lg:px-8">
      {/* top bar */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[28px] font-black tracking-tight text-[#2A2538]">
          콜렉션북
        </h1>

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

          <span className="mx-3 hidden h-5 w-px bg-brand-grayLight md:block" />

          {REGIONS.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setRegion(r.id);
                const first = SETS.find((s) => s.region === r.id);
                if (first) setActiveSetId(first.id);
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
        </nav>
      </header>

      <main className="mt-6 space-y-6">
        {tab === "collection" && (
          <>
            {regionSets.length > 1 && (
              <SetSwitcher
                sets={regionSets}
                activeId={activeSet?.id}
                onChange={setActiveSetId}
              />
            )}
            {activeSet ? (
              <CollectionBook set={activeSet} />
            ) : (
              <EmptyState message={`${region} 지역의 세트가 아직 없어요`} />
            )}
          </>
        )}

        {tab === "summary" && <SummaryView sets={SETS} />}

        {tab === "challenge" && (
          <EmptyState
            message="챌린지북은 곧 추가될 예정이에요."
            sub="특정 카드만 모아 미션을 클리어하는 모드입니다."
          />
        )}
      </main>

      <footer className="mt-12 pb-4 text-center text-[12px] text-brand-gray">
        © Pokémon · 카드 데이터와 시세는 샘플입니다.
      </footer>
    </div>
  );
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
          {s.name}
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

export default App;
