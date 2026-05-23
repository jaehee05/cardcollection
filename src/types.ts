export type Region = "kr" | "us" | "jp";

export type Rarity =
  | "C" // 커먼
  | "U" // 언커먼
  | "R" // 레어
  | "RR" // 더블레어
  | "AR" // 아트레어
  | "SR" // 슈퍼레어
  | "SAR" // 스페셜 아트레어
  | "UR" // 울트라레어
  | "MUR"; // 메가 울트라레어

export const RARITY_LABEL: Record<Rarity, string> = {
  C: "커먼",
  U: "언커먼",
  R: "레어",
  RR: "더블레어",
  AR: "아트레어",
  SR: "슈퍼레어",
  SAR: "스페셜 아트",
  UR: "울트라레어",
  MUR: "메가 울트라레어",
};

export const RARITY_ORDER: Rarity[] = [
  "C",
  "U",
  "R",
  "RR",
  "AR",
  "SR",
  "SAR",
  "UR",
  "MUR",
];

export const RARITY_COLOR: Record<Rarity, string> = {
  C: "#A9A5B5",
  U: "#7BC74D",
  R: "#3FA9F5",
  RR: "#5B7CFA",
  AR: "#C56AC2",
  SR: "#F8C530",
  SAR: "#F08030",
  UR: "#E55D87",
  MUR: "#C9362C",
};

export interface PokemonCard {
  id: string;
  setId: string;
  number: number; // 1-based number within set
  name: string;
  rarity: Rarity;
  illustrator?: string;
  // KRW market price (admin-entered)
  marketPrice: number;
  // optional override image URL — when missing, we render a placeholder SVG
  imageUrl?: string;
}

export interface CardSet {
  id: string;
  region: Region;
  code: string; // e.g. SV10, sv7a
  name: string;
  series: string;
  releaseDate: string; // ISO
  totalCards: number; // not counting secret
  secretCards: number;
  coverImageUrl?: string;
  cards: PokemonCard[];
}

export interface CardOwnership {
  count: number;
  note?: string;
}
// keyed by card.id
export type OwnershipMap = Record<string, CardOwnership>;
