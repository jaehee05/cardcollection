import { useEffect, useState } from "react";
import type {
  Card,
  CardType,
  EvolutionStage,
  Rarity,
  RegulationMark,
} from "../types";
import {
  CARD_TYPES,
  EVOLUTION_STAGES,
  RARITIES,
  RARITY_LABEL,
  REGULATION_MARKS,
} from "../types";
import type { CardInput } from "../hooks/useCards";

interface Props {
  initial?: Card; // 편집 모드 — 없으면 추가 모드
  onSubmit: (input: CardInput) => void;
  onCancel: () => void;
  submitLabel?: string;
}

interface FormState {
  name: string;
  seriesMark: string;
  regulationMark: RegulationMark;
  number: string;
  rarity: Rarity | "";
  type: CardType | "";
  hp: string;
  evolutionStage: EvolutionStage | "";
  imageUrl: string;
  count: string;
  note: string;
}

function blank(): FormState {
  return {
    name: "",
    seriesMark: "",
    regulationMark: "H",
    number: "",
    rarity: "",
    type: "",
    hp: "",
    evolutionStage: "",
    imageUrl: "",
    count: "1",
    note: "",
  };
}

function fromCard(c: Card): FormState {
  return {
    name: c.name,
    seriesMark: c.seriesMark,
    regulationMark: c.regulationMark,
    number: c.number ?? "",
    rarity: c.rarity ?? "",
    type: c.type ?? "",
    hp: c.hp != null ? String(c.hp) : "",
    evolutionStage: c.evolutionStage ?? "",
    imageUrl: c.imageUrl ?? "",
    count: String(c.count),
    note: c.note ?? "",
  };
}

export function CardForm({ initial, onSubmit, onCancel, submitLabel }: Props) {
  const [f, setF] = useState<FormState>(() =>
    initial ? fromCard(initial) : blank(),
  );

  useEffect(() => {
    setF(initial ? fromCard(initial) : blank());
  }, [initial]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const name = f.name.trim();
    const seriesMark = f.seriesMark.trim();
    if (!name) return;
    const hp = f.hp.trim() ? Number(f.hp) : undefined;
    const count = Math.max(0, Number(f.count) || 0);
    const input: CardInput = {
      name,
      seriesMark,
      regulationMark: f.regulationMark,
      number: f.number.trim() || undefined,
      rarity: f.rarity || undefined,
      type: f.type || undefined,
      hp: Number.isFinite(hp as number) ? (hp as number) : undefined,
      evolutionStage: f.evolutionStage || undefined,
      imageUrl: f.imageUrl.trim() || undefined,
      count,
      note: f.note.trim() || undefined,
    };
    onSubmit(input);
  }

  const label = "text-[11px] font-extrabold uppercase tracking-wider text-brand-gray";
  const field = "flex flex-col gap-1";

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-2xl bg-white p-4 shadow-card md:p-5"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className={field}>
          <label className={label}>이름 *</label>
          <input
            className="input-base"
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
            placeholder="예: 리자몽 ex"
            autoFocus={!initial}
            required
          />
        </div>
        <div className={field}>
          <label className={label}>시리즈 마크</label>
          <input
            className="input-base"
            value={f.seriesMark}
            onChange={(e) => setF({ ...f, seriesMark: e.target.value })}
            placeholder="예: SV10, sv7a"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className={field}>
          <label className={label}>레귤레이션</label>
          <select
            className="input-base"
            value={f.regulationMark}
            onChange={(e) =>
              setF({ ...f, regulationMark: e.target.value as RegulationMark })
            }
          >
            {REGULATION_MARKS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className={field}>
          <label className={label}>번호</label>
          <input
            className="input-base"
            value={f.number}
            onChange={(e) => setF({ ...f, number: e.target.value })}
            placeholder="001/108"
          />
        </div>
        <div className={field}>
          <label className={label}>희귀도</label>
          <select
            className="input-base"
            value={f.rarity}
            onChange={(e) => setF({ ...f, rarity: e.target.value as Rarity | "" })}
          >
            <option value="">-</option>
            {RARITIES.map((r) => (
              <option key={r} value={r}>
                {r} · {RARITY_LABEL[r]}
              </option>
            ))}
          </select>
        </div>
        <div className={field}>
          <label className={label}>보유 수량</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            className="input-base"
            value={f.count}
            onChange={(e) => setF({ ...f, count: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className={field}>
          <label className={label}>타입</label>
          <select
            className="input-base"
            value={f.type}
            onChange={(e) =>
              setF({ ...f, type: e.target.value as CardType | "" })
            }
          >
            <option value="">-</option>
            {CARD_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className={field}>
          <label className={label}>HP</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            className="input-base"
            value={f.hp}
            onChange={(e) => setF({ ...f, hp: e.target.value })}
            placeholder="220"
          />
        </div>
        <div className={field}>
          <label className={label}>진화단계</label>
          <select
            className="input-base"
            value={f.evolutionStage}
            onChange={(e) =>
              setF({
                ...f,
                evolutionStage: e.target.value as EvolutionStage | "",
              })
            }
          >
            <option value="">-</option>
            {EVOLUTION_STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className={field}>
          <label className={label}>이미지 URL</label>
          <input
            className="input-base"
            value={f.imageUrl}
            onChange={(e) => setF({ ...f, imageUrl: e.target.value })}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className={field}>
        <label className={label}>메모</label>
        <textarea
          className="input-base min-h-[64px]"
          value={f.note}
          onChange={(e) => setF({ ...f, note: e.target.value })}
          placeholder="자유 메모"
        />
      </div>

      <div className="flex flex-wrap justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full bg-brand-grayLight px-5 py-2 text-sm font-extrabold text-brand-gray hover:bg-brand-grayLight/80"
        >
          취소
        </button>
        <button
          type="submit"
          className="rounded-full bg-brand-mint px-5 py-2 text-sm font-extrabold text-white shadow-sm hover:bg-brand-mintDark"
        >
          {submitLabel ?? (initial ? "저장" : "추가")}
        </button>
      </div>
    </form>
  );
}
