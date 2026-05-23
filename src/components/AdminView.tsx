import { useMemo, useState } from "react";
import type {
  CardSet,
  PokemonCard,
  Rarity,
  Region,
} from "../types";
import { RARITY_LABEL, RARITY_ORDER } from "../types";
import { useSets } from "../hooks/useSets";
import {
  applyPattern,
  describePattern,
  extractPattern,
} from "../utils/imageUrlPattern";
import { parseClipboardTsv, type ParsedRow } from "../utils/parseTsv";
import { compareSetsLatestFirst } from "../utils/sortSets";

const REGIONS: { id: Region; label: string }[] = [
  { id: "kr", label: "국내판" },
  { id: "us", label: "북미판" },
  { id: "jp", label: "일본판" },
];

export function AdminView() {
  const sets = useSets();
  const [selectedId, setSelectedId] = useState<string | undefined>(
    sets.userSets[0]?.id,
  );
  const selected = selectedId ? sets.getSet(selectedId) : undefined;
  const editable = selected ? sets.isEditable(selected.id) : false;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
      {/* sidebar */}
      <aside className="space-y-3">
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <button
            type="button"
            onClick={() => {
              const id = sets.createSet({
                region: "kr",
                name: "새 세트",
                code: "",
                series: "",
                releaseDate: new Date().toISOString().slice(0, 10),
              });
              setSelectedId(id);
            }}
            className="w-full rounded-xl bg-brand-mint px-4 py-2.5 text-sm font-extrabold text-white shadow-sm hover:bg-brand-mintDark"
          >
            + 새 세트 만들기
          </button>

          <div className="mt-4">
            <p className="mb-2 text-[12px] font-bold text-brand-gray">
              내가 만든 세트
            </p>
            <SetList
              sets={[...sets.userSets].sort(compareSetsLatestFirst)}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onDelete={(id) => {
                if (!confirm("이 세트를 정말 삭제할까요?")) return;
                sets.deleteSet(id);
                if (selectedId === id) setSelectedId(undefined);
              }}
              editable
            />
            {sets.userSets.length === 0 && (
              <p className="text-[12px] text-brand-gray">아직 없어요</p>
            )}
          </div>

          {sets.staticSets.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-[12px] font-bold text-brand-gray">
                기본 세트 (읽기 전용)
              </p>
              <SetList
                sets={[...sets.staticSets].sort(compareSetsLatestFirst)}
                selectedId={selectedId}
                onSelect={setSelectedId}
                editable={false}
              />
            </div>
          )}
        </div>
      </aside>

      {/* main */}
      <section className="space-y-4">
        {!selected ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-card">
            <p className="text-[15px] font-bold text-[#4A4658]">
              왼쪽에서 세트를 선택하거나 새로 만들어 주세요.
            </p>
          </div>
        ) : (
          <SetEditor
            set={selected}
            editable={editable}
            onPatch={(patch) => sets.updateSet(selected.id, patch)}
          />
        )}
      </section>
    </div>
  );
}

