import type { PokemonCard } from "../types";
import { TYPE_COLOR, TYPE_LABEL } from "../types";

interface Props {
  card: PokemonCard;
  className?: string;
}

// 외부 이미지를 못 받아오는 경우에도 카드 형태가 유지되도록 하는 SVG 플레이스홀더
export function CardPlaceholder({ card, className }: Props) {
  const baseColor = TYPE_COLOR[card.type];
  const typeLabel = TYPE_LABEL[card.type];

  // 결정적 시드 → 카드별 미세하게 다른 그라데이션
  const seed = Array.from(card.id).reduce(
    (acc, ch) => (acc * 31 + ch.charCodeAt(0)) & 0xffff,
    7,
  );
  const angle = seed % 360;
  const tint = `rgba(255,255,255,${0.18 + ((seed % 100) / 100) * 0.15})`;

  return (
    <svg
      viewBox="0 0 240 336"
      className={className}
      role="img"
      aria-label={`${card.name} 카드`}
    >
      <defs>
        <linearGradient id={`bg-${card.id}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={baseColor} />
          <stop offset="1" stopColor={shade(baseColor, -25)} />
        </linearGradient>
        <linearGradient id={`art-${card.id}`} x1="0" x2="1" y1="0" y2="1"
          gradientTransform={`rotate(${angle} 0.5 0.5)`}>
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="1" stopColor={tint} />
        </linearGradient>
      </defs>

      <rect width="240" height="336" rx="14" fill={`url(#bg-${card.id})`} />
      <rect
        x="10"
        y="10"
        width="220"
        height="316"
        rx="10"
        fill="#FFFFFF"
        opacity="0.92"
      />

      {/* top bar: stage + name + hp */}
      <text x="22" y="34" fontSize="11" fontWeight="700" fill="#4A4658">
        {card.stage}
      </text>
      <text x="22" y="56" fontSize="16" fontWeight="800" fill="#2A2538">
        {truncate(card.name, 14)}
      </text>
      {card.hp != null && (
        <text x="218" y="56" fontSize="13" fontWeight="800" fill="#C9362C" textAnchor="end">
          HP{card.hp}
        </text>
      )}

      {/* art area */}
      <rect
        x="22"
        y="72"
        width="196"
        height="160"
        rx="6"
        fill={`url(#art-${card.id})`}
      />
      <circle
        cx="120"
        cy="152"
        r="44"
        fill={baseColor}
        opacity="0.85"
      />
      <text
        x="120"
        y="160"
        fontSize="38"
        fontWeight="900"
        fill="#FFFFFF"
        textAnchor="middle"
        opacity="0.92"
      >
        {monogram(card.name)}
      </text>

      {/* attack-ish block */}
      <line x1="22" y1="246" x2="218" y2="246" stroke="#E0DCEA" strokeWidth="1" />
      <text x="22" y="266" fontSize="11" fontWeight="700" fill="#6B6478">
        {typeLabel} · {card.rarity}
      </text>
      <text x="218" y="266" fontSize="11" fontWeight="700" fill="#6B6478" textAnchor="end">
        {String(card.number).padStart(3, "0")}
      </text>

      {/* bottom watermark */}
      <text
        x="120"
        y="312"
        fontSize="10"
        fontWeight="600"
        fill="#A9A5B5"
        textAnchor="middle"
        opacity="0.7"
      >
        Pokémon Card Game
      </text>
    </svg>
  );
}

function shade(hex: string, percent: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + Math.round(2.55 * percent)));
  const g = Math.max(
    0,
    Math.min(255, ((num >> 8) & 0xff) + Math.round(2.55 * percent)),
  );
  const b = Math.max(0, Math.min(255, (num & 0xff) + Math.round(2.55 * percent)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function monogram(name: string): string {
  const first = Array.from(name).find((c) => /\S/.test(c)) ?? "?";
  return first;
}
