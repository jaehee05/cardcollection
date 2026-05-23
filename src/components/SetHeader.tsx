import { useState } from "react";
import type { CardSet } from "../types";

interface Props {
  set: CardSet;
  ownedUniqueCount: number; // 본세트에서 1장 이상 가진 카드 개수
}

export function SetHeader({ set, ownedUniqueCount }: Props) {
  const pct =
    set.totalCards === 0 ? 0 : Math.round((ownedUniqueCount / set.totalCards) * 100);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-card">
      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[auto_1fr_auto_auto]">
        <Cover set={set} />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {set.code && (
              <span className="rounded-md bg-brand-mint/15 px-2 py-0.5 text-[11px] font-extrabold uppercase text-brand-mintDark">
                {set.code}
              </span>
            )}
            <h2 className="truncate text-[17px] font-extrabold text-[#2A2538]">
              {set.series && (
                <span className="mr-2 text-[14px] font-bold text-brand-gray">
                  {set.series}
                </span>
              )}
              {set.name}
            </h2>
          </div>
          <p className="mt-1 text-[13px] text-brand-gray">
            발매일: <span className="text-[#4A4658]">{set.releaseDate}</span>
          </p>
        </div>

        <div className="text-center">
          <div className="text-[20px] font-extrabold text-[#2A2538]">
            {set.totalCards}개{" "}
            {set.secretCards > 0 && (
              <span className="text-[13px] font-bold text-brand-mintDark">
                +{set.secretCards} 시크릿
              </span>
            )}
          </div>
          <div className="mt-0.5 text-[13px] text-brand-gray">
            {ownedUniqueCount} / {set.totalCards}
          </div>
        </div>

        <div className="grid h-12 w-20 place-items-center rounded-full bg-brand-grayLight text-[15px] font-extrabold text-[#4A4658]">
          {pct}%
        </div>
      </div>
    </div>
  );
}

function Cover({ set }: { set: CardSet }) {
  const [failed, setFailed] = useState(false);
  const showImg = !!set.coverImageUrl && !failed;
  return (
    <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-purple-400 to-brand-mint text-base font-black uppercase text-white">
      {showImg ? (
        <img
          src={set.coverImageUrl}
          alt={set.name}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{set.code || "?"}</span>
      )}
    </div>
  );
}
