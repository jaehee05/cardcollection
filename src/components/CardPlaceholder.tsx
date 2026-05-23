import type { PokemonCard } from "../types";

interface Props {
  card: PokemonCard;
  className?: string;
}

// 실제 카드 이미지가 없을 때 표시하는 "NO IMAGE" 플레이스홀더.
// 실제 카드 이미지(보통 5:7 비율)와 동일한 viewBox를 사용해 동일 사이즈로 렌더된다.
export function CardPlaceholder({ card, className }: Props) {
  return (
    <svg
      viewBox="0 0 240 336"
      className={className}
      role="img"
      aria-label={`${card.name} 이미지 없음`}
    >
      <rect width="240" height="336" rx="14" fill="#E9E7F0" />
      <rect
        x="10"
        y="10"
        width="220"
        height="316"
        rx="10"
        fill="#F5F3FA"
        stroke="#D7D3E2"
        strokeDasharray="6 6"
      />
      <text
        x="120"
        y="168"
        fontSize="22"
        fontWeight="900"
        fill="#A9A5B5"
        textAnchor="middle"
        letterSpacing="2"
      >
        NO IMAGE
      </text>
      <text
        x="120"
        y="200"
        fontSize="11"
        fontWeight="700"
        fill="#C0BCCC"
        textAnchor="middle"
      >
        {String(card.number).padStart(3, "0")} · {truncate(card.name, 14)}
      </text>
    </svg>
  );
}

function truncate(s: string, max: number): string {
  if (!s) return "";
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}
