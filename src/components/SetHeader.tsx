import { useState } from "react";
import type { CardSet } from "../types";

interface Props {
  set: CardSet;
  ownedUniqueCount: number;
}

const POKEMON_LOGO = "/pokemon-tcg-logo.png";

export function SetHeader({ set, ownedUniqueCount }: Props) {
  const pct =
    set.totalCards === 0
      ? 0
      : Math.round((ownedUniqueCount / set.totalCards) * 100);

  return (
    <div className="rounded-3xl bg-white p-4 shadow-card md:p-6">
      <div className="grid grid-cols-[110px_1fr] gap-4 md:grid-cols-[160px_1fr] md:gap-7">
        {/* 좌측: 부스터팩(또는 포켓몬 로고) + 발매일 */}
        <div className="flex flex-col items-center gap-2">
          <Cover set={set} />
          {set.releaseDate && (
            <p className="text-center text-[11px] text-brand-gray md:text-[12px]">
              발매일: {set.releaseDate}
            </p>
          )}
        </div>

        {/* 우측: 제목 → 시리즈 → 진행률 → 통계 */}
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-1.5">
            {set.code && (
              <span className="rounded-md bg-brand-mint/15 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-brand-mintDark md:px-2 md:text-[11px]">
                {set.code}
              </span>
            )}
          </div>
          <h2 className="mt-1 text-[17px] font-black leading-tight text-[#2A2538] md:text-[24px]">
            {set.name || "(이름 없음)"}
          </h2>
          <p className="mt-1 text-[12px] text-brand-gray md:text-[13px]">
            시리즈: <span className="text-[#4A4658]">{set.series || "—"}</span>
          </p>

          {/* 진행률 */}
          <div className="mt-3 md:mt-4">
            <div className="flex items-baseline justify-end">
              <span className="text-[18px] font-black text-[#2A2538] md:text-[22px]">
                {pct}%
              </span>
            </div>
            <div className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-brand-grayLight">
              <div
                className="h-full rounded-full bg-brand-mint transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-2 text-[12px] md:text-[13px]">
              <span className="font-extrabold text-[#4A4658]">
                {ownedUniqueCount} / {set.totalCards}
              </span>
              <span className="text-brand-gray">
                {set.totalCards}개{" "}
                {set.secretCards > 0 && (
                  <span className="font-bold text-brand-mintDark">
                    +{set.secretCards} 시크릿
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Cover({ set }: { set: CardSet }) {
  const [failed, setFailed] = useState(false);
  const useFallback = !set.coverImageUrl || failed;

  return (
    <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-brand-grayLight/40">
      {useFallback ? (
        // 부스터팩 이미지가 없으면 포켓몬 TCG 로고를 가운데 정렬
        <div className="grid h-full w-full place-items-center p-3">
          <img
            src={POKEMON_LOGO}
            alt="Pokémon TCG"
            className="h-auto w-full max-w-[120px] object-contain"
          />
        </div>
      ) : (
        <img
          src={set.coverImageUrl}
          alt={set.name}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
