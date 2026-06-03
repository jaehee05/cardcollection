import { useRef, useState } from "react";
import type { Card, Deck } from "../types";
import { downloadBackup, parseBackup } from "../utils/backup";

interface Props {
  cards: Card[];
  decks: Deck[];
  onRestore: (cards: Card[], decks: Deck[]) => void;
}

export function BackupControls({ cards, decks, onRestore }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string>("");

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // 같은 파일 다시 고를 수 있게
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? "");
        const parsed = parseBackup(text);
        const msg = `복원하시겠어요?\n- 카드 ${parsed.cards.length}개\n- 덱 ${parsed.decks.length}개\n\n현재 데이터는 덮어쓰여집니다.`;
        if (confirm(msg)) {
          onRestore(parsed.cards, parsed.decks);
          setMsg(
            `복원 완료: 카드 ${parsed.cards.length} · 덱 ${parsed.decks.length}`,
          );
        }
      } catch (err) {
        setMsg(`복원 실패: ${(err as Error).message}`);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => downloadBackup(cards, decks)}
        className="rounded-full bg-brand-grayLight px-3 py-1.5 text-[12px] font-extrabold text-[#4A4658] hover:bg-brand-grayLight/80"
      >
        ↓ JSON 백업
      </button>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="rounded-full bg-brand-grayLight px-3 py-1.5 text-[12px] font-extrabold text-[#4A4658] hover:bg-brand-grayLight/80"
      >
        ↑ 복원
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        onChange={onPickFile}
        className="hidden"
      />
      {msg && <span className="text-[11px] text-brand-gray">{msg}</span>}
    </div>
  );
}