function SetList({
  sets,
  selectedId,
  onSelect,
  onDelete,
  editable,
}: {
  sets: CardSet[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
  editable: boolean;
}) {
  return (
    <ul className="space-y-1.5">
      {sets.map((s) => (
        <li key={s.id} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelect(s.id)}
            className={`flex flex-1 items-center gap-2 truncate rounded-lg px-3 py-2 text-left text-[13px] font-semibold transition ${
              selectedId === s.id
                ? "bg-brand-mint/15 text-brand-mintDark"
                : "text-[#4A4658] hover:bg-brand-grayLight/60"
            }`}
            title={s.name}
          >
            {s.code && (
              <span className="shrink-0 rounded bg-brand-grayLight/80 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-brand-gray">
                {s.code}
              </span>
            )}
            <span className="flex min-w-0 flex-col leading-tight">
              {s.series && (
                <span className="truncate text-[10px] font-bold text-brand-gray">
                  {s.series}
                </span>
              )}
              <span className="truncate">{s.name || "(이름 없음)"}</span>
            </span>
          </button>
          {editable && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(s.id)}
              className="rounded-md px-2 py-1 text-[12px] text-brand-gray hover:bg-red-50 hover:text-red-500"
              aria-label="세트 삭제"
            >
              ×
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

function SetEditor({
  set,
  editable,
  onPatch,
}: {
  set: CardSet;
  editable: boolean;
  onPatch: (patch: Partial<CardSet>) => void;
}) {
  return (
    <>
      <div className="rounded-3xl bg-white p-5 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-extrabold">세트 정보</h2>
          {!editable && (
            <span className="rounded-full bg-brand-grayLight px-3 py-1 text-[11px] font-bold text-brand-gray">
              읽기 전용 (샘플 데이터)
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="세트 이름">
            <input
              className="input-base"
              value={set.name}
              disabled={!editable}
              onChange={(e) => onPatch({ name: e.target.value })}
            />
          </Field>
          <Field label="세트 코드 (예: SV10, sv7a)">
            <input
              className="input-base"
              value={set.code}
              disabled={!editable}
              onChange={(e) => onPatch({ code: e.target.value })}
            />
          </Field>
          <Field label="부스터팩 이미지 URL">
            <input
              className="input-base"
              value={set.coverImageUrl ?? ""}
              disabled={!editable}
              placeholder="https://example.com/boosters/sv7a.png"
              onChange={(e) =>
                onPatch({ coverImageUrl: e.target.value || undefined })
              }
            />
          </Field>
          <div>
            <span className="mb-1 block text-[12px] font-bold text-brand-gray">
              부스터팩 미리보기
            </span>
            <BoosterPreview url={set.coverImageUrl} code={set.code} />
          </div>
          <Field label="시리즈">
            <input
              className="input-base"
              value={set.series}
              disabled={!editable}
              onChange={(e) => onPatch({ series: e.target.value })}
            />
          </Field>
          <Field label="발매일">
            <input
              type="date"
              className="input-base"
              value={set.releaseDate}
              disabled={!editable}
              onChange={(e) => onPatch({ releaseDate: e.target.value })}
            />
          </Field>
          <Field label="지역">
            <select
              className="input-base"
              value={set.region}
              disabled={!editable}
              onChange={(e) => onPatch({ region: e.target.value as Region })}
            >
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="일반 카드 수">
              <input
                type="number"
                min={0}
                className="input-base"
                value={set.totalCards}
                disabled={!editable}
                onChange={(e) => {
                  const total = Math.max(0, Number(e.target.value) || 0);
                  // 일반 카드 수가 줄어들 때 총카드 수가 그보다 작아지지 않도록
                  // (시크릿은 항상 0 이상이어야 함)
                  const grand = set.totalCards + set.secretCards;
                  const nextSecret = Math.max(0, grand - total);
                  onPatch({ totalCards: total, secretCards: nextSecret });
                }}
              />
            </Field>
            <Field label="총 카드 수">
              <input
                type="number"
                min={0}
                className="input-base"
                value={set.totalCards + set.secretCards}
                disabled={!editable}
                onChange={(e) => {
                  const grand = Math.max(0, Number(e.target.value) || 0);
                  // 총 < 일반이면 시크릿 0
                  const nextSecret = Math.max(0, grand - set.totalCards);
                  onPatch({ secretCards: nextSecret });
                }}
              />
            </Field>
            <Field label="시크릿 (자동)">
              <input
                type="number"
                className="input-base bg-brand-grayLight/40 text-brand-gray"
                value={set.secretCards}
                disabled
                readOnly
              />
            </Field>
          </div>
        </div>
      </div>

      {editable && (
        <TsvPasteBox
          onApply={(rows, mode) => {
            const valid = rows
              .filter((r) => r.card)
              .map((r) => ({
                ...(r.card as PokemonCard),
                setId: set.id,
                id: `${set.id}-${String(r.card!.number!).padStart(3, "0")}`,
              }));
            if (valid.length === 0) return;
            if (mode === "replace") {
              onPatch({ cards: valid });
            } else {
              // append/merge by number
              const map = new Map<number, PokemonCard>();
              for (const c of set.cards) map.set(c.number, c);
              for (const c of valid) map.set(c.number, c);
              onPatch({
                cards: Array.from(map.values()).sort(
                  (a, b) => a.number - b.number,
                ),
              });
            }
          }}
          existingCount={set.cards.length}
        />
      )}

      {editable && set.cards.length > 0 && (
        <ImageUrlFillBox
          cards={set.cards}
          onApply={(updated) => onPatch({ cards: updated })}
        />
      )}

      <CardTableEditor
        set={set}
        editable={editable}
        onCardsChange={(cards) => onPatch({ cards })}
      />
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-bold text-brand-gray">
        {label}
      </span>
      {children}
    </label>
  );
}

function BoosterPreview({
  url,
  code,
}: {
  url?: string;
  code: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImg = !!url && !failed;
  return (
    <div className="relative grid aspect-[3/4] w-24 place-items-center overflow-hidden rounded-xl bg-brand-grayLight/40">
      {showImg ? (
        <img
          src={url}
          alt="booster"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="grid h-full w-full place-items-center bg-gradient-to-br from-purple-400 via-pink-300 to-brand-mint">
          <span className="text-lg font-black uppercase tracking-wider text-white">
            {code || "?"}
          </span>
        </div>
      )}
    </div>
  );
}

// --- TSV 붙여넣기 ---
function TsvPasteBox({
  onApply,
  existingCount,
}: {
  onApply: (rows: ParsedRow[], mode: "merge" | "replace") => void;
  existingCount: number;
}) {
  const [text, setText] = useState("");
  const setIdPlaceholder = "current-set";
  const parsed = useMemo(
    () => parseClipboardTsv(text, setIdPlaceholder),
    [text],
  );
  const valid = parsed.filter((r) => r.card).length;
  const errors = parsed.filter((r) => r.error);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-card">
      <h3 className="text-[15px] font-extrabold">엑셀에서 붙여넣기</h3>
      <p className="mt-1 text-[12px] text-brand-gray">
        엑셀이나 구글시트의 셀 범위를 그대로 복사한 뒤 아래 칸에 붙여넣어 주세요.
        탭 구분, 한 행이 카드 1장.
      </p>
      <ul className="mt-2 space-y-0.5 text-[12px] text-[#4A4658]">
        <li>
          <b className="text-brand-mintDark">필수 컬럼:</b> 번호 · 이름 · 희귀도
        </li>
        <li>
          <b>선택 컬럼:</b> 타입 · HP · 진화단계 · 시세 · 이미지URL · 일러스트
        </li>
        <li>
          번호는 <code className="font-mono">001</code> 또는{" "}
          <code className="font-mono">001/080</code> 형식 둘 다 OK
        </li>
      </ul>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`예시:\n001/080\t뚜벅쵸\tC\n002/080\t냄새꼬\tC\n003/080\t라플레시아\tU\n...`}
        className="mt-3 h-40 w-full rounded-2xl border border-brand-grayLight bg-brand-bg/40 p-3 font-mono text-[12px] outline-none focus:ring-2 focus:ring-brand-mint/40"
        spellCheck={false}
      />

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
        <span className="rounded-full bg-brand-mint/15 px-3 py-1 font-bold text-brand-mintDark">
          유효 행: {valid}
        </span>
        {errors.length > 0 && (
          <span className="rounded-full bg-red-50 px-3 py-1 font-bold text-red-500">
            오류: {errors.length}
          </span>
        )}
      </div>

      {errors.length > 0 && (
        <ul className="mt-2 max-h-32 overflow-auto rounded-lg bg-red-50/60 p-2 text-[12px] text-red-600">
          {errors.slice(0, 10).map((e) => (
            <li key={e.rowIndex}>
              {e.rowIndex}행: {e.error}
            </li>
          ))}
          {errors.length > 10 && <li>… 외 {errors.length - 10}건</li>}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={valid === 0}
          onClick={() => {
            onApply(parsed, "merge");
            setText("");
          }}
          className="rounded-xl bg-brand-mint px-4 py-2 text-sm font-extrabold text-white hover:bg-brand-mintDark disabled:opacity-40"
        >
          {existingCount > 0 ? "기존에 추가/덮어쓰기" : "추가"}
        </button>
        <button
          type="button"
          disabled={valid === 0}
          onClick={() => {
            if (
              existingCount > 0 &&
              !confirm(
                `기존 카드 ${existingCount}장을 모두 지우고 ${valid}장으로 교체할까요?`,
              )
            )
              return;
            onApply(parsed, "replace");
            setText("");
          }}
          className="rounded-xl bg-brand-purple px-4 py-2 text-sm font-extrabold text-white hover:opacity-90 disabled:opacity-40"
        >
          전체 교체
        </button>
      </div>
    </div>
  );
}

// --- 이미지 URL 일괄 채움 ---
function ImageUrlFillBox({
  cards,
  onApply,
}: {
  cards: PokemonCard[];
  onApply: (updated: PokemonCard[]) => void;
}) {
  // 기준 카드: 가장 낮은 번호 카드를 기본값으로 표시
  const sorted = useMemo(
    () => [...cards].sort((a, b) => a.number - b.number),
    [cards],
  );
  const [seedNumber, setSeedNumber] = useState<number>(sorted[0]?.number ?? 1);
  const [seedUrl, setSeedUrl] = useState<string>(sorted[0]?.imageUrl ?? "");
  const [overwrite, setOverwrite] = useState(false);

  const pattern = useMemo(
    () => extractPattern(seedNumber, seedUrl),
    [seedNumber, seedUrl],
  );

  const previews = useMemo(() => {
    if (!pattern) return [];
    return sorted.slice(0, 4).map((c) => ({
      number: c.number,
      url: applyPattern(c.number, pattern),
    }));
  }, [pattern, sorted]);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-card">
      <h3 className="text-[15px] font-extrabold">이미지 URL 일괄 채우기</h3>
      <p className="mt-1 text-[12px] text-brand-gray">
        기준 카드의 이미지 URL을 입력하면, URL 안의 번호 자리를 자동 인식해
        나머지 카드의 URL을 채워줘요.
      </p>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[120px_1fr_auto]">
        <Field label="기준 카드 번호">
          <input
            type="number"
            min={1}
            value={seedNumber}
            onChange={(e) => setSeedNumber(Math.max(1, Number(e.target.value)))}
            className="input-base"
          />
        </Field>
        <Field label="기준 카드 이미지 URL">
          <input
            value={seedUrl}
            onChange={(e) => setSeedUrl(e.target.value)}
            placeholder="https://example.com/sv7a/001.png"
            className="input-base"
          />
        </Field>
        <div className="flex items-end gap-2">
          <label className="flex items-center gap-2 text-[12px] font-bold text-brand-gray">
            <input
              type="checkbox"
              checked={overwrite}
              onChange={(e) => setOverwrite(e.target.checked)}
              className="h-4 w-4"
            />
            기존 URL 덮어쓰기
          </label>
        </div>
      </div>

      {pattern ? (
        <div className="mt-3 rounded-xl bg-brand-grayLight/40 p-3 text-[12px] text-[#4A4658]">
          <p>
            인식한 패턴:{" "}
            <code className="font-mono">{describePattern(pattern)}</code>{" "}
            <span className="text-brand-gray">({pattern.pad}자리)</span>
          </p>
          {previews.length > 0 && (
            <ul className="mt-2 space-y-0.5 text-brand-gray">
              {previews.map((p) => (
                <li key={p.number}>
                  카드 {String(p.number).padStart(3, "0")} →{" "}
                  <span className="text-[#4A4658]">{p.url}</span>
                </li>
              ))}
              {sorted.length > previews.length && (
                <li>… 외 {sorted.length - previews.length}장</li>
              )}
            </ul>
          )}
        </div>
      ) : seedUrl ? (
        <div className="mt-3 rounded-xl bg-red-50 p-3 text-[12px] text-red-600">
          URL에서 카드 번호 자리를 찾지 못했어요. URL 안에 기준 카드 번호가
          0-padding이 가능한 숫자 형태로 들어있는지 확인해 주세요.
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!pattern}
          onClick={() => {
            if (!pattern) return;
            const updated = cards.map((c) => {
              if (!overwrite && c.imageUrl) return c;
              return { ...c, imageUrl: applyPattern(c.number, pattern) };
            });
            onApply(updated);
          }}
          className="rounded-xl bg-brand-mint px-4 py-2 text-sm font-extrabold text-white hover:bg-brand-mintDark disabled:opacity-40"
        >
          {overwrite ? "전체 덮어쓰기" : "비어있는 카드만 채우기"}
        </button>
        <button
          type="button"
          onClick={() => {
            if (!confirm("모든 카드의 이미지 URL을 비울까요?")) return;
            onApply(cards.map((c) => ({ ...c, imageUrl: undefined })));
          }}
          className="rounded-xl bg-brand-grayLight px-4 py-2 text-sm font-extrabold text-brand-gray hover:bg-purple-100"
        >
          전체 URL 비우기
        </button>
      </div>
    </div>
  );
}

// --- 카드 테이블 편집 ---
function CardTableEditor({
  set,
  editable,
  onCardsChange,
}: {
  set: CardSet;
  editable: boolean;
  onCardsChange: (cards: PokemonCard[]) => void;
}) {
  const cards = [...set.cards].sort((a, b) => a.number - b.number);

  function patchCard(id: string, patch: Partial<PokemonCard>) {
    onCardsChange(
      set.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  }

  function deleteCard(id: string) {
    onCardsChange(set.cards.filter((c) => c.id !== id));
  }

  function addCard() {
    const nextNumber =
      set.cards.reduce((m, c) => Math.max(m, c.number), 0) + 1;
    const newCard: PokemonCard = {
      id: `${set.id}-${String(nextNumber).padStart(3, "0")}`,
      setId: set.id,
      number: nextNumber,
      name: "",
      rarity: "C",
      marketPrice: 0,
    };
    onCardsChange([...set.cards, newCard]);
  }

  return (
    <div className="rounded-3xl bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[15px] font-extrabold">
          카드 목록 ({set.cards.length}장)
        </h3>
        {editable && (
          <button
            type="button"
            onClick={addCard}
            className="rounded-xl bg-brand-mint px-3 py-1.5 text-[13px] font-extrabold text-white hover:bg-brand-mintDark"
          >
            + 행 추가
          </button>
        )}
      </div>

      {cards.length === 0 ? (
        <p className="mt-4 rounded-xl bg-brand-grayLight/40 p-4 text-center text-[13px] text-brand-gray">
          아직 카드가 없어요. 위 "엑셀에서 붙여넣기"로 한꺼번에 추가하거나 "+ 행 추가"로 한 장씩 입력하세요.
        </p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-[12px]">
            <thead className="bg-brand-grayLight/60 text-brand-gray">
              <tr className="text-left">
                <th className="px-2 py-2 w-12">번호</th>
                <th className="px-2 py-2">이름</th>
                <th className="px-2 py-2 w-20">희귀도</th>
                <th className="px-2 py-2 w-24 text-right">시세(원)</th>
                <th className="px-2 py-2">이미지 URL</th>
                {editable && <th className="px-2 py-2 w-8" />}
              </tr>
            </thead>
            <tbody>
              {cards.map((c) => (
                <tr key={c.id} className="border-t border-brand-grayLight/60">
                  <td className="px-2 py-1">
                    <input
                      type="number"
                      className="w-full bg-transparent px-1 py-1 outline-none focus:bg-white"
                      value={c.number}
                      disabled={!editable}
                      onChange={(e) =>
                        patchCard(c.id, {
                          number: Number(e.target.value) || c.number,
                        })
                      }
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      className="w-full bg-transparent px-1 py-1 outline-none focus:bg-white"
                      value={c.name}
                      disabled={!editable}
                      onChange={(e) => patchCard(c.id, { name: e.target.value })}
                    />
                  </td>
                  <td className="px-2 py-1">
                    <select
                      className="w-full bg-transparent px-1 py-1 outline-none focus:bg-white"
                      value={c.rarity}
                      disabled={!editable}
                      onChange={(e) =>
                        patchCard(c.id, { rarity: e.target.value as Rarity })
                      }
                    >
                      {RARITY_ORDER.map((r) => (
                        <option key={r} value={r}>
                          {r} {RARITY_LABEL[r]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1 text-right">
                    <input
                      type="number"
                      className="w-full bg-transparent px-1 py-1 text-right outline-none focus:bg-white"
                      value={c.marketPrice}
                      disabled={!editable}
                      onChange={(e) =>
                        patchCard(c.id, {
                          marketPrice: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </td>
                  <td className="px-2 py-1">
                    <input
                      className="w-full bg-transparent px-1 py-1 outline-none focus:bg-white"
                      value={c.imageUrl ?? ""}
                      placeholder="https://…"
                      disabled={!editable}
                      onChange={(e) =>
                        patchCard(c.id, {
                          imageUrl: e.target.value || undefined,
                        })
                      }
                    />
                  </td>
                  {editable && (
                    <td className="px-2 py-1 text-right">
                      <button
                        type="button"
                        onClick={() => deleteCard(c.id)}
                        className="rounded-md px-2 text-brand-gray hover:bg-red-50 hover:text-red-500"
                        aria-label="행 삭제"
                      >
                        ×
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
