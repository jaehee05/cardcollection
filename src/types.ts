export type Region = "kr" | "us" | "jp";

export type Rarity =
  | "C" // 커먼
  | "U" // 언커먼
  | "R" // 레어
  | "RR" // 더블레어
  | "AR" // 아트레어
  | "SR" // 슈퍼레어
  | "SAR" // 스페셜 아트레어
  | "UR"; // 울트라레어

export const RARITY_LABEL: Record<Rarity, string> = {
  C: "커먼",
  U: "언커먼",
  R: "레어",
  RR: "더블레어",
  AR: "아트레어",
  SR: "슈퍼레어",
  SAR: "스페셜 아트",
  UR: "울트라레어",
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
];

export type PokemonType =
  | "grass"
  | "fire"
  | "water"
  | "lightning"
  | "psychic"
  | "fighting"
  | "darkness"
  | "metal"
  | "dragon"
  | "colorless"
  | "trainer"
  | "energy";

export const TYPE_LABEL: Record<PokemonType, string> = {
  grass: "풀",
  fire: "불꽃",
  water: "물",
  lightning: "번개",
  psychic: "초",
  fighting: "격투",
  darkness: "악",
  metal: "강철",
  dragon: "드래곤",
  colorless: "무색",
  trainer: "트레이너",
  energy: "에너지",
};

export const TYPE_COLOR: Record<PokemonType, string> = {
  grass: "#7BC74D",
  fire: "#F08030",
  water: "#3FA9F5",
  lightning: "#F8D030",
  psychic: "#C56AC2",
  fighting: "#C9362C",
  darkness: "#4C4A4A",
  metal: "#9CA0AC",
  dragon: "#7D5DDB",
  colorless: "#C9C8BE",
  trainer: "#E0B07A",
  energy: "#E55D87",
};

export type CardStage = "기본" | "1진화" | "2진화" | "트레이너" | "에너지";

export interface PokemonCard {
  id: string;
  setId: string;
  number: number; // 1-based number within set
  name: string;
  rarity: Rarity;
  type: PokemonType;
  hp?: number;
  stage: CardStage;
  illustrator?: string;
  // KRW market price (sample data)
  marketPrice: number;
  // optional override image URL — when missing, we render a placeholder SVG
  imageUrl?: string;
}

export interface CardSet {
  id: string;
  region: Region;
  code: string; // e.g. sv7a
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
