interface Props {
  name: string;
  number?: string;
  className?: string;
}

export function CardPlaceholder({ name, number, className }: Props) {
  return (
    <svg
      viewBox="0 0 240 336"
      className={className}
      role="img"
      aria-label={`${name} 이미지 없음`}
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
        {number ? `${number} · ` : ""}{truncate(name, 14)}
      </text>
    </svg>
  );
}

function truncate(s: string, max: number): string {
  if (!s) return "";
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}
