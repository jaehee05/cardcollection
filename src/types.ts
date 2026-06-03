// 레귤레이션 마크 — 카드 좌하단 알파벳 한 글자.
// 한국 기준 현 스탠다드는 G·H·I (2026). D·E·F는 익스팬션 전용.
export type RegulationMark = "D" | "E" | "F" | "G" | "H" | "I" | "J";

export const REGULATION_MARKS: RegulationMark[] = [
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
];

// 현재 스탠다드 합법 마크 (덱 합법성 표시용)
export const STANDARD_LEGAL_MARKS: RegulationMark[] = ["G", "H", "I"];

export type Rarity =
  | "C"
  | "U"
  | "R"
  | "RR"
  | "AR"
  | "SR"
  | "SAR"
  | "UR"
  | "MUR";

export const RARITIES: Rarity[] = [
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

// 마스터 DB 정렬용 alias — RARITIES와 동일
export const RARITY_ORDER: Rarity[] = RARITIES;

// 마스터 DB (Firestore `sets` 컬렉션) 관련 타입
export type Region = "kr" | "us" | "jp";

export interface PokemonCard {
  id: string;
  setId: string;
  number: number; // 1-based, totalCards 이하면 인쇄번호 / 초과면 시크릿
  name: string;
  rarity: Rarity;
  illustrator?: string;
  marketPrice: number; // KRW
  imageUrl?: string;
}

export interface CardSet {
  id: string;
  region: Region;
  code: string; // 예: SV10, sv7a — 시리즈마크로 사용
  name: string;
  series: string;
  releaseDate: string; // ISO
  totalCards: number; // 인쇄(non-secret) 카드 수
  secretCards: number;
  // 카드별 레귤레이션 마크는 카드에 두지 않고, 세트 단위로 둠 (한 세트는 한 레귤)
  regulationMark?: RegulationMark;
  coverImageUrl?: string;
  cards: PokemonCard[];
}

export type CardType =
  | "풀"
  | "불꽃"
  | "물"
  | "번개"
  | "초"
  | "격투"
  | "악"
  | "강철"
  | "드래곤"
  | "무색"
  | "트레이너"
  | "에너지";

export const CARD_TYPES: CardType[] = [
  "풀",
  "불꽃",
  "물",
  "번개",
  "초",
  "격투",
  "악",
  "강철",
  "드래곤",
  "무색",
  "트레이너",
  "에너지",
];

export type EvolutionStage =
  | "기본"
  | "1진화"
  | "2진화"
  | "트레이너"
  | "에너지";

export const EVOLUTION_STAGES: EvolutionStage[] = [
  "기본",
  "1진화",
  "2진화",
  "트레이너",
  "에너지",
];

// 개인 보유 카드 (인벤토리 한 항목)
export interface Card {
  id: string;
  name: string;
  seriesMark: string; // 자유 입력 — 예: "SV10", "sv7a", "SM1"
  regulationMark: RegulationMark;
  number?: string; // "001/108" 또는 "001" — 자유 형식
  rarity?: Rarity;
  type?: CardType;
  hp?: number;
  evolutionStage?: EvolutionStage;
  imageUrl?: string;
  count: number; // 보유 수량
  note?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  // 마스터 DB(sets)에서 가져온 카드일 때 set ID 와 번호.
  // 같은 카드를 중복 추가하지 않기 위한 키.
  sourceSetId?: string;
  sourceNumber?: number;
}

// 덱 내 카드 한 줄
export interface DeckCard {
  cardId: string;
  count: number; // 덱 내 매수
}

// 저장된 덱
export interface Deck {
  id: string;
  name: string;
  cards: DeckCard[];
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// JSON 백업 포맷
export interface BackupV1 {
  schema: "cardcollection.v1";
  exportedAt: string;
  cards: Card[];
  decks: Deck[];
}
