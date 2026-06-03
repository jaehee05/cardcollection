import { useCallback, useEffect, useRef, useState } from "react";
import { InventoryView } from "./components/InventoryView";
import { DeckList } from "./components/DeckList";
import { DeckEditor } from "./components/DeckEditor";
import { BackupControls } from "./components/BackupControls";
import { useCards } from "./hooks/useCards";
import { useDecks } from "./hooks/useDecks";

type Tab = "cards" | "decks";

const TABS: { id: Tab; label: string }[] = [
  { id: "cards", label: "내 카드" },
  { id: "decks", label: "덱" },
];

interface NavState {
  tab: Tab;
  deckId?: string;
}

function readNav(): NavState {
  if (typeof window === "undefined") return { tab: "cards" };
  const p = new URLSearchParams(window.location.search);
  const t = p.get("tab");
  const tab: Tab = t === "decks" ? "decks" : "cards";
  return { tab, deckId: p.get("deck") || undefined };
}

function navToSearch(s: NavState): string {
  const p = new URLSearchParams();
  if (s.tab !== "cards") p.set("tab", s.tab);
  if (s.deckId) p.set("deck", s.deckId);
  const str = p.toString();
  return str ? `?${str}` : "";
}

function App() {
  const cardsApi = useCards();
  const decksApi = useDecks();
  const initial = useRef<NavState>(readNav()).current;
  const [tab, setTab] = useState<Tab>(initial.tab);
  const [activeDeckId, setActiveDeckId] = useState<string | undefined>(
    initial.deckId,
  );

  useEffect(() => {
    function onPop() {
      const n = readNav();
      setTab(n.tab);
      setActiveDeckId(n.deckId);
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const desired = navToSearch({ tab, deckId: activeDeckId });
    const current = window.location.search;
    if (desired !== current) {
      const url = window.location.pathname + desired + window.location.hash;
      window.history.pushState({ tab, deckId: activeDeckId }, "", url);
    }
  }, [tab, activeDeckId]);

  // 활성 덱이 사라지면(삭제 등) 비움
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
    (nextCards: Parameters<typeof cardsApi.replaceAll>[0], nextDecks: Parameters<typeof decksApi.replaceAll>[0]) => {
      cardsApi.replaceAll(nextCards);
      decksApi.replaceAll(nextDecks);
    },
    [cardsApi, decksApi],
  );

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-3 py-4 md:px-6 md:py-6 lg:px-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setTab("cards");
              setActiveDeckId(undefined);
            }}
            className="text-[22px] font-black tracking-tight text-[#2A2538] transition hover:opacity-75 md:text-[28px]"
            aria-label="홈으로"
          >
            콜렉션북
          </button>

          <nav className="flex w-full items-center rounded-full bg-white p-1 shadow-card sm:w-auto sm:p-1.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  if (t.id !== "decks") setActiveDeckId(undefined);
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
        {tab === "cards" && (
          <InventoryView
            cards={cardsApi.cards}
            onAdd={cardsApi.add}
            onUpdate={cardsApi.update}
            onDelete={deleteCard}
            onAdjust={cardsApi.adjustCount}
          />
        )}

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
      </main>

      <footer className="mt-12 flex flex-wrap items-center justify-between gap-2 pb-4 text-[11px] text-brand-gray">
        <span>© Pokémon · 보유 카드 데이터는 이 기기에만 저장됩니다.</span>
        <BackupControls
          cards={cardsApi.cards}
          decks={decksApi.decks}
          onRestore={restore}
        />
      </footer>
    </div>
  );
}

export default App;
