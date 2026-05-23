import { useState } from "react";
import type { CardSet } from "../types";

interface Props {
  sets: CardSet[];
  ownedCountBySetId?: Record<string, number>;
  onPick: (setId: string) => void;
}

export function SetPicker({ sets, ownedCountBySetId, onPick }: Props) {
  if (sets.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-card">
        <p className="text-[15px] font-bold text-[#4A4658]">
          이 지역의 확장팩이 아직 없어요
        </p>
        <p className="mt-2 text-[13px] text-brand-gray">
          관리자 탭에서 확장팩을 추가해 주세요.
        </p>
      </div>
    );
  }

  // 발매일 최신순
  const sorted = [...sets].sort((a, b) =>
    (b.releaseDate ?? "").localeCompare(a.releaseDate ?? ""),
  );

  return (
    <div>
      <h2 className="px-1 text-[15px] font-extrabold text-[#2A2538]">
        확장팩 선택
      </h2>
      <p className="mb-3 mt-1 px-1 text-[12px] text-brand-gray">
        보고 싶은 확장팩(부스터팩)을 골라 주세요.
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {sorted.map((set) => (
          <SetCard
            key={set.id}
            set={set}
            ownedUnique={ownedCountBySetId?.[set.id] ?? 0}
            onClick={() => onPick(set.id)}
          />
        ))}
      </div>
    </div>
  );
}

function SetCard({
  set,
  ownedUnique,
  onClick,
}: {
  set: CardSet;
  ownedUnique: number;
  onClick: () => void;
}) {
  const pct =
    set.totalCards === 0
      ? 0
      : Math.round((ownedUnique / set.totalCards) * 100);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <BoosterArt set={set} />

      <div className="flex flex-col gap-1 p-3">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-brand-mint/15 px-2 py-0.5 text-[11px] font-extrabold uppercase text-brand-mintDark">
            {set.code || "—"}
          </span>
          <span className="text-[11px] font-bold text-brand-gray">
            {set.totalCards}개
            {set.secretCards > 0 && (
              <span className="text-brand-mintDark"> +{set.secretCards}</span>
            )}
          </span>
        </div>

        {set.series && (
          <p
            className="line-clamp-1 text-[11px] font-bold text-brand-gray"
            title={set.series}
          >
            {set.series}
          </p>
        )}
        <p
          className="line-clamp-2 text-[13px] font-extrabold text-[#2A2538]"
          title={set.name}
        >
          {set.name || "(이름 없음)"}
        </p>

        <div className="mt-1 flex items-center justify-between text-[11px] text-brand-gray">
          <span>{set.releaseDate || "발매일 미정"}</span>
          <span className="font-extrabold text-[#4A4658]">
            {ownedUnique}/{set.totalCards} · {pct}%
          </span>
        </div>
      </div>
    </button>
  );
}

function BoosterArt({ set }: { set: CardSet }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = !!set.coverImageUrl && !imgFailed;

  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden bg-brand-grayLight/40">
      {showImage ? (
        <img
          src={set.coverImageUrl}
          alt={set.name}
          loading="lazy"
          className="h-full w-full object-cover transition group-hover:scale-[1.03]"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-purple-400 via-pink-300 to-brand-mint">
          <span className="text-3xl font-black uppercase tracking-wider text-white drop-shadow-md">
            {set.code || "?"}
          </span>
        </div>
      )}
    </div>
  );
}
