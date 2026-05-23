import { useMemo } from "react";
import { useOwnership, ownedCount } from "../hooks/useOwnership";
import type { CardSet, Rarity } from "../types";
import { RARITY_LABEL, RARITY_ORDER } from "../types";

interface Props {
  sets: CardSet[];
}

export function SummaryView({ sets }: Props) {
  const ownership = useOwnership();

  const stats = useMemo(() => {
    let totalCards = 0;
    let ownedUnique = 0;
    let ownedTotal = 0;
    let value = 0;
    const perRarity = new Map<Rarity, { total: number; owned: number; value: number }>();
    const perSet = sets.map((set) => {
      let setUnique = 0;
      let setValue = 0;
      let setTotalQty = 0;
      for (const card of set.cards) {
        totalCards += 1;
        const cnt = ownedCount(ownership.map, card.id);
        const tier = perRarity.get(card.rarity) ?? { total: 0, owned: 0, value: 0 };
        tier.total += 1;
        if (cnt > 0) {
          ownedUnique += 1;
          ownedTotal += cnt;
          value += cnt * card.marketPrice;
          setValue += cnt * card.marketPrice;
          setTotalQty += cnt;
          setUnique += 1;
          tier.owned += 1;
          tier.value += cnt * card.marketPrice;
        }
        perRarity.set(card.rarity, tier);
      }
      return {
        set,
        uniqueOwned: setUnique,
        totalCards: set.cards.length,
        totalQty: setTotalQty,
        value: setValue,
      };
    });
    return {
      totalCards,
      ownedUnique,
      ownedTotal,
      value,
      perRarity,
      perSet,
    };
  }, [sets, ownership.map]);

  return (
    <div className="space-y-4">
      {/* hero stat */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="총 보유 가치"
          value={`${stats.value.toLocaleString()}원`}
          accent
        />
        <StatCard
          title="고유 카드"
          value={`${stats.ownedUnique} / ${stats.totalCards}`}
          sub={`${stats.totalCards === 0 ? 0 : Math.round((stats.ownedUnique / stats.totalCards) * 100)}% 완성`}
        />
        <StatCard
          title="총 보유 매수"
          value={`${stats.ownedTotal}장`}
          sub="중복 포함"
        />
      </div>

      {/* per-rarity */}
      <div className="rounded-3xl bg-white p-5 shadow-card">
        <h3 className="text-[15px] font-extrabold text-[#2A2538]">희귀도별 현황</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {RARITY_ORDER.map((r) => {
            const tier = stats.perRarity.get(r);
            if (!tier || tier.total === 0) return null;
            const pct = Math.round((tier.owned / tier.total) * 100);
            return (
              <div
                key={r}
                className="rounded-2xl bg-brand-grayLight/40 p-3"
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-[13px] font-bold text-[#4A4658]">
                    {r} · {RARITY_LABEL[r]}
                  </span>
                  <span className="text-[12px] text-brand-gray">{pct}%</span>
                </div>
                <div className="mt-2 text-[14px] font-extrabold">
                  {tier.owned} / {tier.total}
                </div>
                <div className="mt-1 text-[12px] text-brand-mintDark">
                  {tier.value.toLocaleString()}원
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* per-set */}
      <div className="rounded-3xl bg-white p-5 shadow-card">
        <h3 className="text-[15px] font-extrabold text-[#2A2538]">세트별 현황</h3>
        <div className="mt-3 divide-y divide-brand-grayLight/60">
          {stats.perSet.map((row) => {
            const pct =
              row.totalCards === 0
                ? 0
                : Math.round((row.uniqueOwned / row.totalCards) * 100);
            return (
              <div
                key={row.set.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-bold">{row.set.name}</p>
                  <p className="text-[12px] text-brand-gray">
                    {row.set.series} · {row.set.releaseDate}
                  </p>
                </div>
                <div className="text-right text-[13px]">
                  <div className="font-extrabold">
                    {row.uniqueOwned} / {row.totalCards} ({pct}%)
                  </div>
                  <div className="text-brand-mintDark">
                    {row.value.toLocaleString()}원
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  sub,
  accent,
}: {
  title: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl p-5 shadow-card ${
        accent
          ? "bg-gradient-to-br from-brand-mint to-brand-purple text-white"
          : "bg-white"
      }`}
    >
      <p
        className={`text-[12px] font-bold ${
          accent ? "text-white/80" : "text-brand-gray"
        }`}
      >
        {title}
      </p>
      <p
        className={`mt-2 text-[26px] font-black ${
          accent ? "text-white" : "text-[#2A2538]"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p
          className={`mt-1 text-[12px] ${
            accent ? "text-white/80" : "text-brand-gray"
          }`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
