import { useCallback, useEffect, useRef, useState } from "react";
import { InventoryView } from "./components/InventoryView";
import { DeckList } from "./components/DeckList";
import { DeckEditor } from "./components/DeckEditor";
import { BackupControls } from "./components/BackupControls";
import { SeriesAddView } from "./components/SeriesAddView";
import { AdminView } from "./components/AdminView";
import { useCards } from "./hooks/useCards";
import { useDecks } from "./hooks/useDecks";
import { useSets } from "./hooks/useSets";

type Tab = "cards" | "decks" | "admin";

const TABS: { id: Tab; label: string }[] = [
  { id: "cards", label: "내 카드" },
  { id: "decks", label: "덱" },
];

const ALL_TABS: Tab[] = ["cards", "decks", "admin"];

interface NavState {
  tab: Tab;
  deckId?: string;
  cardsMode?: "list" | "fromSeries";
}

function readNav(): NavState {
  if (typeof window === "undefined") return { tab: "cards" };
  const p = new URLSearchParams(window.location.search);
  const t = p.get("tab");
  const tab: Tab = ALL_TABS.includes(t as Tab) ? (t as Tab) : "cards";
  const cardsMode =
    p.get("cards") === "fromSeries" ? "fromSeries" : "list";
  return { tab, deckId: p.get("deck") || undefined, cardsMode };
}

function navToSearch(s: NavState): string {
  const p = new URLSearchParams();
  if (s.tab !== "cards") p.set("tab", s.tab);
  if (s.deckId) p.set("deck", s.deckId);
  if (s.cardsMode === "fromSeries") p.set("cards", "fromSeries");
  const str = p.toString();
  return str ? `?${str}` : "";
}

function App() {
  const cardsApi = useCards();
  const decksApi = useDecks();
  const setsApi = useSets();
  const initial = useRef<NavState>(readNav()).current;
  const [tab, setTab] = useState<Tab>(initial.tab);
  const [activeDeckId, setActiveDeckId] = useState<string | undefined>(
    initial.deckId,
  );
  const [cardsMode, setCardsMode] = useState<"list" | "fromSeries">(
    initial.cardsMode ?? "list",
  );

  useEffect(() => {
    function onPop() {
      const n = readNav();
      setTab(n.tab);
      setActiveDeckId(n.deckId);
      setCardsMode(n.cardsMode ?? "list");
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const desired = navToSearch({ tab, deckId: activeDeckId, cardsMode });
    const current = window.location.search;
    if (desired !== current) {
      const url = window.location.pathname + desired + window.location.hash;
      window.history.pushState({ tab, deckId: activeDeckId, cardsMode }, "", url);
    }
  }, [tab, activeDeckId, cardsMode]);

  useEffect(() => {
    if (activeDeckId && !decksApi.decks.find((d) => d.id === activeDeckId)) {
      setActiveDeckId(undefined);
    }
  }, [decksApi.decks, activeDeckId]);

  const activeDeck = decksApi.decks.find((d) => d.id === activeDeckId);

  const deleteCard = useCallback(
    (id: string) => {
      cardsApi.remove(id);
      decksApi.purgeCard(id);
    },
    [cardsApi, decksApi],
  );

  const restore = useCallback(
    (
      nextCards: Parameters<typeof cardsApi.replaceAll>[0],
      nextDecks: Parameters<typeof decksApi.replaceAll>[0],
    ) => {
      cardsApi.replaceAll(nextCards);
      decksApi.replaceAll(nextDecks);
    },
    [cardsApi, decksApi],
  );

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-3 py-4 md:px-6 md:py-6 lg:px-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setTab("cards");
                setActiveDeckId(undefined);
                setCardsMode("list");
              }}
              className="text-[22px] font-black tracking-tight text-[#2A2538] transition hover:opacity-75 md:text-[28px]"
              aria-label="홈으로"
            >
              콜렉션북
            </button>
            <SyncBadge status={setsApi.sync.status} />
          </div>

          <nav className="flex w-full items-center rounded-full bg-white p-1 shadow-card sm:w-auto sm:p-1.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  if (t.id !== "decks") setActiveDeckId(undefined);
                  if (t.id !== "cards") setCardsMode("list");
                }}
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
      </header>

      <main className="mt-4 space-y-4 md:mt-6 md:space-y-6">
        {tab === "cards" &&
          (cardsMode === "fromSeries" ? (
            <SeriesAddView
              sets={setsApi.sets}
              cards={cardsApi.cards}
              syncStatus={setsApi.sync.status}
              onAdd={cardsApi.add}
              onAdjust={cardsApi.adjustCount}
              onUpdate={cardsApi.update}
              onBack={() => setCardsMode("list")}
            />
          ) : (
            <InventoryView
              cards={cardsApi.cards}
              onAdd={cardsApi.add}
              onUpdate={cardsApi.update}
              onDelete={deleteCard}
              onAdjust={cardsApi.adjustCount}
              onOpenSeriesAdd={() => setCardsMode("fromSeries")}
            />
          ))}

        {tab === "decks" &&
          (activeDeck ? (
            <DeckEditor
              deck={activeDeck}
              cards={cardsApi.cards}
              onRename={(name) => decksApi.rename(activeDeck.id, name)}
              onSetNote={(note) => decksApi.setNote(activeDeck.id, note)}
              onAdjustCard={(cardId, delta) =>
                decksApi.adjustCard(activeDeck.id, cardId, delta)
              }
              onBack={() => setActiveDeckId(undefined)}
            />
          ) : (
            <DeckList
              decks={decksApi.decks}
              cards={cardsApi.cards}
              onCreate={decksApi.create}
              onOpen={setActiveDeckId}
              onDelete={decksApi.remove}
            />
          ))}

        {tab === "admin" && <AdminView />}
      </main>

      <footer className="mt-12 flex flex-wrap items-center justify-between gap-2 pb-4 text-[11px] text-brand-gray">
        <BackupControls
          cards={cardsApi.cards}
          decks={decksApi.decks}
          onRestore={restore}
        />
        <button
          type="button"
          onClick={() => setTab(tab === "admin" ? "cards" : "admin")}
          className={`rounded-md px-2 py-1 transition ${
            tab === "admin"
              ? "bg-brand-mint/15 font-extrabold text-brand-mintDark"
              : "text-brand-gray/70 hover:bg-brand-grayLight/60 hover:text-[#4A4658]"
          }`}
          title="카드 DB 관리자"
        >
          {tab === "admin" ? "← 관리자 닫기" : "⚙ 관리자"}
        </button>
      </footer>
    </div>
  );
}

function SyncBadge({ status }: { status: "loading" | "live" | "offline" }) {
  if (status === "loading") {
    return (
      <span className="rounded-full bg-brand-grayLight px-2 py-0.5 text-[10px] font-bold text-brand-gray">
        동기화 중
      </span>
    );
  }
  if (status === "live") {
    return (
      <span className="rounded-full bg-brand-mint/15 px-2 py-0.5 text-[10px] font-bold text-brand-mintDark">
        ● 실시간
      </span>
    );
  }
  return (
    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-500">
      ⚠ 오프라인
    </span>
  );
}

export default App;
